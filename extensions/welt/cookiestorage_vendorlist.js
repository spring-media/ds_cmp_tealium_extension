/**
 * CookieStorage VendorList Extension
 *
 * This extension reads the 'cmp_cv_list' cookie and sets the consentedVendors variable.
 * If the cookie exists, it extracts the vendor list value from the cookie.
 * If the cookie doesn't exist, it sets an empty string.
 *
 * Scope: Before Load Rules
 * Type: Advanced JS (Set Data Values)
 */

/* global b */

function setCookieStorageVendorList(bObject, documentObj) {
    // Use global b and document if not provided (browser environment)
    if (typeof bObject === 'undefined' && typeof b !== 'undefined') {
        bObject = b;
    }
    if (typeof documentObj === 'undefined' && typeof document !== 'undefined') {
        documentObj = document;
    }
    try {
        // Check if b object exists
        if (typeof bObject === 'undefined') {
            console.warn(
                '[TEALIUM COOKIESTORAGE VENDORLIST] b object is not defined'
            );
            return;
        }

        // Check if the cookie includes 'cmp_cv_list'
        if (documentObj.cookie.includes('cmp_cv_list')) {
            // Extract the cookie value using regex
            const match = documentObj.cookie.match(
                '(^|;)\\s*cmp_cv_list\\s*=\\s*([^;]+)'
            );
            if (match && match[2]) {
                bObject['consentedVendors'] = match[2];
            } else {
                bObject['consentedVendors'] = '';
            }
        } else {
            bObject['consentedVendors'] = '';
        }
    } catch (e) {
        // Silent error handling - should not break page functionality
        console.error('[TEALIUM COOKIESTORAGE VENDORLIST] Error:', e);
        if (typeof bObject !== 'undefined') {
            bObject['consentedVendors'] = '';
        }
    }
}

// Export for tests
// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = { setCookieStorageVendorList };
} else {
    // Call entry point in browser
    setCookieStorageVendorList();
}
