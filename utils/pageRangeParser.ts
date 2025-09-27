
/**
 * Parses a page range string (e.g., "1-3, 5, 8-10") into an array of 0-based indices.
 * @param rangeStr The string to parse.
 * @param maxPages The total number of available pages (files).
 * @returns An array of 0-based indices.
 * @throws An error for invalid syntax.
 */
export const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
                throw new Error(`Invalid range format: "${trimmedPart}"`);
            }

            for (let i = start; i <= end; i++) {
                if (i <= maxPages) {
                    indices.add(i - 1); // convert to 0-based index
                }
            }
        } else {
            const pageNum = parseInt(trimmedPart, 10);
            if (isNaN(pageNum) || pageNum <= 0) {
                throw new Error(`Invalid page number: "${trimmedPart}"`);
            }
            if (pageNum <= maxPages) {
                indices.add(pageNum - 1); // convert to 0-based index
            }
        }
    }

    return Array.from(indices).sort((a, b) => a - b);
};
