/**
 * Tests for set_media_id_and_headline.js
 *
 * This extension normalizes media_id and media_headline for video link events.
 * It handles two player types:
 * - Xymatic: takes media_id and media_headline directly from event_data
 * - Non-Xymatic: extracts media_id from contentID and media_headline from event object
 *
 * The extension receives two parameters from Tealium:
 * - a: event type (e.g., 'link', 'view')
 * - b: event data object containing event_name, event_data, and other properties
 *
 * Behavior:
 * - Only runs when a === 'link' AND b.event_name === 'video'
 * - For Xymatic player: uses media_id and media_headline from event_data
 * - For non-Xymatic: extracts media_id from contentID (handles content-discovery pattern)
 * - Sets values in TWO places: b (event object) AND utag.data (global)
 */

describe('set_media_id_and_headline - Video Media ID and Headline Normalization', () => {
    let originalA;
    let originalB;
    let originalUtag;

    beforeEach(() => {
        // Store original global values
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

    describe('Xymatic player - media_id and headline from event_data', () => {
        it('should extract media_id from event_data for xymatic player', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'xymatic_123'
                }
            };
            global.utag.data.contentID = '/some/path/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('xymatic_123');
            expect(global.utag.data.media_id).toBe('xymatic_123');
        });

        it('should extract media_headline from event_data for xymatic player', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'xymatic_456',
                    media_headline: 'Xymatic Video Title'
                }
            };
            global.utag.data.contentID = '/some/path/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('xymatic_456');
            expect(global.utag.data.media_id).toBe('xymatic_456');
            expect(global.b.media_headline).toBe('Xymatic Video Title');
            expect(global.utag.data.media_headline).toBe('Xymatic Video Title');
        });

        it('should handle xymatic player with uppercase letters', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'XYMATIC',
                    media_id: 'xymatic_789'
                }
            };
            global.utag.data.contentID = '/some/path/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should work because player name is lowercased
            expect(global.b.media_id).toBe('xymatic_789');
            expect(global.utag.data.media_id).toBe('xymatic_789');
        });

        it('should handle xymatic player with mixed case', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'Xymatic',
                    media_id: 'xymatic_mixed'
                }
            };
            global.utag.data.contentID = '/some/path/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('xymatic_mixed');
            expect(global.utag.data.media_id).toBe('xymatic_mixed');
        });

        it('should not set headline if not present in event_data for xymatic', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'xymatic_no_headline'
                }
            };
            global.utag.data.contentID = '/some/path/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: media_id set, but not headline
            expect(global.b.media_id).toBe('xymatic_no_headline');
            expect(global.b.media_headline).toBeUndefined();
            expect(global.utag.data.media_headline).toBeUndefined();
        });
    });

    describe('Non-Xymatic player - media_id from contentID', () => {
        it('should extract media_id from standard contentID pattern', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = '/category/subcategory/media123/extra';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Check BOTH locations
            expect(global.b.media_id).toBe('media123');
            expect(global.utag.data.media_id).toBe('media123');
        });

        it('should extract media_id from content-discovery pattern', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'vimeo'
                }
            };
            global.utag.data.contentID = '/path/to/content-discovery/media456/more';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should use position [4] for content-discovery
            expect(global.b.media_id).toBe('media456');
            expect(global.utag.data.media_id).toBe('media456');
        });

        it('should trim and remove quotes from contentID', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'brightcove'
                }
            };
            global.utag.data.contentID = ' ""/path/to/media789"" ';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('media789');
            expect(global.utag.data.media_id).toBe('media789');
        });

        it('should extract media_headline from b.media_headline for non-xymatic', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                },
                media_headline: 'YouTube Video Title'
            };
            global.utag.data.contentID = '/path/to/media111';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('media111');
            expect(global.b.media_headline).toBe('YouTube Video Title');
            expect(global.utag.data.media_headline).toBe('YouTube Video Title');
        });

        it('should extract media_headline from b.headline as fallback', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'vimeo'
                },
                headline: 'Fallback Headline'
            };
            global.utag.data.contentID = '/path/to/media222';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('media222');
            expect(global.b.media_headline).toBe('Fallback Headline');
            expect(global.utag.data.media_headline).toBe('Fallback Headline');
        });

        it('should prefer media_headline over headline for non-xymatic', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'brightcove'
                },
                media_headline: 'Primary Headline',
                headline: 'Secondary Headline'
            };
            global.utag.data.contentID = '/path/to/media333';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should use media_headline, not headline
            expect(global.b.media_headline).toBe('Primary Headline');
            expect(global.utag.data.media_headline).toBe('Primary Headline');
        });

        it('should not set headline if neither media_headline nor headline exist', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = '/path/to/media444';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: media_id set, but not headline
            expect(global.b.media_id).toBe('media444');
            expect(global.b.media_headline).toBeUndefined();
            expect(global.utag.data.media_headline).toBeUndefined();
        });
    });

    describe('Event type and name validation', () => {
        it('should not run if event type is not "link"', () => {
            // Arrange
            global.a = 'view';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'should_not_set'
                }
            };
            global.utag.data.contentID = '/path/to/media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Nothing should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if event_name is not "video"', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'click',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'should_not_set'
                }
            };
            global.utag.data.contentID = '/path/to/media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Nothing should be set
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if b is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = undefined;
            global.utag.data.contentID = '/path/to/media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if b is null', () => {
            // Arrange
            global.a = 'link';
            global.b = null;
            global.utag.data.contentID = '/path/to/media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not run if event_name is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                other_property: 'value'
            };
            global.utag.data.contentID = '/path/to/media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.utag.data.media_id).toBeUndefined();
        });
    });

    describe('ContentID validation for non-Xymatic', () => {
        it('should not set media_id if contentID is undefined', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = undefined;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not set media_id if contentID is not a string', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = 12345;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not set media_id if contentID is null', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = null;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });

        it('should not set media_id if extracted value is empty', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = '/short/path';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBeUndefined();
            expect(global.utag.data.media_id).toBeUndefined();
        });
    });

    describe('Event_data handling', () => {
        it('should handle missing event_data gracefully', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video'
            };
            global.utag.data.contentID = '/path/to/media555';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should fall back to contentID extraction
            expect(global.b.media_id).toBe('media555');
            expect(global.utag.data.media_id).toBe('media555');
        });

        it('should handle event_data as non-object', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: 'not an object'
            };
            global.utag.data.contentID = '/path/to/media666';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should fall back to contentID extraction
            expect(global.b.media_id).toBe('media666');
            expect(global.utag.data.media_id).toBe('media666');
        });

        it('should handle missing media_player in event_data', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    other_field: 'value'
                }
            };
            global.utag.data.contentID = '/path/to/media777';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should fall back to contentID extraction
            expect(global.b.media_id).toBe('media777');
            expect(global.utag.data.media_id).toBe('media777');
        });
    });

    describe('Edge cases and integration scenarios', () => {
        it('should handle xymatic with both media_id and contentID present', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'xymatic_priority'
                }
            };
            global.utag.data.contentID = '/path/to/fallback_media';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should use xymatic media_id, not contentID
            expect(global.b.media_id).toBe('xymatic_priority');
            expect(global.utag.data.media_id).toBe('xymatic_priority');
        });

        it('should handle special characters in media_id', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'youtube'
                }
            };
            global.utag.data.contentID = '/path/to/media-123_abc';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('media-123_abc');
            expect(global.utag.data.media_id).toBe('media-123_abc');
        });

        it('should handle numeric media_id', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'vimeo'
                }
            };
            global.utag.data.contentID = '/category/subcategory/999888777';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert
            expect(global.b.media_id).toBe('999888777');
            expect(global.utag.data.media_id).toBe('999888777');
        });

        it('should handle complex event with all fields present', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_category: 'media',
                event_action: 'play',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'complex_123',
                    media_headline: 'Complex Video Title',
                    duration: 120
                },
                custom_field: 'custom_value'
            };
            global.utag.data.contentID = '/path/to/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should set media_id and headline, preserve other fields
            expect(global.b.media_id).toBe('complex_123');
            expect(global.b.media_headline).toBe('Complex Video Title');
            expect(global.b.custom_field).toBe('custom_value');
            expect(global.utag.data.media_id).toBe('complex_123');
            expect(global.utag.data.media_headline).toBe('Complex Video Title');
        });

        it('should not override existing headline for xymatic player', () => {
            // Arrange
            global.a = 'link';
            global.b = {
                event_name: 'video',
                event_data: {
                    media_player: 'xymatic',
                    media_id: 'xymatic_999',
                    media_headline: 'Xymatic Headline'
                },
                headline: 'Should Not Use This'
            };
            global.utag.data.contentID = '/path/to/fallback';

            // Act
            jest.isolateModules(() => {
                require('../../extensions/bz/set_media_id_and_headline');
            });

            // Assert: Should use xymatic headline from event_data
            expect(global.b.media_headline).toBe('Xymatic Headline');
            expect(global.utag.data.media_headline).toBe('Xymatic Headline');
        });
    });
});
