
import Actor3e from '../actor/entity';
import { evaluateExpression } from '../expressions';
import { getMeasurement } from '../measurements';
import { displayCard } from '../chat';

interface ResistInfo {
    dc: number;
    rollDetail: RollDetails;
};

interface PowerEffectCardInfo {
    activationRoll?: Roll
    attackRoll?: Roll;
    resistInfo?: ResistInfo;
    effect: Item.Data<PowerEffectData>;
    canRoll: boolean;
    tags: string[];
};

export default class Item3e<T = any> extends Item<T> {
    // TODO: Possibly remove
    public get hasAreaTarget() {
        const data = this.data.data as any;
        return data.activation && data.activation.type.value && data.range.area.value;
    }

    /**
     * @override
     */
    public prepareData(): void {
        super.prepareData();
        this.prepareMNM3EData();
    }

    /**
     * @override
     */
    public prepareEmbeddedEntities(): void {
        if (['power', 'equipment'].includes(this.type)) {
            const data = (this.data as unknown) as Item.Data<PowerData | EquipmentData> & { effects: ActiveEffect[]};
            data.effects = [];
            data.data.effects.forEach(effect => {
                data.effects = data.effects.concat((effect as any).effects);
            });
        }
        super.prepareEmbeddedEntities();
    }

    public prepareMNM3EData(): void {
        this.fixArrays(this.data);
        switch(this.type) {
            case 'modifier':
                this.prepareModifierData((this.data as unknown) as Item.Data<ModifierData>);
                break;
            case 'effect':
                this.preparePowerEffectData((this.data as unknown) as Item.Data<PowerEffectData>);
                break;
            case 'equipment':
                this.prepareEquipmentData((this.data as unknown) as Item.Data<EquipmentData>);
                break;
            case 'power':
                this.preparePowerData((this.data as unknown) as Item.Data<PowerData>);
                break;
        }
    }

