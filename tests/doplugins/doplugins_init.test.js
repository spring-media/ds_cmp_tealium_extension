const sObject = require('../../extensions/doPlugins/doPlugins_global');
const {createWindowMock} = require('../mocks/browserMocks');

describe('init()', () => {
    let s;
    let setCampaignVariablesMock;
    let setViewTypesMock;
    let setICIDTrackingVariablesMock;
    let setDirectOrderValuesMock;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = {...sObject};

        setCampaignVariablesMock = jest.spyOn(s._campaignObj, 'setCampaignVariables').mockImplementation();
        setViewTypesMock = jest.spyOn(s._articleViewTypeObj, 'setViewTypes').mockImplementation();
        setICIDTrackingVariablesMock = jest.spyOn(s._ICIDTracking, 'setVariables').mockImplementation();
        setDirectOrderValuesMock = jest.spyOn(s._directOrderObj, 'setDirectOrderValues').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete s.eVar94;
    });

    it('should set global configuration properties of the Adobe s-object', () => {
        window.document.referrer = 'any_referrer';
        window.navigator.userAgent = 'any-user-agent';
        window.utag.data['dom.pathname'] = 'any-pathname';
        s._init(s);

        expect(s.currencyCode).toBe('EUR');
        expect(s.myChannels).toBe(0);
        expect(s.usePlugins).toBe(true);
        expect(s.trackInlineStats).toBe(true);
        expect(s.linkLeaveQueryString).toBe(true);
        expect(s.trackExternalLinks).toBe(true);
        expect(s.eVar61).toBe(window.navigator.userAgent);
        expect(s.referrer).toBe(window.document.referrer);
    });

    it('should set eVar94 to the iPhone screen size', () => {
        const anyScreenSize = 111;
        window.screen.width = window.screen.height = anyScreenSize;
        window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
        

        s._init(s);

        expect(s.eVar94).toBe(`${anyScreenSize}x${anyScreenSize}`);
    });

    it('should NOT set eVar94 when not viewed on iPhones', () => {

        s._init(s);
        expect(s.eVar94).toBeUndefined();
    });

    it('should call s._campaignObj.setCampaignVariables(s)', () => {

        s._init(s);
        expect(setCampaignVariablesMock).toHaveBeenCalledWith(s);
    });

    it('should call s._articleViewTypeObj.setArticleViewType(s)', () => {

        s._init(s);
        expect(setViewTypesMock).toHaveBeenCalledWith(s);
    });

    it('should call s._ICIDTracking.setVariables(s)', () => {

        s._init(s);
        expect(setICIDTrackingVariablesMock).toHaveBeenCalledWith(s);
    });

    it('should call s.s._directOrderObj.setDirectOrderValues(s)', () => {

        s._init(s);
        expect(setDirectOrderValuesMock).toHaveBeenCalledWith(s);
    });

});