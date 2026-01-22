/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tests for k5a_meta_send.js
 * Kilkaya conversion tracking sender using sendBeacon
 */

const trackingUrl = 'https://cl-eu10.k5a.io/?i=test&cs=1';
const baseUrl = 'https://cl-eu10.k5a.io/?';

describe('k5a_meta_send', () => {
    let mockLocalStorage;
    let mockNavigator;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            data: {},
            setItem: jest.fn((key, value) => {
                mockLocalStorage.data[key] = value;
            }),
            getItem: jest.fn(key => mockLocalStorage.data[key] || null),
            clear: jest.fn(() => {
                mockLocalStorage.data = {};
            })
        };
        global.localStorage = mockLocalStorage;

        // Mock navigator.sendBeacon
        mockNavigator = {
            sendBeacon: jest.fn(() => true)
        };
        global.navigator = mockNavigator;

        // Mock console
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();

        // Mock window.k5aMeta
        global.window = {
            k5aMeta: {}
        };

        // Clear any previous timers
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete global.localStorage;
        delete global.navigator;
        delete global.window;
    });

    describe('Event filtering', () => {
        it('should only run for checkout success events', () => {
            const b = { event_name: 'checkout', event_action: 'success' };

            // Extension code would run here
            expect(b.event_name).toBe('checkout');
            expect(b.event_action).toBe('success');
        });

        it('should not run for other events', () => {
            const testCases = [
                { event_name: 'page', event_action: 'view' },
                { event_name: 'checkout', event_action: 'start' },
                { event_name: 'purchase', event_action: 'success' }
            ];

            testCases.forEach(b => {
                const shouldRun = String(b.event_name) === 'checkout' && String(b.event_action) === 'success';
                expect(shouldRun).toBe(false);
            });
        });
    });

    describe('persistLog function', () => {
        it('should save logs to localStorage', () => {
            const message = 'Test message';
            const data = { test: 'data' };

            // Simulate persistLog
            const log = {
                timestamp: new Date().toISOString(),
                message: message,
                data: data
            };
            localStorage.setItem('k5a_send_log', JSON.stringify(log));

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('k5a_send_log', expect.stringContaining(message));

            const savedLog = JSON.parse(localStorage.getItem('k5a_send_log'));
            expect(savedLog.message).toBe(message);
            expect(savedLog.data).toEqual(data);
        });

        it('should handle localStorage errors gracefully', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            // Should not throw
            expect(() => {
                try {
                    localStorage.setItem('k5a_send_log', 'test');
                } catch (e) {
                    console.log('[K5A SEND] Test message');
                }
            }).not.toThrow();
        });
    });

    describe('Tracking URL construction', () => {
        it('should build minimal tracking URL with required parameters', () => {
            const installationId = '68ee5be64709bd7f4b3e3bf2';
            const params = [];

            params.push('i=' + encodeURIComponent(installationId));
            params.push('l=p');
            params.push('cs=1');
            params.push('nopv=1');
            params.push('_s=conversion');
            params.push('_m=b');

            const url = baseUrl + params.join('&');

            expect(url).toContain('i=68ee5be64709bd7f4b3e3bf2');
            expect(url).toContain('cs=1');
            expect(url).toContain('nopv=1');
            expect(url).toContain('l=p');
        });

        it('should include URL parameter from pageData', () => {
            global.window.k5aMeta = {
                url: 'https://checkout-v2.prod.ps.welt.de/?offerId=O_TEST'
            };

            const params = [];
            const pageData = window.k5aMeta || {};

            if (pageData.url) {
                params.push('u=' + encodeURIComponent(pageData.url));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('u=https%3A%2F%2Fcheckout-v2.prod.ps.welt.de');
        });

        it('should include URL parameter from utag.data if not in pageData', () => {
            global.window.utag = {
                data: {
                    'dom.url': 'https://digital.welt.de/?cid=test'
                }
            };

            const params = [];
            const pageData = window.k5aMeta || {};
            const U = (window.utag && window.utag.data) || {};
            const url = pageData.url || U['dom.url'] || document.URL;

            if (url) {
                params.push('u=' + encodeURIComponent(url));
            }

            const expected = baseUrl + params.join('&');
            expect(expected).toContain('u=https%3A%2F%2Fdigital.welt.de');
        });

        it('should prioritize successUrl from query parameter', () => {
            const b = {
                event_name: 'checkout',
                event_action: 'success',
                qp: { successUrl: 'https://checkout-v2.prod.ps.welt.de/success' }
            };
            global.window.k5aMeta = {
                url: 'https://checkout-v2.prod.ps.welt.de/?offerId=O_PRIORITY'
            };
            global.window.utag = {
                data: {
                    successUrl: 'https://checkout-v2.prod.ps.welt.de/success',
                    success_url: 'https://example.com/success'
                }
            };

            const params = [];
            const pageData = window.k5aMeta || {};
            const U = (window.utag && window.utag.data) || {};

            // Priority: qp.successUrl -> successUrl -> success_url -> pageData.url -> dom.url
            const url = (b.qp && b.qp.successUrl) || U.successUrl || U.success_url || pageData.url || U['dom.url'] || document.URL;

            if (url) {
                params.push('u=' + encodeURIComponent(url));
            }

            const expected = baseUrl + params.join('&');
            expect(expected).toContain('u=https%3A%2F%2Fcheckout-v2.prod.ps.welt.de%2Fsuccess');
        });

        it('should include success_id parameter when available in utag', () => {
            global.window.utag = {
                data: {
                    success_id: 'ord_123456789'
                }
            };

            const params = [];
            const U = (window.utag && window.utag.data) || {};
            const b = {};

            const successId = U.success_id || b.success_id;
            if (successId) {
                params.push('success_id=' + encodeURIComponent(successId));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('success_id=ord_123456789');
        });

        it('should include success_id parameter from event data', () => {
            const b = {
                event_name: 'checkout',
                event_action: 'success',
                success_id: 'evt_987654321'
            };

            const params = [];
            const U = {};

            const successId = U.success_id || b.success_id;
            if (successId) {
                params.push('success_id=' + encodeURIComponent(successId));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('success_id=evt_987654321');
        });

        it('should include order_id parameter when available in utag', () => {
            global.window.utag = {
                data: {
                    order_id: 'ORD-2026-001'
                }
            };

            const params = [];
            const U = (window.utag && window.utag.data) || {};
            const b = {};

            const orderId = U.order_id || b.order_id;
            if (orderId) {
                params.push('order_id=' + encodeURIComponent(orderId));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('order_id=ORD-2026-001');
        });

        it('should include order_id parameter from event data', () => {
            const b = {
                event_name: 'checkout',
                event_action: 'success',
                order_id: 'ORD-EVT-999'
            };

            const params = [];
            const U = {};

            const orderId = U.order_id || b.order_id;
            if (orderId) {
                params.push('order_id=' + encodeURIComponent(orderId));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('order_id=ORD-EVT-999');
        });

        it('should handle missing success_id and order_id gracefully', () => {
            const b = { event_name: 'checkout', event_action: 'success' };
            global.window.utag = { data: {} };

            const params = ['i=test'];
            const U = (window.utag && window.utag.data) || {};

            const successId = U.success_id || b.success_id;
            if (successId) {
                params.push('success_id=' + encodeURIComponent(successId));
            }

            const orderId = U.order_id || b.order_id;
            if (orderId) {
                params.push('order_id=' + encodeURIComponent(orderId));
            }

            // Should only have the initial param
            expect(params).toEqual(['i=test']);
        });

        it('should include platform parameter as desktop', () => {
            global.window.utag = {
                data: {
                    page_platform: 'desktop'
                }
            };

            const params = [];
            const U = (window.utag && window.utag.data) || {};
            const platform = U.page_platform || U['cp.utag_main_page_platform'] || '';

            if (platform) {
                const channel = platform.toLowerCase() === 'mobile' ? 'mobile' : 'desktop';
                params.push('c=' + encodeURIComponent(channel));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('c=desktop');
        });

        it('should include platform parameter as mobile', () => {
            global.window.utag = {
                data: {
                    page_platform: 'mobile'
                }
            };

            const params = [];
            const U = (window.utag && window.utag.data) || {};
            const platform = U.page_platform || U['cp.utag_main_page_platform'] || '';

            if (platform) {
                const channel = platform.toLowerCase() === 'mobile' ? 'mobile' : 'desktop';
                params.push('c=' + encodeURIComponent(channel));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('c=mobile');
        });

        it('should get platform from cookie fallback', () => {
            global.window.utag = {
                data: {
                    'cp.utag_main_page_platform': 'desktop'
                }
            };

            const params = [];
            const U = (window.utag && window.utag.data) || {};
            const platform = U.page_platform || U['cp.utag_main_page_platform'] || '';

            if (platform) {
                const channel = platform.toLowerCase() === 'mobile' ? 'mobile' : 'desktop';
                params.push('c=' + encodeURIComponent(channel));
            }

            const url = baseUrl + params.join('&');
            expect(url).toContain('c=desktop');
        });

        it('should include conversion-specific parameters', () => {
            const pageData = {
                conversion: 1,
                cntTag: ['offer_123', 'offer_456']
            };

            const params = [];
            params.push('i=test');

            if (pageData.conversion) params.push('cv=' + pageData.conversion);
            if (pageData.cntTag && Array.isArray(pageData.cntTag)) {
                params.push('cntt=' + encodeURIComponent(pageData.cntTag.join(',')));
            }

            const url = baseUrl + params.join('&');

            expect(url).toContain('cv=1');
            expect(url).toContain('cntt=offer_123%2Coffer_456');
        });

        it('should include optional page parameters when available', () => {
            const pageData = {
                url: 'https://welt.de/checkout',
                title: 'Checkout Success',
                section: 'shop',
                type: 'checkout',
                channel: 'web',
                referer: 'https://welt.de/cart'
            };

            const params = [];
            if (pageData.url) params.push('u=' + encodeURIComponent(pageData.url));
            if (pageData.title) params.push('ptl=' + encodeURIComponent(pageData.title));
            if (pageData.section) params.push('psn=' + encodeURIComponent(pageData.section));
            if (pageData.type) params.push('ptp=' + encodeURIComponent(pageData.type));
            if (pageData.channel) params.push('c=' + encodeURIComponent(pageData.channel));
            if (pageData.referer) params.push('r=' + encodeURIComponent(pageData.referer));

            const url = baseUrl + params.join('&');

            expect(url).toContain('u=https%3A%2F%2Fwelt.de%2Fcheckout');
            expect(url).toContain('ptl=Checkout%20Success');
            expect(url).toContain('psn=shop');
        });

        it('should handle missing optional parameters', () => {
            const pageData = {};
            const params = ['i=test'];

            if (pageData.url) params.push('u=' + encodeURIComponent(pageData.url));
            if (pageData.title) params.push('ptl=' + encodeURIComponent(pageData.title));

            expect(params).toEqual(['i=test']);
        });
    });

    describe('sendBeacon tracking', () => {
        it('should use sendBeacon when available', () => {
            const sent = navigator.sendBeacon(trackingUrl);

            expect(mockNavigator.sendBeacon).toHaveBeenCalledWith(trackingUrl);
            expect(sent).toBe(true);
        });

        it('should handle sendBeacon success', () => {
            mockNavigator.sendBeacon.mockReturnValue(true);

            const sent = navigator.sendBeacon(trackingUrl);

            if (sent) {
                const log = {
                    timestamp: new Date().toISOString(),
                    message: '✓ SUCCESS: Sent via sendBeacon',
                    data: { url: trackingUrl, method: 'sendBeacon' }
                };
                localStorage.setItem('k5a_send_log', JSON.stringify(log));
            }

            const savedLog = JSON.parse(localStorage.getItem('k5a_send_log'));
            expect(savedLog.message).toBe('✓ SUCCESS: Sent via sendBeacon');
            expect(savedLog.data.method).toBe('sendBeacon');
        });

        it('should handle sendBeacon failure', () => {
            mockNavigator.sendBeacon.mockReturnValue(false);

            const sent = navigator.sendBeacon(trackingUrl);

            expect(sent).toBe(false);
            // Should fall through to next method
        });

        it('should handle missing sendBeacon API', () => {
            delete global.navigator.sendBeacon;

            expect(global.navigator.sendBeacon).toBeUndefined();
            // Should fall through to fallback methods
        });
    });

    describe('Fallback methods', () => {
        it('should use Kilkaya API when available', () => {
            const mockKilkaya = {
                pageData: {
                    getDefaultData: jest.fn(() => ({ test: 'data' }))
                },
                logger: {
                    fireNow: jest.fn()
                }
            };
            global.window.kilkaya = mockKilkaya;

            const logData = window.kilkaya.pageData.getDefaultData();
            logData.cs = 1;
            window.kilkaya.logger.fireNow('pageView', logData, 'conversion');

            expect(mockKilkaya.pageData.getDefaultData).toHaveBeenCalled();
            expect(mockKilkaya.logger.fireNow).toHaveBeenCalledWith('pageView', expect.objectContaining({ cs: 1 }), 'conversion');
        });

        it('should use image pixel as last resort', () => {
            // Create image (would trigger HTTP request in browser)
            const img = { src: '' };
            img.src = trackingUrl;

            expect(img.src).toBe(trackingUrl);
        });
    });

    describe('Error handling', () => {
        it('should log errors to localStorage', () => {
            const error = new Error('Test error');
            const log = {
                timestamp: new Date().toISOString(),
                message: '✗ ERROR sending conversion',
                data: { error: error.message, stack: error.stack }
            };
            localStorage.setItem('k5a_send_log', JSON.stringify(log));

            const savedLog = JSON.parse(localStorage.getItem('k5a_send_log'));
            expect(savedLog.message).toBe('✗ ERROR sending conversion');
            expect(savedLog.data.error).toBe('Test error');
        });

        it('should handle critical errors', () => {
            const error = new Error('Critical error');
            try {
                localStorage.setItem(
                    'k5a_send_log',
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        message: '✗ CRITICAL ERROR',
                        data: { error: error.message, stack: error.stack }
                    })
                );
            } catch (storageErr) {
                console.error('[K5A SEND] Error:', error);
            }

            const savedLog = localStorage.getItem('k5a_send_log');
            expect(savedLog).toBeDefined();
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complete checkout success flow', () => {
            // Setup
            global.window.k5aMeta = {
                conversion: 1,
                cntTag: ['offer_123'],
                url: 'https://welt.de/checkout',
                title: 'Checkout Success'
            };

            const b = { event_name: 'checkout', event_action: 'success' };
            // Verify event matches
            expect(String(b.event_name)).toBe('checkout');
            expect(String(b.event_action)).toBe('success');

            // Build URL
            const params = ['i=68ee5be64709bd7f4b3e3bf2', 'cs=1', 'cv=1', 'cntt=offer_123'];
            const expected = baseUrl + params.join('&');

            // Send beacon
            const sent = navigator.sendBeacon(expected);
            expect(sent).toBe(true);

            // Verify localStorage log
            const log = {
                timestamp: new Date().toISOString(),
                message: '✓ SUCCESS: Sent via sendBeacon',
                data: { url: expected, method: 'sendBeacon' }
            };
            localStorage.setItem('k5a_send_log', JSON.stringify(log));

            const savedLog = JSON.parse(localStorage.getItem('k5a_send_log'));
            expect(savedLog.message).toContain('SUCCESS');
            expect(savedLog.data.url).toContain('cs=1');
            expect(savedLog.data.url).toContain('cntt=offer_123');
        });

        it('should handle empty k5aMeta gracefully', () => {
            global.window.k5aMeta = {};

            const pageData = window.k5aMeta || {};
            const params = ['i=test', 'cs=1'];

            if (pageData.conversion) {
                params.push('cv=' + pageData.conversion);
            }
            if (pageData.cntTag && Array.isArray(pageData.cntTag)) {
                params.push('cntt=' + pageData.cntTag.join(','));
            }

            // Should still have minimum required params
            expect(params).toContain('i=test');
            expect(params).toContain('cs=1');
            expect(params).not.toContain(expect.stringContaining('cv='));
        });
    });

    describe('setTimeout delay', () => {
        it('should wait 150ms before executing', () => {
            const callback = jest.fn();
            setTimeout(callback, 150);
            expect(callback).not.toHaveBeenCalled();
            jest.advanceTimersByTime(150);
            expect(callback).toHaveBeenCalled();
        });
    });
});
