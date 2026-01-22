/**
 * Tests for lsa_tracking.js
 * LSA (Local Storage Attribute) tracking for WELT
 */

const { processLsaTracking } = require('../../extensions/welt/lsa_tracking');

describe('LSA (Lesen Sie Auch) Tracking', () => {
    let mockUtag;
    let mockConsole;

    beforeEach(() => {
        // Mock utag.loader.SC for session storage and utag.link for tracking
        mockUtag = {
            loader: {
                SC: jest.fn()
            },
            link: jest.fn()
        };
        global.utag = mockUtag;

        // Mock console.error
        mockConsole = {
            error: jest.fn()
        };
        global.console = mockConsole;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
        delete global.console;
    });

    describe('Link Event Processing', () => {
        it('should process valid inline teaser link events', () => {
            const eventData = {
                event_name: 'Inline Element',
                event_label: 'inlineTeaser_',
                page_escenicId: '12345'
            };

            processLsaTracking('link', eventData);

            // Should set LSA session storage to '1'
            expect(mockUtag.loader.SC).toHaveBeenCalledWith('utag_main', { lsa: '1' }, 'session');

            // Should fire utag.link with modified event
            expect(mockUtag.link).toHaveBeenCalledTimes(1);
            const linkCall = mockUtag.link.mock.calls[0];
            expect(linkCall[0].event_name).toBe('Lesen Sie Auch');
            expect(linkCall[0].event_action).toBe('click');
            expect(linkCall[0].page_escenicId).toBe('12345');
            expect(linkCall[1]).toBeNull();
            expect(linkCall[2]).toEqual([206]);
        });

        it('should not modify the original event object', () => {
            const eventData = {
                event_name: 'Inline Element',
                event_label: 'inlineTeaser_',
                event_action: 'original_action'
            };

            const originalEventName = eventData.event_name;
            const originalEventAction = eventData.event_action;

            processLsaTracking('link', eventData);

            // Original object should remain unchanged
            expect(eventData.event_name).toBe(originalEventName);
            expect(eventData.event_action).toBe(originalEventAction);
        });

        it('should not process link events with wrong event_name', () => {
            const eventData = {
                event_name: 'Different Event',
                event_label: 'inlineTeaser_'
            };

            processLsaTracking('link', eventData);

            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should not process link events with wrong event_label', () => {
            const eventData = {
                event_name: 'Inline Element',
                event_label: 'differentLabel'
            };

            processLsaTracking('link', eventData);

            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should not process link events with undefined event_name', () => {
            const eventData = {
                event_label: 'inlineTeaser_'
            };

            processLsaTracking('link', eventData);

            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should not process link events with undefined event_label', () => {
            const eventData = {
                event_name: 'Inline Element'
            };

            processLsaTracking('link', eventData);

            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });
    });

    describe('Non-Link Event Handling', () => {
        it('should reset LSA to 0 for view events', () => {
            const eventData = {
                event_name: 'Page View'
            };

            processLsaTracking('view', eventData);

            expect(mockUtag.loader.SC).toHaveBeenCalledWith('utag_main', { lsa: '0' }, 'session');
            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should reset LSA to 0 for any non-link event type', () => {
            const eventData = {
                event_name: 'Some Event'
            };

            processLsaTracking('impression', eventData);

            expect(mockUtag.loader.SC).toHaveBeenCalledWith('utag_main', { lsa: '0' }, 'session');
            expect(mockUtag.link).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in LSA tracking gracefully', () => {
            mockUtag.loader.SC.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const eventData = {
                event_name: 'Inline Element',
                event_label: 'inlineTeaser_'
            };

            expect(() => processLsaTracking('link', eventData)).not.toThrow();
            expect(mockConsole.error).toHaveBeenCalled();
            expect(mockConsole.error.mock.calls[0][0]).toContain('[LSA TRACKING] Error:');
        });

        it('should handle errors when resetting LSA gracefully', () => {
            mockUtag.loader.SC.mockImplementation(() => {
                throw new Error('Reset error');
            });

            const eventData = {};

            expect(() => processLsaTracking('view', eventData)).not.toThrow();
            expect(mockConsole.error).toHaveBeenCalled();
            expect(mockConsole.error.mock.calls[0][0]).toContain('[LSA TRACKING] Error resetting LSA:');
        });

        it('should handle missing utag object gracefully', () => {
            delete global.utag;

            const eventData = {
                event_name: 'Inline Element',
                event_label: 'inlineTeaser_'
            };

            expect(() => processLsaTracking('link', eventData)).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null event data', () => {
            expect(() => processLsaTracking('link', null)).not.toThrow();
            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });

        it('should handle empty event data object', () => {
            const eventData = {};

            processLsaTracking('link', eventData);

            expect(mockUtag.loader.SC).not.toHaveBeenCalled();
            expect(mockUtag.link).not.toHaveBeenCalled();
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle sequential link and view events correctly', () => {
            const linkEventData = {
                event_name: 'Inline Element',
                event_label: 'inlineTeaser_'
            };

            const viewEventData = {
                event_name: 'Page View'
            };

            // Process link event
            processLsaTracking('link', linkEventData);
            expect(mockUtag.loader.SC).toHaveBeenCalledWith('utag_main', { lsa: '1' }, 'session');
            expect(mockUtag.link).toHaveBeenCalledTimes(1);

            // Reset mocks
            mockUtag.loader.SC.mockClear();
            mockUtag.link.mockClear();

            // Process view event
            processLsaTracking('view', viewEventData);
            expect(mockUtag.loader.SC).toHaveBeenCalledWith('utag_main', { lsa: '0' }, 'session');
            expect(mockUtag.link).not.toHaveBeenCalled();
        });
    });
});
