export const preloadTemplates = async function() {
    const templatePaths: string[] = [
        // Add paths to "systems/foundryvtt-mutants-and-masterminds/templates"

        // Actor
        "systems/mnm3e/templates/actors/parts/character-core.html",
        "systems/mnm3e/templates/actors/parts/character-catalog.html",
        "systems/mnm3e/templates/actors/parts/actor-effects.html",

        // Apps
        "systems/mnm3e/templates/apps/summary-builder.html",
        "systems/mnm3e/templates/apps/score-config.html",

        // Chat
        "systems/mnm3e/templates/chat/effects-card.html",
        "systems/mnm3e/templates/chat/check-card.html",

        // Item
        "systems/mnm3e/templates/items/parts/header-sheet.html",
        "systems/mnm3e/templates/items/parts/description-sheet.html",
        "systems/mnm3e/templates/items/parts/expressions-sheet.html",
        "systems/mnm3e/templates/items/parts/actions-sheet.html",
        "systems/mnm3e/templates/items/parts/activations-sheet.html",
        "systems/mnm3e/templates/items/parts/list-sheet.html",
        "systems/mnm3e/templates/items/parts/list-item-sheet.html",
        "systems/mnm3e/templates/items/parts/cost-sheet.html",
    ];

    return loadTemplates(templatePaths);
}
