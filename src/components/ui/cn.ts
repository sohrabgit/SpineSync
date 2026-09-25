/** Tiny className joiner (avoids a dependency). */
export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ')
