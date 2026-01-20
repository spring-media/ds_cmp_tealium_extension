/**
 * Tests for mehr_zum_thema.js
 *
 * This extension tracks "Mehr zum Thema" (More on this topic) link clicks
 * and sets a session cookie flag (mzt) that can be used to track article navigation.
 *
 * The extension receives two parameters from Tealium:
 * - a: event type (e.g., 'link', 'view')
 * - b: event data object containing event_name and other properties
 *
 * Behavior:
 * - When a === 'link' AND b.event_name === 'Mehr zum Thema': sets mzt=1 in session
 * - When a !== 'link': sets mzt=0 in session
 * - Otherwise: does nothing
 */

describe('mehr_zum_thema - Mehr zum Thema Link Tracking', () => {
    let mockUtagLoader;
    let originalA;
    let originalB;
    let originalUtag;

    beforeEach(() => {
        // Create mock for utag.loader.SC function
        mockUtagLoader = {
            SC: jest.fn()
        };

        // Store original global values (if they exist)
        originalA = global.a;
        originalB = global.b;
        originalUtag = global.utag;

        // Set up global utag object
        global.utag = {
            loader: mockUtagLoader
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

    describe('When user clicks "Mehr zum Thema" link', () => {
        it('should set mzt flag to "1" in session storage', () => {
            // Arrange: Set up the scenario where user clicks "Mehr zum Thema" link
            global.a = 'link';
            global.b = {
                event_name: 'Mehr zum Thema'
            };

            // Act: Execute the extension code
            require('../../extensions/lib_books/mehr_zum_thema.js');

            // Assert: Verify that SC was called with correct parameters
            expect(mockUtagLoader.SC).toHaveBeenCalledTimes(1);
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '1' }, 'session');
        });

        it('should set mzt flag to "1" even with additional properties in event data', () => {
            // Arrange: Event data with additional properties
            global.a = 'link';
            global.b = {
                event_name: 'Mehr zum Thema',
                event_action: 'click',
                event_label: 'some-label',
                other_property: 'value'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '1' }, 'session');
        });
    });

    describe('When event is NOT a link event', () => {
        it('should set mzt flag to "0" for view events', () => {
            // Arrange: Page view event
            global.a = 'view';
            global.b = {
                page_name: 'some-page'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert
            expect(mockUtagLoader.SC).toHaveBeenCalledTimes(1);
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '0' }, 'session');
        });

        it('should set mzt flag to "0" for custom events', () => {
            // Arrange: Custom event
            global.a = 'custom_event';
            global.b = {
                event_name: 'some_custom_event'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '0' }, 'session');
        });

        it('should set mzt flag to "0" even when b is undefined', () => {
            // Arrange: Non-link event with undefined b
            global.a = 'view';
            global.b = undefined;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '0' }, 'session');
        });
    });

    describe('When event is a link but NOT "Mehr zum Thema"', () => {
        it('should NOT call SC for different link event names', () => {
            // Arrange: Link event with different event_name
            global.a = 'link';
            global.b = {
                event_name: 'Different Link'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: SC should not be called because it's a link event but not "Mehr zum Thema"
            expect(mockUtagLoader.SC).not.toHaveBeenCalled();
        });

        it('should NOT call SC when event_name is undefined', () => {
            // Arrange: Link event without event_name
            global.a = 'link';
            global.b = {
                event_action: 'click'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert
            expect(mockUtagLoader.SC).not.toHaveBeenCalled();
        });

        it('should NOT call SC when b is undefined', () => {
            // Arrange: Link event with undefined b
            global.a = 'link';
            global.b = undefined;

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: SC should not be called because b is undefined
            expect(mockUtagLoader.SC).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases and validation', () => {
        it('should be case-sensitive for event_name', () => {
            // Arrange: Wrong case
            global.a = 'link';
            global.b = {
                event_name: 'mehr zum thema' // lowercase
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: Should not match because it's case-sensitive
            expect(mockUtagLoader.SC).not.toHaveBeenCalled();
        });

        it('should be case-sensitive for event type', () => {
            // Arrange: Wrong case for event type
            global.a = 'Link'; // uppercase L
            global.b = {
                event_name: 'Mehr zum Thema'
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: Should set mzt to 0 because 'Link' !== 'link'
            expect(mockUtagLoader.SC).toHaveBeenCalledWith('utag_main', { mzt: '0' }, 'session');
        });

        it('should handle event_name with extra whitespace', () => {
            // Arrange: Event name with extra spaces
            global.a = 'link';
            global.b = {
                event_name: 'Mehr zum Thema ' // trailing space
            };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: Should not match due to exact string comparison
            expect(mockUtagLoader.SC).not.toHaveBeenCalled();
        });
    });

    describe('Session storage parameters', () => {
        it('should always use "utag_main" as the storage key', () => {
            // Arrange
            global.a = 'link';
            global.b = { event_name: 'Mehr zum Thema' };

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: First parameter should always be 'utag_main'
            expect(mockUtagLoader.SC).toHaveBeenCalledWith(
                'utag_main',
                expect.any(Object),
                'session'
            );
        });

        it('should always use "session" as the storage type', () => {
            // Arrange
            global.a = 'view';
            global.b = {};

            // Act
            jest.isolateModules(() => {
                require('../../extensions/lib_books/mehr_zum_thema.js');
            });

            // Assert: Third parameter should always be 'session'
            expect(mockUtagLoader.SC).toHaveBeenCalledWith(
                'utag_main',
                expect.any(Object),
                'session'
            );
        });
    });
});
