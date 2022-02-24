const cmpInteractionTracking = require('../extensions/cmp_interaction_tracking');
const browserMocks = require('../tests/mocks/browserMocks');

const TEALIUM_PROFILES = [
    {profileName: 'abo-autobild.de', tagId: 23},
    {profileName: 'ac-autobild', tagId: 10},
    {profileName: 'ac-computerbild', tagId: 9},
    {profileName: 'asmb-metal-hammer.de', tagId: 22},
    {profileName: 'asmb-musikexpress.de', tagId: 14},
    {profileName: 'asmb-rollingstone.de', tagId: 16},
    {profileName: 'bild-bild.de', tagId: 12},
    {profileName: 'bild-fitbook.de', tagId: 40},
    {profileName: 'bild-myhomebook.de', tagId: 37},
    {profileName: 'bild-sportbild.de', tagId: 16},
    {profileName: 'bild-stylebook.de', tagId: 30},
    {profileName: 'bild-techbook.de', tagId: 82},
    {profileName: 'bild-travelbook.de', tagId: 42},
    {profileName: 'bild-offer', tagId: 24},
    {profileName: 'bild', tagId: 386},
    {profileName: 'bz-bz-berlin.de', tagId: 9},
    {profileName: 'cbo-computerbild.de', tagId: 25},
    {profileName: 'shop.bild', tagId: 181},
    {profileName: 'welt', tagId: 233},
    {profileName: 'welt-shop.welt.de', tagId: 28}
];

const ABTestingProperties = {
    msgDescription: 'any-description',
    messageId: 'any-id',
    bucket: 'any-bucket'
};

// Utility function for conveniently setting AP-testing properties
function setABTestingProperties() {
    cmpInteractionTracking.setABTestingProperties(ABTestingProperties);
}

function createWindowMock() {
    return {
        localStorage: browserMocks.localStorageMock,
        addEventListener: jest.fn(),
        _sp_: {
            addEventListener: jest.fn(),
            config: 'any-config'
        },
        __tcfapi: jest.fn(),
        __utag_cmp_event_tracking: null,
        _sp_queue: null,
        utag: {
            link: jest.fn(),
            view: jest.fn(),
            data: {},
            loader: {
                SC: jest.fn()
            }
        }
    };
}

