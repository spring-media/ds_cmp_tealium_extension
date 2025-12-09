/**
 * Tests for media_tracking.js
 * Media tracking interceptor that adds event40 for first 'pos' event per media_id
 */

/* global utag */

describe('Media Tracking', () => {
    let mockUtag;
    let mockWindow;
    let originalUtagLink;

    beforeEach(() => {
        // Reset window._customEventRegistry
        mockWindow = {
            _customEventRegistry: undefined,
            utag: undefined
        };
        global.window = mockWindow;

        // Mock utag
        originalUtagLink = jest.fn();
        mockUtag = {
            link: originalUtagLink,
            data: {}
        };
        global.utag = mockUtag;
        mockWindow.utag = mockUtag;

        // Mock console
        global.console = {
            log: jest.fn(),
            error: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.window;
        delete global.utag;
    });

    describe('Registry initialization', () => {
        it('should initialize _customEventRegistry when not present', () => {
            window._customEventRegistry = window._customEventRegistry || {
                firedFlags: {},
                originalUtagLink: null,
                interceptorInstalled: false
            };

            expect(window._customEventRegistry).toBeDefined();
            expect(window._customEventRegistry.firedFlags).toEqual({});
            expect(window._customEventRegistry.originalUtagLink).toBeNull();
            expect(window._customEventRegistry.interceptorInstalled).toBe(false);
        });

        it('should preserve existing _customEventRegistry', () => {
            window._customEventRegistry = {
                firedFlags: { 'event40_media_456': true },
                originalUtagLink: jest.fn(),
                interceptorInstalled: true
            };

            const existingRegistry = window._customEventRegistry;

            window._customEventRegistry = window._customEventRegistry || {
                firedFlags: {},
                originalUtagLink: null,
                interceptorInstalled: false
            };

            expect(window._customEventRegistry).toBe(existingRegistry);
            expect(window._customEventRegistry.firedFlags).toEqual({ 'event40_media_456': true });
            expect(window._customEventRegistry.interceptorInstalled).toBe(true);
        });
    });

    describe('Interceptor installation', () => {
        beforeEach(() => {
            window._customEventRegistry = {
                firedFlags: {},
                originalUtagLink: null,
                interceptorInstalled: false
            };
        });

        it('should install interceptor when not already installed', () => {
            expect(window._customEventRegistry.interceptorInstalled).toBe(false);

            if (!window._customEventRegistry.interceptorInstalled) {
                window._customEventRegistry.originalUtagLink = utag.link;
                window._customEventRegistry.interceptorInstalled = true;
            }

            expect(window._customEventRegistry.interceptorInstalled).toBe(true);
            expect(window._customEventRegistry.originalUtagLink).toBe(originalUtagLink);
        });

        it('should not reinstall interceptor when already installed', () => {
            const mockOriginalLink = jest.fn();
            window._customEventRegistry.originalUtagLink = mockOriginalLink;
            window._customEventRegistry.interceptorInstalled = true;

            if (!window._customEventRegistry.interceptorInstalled) {
                window._customEventRegistry.originalUtagLink = utag.link;
            }

            expect(window._customEventRegistry.originalUtagLink).toBe(mockOriginalLink);
        });
    });

    describe('utag.link override functionality', () => {
        beforeEach(() => {
            window._customEventRegistry = {
                firedFlags: {},
                originalUtagLink: originalUtagLink,
                interceptorInstalled: false
            };

            // Simulate the interceptor installation
            utag.link = function(data) {
                try {
                    const modifiedData = { ...data };

                    if (data.event_action === 'pos'
                        && data.event_data
                        && data.event_data.media_id
                        && !window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id]) {

                        modifiedData.event40 = 1;
                        window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id] = true;

                        console.log('Adding event40 to pos event for media_id:', data.event_data.media_id);
                    }

                    window._customEventRegistry.originalUtagLink.call(this, modifiedData);

                    if (modifiedData.event40) {
                        delete utag.data.event40;
                    }

                } catch (error) {
                    console.error('Error in utag.link override:', error);
                    window._customEventRegistry.originalUtagLink.apply(this, [data]);
                }
            };

            window._customEventRegistry.interceptorInstalled = true;
        });

        it('should add event40 for first pos event with media_id', () => {
            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            utag.link(eventData);

            expect(window._customEventRegistry.firedFlags['event40_media_123']).toBe(true);
            expect(console.log).toHaveBeenCalledWith('Adding event40 to pos event for media_id:', 'media_123');
            expect(originalUtagLink).toHaveBeenCalledWith(expect.objectContaining({
                event_action: 'pos',
                event40: 1
            }));
        });

        it('should not add event40 for second pos event with same media_id', () => {
            window._customEventRegistry.firedFlags['event40_media_123'] = true;

            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            utag.link(eventData);

            expect(console.log).not.toHaveBeenCalled();
            expect(originalUtagLink).toHaveBeenCalledWith(expect.objectContaining({
                event_action: 'pos'
            }));
            expect(originalUtagLink).toHaveBeenCalledWith(expect.not.objectContaining({
                event40: 1
            }));
        });

        it('should add event40 for different media_ids', () => {
            const eventData1 = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            const eventData2 = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_456'
                }
            };

            utag.link(eventData1);
            utag.link(eventData2);

            expect(window._customEventRegistry.firedFlags['event40_media_123']).toBe(true);
            expect(window._customEventRegistry.firedFlags['event40_media_456']).toBe(true);
            expect(console.log).toHaveBeenCalledTimes(2);
        });

        it('should not add event40 when event_action is not pos', () => {
            const eventData = {
                event_action: 'play',
                event_data: {
                    media_id: 'media_123'
                }
            };

            utag.link(eventData);

            expect(window._customEventRegistry.firedFlags['event40_media_123']).toBeUndefined();
            expect(console.log).not.toHaveBeenCalled();
            expect(originalUtagLink).toHaveBeenCalledWith(expect.not.objectContaining({
                event40: 1
            }));
        });

        it('should not add event40 when event_data is missing', () => {
            const eventData = {
                event_action: 'pos'
            };

            utag.link(eventData);

            expect(console.log).not.toHaveBeenCalled();
            expect(originalUtagLink).toHaveBeenCalled();
        });

        it('should not add event40 when media_id is missing', () => {
            const eventData = {
                event_action: 'pos',
                event_data: {
                    other_field: 'value'
                }
            };

            utag.link(eventData);

            expect(console.log).not.toHaveBeenCalled();
            expect(originalUtagLink).toHaveBeenCalled();
        });

        it('should delete event40 from utag.data after calling originalUtagLink', () => {
            utag.data.event40 = 1;

            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            utag.link(eventData);

            expect(utag.data.event40).toBeUndefined();
        });

        it('should preserve original data object', () => {
            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                },
                other_field: 'original_value'
            };

            utag.link(eventData);

            expect(eventData.event40).toBeUndefined();
            expect(eventData.other_field).toBe('original_value');
        });

        it('should call originalUtagLink with correct context', () => {
            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            const context = { test: 'context' };
            utag.link.call(context, eventData);

            expect(originalUtagLink).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        beforeEach(() => {
            window._customEventRegistry = {
                firedFlags: {},
                originalUtagLink: originalUtagLink,
                interceptorInstalled: false
            };
        });

        it('should handle errors gracefully and call originalUtagLink', () => {
            // Create an interceptor that throws an error
            utag.link = function(data) {
                try {
                    throw new Error('Test error');
                } catch (error) {
                    console.error('Error in utag.link override:', error);
                    window._customEventRegistry.originalUtagLink.apply(this, [data]);
                }
            };

            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            utag.link(eventData);

            expect(console.error).toHaveBeenCalledWith('Error in utag.link override:', expect.any(Error));
            expect(originalUtagLink).toHaveBeenCalledWith(eventData);
        });

        it('should handle error when originalUtagLink throws', () => {
            originalUtagLink.mockImplementation(() => {
                throw new Error('Original link error');
            });

            utag.link = function(data) {
                try {
                    const modifiedData = { ...data };
                    window._customEventRegistry.originalUtagLink.call(this, modifiedData);
                } catch (error) {
                    console.error('Error in utag.link override:', error);
                    window._customEventRegistry.originalUtagLink.apply(this, [data]);
                }
            };

            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            expect(() => utag.link(eventData)).toThrow();
        });
    });

    describe('Integration scenarios', () => {
        beforeEach(() => {
            window._customEventRegistry = {
                firedFlags: {},
                originalUtagLink: originalUtagLink,
                interceptorInstalled: false
            };

            utag.link = function(data) {
                try {
                    const modifiedData = { ...data };

                    if (data.event_action === 'pos'
                        && data.event_data
                        && data.event_data.media_id
                        && !window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id]) {

                        modifiedData.event40 = 1;
                        window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id] = true;

                        console.log('Adding event40 to pos event for media_id:', data.event_data.media_id);
                    }

                    window._customEventRegistry.originalUtagLink.call(this, modifiedData);

                    if (modifiedData.event40) {
                        delete utag.data.event40;
                    }

                } catch (error) {
                    console.error('Error in utag.link override:', error);
                    window._customEventRegistry.originalUtagLink.apply(this, [data]);
                }
            };

            window._customEventRegistry.interceptorInstalled = true;
        });

        it('should handle multiple media events in sequence', () => {
            const events = [
                { event_action: 'pos', event_data: { media_id: 'media_1' } },
                { event_action: 'play', event_data: { media_id: 'media_1' } },
                { event_action: 'pos', event_data: { media_id: 'media_1' } },
                { event_action: 'pos', event_data: { media_id: 'media_2' } }
            ];

            events.forEach(event => utag.link(event));

            expect(window._customEventRegistry.firedFlags['event40_media_1']).toBe(true);
            expect(window._customEventRegistry.firedFlags['event40_media_2']).toBe(true);
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(originalUtagLink).toHaveBeenCalledTimes(4);
        });

        it('should track event40 flags for multiple unique media_ids', () => {
            const mediaIds = ['media_1', 'media_2', 'media_3', 'media_4', 'media_5'];

            mediaIds.forEach(mediaId => {
                utag.link({
                    event_action: 'pos',
                    event_data: { media_id: mediaId }
                });
            });

            mediaIds.forEach(mediaId => {
                expect(window._customEventRegistry.firedFlags['event40_' + mediaId]).toBe(true);
            });

            expect(console.log).toHaveBeenCalledTimes(5);
        });

        it('should handle complex event data with additional fields', () => {
            const eventData = {
                event_action: 'pos',
                event_category: 'video',
                event_label: 'test_video',
                event_data: {
                    media_id: 'media_complex',
                    duration: 120,
                    title: 'Test Video'
                },
                custom_field: 'custom_value'
            };

            utag.link(eventData);

            expect(window._customEventRegistry.firedFlags['event40_media_complex']).toBe(true);
            expect(originalUtagLink).toHaveBeenCalledWith(expect.objectContaining({
                event_action: 'pos',
                event_category: 'video',
                event_label: 'test_video',
                event40: 1,
                custom_field: 'custom_value'
            }));
        });
    });
});
