/**
 * Tests for bot_traffic_detection.js
 * Bot traffic detection for WELT based on user agent strings
 */

/* global utag, navigator */

const {
    getBotUserAgents,
    isBotUserAgent,
    setBotTrafficData,
    getUserAgent,
    initBotTrafficDetection
} = require('../../extensions/welt/bot_traffic_detection');

describe('Bot Traffic Detection', () => {
    let mockUtag;
    let mockNavigator;

    beforeEach(() => {
        // Mock utag.data
        mockUtag = {
            data: {}
        };
        global.utag = mockUtag;

        // Mock navigator
        mockNavigator = {
            userAgent: ''
        };
        global.navigator = mockNavigator;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
        delete global.navigator;
    });

    describe('getBotUserAgents', () => {
        it('should return array with 2 known bot user agents', () => {
            const botArray = getBotUserAgents();

            expect(Array.isArray(botArray)).toBe(true);
            expect(botArray.length).toBe(2);
            expect(botArray).toContain(
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
            );
            expect(botArray).toContain(
                'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
            );
        });
    });

    describe('isBotUserAgent', () => {
        const botArray = [
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
        ];

        it('should return true for known bot user agents', () => {
            const chrome89Bot =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
            const archiveItBot =
                'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';

            expect(isBotUserAgent(chrome89Bot, botArray)).toBe(true);
            expect(isBotUserAgent(archiveItBot, botArray)).toBe(true);
        });

        it('should return false for regular browser user agents', () => {
            const regularChrome =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            const firefox =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0';
            const safari =
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15';
            const mobile =
                'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';

            expect(isBotUserAgent(regularChrome, botArray)).toBe(false);
            expect(isBotUserAgent(firefox, botArray)).toBe(false);
            expect(isBotUserAgent(safari, botArray)).toBe(false);
            expect(isBotUserAgent(mobile, botArray)).toBe(false);
        });

        it('should handle invalid inputs gracefully', () => {
            expect(isBotUserAgent(null, botArray)).toBe(false);
            expect(isBotUserAgent(undefined, botArray)).toBe(false);
            expect(isBotUserAgent('', botArray)).toBe(false);
            expect(isBotUserAgent('test', null)).toBe(false);
            expect(isBotUserAgent('test', undefined)).toBe(false);
            expect(isBotUserAgent('test', [])).toBe(false);
        });
    });

    describe('setBotTrafficData', () => {
        it('should set bot_traffic as string "true" or "false"', () => {
            setBotTrafficData(true);
            expect(utag.data.bot_traffic).toBe('true');
            expect(typeof utag.data.bot_traffic).toBe('string');

            setBotTrafficData(false);
            expect(utag.data.bot_traffic).toBe('false');
            expect(typeof utag.data.bot_traffic).toBe('string');
        });

        it('should handle missing utag gracefully', () => {
            delete global.utag;
            expect(() => setBotTrafficData(true)).not.toThrow();

            global.utag = {};
            expect(() => setBotTrafficData(true)).not.toThrow();

            global.utag = { data: null };
            expect(() => setBotTrafficData(true)).not.toThrow();
        });
    });

    describe('getUserAgent', () => {
        it('should return user agent from navigator', () => {
            navigator.userAgent =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

            expect(getUserAgent()).toBe(navigator.userAgent);
        });

        it('should return empty string when navigator is unavailable', () => {
            delete global.navigator;
            expect(getUserAgent()).toBe('');

            global.navigator = {};
            expect(getUserAgent()).toBe('');

            global.navigator = { userAgent: null };
            expect(getUserAgent()).toBe('');
        });
    });

    describe('initBotTrafficDetection', () => {
        it('should detect bot traffic and set utag.data.bot_traffic to "true"', () => {
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

            const result = initBotTrafficDetection();

            expect(result.isBot).toBe(true);
            expect(result.botTrafficValue).toBe('true');
            expect(utag.data.bot_traffic).toBe('true');
        });

        it('should detect regular traffic and set utag.data.bot_traffic to "false"', () => {
            navigator.userAgent =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

            const result = initBotTrafficDetection();

            expect(result.isBot).toBe(false);
            expect(result.botTrafficValue).toBe('false');
            expect(utag.data.bot_traffic).toBe('false');
        });

        it('should preserve existing utag.data properties', () => {
            utag.data.page_name = 'home';
            utag.data.page_type = 'article';
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';

            const result = initBotTrafficDetection();

            expect(result.isBot).toBe(true);
            expect(utag.data.bot_traffic).toBe('true');
            expect(utag.data.page_name).toBe('home');
            expect(utag.data.page_type).toBe('article');
        });

        it('should handle missing globals gracefully', () => {
            delete global.navigator;
            expect(() => initBotTrafficDetection()).not.toThrow();

            const result = initBotTrafficDetection();
            expect(result.userAgent).toBe('');
            expect(result.isBot).toBe(false);
        });

        it('should handle multiple calls correctly', () => {
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

            const result1 = initBotTrafficDetection();
            expect(result1.isBot).toBe(true);

            navigator.userAgent =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

            const result2 = initBotTrafficDetection();
            expect(result2.isBot).toBe(false);
            expect(utag.data.bot_traffic).toBe('false');
        });
    });

    describe('Integration scenarios', () => {
        it('should correctly identify Chrome 89 Linux bot traffic', () => {
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

            initBotTrafficDetection();

            expect(utag.data.bot_traffic).toBe('true');
        });

        it('should correctly identify Archive-It bot traffic', () => {
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';

            initBotTrafficDetection();

            expect(utag.data.bot_traffic).toBe('true');
        });

        it('should not flag regular user traffic as bot', () => {
            navigator.userAgent =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

            initBotTrafficDetection();

            expect(utag.data.bot_traffic).toBe('false');
        });

        it('should not flag similar but different user agent as bot', () => {
            // Similar to bot user agent but with different Chrome version
            navigator.userAgent =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4389.82 Safari/537.36';

            initBotTrafficDetection();

            expect(utag.data.bot_traffic).toBe('false');
        });
    });
});
