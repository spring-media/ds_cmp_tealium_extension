/**
 * Tests for before_load_rules_data_merge.js
 * Tests data merging and environment variable setting in Before Load Rules scope
 */

/* global utag, a, b */

describe('Before Load Rules Data Merge', () => {
    let extensionCode;
    let mockUtag;
    let mockA;
    let mockB;

    beforeEach(() => {
        // Mock utag object
        mockUtag = {
            data: {},
            cfg: {
                path: '//tags.tiqcdn.com/utag/welt/main/prod/utag.js'
            },
            ut: {
                merge: jest.fn()
            }
        };

        mockA = { key1: 'valueA' };
        mockB = { key2: 'valueB' };

        global.utag = mockUtag;
        global.a = mockA;
        global.b = mockB;
        global.console.error = jest.fn();

        extensionCode = () => {
            try {
                if (typeof b !== 'undefined' && typeof utag !== 'undefined' && utag.ut) {
                    utag.ut.merge(b, utag.data, 0);
                    utag.ut.merge(utag.data, b, 1);
                }

                if (typeof utag !== 'undefined' && typeof utag.data['ut.env'] === 'undefined') {
                    if (utag.cfg && utag.cfg.path) {
                        const env = utag.cfg.path.split('/');
                        utag.data['ut.env'] = env[env.length - 2];
                    }
                }

                if (location.hostname.includes('go.welt.de')) {
                    if (typeof a !== 'undefined' && typeof utag !== 'undefined' && utag.ut) {
                        utag.ut.merge(a, utag.data, 0);
                        utag.ut.merge(utag.data, a, 1);
                    }
                }
            } catch (e) {
                console.error('[TEALIUM BEFORE LOAD RULES] Error:', e);
            }
        };
    });

    afterEach(() => {
        delete global.utag;
        delete global.a;
        delete global.b;
        jest.restoreAllMocks();
    });

    it('should merge b object into utag.data', () => {
        extensionCode();

        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockB, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockUtag.data, mockB, 1);
    });

    it('should set ut.env from utag.cfg.path', () => {
        extensionCode();

        expect(mockUtag.data['ut.env']).toBe('prod');
    });

    it('should merge a object on go.welt.de domain', () => {
        delete global.location;
        global.location = { hostname: 'go.welt.de' };

        extensionCode();

        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockA, mockUtag.data, 0);
        expect(mockUtag.ut.merge).toHaveBeenCalledWith(mockB, mockUtag.data, 0);
        expect(mockUtag.data['ut.env']).toBe('prod');
    });

    it('should not merge a object on non-go.welt.de domains', () => {
        delete global.location;
        global.location = { hostname: 'www.welt.de' };

        extensionCode();

        expect(mockUtag.ut.merge).toHaveBeenCalledTimes(2); // Only b merges
        expect(mockUtag.ut.merge).not.toHaveBeenCalledWith(mockA, mockUtag.data, 0);
    });

    it('should handle errors gracefully', () => {
        mockUtag.ut.merge = jest.fn(() => {
            throw new Error('Test error');
        });

        expect(() => extensionCode()).not.toThrow();
        expect(console.error).toHaveBeenCalled();
    });
});
