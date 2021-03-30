/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system
 */

// Import TypeScript modules
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import Actor3e from './module/actor/entity';
import ActorSheet3eCharacter from './module/actor/sheets/character';
import ActorSheet3eNPC from './module/actor/sheets/npc';
import Item3e from './module/item/entity';
import ItemSheet3eAdvantage from './module/item/sheets/advantage';
import ItemSheet3ePower from './module/item/sheets/power';
import ItemSheet3eEffect from './module/item/sheets/effect';
import ItemSheet3eEquipment from './module/item/sheets/equipment';
import ItemSheet3eModifier from './module/item/sheets/modifier';
import { MNM3E } from './module/config';
import SummaryBuilder from './module/apps/summary-builder';
import ScoreConfig from './module/apps/score-config';
import PowerEffectTemplate from './module/pixi/power-effect-template';
import './module/hooks';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
    console.log('MnM3e | Initializing Mutants and Masterminds 3rd Edition Game System');

    game.mnm3e = {
        applications: {
            SummaryBuilder,
            ScoreConfig,
        },
        canvas: {
            PowerEffectTemplate,
        },
    };

    CONFIG.MNM3E = MNM3E;
    CONFIG.Actor.entityClass = Actor3e as typeof Actor;
    CONFIG.Item.entityClass = Item3e as typeof Item;
    (CONFIG.Combat as any).initiative.formula = '1d20 + @attributes.initiative';

    // Assign custom classes and constants here
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('mnm3e', ActorSheet3eCharacter, {
        types: ['character'],
        makeDefault: true,
        label: 'MNM3E.SheetClassCharacter',
    });
    Actors.registerSheet('mnm3e', ActorSheet3eNPC, {
        types: ['npc'],
        makeDefault: true,
        label: 'MNM3E.SheetClassNPC',
    });

    Items.unregisterSheet('core', Item3e);
    Items.registerSheet('mnm3e', ItemSheet3eAdvantage, {
        types: ['advantage'],
        makeDefault: true,
        label: 'MNM3E.SheetClassItem',
    });
    Items.registerSheet('mnm3e', ItemSheet3ePower, {
        types: ['power'],
        makeDefault: true,
        label: 'MNM3E.SheetClassItem',
    });
    Items.registerSheet('mnm3e', ItemSheet3eEquipment, {
        types: ['equipment'],
        makeDefault: true,
        label: 'MNM3E.SheetClassItem',
    });
    Items.registerSheet('mnm3e', ItemSheet3eEffect, {
        types: ['effect'],
        makeDefault: true,
        label: 'MNM3E.SheetClassItem',
    });
    Items.registerSheet('mnm3e', ItemSheet3eModifier, {
        types: ['modifier'],
        makeDefault: true,
        label: 'MNM3E.SheetClassItem',
    });
    
    // Register custom system settings
    registerSettings();
    
    // Preload Handlebars templates
    await preloadTemplates();

    // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
    // Do anything after initialization but before
    // ready

    const toLocalize = [
        'abilities',
        'abilityAbbreviations',
        'actionTypes',
        'activationTypes',
        'areaTypes',
        'defenses',
        'defenseAbbreviations',
        'durationTypes',
        'measurements.mass',
        'measurements.time',
        'measurements.distance',
        'measurements.volume',
        'movement',
        'rangeTypes',
        'rankCostTypes',
        'rollTypes',
        'skills',
        'summaryPositions',
    ];

    toLocalize.forEach(o => {
        const localized = Object.entries(getProperty(CONFIG.MNM3E, o)).map(
            ([name, identifier]) => [name, game.i18n.localize(identifier as string)]
        );

        setProperty(CONFIG.MNM3E, o, localized.reduce((obj: any, e: string[]) => {
            obj[e[0]] = e[1];
            return obj;
        }, {}));
    });

    Handlebars.registerHelper({
        inArr: (v1, ...vn) => vn.includes(v1),
        inObj: (v1, ...vn) => {
            const keys = Object.keys(v1);
            return vn.map(s => keys.includes(s)).reduce((prev, curr) => prev && curr);
        },
        emptyObj: v1 => jQuery.isEmptyObject(v1),
        not: v1 => !v1,
        isArr: v1 => Array.isArray(v1),
        getProp: getProperty,
        titleCase: v1 => v1.titleCase(),
    });

    CONFIG.statusEffects = [
        {
            id: 'compelled',
            label: 'EFFECT.StatusCompelled',
            icon: 'systems/mnm3e/assets/icons/svg/compelled.svg'
        },
        {
            id: 'controlled',
            label: 'EFFECT.StatusControlled',
            icon: 'systems/mnm3e/assets/icons/svg/controlled.svg'
        },
        {
            id: 'dazed',
            label: 'EFFECT.StatusDazed',
            icon: 'icons/svg/daze.svg'
        },
        {
            id: 'debilitated',
            label: 'EFFECT.StatusDebilitated',
            icon: 'systems/mnm3e/assets/icons/svg/debilitated.svg'
        },
        {
            id: 'defenseless',
            label: 'EFFECT.StatusDefenseless',
            icon: 'systems/mnm3e/assets/icons/svg/defenseless.svg'
        },
        {
            id: 'disabled',
            label: 'EFFECT.StatusDisabled',
            icon: 'systems/mnm3e/assets/icons/svg/disabled.svg'
        },
        {
            id: 'fatigued',
            label: 'EFFECT.StatusFatigued',
            icon: 'systems/mnm3e/assets/icons/svg/fatigued.svg'
        },
        {
            id: 'hindered',
            label: 'EFFECT.StatusHindered',
            icon: 'systems/mnm3e/assets/icons/svg/hindered.svg'
        },
        {
            id: 'immobile',
            label: 'EFFECT.StatusImmobile',
            icon: 'systems/mnm3e/assets/icons/svg/immobile.svg'
        },
        {
            id: 'impaired',
            label: 'EFFECT.StatusImpaired',
            icon: 'icons/svg/net.svg'
        },
        {
            id: 'stunned',
            label: 'EFFECT.StatusStunned',
            icon: 'icons/svg/stoned.svg'
        },
        {
            id: 'transformed',
            label: 'EFFECT.StatusTransformed',
            icon: 'systems/mnm3e/assets/icons/svg/transformed.svg'
        },
        {
            id: 'unaware',
            label: 'EFFECT.StatusUnaware',
            icon: 'icons/svg/unconscious.svg'
        },
        {
            id: 'vulnerable',
            label: 'EFFECT.StatusVulnerable',
            icon: 'systems/mnm3e/assets/icons/svg/vulnerable.svg'
        },
        {
            id: 'weakened',
            label: 'EFFECT.StatusWeakened',
            icon: 'icons/svg/degen.svg'
        },

        // Combined conditions
        {
            id: 'asleep',
            label: 'EFFECT.StatusAsleep',
            icon: 'icons/svg/sleep.svg'
        },
        {
            id: 'blind',
            label: 'EFFECT.StatusBlind',
            icon: 'icons/svg/blind.svg'
        },
        {
            id: 'bound',
            label: 'EFFECT.StatusBound',
            icon: 'systems/mnm3e/assets/icons/svg/handcuffed.svg'
        },
        {
            id: 'deaf',
            label: 'EFFECT.StatusDeaf',
            icon: 'icons/svg/deaf.svg'
        },
        {
            id: 'dying',
            label: 'EFFECT.StatusDying',
            icon: 'systems/mnm3e/assets/icons/svg/dying.svg'
        },
        {
            id: 'entranced',
            label: 'EFFECT.StatusEntranced',
            icon: 'systems/mnm3e/assets/icons/svg/entranced.svg'
        },
        {
            id: 'exhausted',
            label: 'EFFECT.StatusExhausted',
            icon: 'systems/mnm3e/assets/icons/svg/exhausted.svg'
        },
        {
            id: 'incapacitated',
            label: 'EFFECT.StatusIncapacitated',
            icon: 'icons/svg/unconscious.svg'
        },
        {
            id: 'paralyzed',
            label: 'EFFECT.StatusParalyzed',
            icon: 'icons/svg/paralysis.svg'
        },
        {
            id: 'prone',
            label: 'EFFECT.StatusProne',
            icon: 'systems/mnm3e/assets/icons/svg/prone.svg'
        },
        {
            id: 'restrained',
            label: 'EFFECT.StatusRestrained',
            icon: 'systems/mnm3e/assets/icons/svg/restrained.svg'
        },
        {
            id: 'staggered',
            label: 'EFFECT.StatusStaggered',
            icon: 'systems/mnm3e/assets/icons/svg/staggered.svg'
        },
        {
            id: 'surprised',
            label: 'EFFECT.StatusSurprised',
            icon: 'systems/mnm3e/assets/icons/svg/surprised.svg'
        },
    ];
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
    // Do anything once the system is ready
});

// Add any additional hooks if necessary
