import { Message, MessageActionRow, Uncached } from 'oceanic.js';
import { DynamicPageFunction, PageData, PageResolvable, PaginationComponentsOrder, resolvePage, resolveStaticPages } from '../types/page';
import { If, JSONEncodable, RestOrArray, TypedEmitter, isJSONEncodable, normalizeArray } from 'fallout-utility';
import { PaginationActionRows, SendAs, getEnumValue } from '../types/enums';
import { RepliableInteraction } from '../types/interactions';
import { disableComponents } from '../types/actionRow';

export interface BasePaginationOptions {
    pages: PageResolvable[];
    authorId: Uncached|string|null;
    authorDependent: boolean;
    endTimer: number|null;
    singlePageNoControllers: boolean;
    additionalActionRows: MessageActionRow[];
    componentsOrder: PaginationComponentsOrder;
    collectorOptions: unknown;
}

export interface BasePaginationEvents<Collected> {
    ready: [];
    pageChange: [page: PageData, index: number];
    collect: [collected: Collected];
    end: [reason: string];
    error: [error: unknown];
}

export abstract class BasePaginationBuilder<Collected, Events extends BasePaginationEvents<Collected> = BasePaginationEvents<Collected>, Sent extends boolean = boolean> extends TypedEmitter<Events> implements BasePaginationOptions {
    public pages: (PageData|DynamicPageFunction)[] = [];
    public authorDependent: boolean = true;
    public endTimer: number|null = null;
    public singlePageNoControllers: boolean = true;
    public additionalActionRows: MessageActionRow[] = [];
    public componentsOrder: PaginationComponentsOrder = [PaginationActionRows.ControllersActionRow, PaginationActionRows.PageActionRows, PaginationActionRows.AdditionalActionRows];
    public collectorOptions: unknown = {};

    protected _controllerActionRow: MessageActionRow|null = null;
    protected _currentPageIndex: number = 0;
    protected _command: Message|RepliableInteraction|null = null;
    protected _pagination: Message|null = null;
    protected _authorId: string|null = null;

    protected _componentsVisibility: 'DisableAll'|'RemoveAll'|'RemoveControllers'|null = null;

    get currentPageIndex() { return this._currentPageIndex; }
    get currentPage() { return this.getPage(this.currentPageIndex); }
    get previousPageIndex() { return this.currentPageIndex - 1 < 0 ? this.pages.length - 1 : this.currentPageIndex - 1; }
    get nextPageIndex() { return this.currentPageIndex + 1 >= this.pages.length ? 0 : this.currentPageIndex + 1; }
    get command() { return this._command as If<Sent, Message|RepliableInteraction>; }
    get pagination() { return this._pagination as If<Sent, Message>; }

    get authorId(): string|null {
        if (this._authorId) return this._authorId;

        return (this.command instanceof Message ? this.command.author.id : this.command?.user?.id) || null;
    }

    set authorId(authorId: string|null) { this._authorId = authorId; }

    constructor(options?: Partial<BasePaginationOptions>|JSONEncodable<BasePaginationOptions>) {
        super();

        options = isJSONEncodable<BasePaginationOptions>(options) ? options.toJSON() : options;

        if (options?.pages) this.setPages(options.pages);
        if (options?.authorId) this.setAuthorId(options.authorId);
        if (typeof options?.authorDependent === 'boolean') this.setAuthorDependent(options.authorDependent);
        if (options?.endTimer) this.setEndTimer(options.endTimer);
        if (typeof options?.singlePageNoControllers === 'boolean') this.setSinglePageNoControllers(options.singlePageNoControllers);
        if (options?.additionalActionRows) this.setAdditionalActionRows(options.additionalActionRows);
        if (options?.componentsOrder) this.setComponentsOrder(options.componentsOrder);
        if (options?.collectorOptions) this.setCollectorOptions(options.collectorOptions);
    }

    public addPages(...pages: RestOrArray<PageResolvable>): this {
        this.pages.push(...resolveStaticPages(normalizeArray(pages)));
        return this;
    }

    public setPages(...pages: RestOrArray<PageResolvable>): this {
        this.pages = resolveStaticPages(normalizeArray(pages));
        return this;
    }

    public setAuthorId(author?: Uncached|string|null): this {
        this.authorId = (typeof author === 'string' ? author : author?.id) || null;
        return this;
    }

    public setAuthorDependent(isAuthorDependent: boolean): this {
        this.authorDependent = !!isAuthorDependent;
        return this;
    }

    public setEndTimer(endTimerMs?: number|null): this {
        this.endTimer = endTimerMs ?? null;
        return this;
    }

    public setSinglePageNoControllers(isSinglePageNoControllers: boolean): this {
        this.singlePageNoControllers = !!isSinglePageNoControllers;
        return this;
    }

    public addAdditionalActionRows(...actionRows: RestOrArray<MessageActionRow>): this {
        this.additionalActionRows.push(...normalizeArray(actionRows));
        return this;
    }

