import Item3e from '../item/entity';

export default class SummaryBuilder extends FormApplication<Item3e<ItemSummary>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            template: 'systems/mnm3e/templates/apps/summary-builder.html',
            classes: ['mnm3e', 'sheet', 'app', 'summary-builder'],
            width: 300,
            height: 'auto',
        });
    }

    /**
     * @override
     */
    public get title(): string {
        return `${game.i18n.localize('MNM3E.SummaryBuilder')}: ${this.object.name}`;
    }

    /**
     * @override
     */
    public getData(): any {
        (this.object.data as any).config = CONFIG.MNM3E;
        return this.object.data;
    }

    /**
     * @override
     */
    public activateListeners(html: JQuery<HTMLElement>): void {
        html.find('.save-control').on('click', this.onSave.bind(this));
        super.activateListeners(html);
    }

    private async onSave(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();

        const itemData = this.object.data;
        const summary = itemData.data.summary;
        const form = $(this.form);
        const position = form.find('select[name="data.summary.position');
        if (position.length > 0) {
            summary.position = position.val() as SummaryPosition;
        }
        summary.format = form.find('input[name="data.summary.format"]').val() as string;
        this.object.parseSummary(this.object.data);
        const parseUpdate = { data: { summary } };

        await this._onSubmit(ev, { updateData: parseUpdate });
    }
}