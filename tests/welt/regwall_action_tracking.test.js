/**
 * Tests for regwall_action_tracking.js
 * Registration wall action tracking for WELT
 */

/* global utag */

const {
    isRegwallEvent,
    determineRegwallAction,
    setRegwallAction,
    initRegwallActionTracking
} = require('../../extensions/welt/regwall_action_tracking');

describe('Regwall Action Tracking', () => {
    let mockUtag;

    beforeEach(() => {
        // Mock utag.data
        mockUtag = {
            data: {}
        };
        global.utag = mockUtag;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.utag;
    });

    describe('isRegwallEvent', () => {
        it('should return true for "anmelden" event', () => {
            expect(isRegwallEvent('anmelden')).toBe(true);
        });

        it('should return true for "register" event', () => {
            expect(isRegwallEvent('register')).toBe(true);
        });

        it('should return false for other event names', () => {
            expect(isRegwallEvent('login')).toBe(false);
            expect(isRegwallEvent('click')).toBe(false);
            expect(isRegwallEvent('pageview')).toBe(false);
            expect(isRegwallEvent('')).toBe(false);
        });

        it('should handle invalid inputs', () => {
            expect(isRegwallEvent(null)).toBe(false);
            expect(isRegwallEvent(undefined)).toBe(false);
            expect(isRegwallEvent(123)).toBe(false);
            expect(isRegwallEvent({})).toBe(false);
        });
    });

    describe('determineRegwallAction', () => {
        it('should return "anmeldenshow" for anmelden + SHOW REGISTRATION FORM', () => {
            const result = determineRegwallAction('anmelden', 'SHOW REGISTRATION FORM');
            expect(result).toBe('anmeldenshow');
        });

        it('should return "registershow" for register + SHOW REGISTRATION FORM', () => {
            const result = determineRegwallAction('register', 'SHOW REGISTRATION FORM');
            expect(result).toBe('registershow');
        });

        it('should return "anmeldenclick" for anmelden + any action except SHOW LOGIN FORM', () => {
            expect(determineRegwallAction('anmelden', 'SUBMIT')).toBe('anmeldenclick');
            expect(determineRegwallAction('anmelden', 'CLICK')).toBe('anmeldenclick');
            expect(determineRegwallAction('anmelden', 'CANCEL')).toBe('anmeldenclick');
        });

        it('should return "registerclick" for register + any action except SHOW LOGIN FORM', () => {
            expect(determineRegwallAction('register', 'SUBMIT')).toBe('registerclick');
            expect(determineRegwallAction('register', 'CLICK')).toBe('registerclick');
            expect(determineRegwallAction('register', 'CANCEL')).toBe('registerclick');
        });

        it('should return null for SHOW LOGIN FORM action', () => {
            expect(determineRegwallAction('anmelden', 'SHOW LOGIN FORM')).toBe(null);
            expect(determineRegwallAction('register', 'SHOW LOGIN FORM')).toBe(null);
        });

        it('should handle invalid inputs', () => {
            expect(determineRegwallAction(null, 'SUBMIT')).toBe(null);
            expect(determineRegwallAction('anmelden', null)).toBe(null);
            expect(determineRegwallAction(undefined, 'SUBMIT')).toBe(null);
            expect(determineRegwallAction('anmelden', undefined)).toBe(null);
            expect(determineRegwallAction('', 'SUBMIT')).toBe(null);
            expect(determineRegwallAction('anmelden', '')).toBe(null);
        });
    });

    describe('setRegwallAction', () => {
        it('should set regwall_action in utag.data', () => {
            setRegwallAction('anmeldenshow');
            expect(utag.data.regwall_action).toBe('anmeldenshow');

            setRegwallAction('registerclick');
            expect(utag.data.regwall_action).toBe('registerclick');
        });

        it('should not set regwall_action when value is null or undefined', () => {
            setRegwallAction(null);
            expect(utag.data.regwall_action).toBeUndefined();

            setRegwallAction(undefined);
            expect(utag.data.regwall_action).toBeUndefined();
        });

        it('should handle missing utag gracefully', () => {
            delete global.utag;
            expect(() => setRegwallAction('anmeldenshow')).not.toThrow();

            global.utag = {};
            expect(() => setRegwallAction('anmeldenshow')).not.toThrow();

            global.utag = { data: null };
            expect(() => setRegwallAction('anmeldenshow')).not.toThrow();
        });
    });

    describe('initRegwallActionTracking', () => {
        it('should set regwall_action to "anmeldenshow" for anmelden + SHOW REGISTRATION FORM', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SHOW REGISTRATION FORM';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(true);
            expect(result.regwallAction).toBe('anmeldenshow');
            expect(utag.data.regwall_action).toBe('anmeldenshow');
        });

        it('should set regwall_action to "registershow" for register + SHOW REGISTRATION FORM', () => {
            utag.data.event_name = 'register';
            utag.data.event_action = 'SHOW REGISTRATION FORM';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(true);
            expect(result.regwallAction).toBe('registershow');
            expect(utag.data.regwall_action).toBe('registershow');
        });

        it('should set regwall_action to "anmeldenclick" for anmelden + SUBMIT', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SUBMIT';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(true);
            expect(result.regwallAction).toBe('anmeldenclick');
            expect(utag.data.regwall_action).toBe('anmeldenclick');
        });

        it('should set regwall_action to "registerclick" for register + CLICK', () => {
            utag.data.event_name = 'register';
            utag.data.event_action = 'CLICK';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(true);
            expect(result.regwallAction).toBe('registerclick');
            expect(utag.data.regwall_action).toBe('registerclick');
        });

        it('should not set regwall_action for SHOW LOGIN FORM', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SHOW LOGIN FORM';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(false);
            expect(result.reason).toBe('no regwall action determined');
            expect(utag.data.regwall_action).toBeUndefined();
        });

        it('should not process non-regwall events', () => {
            utag.data.event_name = 'pageview';
            utag.data.event_action = 'SUBMIT';

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(false);
            expect(result.reason).toBe('not a regwall event');
            expect(utag.data.regwall_action).toBeUndefined();
        });

        it('should preserve existing utag.data properties', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SUBMIT';
            utag.data.page_name = 'home';
            utag.data.user_id = '123';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBe('anmeldenclick');
            expect(utag.data.page_name).toBe('home');
            expect(utag.data.user_id).toBe('123');
        });

        it('should handle missing utag gracefully', () => {
            delete global.utag;

            const result = initRegwallActionTracking();

            expect(result.processed).toBe(false);
            expect(result.reason).toBe('utag not available');
        });
    });

    describe('Integration scenarios', () => {
        it('should handle anmelden registration form show event', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SHOW REGISTRATION FORM';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBe('anmeldenshow');
        });

        it('should handle register registration form show event', () => {
            utag.data.event_name = 'register';
            utag.data.event_action = 'SHOW REGISTRATION FORM';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBe('registershow');
        });

        it('should handle anmelden click events', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'BUTTON_CLICK';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBe('anmeldenclick');
        });

        it('should handle register submit events', () => {
            utag.data.event_name = 'register';
            utag.data.event_action = 'FORM_SUBMIT';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBe('registerclick');
        });

        it('should not set action for login form show', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SHOW LOGIN FORM';

            initRegwallActionTracking();

            expect(utag.data.regwall_action).toBeUndefined();
        });

        it('should handle multiple tracking calls', () => {
            utag.data.event_name = 'anmelden';
            utag.data.event_action = 'SHOW REGISTRATION FORM';

            initRegwallActionTracking();
            expect(utag.data.regwall_action).toBe('anmeldenshow');

            utag.data.event_action = 'SUBMIT';
            initRegwallActionTracking();
            expect(utag.data.regwall_action).toBe('anmeldenclick');
        });
    });
});
