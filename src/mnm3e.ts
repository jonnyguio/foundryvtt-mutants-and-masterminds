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
import Item3e from './module/item/entity';
import ItemSheet3eAdvantage from './module/item/sheets/advantage';
import ItemSheet3ePower from './module/item/sheets/power';
import ItemSheet3eEffect from './module/item/sheets/effect';
import ItemSheet3eModifier from './module/item/sheets/modifier';
import { MNM3E } from './module/config';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
    console.log('MnM3e | Initializing Mutants and Masterminds 3rd Edition Game System');

    game.mnm3e = {};

    CONFIG.MNM3E = MNM3E;
    CONFIG.Actor.entityClass = Actor3e as typeof Actor;
    CONFIG.Item.entityClass = Item3e as typeof Item;

    // Assign custom classes and constants here
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('mnm3e', ActorSheet3eCharacter, {
        types: ['character'],
        makeDefault: true,
        label: 'MNM3E.SheetClassCharacter',
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
        'defenses',
        'actionTypes',
        'rangeTypes',
        'rankCostTypes',
        'skills',
    ];

    toLocalize.forEach(o => {
        const localized = Object.entries(CONFIG.MNM3E[o]).map(
            ([name, identifier]) => [name, game.i18n.localize(identifier as string)]
        );

        CONFIG.MNM3E[o] = localized.reduce((obj: any, e: string[]) => {
            obj[e[0]] = e[1];
            return obj;
        }, {});
    })
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
    // Do anything once the system is ready
});

// Add any additional hooks if necessary
