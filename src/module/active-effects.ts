export const onManagedActiveEffect = (event: JQuery.ClickEvent, owner: any): ActiveEffect | undefined => {
    event.preventDefault();
    const target = event.currentTarget as any;
    const listElement = target.closest('li');
    const effect = listElement.dataset.effectId ? owner.effects.get(listElement.dataset.effectId) : null;
    switch(target.dataset.action) {
        case 'create':
            return ActiveEffect.create({
                label: game.i18n.localize('MNM3E.ActiveEffectNew'),
                icon: 'icons/svg/aura.svg', // TODO: Give path to svg
                origin: owner.uuid,
                'duration.rounds': listElement.dataset.effectType === 'temporary' ? 1 : undefined,
                disabled: listElement.dataset.effectType === 'inactive',
            }, owner).create();
        case 'edit':
            return effect.sheet.render(true);
        case 'delete':
            return effect.delete();
        case 'toggle':
            return effect.update({disabled: !effect.data.disabled});
    }
}

export const prepareActiveEffectCategories = (activeEffects: ActiveEffect[]): ActiveEffectCategories => {
    const categories: ActiveEffectCategories = {
        temporary: {
            type: 'temporary',
            label: game.i18n.localize('MNM3E.ActiveEffectTemporary'),
            effects: [],
        },
        passive: {
            type: 'passive',
            label: game.i18n.localize('MNM3E.ActiveEffectPassive'),
            effects: [],
        },
        inactive: {
            type: 'inactive',
            label: game.i18n.localize('MNM3E.ActiveEffectInactive'),
            effects: [],
        },
    };

    activeEffects.forEach(e => {
        e._getSourceName();
        let targetEffect = categories.passive.effects;
        if (e.data.disabled) {
            targetEffect = categories.inactive.effects;
        } else if (e.isTemporary) {
            targetEffect = categories.temporary.effects;
        }

        targetEffect.push(e);
    });

    return categories;
}