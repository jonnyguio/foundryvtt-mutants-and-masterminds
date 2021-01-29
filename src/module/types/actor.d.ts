declare interface Ability {
    rank: number;

    // Prepared Data
    total?: number;

    // Prepared Sheet Data
    label?: string;
}

declare interface Defense {
    rank: number;
    ability: string;

    // Prepared Data
    total?: number;

    // Prepared Sheet Data
    label?: string;
}

declare interface Skill {
    rank: number;
    ability: string;
    trainedOnly: boolean;
    actions: string[];

    // Prepared Data
    isTrained?: boolean;
    total?: number;

    // Prepared Sheet Data
    label?: string;
}

declare type Abilities = {
    str: Ability;
    sta: Ability;
    agl: Ability;
    dex: Ability;
    fgt: Ability;
    int: Ability;
    awe: Ability;
    pre: Ability;
} & {[abilityAbbrev: string]: Ability};

declare type Defenses = {
    dge: Defense;
    pry: Defense;
    frt: Defense;
    tgh: Defense;
    wil: Defense;
} & {[defenseAbbrev: string]: Defense};

declare type Skills = {
    acr: Skill;
    ath: Skill;
    cco: Skill;
    dec: Skill;
    exp: Skill; // TODO: maybe handle differently
    ins: Skill;
    itm: Skill;
    inv: Skill;
    prc: Skill;
    per: Skill;
    rco: Skill;
    slt: Skill;
    ste: Skill;
    tec: Skill;
    tre: Skill;
    vhc: Skill;
} & {[skillAbbrev: string]: Skill};

declare interface CommonActorData {
    abilities: Abilities;
    defenses: Defenses;
    skills: Skills;
    powerLevel: number;
    initiative: number;
    groupAffiliation: string;
}

declare interface CreatureData {
    skills: Skills;
}

declare interface CharacterData extends CommonActorData, CreatureData {
    identity: string;
    baseOfOperations: string;
    heroPoints: number;

    // Prepared Data
    powers: Item.Data<PowerData>;
}

declare interface NPCData extends CommonActorData, CreatureData {

}

declare interface FoundryActorSheetData<T = any> extends ActorSheet.Data<T> {
    // Use ActiveEffects when needed
}