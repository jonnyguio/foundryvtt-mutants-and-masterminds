import Item3e from './item/entity';
import { onActiveEffect } from './active-effects';
import { calculateDegrees } from './dice';

Hooks.on('applyActiveEffect', onActiveEffect);
Hooks.on('renderChatLog', (app: Application, html: JQuery<HTMLElement>, data: any): void => Item3e.activateChatListeners(html));
Hooks.on('renderChatPopout', (app: any, html: JQuery<HTMLElement>, data: any): void => Item3e.activateChatListeners(html));
Hooks.on('renderChatMessage', (app: Application, html: JQuery<HTMLElement>, data: any): void => {
    html.find('.initially-hidden').hide();
});

Hooks.on('renderSidebarTab', async (app: Application, html: JQuery<HTMLElement>, data: any) => {
    if (!game.settings.get('mnm3e', 'enableDegreeCalculator')) {
        return;
    }

    const template = 'systems/mnm3e/templates/apps/degree-calculator.html';
    const renderedTemplate = $(await renderTemplate(template, {}));
    const chatForm = html.find('#chat-form');
    chatForm.after(renderedTemplate);

    renderedTemplate.find('input').on('change', ev => {
        const rollInput = renderedTemplate.find('.roll');
        const dcInput = renderedTemplate.find('.dc');
        const degreesOutput = renderedTemplate.find('.degrees')

        const result = calculateDegrees(parseInt(dcInput.val() as string), parseInt(rollInput.val() as string));
        if (Number.isNaN(result.degrees)) {
            degreesOutput.text('');
            degreesOutput.attr('class', 'degrees no-input')
        } else {
            degreesOutput.text(Math.abs(result.degrees));
            degreesOutput.attr('class', `degrees ${result.cssClass}`);
        }
    });
});