import ActorSheet3e from './base';
import Actor3e from '../entity'

interface ExtendedCharacterSheetData extends ActorSheet.Data<CharacterData> {
    powers: Item<PowerData>[];
    advantages: Item<AdvantageData>[];
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

    /**
     * @override
     */
    protected prepareItems(incomingData: ActorSheet.Data<CharacterData>) {
        const data = incomingData as ExtendedCharacterSheetData;
        const powers: Item<PowerData>[] = [];
        const advantages: Item<AdvantageData>[] = [];
        data.items.reduce((arr, item) => {
            let targetArray;
            switch (item.type) {
                case 'power':
                    targetArray = arr[0];
                    break;
                case 'advantage':
                    targetArray = arr[1];
                    break;
            }
            if (!targetArray) {
                return arr;
            }
            targetArray.push(item as any);
            return arr;
        }, [powers, advantages]);

        data.powers = powers;
        data.advantages = advantages;
    }
}