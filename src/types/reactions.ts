import { Emoji, PartialEmoji } from 'oceanic.js';
import { PaginationControllerType, getEnumValue } from './enums';
import { ReactionCollectorOptions } from 'oceanic-collector';

export type ReactionPaginationCollectorOptions = Omit<ReactionCollectorOptions, 'time'|'client'|'message'>;

export interface ReactionPaginationReactionController {
    id: string|null;
    name: string;
    type: PaginationControllerType;
}

export interface ReactionPaginationReactionControllerResolvable {
    emoji: PartialEmoji|string;
    type: (keyof typeof PaginationControllerType)|PaginationControllerType;
}

export enum ReactionPaginationOnEnd {
    Ignore = 1,
    ClearAllReactions,
    ClearPaginationReactions,
    DeletePagination
}

export function stringifyEmoji(emoji: Emoji|string): string {
    return typeof emoji === 'string'
        ? emoji
        : emoji.id === null
            ? emoji.name
            : `${emoji.name}:${emoji.id}`;
}

export function parseEmoji(text: string): PartialEmoji {
    if (text.includes('%')) text = decodeURIComponent(text);
    if (!text.includes(':')) return { animated: false, name: text, id: null };

    const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
    if (!match) throw new Error('Invalid emoji string');

    return { animated: Boolean(match[1]), name: match[2], id: match[3] };
}

export function resolveReactionController(reaction: ReactionPaginationReactionControllerResolvable|ReactionPaginationReactionController): ReactionPaginationReactionController {
    if ((reaction as ReactionPaginationReactionController).id !== undefined || (reaction as ReactionPaginationReactionController).name !== undefined) return reaction as ReactionPaginationReactionController;

    const reactionEmoji = (reaction as ReactionPaginationReactionControllerResolvable).emoji;
    const parsedEmoji = typeof reactionEmoji === 'string' ? parseEmoji(reactionEmoji) : reactionEmoji;

    if (!parsedEmoji?.id && !parsedEmoji?.name || !parsedEmoji?.name || parsedEmoji.animated && !parsedEmoji.id) throw new Error(`Couldn't parse emoji`);

    return {
        id: parsedEmoji.id ?? null,
        name: parsedEmoji.name,
        type: getEnumValue(PaginationControllerType, reaction.type)
    };
}