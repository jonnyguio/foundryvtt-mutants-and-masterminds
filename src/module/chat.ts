export const displayCard = async (cardType: CardType, speaker: Speaker, templateData: object, { rollMode, flags }: { rollMode?: string, flags?: object } = {}): Promise<ChatMessage | object | void> => {
    const html = await renderTemplate(`systems/mnm3e/templates/chat/${cardType}-card.html`, templateData);
    const chatFlags = {
        'core.canPopout': true,
        ...Object.assign({}, flags),
    };
    const chatData = {
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: html,
        speaker,
        sound: CONFIG.sounds.dice,
        flags: chatFlags,
    };

    (ChatMessage as any).applyRollMode(chatData, rollMode || game.settings.get('core', 'rollMode'));

    return ChatMessage.create(chatData);
}