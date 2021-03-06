import ActorSheet3e, { ExtendedActorSheetData } from './base';
import Actor3e from '../entity';

interface ExtendedNPCSheetData extends ExtendedActorSheetData<NPCData> {
}

export default class ActorSheet3eNPC extends ActorSheet3e<NPCData, Actor3e<NPCData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('npc');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/actors/npc-sheet.html',
            width: 700,
            height: 500,
        });
    }

    /**
     * @override
     */
    public getData(): ActorSheet.Data<NPCData> {
        const sheetData = super.getData() as ExtendedNPCSheetData;

        return sheetData;
    }
}