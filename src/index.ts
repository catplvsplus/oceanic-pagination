import { ReactionPaginationBuilder, ReactionPaginationOptions } from './classes/ReactionPaginationBuilder';
import { ButtonPaginationBuilder, ButtonPaginationOptions } from './classes/ButtonPaginationBuilder';
import { InteractionPaginationSendOptions, MessagePaginationSendOptions } from './types/send';

export * from './classes/BasePaginationBuilder';
export * from './classes/ButtonPaginationBuilder';
export * from './classes/ReactionPaginationBuilder';
export * from './types/actionRow';
export * from './types/buttons';
export * from './types/enums';
export * from './types/interactions';
export * from './types/page';
export * from './types/reactions';
export * from './types/send';

export function sendButtonPagination(options: (InteractionPaginationSendOptions|MessagePaginationSendOptions) & ButtonPaginationOptions): Promise<ButtonPaginationBuilder<true>> {
    const pagination = new ButtonPaginationBuilder(options);
    return pagination.send(options);
}

export function sendReactionPagination(options: (InteractionPaginationSendOptions|MessagePaginationSendOptions) & ReactionPaginationOptions): Promise<ReactionPaginationBuilder<true>> {
    const pagination = new ReactionPaginationBuilder(options);
    return pagination.send(options);
}