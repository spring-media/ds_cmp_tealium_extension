/**
 * @jest-environment jsdom
 */

describe('k5a_meta_init', () => {
    beforeEach(() => {
        // Clean up window.k5aMeta before each test
        delete window.k5aMeta;
    });

    afterEach(() => {
        // Clean up after each test
        delete window.k5aMeta;
    });

    it('should initialize window.k5aMeta as an empty object if it does not exist', () => {
        // Execute the extension code
        require('../../extensions/kilkaya/k5a_meta_init.js');

        expect(window.k5aMeta).toBeDefined();
        expect(typeof window.k5aMeta).toBe('object');
        expect(window.k5aMeta).toEqual({});
    });

    it('should not overwrite window.k5aMeta if it already exists as an object', () => {
        // Pre-populate k5aMeta with some data
        window.k5aMeta = { existingKey: 'existingValue' };

        // Execute the extension code
        jest.resetModules();
        require('../../extensions/kilkaya/k5a_meta_init.js');

        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.existingKey).toBe('existingValue');
    });

    it('should initialize window.k5aMeta if it exists but is not an object', () => {
        // Set k5aMeta to a non-object value
        window.k5aMeta = 'not an object';

        // Execute the extension code
        jest.resetModules();
        require('../../extensions/kilkaya/k5a_meta_init.js');

        expect(window.k5aMeta).toBeDefined();
        expect(typeof window.k5aMeta).toBe('object');
        expect(window.k5aMeta).toEqual({});
    });

    it('should initialize window.k5aMeta if it is null', () => {
        window.k5aMeta = null;

        // Execute the extension code
        jest.resetModules();
        require('../../extensions/kilkaya/k5a_meta_init.js');

        expect(window.k5aMeta).toBeDefined();
        expect(typeof window.k5aMeta).toBe('object');
        expect(window.k5aMeta).toEqual({});
    });

    it('should initialize window.k5aMeta if it is undefined', () => {
        window.k5aMeta = undefined;

        // Execute the extension code
        jest.resetModules();
        require('../../extensions/kilkaya/k5a_meta_init.js');

        expect(window.k5aMeta).toBeDefined();
        expect(typeof window.k5aMeta).toBe('object');
        expect(window.k5aMeta).toEqual({});
    });
});
