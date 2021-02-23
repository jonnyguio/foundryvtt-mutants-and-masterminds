import ActorSheet3e, { ExtendedActorSheetData } from './base';
import Actor3e from '../entity';

interface ExtendedCharacterSheetData extends ExtendedActorSheetData<CharacterData> {
    summary: {
        name: string;
        value: string;
        localizedKey: string;
    }[];
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
        sheetData.summary = [
            {
                name: 'data.identity',
                value: sheetData.data.identity,
                localizedKey: 'MNM3E.Identity',
            },
            {
                name: 'data.groupAffiliation',
                value: sheetData.data.groupAffiliation,
                localizedKey: 'MNM3E.GroupAffiliation',
            },
            {
                name: 'data.baseOfOperations',
                value: sheetData.data.baseOfOperations,
                localizedKey: 'MNM3E.BaseOfOperations',
            },
        ];

        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);
    }
}