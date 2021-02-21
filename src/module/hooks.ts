import Item3e from './item/entity';

Hooks.on('renderChatLog', (app: any, html: JQuery<HTMLElement>, data: any) => Item3e.activateChatListeners(html));
Hooks.on('renderChatPopout', (app: any, html: JQuery<HTMLElement>, data: any) => Item3e.activateChatListeners(html));