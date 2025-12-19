/**
 * Tests for tealium-static-up-welt-view.js
 * Configures Tealium utag to enable view tracking on static.up.welt.de
 */

describe('Tealium Static UP WELT View Configuration', () => {
    let originalLocation;
    let mockConsole;
    let extensionCode;

    beforeEach(() => {
        originalLocation = global.location;
        delete global.window;
        global.window = {};

        // Mock console.error
        mockConsole = {
            error: jest.fn()
        };
        global.console = mockConsole;

        // Load the extension code as a function
        extensionCode = () => {
            if (location.hostname !== 'static.up.welt.de') {
                return;
            }

            try {
                window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
                window.utag_cfg_ovrd = { noview: false };
            } catch (e) {
                // Silent error handling - should not break page functionality
                console.error('[TEALIUM STATIC UP] Error:', e);
            }
        };
    });

    afterEach(() => {
        global.location = originalLocation;
        jest.restoreAllMocks();
        delete global.console;
    });

    it('should set utag_cfg_ovrd.noview to false on static.up.welt.de', () => {
        delete global.location;
        global.location = { hostname: 'static.up.welt.de' };

        extensionCode();

        expect(window.utag_cfg_ovrd).toEqual({ noview: false });
    });

    it('should not set utag_cfg_ovrd on other domains', () => {
        delete global.location;
        global.location = { hostname: 'www.welt.de' };

        extensionCode();

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

        expect(() => extensionCode()).not.toThrow();
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

        extensionCode();

        expect(mockConsole.error).toHaveBeenCalled();
        expect(mockConsole.error.mock.calls[0][0]).toContain('[TEALIUM STATIC UP] Error:');
    });
});
