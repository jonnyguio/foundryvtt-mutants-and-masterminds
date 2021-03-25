import { Config } from '../../config';
import { onManagedActiveEffect, prepareActiveEffectCategories } from '../../active-effects';
import Item3e from '../entity';
import SummaryBuilder from '../../apps/summary-builder';

interface OptionGroupInfo {
    label: string;
    entries: object;
}

interface AttributeField {
    label: string;
    name: string;
    value: string;
}

export interface ExtendedItemSheetData<T = any> extends FoundryItemSheetData<T> {
    config: Config;
    formulaOptions: OptionGroupInfo[];
    attributes?: AttributeField[];
    itemSubtitles?: string[];
    itemType?: string;
}

export default class ItemSheet3e<T, I extends Item3e<T>> extends ItemSheet<T, I> {
    private _parentItem?: Item;
    private _parentList?: any[];
    private _sourceItem: any;
    private _childDataPath?: string;
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
            tabs: [{ navSelector: '.sheet-navigation', contentSelector: '.sheet-body', initial: 'description' }],
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
        let actorData: Actor.Data<CommonActorData & CreatureData> | undefined = undefined;
        if (this.actor) {
            actorData = (this.actor.data as unknown) as Actor.Data<CommonActorData & CreatureData>;
        }

        sheetData.formulaOptions = [
            {label: 'MNM3E.Abilities', score: 'abilities'},
            {label: 'MNM3E.Defenses', score: 'defenses'},
            {label: 'MNM3E.Skills', score: 'skills'},
        ].map(opts => ({
            label: game.i18n.localize(opts.label),
            entries: Object.entries(sheetData.config[opts.score]).reduce((agg: any, entry) => {
                const [scoreName, scoreLabel] = entry;
                let key = `${opts.score}.${scoreName}`;
                const subCategories: {[k: string]: string} = {};
                if (opts.score == 'skills') {
                    if (['cco', 'exp', 'rco'].includes(scoreName)) {
                        key += `.base`;
                        if (actorData) {
                            Object.entries(actorData.data.skills[scoreName].data).forEach(customSkill => {
                                subCategories[`@skills.${scoreName}.data.${customSkill[0]}.total`] = `➥ ${customSkill[1].displayName}`;
                            });
                        }
                    } else {
                        key += '.data.total';
                    }
                } else {
                    key += '.total';
                }
                agg[key] = scoreLabel;
                Object.entries(subCategories).forEach(([dataPath, customLabel]) => agg[dataPath] = customLabel);
                return agg;
            }, {}),
        }));

