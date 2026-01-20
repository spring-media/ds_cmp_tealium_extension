/**
 * Tests for before_load_rules_data_merge.js
 * Tests data merging and environment setup for Before Load Rules
 */

const { beforeLoadRulesDataMerge } = require('../../extensions/welt/before_load_rules_data_merge');

describe('Before Load Rules Data Merge', () => {
    let mockUtag;
    let mockConsole;
    let originalLocation;

    beforeEach(() => {
        // Mock utag with merge function
        mockUtag = {
            data: {},
            ut: {
                merge: jest.fn()
            },
            cfg: {
                path: 'https://tags.tiqcdn.com/utag/welt/main/prod/utag.js'
            }
        };
        global.utag = mockUtag;

        // Mock console
        mockConsole = {
            error: jest.fn()
        };
        global.console = mockConsole;

        // Mock location
        originalLocation = global.location;
        delete global.location;
        global.location = { hostname: 'www.welt.de' };
    });

    afterEach(() => {
        delete global.utag;
        delete global.a;
        delete global.b;
        global.location = originalLocation;
        jest.restoreAllMocks();
    });

    it('should merge b object into utag.data', () => {
        global.b = { test_field: 'test_value' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.ut.merge).toHaveBeenCalledWith(global.b, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, global.b, 1);
    });

    it('should set ut.env from utag.cfg.path', () => {
        global.b = { test: 'data' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.data['ut.env']).toBe('prod');
    });

    it('should not override existing ut.env', () => {
        mockUtag.data['ut.env'] = 'qa';
        global.b = { test: 'data' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.data['ut.env']).toBe('qa');
    });

    it('should merge a object on go.welt.de domain', () => {
        global.location = { hostname: 'go.welt.de' };
        global.a = { go_field: 'go_value' };
        global.b = { test_field: 'test_value' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.ut.merge).toHaveBeenCalledWith(global.a, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, global.a, 1);
    });

    it('should not merge a object on non-go.welt.de domains', () => {
        global.location = { hostname: 'www.welt.de' };
        global.a = { go_field: 'go_value' };
        global.b = { test_field: 'test_value' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.ut.merge).not.toHaveBeenCalledWith(global.a, mockUtag.data, 0);
        expect(mockUtag.ut.merge).not.toHaveBeenCalledWith(mockUtag.data, global.a, 1);
    });

    it('should handle missing b object gracefully', () => {
        delete global.b;

        expect(() => beforeLoadRulesDataMerge()).not.toThrow();
        expect(mockUtag.ut.merge).not.toHaveBeenCalled();
    });

    it('should handle missing utag.ut gracefully', () => {
        delete mockUtag.ut;
        global.b = { test: 'data' };

        expect(() => beforeLoadRulesDataMerge()).not.toThrow();
    });

    it('should handle missing utag.cfg.path gracefully', () => {
        delete mockUtag.cfg;
        global.b = { test: 'data' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.data['ut.env']).toBeUndefined();
    });

    it('should extract environment from different path formats', () => {
        mockUtag.cfg.path = 'https://tags.tiqcdn.com/utag/welt/main/dev/utag.js';
        global.b = { test: 'data' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.data['ut.env']).toBe('dev');
    });

    it('should handle errors gracefully', () => {
        mockUtag.ut.merge = jest.fn(() => {
            throw new Error('Merge error');
        });
        global.b = { test: 'data' };

        expect(() => beforeLoadRulesDataMerge()).not.toThrow();
        expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should merge both a and b on go.welt.de', () => {
        global.location = { hostname: 'go.welt.de' };
        global.a = { go_field: 'go_value' };
        global.b = { test_field: 'test_value' };

        beforeLoadRulesDataMerge();

        // Should merge b
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(global.b, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, global.b, 1);

        // Should merge a
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(global.a, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, global.a, 1);
    });

    it('should work with subdomain go.welt.de', () => {
        global.location = { hostname: 'subdomain.go.welt.de' };
        global.a = { go_field: 'go_value' };
        global.b = { test_field: 'test_value' };

        beforeLoadRulesDataMerge();

        expect(mockUtag.ut.merge).toHaveBeenCalledWith(global.a, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, global.a, 1);
    });
});
