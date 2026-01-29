/**
 * Sitestay Tracking Extension
 *
 * This extension tracks user engagement on article pages by sending periodic events
 * when the user is active. It monitors user activity, tab visibility, and session timeouts.
 *
 * Scope: Before Load Rules
 */

/* global utag, document, window */

// State management
let state = {
    isActive: true,
    timeout: null,
    isTabActive: true,
    intervalId: null,
    eventListenersAttached: false,
    lastActiveTimestamp: Date.now(),
    sitestaySessionExpired: false
};

// Constants
const ACTIVITY_TIMEOUT = 30000; // 30 seconds
const SESSION_TIMEOUT = 1800000; // 30 minutes
const TRIGGER_INTERVAL = 15000; // 15 seconds
const GROUP_MID = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

/**
 * Check if the page is an article
 * @param {Object} utagData - The utag.data object
 * @returns {boolean} True if page type is article
 */
const isArticlePage = (utagData) => {
    if (!utagData) {
        return false;
    }
    return utagData.page_type === 'article';
};

/**
 * Check if the user is in the target group
 * @param {Object} utagData - The utag.data object
 * @returns {boolean} True if user's ECID ends with target group digits
 */
const isInTargetGroup = (utagData) => {
    if (!utagData || typeof utagData['cp.s_ecid'] === 'undefined') {
        return false;
    }

    const ecid = utagData['cp.s_ecid'];
    if (typeof ecid !== 'string' || ecid.length < 2) {
        return false;
    }

    const lastTwoDigits = ecid.slice(-2);
    return GROUP_MID.includes(lastTwoDigits);
};

/**
 * Check if the user is watching a video
 * @param {Object} utagData - The utag.data object
 * @returns {boolean} True if user is watching an unmuted video
 */
const isWatchingVideo = (utagData) => {
    if (!utagData || !utagData.event_name || utagData.event_name !== 'video') {
        return false;
    }

    if (!utagData.event_data || utagData.event_data.media_is_muted !== 'false') {
        return false;
    }

    return true;
};

/**
 * Set user as active and reset activity timeout
 */
const setActive = () => {
    state.isActive = true;
    state.lastActiveTimestamp = Date.now();

    if (state.timeout) {
        clearTimeout(state.timeout);
    }

    state.timeout = setTimeout(() => {
        state.isActive = false;
    }, ACTIVITY_TIMEOUT);
};

/**
 * Check if the session has expired
 * @returns {boolean} True if session has expired
 */
const checkSessionExpiration = () => {
    const timeSinceLastActive = Date.now() - state.lastActiveTimestamp;

    if (timeSinceLastActive > SESSION_TIMEOUT) {
        state.sitestaySessionExpired = true;

        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }

        return true;
    }

    return false;
};

/**
 * Handle visibility change events
 */
const handleVisibilityChange = () => {
    if (typeof document === 'undefined') {
        return;
    }

    state.isTabActive = !document.hidden;
    checkSessionExpiration();
};

/**
 * Send sitestay tracking event
 * @param {Object} utagData - The utag.data object
 */
const sendSitestayEvent = (utagData) => {
    if (typeof window === 'undefined' || typeof window.utag === 'undefined') {
        return;
    }

    const sitestayData = { ...utagData };
    sitestayData.event_name = 'sitestay';
    sitestayData.event_action = 'timer';
    sitestayData.event_label = '15';

    window.utag.link(sitestayData, null, [206]);
};

/**
 * Trigger action every interval if conditions are met
 */
const triggerAction = () => {
    if (typeof utag === 'undefined' || !utag.data) {
        return;
    }

    // Check if session is expired
    if (checkSessionExpiration()) {
        return;
    }

    const isArticle = isArticlePage(utag.data);
    const isInGroup = isInTargetGroup(utag.data);
    const isWatching = isWatchingVideo(utag.data);

    // Send event if all conditions are met
    if (isInGroup && isArticle && (state.isActive || isWatching) && state.isTabActive) {
        sendSitestayEvent(utag.data);
    }
};

/**
 * Attach event listeners for user activity tracking
 */
const attachEventListeners = () => {
    if (typeof document === 'undefined' || state.eventListenersAttached) {
        return;
    }

    // Desktop event listeners
    document.addEventListener('mousemove', setActive);
    document.addEventListener('keydown', setActive);

    // Mobile event listeners
    document.addEventListener('touchstart', setActive);
    document.addEventListener('touchmove', setActive);
    document.addEventListener('touchend', setActive);

    // Visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    state.eventListenersAttached = true;
};

/**
 * Set up event listeners and start interval
 */
const setupListenersAndInterval = () => {
    attachEventListeners();

    // Clear any existing interval before setting a new one
    if (state.intervalId) {
        clearInterval(state.intervalId);
    }

    // Set interval to trigger action every 15 seconds
    state.intervalId = setInterval(triggerAction, TRIGGER_INTERVAL);
};

/**
 * Stop sitestay tracking and clean up
 */
const stopSitestayTracking = () => {
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }

    if (state.timeout) {
        clearTimeout(state.timeout);
        state.timeout = null;
    }
};

/**
 * Initialize sitestay tracking
 */
const initSitestayTracking = () => {
    if (typeof document === 'undefined') {
        return {
            initialized: false,
            reason: 'document not available'
        };
    }

    // Initialize tab active state
    state.isTabActive = !document.hidden;

    // Set user as initially active
    setActive();

    // Set up listeners and interval
    setupListenersAndInterval();

    return {
        initialized: true,
        state: {
            isActive: state.isActive,
            isTabActive: state.isTabActive,
            eventListenersAttached: state.eventListenersAttached
        }
    };
};

// Execute in browser context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initSitestayTracking();
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        isArticlePage,
        isInTargetGroup,
        isWatchingVideo,
        setActive,
        checkSessionExpiration,
        handleVisibilityChange,
        sendSitestayEvent,
        triggerAction,
        attachEventListeners,
        setupListenersAndInterval,
        stopSitestayTracking,
        initSitestayTracking,
        // Expose state and constants for testing
        getState: () => state,
        resetState: () => {
            state = {
                isActive: true,
                timeout: null,
                isTabActive: true,
                intervalId: null,
                eventListenersAttached: false,
                lastActiveTimestamp: Date.now(),
                sitestaySessionExpired: false
            };
        },
        constants: {
            ACTIVITY_TIMEOUT,
            SESSION_TIMEOUT,
            TRIGGER_INTERVAL,
            GROUP_MID
        }
    };
}
