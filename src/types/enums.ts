export function getEnumValue<Enum>(enum_: Enum, key: string|number): number {
    // @ts-expect-error Yeah
    return typeof key === 'string' ? enum_[key] : key;
}

export enum PaginationActionRows {
    PageActionRows = 1,
    AdditionalActionRows,
    ControllersActionRow
}

export enum PaginationControllerType {
    FirstPage = 1,
    PreviousPage,
    NextPage,
    LastPage,
    Stop
}

export enum SendAs {
    NewMessage = 1,
    EditMessage,
    ReplyMessage
}