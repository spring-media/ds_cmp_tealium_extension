/**
 * Tests for tealium-static-up-welt-view.js
 * Configures Tealium utag to enable view tracking on static.up.welt.de
 */

const { configureStaticUpView } = require('../../extensions/welt/tealium-static-up-welt-view');

describe('Tealium Static UP WELT View Configuration', () => {
    let originalLocation;
    let mockConsole;

    beforeEach(() => {
        originalLocation = global.location;
        delete global.window;
        global.window = {};

        // Mock console.error
        mockConsole = {
            error: jest.fn()
        };
        global.console = mockConsole;
    });

    afterEach(() => {
        global.location = originalLocation;
        jest.restoreAllMocks();
        delete global.console;
    });

    it('should set utag_cfg_ovrd.noview to false on static.up.welt.de', () => {
        delete global.location;
        global.location = { hostname: 'static.up.welt.de' };

        configureStaticUpView();

        expect(window.utag_cfg_ovrd).toEqual({ noview: false });
    });

    it('should not set utag_cfg_ovrd on other domains', () => {
        delete global.location;
        global.location = { hostname: 'www.welt.de' };

        configureStaticUpView();

        expect(window.utag_cfg_ovrd).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
        delete global.location;
        global.location = { hostname: 'static.up.welt.de' };

        // Force an error by making window read-only
        Object.defineProperty(window, 'utag_cfg_ovrd', {
            get: () => {
                throw new Error('Test error');
            },
            set: () => {
                throw new Error('Test error');
            }
        });

        expect(() => configureStaticUpView()).not.toThrow();
    });

    it('should log errors to console', () => {
        delete global.location;
        global.location = { hostname: 'static.up.welt.de' };

        // Force an error
        Object.defineProperty(window, 'utag_cfg_ovrd', {
            get: () => {
                throw new Error('Test error');
            },
            set: () => {
                throw new Error('Test error');
            }
        });

        configureStaticUpView();

        expect(mockConsole.error).toHaveBeenCalled();
        expect(mockConsole.error.mock.calls[0][0]).toContain('[TEALIUM STATIC UP] Error:');
    });
});
