const sObject = require('../../extensions/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('articleViewType()', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('cleanUpReferrer', () => {
        it('should remove the wt_t parameter', function () {
            const anyBaseURL = 'https://www.any-domain.com/';
            const anyWTParam = '&wt_t=any-value';
            const result = s._articleViewTypeObj.cleanUpReferrer(anyBaseURL + anyWTParam);
            expect(result).toBe(anyBaseURL);
        });

        it('should return the untouched referrer if there is no wt_t parameter', function () {
            const anyURL = 'https://www.any-domain.com/any-path?any-query=any-value';
            const result = s._articleViewTypeObj.cleanUpReferrer(anyURL);
            expect(result).toBe(anyURL);
        });
    });

    describe('isFromSearch()', () => {
        it('should return TRUE if referrer is a search engine', function () {
            const searchDomains = ['google.', 'bing.com', 'ecosia.org', 'duckduckgo.com', 'amp-welt-de.cdn.ampproject.org', 'qwant.com', 'suche.t-online.de', '.yandex.', 'yahoo.com', 'googleapis.com', 'nortonsafe.search.ask.com', 'wikipedia.org', 'googleadservices.com', 'search.myway.com', 'lycos.de'];

            searchDomains.forEach((domain) => {
                const result = s._articleViewTypeObj.isFromSearch(domain);
                expect(result).toBe(true);
            });
        });

        it('should return FALSE if referrer is NOT a search engine', function () {
            const referringDomain = 'any-domain.com';
            const result = s._articleViewTypeObj.isFromSearch(referringDomain);
            expect(result).toBe(false);
        });
    });

    describe('isFromSocial()', () => {
        it('should return TRUE if referrer is a search engine', function () {
            const socialDomains = ['facebook.com', 'xing.com', 'instagram.com', 'youtube.com', 't.co', 'www.linkedin.com', 'away.vk.com', 'www.pinterest.de', 'linkedin.android', 'ok.ru', 'mobile.ok.ru', 'www.yammer.com', 'twitter.com', 'www.netvibes.com', 'pinterest.com', 'wordpress.com', 'blogspot.com', 'lnkd.in', 'xing.android', 'vk.com', 'com.twitter.android', 'm.ok.ru', 'welt.de/instagram', 'linkin.bio'];

            socialDomains.forEach((item) => {
                const referrer = `https://${item}/any-path`;
                const result = s._articleViewTypeObj.isFromSocial(referrer);
                expect(result).toBe(true);
            });
        });

        it('should return FALSE if referrer is NOT a search engine', function () {
            const referrer = 'https://any-domain/any-path';
            const result = s._articleViewTypeObj.isFromSocial(referrer);
            expect(result).toBe(false);
        });
    });

    describe('isPaidMarketing()', () => {
        it('should return TRUE if trackingChannel is paid', function () {
            const trackingChannel = ['email.', 'onsite.', 'inapp.', 'push.', 'sea.', 'affiliate.', 'social_paid.', 'app.', 'display.', 'career.', 'print.'];
            trackingChannel.forEach((item) => {
                const trackingValue = jest.spyOn(s._articleViewTypeObj, 'getTrackingValue').mockReturnValue(item);
                const result = s._articleViewTypeObj.isPaidMarketing(trackingValue);
                expect(result).toBe(true);
            });
        });

        it('should return FALSE if trackingChannel is NOT paid', function () {
            const trackingValue = 'any-trackingChannel.';
            const result = s._articleViewTypeObj.isPaidMarketing(trackingValue);
            expect(result).toBe(false);
        });
    });

    describe('isFromInternal()', function () {
        const anyReferrer = 'https://any-domain.com/any-path';
        let getDomainFromURLStringMock;

        beforeEach(() => {
            getDomainFromURLStringMock = jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue('');
        });

        it('should call s._utils.getDomainFromURLString(referrer)', function () {
            s._articleViewTypeObj.isFromInternal(anyReferrer);
            expect(getDomainFromURLStringMock).toHaveBeenLastCalledWith(anyReferrer);
        });

        it('should return TRUE if referring domain is from the same domain', function () {
            const anyDomain = 'any-domain.com';
            window.document.domain = anyDomain;
            getDomainFromURLStringMock.mockReturnValue(anyDomain);
            const result = s._articleViewTypeObj.isFromInternal(anyReferrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if referring domain is NOT from the same domain', function () {
            window.document.domain = 'any-domain.com';
            getDomainFromURLStringMock.mockReturnValue('any-other-domain.com');
            const result = s._articleViewTypeObj.isFromInternal(anyReferrer);
            expect(result).toBe(false);
        });

        it('should return TRUE if referring domain is from sub domain', function () {
            const anyDomain = 'any-domain.com';
            window.document.domain = anyDomain;
            getDomainFromURLStringMock.mockReturnValue(`any-sub-domain.${anyDomain}`);
            const result = s._articleViewTypeObj.isFromInternal(anyReferrer);
            expect(result).toBe(true);
        });

        it('should return TRUE if referring domain is from sub domain sportbild', function () {
            const anyDomain = 'sportbild.bild.de';
            window.document.domain = anyDomain;
            getDomainFromURLStringMock.mockReturnValue(anyDomain);
            const result = s._articleViewTypeObj.isFromInternal(anyReferrer);
            expect(result).toBe(true);
        });
    });

    describe('isFromBild()', () => {
        it('should return TRUE if referrer is www.bild.de', () => {
            const referringDomain = 'www.bild.de';
            const result = s._articleViewTypeObj.isFromBild(referringDomain);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT www.bild.de', () => {
            const referringDomain = 'www.any-domain.de';
            const result = s._articleViewTypeObj.isFromBild(referringDomain);
            expect(result).toBe(false);
        });
    });

    describe('isFromBildMobile()', () => {
        it('should return TRUE if referrer is m.bild.de', () => {
            const referringDomain = 'm.bild.de';
            const result = s._articleViewTypeObj.isFromBildMobile(referringDomain);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT m.bild.de', () => {
            const referringDomain = 'any-domain.de';
            const result = s._articleViewTypeObj.isFromBildMobile(referringDomain);
            expect(result).toBe(false);
        });
    });

    describe('isFromSecureMypass', () => {
        const anyReferrer = 'https://any-referrer-domain.com/any-path';
        const secureMypassDomains = 'secure.mypass.de';
        let getDomainFromURLStringMock;

        beforeEach(() => {
            getDomainFromURLStringMock = jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue('');
        });

        it('should return TRUE if referrer is from secure mypass (login/register)', function () {
            getDomainFromURLStringMock.mockReturnValue(secureMypassDomains);
            const result = s._articleViewTypeObj.isFromSecureMypass(anyReferrer);
            expect(getDomainFromURLStringMock).toHaveBeenLastCalledWith(anyReferrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT from secure mypass (login/register)', function () {
            getDomainFromURLStringMock.mockReturnValue('any-other-domain.com');
            const result = s._articleViewTypeObj.isFromSecureMypass(anyReferrer);
            expect(getDomainFromURLStringMock).toHaveBeenLastCalledWith(anyReferrer);
            expect(result).toBe(false);
        });
    });

    describe('isFromPaypal', () => {
        const anyReferrer = 'https://any-referrer-domain.com/any-path';
        const paypalDomains = 'paypal.com';
        let getDomainFromURLStringMock;

        beforeEach(() => {
            getDomainFromURLStringMock = jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue('');
        });

        it('should return TRUE if referrer is from paypal (came back after payment)', function () {
            getDomainFromURLStringMock.mockReturnValue(paypalDomains);
            const result = s._articleViewTypeObj.isFromPaypal(anyReferrer);
            expect(getDomainFromURLStringMock).toHaveBeenLastCalledWith(anyReferrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT from paypal (came back after payment)', function () {
            getDomainFromURLStringMock.mockReturnValue('any-other-domain.com');
            const result = s._articleViewTypeObj.isFromPaypal(anyReferrer);
            expect(getDomainFromURLStringMock).toHaveBeenLastCalledWith(anyReferrer);
            expect(result).toBe(false);
        });
    });

    describe('isAsDomain', () => {
        const anyReferrer = 'https://any-referrer-domain.com/any-path';
        const asDomains = 'fitbook.de';
        let getDomainFromURLStringMock;

        beforeEach(() => {
            getDomainFromURLStringMock = jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue('');
        });

        it('should return TRUE if referrer is from internal Domain (except bild.de but like from fitbook.de)', function () {
            getDomainFromURLStringMock.mockReturnValue(asDomains);
            const result = s._articleViewTypeObj.isFromAsDomain(asDomains);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT from internal Domain (except bild.de but like from fitbook.de)', function () {
            getDomainFromURLStringMock.mockReturnValue(anyReferrer);
            const result = s._articleViewTypeObj.isFromAsDomain(anyReferrer);
            expect(result).toBe(false);
        });
    });

    describe('isHomepageSubdomain()', () => {
        it('it should return TRUE for sub domains which can be considered as home pages', () => {
            const homepageSubDomains = [
                'www.anydomain.de',
                'm.anydomain.de',
                'sportbild.anydomain.de',
                'm.sportbild.anydomain.de'
            ];

            homepageSubDomains.forEach(domain => {
                const result = s._articleViewTypeObj.isHomepageSubdomain(domain);
                expect(result).toBe(true);
            });
        });

        it('it should return false for sub domains which should NOT be considered as home pages', () => {
            const homepageSubDomains = [
                'anydomain.de',
                'anysubdomain.anydomain.de',
                'sport.bild.de',
                'online.welt.de'
            ];

            homepageSubDomains.forEach(domain => {
                const result = s._articleViewTypeObj.isHomepageSubdomain(domain);
                expect(result).toBe(false);
            });
        });

    });

    describe('isFromHome', () => {
        let cleanUpReferrerMock;
        beforeEach(() => {
            cleanUpReferrerMock = jest.spyOn(s._articleViewTypeObj, 'cleanUpReferrer').mockImplementation();
        });

        it('should return TRUE if referrer is from homepage (no location.pathname)', function () {
            const anyDomain = 'www.any-domain.de';
            const referrer = `https://${anyDomain}`;
            cleanUpReferrerMock.mockReturnValue(referrer);
            window.document.domain = anyDomain;
            const result = s._articleViewTypeObj.isFromHome(referrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is from a sub page (with location.pathname)', function () {
            const anyDomain = 'www.any-domain.de';
            const referrer = `https://${anyDomain}/any-path`;
            cleanUpReferrerMock.mockReturnValue(referrer);
            window.document.domain = anyDomain;
            const result = s._articleViewTypeObj.isFromHome(referrer);
            expect(result).toBe(false);
        });
    });

    describe('isFromRecommendation()', () => {
        it('should return TRUE if referrer is traffic.outbrain.com', () => {
            const referringDomain = 'traffic.outbrain.com';
            const result = s._articleViewTypeObj.isFromRecommendation(referringDomain);
            expect(result).toBe(true);
        });

        it('should return FALSE if referrer is NOT traffic.outbrain.com', () => {
            const referringDomain = 'www.any-domain.de';
            const result = s._articleViewTypeObj.isFromRecommendation(referringDomain);
            expect(result).toBe(false);
        });
    });

    describe('isFromArticleWithReco()', () => {
        let getTrackingValueMock;
        beforeEach(() => {
            getTrackingValueMock = jest.spyOn(s._articleViewTypeObj, 'getTrackingValue');
        });

        it('should return TRUE if article URL contains recommendation parameter', function () {
            const outbrainTrackingValue = 'kooperation.article.outbrain.anything';
            getTrackingValueMock.mockReturnValue(outbrainTrackingValue);
            const result = s._articleViewTypeObj.isFromArticleWithReco();
            expect(result).toBe(true);
        });

        it('should return FALSE if article URL NOT contains recommendation parameter', function () {
            const anyTrackingValue = 'any-tracking-value';
            getTrackingValueMock.mockReturnValue(anyTrackingValue);
            const result = s._articleViewTypeObj.isFromArticleWithReco();
            expect(result).toBe(false);
        });
    });

    describe('isWithoutReferrer()', () => {
        let referrerMock;
        beforeEach(() => {
            referrerMock = jest.spyOn(s._utils, 'getReferrer');
        });

        it('should return TRUE if no referrer', () => {
            const referrer = referrerMock.mockReturnValue('');
            const result = s._articleViewTypeObj.isWithoutReferrer(referrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if any referrer', () => {
            const referrer = referrerMock.mockReturnValue('any-referrer');
            const result = s._articleViewTypeObj.isWithoutReferrer(referrer);
            expect(result).toBe(false);
        });
    });

    describe('isDirect()', () => {
        let isSessionStartMock;
        let referrerMock;
        beforeEach(() => {
            isSessionStartMock = jest.spyOn(s._utils, 'isSessionStart');
            referrerMock = jest.spyOn(s._articleViewTypeObj, 'isWithoutReferrer');
        });

        it('should return TRUE if no referrer at session start', () => {
            isSessionStartMock.mockReturnValue(true);
            const referrer = referrerMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.isDirect(referrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if any referrer at session start', () => {
            const referrer = referrerMock.mockReturnValue(false);
            isSessionStartMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.isDirect(referrer);
            expect(result).toBe(false);
        });

        it('should return FALSE if no referrer and not session start', () => {
            isSessionStartMock.mockReturnValue(false);
            const referrer = referrerMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.isDirect(referrer);
            expect(result).toBe(false);
        });

        it('should return FALSE if no referrer and no session start cookie', () => {
            const referrer = referrerMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.isDirect(referrer);
            expect(result).toBe(false);
        });
    });

    describe('isTrackingValueOrganicSocial()', () => {
        let getTrackingValueMock;
        beforeEach(() => {
            getTrackingValueMock = jest.spyOn(s._articleViewTypeObj, 'getTrackingValue');
        });

        it('should return TRUE if article trackingValue starts with social.', function () {
            getTrackingValueMock.mockReturnValue('social.');
            const result = s._articleViewTypeObj.isTrackingValueOrganicSocial();
            expect(result).toBe(true);
        });

        it('should return FALSE if article URL NOT contains recommendation parameter', function () {
            getTrackingValueMock.mockReturnValue('any-tracking-value');
            const result = s._articleViewTypeObj.isTrackingValueOrganicSocial();
            expect(result).toBe(false);
        });
    });

    describe('isSamePageRedirect', () => {
        const bildBaseURL = 'https://www.bild.de';
        const anyPathname = '/any-path-name.bild.html';
        const anyOtherPathname = '/anyOther-path-name.bild.html';

        it('should return TRUE if referring page is the same as current page (independent of viewport versions)', function () {
            // We only need to fake the location pathname for the test.
            window.document.location.pathname = anyPathname;
            const referrer = bildBaseURL + anyPathname;

            const result = s._articleViewTypeObj.isSamePageRedirect(referrer);
            expect(result).toBe(true);
        });

        it('should return FALSE if referring page is NOT the same as current page', function () {
            window.document.location.pathname = anyPathname;
            const referrer = bildBaseURL + anyOtherPathname;

            const result = s._articleViewTypeObj.isSamePageRedirect(referrer);
            expect(result).toBe(false);
        });
    });

    describe('isNavigated', () => {
        let getPageReloadStatusMock;

        beforeEach(() => {
            window.performance = {
                getEntriesByType: jest.fn().mockReturnValue([])
            };
            getPageReloadStatusMock = jest.spyOn(s._utils, 'getPageReloadStatus');
            
        });

        it('should return TRUE if window.performance.navigation (depricated) is zero', function () {
            window.performance.navigation = { type: 0 };

            const result = s._articleViewTypeObj.isNavigated();
            expect(result).toBe(true);
        });

        it('should return TRUE if window.performance is navigate', function () {
            window.performance.getEntriesByType.mockReturnValue([{ type: 'navigate' }]);

            const result = s._articleViewTypeObj.isNavigated();
            expect(result).toBe(true);
        });

        it('should return FALSE if window.performance.navigation (depricated) is NOT zero', function () {
            window.performance.navigation = { type: 1 };
            const result = s._articleViewTypeObj.isNavigated();
            expect(result).toBe(false);
        });

        it('should return FALSE if window.performance is reload', function () {
            window.performance.getEntriesByType.mockReturnValue([{ type: 'reload' }]);

            const result = s._articleViewTypeObj.isNavigated();
            expect(result).toBe(false);
        });
    });

    describe('isSelfRedirect', () => {
        const testData = [
            [false, undefined, undefined],
            [false, '', ''],
            [false, '', 'article : 245145230'],
            [false, 'home : 5', 'article : 245145230'],
            [true, 'article : false : 245145230 : vermischtes', 'article : 245145230'],
        ];
        it.each(testData)('should return %s for previousPage: "%s" and pageName "%s"', function (exected, _ppvPreviousPage, pageName) {
            Object.assign(sObject, { _ppvPreviousPage, pageName });

            const result = s._articleViewTypeObj.isSelfRedirect();
            expect(result).toBe(exected);
        });
    });

    describe('getInternalType()', () => {
        let isFromHomeMock;
        let isSamePageRedirectMock;
        let isNavigatedMock;
        let isSelfRedirectMock;

        beforeEach(() => {
            isFromHomeMock = jest.spyOn(s._articleViewTypeObj, 'isFromHome').mockReturnValue(false);
            isSamePageRedirectMock = jest.spyOn(s._articleViewTypeObj, 'isSamePageRedirect').mockReturnValue(false);
            isNavigatedMock = jest.spyOn(s._articleViewTypeObj, 'isNavigated').mockReturnValue(false);
            isSelfRedirectMock = jest.spyOn(s._articleViewTypeObj, 'isSelfRedirect').mockReturnValue(false);
        });

        it('should return event22 if referrer is a home page and page was navigated and it was no selfRedirect', function () {
            const anyReferrer = 'http://www.any-domain.de';
            isFromHomeMock.mockReturnValue(true);
            isNavigatedMock.mockReturnValue(true);
            isSelfRedirectMock.mockReturnValue(false);
            const result = s._articleViewTypeObj.getInternalType('http://www.any-domain.de');
            expect(isFromHomeMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event22,event200');
        });

        it('should return event23 if referrer is NOT a home page', function () {
            const anyReferrer = 'http://www.any-domain.de';
            isFromHomeMock.mockReturnValue(false);
            const result = s._articleViewTypeObj.getInternalType(anyReferrer);
            expect(isFromHomeMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event23,event201');
        });

        it('should return an empty string in case of same page redirects', function () {
            const anyReferrer = 'http://www.any-domain.de';
            isSamePageRedirectMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getInternalType(anyReferrer);
            expect(result).toBe('');
        });
    });

    describe('getExternalType()', () => {
        const anyReferrerDomain = 'www.any-domain.com';
        const anyReferrer = 'https://www.any-domain.com';
        let isFromSearchMock;
        let isFromSocialMock;
        let isFromBildMock;
        let isFromBildMobileMock;
        let isFromHomeMock;
        let isFromSecureMypassMock;
        let isFromAsDomainMock;
        let isFromPaypalMock;
        let isFromRecommendationMock;
        let isDirectMock;
        let isSessionStartMock;
        let isNavigatedMock;

        beforeEach(() => {
            jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue(anyReferrerDomain);
            isFromSearchMock = jest.spyOn(s._articleViewTypeObj, 'isFromSearch').mockReturnValue(false);
            isFromSocialMock = jest.spyOn(s._articleViewTypeObj, 'isFromSocial').mockReturnValue(false);
            isFromBildMock = jest.spyOn(s._articleViewTypeObj, 'isFromBild').mockReturnValue(false);
            isFromBildMobileMock = jest.spyOn(s._articleViewTypeObj, 'isFromBildMobile').mockReturnValue(false);
            isFromHomeMock = jest.spyOn(s._articleViewTypeObj, 'isFromHome').mockReturnValue(false);
            isFromSecureMypassMock = jest.spyOn(s._articleViewTypeObj, 'isFromSecureMypass').mockReturnValue(false);
            isFromAsDomainMock = jest.spyOn(s._articleViewTypeObj, 'isFromAsDomain').mockReturnValue(false);
            isFromPaypalMock = jest.spyOn(s._articleViewTypeObj, 'isFromPaypal').mockReturnValue(false);
            isFromRecommendationMock = jest.spyOn(s._articleViewTypeObj, 'isFromRecommendation').mockReturnValue(false);
            isDirectMock = jest.spyOn(s._articleViewTypeObj, 'isDirect').mockReturnValue(false);
            isSessionStartMock = jest.spyOn(s._utils, 'isSessionStart').mockReturnValue(false);
            isNavigatedMock = jest.spyOn(s._articleViewTypeObj, 'isNavigated').mockReturnValue(false);
        });

        it('should return event24 if referrer is from search engine', function () {
            isFromSearchMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromSearchMock).toHaveBeenCalledWith(anyReferrerDomain);
            expect(result).toBe('event24,event210');
        });

        it('should return event25 if referrer is from social media', function () {
            isFromSocialMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromSocialMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event25,event220');
        });

        it('should return event76,event205 if referrer is Bild desktop homepage', function () {
            isFromBildMock.mockReturnValue(true);
            isFromHomeMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromBildMock).toHaveBeenCalledWith(anyReferrerDomain);
            expect(isFromHomeMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event76,event205');
        });

        it('should return event77,event205 if referrer is Bild mobile homepage', function () {
            isFromBildMobileMock.mockReturnValue(true);
            isFromHomeMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromBildMobileMock).toHaveBeenCalledWith(anyReferrerDomain);
            expect(isFromHomeMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event77,event205');
        });

        it('should return event205 if referrer is from AS Domain ', function () {
            isFromAsDomainMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(result).toBe('event205');
        });

        it('should return event208 if referrer is from Paypal and is session start ', function () {
            isFromPaypalMock.mockReturnValue(true);
            isSessionStartMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromPaypalMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event208');
        });

        it('should return event23 if referrer is from secure mypass (login/register)', function () {
            isFromSecureMypassMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromSecureMypassMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event23,event201');
        });

        it('should return event23 if referrer is from Paypal', function () {
            isFromPaypalMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(isFromPaypalMock).toHaveBeenCalledWith(anyReferrer);
            expect(result).toBe('event23,event201');
        });

        it('should return event230,event233 if referrer is from Recommendation', function () {
            isFromRecommendationMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(anyReferrerDomain);
            expect(isFromRecommendationMock).toHaveBeenCalledWith(anyReferrerDomain);
            expect(result).toBe('event230,event233');
        });

        it('should return event207 (Direct) if no referrer at session start', function () {
            isDirectMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType('');
            expect(result).toBe('event207');
        });

        it('should return event26 (DarkSocial) if no referrer but navigated', function () {
            const noReferrerMock = jest.spyOn(s._utils, 'getDomainFromURLString').mockReturnValue('');
            isNavigatedMock.mockReturnValue(true);
            const result = s._articleViewTypeObj.getExternalType(noReferrerMock);
            expect(result).toBe('event26,event202');
        });

        it('should return event27 (other external) in any other cases', function () {
            const result = s._articleViewTypeObj.getExternalType(anyReferrer);
            expect(result).toBe('event27,event203');
        });
    });

    describe('getViewTypeByReferrer', () => {
        let isFromInternalMock;
        let getInternalTypeMock;
        let getExternalTypeMock;
        let getReferrerFromLocationHashMock;
        let getReferrerFromGetParameterMock;


        beforeEach(() => {
            isFromInternalMock = jest.spyOn(s._articleViewTypeObj, 'isFromInternal').mockReturnValue(false);
            getInternalTypeMock = jest.spyOn(s._articleViewTypeObj, 'getInternalType').mockReturnValue(false);
            getExternalTypeMock = jest.spyOn(s._articleViewTypeObj, 'getExternalType').mockReturnValue(false);
            getReferrerFromLocationHashMock = jest.spyOn(s._utils, 'getReferrerFromLocationHash').mockReturnValue('');
            getReferrerFromGetParameterMock = jest.spyOn(s._utils, 'getReferrerFromGetParameter').mockReturnValue('');
        });

        it('should use the URL from the location hash as the referrer if available', () => {
            const anyReferrerFromHash = 'any-referrer-from-hash';
            getReferrerFromLocationHashMock.mockReturnValue(anyReferrerFromHash);
            s._articleViewTypeObj.getViewTypeByReferrer();
            expect(isFromInternalMock).toHaveBeenCalledWith(anyReferrerFromHash);
        });

        it('should use the URL from GET Parameter as the referrer if available', () => {
            const anyReferrerFromGET = 'any-referrer-from-get';
            getReferrerFromGetParameterMock.mockReturnValue(anyReferrerFromGET);
            s._articleViewTypeObj.getViewTypeByReferrer();
            expect(isFromInternalMock).toHaveBeenCalledWith(anyReferrerFromGET);
        });

        it('should use the document referrer if the location hash is NOT available', () => {
            window.document.referrer = 'any-document-referrer';
            s._articleViewTypeObj.getViewTypeByReferrer();
            expect(isFromInternalMock).toHaveBeenCalledWith(window.document.referrer);
        });

        it('should call getInternalType(referrer) and return its result if referrer is from internal (same domain)', () => {
            const anyInternalType = 'any-internal-type';
            isFromInternalMock.mockReturnValue(true);
            getInternalTypeMock.mockReturnValue(anyInternalType);
            let result = s._articleViewTypeObj.getViewTypeByReferrer();
            expect(result).toBe(anyInternalType);
        });

        it('should return event26 (dark social) if there is no referrer', function () {
            const noReferrer = false;
            const result = s._articleViewTypeObj.getExternalType(noReferrer);
            expect(result).toBe(noReferrer);
        });

        it('should call getExternalType(referrer) and return its result if referrer is from an external domain', () => {
            const anyExternalType = 'any-external-type';
            getExternalTypeMock.mockReturnValue(anyExternalType);
            let result = s._articleViewTypeObj.getViewTypeByReferrer();
            expect(result).toBe(anyExternalType);
        });

        it('should call getExternalType(referrer) and return its result if referrer is from an outbrain domain', () => {
            const anyRecoType = 'traffic.outbrain.com';
            getExternalTypeMock.mockReturnValue(anyRecoType);
            let result = s._articleViewTypeObj.getViewTypeByReferrer();
            expect(result).toBe(anyRecoType);
        });
    });

    describe('getTrackingValue', () => {
        it('should return the value of the URL query param: cid', () => {
            const cidValue = 'any-cid-value';
            window.location.search = `?cid=${cidValue}`;
            const result = s._articleViewTypeObj.getTrackingValue();

            expect(result).toBe(cidValue);
        });

        it('should return the value of the URL query param: wtrid', () => {
            const wtridValue = 'any-wtrid-value';
            window.location.search = `?cid=${wtridValue}`;
            const result = s._articleViewTypeObj.getTrackingValue();

            expect(result).toBe(wtridValue);
        });

        it('should return the value of the URL query param: wtmc', () => {
            const wtmcValue = 'any-wtmc-value';
            window.location.search = `?cid=${wtmcValue}`;
            const result = s._articleViewTypeObj.getTrackingValue();

            expect(result).toBe(wtmcValue);
        });

        it('should return an empty string if there are no tracking values available', () => {
            const result = s._articleViewTypeObj.getTrackingValue();

            expect(result).toBe('');
        });
    });

    describe('getViewTypeByTrackingProperty()', () => {
        let getTrackingValueMock;
        let isMarketingMock;
        let isPageOneInSessionMock;

        beforeEach(() => {
            getTrackingValueMock = jest.spyOn(s._articleViewTypeObj, 'getTrackingValue').mockReturnValue('');
            isMarketingMock = jest.spyOn(s._articleViewTypeObj, 'isPaidMarketing').mockReturnValue(true);
            isPageOneInSessionMock = jest.spyOn(s._utils, 'isPageOneInSession').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('it should return the right event name if tracking value is of type: Search', () => {
            getTrackingValueMock.mockReturnValue('sea.');
            const result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event24,event206,event242');
        });

        it('it should return the right event name if tracking value is of type: Social', () => {
            getTrackingValueMock.mockReturnValue('social_paid');
            const result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event25,event206,event241');
        });

        it('it should return the right event name if tracking value is of type: Social', () => {
            getTrackingValueMock.mockReturnValue('socialmediapaid');
            const result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event25,event206,event241');
        });

        it('it should return the right event name if tracking value is of type: Social', () => {
            getTrackingValueMock.mockReturnValue('social');
            const result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event25,event220');
        });

        it('it should return the right event name if tracking value is of type: Outbrain Article Recommendation', () => {
            getTrackingValueMock.mockReturnValue('kooperation.article.outbrain.');
            isPageOneInSessionMock.mockReturnValue(true);
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event102,event230,event232');

        });
        it('it should return the right event name if tracking value is of type: Outbrain Desktop Home Recommendation', () => {
            getTrackingValueMock.mockReturnValue('kooperation.home.outbrain.desktop.');
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event76,event230,event231');

        });
        it('it should return the right event name if tracking value is of type: Outbrain Mobile Home Recommendation', () => {
            getTrackingValueMock.mockReturnValue('kooperation.home.outbrain.mobile.');
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event77,event230,event231');

        });
        it('it should return the right event name if tracking value is Paid Marketing like email. as one example', () => {
            getTrackingValueMock.mockReturnValue('email.');
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event206');

        });
        it('it should return event204 if the trackingValue equals upday', () => {
            getTrackingValueMock.mockReturnValue('upday');
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).toBe('event204');
        });
        it('it should not return event204 if the trackingValue is not equals upday', () => {
            getTrackingValueMock.mockReturnValue('any_cid');
            let result = s._articleViewTypeObj.getViewTypeByTrackingProperty();
            expect(result).not.toBe('event204');
        });
    });

    describe('setPageSourceForCheckout', () => {
        beforeEach(() => {
            window.utag.loader.SC = jest.fn();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should store the article-view-type in the utag_main cookie', () => {
            s._articleViewType = 'any-view-type';
            s._articleViewTypeObj.setPageSourceAndAgeForCheckout(s);

            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'articleview': s._articleViewType + ';exp-session' });
            expect(window.utag.data['cp.utag_main_articleview']).toBe(s._articleViewType);
        });

        it('should store the publication age (utag.data.page_age) in the utag_main cookie', () => {
            window.utag.data.page_age = 'any-publication-age';
            s._articleViewTypeObj.setPageSourceAndAgeForCheckout(s);

            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'pa': window.utag.data.page_age + ';exp-session' });
            expect(window.utag.data['cp.utag_main_pa']).toBe(window.utag.data.page_age);
        });

        it('should store the publication age (utag.data.page_datePublication_age) in the utag_main cookie', () => {
            window.utag.data.page_datePublication_age = 'any-publication-age';
            s._articleViewTypeObj.setPageSourceAndAgeForCheckout(s);

            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'pa': window.utag.data.page_datePublication_age + ';exp-session' });
            expect(window.utag.data['cp.utag_main_pa']).toBe(window.utag.data.page_datePublication_age);
        });

        it('should store the publication age (utag.data.screen_agePublication) in the utag_main cookie', () => {
            window.utag.data.screen_agePublication = 'any-publication-age';
            s._articleViewTypeObj.setPageSourceAndAgeForCheckout(s);

            expect(window.utag.loader.SC).toHaveBeenCalledWith('utag_main', { 'pa': window.utag.data.screen_agePublication + ';exp-session' });
            expect(window.utag.data['cp.utag_main_pa']).toBe(window.utag.data.screen_agePublication);
        });
    });

    describe('isPageViewFromHome', () => {
        it('should return TRUE if page-view-type is event22', function () {
            const result = s._articleViewTypeObj.isPageViewFromHome('event22,event200');
            expect(result).toBe(true);
        });

        it('should return TRUE if page-view-type is event76', function () {
            const result = s._articleViewTypeObj.isPageViewFromHome('event22,event200');
            expect(result).toBe(true);
        });

        it('should return TRUE if page-view-type is event77', function () {
            const result = s._articleViewTypeObj.isPageViewFromHome('event22,event200');
            expect(result).toBe(true);
        });

        it('should return FALSE if page-view-type is NOT event22, event76 orevent77', function () {
            const result = s._articleViewTypeObj.isPageViewFromHome('event123');
            expect(result).toBe(false);
        });
    });

    describe('setViewTypes()', () => {
        let isArticlePageMock;
        let getViewTypeByReferrerMock;
        let getViewTypeByTrackingPropertyMock;
        let setPageSourceAndAgeForCheckoutMock;
        let addEventMock;
        let isPageViewFromHomeMock;
        let setHomeTeaserPropertiesMock;
        let isAdWallMock;
        let isPaidMarketingMock;

        beforeEach(() => {
            isArticlePageMock = jest.spyOn(s._utils, 'isArticlePage');
            getViewTypeByReferrerMock = jest.spyOn(s._articleViewTypeObj, 'getViewTypeByReferrer').mockImplementation();
            getViewTypeByTrackingPropertyMock = jest.spyOn(s._articleViewTypeObj, 'getViewTypeByTrackingProperty').mockImplementation();
            setPageSourceAndAgeForCheckoutMock = jest.spyOn(s._articleViewTypeObj, 'setPageSourceAndAgeForCheckout').mockImplementation();
            addEventMock = jest.spyOn(s._eventsObj, 'addEvent').mockImplementation();
            isPageViewFromHomeMock = jest.spyOn(s._articleViewTypeObj, 'isPageViewFromHome').mockImplementation();
            setHomeTeaserPropertiesMock = jest.spyOn(s._homeTeaserTrackingObj, 'setHomeTeaserProperties').mockImplementation();
            isAdWallMock = jest.spyOn(s._utils, 'isAdWall').mockImplementation();
            isPaidMarketingMock = jest.spyOn(s._articleViewTypeObj, 'isPaidMarketing').mockReturnValue(true);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should evaluate referrer URL when available to determine article-view-type', function () {
            isArticlePageMock.mockReturnValue(true);
            isAdWallMock.mockReturnValue(false);
            isPaidMarketingMock.mockReturnValue(false);
            window.document.referrer = 'any-referrer-url';
            s._articleViewTypeObj.setViewTypes(s);
            expect(getViewTypeByReferrerMock).toHaveBeenCalled();
        });

        it('should evaluate tracking URL param when referrer is NOT available', function () {
            isArticlePageMock.mockReturnValue(true);
            isAdWallMock.mockReturnValue(false);
            window.location.search = 'cid=email.-cid';
            s._articleViewTypeObj.setViewTypes(s);
            expect(getViewTypeByTrackingPropertyMock).toHaveBeenCalled();
        });

        it('should assign the page-view-type to s._articleViewType and s.eVar44 if page is of type article', function () {
            const anyViewType = 'any-view-type';
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(true);
            window.location.search = 'cid=any-cid';
            getViewTypeByTrackingPropertyMock.mockReturnValue(anyViewType);

            expect(s._articleViewType).toBeUndefined();
            expect(s.eVar44).toBeUndefined();

            s._articleViewTypeObj.setViewTypes(s);

            expect(s._articleViewType).toBe(anyViewType);
            expect(s.eVar44).toBe(anyViewType);
        });

        it('should NOT evaluate the article-view-type when ad blocker is on', function () {
            isAdWallMock.mockReturnValue(true);

            s._articleViewTypeObj.setViewTypes(s);
            expect(s._articleViewType).toBeUndefined();
        });

        it('should NOT assign the page-view-type to s._articleViewType and s.eVar44 if page is NOT of type article', function () {
            const anyViewType = 'any-view-type';
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(false);
            getViewTypeByTrackingPropertyMock.mockReturnValue(anyViewType);

            expect(s._articleViewType).toBeUndefined();
            expect(s.eVar44).toBeUndefined();

            s._articleViewTypeObj.setViewTypes(s);

            expect(s._articleViewType).toBeUndefined();
            expect(s.eVar44).toBeUndefined();
        });

        it('should call setPageSourceAndAgeForCheckout() function if page is of type article', function () {
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(true);

            s._articleViewTypeObj.setViewTypes(s);
            expect(setPageSourceAndAgeForCheckoutMock).toHaveBeenCalled();
        });

        it('should NOT call setPageSourceAndAgeForCheckout() function if page is NOT of type article', function () {
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(false);

            s._articleViewTypeObj.setViewTypes(s);
            expect(setPageSourceAndAgeForCheckoutMock).not.toHaveBeenCalled();
        });

        it('should call s._eventsObj.addEvent() with pag-view-type as the argument if page is of type article', function () {
            const anyViewType = 'any-view-type';
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(true);
            window.location.search = 'cid=any-cid';
            getViewTypeByTrackingPropertyMock.mockReturnValue(anyViewType);

            s._articleViewTypeObj.setViewTypes(s);

            expect(addEventMock).toHaveBeenCalledWith(anyViewType);
        });

        it('should NOT call s._eventsObj.addEvent() with pag-view-type as the argument if page is NOT of type article', function () {
            const anyViewType = 'any-view-type';
            isAdWallMock.mockReturnValue(false);
            isArticlePageMock.mockReturnValue(false);
            getViewTypeByTrackingPropertyMock.mockReturnValue(anyViewType);

            s._articleViewTypeObj.setViewTypes(s);

            expect(addEventMock).not.toHaveBeenCalled();
        });

        it('should call s._eventsObj.addEvent() with event20 as the argument if page was viewed after the homepage (homepage teaser click)', function () {
            isAdWallMock.mockReturnValue(false);
            isPageViewFromHomeMock.mockReturnValue(true);
            s._articleViewTypeObj.setViewTypes(s);

            expect(addEventMock).toHaveBeenCalledWith('event20');
        });

        it('should NOT call s._eventsObj.addEvent() with event20 as the argument if page was NOT viewed after the homepage (homepage teaser click)', function () {
            isAdWallMock.mockReturnValue(false);
            isPageViewFromHomeMock.mockReturnValue(false);
            s._articleViewTypeObj.setViewTypes(s);

            expect(addEventMock).not.toHaveBeenCalled();
        });

        it('should set the homepage teaser tracking properties if page was viewed after the homepage (homepage teaser click)', function () {
            isAdWallMock.mockReturnValue(false);
            isPageViewFromHomeMock.mockReturnValue(true);
            s._articleViewTypeObj.setViewTypes(s);

            expect(setHomeTeaserPropertiesMock).toHaveBeenCalled();
        });

        it('should NOT set the homepage teaser tracking properties if page was NOT viewed after the homepage (homepage teaser click)', function () {
            isAdWallMock.mockReturnValue(false);
            isPageViewFromHomeMock.mockReturnValue(false);
            s._articleViewTypeObj.setViewTypes(s);

            expect(setHomeTeaserPropertiesMock).not.toHaveBeenCalled();
        });

    });

});