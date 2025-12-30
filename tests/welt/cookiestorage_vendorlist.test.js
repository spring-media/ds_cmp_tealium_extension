/**
 * Tests for cookiestorage_vendorlist.js
 * Tests cookie reading and consentedVendors variable setting in Before Load Rules scope
 */

const {
    setCookieStorageVendorList
} = require('../../extensions/welt/cookiestorage_vendorlist');

describe('CookieStorage VendorList', () => {
    let mockB;

    beforeEach(() => {
        mockB = {};
        global.console.error = jest.fn();
        global.console.warn = jest.fn();

        // Reset document.cookie
        Object.defineProperty(document, 'cookie', {
            writable: true,
            configurable: true,
            value: ''
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set consentedVendors from cmp_cv_list cookie', () => {
        document.cookie = 'cmp_cv_list=vendor1,vendor2,vendor3';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('vendor1,vendor2,vendor3');
    });

    it('should set consentedVendors from cmp_cv_list cookie with multiple cookies', () => {
        document.cookie =
            'other_cookie=value; cmp_cv_list=vendor4,vendor5; another_cookie=value2';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('vendor4,vendor5');
    });

    it('should set empty string when cmp_cv_list cookie does not exist', () => {
        document.cookie = 'other_cookie=value';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('');
    });

    it('should set empty string when document.cookie is empty', () => {
        document.cookie = '';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('');
    });

    it('should handle cmp_cv_list cookie with spaces', () => {
        document.cookie = '  cmp_cv_list  =  vendor6,vendor7  ';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('vendor6,vendor7  ');
    });

    it('should set empty string if cookie match fails', () => {
        document.cookie = 'cmp_cv_list=';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('');
    });

    it('should warn and return early when b object is undefined', () => {
        setCookieStorageVendorList(undefined, document);

        expect(console.warn).toHaveBeenCalledWith(
            '[TEALIUM COOKIESTORAGE VENDORLIST] b object is not defined'
        );
    });

    it('should handle errors gracefully and set empty string', () => {
        const mockDocument = {
            cookie: {
                get includes() {
                    throw new Error('Test error');
                }
            }
        };

        expect(() =>
            setCookieStorageVendorList(mockB, mockDocument)
        ).not.toThrow();
        expect(console.error).toHaveBeenCalled();
        expect(mockB['consentedVendors']).toBe('');
    });

    it('should handle cookie with encoded values', () => {
        document.cookie = 'cmp_cv_list=vendor%201,vendor%202';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('vendor%201,vendor%202');
    });

    it('should handle cookie at the beginning of cookie string', () => {
        document.cookie = 'cmp_cv_list=first_vendor; other=value';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('first_vendor');
    });

    it('should handle cookie at the end of cookie string', () => {
        document.cookie = 'other=value; cmp_cv_list=last_vendor';

        setCookieStorageVendorList(mockB, document);

        expect(mockB['consentedVendors']).toBe('last_vendor');
    });
});
