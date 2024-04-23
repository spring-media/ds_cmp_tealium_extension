const sObject = require('../../extensions/doPlugins/doPlugins_global');
const {createWindowMock} = require('../mocks/browserMocks');

describe('setICIDTrackingCode', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        s = {
            ...sObject
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should assign the value of the ICID tracking value to eVar78 and eVar79', function () {
        const anyICID = 'any-icid';
        window.location.search = `?icid=${anyICID}`;
        s._ICIDTracking.setVariables(s);
        expect(s.eVar78).toBe(anyICID);
        expect(s.eVar79).toBe(anyICID);
    });

    it('should assign empty string to eVar78 and eVar79 if there is no ICID tracking value', function () {
        s._ICIDTracking.setVariables(s);
        expect(s.eVar78).toBe('');
        expect(s.eVar79).toBe('');
    });
});