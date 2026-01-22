const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');
const { createWindowMock } = require('../mocks/browserMocks');

describe('s._orderViaArticle()', () => {
    let s;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set eVar17 if window.utag.data.order_via is article', () => {
        window.utag.data.order_via = 'article';
        window.utag.data['cp.utag_main_pa'] = 'test_cp.utag_main_pa';

        s._orderViaArticle(s);

        expect(s.eVar17).toBe(window.utag.data['cp.utag_main_pa']);
    });

    it('should not set eVar17 if window.utag.data.order_via is not article', () => {
        window.utag.data.order_via = 'not_article';
        window.utag.data['cp.utag_main_pa'] = 'test_cp.utag_main_pa';

        s._orderViaArticle(s);

        expect(s.eVar17).toBeUndefined();
    });
});
