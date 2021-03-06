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

    // Prepared Data
    total?: number;

    // Only valid on dynamic types
    displayName: string;
}

declare type SkillType = 'static' | 'dynamic';

declare interface SkillDetail {
    type: SkillType;
    ability: string;
    trainedOnly: boolean;
    actions: string[];
    data: Skill & {[skillName: string]: Skill};

    // Prepared Data
    isTrained?: boolean;

    // Only valid on dynamic types
    base: number;

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
    acr: SkillDetail;
    ath: SkillDetail;
    cco: SkillDetail;
    dec: SkillDetail;
    exp: SkillDetail;
    ins: SkillDetail;
    itm: SkillDetail;
    inv: SkillDetail;
    prc: SkillDetail;
    per: SkillDetail;
    rco: SkillDetail;
    slt: SkillDetail;
    ste: SkillDetail;
    tec: SkillDetail;
    tre: SkillDetail;
    vhc: SkillDetail;
} & {[skillAbbrev: string]: SkillDetail};

declare interface Movement {
    burrowing: number;
    flight: number;
    leaping: number;
    speed: number;
    swim: number;
    teleport: number;
}

declare interface Attributes {
    initiative: number;
    powerLevel: number;
    penaltyPoints: number;
    movement: Movement;
}

declare interface ActorInfo {
    groupAffiliation: string;
    identity: string;
    baseOfOperations: string;
}

declare interface LabeledNumber {
    value: number;
    label: string;
    cssClass?: string;
}

declare interface PointCosts {
    abilities: LabeledNumber;
    powers: LabeledNumber;
    advantages: LabeledNumber;
    skills: LabeledNumber;
    defenses: LabeledNumber;
    total: LabeledNumber;
}

declare interface CommonActorData {
    abilities: Abilities;
    defenses: Defenses;
    skills: Skills;
    attributes: Attributes;
    info: ActorInfo;

    // Prepared Data
    pointCosts: PointCosts;
    equipmentCost: number;
    maxPoints: number;
}

declare interface CreatureData {
    skills: Skills;
}

declare interface CharacterData extends CommonActorData, CreatureData {
    victoryPoints: number;
    earnedCharacterPoints: number;
}

declare interface NPCData extends CommonActorData, CreatureData {

}

declare interface FoundryActorSheetData<T = any> extends ActorSheet.Data<T> {
    effects: ActiveEffectCategories;
}