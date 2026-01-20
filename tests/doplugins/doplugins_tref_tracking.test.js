const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('setTREFTrackingCode', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        s = {
            ...sObject
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should assign the value of the TREF and WTREF tracking value to eVar53', function() {
        window.utag.data = {
            'dom.hash': 'any_value'
        };
        window.location.search = 't_ref=any_value';

        s._T_REFTracking.setVariables(s);

        expect(s.eVar53).toBe('any_value|t_ref=any_value');
    });

    it('should assign the value of the WTREF tracking value to eVar53', function() {
        window.utag.data = {
            'dom.hash': 'any_value'
        };

        s._T_REFTracking.setVariables(s);

        expect(s.eVar53).toBe('any_value');
    });

    it('should assign the value of the TREF tracking value to eVar53', function() {
        window.location.search = 't_ref=any_value';

        s._T_REFTracking.setVariables(s);

        expect(s.eVar53).toBe('t_ref=any_value');
    });
});
