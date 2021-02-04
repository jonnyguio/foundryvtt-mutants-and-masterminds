import { Config } from '../../config';
import { onManagedActiveEffect, prepareActiveEffectCategories } from '../../active-effects';
import Item3e from '../entity';
import SummaryBuilder from '../../apps/summary-builder';

interface TargetScoreOption {
    label: string;
    entries: object;
}

export interface ExtendedItemSheetData<T = any> extends FoundryItemSheetData<T> {
    config: Config;
    targetScoreOptions: TargetScoreOption[];
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
    public static get defaultOptions(): FormApplication.Options {
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
    public getData(options: DataOptions = {}): ItemSheet.Data<T> {
        const sheetData = super.getData() as ExtendedItemSheetData<T>;
        sheetData.config = CONFIG.MNM3E;
        (sheetData.item as any).isOwned = this.item.isOwned;
        sheetData.itemType = game.i18n.localize(`ITEM.Type${this.item.type.titleCase()}`);

        sheetData.targetScoreOptions = [
            {label: 'MNM3E.Abilities', scores: sheetData.config.abilities},
            {label: 'MNM3E.Defenses', scores: sheetData.config.defenses},
            {label: 'MNM3E.Skills', scores: sheetData.config.skills},
        ].map(opts => ({
            label: game.i18n.localize(opts.label),
            entries: Object.entries(opts.scores).reduce((agg: any, entry) => {
                agg[entry[0]] = entry[1];
                return agg;
            }, {}),
        }));

        sheetData.effects = prepareActiveEffectCategories((this.entity as any).effects);
        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        html.find('.effect-control').on('click', ev => onManagedActiveEffect(ev, this.item));
        html.find('.check-control').on('click', this.onCheckControl.bind(this));
        html.find('.config-button').on('click', this.onConfigMenu.bind(this));

        const originalClose = this.close.bind(this);
        this.close = async () => {
            this._childItems.forEach(async (value) => await value.sheet.close());
            await originalClose();
        }
        super.activateListeners(html);
    }

    protected async onItemListActionHandler(ev: JQuery.ClickEvent, key: string): Promise<void> {
        ev.preventDefault();
        const target = ev.currentTarget as any;
        const list = getProperty(this.item.data, key) as any[];
        const subItemIndex = target.dataset.index;
        switch (target.dataset.action) {
            case 'create':
                const newItem = await Item.create({ 
                    name: `New ${target.dataset.itemType}`,
                    type: target.dataset.itemType
                }, { temporary: true });
                list.push(newItem.data);
                await this.updateItem(ev, key, list);
                break;
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
            const newItem = await Item.create(sourceItem, { temporary: true }) as Item3e;
            (newItem.options as any).actor = this.item.actor;
            newItem.data._id = sourceItem._id;

            const rawSheet = newItem.sheet as any;
            rawSheet._parentItem = this.item;
            rawSheet._updateObject = (async (_: JQuery.Event, flattenedObject: object) => {
                const updatedItem = list.find(data => data._id == sourceItem._id);
                if (!updatedItem) {
                    return;
                }

                rawSheet.item.data = mergeObject(updatedItem, flattenedObject);
                await rawSheet.updateItem(ev, key, list);
            });
            childItem = newItem;
            this._childItems.set(sourceItem, newItem);
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

    private async onConfigMenu(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        let app: Application;
        switch (button.dataset.action) {
            case 'summary-builder':
                app = new SummaryBuilder(this.object);
                break;
            default:
                throw new Error(`unknown action: ${button.dataset.action}`);
        }
        if (this._parentItem) {
            (app as any)._updateObject = (this.item.sheet as any)._updateObject;
        }
        app.render(true);
    }

    private async onCheckControl(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        const dataPath = button.dataset.dataPath as string;
        const targetArray = getProperty(this.item.data, dataPath);
        switch (button.dataset.action) {
            case 'create':
                const newFormula: Formula = { op: '', value: ''};
                targetArray.push(newFormula);
                break;
            case 'delete':
                targetArray.splice(Number(button.dataset.index), 1);
                break;
            default:
                throw new Error(`unknown action: ${button.dataset.action}`);
        }

        await this._onSubmit(ev, { updateData: {[dataPath]: targetArray}});
    }
}