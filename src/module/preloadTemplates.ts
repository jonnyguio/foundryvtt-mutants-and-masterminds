export const preloadTemplates = async function() {
    const templatePaths: string[] = [
        // Add paths to "systems/foundryvtt-mutants-and-masterminds/templates"

        // Apps
        "system/mnm3e/templates/apps/summary-builder.html",

        // Actor
        "systems/mnm3e/templates/actors/parts/character-core.html",
        "systems/mnm3e/templates/actors/parts/character-powers.html",
        "systems/mnm3e/templates/actors/parts/actor-effects.html",

        // Item
        "systems/mnm3e/templates/items/parts/header-sheet.html",
        "systems/mnm3e/templates/items/parts/description-sheet.html",
        "systems/mnm3e/templates/items/parts/expressions-sheet.html",
        "systems/mnm3e/templates/items/parts/actions-sheet.html",
        "systems/mnm3e/templates/items/parts/activations-sheet.html",
        "systems/mnm3e/templates/items/parts/list-sheet.html",
        "systems/mnm3e/templates/items/parts/cost-sheet.html",
    ];

    return loadTemplates(templatePaths);
}
