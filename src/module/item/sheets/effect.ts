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
        if (sheetData.data.type.value) {
            sheetData.itemSubtype = game.i18n.localize(`MNM3E.EffectType${sheetData.data.type.value.titleCase()}`);
        }

        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery) {
        html.find('.item-modifier-controls .item-control').on('click', ev => this.onItemListActionHandler(ev, 'data.modifiers'));
        new DragDrop({
            dragSelector: '.item',
            dropSelector: '.items-list.modifier-list',
            permissions: { dragstart: () => true, drop: () => true },
            callbacks: { drop: this.handleDroppedModifier.bind(this) },
        }).bind($('form.editable.item-sheet-effect')[0]);

        super.activateListeners(html);
    }

    private async handleDroppedModifier(event: DragEvent): Promise<void> {
        event.preventDefault();
        if (!event.dataTransfer) {
            return;
        }
        const dropData = JSON.parse(event.dataTransfer?.getData('text/plain'));
        if (dropData.type != 'Item') {
            return;
        }

        const droppedItem = game.items.get(dropData.id);
        if (droppedItem.data.type != 'modifier') {
            return;
        }

        this.item.data.data.modifiers.push(duplicate(droppedItem.data) as Item.Data<ModifierData>);
        (this.item.sheet as any)._onSubmit(event, { updateData: { data: { modifiers: this.item.data.data.modifiers } }});
    }
}