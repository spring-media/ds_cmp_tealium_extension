/**
 * Tests for set_mediaID_from_contentID
 *
 * This extension extracts media_id from contentID for video link events.
 * It handles two different URL patterns:
 * - content-discovery pattern: extracts from position [4]
 * - standard pattern: extracts from position [3]
 *
 * The extension receives two parameters from Tealium:
 * - a: event type (e.g., 'link', 'view')
 * - b: event data object containing event_name and other properties
 *
 * Behavior:
 * - Only runs when a === 'link' AND b.event_name === 'video'
 * - Validates contentID exists and is a string
 * - Cleans contentID by trimming and removing quotes
 * - Extracts media_id based on URL pattern
 * - Sets media_id in TWO places: b.media_id (event object) AND utag.data.media_id (global)
 */

describe('set_mediaID_from_contentID - Video Media ID Extraction', () => {
    let originalA;
    let originalB;
    let originalUtag;

    beforeEach(() => {
        // Store original global values (if they exist)
        originalA = global.a;
        originalB = global.b;
        originalUtag = global.utag;

        // Set up global utag object with data
        global.utag = {
            data: {}
        };
    });

    afterEach(() => {
        // Restore original global values
        global.a = originalA;
        global.b = originalB;
        global.utag = originalUtag;

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('When video link event with content-discovery pattern', () => {
        it('should extract media_id from position [4] for content-discovery URLs', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/some/path/content-discovery/media123/more';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations where media_id is set
            expect(global.b.media_id).toBe('media123');
            expect(global.utag.data.media_id).toBe('media123');
        });

        it('should handle content-discovery pattern with trailing slash', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/path/content-discovery/segment/video456/';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('video456');
            expect(global.utag.data.media_id).toBe('video456');
        });

        it('should return empty string if position [4] does not exist in content-discovery pattern', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/short/content-discovery/path';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations get empty string
            expect(global.b.media_id).toBe('');
            expect(global.utag.data.media_id).toBe('');
        });
    });

    describe('When video link event with standard pattern', () => {
        it('should extract media_id from position [3] for standard URLs', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/category/subcategory/article789/extra';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('article789');
            expect(global.utag.data.media_id).toBe('article789');
        });

        it('should handle standard pattern with trailing slash', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/section/topic/content999/';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('content999');
            expect(global.utag.data.media_id).toBe('content999');
        });

        it('should return empty string if position [3] does not exist in standard pattern', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/short/path';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations get empty string
            expect(global.b.media_id).toBe('');
            expect(global.utag.data.media_id).toBe('');
        });
    });

    describe('ContentID cleaning and validation', () => {
        it('should trim whitespace from contentID', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '  /path/to/media123  ';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media123');
            expect(global.utag.data.media_id).toBe('media123');
        });

        it('should remove leading quotes from contentID', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '"/path/to/media456';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media456');
            expect(global.utag.data.media_id).toBe('media456');
        });

        it('should remove trailing quotes from contentID', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/path/to/media789"';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media789');
            expect(global.utag.data.media_id).toBe('media789');
        });

        it('should remove both leading and trailing quotes and trim', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = ' ""/path/to/media111"" ';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media111');
            expect(global.utag.data.media_id).toBe('media111');
        });

        it('should not run if contentID is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = undefined;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if contentID is not a string', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = 12345;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if contentID is null', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = null;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if contentID is an empty string', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });
    });

    describe('Event type and name validation', () => {
        it('should not run if event type is not "link"', () => {
            // Arrange
            global.a = 'view';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if event_name is not "video"', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'click' };
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Neither location should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if b is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = undefined;
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if b is null', () => {
            // Arrange
            global.a = 'link';
            global.b = null;
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if event_name is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = { other_property: 'value' };
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });
    });

    describe('Edge cases', () => {
        it('should be case-sensitive for event type', () => {
            // Arrange
            global.a = 'Link'; // uppercase L
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should be case-sensitive for event_name', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'Video' }; // uppercase V
            global.utag.data.contentID = '/path/to/media123';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should handle contentID with multiple content-discovery occurrences', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/first/second/content-discovery/media555/extra';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations - should use position [4] when content-discovery is found
            expect(global.b.media_id).toBe('media555');
            expect(global.utag.data.media_id).toBe('media555');
        });

        it('should handle contentID with special characters in media_id', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/path/to/media-123_abc';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media-123_abc');
            expect(global.utag.data.media_id).toBe('media-123_abc');
        });

        it('should handle contentID with numeric media_id', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'video' };
            global.utag.data.contentID = '/category/subcategory/999888777';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/set_mediaID_from_contentID');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('999888777');
            expect(global.utag.data.media_id).toBe('999888777');
        });
    });
});
