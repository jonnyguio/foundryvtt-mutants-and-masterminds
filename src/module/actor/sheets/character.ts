import ActorSheet3e, { ExtendedActorSheetData } from './base';
import Actor3e from '../entity';

interface FavoriteItem {
    label: string;
    items: Item.Data[];
    type: string;
}

interface ExtendedCharacterSheetData extends ExtendedActorSheetData<CharacterData> {
    favoritePowers: Item.Data<PowerData>[];
    favoriteAdvantages: Item.Data<AdvantageData>[];

    favoriteEquipment: Item.Data<EquipmentData>[];
    favorites: FavoriteItem[];
}

export default class ActorSheet3eCharacter extends ActorSheet3e<CharacterData, Actor3e<CharacterData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('character');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/actors/character-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(): ActorSheet.Data<CharacterData> {
        const sheetData = super.getData() as ExtendedCharacterSheetData;

        return sheetData;
    }

    /**
     * @override
     */
    protected prepareItems(incomingData: ActorSheet.Data<CharacterData>): void {
        super.prepareItems(incomingData);
        const data = incomingData as ExtendedCharacterSheetData;
    
        const isFavorite = (item: any) => item.flags.mnm3e?.isFavorite;
        data.favoritePowers = data.powers.filter(isFavorite);
        data.favoriteAdvantages = data.advantages.filter(isFavorite);
        data.favoriteEquipment = data.equipment.filter(isFavorite);

        data.favorites = [
            {label: 'MNM3E.FavoritePowers', items: data.favoritePowers, type: 'power'},
            {label: 'MNM3E.FavoriteAdvantages', items: data.favoriteAdvantages, type: 'advantage'},
            {label: 'MNM3E.FavoriteEquipment', items: data.favoriteEquipment, type: 'equipment'},
        ];
    }
}