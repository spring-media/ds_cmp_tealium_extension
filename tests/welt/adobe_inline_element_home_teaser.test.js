/**
 * Tests for adobe_inline_element_home_teaser.js
 * Adobe inline element home teaser tracking for WELT
 */

const {
    processAdobeInlineElement
} = require('../../extensions/welt/adobe_inline_element_home_teaser');

describe('Adobe Inline Element Home Teaser Tracking', () => {
    let mockUtag;
    let mockConsole;

    beforeEach(() => {
        // Mock utag.loader.SC for session storage
        mockUtag = {
            loader: {
                SC: jest.fn()
            }
        };
        global.utag = mockUtag;

        // Mock console.error
        mockConsole = {
            error: jest.fn()
        };
        global.console = mockConsole;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
        delete global.console;
    });

    it('should process link events with Inline Element on home page (escenicId 5)', () => {
        const eventData = {
            event_name: 'Inline Element Click',
            event_label: 'teaser-label',
            page_escenicId: '5',
            event_data: {
                target: 'target-value',
                source: 'source-value'
            }
        };

        processAdobeInlineElement('link', eventData);

        expect(mockUtag.loader.SC).toHaveBeenCalledTimes(2);
        expect(mockUtag.loader.SC).toHaveBeenCalledWith(
            'utag_main',
            { hti: 'teaser-label|target-value|source-value' },
            'session'
        );
        expect(mockUtag.loader.SC).toHaveBeenCalledWith(
            'utag_main',
            { tb: 'teaser-label' },
            'session'
        );
    });

    it('should not process view events', () => {
        const eventData = {
            event_name: 'Inline Element Click',
            event_label: 'teaser-label',
            page_escenicId: '5',
            event_data: {
                target: 'target-value',
                source: 'source-value'
            }
        };

        processAdobeInlineElement('view', eventData);

        expect(mockUtag.loader.SC).not.toHaveBeenCalled();
    });

    it('should not process events without "Inline Element" in event_name', () => {
        const eventData = {
            event_name: 'Regular Click',
            event_label: 'teaser-label',
            page_escenicId: '5',
            event_data: {
                target: 'target-value',
                source: 'source-value'
            }
        };

        processAdobeInlineElement('link', eventData);

        expect(mockUtag.loader.SC).not.toHaveBeenCalled();
    });

    it('should not process events from other pages (escenicId != 5)', () => {
        const eventData = {
            event_name: 'Inline Element Click',
            event_label: 'teaser-label',
            page_escenicId: '42',
            event_data: {
                target: 'target-value',
                source: 'source-value'
            }
        };

        processAdobeInlineElement('link', eventData);

        expect(mockUtag.loader.SC).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully without throwing', () => {
        const eventData = {
            event_name: 'Inline Element Click',
            event_label: 'teaser-label',
            page_escenicId: '5',
            event_data: null // This will cause error when accessing .target
        };

        expect(() => processAdobeInlineElement('link', eventData)).not.toThrow();
        expect(mockUtag.loader.SC).not.toHaveBeenCalled();
    });

    it('should log errors to console', () => {
        const eventData = {
            event_name: 'Inline Element Click',
            event_label: 'teaser-label',
            page_escenicId: '5',
            event_data: null
        };

        processAdobeInlineElement('link', eventData);

        expect(mockConsole.error).toHaveBeenCalled();
        expect(mockConsole.error.mock.calls[0][0]).toContain('[ADOBE INLINE ELEMENT] Error:');
    });
});
