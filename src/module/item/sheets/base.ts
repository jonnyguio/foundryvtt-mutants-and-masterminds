import { Config } from '../../config';
import { onManagedActiveEffect, prepareActiveEffectCategories } from '../../active-effects';
import Item3e from '../entity';
import SummaryBuilder from '../../apps/summary-builder';

interface OptionGroupInfo {
    label: string;
    entries: object;
}

export interface ExtendedItemSheetData<T = any> extends FoundryItemSheetData<T> {
    config: Config;
    formulaOptions: OptionGroupInfo[];
    itemType?: string;
    itemSubtype?: string;
}

export default class ItemSheet3e<T, I extends Item<T>> extends ItemSheet<T, I> {
    private _parentItem?: Item;
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
            rawSheet._childDataPath = key;
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
}