const sObject = require('../../extensions/doPlugins/doPlugins_welt_apps_ios');
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

    it('should not set any data if pagename does not contain home : home or section : Titelseite', () => {
        s.pageName = 'test : home : Titelseite';

        s._setPageSection(s);

        expect(s.eVar5).toBeUndefined();
        expect(s.prop5).toBeUndefined();
        expect(s.channel).toBeUndefined();
    });

    it('should set correct data if pagename contains home : home', () => {
        s.pageName = 'test : home : home';

        s._setPageSection(s);

        expect(s.eVar5).toBe('home');
        expect(s.prop5).toBe('home');
        expect(s.channel).toBe('home');
    });

    it('should set correct data if pagename contains section : Titelseite', () => {
        s.pageName = 'test : section : Titelseite';

        s._setPageSection(s);

        expect(s.eVar5).toBe('section');
        expect(s.prop5).toBe('section');
        expect(s.channel).toBe('section');
    });
});
