/**
 * @jest-environment jsdom
 */

describe('k5a_meta_populate', () => {
    let mockUtagData;
    let originalUtag;

    beforeEach(() => {
        // Clean up window.k5aMeta before each test
        delete window.k5aMeta;
        // Save original utag if it exists
        originalUtag = window.utag;
        // Mock utag.data
        mockUtagData = {
            'meta.og:image': 'https://example.com/image.jpg',
            page_type: 'article',
            page_sectionName: 'News',
            page_channel1: 'Politics',
            page_channel2: 'International',
            page_datePublication: '2025-03-11T12:00:00Z',
            page_dateLastModified: '2025-03-11T13:00:00Z',
            page_isPremium: '1',
            user_hasPlusSubscription2: 'true',
            user_isLoggedIn2: '1',
            cb_authors: 'John Doe',
            page_keywords: ['keyword1', 'keyword2'],
            'meta.og:locale': 'de-DE',
            'dom.referrer': 'https://example.com/referrer'
        };

        window.utag = {
            data: mockUtagData,
            cfg: {
                utDebug: false
            },
            DB: jest.fn()
        };

        // Mock document properties
        Object.defineProperty(document, 'URL', {
            writable: true,
            value: 'https://example.com/article'
        });
        Object.defineProperty(document, 'title', {
            writable: true,
            value: 'Test Article Title'
        });
        Object.defineProperty(document, 'referrer', {
            writable: true,
            value: 'https://fallback-referrer.com'
        });

        // Initialize k5aMeta
        window.k5aMeta = {};
    });

    afterEach(() => {
        // Clean up
        delete window.k5aMeta;
        if (originalUtag) {
            window.utag = originalUtag;
        } else {
            delete window.utag;
        }
        jest.resetModules();
    });

    it('should populate k5aMeta with correct metadata on view event', () => {
        // Mock the global 'a' parameter as 'view'
        global.a = 'view';
        global.b = {};

        // Execute the extension code
        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.url).toBe('https://example.com/article');
        expect(window.k5aMeta.title).toBe('Test Article Title');
        expect(window.k5aMeta.image).toBe('https://example.com/image.jpg');
        expect(window.k5aMeta.type).toBe('article');
        expect(window.k5aMeta.section).toBe('News');
        expect(window.k5aMeta.publishtime).toBe('2025-03-11T12:00:00Z');
        expect(window.k5aMeta.modifiedtime).toBe('2025-03-11T13:00:00Z');
        expect(window.k5aMeta.subscriber).toBe(1);
        expect(window.k5aMeta.login).toBe(1);
        expect(window.k5aMeta.paid).toBe(1);
        expect(window.k5aMeta.paywall).toBe('open'); // paid but subscriber
        expect(window.k5aMeta.author).toEqual(['John Doe']);
        expect(window.k5aMeta.tag).toEqual(['keyword1', 'keyword2']);
        expect(window.k5aMeta.subsection).toEqual(['International']);
        expect(window.k5aMeta.locale).toBe('de-DE');
        expect(window.k5aMeta.referer).toBe('https://example.com/referrer');

        // Clean up globals
        delete global.a;
        delete global.b;
    });

    it('should not populate k5aMeta if event type is not "view"', () => {
        global.a = 'link';
        global.b = {};

        window.k5aMeta = { existingKey: 'existingValue' };

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        // Should not have been modified
        expect(window.k5aMeta).toEqual({ existingKey: 'existingValue' });

        delete global.a;
        delete global.b;
    });

    it('should set paywall to "hard" when paid but not subscriber', () => {
        global.a = 'view';
        global.b = {};

        window.utag.data.page_isPremium = '1';
        window.utag.data.user_hasPlusSubscription2 = 'false';

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.paywall).toBe('hard');

        delete global.a;
        delete global.b;
    });

    it('should set paywall to "open" when not paid', () => {
        global.a = 'view';
        global.b = {};

        window.utag.data.page_isPremium = '0';
        window.utag.data.user_hasPlusSubscription2 = 'false';

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.paywall).toBe('open');

        delete global.a;
        delete global.b;
    });

    it('should handle missing utag.data gracefully', () => {
        global.a = 'view';
        global.b = {};
        global.utag = undefined;

        delete window.utag;

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.url).toBe('https://example.com/article');
        expect(window.k5aMeta.title).toBe('Test Article Title');
        expect(window.k5aMeta.image).toBe('');
        expect(window.k5aMeta.type).toBe('article');

        delete global.a;
        delete global.b;
        delete global.utag;
    });

    it('should convert single values to arrays for author, tag, and subsection', () => {
        global.a = 'view';
        global.b = {};

        window.utag.data.cb_authors = 'Single Author';
        window.utag.data.page_keywords = 'single-keyword';
        window.utag.data.page_channel2 = 'Single Subsection';

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.author).toEqual(['Single Author']);
        expect(window.k5aMeta.tag).toEqual(['single-keyword']);
        expect(window.k5aMeta.subsection).toEqual(['Single Subsection']);

        delete global.a;
        delete global.b;
    });

    it('should handle null values for author, tag, and subsection', () => {
        global.a = 'view';
        global.b = {};

        window.utag.data.cb_authors = null;
        window.utag.data.page_keywords = null;
        window.utag.data.page_channel2 = null;

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.author).toEqual([]);
        expect(window.k5aMeta.tag).toEqual([]);
        expect(window.k5aMeta.subsection).toEqual([]);

        delete global.a;
        delete global.b;
    });

    it('should use fallback values when primary values are missing', () => {
        global.a = 'view';
        global.b = {};

        delete window.utag.data.page_sectionName;
        delete window.utag.data['meta.og:locale'];
        delete window.utag.data['dom.referrer'];

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.section).toBe('Politics'); // Falls back to page_channel1
        expect(window.k5aMeta.locale).toBe('de-DE'); // Default value
        expect(window.k5aMeta.referer).toBe('https://fallback-referrer.com'); // Falls back to document.referrer

        delete global.a;
        delete global.b;
    });

    it('should merge with existing k5aMeta object', () => {
        global.a = 'view';
        global.b = {};

        window.k5aMeta = { customKey: 'customValue' };

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.k5aMeta.customKey).toBe('customValue');
        expect(window.k5aMeta.url).toBe('https://example.com/article');
        expect(window.k5aMeta.title).toBe('Test Article Title');

        delete global.a;
        delete global.b;
    });

    it('should log debug message when utDebug is enabled', () => {
        global.a = 'view';
        global.b = {};

        window.utag.cfg.utDebug = true;

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.utag.DB).toHaveBeenCalledWith('k5aMeta populated');

        delete global.a;
        delete global.b;
    });

    it('should handle errors gracefully and log them when utDebug is enabled', () => {
        global.a = 'view';
        global.b = {};

        window.utag.cfg.utDebug = true;

        // Force an error by making Object.assign throw
        const originalAssign = Object.assign;
        Object.assign = jest.fn(() => {
            throw new Error('Test error');
        });

        require('../../extensions/kilkaya/k5a_meta_populate.js');

        expect(window.utag.DB).toHaveBeenCalledWith(expect.stringContaining('k5aMeta error:'));

        // Restore Object.assign
        Object.assign = originalAssign;

        delete global.a;
        delete global.b;
    });
});
