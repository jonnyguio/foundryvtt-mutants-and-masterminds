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
                this.prepareModifierData((this.data as unknown) as Item.Data<ModifierData>);
                break;
            case 'effect':
                this.preparePowerEffectData((this.data as unknown) as Item.Data<PowerEffectData>);
                break;
            case 'power':
                this.preparePowerData((this.data as unknown) as Item.Data<PowerData>);
                break;
        }
    }

    private prepareModifierData(data: Item.Data<ModifierData>): void {
        if (!Array.isArray(data.data.expressions)) {
            data.data.expressions = Object.values(data.data.expressions).map(e => e) as Expression[];
        }

        if (data.data.summary.format == '') {
            data.data.summary.format = data.name;
        }
    }

    private preparePowerEffectData(data: Item.Data<PowerEffectData>): void {
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
        });

        if (data.data.summary.format == '') {
            data.data.summary.format = `$before ${data.name} $rank $after`;
        }
    }

    private preparePowerData(data: Item.Data<PowerData>): void {
        let totalPowerCost = 0;
        const deferredCosts: { modifier: number; discountPer: number; }[] = [];

        data.data.effects.forEach(effect => {
            let perRankCost = 0;
            let flatCost = 0;

            const evaluateCostType = (costType: RankCostType, cost: number, discountPer?: number) => {
                switch (costType) {
                    case 'flat':
                        flatCost += cost;
                        break;
                    case 'perRank':
                        perRankCost += cost;
                        break;
                    case 'discount':
                        deferredCosts.push({ modifier: cost, discountPer: !discountPer || discountPer < 1 ? 1 : discountPer });
                        break;
                }
            };

            evaluateCostType(effect.data.cost.type, effect.data.cost.value, effect.data.cost.discountPer);
            effect.data.modifiers.forEach(modifier => evaluateCostType(
                modifier.data.cost.type,
                modifier.data.cost.value,
                modifier.data.cost.discountPer
            ));

            totalPowerCost = totalPowerCost + (perRankCost * effect.data.rank) + flatCost;
        });

        deferredCosts.forEach(dc => {
            const quotient = totalPowerCost / dc.discountPer;
            totalPowerCost += quotient * dc.modifier;
        });

        data.data.totalCost = totalPowerCost;
        data.data.alternatePowers = data.data.alternatePowerIDs.map(id => game.items.get(id).data) as Item.Data<PowerData>[];
    }
}