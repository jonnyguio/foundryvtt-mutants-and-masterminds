import { evaluateExpression } from '../expressions';

export default class Item3e<T = any> extends Item<T> {
    /**
     * @override
     */
    public prepareData(): void {
        super.prepareData();
        this.prepareMNM3EData();
    }

    public prepareMNM3EData(): void {
        switch(this.type) {
            case 'modifier':
                this.prepareModifierData((this.data as unknown) as ItemData<ModifierData>);
                break;
            case 'effect':
                this.preparePowerEffectData((this.data as unknown) as ItemData<PowerEffectData>);
                break;
            case 'power':
                this.preparePowerData((this.data as unknown) as ItemData<PowerData>);
                break;
        }
    }

    private prepareModifierData(data: ItemData<ModifierData>): void {
        if (!Array.isArray(data.data.expressions)) {
            data.data.expressions = Object.values(data.data.expressions).map(e => e) as Expression[];
        }
    }

    private preparePowerEffectData(data: ItemData<PowerEffectData>): void {        
        const overrideValues = [
            'data.activation.type',
            'data.duration.type',
            'data.range.type',
            'data.range.area',
            'data.consume.type',
            'data.consume.target',
            'data.consume.amount',
            'data.ability',
            'data.attack.bonus',
            'data.attack.defense',
            'data.resist.baseDC',
            'data.resist.defense',
            'data.type',
        ];
        overrideValues.forEach(key => {
            if (getProperty(data, `${key}.override`)) {
                setProperty(data, key, {
                    override: false,
                    value: getProperty(data, `${key}.originalValue`),
                    originalValue: undefined,
                });
            }
        });
        
        data.data.modifiers.forEach(modifier => {
            overrideValues.forEach(key => {
                const value = getProperty(modifier, `${key}.value`);
                if (value) {
                    setProperty(data, key, {
                        override: true,
                        value,
                        originalValue: getProperty(data, `${key}.value`),
                    });
                }
            });
            // modifier.data.expressions.forEach(expression => {
            //     const result = evaluateExpression(data, expression);
            //     setProperty(data, expression.key, result);
            // });
        });
    }

    private preparePowerData(data: ItemData<PowerData>): void {
        data.data.alternatePowers = data.data.alternatePowerIDs.map(id => game.items.get(id).data) as ItemData<PowerData>[];
    }
}