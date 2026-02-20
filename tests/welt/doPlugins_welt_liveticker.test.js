/**
 * Tests for doPlugins_welt_liveticker.js
 * Tests the liveticker functionality that sets eVar41 based on page_type
 */

const sObject = require('../../extensions/welt/doPlugins_welt_liveticker');
const { createWindowMock } = require('../mocks/browserMocks');

describe('doPlugins Welt Liveticker', () => {
    let s;
    let windowMock;

    beforeEach(() => {
        // Create a fresh window mock for each test
        windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        // Provide a fresh copy of the s-object for each test
        s = { ...sObject };
        
        // Reset eVar41
        s.eVar41 = undefined;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('_isLivetickerPage()', () => {
        it('should return true when page_type is "live"', () => {
            window.utag.data.page_type = 'live';

            const result = s._isLivetickerPage();

            expect(result).toBe(true);
        });

        it('should return false when page_type is not "live"', () => {
            window.utag.data.page_type = 'article';

            const result = s._isLivetickerPage();

            expect(result).toBe(false);
        });

        it('should return false when window.utag is undefined', () => {
            delete window.utag;

            const result = s._isLivetickerPage();

            expect(result).toBe(false);
        });

        it('should be case-sensitive for page_type value', () => {
            window.utag.data.page_type = 'LIVE';

            const result = s._isLivetickerPage();

            expect(result).toBe(false);
        });
    });

    describe('_setLivetickerVariables()', () => {
        it('should set eVar41 to "liveticker" when page_type is "live"', () => {
            window.utag.data.page_type = 'live';

            s._setLivetickerVariables(s);

            expect(s.eVar41).toBe('liveticker');
        });

        it('should not set eVar41 when page_type is not "live"', () => {
            window.utag.data.page_type = 'article';

            s._setLivetickerVariables(s);

            expect(s.eVar41).toBeUndefined();
        });

        it('should overwrite eVar41 if page_type is "live"', () => {
            window.utag.data.page_type = 'live';
            s.eVar41 = 'existing_value';

            s._setLivetickerVariables(s);

            expect(s.eVar41).toBe('liveticker');
        });
    });

    describe('doPlugins()', () => {
        it('should set eVar41 to "liveticker" when page_type is "live"', () => {
            window.utag.data.page_type = 'live';

            s.doPlugins(s);

            expect(s.eVar41).toBe('liveticker');
        });

        it('should not set eVar41 when page_type is not "live"', () => {
            window.utag.data.page_type = 'article';

            s.doPlugins(s);

            expect(s.eVar41).toBeUndefined();
        });

        it('should call _doPluginsGlobal if available', () => {
            window.utag.data.page_type = 'live';
            s._doPluginsGlobal = jest.fn();

            s.doPlugins(s);

            expect(s._doPluginsGlobal).toHaveBeenCalledWith(s);
        });

        it('should not throw error if _doPluginsGlobal is not available', () => {
            window.utag.data.page_type = 'live';
            delete s._doPluginsGlobal;

            expect(() => s.doPlugins(s)).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete flow for liveticker page', () => {
            window.utag.data.page_type = 'live';
            s._doPluginsGlobal = jest.fn();

            s.doPlugins(s);

            expect(s.eVar41).toBe('liveticker');
            expect(s._doPluginsGlobal).toHaveBeenCalledWith(s);
        });

        it('should preserve other s object properties', () => {
            window.utag.data.page_type = 'live';
            s.eVar1 = 'value1';
            s.eVar2 = 'value2';
            s._doPluginsGlobal = jest.fn();

            s.doPlugins(s);

            expect(s.eVar41).toBe('liveticker');
            expect(s.eVar1).toBe('value1');
            expect(s.eVar2).toBe('value2');
        });

        it('should execute _setLivetickerVariables before _doPluginsGlobal', () => {
            window.utag.data.page_type = 'live';
            const executionOrder = [];
            
            s._setLivetickerVariables = function(sObj) {
                executionOrder.push('setLivetickerVariables');
                if (this._isLivetickerPage()) {
                    sObj.eVar41 = 'liveticker';
                }
            };
            
            s._doPluginsGlobal = function() {
                executionOrder.push('doPluginsGlobal');
            };

            s.doPlugins(s);

            expect(executionOrder).toEqual(['setLivetickerVariables', 'doPluginsGlobal']);
        });
    });
});
