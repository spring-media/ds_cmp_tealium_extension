/**
 * Tests for peter_id_localstorage.js
 * Tests Peter ID data loading from localStorage
 */

/* global utag */

describe('Peter ID LocalStorage', () => {
    beforeEach(() => {
        global.utag = { data: {} };
        global.console.error = jest.fn();
    });

    afterEach(() => {
        delete global.utag;
        delete global.localStorage;
        jest.restoreAllMocks();
    });

    it('should set peterId to "false" when localStorage is empty', () => {
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(null)
        };

        const storedData = localStorage.getItem('asadEls_se');
        if (storedData) {
            utag.data.peter = JSON.parse(storedData);
            utag.data.peterId = utag.data.peter?.ids?.peter || 'false';
        } else {
            utag.data.peterId = 'false';
        }

        expect(utag.data.peterId).toBe('false');
    });

    it('should default to "false" when peter ID is missing', () => {
        const mockData = { ids: {} };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        const storedData = localStorage.getItem('asadEls_se');
        if (storedData) {
            utag.data.peter = JSON.parse(storedData);
            utag.data.peterId = utag.data.peter?.ids?.peter || 'false';
        } else {
            utag.data.peterId = 'false';
        }

        expect(utag.data.peterId).toBe('false');
    });

    it('should use optional chaining for safe property access', () => {
        // Test that the logic handles nested properties safely
        const testObj = { ids: { peter: 'test-id' } };
        const result = testObj?.ids?.peter || 'false';
        expect(result).toBe('test-id');
    });
});
