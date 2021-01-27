export default class ActorSheet3e<T extends CommonActorData & CreatureData, A extends Actor<T>> extends ActorSheet<T, A> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            classes: ['mnm3e', 'sheet', 'actor'],
            width: 600,
            height: 600,
            tabs: [{ navSelector: '.sheet-navigation', contentSelector: '.sheet-body', initial: 'core' }]
        });
    }

    /**
     * @override
     */
    public getData(): ActorSheet.Data<T> {
        const sheetData = super.getData();

        Object.entries(sheetData.data.abilities).forEach(([name, ability]) => {
            ability.label = CONFIG.MNM3E.abilities[name];
        });

        Object.entries(sheetData.data.skills).forEach(([name, skill]) => {
            skill.label = CONFIG.MNM3E.skills[name];
        });

        Object.entries(sheetData.data.defenses).forEach(([name, defense]) => {
            defense.label = CONFIG.MNM3E.defenses[name];
        })

        return sheetData;
    }
}