export default class Actor3e<T extends CommonActorData> extends Actor<T> {
    /**
     * @override
     */
    public prepareBaseData(): void {
        const actorData = this.data;
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
    }

    private _prepareAbilities(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.abilities).forEach(ability => {
            ability.total = ability.rank;
        });
    }

    private _prepareDefenses(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.defenses).forEach(defense => {
            defense.total = data.abilities[defense.ability].rank + defense.rank;
        });
    }

    private _prepareSkills(actorData: Actor.Data<T>): void {
        const data = actorData.data;

        Object.values(data.skills).forEach(skill => {
            skill.isTrained = false;
            skill.total = 0;
            if (!skill.trainedOnly || (skill.trainedOnly && skill.rank > 0)) {
                skill.isTrained = true;
                skill.total = data.abilities[skill.ability].rank + skill.rank;
            }
        });
    }

    private _prepareCharacterData(actorData: Actor.Data<T>): void {

    }

    private _prepareNPCData(actorData: Actor.Data<T>): void {

    }
}