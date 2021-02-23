import Item3e from '../entity';
import ItemSheet3e, { ExtendedItemSheetData } from './base';

export default class ItemSheet3eEffect extends ItemSheet3e<PowerEffectData, Item3e<PowerEffectData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('effect');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/items/effect-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): ItemSheet.Data<PowerEffectData> {
        const sheetData = super.getData(options) as ExtendedItemSheetData<PowerEffectData>;
        if (sheetData.data.action.type.value) {
            sheetData.itemSubtype = game.i18n.localize(`MNM3E.EffectType${sheetData.data.action.type.value.titleCase()}`);
        }

        return sheetData;
    }

    /**
     * @override
     */
    public activateListeners(html: JQuery) {
        html.find('.item-modifier-controls .item-control').on('click', ev => this.onItemListActionHandler(ev, 'data.modifiers'));
        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.modifier-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: (ev: DragEvent) => this.handleDroppedData(ev, 'modifier', 'modifiers') },
        }).bind($('form.editable.item-sheet-effect')[0]);

        super.activateListeners(html);
    }
}