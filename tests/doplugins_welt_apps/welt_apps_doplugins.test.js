const sObject = require('../../extensions/doPlugins/doPlugins_welt_apps_ios');
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
    });

    it('should call s._setPageSection()', () => {
        const setPageSectionMock = jest.spyOn(s, '_setPageSection');

        s.doPlugins(s);

        expect(setPageSectionMock).toHaveBeenCalledWith(s);
    });
});
