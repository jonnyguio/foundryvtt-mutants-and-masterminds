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
    override: boolean;
}

declare interface EffectActivation {
    type: OverrideValue<string>;
    cost: number;
    condition: string;
}

declare interface EffectDuration {
    type: OverrideValue<string>;
}

declare interface EffectRange {
    type: OverrideValue<string>;
    area: OverrideValue<string?>;
}

declare interface EffectUses {
    value: number;
    max: number;
    per?: string;
}

declare interface EffectConsume {
    type: OverrideValue<string>;
    target: OverrideValue<string?>;
    amount: OverrideValue<number?>;
}

declare interface ItemActivatedEffect {
    activation: EffectActivation;
    duration: EffectDuration;
    range: EffectRange;
    uses: EffectUses;
    consume: EffectConsume;
}

declare interface ActionAttack {
    bonus: OverrideValue<number>;
    defense: OverrideValue<string?>
}

declare interface ActionResist {
    baseDC: OverrideValue<number?>
    defense: OverrideValue<string?>
}

declare interface ItemAction {
    ability: OverrideValue<string?>;
    attack: ActionAttack;
    chatFlavor: string;
    resist: ActionResist;
    type: OverrideValue<string>;
}

declare type RankCostType = 'flat' | 'perRank' | 'discount';

declare interface ItemCost {
    value: number;
    type: RankCostType;
    discountPer: number;
}

declare interface ItemScalingEffect {
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
    rank: number;
}

declare interface ModifierData extends ItemSummary, ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    parentEffect: string;
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