describe('CMP Interaction Tracking', () => {

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('init()', () => {
        it('should execute extension when global Source Point API (window._sp_) is available', () => {
            jest.spyOn(cmpInteractionTracking, 'run').mockImplementation();

            cmpInteractionTracking.init();

            expect(cmpInteractionTracking.run).toBeCalledTimes(1);
        });

        it('should execute extension only once', () => {
            jest.spyOn(cmpInteractionTracking, 'run').mockImplementation();

            cmpInteractionTracking.init();
            cmpInteractionTracking.init();

            expect(cmpInteractionTracking.run).toBeCalledTimes(1);
        });
    });

    describe('run()', () => {
        it('should call the major functions of this unit', () => {
            window.utag.data.ut = {
                profile: 'welt'
            };

            jest.spyOn(cmpInteractionTracking, 'configSourcepoint').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'registerEventHandler').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'initABTestingProperties').mockImplementation();

            cmpInteractionTracking.run();

            expect(cmpInteractionTracking.configSourcepoint).toBeCalledTimes(1);
            expect(cmpInteractionTracking.registerEventHandler).toBeCalledTimes(1);
            expect(cmpInteractionTracking.initABTestingProperties).toBeCalledTimes(1);
        });
    });

    describe('getAdobeTagId()', () => {
        it.each(TEALIUM_PROFILES)('should return the Adobe TagID ($tagId) for the current Tealium Profile ($profileName)',
            (
                {
                    profileName,
                    tagId
                }
            ) => {

                const result = cmpInteractionTracking.getAdobeTagId(profileName);

                expect(result).toBe(tagId);
            });

        it('should throw an error when there is no Adobe TagID of the current Tealium profile', function () {
            expect(() => {
                cmpInteractionTracking.getAdobeTagId('non-existing-profile');
            }).toThrow();
        });
    });

    describe('configSourcepoint', () => {
        it('should set the Sourcepoint configuration object to our needs', function () {
            window._sp_.config = {};

            cmpInteractionTracking.configSourcepoint();

            expect(window._sp_.config.events).toEqual({});
        });
    });

    describe('registerEventHandler()', () => {
        it('should add all four event handler to the source point event queue', function () {
            cmpInteractionTracking.registerEventHandler();

            expect(window._sp_queue).toEqual([
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
            ]);
        });

        it('should register all needed event listener', () => {
            cmpInteractionTracking.registerEventHandler();
            window._sp_queue.forEach(handler => {
                handler();
            });

            expect(window._sp_.addEventListener).toBeCalledTimes(3);
            expect(window.__tcfapi).toBeCalledTimes(1);
            expect(window._sp_.addEventListener).toHaveBeenCalledWith('onMessageReceiveData', cmpInteractionTracking.onMessageReceiveData);
            expect(window._sp_.addEventListener).toHaveBeenCalledWith('onMessageChoiceSelect', cmpInteractionTracking.onMessageChoiceSelect);
            expect(window._sp_.addEventListener).toHaveBeenCalledWith('onPrivacyManagerAction', cmpInteractionTracking.onPrivacyManagerAction);
            expect(window.__tcfapi).toHaveBeenCalledWith('addEventListener', 2, cmpInteractionTracking.onCmpuishown);
            expect(window.addEventListener).toHaveBeenCalledWith('message', cmpInteractionTracking.onMessage, false);
        });
    });

    describe('initABTestingProperties', () => {
        it('should set AB-Testing properties when provided through global object', () => {
            jest.spyOn(cmpInteractionTracking, 'setABTestingProperties').mockImplementation();
            window.__cmp_interaction_data = {
                onMessageReceiveData: ABTestingProperties
            };
            cmpInteractionTracking.initABTestingProperties();
            expect(cmpInteractionTracking.setABTestingProperties).toHaveBeenCalledWith(ABTestingProperties);
        });

        it('should NOT set AB-Testing properties when they are NOT provided through global object', () => {
            jest.spyOn(cmpInteractionTracking, 'setABTestingProperties').mockImplementation();
            cmpInteractionTracking.initABTestingProperties();
            expect(cmpInteractionTracking.setABTestingProperties).not.toHaveBeenCalled();
        });
    });

    describe('getABTestingProperties', () => {
        it('should return a string with concatenated testing properties', function () {
            setABTestingProperties();
            const expectedResult = ABTestingProperties.messageId + ' ' + ABTestingProperties.msgDescription + ' ' + ABTestingProperties.bucket;
            const result = cmpInteractionTracking.getABTestingProperties();
            expect(result).toBe(expectedResult);
        });

        it('should return null when there are no testing properties', function () {
            cmpInteractionTracking.setABTestingProperties({});
            const result = cmpInteractionTracking.getABTestingProperties();
            expect(result).toBe(null);
        });
    });

    describe('onMessageReceiveData()', () => {
        it('should store received AP-Testing properties', () => {
            jest.spyOn(cmpInteractionTracking, 'setABTestingProperties').mockImplementation();

            const anyTestingProperties = 'any-properties';

            cmpInteractionTracking.onMessageReceiveData(anyTestingProperties);

            expect(cmpInteractionTracking.setABTestingProperties).toHaveBeenLastCalledWith(anyTestingProperties);
        });
    });

    describe('isAfterCMP', () =>{
        it('should return true if utag_main_cmp_after cookie is set to true', function () {
            window.utag.data['cp.utag_main_cmp_after'] = 'true';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(true);
        });

        it('should return false if utag_main_cmp_after cookie is NOT set to true', function () {
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });

        it('should return true if user consented any vendor', function () {
            window.utag.data.consentedVendors = 'any-vendors';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(true);
        });

        it('should return false if list of consented vendors does NOT exists', function () {
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });

        it('should return false if list of consented vendors equals default vendor', function () {
            window.utag.data.consentedVendors = 'adobe_cmp,';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });
    });

    describe('hasUserDeclinedConsent()', () => {
        it('should be true if user has declined Adobe tracking', function () {
            jest.spyOn(cmpInteractionTracking, 'isAfterCMP').mockReturnValue(true);
            window.utag.data.consentedVendors = 'any-vendor';
            const result = cmpInteractionTracking.hasUserDeclinedConsent();
            expect(result).toBe(true);
        });

        it('should be false if user consented to Adobe Analytics tracking', function () {
            window.utag.data.consentedVendors = 'any-vendor,adobe_analytics';
            let result = cmpInteractionTracking.hasUserDeclinedConsent();
            expect(result).toBe(false);
        });
    });

    describe('sendLinkEvent()', () => {
        let hasUserDeclinedConsentMock;

        beforeEach(() => {
            hasUserDeclinedConsentMock = jest.spyOn(cmpInteractionTracking, 'hasUserDeclinedConsent').mockImplementation();
        });

        it('should call sendLinkEvent() function with correct arguments if user has not already declined consent', () => {
            const anyLabel = 'any-label';
            setABTestingProperties();
            hasUserDeclinedConsentMock.mockReturnValue(false);
            cmpInteractionTracking.sendLinkEvent(anyLabel);
            expect(window.utag.link).toHaveBeenLastCalledWith(
                {
                    'event_action': 'click',
                    'event_data': ABTestingProperties.messageId + ' ' + ABTestingProperties.msgDescription + ' ' + ABTestingProperties.bucket,
                    'event_label': 'any-label',
                    'event_name': 'cmp_interactions'
                }
            );
        });

        it('should NOT call sendLinkEvent() function if user has declined consent', () => {
            const anyLabel = 'any-label';
            hasUserDeclinedConsentMock.mockReturnValue(true);
            cmpInteractionTracking.sendLinkEvent(anyLabel);
            expect(window.utag.link).not.toHaveBeenCalled();
        });
    });

    describe('onUserConsent()', () => {
        it('should call the scroll-depth feature of the doPlugins extension', function () {
            window.cmp = {
                _scrollDepthObj: {
                    setScrollDepthProperties: jest.fn()
                }
            };
            cmpInteractionTracking.onUserConsent();
            expect(window.cmp._scrollDepthObj.setScrollDepthProperties).toHaveBeenCalled();
        });
    });

    describe('onMessageChoiceSelect(id, eventType)', () => {
        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'onUserConsent').mockImplementation();
        });

        it('should set correct utag.data properties when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-id', 11);
            expect(window.utag.data).toEqual({
                'cmp_events': 'cm_accept_all',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent with correct argument when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 11);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('cm_accept_all');
        });

        it('should set correct utag.data properties when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-id', 12);
            expect(window.utag.data).toEqual({
                'cmp_events': 'cm_show_privacy_manager'
            });
        });

        it('should call sendLinkEvent with correct argument when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 12);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('cm_show_privacy_manager');
        });

        it('should set correct utag.data properties when user declines consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-id', 13);
            expect(window.utag.data).toEqual({
                'cmp_events': 'cm_reject_all',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent with correct argument when user declines consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 13);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('cm_reject_all');
        });

        it('should NOT call sendLinkEvent when called with wrong event type', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 999);
            expect(cmpInteractionTracking.sendLinkEvent).not.toHaveBeenCalled();
        });

        it('should set utag_main_cmp_after cookie to true when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 11);
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBe(true);
        });

        it('should set utag_main_cmp_after cookie to true when user declines consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 13);
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBe(true);
        });

        it('should NOT set utag_main_cmp_after cookie when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('test', 12);
            expect(window.utag.loader.SC).not.toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBeUndefined();
        });

        it('should call onUserConsent() when user has given consent', function () {
            cmpInteractionTracking.onMessageChoiceSelect('any-id', 11);
            expect(cmpInteractionTracking.onUserConsent).toHaveBeenCalled();
        });

        it('should not call onUserConsent() when user has NOT given consent', function () {
            cmpInteractionTracking.onMessageChoiceSelect('any-id', 12);
            expect(cmpInteractionTracking.onUserConsent).not.toHaveBeenCalled();
        });
    });


    describe('onPrivacyManagerAction(eventType)', () => {
        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
        });

        it('should set correct utag.data properties when user saves privacy settings', () => {
            cmpInteractionTracking.onPrivacyManagerAction('SAVE_AND_EXIT');

            expect(window.utag.data).toEqual({
                'cmp_events': 'pm_save_and_exit',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent() with correct event label as argument when user saves privacy settings', () => {
            cmpInteractionTracking.onPrivacyManagerAction('SAVE_AND_EXIT');
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('pm_save_and_exit');
        });

        it('should set correct utag.data properties when user gives consent', () => {
            cmpInteractionTracking.onPrivacyManagerAction('ACCEPT_ALL');
            expect(window.utag.data).toEqual({
                'cmp_events': 'pm_accept_all',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent() with correct event label as argument when user gives consent', () => {
            cmpInteractionTracking.onPrivacyManagerAction('ACCEPT_ALL');
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('pm_accept_all');
        });

        it('should set utag.data properties when called with an all purposeConsent', () => {
            cmpInteractionTracking.onPrivacyManagerAction({purposeConsent: 'all'});
            expect(window.utag.data).toEqual({
                'cmp_events': 'pm_accept_all',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent() with correct event label as argument when called with an all purposeConsent', () => {
            cmpInteractionTracking.onPrivacyManagerAction({purposeConsent: 'all'});
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('pm_accept_all');
        });

        it('should set utag.data properties when called with a purposeConsent other from all', () => {
            cmpInteractionTracking.onPrivacyManagerAction({purposeConsent: 'any-purpose-consent'});
            expect(window.utag.data).toEqual({
                'cmp_events': 'pm_save_and_exit',
                'cp.utag_main_cmp_after': true
            });
        });

        it('should call sendLinkEvent() with correct event label as argument when called with a purposeConsent other from all', () => {
            cmpInteractionTracking.onPrivacyManagerAction({purposeConsent: 'any-purpose-consent'});
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('pm_save_and_exit');
        });

        it('should NOT call sendLinkEvent() when called with wrong eventType', () => {
            cmpInteractionTracking.onPrivacyManagerAction('any-invalid-type');
            expect(cmpInteractionTracking.sendLinkEvent).not.toHaveBeenCalled();
        });

        it('should set utag_main_cmp_after cookie to true', () => {
            cmpInteractionTracking.onPrivacyManagerAction('SAVE_AND_EXIT');
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBe(true);
        });
    });

    describe('sendFirstPageViewEvent()', () => {
        const anyAdobeTagID = 'any-tag-id';

        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'getAdobeTagId').mockImplementation().mockReturnValue(anyAdobeTagID);
        });

        it('should get the tag ID of the first-page-view tag if user has NOT already given/declined consent', function () {
            cmpInteractionTracking.sendFirstPageViewEvent();
            expect(cmpInteractionTracking.getAdobeTagId).toBeCalledTimes(1);
        });

        it('should send first-page-view tracking event if user has NOT already given/declined consent', function () {
            window.utag.data = {
                anyDataLayerProperty: 'any-property'
            };
            cmpInteractionTracking.sendFirstPageViewEvent();
            expect(window.utag.view).toHaveBeenNthCalledWith(1,
                window.utag.data,
                null,
                [anyAdobeTagID]);
        });

        it('should NOT get the tag ID of the first-page-view tag if user has already given/declined consent', function () {
            jest.spyOn(cmpInteractionTracking, 'isAfterCMP').mockReturnValue(true);
            cmpInteractionTracking.sendFirstPageViewEvent();
            expect(cmpInteractionTracking.getAdobeTagId).not.toHaveBeenCalled();
        });

        it('should NOT send first-page-view tracking event if user has already given/declined consent', function () {
            jest.spyOn(cmpInteractionTracking, 'isAfterCMP').mockReturnValue(true);
            cmpInteractionTracking.sendFirstPageViewEvent();
            expect(window.utag.view).not.toHaveBeenCalled();
        });
    });

    describe('onCmpuishown()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.spyOn(cmpInteractionTracking, 'sendFirstPageViewEvent').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
        });

        afterEach(() => {
            jest.useRealTimers();
        });


        it('should set correct utag.data properties', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'cmpuishown'});
            expect(window.utag.data).toEqual({
                'cmp_events': 'cm_layer_shown'
            });
        });

        it('should call sendLinkEvent function', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'cmpuishown'});
            jest.runAllTimers();
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenCalledWith('cm_layer_shown');
        });

        it('should NOT set utag.data properties when called with invalid event status', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'any-invalid-status'});
            expect(window.utag.data).toEqual({});
        });

        it('should NOT call sendLinkEvent function when called with invalid event status', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'any-invalid-status'});
            jest.runAllTimers();
            expect(cmpInteractionTracking.sendLinkEvent).not.toHaveBeenCalled();
        });
    });

    describe('onMessage', () => {
        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
        });

        it('should call sendLinkEvent function with correct parameters', function () {
            const label = 'any-label';
            cmpInteractionTracking.onMessage({
                data: {
                    cmpLayerMessage: true,
                    payload: label
                },
            });
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenCalledWith(label);
        });
    });

});
