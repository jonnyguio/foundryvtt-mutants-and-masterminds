import Item3e from '../../item/entity';
import ScoreConfig from '../../apps/score-config';
import { prepareActiveEffectCategories, onManagedActiveEffect } from '../../active-effects';
import ItemSheet3e from '../../item/sheets/base';

export interface ExtendedActorSheetData<T extends CommonActorData & CreatureData> extends FoundryActorSheetData<T> {
    powers: Item<PowerData>[];
    advantages: Item<AdvantageData>[];
    equipment: Item<EquipmentData>[];
}

export default abstract class ActorSheet3e<T extends CommonActorData & CreatureData, A extends Actor<T>> extends ActorSheet<T, A> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            classes: ['mnm3e', 'sheet', 'actor'],
            width: 600,
            height: 600,
            tabs: [{ navSelector: '.sheet-navigation', contentSelector: '.sheet-body', initial: 'core' }]
        });
    }

    /**
     * @override
     */
    public getData(): ActorSheet.Data<T> {
        const sheetData = super.getData() as ExtendedActorSheetData<T>;

        Object.entries(sheetData.data.abilities).forEach(([name, ability]) => {
            ability.label = CONFIG.MNM3E.abilities[name];
        });

        Object.entries(sheetData.data.skills).forEach(([name, skill]) => {
            skill.label = CONFIG.MNM3E.skills[name];
        });

        Object.entries(sheetData.data.defenses).forEach(([name, defense]) => {
            defense.label = CONFIG.MNM3E.defenses[name];
        });

        this.prepareItems(sheetData);

        sheetData.effects = prepareActiveEffectCategories((this.entity as any).effects);

        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        html.find('.effect-control').on('click', ev => onManagedActiveEffect(ev, this.actor));
        html.find('.config-button').on('click', this.onConfigMenu.bind(this));
        html.find('.item .item-name h4').on('click', this.onItemSummary.bind(this));

        [
            'power',
            'advantage',
            'equipment',
        ].forEach(itemType =>
            html.find(`.item-${itemType}-controls .item-control`).on('click', this.onEmbeddedItemEvent.bind(this)));

        if (this.actor.owner) {
            html.find('.item .item-image').on('click', this.onItemRoll.bind(this));
        }
        super.activateListeners(html);
    }

    protected prepareItems(incomingData: ActorSheet.Data<T>): void {
        const data = incomingData as ExtendedActorSheetData<T>;
        const powers: Item<PowerData>[] = [];
        const advantages: Item<AdvantageData>[] = [];
        const equipment: Item<EquipmentData>[] = [];
        data.items.reduce((arr, item) => {
            let targetArray;
            switch (item.type) {
                case 'power':
                    targetArray = arr[0];
                    break;
                case 'advantage':
                    targetArray = arr[1];
                    break;
                case 'equipment':
                    targetArray = arr[2];
            }
            if (!targetArray) {
                return arr;
            }
            targetArray.push(item as any);
            return arr;
        }, [powers, advantages, equipment]);

        data.powers = powers;
        data.advantages = advantages;
        data.equipment = equipment;
    }

    private onItemRoll(event: JQuery.ClickEvent): void {
        event.preventDefault();
        const itemID = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(itemID) as Item3e;
        item?.roll();
    }

    private onEmbeddedItemEvent(event: JQuery.ClickEvent): void {
        event.preventDefault();
        const button = event.currentTarget;
        const closestItem = button.closest('li.item');
        switch (button.dataset.action) {
            case 'create':
                const itemType = button.dataset.itemType;
                const itemData = {
                    name: game.i18n.format('MNM3E.ItemNewFormat', { type: itemType.capitalize() }),
                    type: itemType,
                };
                this.actor.createOwnedItem(itemData);
                break;
            case 'edit':
                const item = this.actor.getOwnedItem(closestItem?.dataset.itemId);
                item?.sheet.render(true);
                break;
            case 'delete':
                this.actor.deleteOwnedItem(closestItem?.dataset.itemId);
                break;
        }
    }

    private async onConfigMenu(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const button = ev.currentTarget;
        let app: Application;
        switch (button.dataset.action) {
            case 'score-config':
                app = new ScoreConfig(button.dataset.scorePath, button.dataset.scoreConfigPath, this.object);
                break;
            default:
                throw new Error(`unknown action: ${button.dataset.action}`);
        }
        app.render(true);
    }

    private async onItemSummary(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const li = $(ev.currentTarget).parents('.item');

        const expandedClass = 'expanded';
        const summaryClass = 'list-item-summary'
        if (li.hasClass(expandedClass)) {
            const summary = li.children(`.${summaryClass}`)
            summary.slideUp(200, () => summary.remove());
        } else {
            const item = this.actor.getOwnedItem(li.data('item-id')) as Item3e;
            const div = await (item.sheet as ItemSheet3e<any, Item3e>).renderListItemContents();
            li.append(div.hide());
            div.slideDown(200);
        }

        li.toggleClass(expandedClass);
    }
}