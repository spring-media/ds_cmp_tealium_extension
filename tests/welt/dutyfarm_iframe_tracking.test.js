/**
 * Tests for dutyfarm_iframe_tracking.js
 * Dutyfarm iframe interaction tracking for WELT
 */

const { monitorIframeClick } = require('../../extensions/welt/dutyfarm_iframe_tracking');

describe('Dutyfarm Iframe Tracking Extension', () => {
    let mockDocument;
    let mockUtag;
    let mockSetInterval;
    let mockClearInterval;
    let intervalCallback;
    let intervalId;

    beforeEach(() => {
        // Mock console.error
        global.console.error = jest.fn();

        // Mock setInterval to capture callback
        intervalId = 123;
        mockSetInterval = jest.fn((callback) => {
            intervalCallback = callback;
            return intervalId;
        });

        // Mock clearInterval
        mockClearInterval = jest.fn();

        // Setup mock document
        mockDocument = {
            URL: 'https://example.com/sudoku.html',
            activeElement: null
        };

        // Setup mock utag
        mockUtag = {
            link: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('URL Conditions', () => {
        it('should start monitoring when URL contains "sudoku"', () => {
            mockDocument.URL = 'https://example.com/spiele/sudoku.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(intervalId);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it('should start monitoring when URL contains "Sudoku" (case insensitive)', () => {
            mockDocument.URL = 'https://example.com/spiele/Sudoku.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(intervalId);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it('should start monitoring when URL contains "kreuzwortraetsel"', () => {
            mockDocument.URL = 'https://example.com/spiele/kreuzwortraetsel.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(intervalId);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it('should start monitoring when URL contains "Kreuzwortraetsel" (case insensitive)', () => {
            mockDocument.URL = 'https://example.com/spiele/Kreuzwortraetsel.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(intervalId);
            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it('should not start monitoring when URL does not contain required keywords', () => {
            mockDocument.URL = 'https://example.com/article.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(null);
            expect(mockSetInterval).not.toHaveBeenCalled();
        });

        it('should not start monitoring on other game pages', () => {
            mockDocument.URL = 'https://example.com/spiele/solitaire.html';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(null);
            expect(mockSetInterval).not.toHaveBeenCalled();
        });
    });

    describe('Iframe Detection', () => {
        beforeEach(() => {
            mockDocument.URL = 'https://example.com/sudoku.html';
        });

        it('should send tracking event when iframe is clicked', () => {
            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            // Simulate iframe click
            mockDocument.activeElement = { tagName: 'IFRAME' };
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith({
                event_name: 'dutyfarm_spiele_iframe',
                event_action: 'click',
                event_label: 'sudoku',
                event_data: ''
            });
        });

        it('should clear interval after tracking event is sent', () => {
            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            // Simulate iframe click
            mockDocument.activeElement = { tagName: 'IFRAME' };
            intervalCallback();

            expect(mockClearInterval).toHaveBeenCalledWith(intervalId);
        });

        it('should not send tracking event when non-iframe element is active', () => {
            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            // Simulate div click
            mockDocument.activeElement = { tagName: 'DIV' };
            intervalCallback();

            expect(mockUtag.link).not.toHaveBeenCalled();
            expect(mockClearInterval).not.toHaveBeenCalled();
        });

        it('should not send tracking event when activeElement is null', () => {
            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            mockDocument.activeElement = null;
            intervalCallback();

            expect(mockUtag.link).not.toHaveBeenCalled();
            expect(mockClearInterval).not.toHaveBeenCalled();
        });

        it('should not send tracking event when activeElement is undefined', () => {
            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            mockDocument.activeElement = undefined;
            intervalCallback();

            expect(mockUtag.link).not.toHaveBeenCalled();
            expect(mockClearInterval).not.toHaveBeenCalled();
        });
    });

    describe('Event Label Extraction', () => {
        beforeEach(() => {
            mockDocument.activeElement = { tagName: 'IFRAME' };
        });

        it('should extract correct label from simple URL', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_label: 'sudoku'
                })
            );
        });

        it('should extract correct label from nested URL', () => {
            mockDocument.URL = 'https://example.com/spiele/kreuzwortraetsel.html';

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_label: 'kreuzwortraetsel'
                })
            );
        });

        it('should extract correct label from URL with query parameters', () => {
            mockDocument.URL = 'https://example.com/sudoku.html?level=hard';

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_label: 'sudoku'
                })
            );
        });

        it('should handle URL without extension', () => {
            mockDocument.URL = 'https://example.com/sudoku';

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_label: 'sudoku'
                })
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing utag.link gracefully', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';
            mockDocument.activeElement = { tagName: 'IFRAME' };
            mockUtag.link = undefined;

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            expect(() => intervalCallback()).not.toThrow();
            // Interval should still be cleared even if tracking doesn't happen
            expect(mockClearInterval).toHaveBeenCalledWith(intervalId);
        });

        it('should handle null utag', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';
            mockDocument.activeElement = { tagName: 'IFRAME' };

            monitorIframeClick(mockDocument, null, mockSetInterval, mockClearInterval);

            expect(() => intervalCallback()).not.toThrow();
        });

        it('should handle errors gracefully', () => {
            mockDocument = {
                get URL() {
                    throw new Error('URL access error');
                }
            };

            expect(() =>
                monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval)
            ).not.toThrow();
            expect(console.error).toHaveBeenCalledWith(
                '[TEALIUM DUTYFARM IFRAME TRACKING] Error:',
                expect.any(Error)
            );
        });

        it('should handle case-sensitive tagName comparison', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';
            mockDocument.activeElement = { tagName: 'iframe' }; // lowercase

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should set interval delay to 100ms', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);

            expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it('should handle empty URL', () => {
            mockDocument.URL = '';

            const result = monitorIframeClick(
                mockDocument,
                mockUtag,
                mockSetInterval,
                mockClearInterval
            );

            expect(result).toBe(null);
            expect(mockSetInterval).not.toHaveBeenCalled();
        });
    });

    describe('Tracking Event Structure', () => {
        it('should send event with correct structure', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';
            mockDocument.activeElement = { tagName: 'IFRAME' };

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            expect(mockUtag.link).toHaveBeenCalledWith({
                event_name: 'dutyfarm_spiele_iframe',
                event_action: 'click',
                event_label: expect.any(String),
                event_data: ''
            });
        });

        it('should always use empty string for event_data', () => {
            mockDocument.URL = 'https://example.com/sudoku.html';
            mockDocument.activeElement = { tagName: 'IFRAME' };

            monitorIframeClick(mockDocument, mockUtag, mockSetInterval, mockClearInterval);
            intervalCallback();

            const callArgs = mockUtag.link.mock.calls[0][0];
            expect(callArgs.event_data).toBe('');
        });
    });
});
