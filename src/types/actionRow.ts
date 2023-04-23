import { MessageActionRow } from 'oceanic.js';

export function disableComponents(components: MessageActionRow[]): MessageActionRow[] {
    return components.map(actionRow => {
        actionRow.components = actionRow.components.map(i => ({ ...i, disabled: true }));
        return actionRow;
    });
}