export const registerSettings = function() {
    // Register any custom system settings here
    game.settings.register('mnm3e', 'enableDegreeCalculator', {
        name: game.i18n.localize('MNM3E.OptionEnableDegreeCalculator'),
        hint: game.i18n.localize('MNM3E.OptionEnableDegreeCalculatorHint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
    });
}
