declare interface ItemDescription {
    value: string;
    chat: string;
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

declare interface ItemScalingEffect {
    cost: number;
    costType: string;
}

declare interface Expression {
    key: string;
    formula: string;
}

declare interface AdvantageData extends ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {

}

declare interface PowerEffectData extends ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    modifiers: ItemData<ModifierData>[];
}

declare interface ModifierData extends ItemDescription, ItemActivatedEffect, ItemAction, ItemScalingEffect {
    parentEffect: string;
    expressions: Expression[];
}

declare interface PowerData extends ItemDescription {
    totalCost: number;
    effects: ItemData<PowerEffectData>[];
    alternatePowerIDs: string[];
    alternatePowers?: ItemData<PowerData>[];
}

declare interface FoundryItemSheetData<T = any> extends Omit<ItemSheetData<T>, 'data'> {
    data: T;
    effects: ActiveEffectCategories;
}

declare interface ParentData {
    key: string;
    item: Item;
    itemTag: string;
}