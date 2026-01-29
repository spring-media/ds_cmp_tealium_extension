/**
 * Regwall Action Tracking Extension
 *
 * This extension tracks registration wall actions by setting regwall_action
 * based on event_name and event_action combinations.
 *
 * Scope: Before Load Rules
 */

/* global utag */

/**
 * Check if the event is a registration or login event
 * @param {string} eventName - The event name to check
 * @returns {boolean} True if event is 'anmelden' or 'register'
 */
const isRegwallEvent = (eventName) => {
    if (!eventName || typeof eventName !== 'string') {
        return false;
    }
    return eventName === 'anmelden' || eventName === 'register';
};

/**
 * Determine the regwall action based on event_name and event_action
 * @param {string} eventName - The event name (anmelden or register)
 * @param {string} eventAction - The event action
 * @returns {string|null} The regwall action or null if no action should be set
 */
const determineRegwallAction = (eventName, eventAction) => {
    if (!eventName || typeof eventName !== 'string') {
        return null;
    }

    if (!eventAction || typeof eventAction !== 'string') {
        return null;
    }

    // Check if it's a registration form show event
    if (eventAction === 'SHOW REGISTRATION FORM') {
        return eventName + 'show';
    }

    // Check if it's a click event (not login form show)
    if (eventAction !== 'SHOW LOGIN FORM') {
        return eventName + 'click';
    }

    return null;
};

/**
 * Set the regwall action in utag.data
 * @param {string} regwallAction - The regwall action to set
 */
const setRegwallAction = (regwallAction) => {
    if (typeof utag === 'undefined' || !utag.data) {
        return;
    }

    if (regwallAction) {
        utag.data.regwall_action = regwallAction;
    }
};

/**
 * Main initialization function for regwall action tracking
 */
const initRegwallActionTracking = () => {
    if (typeof utag === 'undefined' || !utag.data) {
        return {
            processed: false,
            reason: 'utag not available'
        };
    }

    const eventName = utag.data.event_name;
    const eventAction = utag.data.event_action;

    // Check if this is a regwall event
    if (!isRegwallEvent(eventName)) {
        return {
            processed: false,
            reason: 'not a regwall event'
        };
    }

    // Determine and set the regwall action
    const regwallAction = determineRegwallAction(eventName, eventAction);

    if (regwallAction) {
        setRegwallAction(regwallAction);
        return {
            processed: true,
            regwallAction: regwallAction
        };
    }

    return {
        processed: false,
        reason: 'no regwall action determined'
    };
};

// Execute in browser context
if (typeof window !== 'undefined' && typeof utag !== 'undefined') {
    initRegwallActionTracking();
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        isRegwallEvent,
        determineRegwallAction,
        setRegwallAction,
        initRegwallActionTracking
    };
}
