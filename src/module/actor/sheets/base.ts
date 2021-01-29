import Item3e from '../../item/entity';
import ScoreConfig from '../../apps/score-config';

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
        const sheetData = super.getData();

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

        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        html.find('.item-power-controls .item-control').on('click', this.onEmbeddedItemEvent.bind(this));
        html.find('.config-button').on('click', this.onConfigMenu.bind(this));

        if (this.actor.owner) {
            html.find('.item .item-image').on('click', this.onItemRoll.bind(this));
        }
        super.activateListeners(html);
    }

    protected abstract prepareItems(data: ActorSheet.Data<T>): void;

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
}