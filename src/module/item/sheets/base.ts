import { Config } from '../../config';
import { onManagedActiveEffect, prepareActiveEffectCategories } from '../../active-effects';
import Item3e from '../entity';

export interface ExtendedItemSheetData<T = any> extends FoundryItemSheetData<T> {
    config: Config;
    itemType?: string;
    itemSubtype?: string;
}

export default class ItemSheet3e<T, I extends Item<T>> extends ItemSheet<T, I> {
    protected parentData?: ParentData;

    /**
     * @override
     */
    public static get defaultOptions(): FormApplicationOptions {
        return mergeObject(super.defaultOptions, {
            classes: ['mnm3e', 'sheet', 'item'],
            width: 600,
            height: 600,
            tabs: [{ navSelector: '.sheet-navigation', contentSelector: '.sheet-body', initial: 'description' }]
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): any {
        const sheetData = (super.getData() as any) as ExtendedItemSheetData<T>;
        sheetData.config = CONFIG.MNM3E;
        sheetData.itemType = game.i18n.localize(`ITEM.Type${this.item.type.titleCase()}`);

        sheetData.effects = prepareActiveEffectCategories(this.entity.effects);
        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        super.activateListeners(html);
        html.find('.effect-control').on('click', ev => onManagedActiveEffect(ev, this.item));
    }

    protected async onItemListActionHandler(ev: JQuery.ClickEvent, key: string): Promise<void> {
        ev.preventDefault();
        const target = ev.currentTarget as any;
        const list = getProperty(this.item.data, key) as any[];
        switch (target.dataset.action) {
            case 'edit':
                const sourceItem = list[target.dataset.index];
                if (!sourceItem) {
                    return;
                }
                sourceItem.tempData = { tag: `${Math.random().toString(36).substr(2, 9)}-temp` };
                const newItem = await Item.create(sourceItem, { temporary: true });
                (newItem.data as any)._id = sourceItem.tempData.tag;

                const rawSheet = newItem.sheet as any;
                rawSheet.parentData = {
                    key,
                    item: this.item,
                    itemTag: sourceItem.tempData.tag,
                };
                rawSheet._updateObject = (async (_: JQuery.Event, flattenedObject: any) => {
                    const updatedItem = list.find(data => data.tempData.tag == sourceItem.tempData.tag);
                    if (!updatedItem) {
                        return;
                    }

                    rawSheet.item.data = mergeObject(updatedItem, flattenedObject);
                    await rawSheet.updateItem(ev, key, list);
                });
                newItem.render(true);
                break;
            case 'delete':
                list.splice(target.dataset.index, 1);
                await this.updateItem(ev, key, list);
                break;
        }
    }

    protected async updateItem(ev: JQuery.Event, key: string, list: any[]): Promise<void> {
        if (this.parentData) {
            const parentList = getProperty(this.parentData.item.data, this.parentData.key);
            const currentIndex = parentList.findIndex((data: any) => data.tempData.tag == this.parentData!.itemTag);
            if (currentIndex < 0) {
                return;
            }
            (this.item.data as any).tempData = parentList[currentIndex].tempData;
            parentList[currentIndex] = this.item.data;
            await (this.parentData.item.sheet as any)._onSubmit(ev, { updateData: { [this.parentData.key]: parentList }});
            ((this.item as unknown) as Item3e).prepareMNM3EData();
            this.item.sheet.render(false);
        } else {
            this.item.update({ [key]: list }, {});
        }
    }


}