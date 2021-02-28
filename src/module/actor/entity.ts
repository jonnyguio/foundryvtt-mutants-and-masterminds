import { displayCard } from '../chat';
import { calculateDegrees } from '../dice';

export default class Actor3e<T extends CommonActorData = CommonActorData> extends Actor<T> {
    /**
     * @override
     */
    static async create(data: Actor.Data, options: Actor.Options): Promise<Entity> {
        data.token = data.token || {};
        if (data.type == 'character') {
            mergeObject(data.token, {
                vision: true,
                dimSight: 30,
                brightSight: 0,
                actorLink: true,
                disposition: 1,
            }, { overwrite: false });
        }
        return super.create(data, options);
    }
    
    /**
     * @override
     */
    public prepareBaseData(): void {
        const actorData = this.data;
        actorData.data.pointCosts = {
            abilities: {
                value: 0,
                label: game.i18n.localize('MNM3E.Abilities'),
            },
            skills: {
                value: 0,
                label: game.i18n.localize('MNM3E.Skills'),
            },
            defenses: {
                value: 0,
                label: game.i18n.localize('MNM3E.Defenses'),
            },
            advantages: {
                value: 0,
                label: game.i18n.localize('MNM3E.Advantages'),
            },
            powers: {
                value: 0,
                label: game.i18n.localize('MNM3E.Powers'),
            },
            total: {
                value: 0,
                label: game.i18n.localize('MNM3E.PowerPointTotal'),
            }
        };

        switch (actorData.type) {
            case 'character':
                this._prepareCharacterData(actorData);
                break;
            case 'npc':
                this._prepareNPCData(actorData);
                break;
        }
    }

    /**
     * @override
     */
    public prepareDerivedData(): void {
        const actorData = this.data;

        this._prepareAbilities(actorData);
        this._prepareDefenses(actorData);
        this._prepareSkills(actorData);

        this.items.forEach(item => {
            switch (item.type) {
                case 'power':
                    actorData.data.pointCosts.powers.value += (item.data.data as PowerData).totalCost || 0;
                    break;
                case 'advantage':
                    const advantageData = item.data.data as AdvantageData;
                    let pointCost = advantageData.cost.value;
                    if (advantageData.cost.type == 'perRank') {
                        pointCost *= advantageData.rank;
                    }
                    actorData.data.pointCosts.advantages.value += pointCost;
                    break;
            }
        });
        let pointTotal = 0;
        Object.values(actorData.data.pointCosts).forEach((c: LabeledNumber) => pointTotal += c.value);
        actorData.data.pointCosts.total.value = pointTotal;
        actorData.data.attributes.penaltyPoints = -Math.abs(actorData.data.attributes.penaltyPoints)

        if (actorData.type == 'character') {
            const characterData = (actorData.data as unknown) as CharacterData;
            characterData.maxPowerPoints = 15 * characterData.attributes.powerLevel + characterData.powerPoints;
        }
    }

    public async rollResist(dc: number, targetScore: TargetScore): Promise<ChatMessage | object | void> {
        let formula: string = '1d20';
        if (targetScore.type.value != 'custom') {
            formula += `+@${targetScore.type.value}`;
        }
        formula += ` - ${Math.abs(this.data.data.attributes.penaltyPoints)}`;

        const roll = new Roll(formula, this.data.data).roll();
        const degrees = calculateDegrees(dc, roll.total);

        const templateData = {
            actor: this.data,
            config: CONFIG.MNM3E,
            data: this.data.data,
            dc,
            degrees: {
                value: Math.abs(degrees.degrees),
                cssClass: degrees.cssClass,
                label: game.i18n.localize(degrees.degrees >= 0 ? 'MNM3E.DegreesOfSuccess' : 'MNM3E.DegreesOfFailure'),
            },
            cardLabel: `${game.i18n.localize('MNM3E.DC')}${dc} ${targetScore.label} ${game.i18n.localize('MNM3E.Check')}`,
            rollTemplate: await roll.render(),
        };

        return displayCard('check', ChatMessage.getSpeaker({ actor: this, token: this.token }), templateData);
    }

    public async rollAbility(abilityId: string): Promise<ChatMessage | object | void> {
        return this.rollScore(CONFIG.MNM3E.abilities[abilityId], this.data.data.abilities[abilityId].total!);
    }

    public async rollDefense(defenseId: string): Promise<ChatMessage | object | void> {
        return this.rollScore(CONFIG.MNM3E.defenses[defenseId], this.data.data.defenses[defenseId].total!);
    }

    public async rollSkill(skillId: string, subskillId: string): Promise<ChatMessage | object | void> {
        const skill = this.data.data.skills[skillId];
        let total = 0;
        let label = '';
        if (skill.type == 'static') {
            total = skill.data.total as number;
            label = CONFIG.MNM3E.skills[skillId];
        } else if (subskillId) {
            total = skill.data[subskillId].total as number;
            label = skill.data[subskillId].displayName;
        } else {
            total = skill.base;
            label = CONFIG.MNM3E.skills[skillId];
        }

        if (skill.trainedOnly && !skill.isTrained) {
            return displayCard('basic-roll', ChatMessage.getSpeaker({ actor: this, token: this.token }), {
                actor: this.data,
                config: CONFIG.MNM3E,
                data: this.data.data,
                cardLabel: label,
                content: game.i18n.localize('MNM3E.CannotRollUntrainedSkill'),
            });
        }

        return this.rollScore(label, total);
    }

    private async rollScore(scoreLabel: string, scoreTotal: number): Promise<ChatMessage | object | void> {
        const templateData = {
            actor: this.data,
            config: CONFIG.MNM3E,
            data: this.data.data,
            cardLabel: scoreLabel,
            rollTemplate: await new Roll(`1d20 + ${scoreTotal}`).render(),
        };

        return displayCard('basic-roll', ChatMessage.getSpeaker({ actor: this, token: this.token}), templateData);
    }

    private _prepareAbilities(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.abilities).forEach(ability => {
            ability.total = ability.rank;
            data.pointCosts.abilities.value += ability.rank * 2;
        });
    }

    private _prepareDefenses(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.defenses).forEach(defense => {
            defense.total = data.abilities[defense.ability].rank + defense.rank;
            data.pointCosts.defenses.value += defense.rank;
        });
    }

    private _prepareSkills(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.skills).forEach(skill => {
            const evaluateSkill = (sd: SkillDetail, s: Skill) => {
                sd.isTrained = false;
                sd.base = data.abilities[sd.ability].rank;
                s.total = 0;
                if (!sd.trainedOnly || (sd.trainedOnly && s.rank > 0)) {
                    sd.isTrained = true;
                    s.total = sd.base + s.rank;
                }
                data.pointCosts.skills.value += s.rank / 2;
            };
            if (skill.type == 'dynamic') {
                skill.base = data.abilities[skill.ability].rank;
                Object.values(skill.data).forEach((s: Skill) => {
                    evaluateSkill(skill, s);
                });
            } else {
                evaluateSkill(skill, skill.data as Skill);
            }
        });
    }

    private _prepareCharacterData(actorData: Actor.Data<T>): void {

    }

    private _prepareNPCData(actorData: Actor.Data<T>): void {

    }
}