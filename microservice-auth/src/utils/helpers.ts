/**
 * Parse un paramètre de route qui peut être string ou string[]
 */
export function parseParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
        return param[0] || '';
    }
    return param || '';
}

/**
 * Parse un nombre depuis un paramètre de route
 */
export function parseNumberParam(param: string | string[] | undefined): number {
    const str = parseParam(param);
    return parseInt(str, 10);
}
