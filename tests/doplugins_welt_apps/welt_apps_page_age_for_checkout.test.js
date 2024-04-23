const sObject = require('../../extensions/doPlugins/doPlugins_welt_apps_ios');
const { createWindowMock } = require('../mocks/browserMocks');

describe('_setPageAgeForCheckout', () => {
    let s;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };

        window.utag.loader.SC = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should store the screen age publication (utag.data.screen_agePublication) in the utag_main cookie if doc type is article', () => {
        window.utag.data.adobe_docType = 'article';
        window.utag.data.screen_agePublication = 'test_screen_agePublication';

        s._setPageAgeForCheckout();

        expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'pa': window.utag.data.screen_agePublication + ';exp-session' });
        expect(window.utag.data['cp.utag_main_pa']).toBe(window.utag.data.screen_agePublication);
    });
});