export default class ScoreConfig extends BaseEntitySheet {
    private _dataPath: string;
    private _configPath: string;
    constructor(dataPath: string, configPath: string, ...args: any[]) {
        super(...args);
        this._dataPath = dataPath;
        this._configPath = configPath;
    }

    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            template: 'systems/mnm3e/templates/apps/score-config.html',
            classes: ['mnm3e'],
            width: 400,
            height: 'auto',
        });
    }

    /**
     * @override
     */
    public get title(): string {
        return `${game.i18n.localize('MNM3E.ScoreConfig')}: ${this.entity.name}`;
    }

    /**
     * @override
     */
    public getData(): any {
        const scores = getProperty(this.entity.data, this._dataPath);
        Object.entries(scores).forEach(([name, score]) => {
            (score as any).label = getProperty(CONFIG.MNM3E, this._configPath)[name];
        });

        return {
            config: CONFIG.MNM3E,
            scores: scores,
            dataPath: this._dataPath,
        };
    }
}