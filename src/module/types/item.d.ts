declare type SummaryPosition = 'prefix' | 'postfix';

declare interface ItemSummary {
    summary: {
        format: string;
        position: SummaryPosition;

        // Prepared Data
        parsed?: string;
    };
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
}

declare interface TargetScore {
    type: OverrideValue<string>

    // Only valid when type is custom
    custom: OverrideValue<string>
}

declare interface Formula {
    op: string;
    value: string;
}

declare interface RollDetails {
    formula: OverrideArray<Formula>
    targetScore: TargetScore;
}

declare interface EffectDuration {
    type: OverrideValue<string>;
}

declare interface EffectRange {
    type: OverrideValue<string>;
    area: OverrideValue<string?>;
}

declare interface EffectUses {
    amount: OverrideValue<number>;
    max: OverrideValue<number>;
    per?: OverrideValue<string>;
}

declare interface EffectConsume {
    type: OverrideValue<string>;
    target: OverrideValue<string?>;
    amount: OverrideValue<number?>;
}

declare interface EffectActivation {
    check: RollDetails;
    consume: EffectConsume;
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

declare interface AdvantageData extends ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
}

declare interface PowerEffectData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    modifiers: Item.Data<ModifierData>[];
}

declare interface ModifierData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    expressions: Expression[];
}

declare interface PowerData extends ItemDescription {
    effects: Item.Data<PowerEffectData>[];
    alternatePowerIDs: string[];

    // Prepared data
    totalCost?: number;
    summary?: string;
    alternatePowers?: Item.Data<PowerData>[];
}

declare interface FoundryItemSheetData<T = any> extends Omit<ItemSheet.Data<T>, 'data'> {
    data: T;
    effects: ActiveEffectCategories;
}