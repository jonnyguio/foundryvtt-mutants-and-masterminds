export default class ScoreConfig extends BaseEntitySheet {
    private _dataPath: string;
    private _configPath: string;

    constructor(dataPath: string, configPath: string, ...args: any[]) {
        super(...args);
        this._dataPath = dataPath;
        this._configPath = configPath;
        this.options.closeOnSubmit = false;
        this.options.submitOnChange = true;
        this.options.submitOnClose = true;
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

    /**
     * @override
     */
    public activateListeners(html: JQuery<HTMLElement>): void {
        html.find('.score-control').on('click', this.onScoreControlClick.bind(this));
        super.activateListeners(html);
    }

    /**
     * @override
     */
    protected async _updateObject(event: Event | JQuery.Event, formData: object): Promise<any> {
        const allScores = getProperty(this.entity.data, this._dataPath);
        const expandedFormData = expandObject(formData);
        Object.entries(allScores).forEach(([scoreName, score]) => {
            if (Array.isArray(score)) {
                for (let i = 0; i < score.length; i++) {
                    const key = `${this._dataPath}.${scoreName}.${i}`;
                    mergeObject(getProperty(expandedFormData, key), score[i], { overwrite: false });
                }
            }
        });
        return super._updateObject(event, expandedFormData);
    }

    private async onScoreControlClick(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        const scoreType = button.dataset.scoreType;
        const allScores = getProperty(this.entity.data, this._dataPath);
        const targetEntry = Object.entries(allScores).find(([name]) => name == scoreType);
        if (!targetEntry) {
            throw new Error(`Could not find type '${scoreType}'`);
        }

        const targetScore = targetEntry[1] as {[k: string]: any};
        if (!targetScore) {
            throw new Error(`targetScore is not defined`);
        }

        switch (button.dataset.action) {
            case 'create':
                const scoreName = await new Promise((resolve) => {
                    new Dialog({
                        title: game.i18n.localize('MNM3E.ScoreNew'),
                        content: `<label>${game.i18n.localize('MNM3E.ScoreName')}</label>
                                  <input type="text" />`,
                        buttons: {
                            ok: {
                                label: game.i18n.localize('MNM3E.OK'),
                                callback: html => resolve((html as JQuery<HTMLElement>).find('input')[0].value),
                            },
                            cancel: {
                                label: game.i18n.localize('MNM3E.Cancel'),
                                callback: () => resolve(null),
                            },
                        },
                        close: () => resolve(null),
                        default: 'ok',
                    }).render(true);
                }) as string | null;
                if (!scoreName) {
                    return;
                }
                const newScore = {
                    rank: 0,
                    displayName: scoreName,
                };
                const cleanedName = scoreName.replace(' ', '');
                targetScore.data[cleanedName] = newScore;
                await this.entity.update({[`${this._dataPath}.${scoreType}`]: targetScore});
                break;
            case 'delete':
                const name = button.dataset.subscoreName;
                delete targetScore.data[name];
                await this.entity.update({[`${this._dataPath}.${scoreType}.data.-=${name}`]: null})
                break;
            default:
                throw new Error(`Unknown score action: ${button.dataset.action}`);
        }
    }
}