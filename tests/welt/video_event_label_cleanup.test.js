/**
 * Tests for video_event_label_cleanup.js
 * Video Event Label Cleanup - deletes event_label for specific video event actions
 */

const { processVideoEventLabelCleanup } = require('../../extensions/welt/video_event_label_cleanup');

describe('Video Event Label Cleanup', () => {
    let mockUtag;

    beforeEach(() => {
        // Mock utag
        mockUtag = {
            data: {
                event_name: '',
                event_action: '',
                event_label: 'test_label'
            }
        };
        global.utag = mockUtag;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
    });

    describe('Early Returns', () => {
        it('should return early when utag is undefined', () => {
            delete global.utag;

            expect(() => processVideoEventLabelCleanup()).not.toThrow();
        });

        it('should return early when utag.data is not available', () => {
            global.utag = {};

            expect(() => processVideoEventLabelCleanup()).not.toThrow();
        });
    });

    describe('Delete event_label for specific video actions', () => {
        const actionsToDelete = ['pos', 'resume', 'paused', 'fullscreen_on', 'fullscreen_off', 'play', 'end', 'unmute', 'mute'];

        actionsToDelete.forEach(action => {
            it(`should delete event_label for video event with action: ${action}`, () => {
                mockUtag.data.event_name = 'video';
                mockUtag.data.event_action = action;
                mockUtag.data.event_label = 'test_label';

                processVideoEventLabelCleanup();

                expect(mockUtag.data.event_label).toBeUndefined();
            });
        });

        it('should delete event_label for all specified actions', () => {
            actionsToDelete.forEach(action => {
                mockUtag.data.event_name = 'video';
                mockUtag.data.event_action = action;
                mockUtag.data.event_label = 'label_' + action;

                processVideoEventLabelCleanup();

                expect(mockUtag.data.event_label).toBeUndefined();
            });
        });
    });

    describe('Do NOT delete event_label', () => {
        it('should not delete event_label for non-video events', () => {
            mockUtag.data.event_name = 'page_view';
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should not delete event_label when event_name is empty string', () => {
            mockUtag.data.event_name = '';
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should not delete event_label when event_name is the string "undefined"', () => {
            mockUtag.data.event_name = 'undefined';
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should not delete event_label for video events with non-listed actions', () => {
            const nonListedActions = ['start', 'cancel', 'custom_action', 'revolverload'];

            nonListedActions.forEach(action => {
                mockUtag.data.event_name = 'video';
                mockUtag.data.event_action = action;
                mockUtag.data.event_label = 'test_label';

                processVideoEventLabelCleanup();

                expect(mockUtag.data.event_label).toBe('test_label');
            });
        });

        it('should not delete event_label when event_action is missing', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = undefined;
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should not delete event_label when event_action is empty string', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = '';
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle multiple sequential video events', () => {
            // First: play action should delete label
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'label1';

            processVideoEventLabelCleanup();
            expect(mockUtag.data.event_label).toBeUndefined();

            // Second: non-listed action should not delete label
            mockUtag.data.event_action = 'custom_action';
            mockUtag.data.event_label = 'label2';

            processVideoEventLabelCleanup();
            expect(mockUtag.data.event_label).toBe('label2');

            // Third: end action should delete label
            mockUtag.data.event_action = 'end';
            processVideoEventLabelCleanup();
            expect(mockUtag.data.event_label).toBeUndefined();
        });

        it('should preserve other utag.data properties', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'test_label';
            mockUtag.data.event_category = 'video_category';
            mockUtag.data.event_value = 100;
            mockUtag.data.custom_field = 'custom_value';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBeUndefined();
            expect(mockUtag.data.event_name).toBe('video');
            expect(mockUtag.data.event_action).toBe('play');
            expect(mockUtag.data.event_category).toBe('video_category');
            expect(mockUtag.data.event_value).toBe(100);
            expect(mockUtag.data.custom_field).toBe('custom_value');
        });

        it('should handle case when event_label does not exist', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'play';
            delete mockUtag.data.event_label;

            expect(() => processVideoEventLabelCleanup()).not.toThrow();
            expect(mockUtag.data.event_label).toBeUndefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle event_action with similar names but not in list', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'playing'; // Similar to 'play' but not in list
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should be case-sensitive for event_action', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'PLAY'; // Uppercase
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should be case-sensitive for event_name', () => {
            mockUtag.data.event_name = 'VIDEO'; // Uppercase
            mockUtag.data.event_action = 'play';
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });

        it('should handle null event_action', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = null;
            mockUtag.data.event_label = 'test_label';

            processVideoEventLabelCleanup();

            expect(mockUtag.data.event_label).toBe('test_label');
        });
    });
});
