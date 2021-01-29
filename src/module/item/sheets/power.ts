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
        super.activateListeners(html);

        html.find('.item-effect-controls .item-control').on('click', ev => this.onItemListActionHandler(ev, 'data.effects'));
        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.effect-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: this.handleDroppedEffect.bind(this) },
        }).bind($('form.editable.item-sheet-power')[0]);
    }

    /**
     * @override
     */
    protected async handleDroppedEffect(event: DragEvent): Promise<void> {
        event.preventDefault();
        if (!event.dataTransfer) {
            return;
        }
        const dropData = JSON.parse(event.dataTransfer?.getData('text/plain'));
        if (dropData.type != 'Item') {
            return;
        }

        const droppedItem = game.items.get(dropData.id);
        if (droppedItem.data.type != 'effect') {
            return;
        }

        this.item.data.data.effects.push(droppedItem.data as Item.Data<PowerEffectData>);
        if (this.item._id) {
            this.item.update({ data: { effects: this.item.data.data.effects } }, {});
        }
    }
}