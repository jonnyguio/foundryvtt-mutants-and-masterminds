import Item3e from '../../item/entity';
import ScoreConfig from '../../apps/score-config';
import { prepareActiveEffectCategories, onManagedActiveEffect } from '../../active-effects';
import ItemSheet3e from '../../item/sheets/base';
import Actor3e from '../entity';
import { Config } from '../../config';
import { getMeasurement } from '../../measurements';

export interface ExtendedActorSheetData<T extends CommonActorData & CreatureData> extends FoundryActorSheetData<T> {
    config: Config;
    
    powers: Item.Data<PowerData>[];
    powerSections: ItemListSections;
    advantages: Item.Data<AdvantageData>[];
    advantageSections: ItemListSections;
    equipment: Item.Data<EquipmentData>[];
    equipmentSections: ItemListSections;
    movement: {
        main: string;
        special?: string;
    };

    summary: {
        name: string;
        value: string;
        localizedKey: string;
    }[];
}

export default abstract class ActorSheet3e<T extends CommonActorData & CreatureData, A extends Actor3e<T>> extends ActorSheet<T, A> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        return mergeObject(super.defaultOptions, {
            classes: ['mnm3e', 'sheet', 'actor'],
            width: 740,
            height: 730,
            tabs: [{ navSelector: '.sheet-navigation', contentSelector: '.sheet-body', initial: 'core' }]
        });
    }

    /**
     * @override
     */
    public getData(): ActorSheet.Data<T> {
        const sheetData = super.getData() as ExtendedActorSheetData<T>;
        sheetData.config = CONFIG.MNM3E;

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

        const speedMeasurement = getMeasurement('distance', sheetData.data.attributes.movement.speed);
        sheetData.movement = {
            main: `${CONFIG.MNM3E.movement.speed} ${sheetData.data.attributes.movement.speed} (${speedMeasurement.value} ${speedMeasurement.units})`,
            special: Object.entries(sheetData.data.attributes.movement).map(([name, value]) => {
                if (name == 'speed' || value == 0) {
                    return undefined;
                }

                const measurement = getMeasurement('distance', value);
                return `${name.titleCase()} ${value} (${measurement.value} ${measurement.units})`;
            }).filter(m => m).reduce((prev, current) => prev ? `${prev}, ${current}` : current, ''),
        };

        sheetData.effects = prepareActiveEffectCategories((this.entity as any).effects);

        sheetData.summary = [
            {
                name: 'data.info.identity',
                value: sheetData.data.info.identity,
                localizedKey: 'MNM3E.Identity',
            },
            {
                name: 'data.info.groupAffiliation',
                value: sheetData.data.info.groupAffiliation,
                localizedKey: 'MNM3E.GroupAffiliation',
            },
            {
                name: 'data.info.baseOfOperations',
                value: sheetData.data.info.baseOfOperations,
                localizedKey: 'MNM3E.BaseOfOperations',
            },
        ];

        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        html.find('.effect-control').on('click', ev => onManagedActiveEffect(ev, this.actor));
        html.find('.config-button').on('click', this.onConfigMenu.bind(this));
        html.find('.item .item-name h4').on('click', this.onItemSummary.bind(this));
        html.find('.ability-name').on('click', this.onRollAbilityCheck.bind(this));
        html.find('.defense-name').on('click', this.onRollDefenseCheck.bind(this));
        html.find('.skill-name, .subskill-name').on('click', this.onRollSkillCheck.bind(this));

        [
            'power',
            'advantage',
            'equipment',
        ].forEach(itemType =>
            html.find(`.item-${itemType}-controls .item-control`).on('click', this.onEmbeddedItemEvent.bind(this)));

        if (this.actor.owner) {
            html.find('.item .item-image').on('click', this.onItemRoll.bind(this));
            html.find('.max-points .lock-button').on('click', this.onMaxPointsOverrideToggle.bind(this));
        }
        super.activateListeners(html);
    }

    protected prepareItems(incomingData: ActorSheet.Data<T>): void {
        const data = incomingData as ExtendedActorSheetData<T>;
        const powers: Item.Data<PowerData>[] = [];
        const advantages: Item.Data<AdvantageData>[] = [];
        const equipment: Item.Data<EquipmentData>[] = [];
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

        const standardHeaders = ['MNM3E.Activation', 'MNM3E.Action'].map(l => game.i18n.localize(l));
        data.powers = powers;
        data.powerSections = {
            headers: standardHeaders,
            rows: powers.map(p => [
                CONFIG.MNM3E.activationTypes[p.data.effects[0]?.data.activation.type.value],
                CONFIG.MNM3E.actionTypes[p.data.effects[0]?.data.action.type.value],
            ]),
        };

        data.advantages = advantages;
        data.advantageSections = {
            headers: standardHeaders,
            rows: advantages.map(a => [
                CONFIG.MNM3E.activationTypes[a.data.activation.type.value],
                CONFIG.MNM3E.actionTypes[a.data.action.type.value],
            ]),
        };

        data.equipment = equipment;
        data.equipmentSections = {
            headers: standardHeaders,
            rows: equipment.map(e => [
                CONFIG.MNM3E.activationTypes[e.data.effects[0]?.data.activation.type.value],
                CONFIG.MNM3E.actionTypes[e.data.effects[0]?.data.action.type.value],
            ]),
        };
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
        let item;
        switch (button.dataset.action) {
            case 'create':
                const itemType = button.dataset.itemType;
                const itemData = {
                    name: game.i18n.format('MNM3E.ItemNewFormat', { type: itemType.capitalize() }),
                    img: 'icons/svg/upgrade.svg',
                    type: itemType,
                };
                this.actor.createOwnedItem(itemData);
                break;
            case 'edit':
                item = this.actor.getOwnedItem(closestItem?.dataset.itemId);
                item?.sheet.render(true);
                break;
            case 'delete':
                this.actor.deleteOwnedItem(closestItem?.dataset.itemId);
                break;
            case 'favorite':
                const favoriteKey = 'isFavorite'
                item = this.actor.getOwnedItem(closestItem?.dataset.itemId);
                item?.setFlag('mnm3e', favoriteKey, !(item.getFlag('mnm3e', favoriteKey) ?? false));
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
        const summaryClass = 'list-item-summary';
        if (li.hasClass(expandedClass)) {
            const summary = li.children(`.${summaryClass}`)
            summary.slideUp(200, () => summary.remove());
        } else {
            const item = this.actor.getOwnedItem(li.data('item-id')) as Item3e;
            const div = await (item.sheet as ItemSheet3e<any, Item3e>).renderListItemContents();
            const trimmedDiv = div.html($.trim(div.html()));
            li.append(trimmedDiv.hide());
            trimmedDiv.slideDown(200);
        }

        li.toggleClass(expandedClass);
    }

    private async onRollAbilityCheck(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        await this.actor.rollAbility(ev.currentTarget.parentElement.dataset.ability);
    }

    private async onRollDefenseCheck(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        await this.actor.rollDefense(ev.currentTarget.parentElement.dataset.defense);
    }

    private async onRollSkillCheck(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        const container = ev.currentTarget.parentElement;
        const skill = container.dataset.skill;
        const subskill = container.dataset.subskill;

        await this.actor.rollSkill(skill, subskill);
    }

    private async onMaxPointsOverrideToggle(ev: JQuery.ClickEvent): Promise<void> {
        ev.preventDefault();
        await this.actor.setFlag('mnm3e', 'overrideMaxPoints', !this.actor.getFlag('mnm3e', 'overrideMaxPoints'));
    }
}