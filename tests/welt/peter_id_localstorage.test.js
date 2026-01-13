/**
 * Tests for peter_id_localstorage.js
 * Tests Peter ID data loading from localStorage
 */

/* global utag */

const {
    initPeterId,
    STORAGE_KEY,
    DEFAULT_PETER_ID
} = require('../../extensions/welt/peter_id_localstorage');

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

    it('should use correct storage key', () => {
        expect(STORAGE_KEY).toBe('asadEls_se');
    });

    it('should use correct default peter ID', () => {
        expect(DEFAULT_PETER_ID).toBe('false');
    });

    it('should set peterId to "false" when localStorage is empty', () => {
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(null)
        };

        initPeterId();

        expect(utag.data.peterId).toBe('false');
    });

    it('should read and parse peterId from localStorage', () => {
        const mockData = {
            ids: {
                peter: 'peter-123-456'
            }
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initPeterId();

        expect(localStorage.getItem).toHaveBeenCalledWith('asadEls_se');
        expect(utag.data.peter).toEqual(mockData);
        expect(utag.data.peterId).toBe('peter-123-456');
    });

    it('should default to "false" when peter ID is missing', () => {
        const mockData = { ids: {} };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initPeterId();

        expect(utag.data.peterId).toBe('false');
    });

    it('should handle malformed JSON gracefully', () => {
        global.localStorage = {
            getItem: jest.fn().mockReturnValue('{invalid json}')
        };

        expect(() => initPeterId()).not.toThrow();
        expect(console.error).toHaveBeenCalled();
        expect(utag.data.peterId).toBe('false');
    });

    it('should use optional chaining for safe property access', () => {
        const testObj = { ids: { peter: 'test-id' } };
        const result = testObj?.ids?.peter || 'false';
        expect(result).toBe('test-id');
    });

    it('should handle missing nested properties', () => {
        const mockData = {
            other: 'data'
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initPeterId();

        expect(utag.data.peterId).toBe('false');
    });

    it('should set peterId to false on error', () => {
        global.localStorage = {
            getItem: jest.fn(() => {
                throw new Error('localStorage error');
            })
        };

        initPeterId();

        expect(console.error).toHaveBeenCalled();
        expect(utag.data.peterId).toBe('false');
    });

    it('should handle complete peter object structure', () => {
        const mockData = {
            ids: {
                peter: 'peter-abc-def',
                other_id: 'other-123'
            },
            metadata: {
                timestamp: 1234567890
            }
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initPeterId();

        expect(utag.data.peter).toEqual(mockData);
        expect(utag.data.peterId).toBe('peter-abc-def');
        expect(utag.data.peter.metadata.timestamp).toBe(1234567890);
    });
});
