const cmpCustomVendorMapping = require('../../extensions/cmp/cmp_custom_vendor_mapping');
const browserMocks = require('../mocks/browserMocks');


describe('CMP Custom Vendor Mapping', () => {
    beforeEach(() => {
        // Mock document.cookie
        let cookies = '';
        Object.defineProperty(document, 'cookie', {
            get: () => cookies,
            set: (value) => {
                const parts = value.split(';');
                const cookieName = parts[0].split('=')[0].trim();
                if (parts.some(part => part.trim().startsWith('expires='))) {
                    cookies = cookies.replace(new RegExp(`(^|;)\\s*${cookieName}=[^;]*;?`), '');
                } else {
                    cookies += `${parts[0]}; `;
                }
            },
            configurable: true
        });

        // Mock window object and functions
        global.window = {
            __utag_view_fired: false,
            utag: { view: jest.fn(), data: {} }
        };
        window.location = { hostname: 'test.com' };
        window.__tcfapi = jest.fn();
        window.utag = { view: jest.fn(), data: {} };

        // Mock domainTagValues
        global.domainTagValues = {
            adobeDeals: { bild: [5] },
            adobeClub: { bild: [5] },
            window: { location: { hostname: 'google_fallback' } }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getDomainTagValue', () => {
        test('returns the correct value for welt.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('welt.de', 'piano')).toEqual([230]);
        });

        test('returns the correct value for bild.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('bild.de', 'piano')).toEqual([16]);
        });

        test('returns an empty array for unknown domains', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('unknown.com', 'piano')).toEqual([]);
        });
    });

    describe('getCookie', () => {
        test('returns the correct cookie value', () => {
            document.cookie = 'test_cookie=test_value';
            expect(cmpCustomVendorMapping.getCookie('test_cookie')).toBe('test_value');
        });

        test('returns null for a non-existing cookie', () => {
            expect(cmpCustomVendorMapping.getCookie('non_existing')).toBe(null);
        });
    });

    describe('setCookie', () => {
        test('sets a cookie with the correct name and value', () => {
            cmpCustomVendorMapping.setCookie('test_cookie', 'test_value');
            expect(document.cookie).toContain('test_cookie=test_value');
        });
    });

    describe('deleteCookie', () => {
        test('deletes a cookie by setting its expiration date to the past', () => {
            document.cookie = 'test_cookie=test_value';
            cmpCustomVendorMapping.deleteCookie('test_cookie');
            expect(document.cookie).not.toContain('test_cookie=test_value');
        });
    });

    describe('fetchConsentData', () => {
        test('resolves with data when __tcfapi succeeds', async () => {
            const mockData = { grants: { '92': { vendorGrant: true } } };
            window.__tcfapi.mockImplementation((cmd, ver, cb) => cb(mockData, true));
            await expect(cmpCustomVendorMapping.fetchConsentData()).resolves.toEqual(mockData);
        });

        test('rejects when __tcfapi fails', async () => {
            window.__tcfapi.mockImplementation((cmd, ver, cb) => cb(null, false));
            await expect(cmpCustomVendorMapping.fetchConsentData()).rejects.toBeUndefined();
        });
    });

    describe('spCMPisEnabled', () => {
        test('returns true if __tcfapi is available', () => {
            window.__tcfapi = jest.fn();
            expect(!!cmpCustomVendorMapping.spCMPisEnabled()).toBe(true);
        });

        test('returns false if __tcfapi is not available', () => {
            window.__tcfapi = '';
            expect(!!cmpCustomVendorMapping.spCMPisEnabled()).toBe(false);
        });
    });

    describe.only('processUtag', () => {

        beforeEach(() => {
            // Reset the __utag_view_fired flag before each test
            window.__utag_view_fired = false;
    
            // Mock document.cookie
            document.cookie = '';

            // Mock document.URL
            document.URL = '';
    
            // Mock window.utag.view
            window.utag = {
                view: jest.fn(),
                data: {},
            };
    
            // Mock the URL
            Object.defineProperty(window, 'location', {
                value: {
                    hostname: 'bild.de',
                    href: 'https://www.bild.de',
                },
                writable: true,
            });
        });
    

        test('sets __utag_view_fired to true', () => {
            cmpCustomVendorMapping.processUtag();
            expect(window.__utag_view_fired).toBe(true);
        });
    
        test('does nothing if __utag_view_fired is already true', () => {
            window.__utag_view_fired = true;
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).not.toHaveBeenCalled();
        });
    
        test('calls utag.view for Adobe club on bild.de with appropriate parameters', () => {
            window.utag.data['cp.utag_main_cmp_after'] = 'true';
            document.cookie = 'cmp_cv_list=adobe_analytics;';
            window.location.hostname = 'club.bild.de';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, domainTagValues.adobeClub.bild);
        });
    
        test('calls utag.view for piano vendor on bild.de', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'cmp_cv_list=piano;';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [16]);
        });
    
        test('calls utag.view for google fallback on bild.de', () => {
            document.cookie = 'cmp_cv_list=google_fallback;';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [21]);
        });
    
        test('calls utag.view for AGF vendor on welt.de', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=agf;';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [251]);
        });
    
        test('calls utag.view for kameleoon vendor', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'cmp_cv_list=kameleoon;';
            window.utag.data.user_hasPurSubscription = 'false';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [24]);
        });
    });

    describe('init', () => {
        test('initializes correctly if CMP is enabled', () => {
            window.__tcfapi = jest.fn();
            cmpCustomVendorMapping.init();
            expect(window.__tcfapi).toHaveBeenCalled();
        });

        test('does not initialize if CMP is not enabled', () => {
            window.__tcfapi = undefined;
            cmpCustomVendorMapping.init();
            expect(window.__tcfapi).toBeUndefined();
        });
    });
});