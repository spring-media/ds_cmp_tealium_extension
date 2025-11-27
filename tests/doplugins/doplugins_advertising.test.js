const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('setAdvertingBranch', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        windowMock.ASCDP = {
            pageSet: {
                branch: ''
            }
        };
        jest.spyOn(global, 'window', 'get').mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set eVar219 to noAdlib if is ASCDP not defined', () => {
        s._setAdvertisingBranch(s);

        expect(s.eVar219).toBe('noAdlib');

    });

    it('should set eVar219 to ASCDP branch if it is defined', () => {
        window.ASCDP.pageSet.branch = 'testbranch';
        s._setAdvertisingBranch(s);

        expect(s.eVar219).toBe(window.ASCDP.pageSet.branch);

    });
});
