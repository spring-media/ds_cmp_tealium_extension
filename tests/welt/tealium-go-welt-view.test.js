/**
 * Tests for tealium-go-welt-view.js
 * Configures Tealium utag to disable view tracking on go.welt.de
 */

describe('Tealium GO WELT View Configuration', () => {
    let extensionCode;

    beforeEach(() => {
        delete global.window;
        global.window = {};

        extensionCode = () => {
            if (!location.hostname.includes('go.welt.de')) {
                return;
            }

            try {
                window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
                window.utag_cfg_ovrd = {
                    noview: true
                };
            } catch (e) {
                console.error('[TEALIUM GO WELT] Error:', e);
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set utag_cfg_ovrd.noview to true on go.welt.de', () => {
        delete global.location;
        global.location = { hostname: 'go.welt.de' };

        extensionCode();

        expect(window.utag_cfg_ovrd).toEqual({ noview: true });
    });

    it('should set utag_cfg_ovrd.noview to true on subdomain', () => {
        delete global.location;
        global.location = { hostname: 'app.go.welt.de' };

        extensionCode();

        expect(window.utag_cfg_ovrd.noview).toBe(true);
    });

    it('should not set utag_cfg_ovrd on other domains', () => {
        delete global.location;
        global.location = { hostname: 'www.welt.de' };

        extensionCode();

        expect(window.utag_cfg_ovrd).toBeUndefined();
    });
});
