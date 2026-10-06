import { ParsedQs } from 'qs';

/**
 * Parse un paramètre de route/query qui peut être string, string[], ParsedQs, ou mix
 */
export function parseParam(param: string | string[] | ParsedQs | (string | ParsedQs)[] | undefined): string {
    if (param === undefined) {
        return '';
    }
    if (Array.isArray(param)) {
        const first = param[0];
        if (typeof first === 'string') {
            return first;
        }
        return '';
    }
    if (typeof param === 'object') {
        return '';
    }
    return param;
}

/**
 * Parse un nombre depuis un paramètre de route/query
 */
export function parseNumberParam(param: string | string[] | ParsedQs | (string | ParsedQs)[] | undefined): number {
    const str = parseParam(param);
    return parseInt(str, 10);
}
