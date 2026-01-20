/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* Post Loader — Send Kilkaya conversion tracking */
/* global a, b */
(function(a, b) {
    try {
        if (String(b.event_name) !== 'checkout' || String(b.event_action) !== 'success') {
            return;
        }

        // Helper to log to localStorage (survives redirect)
        var persistLog = function(message, data) {
            try {
                var log = {
                    timestamp: new Date().toISOString(),
                    message: message,
                    data: data
                };
                localStorage.setItem('k5a_send_log', JSON.stringify(log));
                console.log('[K5A SEND] ' + message, data);
            } catch (e) {
                console.log('[K5A SEND] ' + message, data);
            }
        };

        persistLog('Checkout success detected', { k5aMeta: window.k5aMeta });

        // Wait for k5aMeta.conversion to be set by conversion extension
        setTimeout(function() {
            try {
                // Build the tracking URL manually based on Kilkaya's format
                var installationId = '68ee5be64709bd7f4b3e3bf2';
                var baseUrl = 'https://cl-eu10.k5a.io/';

                // Get page data and utag data
                var pageData = window.k5aMeta || {};
                var U = (window.utag && window.utag.data) || {};

                // Build query parameters for Kilkaya
                var params = [];
                params.push('i=' + encodeURIComponent(installationId));
                params.push('l=p'); // pageview log type
                params.push('cs=1'); // conversion status = 1
                params.push('nopv=1'); // Don't log as pageview, only sale
                params.push('_s=conversion');
                params.push('_m=b'); // method=beacon

                // REQUIRED: Add URL parameter (u=)
                var successUrl = U['qp.successUrl'] || U.successUrl || b.success_url;
                var url = successUrl || pageData.url || U['dom.url'] || document.URL;
                if (url) {
                    params.push('u=' + encodeURIComponent(url));
                }

                // Add success_id from UDO if available
                var successId = U.success_id || b.success_id;
                if (successId) {
                    params.push('success_id=' + encodeURIComponent(successId));
                }

                // Add order_id from UDO if available
                var orderId = U.order_id || b.order_id;
                if (orderId) {
                    params.push('order_id=' + encodeURIComponent(orderId));
                }

                // Add channel/platform (c=desktop|mobile)
                var platform = U.page_platform || U['cp.utag_main_page_platform'] || '';
                if (platform) {
                    // Normalize platform value to desktop or mobile
                    var channel = platform.toLowerCase() === 'mobile' ? 'mobile' : 'desktop';
                    params.push('c=' + encodeURIComponent(channel));
                }

                // Add conversion-specific data
                if (pageData.conversion) params.push('cv=' + pageData.conversion);
                if (
                    pageData.cntTag &&
                    Array.isArray(pageData.cntTag) &&
                    pageData.cntTag.length > 0
                ) {
                    params.push('cntt=' + encodeURIComponent(pageData.cntTag.join(',')));
                }

                var trackingUrl = baseUrl + '?' + params.join('&');

                persistLog('Tracking URL built', { url: trackingUrl });

                // Try sendBeacon first (best for page unloads)
                if (navigator.sendBeacon) {
                    var sent = navigator.sendBeacon(trackingUrl);

                    if (sent) {
                        persistLog('✓ SUCCESS: Sent via sendBeacon', {
                            url: trackingUrl,
                            method: 'sendBeacon'
                        });
                        return;
                    }
                }

                // Fallback: try kilkaya API if available
                if (
                    window.kilkaya &&
                    window.kilkaya.logger &&
                    typeof window.kilkaya.logger.fireNow === 'function'
                ) {
                    var logData = window.kilkaya.pageData.getDefaultData();
                    logData.cs = 1; // conversion
                    window.kilkaya.logger.fireNow('pageView', logData, 'conversion');
                    persistLog('✓ SUCCESS: Sent via Kilkaya API', {
                        method: 'kilkaya.logger.fireNow'
                    });
                    return;
                }
            } catch (err) {
                persistLog('✗ ERROR sending conversion', { error: err.message, stack: err.stack });
            }
        }, 150); // Small delay to ensure k5aMeta.conversion is set
    } catch (e) {
        try {
            localStorage.setItem(
                'k5a_send_log',
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    message: '✗ CRITICAL ERROR',
                    data: { error: e.message, stack: e.stack }
                })
            );
        } catch (storageErr) {
            console.error('[K5A SEND] Error:', e);
        }
    }
})(a, b);
