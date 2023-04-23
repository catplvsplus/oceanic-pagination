import { Awaitable, RestOrArray, normalizeArray } from 'fallout-utility';
import { EditMessageOptions, Embed } from 'oceanic.js';
import { PaginationActionRows } from './enums';

export interface PageData extends EditMessageOptions {}

export type PageResolvable = StaticPageResolvable|DynamicPageFunction;
export type StaticPageResolvable = string|PageData|Embed;
export type DynamicPageFunction = () => Awaitable<PageResolvable>;

export type PaginationComponentsOrder = ((keyof typeof PaginationActionRows)|PaginationActionRows)[];
export type PaginationComponentsOrderWithoutControllers = ((keyof Omit<typeof PaginationActionRows, 'ControllersActionRow'>)|PaginationActionRows.AdditionalActionRows|PaginationActionRows.PageActionRows)[];

export function resolvePage(page: StaticPageResolvable): PageData;
export function resolvePage(page: DynamicPageFunction): Promise<PageData>;
export function resolvePage(page: PageResolvable): Promise<PageData>|PageData;
export function resolvePage(page: PageResolvable): Promise<PageData>|PageData {
    if (isEmbed(page)) {
        return { content: '', embeds: [page], components: [] };
    } else if (typeof page === 'string') {
        return { content: page, embeds: [], components: [] };
    } else if (typeof page === 'object' && !Array.isArray(page)){
        return page;
    } else if (typeof page === 'function') {
        return (async () => resolvePage(await page()))();
    }

    throw new Error('Unresolvable pagination page');
}

export function resolveStaticPages(...pages: RestOrArray<PageResolvable>): (PageData|DynamicPageFunction)[] {
    return normalizeArray(pages).map(p => typeof p === 'function' ? p : resolvePage(p));
}

export async function resolvePages(...pages: RestOrArray<PageResolvable>): Promise<PageData[]> {
    return Promise.all(normalizeArray(pages).map(p => resolvePage(p)));
}

export function isEmbed(data: any): data is Embed {
    if (typeof data !== 'object') return false;

    const keys = ['author', 'fields', 'footer', 'image', 'provider', 'thumbnail', 'video'];

    return Object.keys(data).some(k => keys.includes(k));
}