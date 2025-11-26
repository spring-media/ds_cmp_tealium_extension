/**
 * @jest-environment jsdom
 */

describe('k5a_meta_conversion', () => {
    let originalUtag;

    beforeEach(() => {
        // Clean up window.k5aMeta before each test
        delete window.k5aMeta;
        
        // Save original utag if it exists
        originalUtag = window.utag;
        
        // Mock utag
        window.utag = {
            data: {},
            cfg: {
                utDebug: true
            },
            DB: jest.fn()
        };

        // Clean up global variables
        delete global.a;
        delete global.b;
    });

    afterEach(() => {
        // Clean up
        delete window.k5aMeta;
        if (originalUtag) {
            window.utag = originalUtag;
        } else {
            delete window.utag;
        }
        delete global.a;
        delete global.b;
        jest.resetModules();
    });

    it('should set conversion flag and cntTag for checkout success event', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.conversion).toBe(1);
        expect(Array.isArray(window.k5aMeta.cntTag)).toBe(true);
        expect(window.k5aMeta.cntTag).toContain('offer_12345');
        expect(window.utag.DB).toHaveBeenCalledWith('k5aMeta conversion set for checkout success');
    });

    it('should not set conversion if event_name is not "checkout"', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'other_event',
            event_action: 'success',
            offer_id: '12345'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeUndefined();
        expect(window.utag.DB).not.toHaveBeenCalledWith('k5aMeta conversion set for checkout success');
    });

    it('should not set conversion if event_action is not "success"', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'failure',
            offer_id: '12345'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeUndefined();
        expect(window.utag.DB).not.toHaveBeenCalledWith('k5aMeta conversion set for checkout success');
    });

    it('should initialize k5aMeta object if it does not exist', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        expect(window.k5aMeta).toBeUndefined();

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeDefined();
        expect(typeof window.k5aMeta).toBe('object');
    });

    it('should preserve existing k5aMeta properties when setting conversion', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        window.k5aMeta = {
            existingKey: 'existingValue',
            url: 'https://example.com'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.existingKey).toBe('existingValue');
        expect(window.k5aMeta.url).toBe('https://example.com');
        expect(window.k5aMeta.conversion).toBe(1);
    });

    it('should initialize cntTag array if it does not exist', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(Array.isArray(window.k5aMeta.cntTag)).toBe(true);
        expect(window.k5aMeta.cntTag.length).toBe(1);
    });

    it('should append to existing cntTag array', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '67890'
        };

        window.k5aMeta = {
            cntTag: ['existing_tag']
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.cntTag).toEqual(['existing_tag', 'offer_67890']);
    });

    it('should not add offer tag if offer_id is missing', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.conversion).toBe(1);
        expect(Array.isArray(window.k5aMeta.cntTag)).toBe(true);
        expect(window.k5aMeta.cntTag.length).toBe(0);
    });

    it('should handle offer_id as number', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: 99999
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.cntTag).toContain('offer_99999');
    });

    it('should convert offer_id to string when creating tag', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: { toString: () => 'special_id' }
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.cntTag).toContain('offer_special_id');
    });

    it('should handle non-array cntTag by replacing it with an array', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        window.k5aMeta = {
            cntTag: 'not_an_array'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(Array.isArray(window.k5aMeta.cntTag)).toBe(true);
        expect(window.k5aMeta.cntTag).toContain('offer_12345');
    });

    it('should handle null or undefined b parameter gracefully', () => {
        global.a = 'some_value';
        global.b = null;

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeUndefined();
    });

    it('should handle errors gracefully and log them', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        // Force an error by making window.k5aMeta read-only
        Object.defineProperty(window, 'k5aMeta', {
            value: null,
            writable: false,
            configurable: true
        });

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.utag.DB).toHaveBeenCalledWith(expect.stringContaining('k5aMeta conversion error:'));

        // Clean up the read-only property
        delete window.k5aMeta;
    });

    it('should handle missing utag gracefully', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        delete window.utag;
        global.utag = undefined;

        // With the guard in place, the code should not throw even if utag is missing
        expect(() => {
            require('../../extensions/kilkaya/k5a_meta_conversion.js');
        }).not.toThrow();

        // The conversion should still be set
        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.conversion).toBe(1);
        expect(window.k5aMeta.cntTag).toContain('offer_12345');
    });
    it('should work when utag is defined but utag.data is missing', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        window.utag = {
            DB: jest.fn()
        };
        // utag.data is undefined

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta).toBeDefined();
        expect(window.k5aMeta.conversion).toBe(1);
        expect(window.k5aMeta.cntTag).toContain('offer_12345');
    });

    it('should handle event_name and event_action type coercion', () => {
        global.a = 'some_value';
        global.b = {
            event_name: { toString: () => 'checkout' },
            event_action: { toString: () => 'success' },
            offer_id: '12345'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.conversion).toBe(1);
        expect(window.k5aMeta.cntTag).toContain('offer_12345');
    });

    it('should handle empty offer_id', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: ''
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.conversion).toBe(1);
        expect(window.k5aMeta.cntTag.length).toBe(0);
    });

    it('should handle offer_id with special characters', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: 'special-offer_123@test'
        };

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.cntTag).toContain('offer_special-offer_123@test');
    });

    it('should not log when debug mode is disabled', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        window.utag.cfg.utDebug = false;

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.k5aMeta.conversion).toBe(1);
        expect(window.utag.DB).not.toHaveBeenCalled();
    });

    it('should not log errors when debug mode is disabled', () => {
        global.a = 'some_value';
        global.b = {
            event_name: 'checkout',
            event_action: 'success',
            offer_id: '12345'
        };

        window.utag.cfg.utDebug = false;

        // Force an error
        Object.defineProperty(window, 'k5aMeta', {
            value: null,
            writable: false,
            configurable: true
        });

        require('../../extensions/kilkaya/k5a_meta_conversion.js');

        expect(window.utag.DB).not.toHaveBeenCalled();

        // Clean up
        delete window.k5aMeta;
    });
});
