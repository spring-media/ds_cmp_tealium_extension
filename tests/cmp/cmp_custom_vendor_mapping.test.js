const cmpCustomVendorMapping = require('../../extensions/cmp/cmp_custom_vendor_mapping');

describe('CMP Custom Vendor Mapping', () => {
    beforeEach(() => {
        // Mock document.cookie
        let cookies = '';
        Object.defineProperty(document, 'cookie', {
            get: () => cookies,
            set: value => {
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

        test('returns the correct value for fitbook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('fitbook.de', 'piano')).toEqual([43]);
        });

        test('returns the correct value for fitbook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('fitbook-magazine.com', 'piano')).toEqual([43]);
        });

        test('returns the correct value for myhomebook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('myhomebook.de', 'piano')).toEqual([46]);
        });

        test('returns the correct value for myhomebook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('myhomebook-magazine.com', 'piano')).toEqual([46]);
        });

        test('returns the correct value for petbook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('petbook.de', 'piano')).toEqual([83]);
        });

        test('returns the correct value for petbook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('petbook-magazine.com', 'piano')).toEqual([83]);
        });

        test('returns the correct value for stylebook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('stylebook.de', 'piano')).toEqual([32]);
        });

        test('returns the correct value for stylebook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('stylebook-magazine.com', 'piano')).toEqual([32]);
        });

        test('returns the correct value for techbook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('techbook.de', 'piano')).toEqual([87]);
        });

        test('returns the correct value for techbook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('techbook-magazine.com', 'piano')).toEqual([87]);
        });

        test('returns the correct value for travelbook.de', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('travelbook.de', 'piano')).toEqual([48]);
        });

        test('returns the correct value for travelbook-magazine.com', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('travelbook-magazine.com', 'piano')).toEqual([48]);
        });

        test('returns null for unknown domains', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('unknown.com', 'piano')).toBeNull();
        });

        test('returns correct value for welt.de with kameleoon vendor', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('welt.de', 'kameleoon')).toEqual([209, 242]);
        });

        test('returns correct value for bild.de with googleAds vendor', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('bild.de', 'googleAds')).toEqual([21]);
        });

        test('returns correct value for welt.de with kilkaya vendor', () => {
            expect(cmpCustomVendorMapping.getDomainTagValue('welt.de', 'kilkaya')).toEqual([298]);
        });
    });

    describe('getCookie', () => {
        test('returns the correct cookie value', () => {
            document.cookie = 'test_cookie=test_value;secure';
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
            document.cookie = 'test_cookie=test_value;secure';
            cmpCustomVendorMapping.deleteCookie('test_cookie');
            expect(document.cookie).not.toContain('test_cookie=test_value');
        });
    });

    describe('fetchConsentData', () => {
        test('resolves with data when __tcfapi succeeds', async() => {
            const mockData = { grants: { 92: { vendorGrant: true } } };
            window.__tcfapi.mockImplementation((cmd, ver, cb) => cb(mockData, true));
            await expect(cmpCustomVendorMapping.fetchConsentData()).resolves.toEqual(mockData);
        });

        test('rejects when __tcfapi fails', async() => {
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

    describe('getGrantedVendors', () => {
        beforeEach(() => {
            window.__tcfapi = jest.fn();
        });

        test('should process vendor grants and set cookie', async() => {
            const mockData = {
                grants: {
                    '92': { vendorGrant: true },
                    '5ed7a9a9e0e22001da9d52ad': { vendorGrant: true },
                    '5e542b3a4cd8884eb41b5a72': { vendorGrant: false }
                }
            };

            window.__tcfapi.mockImplementation((cmd, ver, cb) => {
                cb(mockData, true);
            });

            await new Promise(resolve => {
                cmpCustomVendorMapping.getGrantedVendors((vendors, isNew) => {
                    expect(vendors).toContain('1plusX,');
                    expect(vendors).toContain('adobe_analytics,');
                    expect(vendors).not.toContain('google_analytics');
                    expect(isNew).toBe(true);
                    resolve();
                });
            });
        });

        test('should handle empty grants data', async() => {
            const mockData = { grants: {} };

            window.__tcfapi.mockImplementation((cmd, ver, cb) => {
                cb(mockData, true);
            });

            await new Promise(resolve => {
                cmpCustomVendorMapping.getGrantedVendors((vendors) => {
                    expect(vendors).toBe('');
                    resolve();
                });
            });
        });

        test('should handle null data gracefully', async() => {
            window.__tcfapi.mockImplementation((cmd, ver, cb) => {
                cb(null, true);
            });

            await new Promise(resolve => {
                setTimeout(() => {
                    // Should not call callback if data is null
                    resolve();
                }, 100);
            });
        });

        test('should call callback with isNew=false when cookie already exists', async() => {
            document.cookie = 'cmp_cv_list=existing_vendor;secure';

            const mockData = {
                grants: {
                    '92': { vendorGrant: true }
                }
            };

            window.__tcfapi.mockImplementation((cmd, ver, cb) => {
                cb(mockData, true);
            });

            await new Promise(resolve => {
                cmpCustomVendorMapping.getGrantedVendors((vendors, isNew) => {
                    expect(isNew).toBe(false);
                    resolve();
                });
            });
        });
    });

    describe('processUtag', () => {
        beforeEach(() => {
            // Reset the __utag_view_fired flag before each test
            window.__utag_view_fired = false;

            // Mock document.cookie
            document.cookie = ';secure';

            // Mock document.URL
            document.URL = '';

            // Mock window.utag.view
            window.utag = {
                view: jest.fn(),
                data: {}
            };

            // Mock the URL
            Object.defineProperty(window, 'location', {
                value: {
                    hostname: 'bild.de',
                    href: 'https://www.bild.de'
                },
                writable: true
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
            document.cookie = 'cmp_cv_list=adobe_analytics;secure';
            window.location.hostname = 'club.bild.de';
            cmpCustomVendorMapping.processUtag();

            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, global.domainTagValues.adobeClub.bild);
        });

        test('calls utag.view for piano vendor on bild.de', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'cmp_cv_list=piano;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [16]);
        });

        test('calls utag.view for google fallback on bild.de', () => {
            document.cookie = 'cmp_cv_list=google_fallback;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [21]);
        });

        test('calls utag.view for kameleoon vendor', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'cmp_cv_list=kameleoon;secure';
            window.utag.data.user_hasPurSubscription = 'false';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [24]);
        });

        test('calls utag.view for piano vendor on welt.de', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=piano;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [230]);
        });

        test('calls utag.view for google fallback on welt.de', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=google_fallback;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [147]);
        });

        test('calls utag.view for kameleoon vendor on welt.de', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=kameleoon;secure';
            window.utag.data.user_hasPurSubscription2 = 'false';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [209, 242]);
        });

        test('does not call utag.view for kameleoon when user has pur subscription (fallback cookie)', () => {
            window.location.hostname = 'welt.de';
            document.cookie = '__utag_cmp_vendor_list=kameleoon;secure';
            window.utag.data.user_hasPurSubscription2 = 'true';
            window.utag.data['cp._cpauthhint'] = '1';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).not.toHaveBeenCalled();
        });

        test('calls utag.view for kameleoon even with pur subscription (regular cookie)', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=kameleoon;secure';
            window.utag.data.user_hasPurSubscription2 = 'true';
            window.utag.data['cp._cpauthhint'] = '1';
            cmpCustomVendorMapping.processUtag();
            // Regular cookie (cmp_cv_list) bypasses pur subscription check
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [209, 242]);
        });

        test('calls utag.view for kilkaya vendor on welt.de', () => {
            window.location.hostname = 'welt.de';
            document.cookie = 'cmp_cv_list=kilkaya;secure';
            window.k5aMeta = {};
            cmpCustomVendorMapping.processUtag();
            expect(window.k5aMeta.consent).toBe(1);
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [298]);
        });

        test('calls utag.view with fallback cookie (__utag_cmp_vendor_list)', () => {
            window.location.hostname = 'bild.de';
            document.cookie = '__utag_cmp_vendor_list=piano;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [16]);
        });

        test('does not call utag.view for piano when domain does not match', () => {
            window.location.hostname = 'unknown.com';
            document.cookie = 'cmp_cv_list=piano;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).not.toHaveBeenCalled();
        });

        test('handles multiple vendors in cookie', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'cmp_cv_list=piano,google_fallback,kameleoon;secure';
            window.utag.data.user_hasPurSubscription2 = 'false';
            cmpCustomVendorMapping.processUtag();
            // Should be called 3 times for piano, google_fallback, and kameleoon
            expect(window.utag.view).toHaveBeenCalledTimes(3);
        });

        test('calls utag.view for piano on fitbook.de', () => {
            window.location.hostname = 'fitbook.de';
            document.cookie = 'cmp_cv_list=piano;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).toHaveBeenCalledWith(window.utag.data, null, [43]);
        });

        test('does not call utag.view when no matching cookie exists', () => {
            window.location.hostname = 'bild.de';
            document.cookie = 'some_other_cookie=value;secure';
            cmpCustomVendorMapping.processUtag();
            expect(window.utag.view).not.toHaveBeenCalled();
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