    public async roll({ rollMode, powerArrayIndex }: { rollMode?: string, powerArrayIndex?: number} = {}): Promise<ChatMessage | object | void> {
        let rollData: any = {};
        if (this.isOwned) {
            rollData = this.actor?.data.data;
        }

        let cardItem: any = this.data;
        let effects: PowerEffectCardInfo[] = [];
        if (['power', 'equipment'].includes(this.data.type)) {
            const config = CONFIG.MNM3E;
            const powerData = (this.data.data as unknown) as PowerData;

            let needsUpdate = false;
            let targetPower = powerData;
            if (powerArrayIndex !== undefined) {
                cardItem = powerData.powerArray[powerArrayIndex];
                targetPower = cardItem.data;
            }
            effects = (await Promise.all(targetPower.effects.map(async effect => {
                this.preparePowerEffectData(effect);
                const result: PowerEffectCardInfo = {
                    canRoll: true,
                    effect,
                    tags: [
                        config.activationTypes[effect.data.activation.type.value],
                        config.actionTypes[effect.data.action.type.value],
                        config.durationTypes[effect.data.activation.duration.type.value],
                    ],
                };

                if (effect.data.activation.uses.max.value > 0) {
                    if (typeof effect.data.activation.uses.remaining !== 'number') {
                        effect.data.activation.uses.remaining = effect.data.activation.uses.max.value;
                    }

                    needsUpdate = true;
                    const remaining = Math.max(--effect.data.activation.uses.remaining, 0);
                    result.tags.push(game.i18n.format('MNM3E.UsesRemainingFormat', { remaining }));
                    if (remaining <= 0) {
                        effect.data.activation.uses.remaining = remaining;
                        result.canRoll = false;
                        return result;
                    }
                }

                const prepareFormula = (detail: RollDetails): string => {
                    const parts = duplicate(detail.formula.value);
                    for (let i = 0; i < detail.formula.numOverrides!; i++) {
                        let dataSource = parts[i].dataPath;
                        if (dataSource == 'formula') {
                            dataSource = parts[i].value;
                        } else {
                            dataSource = `@${dataSource}`
                        }
                        parts[i].value = (Roll as any).replaceFormulaData(dataSource, {
                            ...rollData,
                            rank: detail.formula.overrideRanks![i],
                        });
                    }

                    return parts.map(pair => `${pair.op} ${pair.value || '@' + pair.dataPath}`).join(' ');
                };

                const getRoll = async (detail: RollDetails): Promise<Roll> => {
                    const formula = prepareFormula(detail);
                    const roll = new Roll(`1d20 ${formula}`, {...rollData, rank: effect.data.rank});
                    (roll as any).template = await roll.render();
                    return roll;
                };

                if (effect.data.activation.check.rollType.value == 'required') {
                    result.activationRoll = await getRoll(effect.data.activation.check);
                }

                if (effect.data.action.roll.attack.rollType.value == 'required') {
                    result.attackRoll = await getRoll(effect.data.action.roll.attack)
                }

                let rangeTag = CONFIG.MNM3E.rangeTypes[effect.data.activation.range.type.value];
                if (effect.data.activation.range.type.value == 'ranged') {
                    let rank = 0;
                    switch (effect.data.activation.range.multiplier.value) {
                        case 'positive':
                            rank = effect.data.activation.range.multiplier.overrideRank!;
                            break;
                        case 'negative':
                            rank = -effect.data.activation.range.multiplier.overrideRank!;
                            break;
                        default:
                            break;
                    }
                    const ranges = [
                        getMeasurement('attack-distance', rank++),
                        getMeasurement('attack-distance', rank++),
                        getMeasurement('attack-distance', rank),
                    ];
                    rangeTag += ` ${ranges.map(r => r.value).join('/')} ${ranges[0].units}`;
                }
                result.tags.push(rangeTag);

                if (effect.data.activation.range.area.value) {
                    result.tags.push(config.areaTypes[effect.data.activation.range.area.value]);
                }

                if (effect.data.action.roll.resist.rollType.value == 'required') {
                    let formula = prepareFormula(effect.data.action.roll.resist);
                    formula = (Roll as any).replaceFormulaData(formula, {...rollData, rank: effect.data.rank});
                    result.resistInfo = {
                        dc: (Math as any).safeEval(formula),
                        rollDetail: effect.data.action.roll.resist,
                    };
                }

                return result;
            }))).filter(d => d) as PowerEffectCardInfo[];

            if (needsUpdate) {
                this.update({ data: {powerArray: powerData.powerArray, effects: powerData.effects}});
            }
        }

        const token = this.actor?.token;
        const templateData = {
            actor: this.actor,
            config: CONFIG.MNM3E,
            sceneTokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: cardItem,
            data: cardItem.data,
            effects: effects,
        };

        return displayCard('effects', ChatMessage.getSpeaker({
            actor: this.actor!,
            token,
        }), templateData, { 
            rollMode, 
            flags: { 'mnm3e.effectInfo': effects },
        });
    }

    private prepareModifierData(data: Item.Data<ModifierData>): void {
        if (data.data.summary.format == '') {
            data.data.summary.format = data.name;
        }

        data.data.summary.parsed = data.data.summary.format.replace('$cost', data.data.cost.value.toString());
    }

