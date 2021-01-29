export default class SummaryBuilder extends BaseEntitySheet<ItemSummary> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            template: 'systems/mnm3e/templates/apps/summary-builder.html',
            classes: ['mnm3e'],
            width: 300,
            height: 'auto',
        });
    }

    /**
     * @override
     */
    public get title(): string {
        return `${game.i18n.localize('MNM3E.SummaryBuilder')}: ${this.entity.name}`;
    }

    /**
     * @override
     */
    public getData(): any {
        return {
            config: CONFIG.MNM3E,
            ...this.entity.data,
        };
    }
}