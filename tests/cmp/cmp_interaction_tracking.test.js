const cmpInteractionTracking = require('../../extensions/cmp/cmp_interaction_tracking');
const browserMocks = require('../mocks/browserMocks');

const TEALIUM_PROFILES = [
    {profileName: 'abo-autobild.de', tagId: 23},
    {profileName: 'ac-autobild', tagId: 1},
    {profileName: 'ac-computerbild', tagId: 3},
    {profileName: 'asmb-metal-hammer.de', tagId: 22},
    {profileName: 'asmb-musikexpress.de', tagId: 14},
    {profileName: 'asmb-rollingstone.de', tagId: 16},
    {profileName: 'bild-bild.de', tagId: 5},
    {profileName: 'bild-fitbook.de', tagId: 30},
    {profileName: 'bild-myhomebook.de', tagId: 30},
    {profileName: 'bild-petbook.de', tagId: 78},
    {profileName: 'bild-stylebook.de', tagId: 19},
    {profileName: 'bild-techbook.de', tagId: 68},
    {profileName: 'bild-travelbook.de', tagId: 34},
    {profileName: 'bild-offer', tagId: 24},
    {profileName: 'bild', tagId: 386},
    {profileName: 'bz-bz-berlin.de', tagId: 6},
    {profileName: 'cbo-computerbild.de', tagId: 25},
    {profileName: 'shop.bild', tagId: 181},
    {profileName: 'spring-premium', tagId: 135},
    {profileName: 'welt', tagId: 155},
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
            window.utag.data['cp.cmp_cv_list'] = 'any-vendors';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(true);
        });

        it('should return false if list of consented vendors does NOT exists', function () {
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });

        it('should return false if list of consented vendors equals default vendor', function () {
            window.utag.data['cp.cmp_cv_list'] = 'adobe_cmp,';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });

        it('should return false if utag_main_cmp_after cookie is set to True and Domain is sportbild.bild.de', function () {
            window.utag.data['cp.utag_main_cmp_after'] = 'true';
            window.utag.data['dom.domain'] = 'sportbild.bild.de';
            const result = cmpInteractionTracking.isAfterCMP();
            expect(result).toBe(false);
        });
    });

    describe('hasUserAlreadyConsentGranted()', () => {
        it('should be false if user consented to Adobe Analytics tracking', function () {
            window.utag.data['cp.cmp_cv_list'] = 'any-vendor,adobe_analytics';
            let result = cmpInteractionTracking.hasUserAlreadyConsentGranted();
            expect(result).toBe(true);
        });
    });

    describe('sendLinkEvent()', () => {
        let hasUserAlreadyConsentGrantedMock;
        let notPurUserMock;

        beforeEach(() => {
            hasUserAlreadyConsentGrantedMock = jest.spyOn(cmpInteractionTracking, 'hasUserAlreadyConsentGranted').mockImplementation();
            notPurUserMock = jest.spyOn(cmpInteractionTracking, 'notPurUser').mockImplementation().mockReturnValue(true);
        });

        it('should call sendLinkEvent() function with correct arguments if user has not already declined consent', () => {
            const anyLabel = 'any-label';
            setABTestingProperties();
            hasUserAlreadyConsentGrantedMock.mockReturnValue(false);
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
            hasUserAlreadyConsentGrantedMock.mockReturnValue(true);
            cmpInteractionTracking.sendLinkEvent(anyLabel);
            expect(window.utag.link).not.toHaveBeenCalled();
        });

        it('should NOT call sendLinkEvent() function if user is PUR subscriber', () => {
            const anyLabel = 'any-label';
            hasUserAlreadyConsentGrantedMock.mockReturnValue(true);
            notPurUserMock.mockReturnValue(false);
            cmpInteractionTracking.sendLinkEvent(anyLabel);
            expect(window.utag.link).not.toHaveBeenCalled();
        });
    });

    describe('onUserConsent()', () => {
        it('should call the scroll-depth feature of the doPlugins extension', function () {
            window.cmp = {
                _scrollDepthObj: {
                    setScrollDepthProperties: jest.fn()
                },
                _campaignObj: {
                    setCampaignVariables: jest.fn()
                }
            };
            cmpInteractionTracking.onUserConsent();
            expect(window.cmp._scrollDepthObj.setScrollDepthProperties).toHaveBeenCalled();
        });

        it('should call _campaignObj.setCampaignVariables() of the doPlugins extension', function () {
            window.cmp = {
                _scrollDepthObj: {
                    setScrollDepthProperties: jest.fn()
                },
                _campaignObj: {
                    setCampaignVariables: jest.fn()
                }
            };
            cmpInteractionTracking.onUserConsent();
            expect(window.cmp._campaignObj.setCampaignVariables).toHaveBeenCalledWith(window.cmp, true);
        });
    });

    describe('onMessageChoiceSelect(messageType, id, eventType)', () => {
        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'onUserConsent').mockImplementation();
        });

        it('should set correct utag.data properties when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType','any-id', 11);
            expect(window.utag.data).toEqual({
                'cmp_events': 'cm_accept_all',
                'cp.utag_main_cmp_after': 'true'
            });
        });

        it('should call sendLinkEvent with correct argument when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'test', 11);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('cm_accept_all');
        });

        it('should set correct utag.data properties when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'any-id', 12);
            expect(window.utag.data.cmp_events).toBe('cm_show_privacy_manager');
        });

        it('should call sendLinkEvent with correct argument when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'test', 12);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('cm_show_privacy_manager');
        });

        it('should NOT call sendLinkEvent when called with wrong event type', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'test', 999);
            expect(cmpInteractionTracking.sendLinkEvent).not.toHaveBeenCalled();
        });

        it('should set utag_main_cmp_after cookie to true when user gives consent', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'test', 11);
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBe('true');
        });

        it('should NOT set utag_main_cmp_after cookie when user opens privacy manager', () => {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'test', 12);
            expect(window.utag.loader.SC).not.toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBeUndefined();
        });

        it('should call onUserConsent() when user has given consent', function () {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'any-id', 11);
            expect(cmpInteractionTracking.onUserConsent).toHaveBeenCalled();
        });

        it('should not call onUserConsent() when user has NOT given consent', function () {
            cmpInteractionTracking.onMessageChoiceSelect('any-messageType', 'any-id', 12);
            expect(cmpInteractionTracking.onUserConsent).not.toHaveBeenCalled();
        });
    });

    describe('onPrivacyManagerAction(messageType, id, eventType)', () => {
        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'sendLinkEvent').mockImplementation();
            jest.spyOn(cmpInteractionTracking, 'onUserConsent').mockImplementation();
        });
    
        it('should set correct utag.data properties when user gives consent', () => {
            cmpInteractionTracking.onPrivacyManagerAction('any-messageType','any-id', 1);
            expect(window.utag.data).toEqual({
                'cmp_events': 'pm_accept_as_selected',
                'cp.utag_main_cmp_after': 'true'
            });
        });
    
        it('should call sendLinkEvent with correct argument when user gives consent', () => {
            cmpInteractionTracking.onPrivacyManagerAction('any-messageType', 'test', 1);
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenLastCalledWith('pm_accept_as_selected');
        });
    
        it('should NOT call sendLinkEvent when called with wrong event type', () => {
            cmpInteractionTracking.onPrivacyManagerAction('any-messageType', 'test', 999);
            expect(cmpInteractionTracking.sendLinkEvent).not.toHaveBeenCalled();
        });
    
        it('should set utag_main_cmp_after cookie to true when user gives consent', () => {
            cmpInteractionTracking.onPrivacyManagerAction('any-messageType', 'test', 1);
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', {'cmp_after': 'true'});
            expect(window.utag.data['cp.utag_main_cmp_after']).toBe('true');
        });
    
        it('should call onUserConsent() when user has given consent', function () {
            cmpInteractionTracking.onPrivacyManagerAction('any-messageType', 'any-id', 1);
            expect(cmpInteractionTracking.onUserConsent).toHaveBeenCalled();
        });
    
    });

    describe('sendFirstPageViewEvent()', () => {
        const anyAdobeTagID = 'any-tag-id';
        let notPurUserMock; 

        beforeEach(() => {
            jest.spyOn(cmpInteractionTracking, 'getAdobeTagId').mockImplementation().mockReturnValue(anyAdobeTagID);
            notPurUserMock = jest.spyOn(cmpInteractionTracking, 'notPurUser').mockImplementation().mockReturnValue(true);
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

        it('should NOT send first-page-view tracking event if user is PUR subscriber consent', function () {
            window.utag.data = {
                anyDataLayerProperty: 'any-property'
            };
            notPurUserMock.mockReturnValue(false);
            cmpInteractionTracking.sendFirstPageViewEvent();
            expect(window.utag.view).not.toHaveBeenNthCalledWith(1,
                window.utag.data,
                null,
                [anyAdobeTagID]);
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
            expect(window.utag.data).toMatchObject({
                'cmp_events': 'cm_layer_shown',
                'cmp_event_status': 'cmpuishown'
            });
        });

        it('should call sendLinkEvent function', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'cmpuishown'});
            jest.runAllTimers();
            expect(cmpInteractionTracking.sendLinkEvent).toHaveBeenCalledWith('cm_layer_shown');
        });

        it('should NOT set utag.data properties when called with invalid event status', () => {
            cmpInteractionTracking.onCmpuishown({eventStatus: 'any-invalid-status'});
            expect(window.utag.data).toEqual({
                'cmp_event_status': 'any-invalid-status'
            });
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
