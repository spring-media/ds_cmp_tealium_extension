import { escapeJsStringLiteral, escapeJsComment } from './escapeUtils';

describe('escapeJsStringLiteral', () => {
    it('escapes single quotes', () => {
        expect(escapeJsStringLiteral("it's")).toBe("it\\'s");
        expect(escapeJsStringLiteral("O'Reilly")).toBe("O\\'Reilly");
    });

    it('escapes backslashes', () => {
        expect(escapeJsStringLiteral('path\\to\\file')).toBe('path\\\\to\\\\file');
        expect(escapeJsStringLiteral('C:\\Users')).toBe('C:\\\\Users');
    });

    it('escapes newlines', () => {
        expect(escapeJsStringLiteral('line1\nline2')).toBe('line1\\nline2');
        expect(escapeJsStringLiteral('text\r\nmore')).toBe('text\\r\\nmore');
    });

    it('escapes tabs and other control characters', () => {
        expect(escapeJsStringLiteral('col1\tcol2')).toBe('col1\\tcol2');
        expect(escapeJsStringLiteral('form\ffeed')).toBe('form\\ffeed');
    });

    it('escapes multiple special characters together', () => {
        expect(escapeJsStringLiteral("it's a test\\path\nwith 'quotes'"))
            .toBe("it\\'s a test\\\\path\\nwith \\'quotes\\'");
    });

    it('handles empty string', () => {
        expect(escapeJsStringLiteral('')).toBe('');
    });

    it('handles string with no special characters', () => {
        expect(escapeJsStringLiteral('normal text')).toBe('normal text');
    });

    it('prevents injection with crafted input', () => {
        const malicious = "'; alert('xss'); '";
        const escaped = escapeJsStringLiteral(malicious);
        expect(escaped).toBe("\\'; alert(\\'xss\\'); \\'");
        
        // Verify it's safe when used in a string literal
        const code = `var x = '${escaped}';`;
        expect(code).toBe("var x = '\\'; alert(\\'xss\\'); \\'';");
    });
});

describe('escapeJsComment', () => {
    it('escapes comment terminators', () => {
        expect(escapeJsComment('end */ comment')).toBe('end *\\/ comment');
        expect(escapeJsComment('/* nested */ comments */')).toBe('/* nested *\\/ comments *\\/');
    });

    it('replaces newlines with spaces', () => {
        expect(escapeJsComment('line1\nline2')).toBe('line1 line2');
        expect(escapeJsComment('text\r\nmore')).toBe('text  more');
    });

    it('handles multiple issues together', () => {
        expect(escapeJsComment('comment */\nwith newline'))
            .toBe('comment *\\/ with newline');
    });

    it('handles empty string', () => {
        expect(escapeJsComment('')).toBe('');
    });

    it('handles string with no special characters', () => {
        expect(escapeJsComment('normal comment')).toBe('normal comment');
    });

    it('prevents comment injection', () => {
        const malicious = "attack */ alert('xss'); /*";
        const escaped = escapeJsComment(malicious);
        expect(escaped).toBe("attack *\\/ alert('xss'); /*");
    });
});
