export default class Actor3e<T extends CommonActorData> extends Actor<T> {
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
                label: game.i18n.localize('MNM3E.PointTotal'),
            }
        };

        this._prepareAbilities(actorData);
        this._prepareDefenses(actorData);
        this._prepareSkills(actorData);

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

        actorData.items.forEach(item => {
            switch (item.type) {
                case 'power':
                    actorData.data.pointCosts.powers.value += (item.data as PowerData).totalCost || 0;
                    break;
                case 'advantage':
                    const advantageData = item.data as AdvantageData;
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

        if (actorData.type == 'character') {
            const characterData = (actorData as unknown) as CharacterData;
            characterData.maxPowerPoints = 15 * characterData.powerLevel + characterData.powerPoints;
        }
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
            const evaluateSkill = (s: Skill) => {
                s.isTrained = false;
                s.total = 0;
                if (!s.trainedOnly || (s.trainedOnly && s.rank > 0)) {
                    s.isTrained = true;
                    s.total = data.abilities[s.ability].rank + s.rank;
                }
                data.pointCosts.skills.value += s.rank / 2;
            };
            if (skill.type == 'dynamic') {
                Object.values(skill.data).forEach(evaluateSkill);
            } else {
                evaluateSkill(skill.data as Skill);
            }
        });
    }

    private _prepareCharacterData(actorData: Actor.Data<T>): void {

    }

    private _prepareNPCData(actorData: Actor.Data<T>): void {

    }
}