        sheetData.effects = prepareActiveEffectCategories((this.entity as any).effects);
        return sheetData;
    }

    /**
     * @override
     */
    public activateListeners(html: JQuery): void {
        html.find('.effect-control').on('click', ev => onManagedActiveEffect(ev, this.item));
        html.find('.check-control').on('click', this.onCheckControl.bind(this));
        html.find('.app-button').on('click', this.onAppMenu.bind(this));
        html.find('.item .item-name h4').on('click', this.onItemSummary.bind(this));

        const originalClose = this.close.bind(this);
        this.close = async () => {
            this._childItems.forEach(async (value) => await value.sheet.close());
            await originalClose();
        }
        super.activateListeners(html);
    }

    public async renderListItemContents(): Promise<JQuery<HTMLElement>> {
        return $(await renderTemplate('systems/mnm3e/templates/items/parts/list-item-sheet.html', this.item.data));
    }

    protected async onItemListActionHandler(ev: JQuery.ClickEvent, key: string): Promise<void> {
        ev.preventDefault();
        const target = ev.currentTarget as any;
        const list = getProperty(this.item.data, key) as any[];
        const subItemIndex = target.dataset.index;
        switch (target.dataset.action) {
            case 'create':
                const newItem = await Item.create({
                    name: `New ${target.dataset.itemType.titleCase()}`,
                    type: target.dataset.itemType
                }, { temporary: true });
                newItem.data._id = `${randomID(8)}-temp`;
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

    protected async handleDroppedData(event: DragEvent, listedDataType: string, dataPath: string): Promise<void> {
        event.preventDefault();
        if (!event.dataTransfer) {
            return;
        }
        const dropData = JSON.parse(event.dataTransfer?.getData('text/plain'));
        if (dropData.type != 'Item') {
            return;
        }

        const droppedItem = game.items.get(dropData.id);
        if (droppedItem.data.type != listedDataType) {
            return;
        }

        const copiedItem = duplicate(droppedItem.data) as Item.Data;
        (copiedItem as any)._id = `${randomID(8)}-temp`;
        const dataList = getProperty(this.item.data.data as any, dataPath) as any[];
        dataList.push(copiedItem);
        (this.item.sheet as any)._onSubmit(event, { updateData: { [`data.${dataPath}`]: dataList }});
    }

    /**
     * @override
     */
    protected async _updateObject(ev: JQuery.Event, flattenedObject: object): Promise<void> {
        ev.preventDefault();

        if (this._parentItem) {
            const updatedItem = this._parentList!.find(data => data._id == this._sourceItem._id);
            if (!updatedItem) {
                return;
            }

            this.item.data = mergeObject(updatedItem, flattenedObject);
            this.item.parseSummary(this.item.data);
            await this.updateItem(ev, this._childDataPath!, this._parentList!);
        } else {
            const summary = (this.item.data.data as any).summary;
            if (summary) {
                this.item.parseSummary(mergeObject(this.item.data, flattenedObject, { inplace: false }) as Item.Data);
                flattenedObject = flattenObject(mergeObject(flattenedObject, { data: { summary }}));
            }
            await super._updateObject(ev, flattenedObject);
        }
    }

    private initializeChildData(sourceItem: any, parentItem: Item, childDataPath: string, parentList: any[]): void {
        this._parentItem = parentItem;
        this._sourceItem = sourceItem;
        this._parentList = parentList;
        this._childDataPath = childDataPath;
    }

    private async handleListItemEdit(ev: JQuery.Event, key: string, list: any[], index: number): Promise<void> {
        const sourceItem = list[index];
        if (!sourceItem) {
            return;
        }

        let childItem = this._childItems.get(sourceItem);
        if (!childItem) {
            const newItem = await this.newChildItem(sourceItem);

            const rawSheet = (newItem.sheet as unknown) as ItemSheet3e<T, I>;
            rawSheet.initializeChildData(sourceItem, this.item, key, list);
            // rawSheet._parentItem = this.item;
            // rawSheet._childDataPath = key;
            // rawSheet._updateObject = (async (_: JQuery.Event, flattenedObject: object) => {
            //     const updatedItem = list.find(data => data._id == sourceItem._id);
            //     if (!updatedItem) {
            //         return;
            //     }

            //     rawSheet.item.data = mergeObject(updatedItem, flattenedObject);
            //     await rawSheet.updateItem(ev, key, list);
            // });
            childItem = newItem;
            this._childItems.set(sourceItem, newItem);
        }
        childItem!.render(true);
    }

    private async updateItem(ev: JQuery.Event, key: string, list: any[]): Promise<void> {
        if (this._parentItem) {
            const parentList = getProperty(this._parentItem.data, this._childDataPath!) as any[];
            const itemToUpdateIndex = parentList.findIndex((data: any) => data._id == this.item._id);
            if (itemToUpdateIndex >= 0) {
                parentList[itemToUpdateIndex] = this.item.data;
            }
            ((this.item as unknown) as Item3e).prepareMNM3EData();
            this.item.sheet.render(false);
            await (this._parentItem.sheet as any)._onSubmit(ev, { updateData: { [this._childDataPath!]: parentList }});
        } else {
            this.item.update({ [key]: list }, {});
        }
    }

    private async newChildItem(sourceItem: any): Promise<Item3e> {
        const newItem = await Item.create(sourceItem, { temporary: true }) as Item3e;
        (newItem.options as any).actor = this.item.actor;
        newItem.data._id = sourceItem._id;

        return newItem;
    }

    private async onAppMenu(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        let app: Application;
        switch (button.dataset.action) {
            case 'summary-builder':
                app = new SummaryBuilder(this.item as any);
                break;
            default:
                throw new Error(`unknown action: ${button.dataset.action}`);
        }
        if (this._parentItem) {
            (app as any)._updateObject = (this.item.sheet as any)._updateObject.bind(this);
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
                const newFormula: Formula = { op: '', value: '', dataPath: ''};
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

    private async onItemSummary(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const li = $(ev.currentTarget).closest('.item');

        const expandedClass = 'expanded';
        const summaryClass = 'list-item-summary';
        if (li.hasClass(expandedClass)) {
            const summary = li.children(`.${summaryClass}`)
            summary.slideUp(200, () => summary.remove());
        } else {
            const dataPath = li.closest('.item-list').data('data-path');
            const sourceItem = getProperty(this.item.data, dataPath)[li.data('item-index')];
            let item = this._childItems.get(sourceItem);
            if (!item) {
                item = await this.newChildItem(sourceItem);
            }
            const div = await (item.sheet as ItemSheet3e<any, Item3e>).renderListItemContents();
            const trimmedDiv = div.html($.trim(div.html()));
            li.append(trimmedDiv.hide());
            trimmedDiv.slideDown(200);
        }

        li.toggleClass(expandedClass);
    }
}