import { evaluateExpression } from '../expressions';
import { getMeasurement } from '../measurements';

interface PowerEffectCardInfo {
    activationRoll?: Roll
    attackRoll?: Roll;
    resistInfo?: {
        dc: number;
        versusLabel: string;
    };
    effect: Item.Data<PowerEffectData>;
    tags: string[];
}

export default class Item3e<T = any> extends Item<T> {
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

    public prepareMNM3EData(): void {
        this.fixArrays(this.data);
        switch(this.type) {
            case 'modifier':
                this.prepareModifierData((this.data as unknown) as Item.Data<ModifierData>);
                break;
            case 'effect':
                this.preparePowerEffectData((this.data as unknown) as Item.Data<PowerEffectData>);
                break;
            case 'power':
                this.preparePowerData((this.data as unknown) as Item.Data<PowerData>);
                break;
        }
    }

    public async roll({ rollMode }: { rollMode?: string} = {}): Promise<ChatMessage | object | void> {
        if (this.hasAreaTarget) {
            const powerTemplate = game.mnm3e.canvas.PowerEffectTemplate.fromItem(this);
            powerTemplate?.drawPreview();
        }

        let rollData: any = {};
        if (this.isOwned) {
            rollData = this.actor?.data.data;
        }

        let effects: PowerEffectCardInfo[] = [];
        if (this.data.type == 'power') {
            const config = CONFIG.MNM3E;
            const powerData = (this.data.data as unknown) as PowerData;
            effects = (await Promise.all(powerData.effects.map(async effect => {
                this.preparePowerEffectData(effect);
                const result: PowerEffectCardInfo = {
                    effect,
                    tags: [
                        config.activationTypes[effect.data.activation.type.value],
                        config.actionTypes[effect.data.action.type.value],
                        config.durationTypes[effect.data.activation.duration.type.value],
                    ],
                };

                const prepareFormula = (detail: RollDetails): string => {
                    const parts = duplicate(detail.formula.value);
                    for (let i = 0; i < detail.formula.numOverrides!; i++) {
                        parts[i].value = parts[i].value.replace('@rank', detail.formula.overrideRanks![i].toString());
                    }

                    return parts.map(pair => `${pair.op} ${pair.value}`).join(' ');
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
                        versusLabel: effect.data.action.roll.resist.targetScore.label,
                    };
                }

                return result;
            }))).filter(d => d) as PowerEffectCardInfo[];
        }

        return this.displayCard({effects, rollMode});
    }

    public async displayCard({ effects, rollMode }: { effects?: PowerEffectCardInfo[], rollMode?: string } = {}): Promise<ChatMessage | object | void> {
        const token = this.actor?.token;
        const templateData = {
            actor: this.actor,
            config: CONFIG.MNM3E,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: this.data,
            data: this.data.data,
            effects: effects,
        };

        const html = await renderTemplate('systems/mnm3e/templates/chat/item-card.html', templateData);
        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: html,
            flavor: (this.data.data as any).chatFlavor,
            speaker: ChatMessage.getSpeaker({actor: this.actor!, token}),
        };

        (ChatMessage as any).applyRollMode(chatData, rollMode || game.settings.get('core', 'rollMode'));

        return ChatMessage.create(chatData);
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
            data.data.summary.format = `$prefix ${data.name} $rank $postfix`;
        }

        const prefix: string[] = [];
        const postfix: string[] = [];

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
            if (modifier.data.summary.position == 'postfix') {
                targetList = postfix;
            }

            if (modifier.data.summary.parsed) {
                targetList.push(modifier.data.summary.parsed);
            }
        });

        data.data.summary.parsed = data.data.summary.format.
            replace('$rank', data.data.rank.toString()).
            replace('$prefix', prefix.join(' ')).
            replace('$postfix', postfix.join(' ')).
            trim();

        [
            data.data.activation.check,
            data.data.action.roll.attack,
            data.data.action.roll.resist,
        ].forEach(rollDetail => {
            if (rollDetail.targetScore.type.value == 'custom') {
                rollDetail.targetScore.label = rollDetail.targetScore.custom.value;
            } else {
                rollDetail.targetScore.label = getProperty(CONFIG.MNM3E, rollDetail.targetScore.type.value);
            }
        });
    }

    private preparePowerData(data: Item.Data<PowerData>): void {
        let totalPowerCost = 0;
        const deferredCosts: { modifier: number; discountPer: number; }[] = [];

        data.data.effects.forEach(effect => {
            let perRankCost = 0;
            let flatCost = 0;

            const evaluateCostType = (costType: RankCostType, cost: number, discountPer?: number) => {
                switch (costType) {
                    case 'flat':
                        flatCost += cost;
                        break;
                    case 'perRank':
                        perRankCost += cost;
                        break;
                    case 'discount':
                        deferredCosts.push({ modifier: cost, discountPer: !discountPer || discountPer < 1 ? 1 : discountPer });
                        break;
                }
            };

            evaluateCostType(effect.data.cost.type, effect.data.cost.value, effect.data.cost.discountPer);
            effect.data.modifiers.forEach(modifier => evaluateCostType(
                modifier.data.cost.type,
                modifier.data.cost.value,
                modifier.data.cost.discountPer
            ));

            totalPowerCost = totalPowerCost + (perRankCost * effect.data.rank) + flatCost;
        });

        deferredCosts.forEach(dc => {
            const quotient = totalPowerCost / dc.discountPer;
            totalPowerCost += quotient * dc.modifier;
        });

        data.data.totalCost = totalPowerCost;
        data.data.alternatePowers = data.data.alternatePowerIDs.map(id => game.items.get(id).data) as Item.Data<PowerData>[];
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
}