    private preparePowerEffectData(data: Item.Data<PowerEffectData>): void {
        const overrideValues = [
            'data.activation.check.rollType',
            'data.activation.check.targetScore.type',
            'data.activation.check.targetScore.custom',
            'data.activation.consume.type',
            'data.activation.consume.target',
            'data.activation.consume.amount',
            'data.activation.duration.type',
            'data.activation.range.area',
            'data.activation.range.type',
            'data.activation.range.multiplier',
            'data.activation.uses.amount',
            'data.activation.uses.max',
            'data.activation.uses.per',
            'data.activation.type',
            'data.action.roll.attack.rollType',
            'data.action.roll.attack.targetScore.type',
            'data.action.roll.attack.targetScore.custom',
            'data.action.roll.resist.rollType',
            'data.action.roll.resist.targetScore.type',
            'data.action.roll.resist.targetScore.custom',
            'data.action.type',
        ];
        overrideValues.forEach(key => {
            if (getProperty(data, `${key}.override`)) {
                setProperty(data, key, {
                    override: false,
                    value: getProperty(data, `${key}.originalValue`),
                    originalValue: undefined,
                    overrideRank: undefined,
                });
            }
        });

        const overrideArrayValues = [
            'data.activation.check.formula',
            'data.action.roll.attack.formula',
            'data.action.roll.resist.formula',
        ];
        overrideArrayValues.forEach(key => {
            if (getProperty(data, `${key}.override`)) {
                const offset = getProperty(data, `${key}.numOverrides`) || 0;
                setProperty(data, key, {
                    override: false,
                    value: getProperty(data, `${key}.value`).slice(offset),
                    numOverrides: undefined,
                    overrideRanks: undefined,
                });
            }
        });

        if (data.data.summary.format == '') {
            data.data.summary.format = `$prefix ${data.name} $rank $suffix`;
        }

        const prefix: string[] = [];
        const suffix: string[] = [];

        data.data.modifiers.forEach(modifier => {
            overrideValues.forEach(key => {
                const value = getProperty(modifier, `${key}.value`);
                if (value) {
                    setProperty(data, key, {
                        override: true,
                        value,
                        originalValue: getProperty(data, `${key}.originalValue`) || getProperty(data, `${key}.value`),
                        overrideRank: modifier.data.rank,
                    });
                }
            });

            overrideArrayValues.forEach(key => {
                const value = getProperty(modifier, `${key}.value`)
                if (value && value.length > 0) {
                    const currentValue = getProperty(data, `${key}.value`)
                    const offset = getProperty(data, `${key}.numOverrides`) || 0;
                    const overrideRanks = (getProperty(data, `${key}.overrideRanks`) || []);
                    overrideRanks.push(modifier.data.rank);
                    setProperty(data, key, {
                        override: true,
                        numOverrides: offset + 1,
                        overrideRanks,
                        value: duplicate(value).concat(currentValue),
                    });
                }
            });

            let targetList = prefix;
            if (modifier.data.summary.position == 'suffix') {
                targetList = suffix;
            }

            if (modifier.data.summary.parsed) {
                targetList.push(modifier.data.summary.parsed);
            }
        });

        if (data.data.activation.uses.max.value > 0 && typeof data.data.activation.uses.remaining !== 'number') {
            data.data.activation.uses.remaining = data.data.activation.uses.max.value;
        }

        data.data.summary.parsed = data.data.summary.format.
            replace('$rank', data.data.rank.toString()).
            replace('$prefix', prefix.join(' ')).
            replace('$suffix', suffix.join(' ')).
            trim();

        [
            data.data.activation.check,
            data.data.action.roll.attack,
            data.data.action.roll.resist,
        ].forEach(rollDetail => {
            if (rollDetail.targetScore.type.value == 'custom') {
                rollDetail.targetScore.label = rollDetail.targetScore.custom.value;
            } else {
                const scoreParts = rollDetail.targetScore.type.value.split('.');
                const baseScore = `${scoreParts[0]}.${scoreParts[1]}`;
                rollDetail.targetScore.label = getProperty(CONFIG.MNM3E, baseScore);
            }
        });
    }

