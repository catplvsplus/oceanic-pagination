import { Message } from 'oceanic.js';
import { SendAs } from './enums';
import { RepliableInteraction } from './interactions';

export interface InteractionPaginationSendOptions {
    command: RepliableInteraction;
    followUp?: string|boolean;
    sendAs: (keyof typeof SendAs)|SendAs;
}

export interface MessagePaginationSendOptions {
    command: Message;
    sendAs: (keyof typeof SendAs)|SendAs;
}