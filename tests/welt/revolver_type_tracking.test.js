/**
 * Tests for revolver_type_tracking.js
 * Revolver Type Tracking - manages revolver_type in event_data based on video events
 */

const { processRevolverTypeTracking } = require('../../extensions/welt/revolver_type_tracking');

describe('Revolver Type Tracking', () => {
    let mockUtag;
    let mockConsole;

    beforeEach(() => {
        // Mock utag
        mockUtag = {
            data: {
                event_name: '',
                event_action: '',
                event_data: {}
            }
        };
        global.utag = mockUtag;

        // Mock console
        mockConsole = {
            log: jest.fn(),
            error: jest.fn()
        };
        global.console = mockConsole;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
        delete global.console;
    });

    describe('Early Returns', () => {
        it('should return early when utag is undefined', () => {
            delete global.utag;

            expect(() => processRevolverTypeTracking()).not.toThrow();
        });

        it('should return early when utag.data is not available', () => {
            global.utag = {};

            expect(() => processRevolverTypeTracking()).not.toThrow();
        });
    });

    describe('Video Events - Revolverload Action', () => {
        it('should set revolver_type when revolverload action occurs on EndScreen', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'revolverload_auto';
            mockUtag.data.event_data = {
                media_placement: 'EndScreen'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBe('revolverload_auto');
            expect(mockConsole.log).toHaveBeenCalledWith("utag.data.event_data['revolver_type'] set event_revolverType revolverload_auto");
        });

        it('should not set revolver_type when media_placement is not EndScreen', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'revolverload';
            mockUtag.data.event_data = {
                media_placement: 'InlinePlayer'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBeUndefined();
        });

        it('should not set revolver_type when event_action is missing', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = null;
            mockUtag.data.event_data = {
                media_placement: 'EndScreen'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBeUndefined();
        });
    });

    describe('Video Events - Cancel Action', () => {
        it('should clear revolver_type when cancel action occurs', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'cancel';
            mockUtag.data.event_data = {
                revolver_type: 'revolverload_auto'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBe('');
            expect(mockConsole.log).toHaveBeenCalledWith('utag.data.event_revolverType cancel ');
        });

        it('should handle cancel action with variations', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'user_cancel';
            mockUtag.data.event_data = {
                revolver_type: 'some_value'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBe('');
        });
    });

    describe('Non-Video Events', () => {
        it('should clear revolver_type for non-video events when revolver_type exists', () => {
            mockUtag.data.event_name = 'page_view';
            mockUtag.data.event_data = {
                revolver_type: 'revolverload_auto'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBe('');
            expect(mockConsole.log).toHaveBeenCalledWith("utag.data.event_data['revolver_type'] delete ");
        });

        it('should not attempt to clear revolver_type when it does not exist', () => {
            mockUtag.data.event_name = 'page_view';
            mockUtag.data.event_data = {
                other_field: 'value'
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBeUndefined();
            expect(mockConsole.log).not.toHaveBeenCalled();
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle sequential video events correctly', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_data = {
                media_placement: 'EndScreen'
            };

            // Set revolver_type
            mockUtag.data.event_action = 'revolverload_auto';
            processRevolverTypeTracking();
            expect(mockUtag.data.event_data['revolver_type']).toBe('revolverload_auto');

            // Play action should preserve revolver_type
            mockUtag.data.event_action = 'play';
            processRevolverTypeTracking();
            expect(mockUtag.data.event_data['revolver_type']).toBe('revolverload_auto');

            // Cancel should clear revolver_type
            mockUtag.data.event_action = 'cancel';
            processRevolverTypeTracking();
            expect(mockUtag.data.event_data['revolver_type']).toBe('');
        });

        it('should handle transition from video to non-video event', () => {
            // Set revolver_type via revolverload
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'revolverload';
            mockUtag.data.event_data = {
                media_placement: 'EndScreen'
            };

            processRevolverTypeTracking();
            expect(mockUtag.data.event_data['revolver_type']).toBe('revolverload');

            // Switch to non-video event should clear revolver_type
            mockUtag.data.event_name = 'page_view';
            mockUtag.data.event_action = '';
            processRevolverTypeTracking();
            expect(mockUtag.data.event_data['revolver_type']).toBe('');
        });

        it('should preserve other event_data fields', () => {
            mockUtag.data.event_name = 'video';
            mockUtag.data.event_action = 'revolverload';
            mockUtag.data.event_data = {
                media_placement: 'EndScreen',
                media_id: '12345',
                duration: 120
            };

            processRevolverTypeTracking();

            expect(mockUtag.data.event_data['revolver_type']).toBe('revolverload');
            expect(mockUtag.data.event_data.media_id).toBe('12345');
            expect(mockUtag.data.event_data.duration).toBe(120);
        });
    });
});
