/**
 * Tests for Martech ID mtid_localstorage.js
 * Tests Martech ID data loading from localStorage
 */

/* global utag */

const { initMartechId, STORAGE_KEY, DEFAULT_MARTECH_ID } = require('../extensions/martech_id_localstorage');

describe('Martech ID LocalStorage', () => {
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
        expect(STORAGE_KEY).toBe('asadEls_utiq');
    });

    it('should use correct default martech ID', () => {
        expect(DEFAULT_MARTECH_ID).toBe('false');
    });

    it('should set martechId to "false" when localStorage is empty', () => {
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(null)
        };

        initMartechId();

        expect(utag.data.martechId).toBe('false');
    });

    it('should read and parse martechId from localStorage', () => {
        const mockData = {
            ids: {
                mtid: 'mtid-123-456'
            }
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initMartechId();

        expect(localStorage.getItem).toHaveBeenCalledWith('asadEls_utiq');
        expect(utag.data.martech).toEqual(mockData);
        expect(utag.data.martechId).toBe('mtid-123-456');
    });

    it('should default to "false" when martech ID is missing', () => {
        const mockData = { ids: {} };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initMartechId();

        expect(utag.data.martechId).toBe('false');
    });

    it('should handle malformed JSON gracefully', () => {
        global.localStorage = {
            getItem: jest.fn().mockReturnValue('{invalid json}')
        };

        expect(() => initMartechId()).not.toThrow();
        expect(console.error).toHaveBeenCalled();
        expect(utag.data.martechId).toBe('false');
    });

    it('should use optional chaining for safe property access', () => {
        const testObj = { ids: { mtid: 'test-id' } };
        const result = testObj?.ids?.mtid || 'false';
        expect(result).toBe('test-id');
    });

    it('should handle missing nested properties', () => {
        const mockData = {
            other: 'data'
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initMartechId();

        expect(utag.data.martechId).toBe('false');
    });

    it('should set martechId to false on error', () => {
        global.localStorage = {
            getItem: jest.fn(() => {
                throw new Error('localStorage error');
            })
        };

        initMartechId();

        expect(console.error).toHaveBeenCalled();
        expect(utag.data.martechId).toBe('false');
    });

    it('should handle complete martech object structure', () => {
        const mockData = {
            ids: {
                mtid: 'mtid-abc-def',
                other_id: 'other-123'
            },
            metadata: {
                timestamp: 1234567890
            }
        };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(JSON.stringify(mockData))
        };

        initMartechId();

        expect(utag.data.martech).toEqual(mockData);
        expect(utag.data.martechId).toBe('mtid-abc-def');
        expect(utag.data.martech.metadata.timestamp).toBe(1234567890);
    });
});
