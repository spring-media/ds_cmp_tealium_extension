const sObject = require('../../extensions/doPlugins/doPlugins_welt_apps_ios');
const { createWindowMock } = require('../mocks/browserMocks');

describe('s._weltAppsInit()', () => {
    let s;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set global configuration properties', () => {
        window.navigator.userAgent = 'any-user-agent';

        s._weltAppsInit(s);

        expect(s.usePlugins).toBe(true);
        expect(s.currencyCode).toBe('EUR');
        expect(s.eVar61).toBe(window.navigator.userAgent);
    });

    it('should set eVar94 to the iPhone screen size', () => {
        const anyScreenSize = 111;
        window.screen.width = window.screen.height = anyScreenSize;
        window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

        s._weltAppsInit(s);

        expect(s.eVar94).toBe(`${anyScreenSize}x${anyScreenSize}`);
    });

    it('should call s._setPageAgeForCheckout()', () => {
        const setPageAgeForCheckoutMock = jest.spyOn(s, '_setPageAgeForCheckout');

        s._weltAppsInit(s);

        expect(setPageAgeForCheckoutMock).toHaveBeenCalled();
    });

});
