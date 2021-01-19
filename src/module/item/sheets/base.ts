import { Config } from '../../config';
import { onManagedActiveEffect, prepareActiveEffectCategories } from '../../active-effects';
import Item3e from '../entity';

export interface ExtendedItemSheetData<T = any> extends FoundryItemSheetData<T> {
    config: Config;
    itemType?: string;
    itemSubtype?: string;
}

export default class ItemSheet3e<T, I extends Item<T>> extends ItemSheet<T, I> {
    private _parentItem?: Item;
    private _childItems: Map<object, Item>;

    constructor(...args: any[]) {
        super(...args);
        this._childItems = new Map<object, Item>();
    }

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
        
        const originalClose = this.close.bind(this);
        this.close = async () => {
            this._childItems.forEach(async (value) => {
                await value.sheet.close();
            });
            await originalClose();
        }
    }

    protected async onItemListActionHandler(ev: JQuery.ClickEvent, key: string): Promise<void> {
        ev.preventDefault();
        const target = ev.currentTarget as any;
        const list = getProperty(this.item.data, key) as any[];
        const subItemIndex = target.dataset.index;
        switch (target.dataset.action) {
            case 'edit':
                await this.handleListItemEdit(ev, key, list, subItemIndex);
                break;
            case 'delete':
                const subItemData = list[subItemIndex];
                this._childItems.get(subItemData)?.sheet.close();
                this._childItems.delete(subItemData);
                list.splice(subItemIndex, 1);
                await this.updateItem(ev, key, list);
                break;
        }
    }

    private async handleListItemEdit(ev: JQuery.Event, key: string, list: any[], index: number): Promise<void> {
        const sourceItem = list[index];
        if (!sourceItem) {
            return;
        }

        let childItem = this._childItems.get(sourceItem);
        if (!childItem) {
            sourceItem.tempData = { tag: `${Math.random().toString(36).substr(2, 9)}-temp` };
            const newItem = await Item.create(sourceItem, { temporary: true });
            (newItem.data as any)._id = sourceItem.tempData.tag;

            const rawSheet = newItem.sheet as any;
            rawSheet._parentItem = this.item;
            rawSheet._updateObject = (async (_: JQuery.Event, flattenedObject: object) => {
                const updatedItem = list.find(data => data.tempData.tag == sourceItem.tempData.tag);
                if (!updatedItem) {
                    return;
                }

                rawSheet.item.data = mergeObject(updatedItem, flattenedObject);
                await rawSheet.updateItem(ev, key, list);
            });
            childItem = newItem as Item;
            this._childItems.set(sourceItem, newItem as Item);
        }
        childItem!.render(true);
    }

    private async updateItem(ev: JQuery.Event, key: string, list: any[]): Promise<void> {
        if (this._parentItem) {
            await (this._parentItem.sheet as any)._onSubmit(ev, { updateData: { [key]: list }});
            ((this.item as unknown) as Item3e).prepareMNM3EData();
            this.item.sheet.render(false);
        } else {
            this.item.update({ [key]: list }, {});
        }
    }
}