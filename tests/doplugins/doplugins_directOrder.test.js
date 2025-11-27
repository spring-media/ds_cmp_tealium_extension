const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('directOrderObj', () => {
    let s;
    beforeEach(() => {

        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        s = {
            ...sObject
        };
        window.utag.loader.SC = jest.fn();
        jest.spyOn(s._utils, 'getDocType');
        jest.spyOn(s._directOrderObj, 'getTealiumProfile');
        jest.spyOn(s._directOrderObj, 'isPaywall');
        jest.spyOn(s._campaignObj, 'getAdobeCampaign');
        jest.spyOn(s._articleViewTypeObj, 'isFromArticleWithReco');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('saveToCookie()', function() {
        it('should store the adobe campaign value of article recommendations in utag_main cookie', function() {
            const anyCookieValue = 'any-otb';
            const anyCookieName = 'otb';
            let anyCookieObj = {};
            anyCookieObj[anyCookieName] = anyCookieValue + ';exp-session';

            s._directOrderObj.saveToCookie(anyCookieObj);
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'otb': 'any-otb;exp-session' });
        });
    });

    describe('deleteFromCookieOtb()', function() {
        it('should delete the adobe campaign value of article recommendations in utag_main cookie', function() {
            s._directOrderObj.deleteFromCookieOtb();
            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'otb': ';exp-session' });
        });
    });

    describe('isPaywall()', function() {
        it('should be set to false if no conditions are met', function() {
            expect(s._directOrderObj.isPaywall()).toBe(false);
        });

        it('should be set to true if first condition is met', function() {
            window.utag.data.event_name = 'offer-module';
            window.utag.data.event_action = 'load';
            window.utag.data.event_label = 'article';
            expect(s._directOrderObj.isPaywall()).toBe(true);
        });

        it('should be set to true if second condition is met', function() {
            window.utag.data.is_status_premium_visibility = 'false';
            window.utag.data.is_status_premium = 'true';
            expect(s._directOrderObj.isPaywall()).toBe(true);
        });

        it('should be set to true if thrid condition is met', function() {
            window.utag.data.user_statusValidAbo_String = 'false';
            window.utag.data.page_isPremium = 'true';
            expect(s._directOrderObj.isPaywall()).toBe(true);
        });
    });

    describe('setDirectOrderValues(s)', function() {
        let saveToCookieMock;
        let deleteFromCookieMockOtb;

        beforeEach(() => {
            saveToCookieMock = jest.spyOn(s._directOrderObj, 'saveToCookie').mockImplementation();
            deleteFromCookieMockOtb = jest.spyOn(s._directOrderObj, 'deleteFromCookieOtb').mockImplementation();
            // deleteFromCookieMockAco = jest.spyOn(s._directOrderObj, 'deleteFromCookieAco').mockImplementation();
        });

        it('should evaluate the document type by calling s._utils.getDocType()', function() {
            s._directOrderObj.setDirectOrderValues(s);
            expect(s._utils.getDocType).toHaveBeenCalled();
        });

        it('should NOT assign a value to eVar113,eVar235 on NON article pages', function() {
            s._utils.getDocType.mockReturnValue('any-type');
            s._articleViewTypeObj.isFromArticleWithReco.mockReturnValue('true');
            s._directOrderObj.isPaywall.mockReturnValue('true');
            s._campaignObj.getAdobeCampaign.mockReturnValue('cid=kooperation.article.outbrain.A_23');
            s._directOrderObj.setDirectOrderValues(s);
            expect(s.eVar113).toBeUndefined();
            expect(s.eVar235).toBeUndefined();
        });

        it('should assign adobe campaign value of data layer to eVar113 on plus article pages when paywall is shown', function() {
            s._utils.getDocType.mockReturnValue('article');
            s._directOrderObj.isPaywall.mockReturnValue('true');
            s._articleViewTypeObj.isFromArticleWithReco.mockReturnValue('true');
            s._campaignObj.getAdobeCampaign.mockReturnValue('cid=kooperation.article.outbrain.A_23');
            s._directOrderObj.setDirectOrderValues(s);
            expect(s.eVar113).toEqual('cid=kooperation.article.outbrain.A_23');
        });

        it('should store adobe campaign value in utag_main cookie on plus article pages when paywall is shown', function() {
            s._utils.getDocType.mockReturnValue('article');
            s._articleViewTypeObj.isFromArticleWithReco.mockReturnValue('true');
            s._directOrderObj.isPaywall.mockReturnValue('true');
            s._campaignObj.getAdobeCampaign.mockReturnValue('cid=kooperation.article.outbrain.A_23');
            s._directOrderObj.setDirectOrderValues(s);
            let cookieName = 'otb';
            let cookieValue = 'cid=kooperation.article.outbrain.A_23';
            let cookieObj = {};
            cookieObj[cookieName] = cookieValue + ';exp-session';
            expect(saveToCookieMock).toHaveBeenCalledWith(cookieObj);
        });

        it('should NOT store adobe campaign value in utag_main cookie on plus article pages when content of page is shown', function() {
            s._utils.getDocType.mockReturnValue('article');
            s._directOrderObj.isPaywall.mockReturnValue('false');
            s._campaignObj.getAdobeCampaign.mockReturnValue('cid=kooperation.article.outbrain.A_23');
            s._directOrderObj.setDirectOrderValues(s);
            expect(saveToCookieMock).not.toHaveBeenCalled();
        });

        it('should NOT store otb n utag_main cookie on NON article pages', function() {
            s._utils.getDocType.mockReturnValue('any-type');
            s._articleViewTypeObj.isFromArticleWithReco.mockReturnValue('true');
            s._directOrderObj.isPaywall.mockReturnValue('true');
            s._campaignObj.getAdobeCampaign.mockReturnValue('cid=kooperation.article.outbrain.A_23');
            s._directOrderObj.setDirectOrderValues(s);
            expect(saveToCookieMock).not.toHaveBeenCalled();
        });

        it('should delete otb in utag_main cookie if tealium profile is not spring-premium', function() {
            s._utils.getDocType.mockReturnValue('any-type');
            s._directOrderObj.getTealiumProfile.mockReturnValue('any-profile');
            s._directOrderObj.setDirectOrderValues(s);
            expect(deleteFromCookieMockOtb).toHaveBeenCalledWith();
            expect(s.eVar113).toBeUndefined();
        });
    });
});