    private preparePowerData(data: Item.Data<PowerData>): void {
        let totalPowerCost = 0;
        const deferredCosts: { modifier: number; discountPer: number; }[] = [];

        data.data.effects.forEach(effect => {
            let perRankCost = 0;
            let flatCost = 0;

            const evaluateCostType = (costType: RankCostType, rank: number, cost: number, discountPer: number) => {
                switch (costType) {
                    case 'flat':
                        flatCost += cost * rank;
                        break;
                    case 'perRank':
                        perRankCost += cost;
                        break;
                    case 'discount':
                        deferredCosts.push({ modifier: cost, discountPer: !discountPer || discountPer < 1 ? 1 : discountPer });
                        break;
                }
            };

            evaluateCostType(effect.data.cost.type, effect.data.rank, effect.data.cost.value, effect.data.cost.discountPer);
            effect.data.modifiers.forEach(modifier => evaluateCostType(
                modifier.data.cost.type,
                modifier.data.rank,
                modifier.data.cost.value,
                modifier.data.cost.discountPer
            ));

            if (perRankCost < 1) {
                perRankCost = 1 / (Math.abs(perRankCost) + 2);
            }
            let totalRankCost = perRankCost * effect.data.rank;
            if (totalRankCost + flatCost >= 1) {
                totalRankCost += flatCost;
            } else {
                totalRankCost = Math.min(totalRankCost, 1);
            }
            totalPowerCost = totalPowerCost + totalRankCost;
        });

        deferredCosts.forEach(dc => {
            const quotient = totalPowerCost / dc.discountPer;
            totalPowerCost += quotient * dc.modifier;
        });

        data.data.totalCost = totalPowerCost + data.data.powerArray.length;
    }

    private prepareEquipmentData(data: Item.Data<EquipmentData>): void {

    }

    private fixArrays(data: Item.Data): void {
        [
            'data.expressions',
            'data.activation.check.formula.value',
            'data.action.roll.attack.formula.value',
            'data.action.roll.resist.formula.value',
            'data.effects',
            'data.modifiers',
        ].forEach(dataPath => {
            const value = getProperty(data, dataPath);
            if (value && !Array.isArray(value)) {
                setProperty(data, dataPath, Object.values(value).map(v => v));
            }
        });
    }

    public static activateChatListeners(html: JQuery<HTMLElement>): void {
        html.on('click', '.card-content button', this.onChatCardAction.bind(this));
    }

    private static async onChatCardAction(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        button.disabled = true;
        const card = button.closest('.chat-card');
        const messageId = card.closest('.message').dataset.messageId;
        const message = game.messages.get(messageId);
        
        const actor = this.getChatCardActor(card);
        if (!actor) {
            return;
        }

        const effectInfo: PowerEffectCardInfo = message.getFlag('mnm3e', 'effectInfo')[button.dataset.effectIndex];
        switch (button.dataset.action) {
            case 'resist':
                if (!effectInfo.resistInfo) {
                    return;
                }
                this.getCurrentTargets().forEach(t => (t.actor as Actor3e).rollResist(effectInfo.resistInfo!.dc, effectInfo.resistInfo!.rollDetail.targetScore));
                break;
            default:
                throw new Error(`unknown action: ${button.dataset.action}`);
        }

        button.disabled = false;
    }

    private static getChatCardActor(card: HTMLElement): Actor3e | null {
        const sceneTokenKey = card.dataset.sceneTokenId;
        if (sceneTokenKey) {
            const [sceneId, tokenId] = sceneTokenKey.split('.');
            const scene = game.scenes.get(sceneId);
            if (!scene) {
                return null;
            }

            const tokenData = (scene as any).getEmbeddedEntity("Token", tokenId);
            if (!tokenData) {
                return null;
            }

            return new Token(tokenData).actor as Actor3e;
        }

        return game.actors.get(card.dataset.actorId!) as Actor3e || null;
    }

    private static getCurrentTargets(): Token[] {
        let targets = canvas.tokens.controlled.filter((t: Token) => !!t.actor);
        if (targets.length == 0 && game.user.character) {
            targets = game.user.character.getActiveTokens();
        }
        if (targets.length == 0){
            ui.notifications.warn(game.i18n.localize('MNM3E.ActionWarningNoToken'));
        }

        return targets;
    }
}