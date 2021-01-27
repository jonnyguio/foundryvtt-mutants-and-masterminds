import Item3e from '../entity';
import ItemSheet3e, { ExtendedItemSheetData } from './base';

export default class ItemSheet3eEffect extends ItemSheet3e<ModifierData, Item3e<ModifierData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('modifier');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/items/modifier-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): ItemSheet.Data<ModifierData> {
        const sheetData = super.getData(options) as ExtendedItemSheetData<ModifierData>;
        sheetData.itemSubtype = game.i18n.localize(sheetData.data.cost.value >= 0 ? 'MNM3E.ModifierExtra' : 'MNM3E.ModifierFlaw');
        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        super.activateListeners(html);
        html.find('.expression-control').on('click', this.expressionControlHandler.bind(this));
    }

    private expressionControlHandler(ev: JQuery.Event): void {
        const e = (ev as unknown) as MouseEvent;
        e.preventDefault();
        const target = e.currentTarget as any;
        const expressions = this.item.data.data.expressions;
        switch(target.dataset.action) {
            case 'create':
                expressions.push({key: '', formula: ''});
                break;
            case 'delete':
                expressions.splice(target.dataset.index, 1);
                break;
        }
        this.item.update({data: {expressions: expressions}}, {});
    }
}