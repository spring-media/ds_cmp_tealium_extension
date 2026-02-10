/**
 * Escapes a string for safe use in a JavaScript single-quoted string literal.
 * Handles: single quotes, backslashes, newlines, carriage returns, tabs, and other control characters.
 * 
 * @param str - The string to escape
 * @returns The escaped string safe for use in JS string literals
 */
export function escapeJsStringLiteral(str: string): string {
    return str
        .replace(/\\/g, '\\\\')    // Backslash must be first
        .replace(/'/g, "\\'")       // Single quote
        .replace(/\n/g, '\\n')      // Newline
        .replace(/\r/g, '\\r')      // Carriage return
        .replace(/\t/g, '\\t')      // Tab
        .replace(/\f/g, '\\f')      // Form feed
        .replace(/\v/g, '\\v')      // Vertical tab
        .replace(/\0/g, '\\0');     // Null character
}

/**
 * Escapes a string for safe use in a JavaScript comment.
 * Prevents premature comment termination by escaping asterisk-slash sequences.
 * 
 * @param str - The string to escape
 * @returns The escaped string safe for use in JS comments
 */
export function escapeJsComment(str: string): string {
    // Replace */ with *\/ to prevent comment termination
    // Also remove other potentially problematic sequences
    return str
        .replace(/\*\//g, '*\\/')
        .replace(/\n/g, ' ')        // Replace newlines with spaces in comments
        .replace(/\r/g, ' ');       // Replace carriage returns with spaces
}
