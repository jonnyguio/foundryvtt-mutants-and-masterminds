import Item3e from '../entity';
import ItemSheet3e, { ExtendedItemSheetData } from './base';

interface ExtendedPowerSheetData extends ExtendedItemSheetData<PowerData> {
    effectSummaries: {
        label: string;
        value: string | number;
    }[];
}

export default class ItemSheet3ePower extends ItemSheet3e<PowerData, Item3e<PowerData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('power');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/items/power-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): ItemSheet.Data<PowerData> {
        const sheetData = super.getData(options) as ExtendedPowerSheetData;

        sheetData.data.summary = '';
        sheetData.data.effects.forEach(effect => {
            if (effect.data.summary.parsed) {
                sheetData.data.summary += effect.data.summary.parsed;
            }
        });

        sheetData.effectSummaries = [];
        return sheetData;
    }

    /**
     * @override
     */
    public activateListeners(html: JQuery) {
        const itemData = this.item.data;
        [
            {selector: '.item-effect-controls .item-control', dataPath: 'data.effects'},
            {selector: '.item-power-controls .item-control', dataPath: 'data.powerArray'},
        ].forEach(opts => html.find(opts.selector).on('click', ev => this.onItemListActionHandler(ev, opts.dataPath)));
        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.effect-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: (ev: DragEvent) => this.handleDroppedData(ev, 'effect', 'effects') },
        }).bind($('form.editable.item-sheet-power')[0]);

        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.power-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: (ev: DragEvent) => this.handleDroppedData(ev, 'power', 'powerArray') }
        }).bind($('form.editable.item-sheet-power')[0]);

        itemData.data.powerArray.forEach((alternativePower: Item.Data<PowerData>, index: number) => {
            if (!alternativePower.data.totalCost || !itemData.data.totalCost) {
                return;
            }
            if (alternativePower.data.totalCost > itemData.data.totalCost) {
                const listSelector = '.items-list power-list .item'
                const listElements = html.find(listSelector);
                if (!listElements) {
                    throw new Error(`Couldn't find elements with selector '${listSelector}'`);
                }

                listElements[index].classList.add('invalid-power');
            }
        });

        super.activateListeners(html);
    }
}