    public setAdditionalActionRows(...actionRows: RestOrArray<MessageActionRow>): this {
        this.additionalActionRows = normalizeArray(actionRows);
        return this;
    }

    public setComponentsOrder(componentsOrder: PaginationComponentsOrder): this {
        this.componentsOrder = componentsOrder;
        return this;
    }

    public setCollectorOptions(collectorOptions: unknown): this {
        this.collectorOptions = collectorOptions;
        return this;
    }

    public async getPage(pageIndex: number): Promise<PageData & { ephemeral?: boolean; }|undefined> {
        const page = this.pages.find((p, i) => i === pageIndex);
        const pageData = page ? await resolvePage(page) : undefined;

        if (!pageData) return pageData;

        let components: MessageActionRow[] = [];

        if (this._componentsVisibility !== 'RemoveAll') this.componentsOrder.forEach(a => {
            const value = getEnumValue(PaginationActionRows, a);

            switch (value) {
                case PaginationActionRows.AdditionalActionRows:
                    components.push(...this.additionalActionRows);
                    return;
                case PaginationActionRows.ControllersActionRow:
                    if (this.pages.length < 2 && this.singlePageNoControllers || this._componentsVisibility === 'RemoveControllers') return;
                    if (this._controllerActionRow) components.push(this._controllerActionRow);
                    return;
                case PaginationActionRows.PageActionRows:
                    components.push(...(pageData.components ?? []));
                    return;
                default:
                    throw new Error(`Unknown pagination action row: ${typeof a}`);
            }
        });

        if (this._componentsVisibility === 'DisableAll') components = disableComponents(components ?? []);

        return {
            ...pageData,
            components
        }
    }

    public async setCurrentPageIndex(pageIndex?: number, editComponentsOnly: boolean = false): Promise<PageData> {
        let page = await (pageIndex !== undefined ? this.getPage(pageIndex) : this.currentPage);
            page = !editComponentsOnly ? page : { components: page?.components };

        if (!page) throw new RangeError(`Cannot find page index "${pageIndex}"`);

        this._currentPageIndex = pageIndex ?? this.currentPageIndex;

        if (this.isSent()) {
            if (this.command instanceof Message) {
                await this.pagination.edit(page);
            } else {
                await this.command.editFollowup(this.pagination.id, page);
            }

            this.emit('pageChange', (await this.currentPage)!, this.currentPageIndex);
        }

        return page;
    }

    public isSent(): this is BasePaginationBuilder<Collected, Events, true> {
        return this._command !== null && this.pagination !== null;
    }

    public toJSON(): BasePaginationOptions {
        return {
            pages: this.pages,
            authorId: this.authorId,
            authorDependent: this.authorDependent,
            endTimer: this.endTimer,
            singlePageNoControllers: this.singlePageNoControllers,
            additionalActionRows: this.additionalActionRows,
            componentsOrder: this.componentsOrder,
            collectorOptions: this.collectorOptions
        };
    }

    protected async _sendInitialPage(page: PageData & { ephemeral?: boolean; }, sendAs: SendAs, followUp?: string|boolean): Promise<void> {
        if (!this.command) throw new Error(`Pagination command trigger is undefined`);

        const sendAsFollowUp = typeof followUp === 'boolean' ? followUp : false;
        const followUpMessage = typeof followUp !== 'boolean' ? followUp : undefined;

        switch (sendAs) {
            case SendAs.NewMessage:
                if (!this.command.channel) throw new Error(`Pagination command channel is not defined`);
                this._pagination = await this.command.channel.createMessage(page);

                return;
            case SendAs.EditMessage:
                if (this.command instanceof Message) {
                    if (this.command.author.id !== this.command.client.user.id) throw new Error("Command message is not editable");

                    this._pagination = await this.command.edit(page);
                    return;
                } else {
                    if (!this.command.acknowledged) throw new Error("Interaction is not replied or deferred");

                    this._pagination = followUpMessage ? await this.command.editFollowup(followUpMessage, page) : await this.command.editOriginal(page);
                    return;
                }
            case SendAs.ReplyMessage:
                if (this.command instanceof Message) {
                    this._pagination = await this.command.client.rest.channels.createMessage(this.command.channelID, { ...page, messageReference: { messageID: this.command.id } });
                    return;
                } else {
                    if (!sendAsFollowUp && this.command.acknowledged) throw new Error("Interaction is already replied or deferred");

                    let message: Message;

                    if (sendAsFollowUp) {
                        message = await this.command.createFollowup({ ...page, flags: page.ephemeral ? 1 << 6 : undefined });
                    } else {
                        await this.command.createMessage({ ...page, flags: page.ephemeral ? 1 << 6 : undefined });

                        message = await this.command.getOriginal();
                    }

                    this._pagination = message;
                    return;
                }
        }
    }
}