const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');
const { createWindowMock } = require('../mocks/browserMocks');

describe('s.doPlugins()', () => {
    let s;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
        jest.spyOn(s, 'getPreviousValue').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should assign values to eVars and props', () => {
        window.utag.data.myCW = 'test_cw';
        s.version = 'test_version';
        s.visitor = {
            version: 'test_visitor_version'
        };
        s.getPreviousValue.mockReturnValue('test_value');

        s.doPlugins(s);

        expect(s.expectSupplementalData).toBe(false);
        expect(s.eVar63).toBe(s.version);
        expect(s.eVar64).toBe(s.visitor.version);
        expect(s.eVar184.length).toBeGreaterThanOrEqual(1);
        expect(s.eVar181.length).toBeGreaterThanOrEqual(1);
        expect(s.eVar185).toBe(window.utag.data.myCW);
        expect(s.prop61).toBe('test_value');
        expect(s.eVar33).toBe('test_value');
        expect(typeof s.prop65).toBe('number');
    });

    it('should call s._bildAppsPageNameObj.setAppsPageName()', () => {
        const setAppsPageNameMock = jest.spyOn(s._bildAppsPageNameObj, 'setAppsPageName');

        s.doPlugins(s);

        expect(setAppsPageNameMock).toHaveBeenCalledWith(s);
    });

    it('should call s._orderViaArticle()', () => {
        const orderViaArticleMock = jest.spyOn(s, '_orderViaArticle');

        s.doPlugins(s);

        expect(orderViaArticleMock).toHaveBeenCalledWith(s);
    });

    it('should call s._setPageAgeForCheckout()', () => {
        const setPageAgeForCheckoutMock = jest.spyOn(s, '_setPageAgeForCheckout');

        s.doPlugins(s);

        expect(setPageAgeForCheckoutMock).toHaveBeenCalled();
    });

    it('should call s._setPageCmsPathWithoutBild()', () => {
        const setPageCmsPathWithoutBildMock = jest.spyOn(s, '_setPageCmsPathWithoutBild');

        s.doPlugins(s);

        expect(setPageCmsPathWithoutBildMock).toHaveBeenCalledWith(s);
    });
});
