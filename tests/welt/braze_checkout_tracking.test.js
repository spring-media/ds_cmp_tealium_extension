/**
 * Tests for braze_checkout_tracking.js
 * Braze checkout success tracking for WELT
 */

/* global utag */

const {
    checkConsentGiven,
    checkFromCheckout,
    checkIsSubscriber,
    trackBrazeCheckout,
    retryBrazeCheck,
    initBrazeCheckoutTracking
} = require('../../extensions/welt/braze_checkout_tracking');

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

    describe('checkConsentGiven', () => {
        it('should detect consent when braze is in cmp_cv_list cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze,vendor2;';
            expect(checkConsentGiven()).toBe(true);
        });

        it('should detect consent when braze is at start of cookie', () => {
            document.cookie = 'cmp_cv_list=braze,vendor1;';
            expect(checkConsentGiven()).toBe(true);
        });

        it('should detect consent when braze is at end of cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze;';
            expect(checkConsentGiven()).toBe(true);
        });

        it('should not detect consent when braze is not in cookie', () => {
            document.cookie = 'cmp_cv_list=vendor1,vendor2;';
            expect(checkConsentGiven()).toBe(false);
        });

        it('should not detect consent when cmp_cv_list cookie is missing', () => {
            document.cookie = 'other_cookie=value;';
            expect(checkConsentGiven()).toBe(false);
        });

        it('should handle empty cookie', () => {
            document.cookie = '';
            expect(checkConsentGiven()).toBe(false);
        });
    });

    describe('checkFromCheckout', () => {
        it('should detect checkout from PayPal referrer', () => {
            utag.data['dom.referrer'] = 'https://www.paypal.com/checkout';
            expect(checkFromCheckout()).toBe(true);
        });

        it('should detect checkout from checkout-v2 in dom.referrer', () => {
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            expect(checkFromCheckout()).toBe(true);
        });

        it('should detect checkout from t_ref parameter', () => {
            utag.data['dom.referrer'] = undefined;
            utag.data['qp.t_ref'] = 'https://checkout-v2.prod.ps.welt.de/';
            expect(checkFromCheckout()).toBe(true);
        });

        it('should not detect checkout from other referrers', () => {
            utag.data['dom.referrer'] = 'https://www.google.com';
            utag.data['qp.t_ref'] = undefined;
            expect(checkFromCheckout()).toBe(false);
        });

        it('should handle undefined referrers', () => {
            utag.data['dom.referrer'] = undefined;
            utag.data['qp.t_ref'] = undefined;
            expect(checkFromCheckout()).toBe(false);
        });
    });

    describe('checkIsSubscriber', () => {
        it('should detect subscriber when user_hasPlusSubscription2 is true', () => {
            utag.data.user_hasPlusSubscription2 = 'true';
            expect(checkIsSubscriber()).toBe(true);
        });

        it('should detect subscriber when user_hasPlusSubscription2 contains true', () => {
            utag.data.user_hasPlusSubscription2 = ['true', 'premium'];
            expect(checkIsSubscriber()).toBe(true);
        });

        it('should not detect subscriber when user_hasPlusSubscription2 is false', () => {
            utag.data.user_hasPlusSubscription2 = 'false';
            expect(checkIsSubscriber()).toBe(false);
        });

        it('should not detect subscriber when user_hasPlusSubscription2 is empty', () => {
            utag.data.user_hasPlusSubscription2 = '';
            expect(checkIsSubscriber()).toBe(false);
        });
    });

    describe('trackBrazeCheckout', () => {
        it('should call braze.logCustomEvent when braze is defined', () => {
            trackBrazeCheckout();

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

            trackBrazeCheckout();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: '',
                entitlement_ids: '',
                page_id: '',
                offerId: ''
            });
        });

        it('should not throw error when braze is undefined', () => {
            delete global.braze;

            expect(() => trackBrazeCheckout()).not.toThrow();
        });
    });

    describe('retryBrazeCheck', () => {
        it('should call trackBrazeCheckout immediately when braze is available', () => {
            retryBrazeCheck();

            expect(mockBraze.logCustomEvent).toHaveBeenCalled();
        });

        it('should retry when braze is not available', () => {
            delete global.braze;

            retryBrazeCheck(0, 10);

            expect(mockConsole.warn).toHaveBeenCalledWith('braze: Library not loaded, retrying...');
        });

        it('should stop retrying after maxRetries', () => {
            delete global.braze;

            retryBrazeCheck(10, 10);

            expect(mockConsole.error).toHaveBeenCalledWith(
                'braze: Failed to load after maximum retries.'
            );
        });

        it('should use 100ms delay for retries', () => {
            delete global.braze;
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

            retryBrazeCheck(0, 10);

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
            setTimeoutSpy.mockRestore();
        });

        it('should eventually succeed when braze becomes available', () => {
            delete global.braze;

            retryBrazeCheck(0, 10);

            // First retry should be scheduled
            expect(mockConsole.warn).toHaveBeenCalledWith('braze: Library not loaded, retrying...');

            // Make braze available
            global.braze = mockBraze;

            // Fast-forward time
            jest.advanceTimersByTime(100);

            // Should have called trackBrazeCheckout
            expect(mockBraze.logCustomEvent).toHaveBeenCalled();
        });
    });

    describe('initBrazeCheckoutTracking', () => {
        it('should execute retryBrazeCheck when all conditions are met', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            initBrazeCheckoutTracking();

            expect(mockBraze.logCustomEvent).toHaveBeenCalled();
        });

        it('should not execute when consent is not given', () => {
            document.cookie = 'cmp_cv_list=other_vendor;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            initBrazeCheckoutTracking();

            expect(mockBraze.logCustomEvent).not.toHaveBeenCalled();
        });

        it('should not execute when not from checkout', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://www.google.com';
            utag.data.user_hasPlusSubscription2 = 'true';

            initBrazeCheckoutTracking();

            expect(mockBraze.logCustomEvent).not.toHaveBeenCalled();
        });

        it('should not execute when user is not a subscriber', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'false';

            initBrazeCheckoutTracking();

            expect(mockBraze.logCustomEvent).not.toHaveBeenCalled();
        });
    });

    describe('Integration scenarios', () => {
        it('should track complete checkout flow with all data', () => {
            document.cookie = 'cmp_cv_list=vendor1,braze,vendor2;';
            utag.data['dom.referrer'] = 'https://www.paypal.com/checkoutnow';
            utag.data.user_hasPlusSubscription2 = 'true';
            utag.data.page_document_type = 'article';
            utag.data.user_entitlements2 = ['welt_plus', 'digital'];
            utag.data.page_id = 'article_456';
            utag.data['qp.offerId'] = 'PREMIUM_YEARLY';

            initBrazeCheckoutTracking();

            expect(mockBraze.logCustomEvent).toHaveBeenCalledWith('Checkout Success', {
                content_type: 'article',
                entitlement_ids: 'welt_plus,digital',
                page_id: 'article_456',
                offerId: 'PREMIUM_YEARLY'
            });
        });

        it('should handle delayed braze loading', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            // Braze not available yet
            delete global.braze;

            initBrazeCheckoutTracking();

            expect(mockConsole.warn).toHaveBeenCalledWith('braze: Library not loaded, retrying...');

            // Make braze available after some time
            global.braze = mockBraze;
            jest.advanceTimersByTime(100);

            expect(mockBraze.logCustomEvent).toHaveBeenCalled();
        });

        it('should give up after max retries if braze never loads', () => {
            document.cookie = 'cmp_cv_list=braze;';
            utag.data['dom.referrer'] = 'https://checkout-v2.prod.ps.welt.de/success';
            utag.data.user_hasPlusSubscription2 = 'true';

            // Braze never becomes available
            delete global.braze;

            initBrazeCheckoutTracking();

            // Fast-forward through all retries
            jest.advanceTimersByTime(1100); // 100ms * 11 attempts

            expect(mockConsole.error).toHaveBeenCalledWith(
                'braze: Failed to load after maximum retries.'
            );
        });
    });
});
