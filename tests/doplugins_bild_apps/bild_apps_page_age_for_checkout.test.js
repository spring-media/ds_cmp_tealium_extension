const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');
const { createWindowMock } = require('../mocks/browserMocks');

describe('_setPageAgeForCheckout', () => {
    let s;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };

        window.utag.loader.SC = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should store the page age (utag.data.page_age) in the utag_main cookie if page_age is defined and doc type is article', () => {
        window.utag.data.page_age = 'test-page-age';
        jest.spyOn(s._utils, 'isDocTypeArticle').mockReturnValue(true);
        s._setPageAgeForCheckout();

        expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {
            pa: window.utag.data.page_age + ';exp-session'
        });
        expect(window.utag.data['cp.utag_main_pa']).toBe(window.utag.data.page_age);
    });
});
