/**
 * Tests for tealium-go-welt-view.js
 * Configures Tealium utag to disable view tracking on go.welt.de
 */

const { configureGoWeltView } = require('../../extensions/welt/tealium-go-welt-view');

describe('Tealium GO WELT View Configuration', () => {
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

    it('should set utag_cfg_ovrd.noview to true on go.welt.de', () => {
        delete global.location;
        global.location = { hostname: 'go.welt.de' };

        configureGoWeltView();

        expect(window.utag_cfg_ovrd).toEqual({ noview: true });
    });

    it('should work with subdomain go.welt.de', () => {
        delete global.location;
        global.location = { hostname: 'subdomain.go.welt.de' };

        configureGoWeltView();

        expect(window.utag_cfg_ovrd).toEqual({ noview: true });
    });

    it('should not set utag_cfg_ovrd on other domains', () => {
        delete global.location;
        global.location = { hostname: 'www.welt.de' };

        configureGoWeltView();

        expect(window.utag_cfg_ovrd).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
        delete global.location;
        global.location = { hostname: 'go.welt.de' };

        // Force an error by making window read-only
        Object.defineProperty(window, 'utag_cfg_ovrd', {
            get: () => {
                throw new Error('Test error');
            },
            set: () => {
                throw new Error('Test error');
            }
        });

        expect(() => configureGoWeltView()).not.toThrow();
    });

    it('should log errors to console', () => {
        delete global.location;
        global.location = { hostname: 'go.welt.de' };

        // Force an error
        Object.defineProperty(window, 'utag_cfg_ovrd', {
            get: () => {
                throw new Error('Test error');
            },
            set: () => {
                throw new Error('Test error');
            }
        });

        configureGoWeltView();

        expect(mockConsole.error).toHaveBeenCalled();
        expect(mockConsole.error.mock.calls[0][0]).toContain('[TEALIUM GO WELT] Error:');
    });
});
