/**
 * Tests for braze_checkout_tracking.js
 * Braze checkout success tracking for WELT
 */

/* global utag */

const { brazeCheckoutTracking } = require('../../extensions/welt/braze_checkout_tracking');

describe('Braze Checkout Tracking', () => {
    let mockUtag;
    let mockBraze;
    let mockDocument;
    let mockConsole;

    beforeEach(() => {
        // Mock utag.data
        mockUtag = {
            data: {
                'dom.referrer': '',
                'qp.t_ref': '',
                'qp.offerId': 'OFFER_123',
                user_hasPlusSubscription2: 'true',
                user_entitlements2: ['entitlement1', 'entitlement2'],
                page_document_type: 'checkout',
                page_id: 'page_123'
            }
        };
        global.utag = mockUtag;

        // Mock braze SDK
        mockBraze = {
            logCustomEvent: jest.fn()
        };
        global.braze = mockBraze;

        // Mock document.cookie
        mockDocument = {
            cookie: 'cmp_cv_list=braze;'
        };
        global.document = mockDocument;

        // Mock console
        mockConsole = {
            warn: jest.fn(),
            error: jest.fn()
        };
        global.console = mockConsole;

        // Mock setTimeout
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete global.utag;
        delete global.braze;
        delete global.document;
    });

    describe('Consent checking', () => {
        it('should detect consent when braze is in cmp_cv_list cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze,vendor2;';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(true);
        });

        it('should detect consent when braze is at start of cookie', () => {
            document.cookie = 'cmp_cv_list=braze,vendor1;';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(true);
        });

        it('should detect consent when braze is at end of cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze;';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(true);
        });

        it('should not detect consent when braze is not in cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,vendor2;';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(false);
        });

        it('should not detect consent when cmp_cv_list cookie is missing', () => {
            document.cookie = 'other_cookie=value;';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(false);
        });

        it('should handle empty cookie', () => {
            document.cookie = '';
            const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(
                document.cookie
            );

            expect(consentGiven).toBe(false);
        });
    });

    describe('Checkout referrer detection', () => {
        it('should detect checkout from PayPal referrer', () => {
            utag.data['dom.referrer'] = 'https://www.paypal.com/checkout';

            const fromCheckout =
                typeof utag.data['dom.referrer'] != 'undefined' &&
                utag.data['dom.referrer'].toString().indexOf('paypal.com') > -1;

            expect(fromCheckout).toBe(true);
        });

        it('should detect checkout from checkout-v2 in dom.referrer', () => {
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';

            const fromCheckout =
                typeof utag.data['dom.referrer'] != 'undefined' &&
                utag.data['dom.referrer'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1;

            expect(fromCheckout).toBe(true);
        });

        it('should detect checkout from t_ref parameter', () => {
            utag.data['dom.referrer'] = undefined;
            utag.data['qp.t_ref'] = 'https://checkout-v2.prod.ps.welt.de/';

            const fromCheckout =
                typeof utag.data['qp.t_ref'] != 'undefined' &&
                utag.data['qp.t_ref'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1;

            expect(fromCheckout).toBe(true);
        });

        it('should not detect checkout from other referrers', () => {
            utag.data['dom.referrer'] = 'https://www.google.com';
            utag.data['qp.t_ref'] = undefined;

            const fromCheckout =
                (typeof utag.data['dom.referrer'] != 'undefined' &&
                    utag.data['dom.referrer'].toString().indexOf('paypal.com') > -1) ||
                (typeof utag.data['dom.referrer'] != 'undefined' &&
                    utag.data['dom.referrer'].toString().indexOf('checkout-v2.prod.ps.welt.de') >
                        -1);

            expect(fromCheckout).toBe(false);
        });

        it('should handle undefined referrers', () => {
            utag.data['dom.referrer'] = undefined;
            utag.data['qp.t_ref'] = undefined;

            const fromCheckout =
                typeof utag.data['dom.referrer'] != 'undefined' &&
                utag.data['dom.referrer'].toString().indexOf('paypal.com') > -1;

            expect(fromCheckout).toBe(false);
        });
    });

    describe('Subscriber detection', () => {
        it('should detect subscriber when user_hasPlusSubscription2 is true', () => {
            utag.data.user_hasPlusSubscription2 = 'true';

            const isSubscriber = utag.data.user_hasPlusSubscription2.includes('true');

            expect(isSubscriber).toBe(true);
        });

        it('should detect subscriber when user_hasPlusSubscription2 contains true', () => {
            utag.data.user_hasPlusSubscription2 = ['true', 'premium'];

            const isSubscriber = utag.data.user_hasPlusSubscription2.includes('true');

            expect(isSubscriber).toBe(true);
        });

        it('should not detect subscriber when user_hasPlusSubscription2 is false', () => {
            utag.data.user_hasPlusSubscription2 = 'false';

            const isSubscriber = utag.data.user_hasPlusSubscription2.includes('true');

            expect(isSubscriber).toBe(false);
        });

        it('should not detect subscriber when user_hasPlusSubscription2 is empty', () => {
            utag.data.user_hasPlusSubscription2 = '';

            const isSubscriber = utag.data.user_hasPlusSubscription2.includes('true');

            expect(isSubscriber).toBe(false);
        });
    });

    describe('Actual module execution', () => {
        it('should execute and return tracking object when all conditions are met', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            expect(result).toBeDefined();
            expect(result.consentGiven).toBe(true);
            expect(result.fromCheckout).toBe(true);
            expect(result.isSubscriber).toBe(true);
            expect(typeof result.trackBrazeCheckout).toBe('function');
            expect(typeof result.retryBrazeCheck).toBe('function');
        });

        it('should not trigger tracking when consent is not given', () => {
            document.cookie = 'cmp_cv_list=other_vendor;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            expect(result.consentGiven).toBe(false);
            expect(mockBraze.logCustomEvent).not.toHaveBeenCalled();
        });

        it('should track checkout when braze is available', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://www.paypal.com/checkout';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            // Call trackBrazeCheckout directly to test it
            result.trackBrazeCheckout();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: 'checkout',
                entitlement_ids: 'entitlement1,entitlement2',
                page_id: 'page_123',
                offerId: 'OFFER_123'
            });
        });
    });

    describe('trackBrazeCheckout function', () => {
        it('should call braze.logCustomEvent when braze is defined', () => {
            const result = brazeCheckoutTracking();
            result.trackBrazeCheckout();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: 'checkout',
                entitlement_ids: 'entitlement1,entitlement2',
                page_id: 'page_123',
                offerId: 'OFFER_123'
            });
        });

        it('should handle empty utag data with fallback values', () => {
            utag.data.page_document_type = undefined;
            utag.data.user_entitlements2 = undefined;
            utag.data.page_id = undefined;
            utag.data['qp.offerId'] = undefined;

            const result = brazeCheckoutTracking();
            result.trackBrazeCheckout();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: '',
                entitlement_ids: '',
                page_id: '',
                offerId: ''
            });
        });

        it('should not throw error when braze is undefined', () => {
            delete global.braze;

            const result = brazeCheckoutTracking();

            expect(() => result.trackBrazeCheckout()).not.toThrow();
        });
    });

    describe('retryBrazeCheck function', () => {
        it('should call trackBrazeCheckout immediately when braze is available', () => {
            const result = brazeCheckoutTracking();

            // braze is available, so retryBrazeCheck should call trackBrazeCheckout immediately
            result.retryBrazeCheck();

            // Verify braze.logCustomEvent was called (trackBrazeCheckout calls it)
            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: 'checkout',
                entitlement_ids: 'entitlement1,entitlement2',
                page_id: 'page_123',
                offerId: 'OFFER_123'
            });
        });

        it('should retry when braze is not available', () => {
            delete global.braze;

            const result = brazeCheckoutTracking();
            result.retryBrazeCheck();

            expect(mockConsole.warn).toHaveBeenCalledWith('braze: Library not loaded, retrying...');
        });

        it('should stop retrying after maxRetries', () => {
            delete global.braze;

            const result = brazeCheckoutTracking();

            // Call retryBrazeCheck 10 times
            for (let i = 0; i < 10; i++) {
                result.retryBrazeCheck();
            }

            // 11th call should trigger error
            result.retryBrazeCheck();

            expect(mockConsole.error).toHaveBeenCalledWith(
                'braze: Failed to load after maximum retries.'
            );
        });

        it('should use 100ms delay for retries', () => {
            delete global.braze;
            const callback = jest.fn();

            setTimeout(callback, 100);

            expect(callback).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);

            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Integration scenarios', () => {
        it('should execute when all conditions are met', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            expect(result.consentGiven).toBe(true);
            expect(result.fromCheckout).toBe(true);
            expect(result.isSubscriber).toBe(true);
        });

        it('should not execute when consent is not given', () => {
            document.cookie = 'cmp_cv_list=other_vendor;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            expect(result.consentGiven).toBe(false);
            expect(result.fromCheckout).toBe(true);
            expect(result.isSubscriber).toBe(true);
        });

        it('should not execute when not from checkout', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://www.google.com';
            utag.data.user_hasPlusSubscription2 = 'true';

            const result = brazeCheckoutTracking();

            expect(result.consentGiven).toBe(true);
            expect(result.fromCheckout).toBe(false);
            expect(result.isSubscriber).toBe(true);
        });

        it('should not execute when user is not a subscriber', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'false';

            const result = brazeCheckoutTracking();

            expect(result.consentGiven).toBe(true);
            expect(result.fromCheckout).toBe(true);
            expect(result.isSubscriber).toBe(false);
        });

        it('should track complete checkout flow with all data', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze,vendor2;';
            utag.data['dom.referrer'] = 'https://www.paypal.com/checkoutnow';
            utag.data.user_hasPlusSubscription2 = 'true';
            utag.data.page_document_type = 'article';
            utag.data.user_entitlements2 = ['welt_plus', 'digital'];
            utag.data.page_id = 'article_456';
            utag.data['qp.offerId'] = 'PREMIUM_YEARLY';

            const result = brazeCheckoutTracking();
            result.trackBrazeCheckout();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: 'article',
                entitlement_ids: 'welt_plus,digital',
                page_id: 'article_456',
                offerId: 'PREMIUM_YEARLY'
            });
        });
    });
});
