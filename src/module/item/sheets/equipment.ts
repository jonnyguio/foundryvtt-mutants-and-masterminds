import Item3e from '../entity';
import ItemSheet3e, { ExtendedItemSheetData } from './base';

export default class ItemSheet3eEquipment extends ItemSheet3e<EquipmentData, Item3e<EquipmentData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('equipment');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/items/equipment-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): ItemSheet.Data<EquipmentData> {
        const sheetData = super.getData(options) as ExtendedItemSheetData<EquipmentData>;

        sheetData.data.summary = '';
        sheetData.data.effects.forEach(effect => {
            if (effect.data.summary.parsed) {
                sheetData.data.summary += effect.data.summary.parsed;
            }
        });

        return sheetData;
    }

    /**
     * @override
     */
    public activateListeners(html: JQuery): void {
        html.find('.item-effect-controls .item-control').on('click', ev => this.onItemListActionHandler(ev, 'data.effects'));
        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.effect-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: (ev: DragEvent) => this.handleDroppedData(ev, 'effect', 'effects') },
        }).bind($('form.editable.item-sheet-equipment')[0]);
        super.activateListeners(html);
    }
}