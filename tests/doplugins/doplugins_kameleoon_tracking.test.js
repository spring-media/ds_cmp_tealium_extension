const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('setKameleoonTracking', () => {
    let s;
    let processOmnitureMock;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        processOmnitureMock = jest.fn();
        windowMock.Kameleoon = {
            API: {
                Tracking: {
                    processOmniture: processOmnitureMock
                }
            }
        };
        jest.spyOn(global, 'window', 'get').mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should call kameleoon process omniture if s.linkName is Kameleoon Tracking and window.Kameleoon exists', () => {
        s.linkName = 'Kameleoon Tracking';

        s._setKameleoonTracking(s);

        expect(processOmnitureMock).toHaveBeenCalled();
        expect(window.kameleoonOmnitureCallSent).toBe(true);
    });

    it('should not set kameleoon tracking if s.linkName is not Kameleoon Tracking', () => {
        s._setKameleoonTracking(s);

        expect(processOmnitureMock).not.toHaveBeenCalled();
        expect(window.kameleoonOmnitureCallSent).toBeUndefined();
    });
});
