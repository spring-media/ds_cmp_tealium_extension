/**
 * Tests for tracking_ready.js
 * Tests the dispatch of tracking-ready custom event
 */

const { dispatchTrackingReady } = require('../../extensions/welt/tracking_ready_sportdaten');

describe('Tracking Ready Event', () => {
    let mockDispatchEvent;

    beforeEach(() => {
        // Mock document.body.dispatchEvent
        mockDispatchEvent = jest.fn();
        document.body.dispatchEvent = mockDispatchEvent;
        global.console.error = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should dispatch tracking-ready custom event on document.body', () => {
        dispatchTrackingReady(document);

        expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
        const dispatchedEvent = mockDispatchEvent.mock.calls[0][0];
        expect(dispatchedEvent).toBeInstanceOf(CustomEvent);
        expect(dispatchedEvent.type).toBe('tracking-ready');
    });

    it('should handle errors gracefully when dispatchEvent fails', () => {
        mockDispatchEvent.mockImplementation(() => {
            throw new Error('Test error');
        });

        expect(() => dispatchTrackingReady(document)).not.toThrow();
        expect(console.error).toHaveBeenCalledWith(
            '[TEALIUM TRACKING READY] Error:',
            expect.any(Error)
        );
    });

    it('should handle missing document.body gracefully', () => {
        const originalBody = document.body;
        Object.defineProperty(document, 'body', {
            get: () => null,
            configurable: true
        });

        expect(() => dispatchTrackingReady(document)).not.toThrow();
        expect(console.error).toHaveBeenCalled();

        // Restore document.body
        Object.defineProperty(document, 'body', {
            get: () => originalBody,
            configurable: true
        });
    });
});
