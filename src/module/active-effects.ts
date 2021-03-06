import Actor3e from "./actor/entity";

export class NamespacedActiveEffect extends ActiveEffectConfig {
    /**
     * @override
     */
    public activateListeners(html: JQuery<HTMLElement>): void {
        html.find('ol.changes-list .mode select').on('change', this.onModeChange.bind(this));
        super.activateListeners(html);
    }

    /**
     * @override
     */
    protected _injectHTML(html: JQuery<HTMLElement>, options: object = {}): void {
        super._injectHTML(html, options);
        this.updateNamespaceForm(html);
    }

    /**
     * @override
     */
    protected _replaceHTML(element: JQuery<HTMLElement>, html: JQuery<HTMLElement>, options: object = {}): void {
        super._replaceHTML(element, html, options);
        this.updateNamespaceForm(html);
    }

    private onModeChange(ev: JQuery.ChangeEvent): void {
        ev.preventDefault();
        this.handleNamespaceInputInjection($(ev.currentTarget));
    }

    private updateNamespaceForm(html: JQuery<HTMLElement>): void {
        const changesTab = html.find('section[data-tab="effects"]');
        const changesList = changesTab.find('ol.changes-list li');
        for (let i = 0; i < changesList.length; i++) {
            const changeElement = changesList.eq(i);
            const selectElement = changeElement.find('.mode select');
            this.handleNamespaceInputInjection(selectElement);
        }
    }

    private handleNamespaceInputInjection(selectElement: JQuery<HTMLElement>): void {
        const changeElement = $(selectElement.closest('.effect-change'));
        const effectIndex = changeElement.data('index');
        const effectFlagsKey = `changes.${effectIndex}.flags`
        let effectFlags = getProperty((this.object as any).data, effectFlagsKey);
        if (!effectFlags) {
            setProperty((this.object as any).data, effectFlagsKey, {});
            effectFlags = getProperty((this.object as any).data, effectFlagsKey);
        }
        const namespaceKey = `mnm3e.namespace`;
        if (!getProperty(effectFlags, namespaceKey)) {
            setProperty(effectFlags, namespaceKey, '');
        }

        const changeMode = changeElement.find('.mode');
        const namespaceElements = changeElement.find('.namespace');
        if (selectElement.val() == CONST.ACTIVE_EFFECT_MODES.CUSTOM && namespaceElements.length <= 0) {
            changeMode.after($(`
                    <div class="namespace">
                        <input type="text"
                            name="${effectFlagsKey}.${namespaceKey}"
                            value="${getProperty(effectFlags, namespaceKey)}"
                            placeholder="${game.i18n.localize('MNM3E.Namespace')}">
                        </input>
                    </div>
                `))
        } else if (namespaceElements.length > 0) {
            namespaceElements.remove();
        }
    }
}

export const onActiveEffect = (actor: Actor3e, change: ActiveEffectChange): boolean => {
    if (change.flags?.mnm3e?.namespace != 'mnm3e') {
        return true;
    }

    return false;
}

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
