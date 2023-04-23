import { GuildComponentButtonInteraction, PrivateComponentButtonInteraction, TextButton } from 'oceanic.js';
import { PaginationControllerType } from './enums';
import { Awaitable } from 'fallout-utility';
import { InteractionCollectorOptions } from 'oceanic-collector';

export type ButtonInteraction = GuildComponentButtonInteraction|PrivateComponentButtonInteraction;
export type ButtonPaginationCollectorOptions = Omit<InteractionCollectorOptions, 'time'|'client'> & { filter?: (interaction: ButtonInteraction) => Awaitable<boolean>; };

export enum ButtonPaginationOnEnd {
    Ignore = 1,
    RemoveComponents,
    DisableComponents,
    DeletePagination
}

export interface ButtonPaginationController {
    button: TextButton;
    type: PaginationControllerType;
}

export interface ButtonPaginationControllerResolavable{
    button: TextButton;
    type: (keyof typeof PaginationControllerType)|PaginationControllerType;
}