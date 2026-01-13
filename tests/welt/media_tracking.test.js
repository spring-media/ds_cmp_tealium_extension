/**
 * Tests for media_tracking.js
 * Media tracking interceptor that adds event40 for first 'pos' event per media_id
 */

/* global utag */

const { installMediaTrackingInterceptor } = require('../../extensions/welt/media_tracking');

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
            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry).toBeDefined();
            expect(window._customEventRegistry.firedFlags).toEqual({});
            expect(window._customEventRegistry.originalUtagLink).toBe(originalUtagLink);
            expect(window._customEventRegistry.interceptorInstalled).toBe(true);
        });

        it('should preserve existing _customEventRegistry', () => {
            window._customEventRegistry = {
                firedFlags: { event40_media_456: true },
                originalUtagLink: jest.fn(),
                interceptorInstalled: true
            };

            const existingRegistry = window._customEventRegistry;

            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry).toBe(existingRegistry);
            expect(window._customEventRegistry.firedFlags).toEqual({ event40_media_456: true });
            expect(window._customEventRegistry.interceptorInstalled).toBe(true);
        });
    });

    describe('Interceptor installation', () => {
        it('should install interceptor when not already installed', () => {
            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry.interceptorInstalled).toBe(true);
            expect(window._customEventRegistry.originalUtagLink).toBe(originalUtagLink);
            expect(utag.link).not.toBe(originalUtagLink);
        });

        it('should not reinstall interceptor when already installed', () => {
            const mockOriginalLink = jest.fn();
            window._customEventRegistry = {
                firedFlags: {},
                originalUtagLink: mockOriginalLink,
                interceptorInstalled: true
            };

            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry.originalUtagLink).toBe(mockOriginalLink);
        });
    });

    describe('Early returns', () => {
        it('should return early when utag is not available', () => {
            delete global.utag;
            delete mockWindow.utag;

            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry).toBeUndefined();
        });

        it('should return early when utag.link is not available', () => {
            delete utag.link;

            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry).toBeUndefined();
        });

        it('should return early when eventData is missing', () => {
            installMediaTrackingInterceptor('alias', null);

            expect(window._customEventRegistry).toBeUndefined();
        });

        it('should return early when event_data is missing', () => {
            installMediaTrackingInterceptor('alias', {});

            expect(window._customEventRegistry).toBeUndefined();
        });

        it('should return early when media_id is missing', () => {
            const eventData = {
                event_data: {
                    other_field: 'value'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);

            expect(window._customEventRegistry).toBeUndefined();
        });
    });

    describe('utag.link override functionality', () => {
        beforeEach(() => {
            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);
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
            expect(console.log).toHaveBeenCalledWith(
                'Adding event40 to pos event for media_id:',
                'media_123'
            );
            expect(originalUtagLink).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_action: 'pos',
                    event40: 1
                })
            );
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
            expect(originalUtagLink).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_action: 'pos'
                })
            );
            expect(originalUtagLink).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    event40: 1
                })
            );
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
            expect(originalUtagLink).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    event40: 1
                })
            );
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
            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);
        });

        it('should handle errors gracefully and call originalUtagLink', () => {
            // Force an error by making originalUtagLink throw on first call
            originalUtagLink.mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            const eventData = {
                event_action: 'pos',
                event_data: {
                    media_id: 'media_123'
                }
            };

            expect(() => utag.link(eventData)).not.toThrow();
            expect(console.error).toHaveBeenCalledWith(
                'Error in utag.link override:',
                expect.any(Error)
            );
            expect(originalUtagLink).toHaveBeenCalledTimes(2); // Once failed, once in catch
        });
    });

    describe('Integration scenarios', () => {
        beforeEach(() => {
            const eventData = {
                event_data: {
                    media_id: 'media_123'
                }
            };

            installMediaTrackingInterceptor('alias', eventData);
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
            expect(originalUtagLink).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_action: 'pos',
                    event_category: 'video',
                    event_label: 'test_video',
                    event40: 1,
                    custom_field: 'custom_value'
                })
            );
        });
    });
});
