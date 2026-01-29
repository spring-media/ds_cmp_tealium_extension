/**
 * Tests for sitestay_tracking.js
 * User engagement tracking for WELT article pages
 */

/* global utag, document, window */

const {
    isArticlePage,
    isInTargetGroup,
    isWatchingVideo,
    setActive,
    checkSessionExpiration,
    sendSitestayEvent,
    getState,
    resetState,
    constants
} = require('../../extensions/welt/sitestay_tracking');

describe('Sitestay Tracking', () => {
    let mockUtag;
    let mockWindow;
    let mockDocument;

    beforeEach(() => {
        // Reset state before each test
        resetState();

        // Mock utag.data
        mockUtag = {
            data: {},
            link: jest.fn()
        };
        global.utag = mockUtag;

        // Mock window
        mockWindow = {
            utag: mockUtag
        };
        global.window = mockWindow;

        // Mock document
        mockDocument = {
            hidden: false,
            addEventListener: jest.fn()
        };
        global.document = mockDocument;

        // Mock timers
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        delete global.utag;
        delete global.window;
        delete global.document;
    });

    describe('isArticlePage', () => {
        it('should return true when page_type is article', () => {
            const utagData = { page_type: 'article' };
            expect(isArticlePage(utagData)).toBe(true);
        });

        it('should return false when page_type is not article', () => {
            expect(isArticlePage({ page_type: 'home' })).toBe(false);
            expect(isArticlePage({ page_type: 'video' })).toBe(false);
            expect(isArticlePage({ page_type: '' })).toBe(false);
        });

        it('should return false when utagData is invalid', () => {
            expect(isArticlePage(null)).toBe(false);
            expect(isArticlePage(undefined)).toBe(false);
            expect(isArticlePage({})).toBe(false);
        });
    });

    describe('isInTargetGroup', () => {
        it('should return true when ECID ends with target group digits', () => {
            expect(isInTargetGroup({ 'cp.s_ecid': 'ABC12345601' })).toBe(true);
            expect(isInTargetGroup({ 'cp.s_ecid': 'XYZ98765405' })).toBe(true);
            expect(isInTargetGroup({ 'cp.s_ecid': 'TEST00000010' })).toBe(true);
        });

        it('should return false when ECID ends with non-target digits', () => {
            expect(isInTargetGroup({ 'cp.s_ecid': 'ABC12345611' })).toBe(false);
            expect(isInTargetGroup({ 'cp.s_ecid': 'XYZ98765420' })).toBe(false);
            expect(isInTargetGroup({ 'cp.s_ecid': 'TEST00000099' })).toBe(false);
        });

        it('should return false when ECID is invalid', () => {
            expect(isInTargetGroup({ 'cp.s_ecid': '' })).toBe(false);
            expect(isInTargetGroup({ 'cp.s_ecid': 'A' })).toBe(false);
            expect(isInTargetGroup({ 'cp.s_ecid': null })).toBe(false);
            expect(isInTargetGroup({ 'cp.s_ecid': 123 })).toBe(false);
        });

        it('should return false when ECID is undefined', () => {
            expect(isInTargetGroup({})).toBe(false);
            expect(isInTargetGroup(null)).toBe(false);
            expect(isInTargetGroup(undefined)).toBe(false);
        });
    });

    describe('isWatchingVideo', () => {
        it('should return true when watching unmuted video', () => {
            const utagData = {
                event_name: 'video',
                event_data: {
                    media_is_muted: 'false'
                }
            };
            expect(isWatchingVideo(utagData)).toBe(true);
        });

        it('should return false when video is muted', () => {
            const utagData = {
                event_name: 'video',
                event_data: {
                    media_is_muted: 'true'
                }
            };
            expect(isWatchingVideo(utagData)).toBe(false);
        });

        it('should return false when event is not video', () => {
            const utagData = {
                event_name: 'click',
                event_data: {
                    media_is_muted: 'false'
                }
            };
            expect(isWatchingVideo(utagData)).toBe(false);
        });

        it('should return false when event_data is missing', () => {
            const utagData = {
                event_name: 'video'
            };
            expect(isWatchingVideo(utagData)).toBe(false);
        });

        it('should return false when utagData is invalid', () => {
            expect(isWatchingVideo(null)).toBe(false);
            expect(isWatchingVideo(undefined)).toBe(false);
            expect(isWatchingVideo({})).toBe(false);
        });
    });

    describe('setActive', () => {
        it('should set user as active', () => {
            setActive();
            const state = getState();
            expect(state.isActive).toBe(true);
        });

        it('should update last active timestamp', () => {
            const beforeTimestamp = getState().lastActiveTimestamp;
            jest.advanceTimersByTime(1000);
            setActive();
            const afterTimestamp = getState().lastActiveTimestamp;
            expect(afterTimestamp).toBeGreaterThan(beforeTimestamp);
        });

        it('should set user as inactive after 30 seconds', () => {
            setActive();
            expect(getState().isActive).toBe(true);

            jest.advanceTimersByTime(constants.ACTIVITY_TIMEOUT);

            expect(getState().isActive).toBe(false);
        });

        it('should reset timeout on repeated calls', () => {
            setActive();
            jest.advanceTimersByTime(20000);

            setActive(); // Reset timeout
            jest.advanceTimersByTime(20000);

            expect(getState().isActive).toBe(true);
        });
    });

    describe('checkSessionExpiration', () => {
        it('should return false when session is not expired', () => {
            setActive();
            expect(checkSessionExpiration()).toBe(false);
            expect(getState().sitestaySessionExpired).toBe(false);
        });

        it('should return true when session is expired', () => {
            setActive();
            jest.advanceTimersByTime(constants.SESSION_TIMEOUT + 1000);

            expect(checkSessionExpiration()).toBe(true);
            expect(getState().sitestaySessionExpired).toBe(true);
        });

        it('should clear interval when session expires', () => {
            const state = getState();
            state.intervalId = setInterval(() => {}, 1000);

            setActive();
            jest.advanceTimersByTime(constants.SESSION_TIMEOUT + 1000);

            checkSessionExpiration();

            expect(getState().intervalId).toBe(null);
        });
    });

    describe('sendSitestayEvent', () => {
        it('should send sitestay event with correct data', () => {
            const utagData = {
                page_id: '123',
                page_type: 'article',
                'cp.s_ecid': 'TEST01'
            };

            sendSitestayEvent(utagData);

            expect(window.utag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_name: 'sitestay',
                    event_action: 'timer',
                    event_label: '15',
                    page_id: '123',
                    page_type: 'article'
                }),
                null,
                [206]
            );
        });

        it('should preserve original utag data properties', () => {
            const utagData = {
                page_name: 'test-article',
                user_id: '456'
            };

            sendSitestayEvent(utagData);

            expect(window.utag.link).toHaveBeenCalledWith(
                expect.objectContaining({
                    page_name: 'test-article',
                    user_id: '456'
                }),
                null,
                [206]
            );
        });

        it('should handle missing window gracefully', () => {
            delete global.window;
            expect(() => sendSitestayEvent({})).not.toThrow();
        });

        it('should handle missing window.utag gracefully', () => {
            global.window = {};
            expect(() => sendSitestayEvent({})).not.toThrow();
        });
    });

    describe('Integration scenarios', () => {
        it('should track engagement on article page for target group user', () => {
            utag.data = {
                page_type: 'article',
                'cp.s_ecid': 'USER12345601'
            };

            setActive();
            const state = getState();

            expect(state.isActive).toBe(true);
            expect(isArticlePage(utag.data)).toBe(true);
            expect(isInTargetGroup(utag.data)).toBe(true);
        });

        it('should not track on non-article pages', () => {
            utag.data = {
                page_type: 'home',
                'cp.s_ecid': 'USER12345601'
            };

            expect(isArticlePage(utag.data)).toBe(false);
        });

        it('should not track for non-target group users', () => {
            utag.data = {
                page_type: 'article',
                'cp.s_ecid': 'USER12345699'
            };

            expect(isInTargetGroup(utag.data)).toBe(false);
        });

        it('should track video watching even when inactive', () => {
            utag.data = {
                page_type: 'article',
                'cp.s_ecid': 'USER12345601',
                event_name: 'video',
                event_data: {
                    media_is_muted: 'false'
                }
            };

            setActive();
            jest.advanceTimersByTime(constants.ACTIVITY_TIMEOUT);

            expect(getState().isActive).toBe(false);
            expect(isWatchingVideo(utag.data)).toBe(true);
        });

        it('should stop tracking after session expires', () => {
            setActive();
            jest.advanceTimersByTime(constants.SESSION_TIMEOUT + 1000);

            checkSessionExpiration();

            expect(getState().sitestaySessionExpired).toBe(true);
        });

        it('should handle all target group digits correctly', () => {
            const targetDigits = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

            targetDigits.forEach((digit) => {
                const utagData = {
                    'cp.s_ecid': `USER123456${digit}`
                };
                expect(isInTargetGroup(utagData)).toBe(true);
            });
        });
    });
});
