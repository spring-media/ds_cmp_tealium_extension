const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('campaign', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAdobeCampaign()', () => {
        it('should return cid as adobe_campaign if it is present', () => {
            window.utag.data = {
                'qp.cid': 'cid.test',
                'qp.wtrid': 'wtrid.test',
                'qp.wtmc': 'wtmc.test',
                'qp.wt_mc': 'wt_mc.test'
            };

            const adobe_campaign = s._campaignObj.getAdobeCampaign();
            expect(adobe_campaign).toBe('cid=' + window.utag.data['qp.cid']);
        });
        it('should return wtrid as adobe_campaign if it is present and cid is not defined', () => {
            window.utag.data = {
                'qp.wtrid': 'wtrid.test',
                'qp.wtmc': 'wtmc.test',
                'qp.wt_mc': 'wt_mc.test'
            };

            const adobe_campaign = s._campaignObj.getAdobeCampaign();
            expect(adobe_campaign).toBe('wtrid=' + window.utag.data['qp.wtrid']);
        });
        it('should return wtmc as adobe_campaign if it is present and cid and wtrid are not defined', () => {
            window.utag.data = {
                'qp.wtmc': 'wtmc.test',
                'qp.wt_mc': 'wt_mc.test'
            };

            const adobe_campaign = s._campaignObj.getAdobeCampaign();
            expect(adobe_campaign).toBe('wtmc=' + window.utag.data['qp.wtmc']);
        });
        it('should return wt_mc as adobe_campaign if it is present and cid, wtrid and wtmc are not defined', () => {
            window.utag.data = {
                'qp.wt_mc': 'wt_mc.test'
            };

            const adobe_campaign = s._campaignObj.getAdobeCampaign();
            expect(adobe_campaign).toBe('wt_mc=' + window.utag.data['qp.wt_mc']);
        });

        it('should return empty string if no campaign is defined', () => {
            const adobe_campaign = s._campaignObj.getAdobeCampaign();
            expect(adobe_campaign).toBe('');
        });
    });

    describe('setCampaignVariables', () => {
        let isFirstPageViewMock;
        const anyCampaignValue = undefined;
        beforeEach(() => {
            isFirstPageViewMock = jest.spyOn(s._utils, 'isFirstPageView').mockImplementation();
            jest.spyOn(s._campaignObj, 'getAdobeCampaign').mockReturnValue(anyCampaignValue);
            jest.spyOn(s, 'getValOnce').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should get adobe campaign and set correct data', () => {
            isFirstPageViewMock.mockReturnValue(false);

            s._campaignObj.setCampaignVariables(s);

            expect(window.utag.data.adobe_campaign).toBe(anyCampaignValue);
            expect(s.eVar88).toBe(anyCampaignValue);
            expect(s.campaign).toBe(anyCampaignValue);
        });

        it('should call s.getValeOnce (use Adobe cookie function) on regular page views', () => {
            isFirstPageViewMock.mockReturnValue(false);

            s._campaignObj.setCampaignVariables(s);
            expect(s.getValOnce).toHaveBeenCalledWith(anyCampaignValue, 's_ev0', 0, 'm');
        });

        it('should call NOT s.getValeOnce (use Adobe cookie function) on first-page views', () => {
            isFirstPageViewMock.mockReturnValue(true);

            s._campaignObj.setCampaignVariables(s);
            expect(s.getValOnce).not.toHaveBeenCalled();
        });

        it('should call s.getValeOnce (use Adobe cookie function) in onConsent context', () => {
            isFirstPageViewMock.mockReturnValue(true);

            s._campaignObj.setCampaignVariables(s, true);
            expect(s.getValOnce).toHaveBeenCalledWith(anyCampaignValue, 's_ev0', 0, 'm');
        });
    });
});
