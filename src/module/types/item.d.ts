declare type SummaryPosition = 'prefix' | 'suffix';

declare interface SummaryData {
    format: string;
    position: SummaryPosition;

    // Prepared Data
    parsed?: string;
    data?: any;
}

declare interface ItemSummary {
    summary: SummaryData;
}

declare interface ItemDescription {
    description: {
        value: string;
        chat: string;
    };
}

declare interface OverrideValue<T> {
    value: T;

    // Prepared Data
    override: boolean;
    originalValue?: T;
    overrideRank?: number;
}

declare interface OverrideArray<T> {
    value: T[];

    // Prepared Data
    override: boolean;
    numOverrides?: number;
    overrideRanks?: number[];
}

declare interface TargetScore {
    type: OverrideValue<string>;

    // Only valid when type is custom
    custom: OverrideValue<string>;

    // Prepared Data
    label: string;
}

declare interface Formula {
    op: string;
    value: string;
    dataPath: string;
}

declare type RollType = 'none' | 'required';

declare interface RollDetails {
    formula: OverrideArray<Formula>;
    targetScore: TargetScore;
    rollType: OverrideValue<RollType>;
}

declare interface EffectDuration {
    type: OverrideValue<string>;
}

declare type RangeMultiplier = 'positive' | 'negative';

declare interface EffectRange {
    type: OverrideValue<string>;
    area: OverrideValue<string?>;
    multiplier: OverrideValue<RangeMultiplier?>;
}

declare interface EffectUses {
    max: OverrideValue<number>;
    
    // Prepared data
    remaining?: number
}

declare interface EffectActivation {
    check: RollDetails;
    duration: EffectDuration;
    range: EffectRange;
    uses: EffectUses;
    type: OverrideValue<string>;
}

declare interface ItemActivatedEffect {
    activation: EffectActivation;
}

declare interface ActionTargetedRoll {
    attack: RollDetails;
    resist: RollDetails;
}

declare interface ActionData {
    roll: ActionTargetedRoll;
    type: OverrideValue<string>
}

declare interface ItemAction {
    action: ActionData;
}

declare type RankCostType = 'flat' | 'perRank' | 'discount';

declare interface ItemCost {
    value: number;
    type: RankCostType;
    discountPer: number;
}

declare interface ItemScalingEffect {
    rank: number;
    cost: ItemCost;
}

declare interface Expression {
    key: string;
    formula: string;
}

declare interface AdvantageData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
}

declare interface PowerEffectData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    modifiers: Item.Data<ModifierData>[];
}

declare interface ModifierData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    expressions: Expression[];
}

declare interface PowerData extends ItemDescription {
    effects: Item.Data<PowerEffectData>[];
    powerArray: Item.Data<PowerData>[];
    descriptor: string;

    // Prepared data
    totalCost?: number;
    summary?: string;
}

declare interface EquipmentData extends ItemDescription {
    effects: Item.Data<PowerEffectData>[];
    descriptor: string;

    // Prepared data
    totalCost?: number;
    summary?: string;
}

declare interface FoundryItemSheetData<T = any> extends Omit<ItemSheet.Data<T>, 'data'> {
    data: T;
    effects: ActiveEffectCategories;
}

declare interface ItemListSections {
    headers: string[];
    rows: (string | number)[][];
}