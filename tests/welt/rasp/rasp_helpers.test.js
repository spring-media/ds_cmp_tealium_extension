/**
 * Tests for rasp_helpers.js
 * Helper functions for Rasp tracking data extraction
 */

/* global utag */

const RaspHelpers = require('../../../extensions/welt/rasp/rasp_helpers');

describe('RaspHelpers', () => {
    let mockUtag;
    let mockWindow;

    beforeEach(() => {
        // Mock window
        mockWindow = {
            utag: undefined,
            performance: undefined,
            ASCDP: undefined,
            localStorage: undefined
        };
        global.window = mockWindow;

        // Mock utag
        mockUtag = {
            data: {}
        };
        global.utag = mockUtag;
        mockWindow.utag = mockUtag;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.window;
        delete global.utag;
    });

    describe('getTeaserBrandFromCID', () => {
        it('should return last segment of cid', () => {
            utag.data['qp.cid'] = 'kooperation.home.outbrain.desktop.AR_2.stylebook';
            expect(RaspHelpers.getTeaserBrandFromCID()).toBe('stylebook');
        });

        it('should return empty string when no cid', () => {
            expect(RaspHelpers.getTeaserBrandFromCID()).toBe('');
        });
    });

    describe('getTrackingValue', () => {
        it('should prioritize CID over hti and dtp', () => {
            utag.data['qp.cid'] = 'kooperation.home.outbrain.desktop.AR_2.stylebook';
            utag.data['cp.utag_main_hti'] = 'hti_value';
            utag.data['qp.dtp'] = 'dtp_value';
            expect(RaspHelpers.getTrackingValue()).toBe('stylebook');
        });

        it('should fall back to hti when no CID', () => {
            utag.data['cp.utag_main_hti'] = 'hti_value';
            expect(RaspHelpers.getTrackingValue()).toBe('hti_value');
        });
    });

    describe('getBlockValue', () => {
        it('should return first segment before underscore', () => {
            utag.data['cp.utag_main_tb'] = 'block_segment_other';
            expect(RaspHelpers.getBlockValue()).toBe('block');
        });

        it('should prioritize cookie over query param', () => {
            utag.data['cp.utag_main_tb'] = 'cookie_value';
            utag.data['qp.tbl'] = 'query_value';
            expect(RaspHelpers.getBlockValue()).toBe('cookie');
        });
    });

    describe('getPageId', () => {
        it('should prioritize page_id over page_escenicId', () => {
            utag.data.page_id = '12345';
            utag.data.page_escenicId = '67890';
            expect(RaspHelpers.getPageId()).toBe('12345');
        });

        it('should fall back to page_escenicId', () => {
            utag.data.page_escenicId = '67890';
            expect(RaspHelpers.getPageId()).toBe('67890');
        });
    });

    describe('getCID', () => {
        it('should prioritize cid over other parameters', () => {
            utag.data['qp.cid'] = 'cid_value';
            utag.data['qp.wtrid'] = 'wtrid_value';
            utag.data['qp.wtmc'] = 'wtmc_value';
            utag.data['qp.wt_mc'] = 'wt_mc_value';
            expect(RaspHelpers.getCID()).toBe('cid=cid_value');
        });

        it('should fall back to wtrid when no cid', () => {
            utag.data['qp.wtrid'] = 'wtrid_value';
            utag.data['qp.wtmc'] = 'wtmc_value';
            utag.data['qp.wt_mc'] = 'wt_mc_value';
            expect(RaspHelpers.getCID()).toBe('wtrid=wtrid_value');
        });

        it('should fall back to wtmc when no cid or wtrid', () => {
            utag.data['qp.wtmc'] = 'wtmc_value';
            utag.data['qp.wt_mc'] = 'wt_mc_value';
            expect(RaspHelpers.getCID()).toBe('wtmc=wtmc_value');
        });

        it('should fall back to wt_mc when no other parameters', () => {
            utag.data['qp.wt_mc'] = 'wt_mc_value';
            expect(RaspHelpers.getCID()).toBe('wt_mc=wt_mc_value');
        });

        it('should return empty string when no campaign parameter', () => {
            expect(RaspHelpers.getCID()).toBe('');
        });
    });

    describe('getTeaserTrackingData', () => {
        it('should return complete teaser tracking data', () => {
            utag.data['qp.cid'] = 'brand.segment.stylebook';
            utag.data['cp.utag_main_tb'] = 'block_value';
            utag.data.page_id = '12345';

            const result = RaspHelpers.getTeaserTrackingData();

            expect(result).toEqual({
                trackingValue: 'stylebook',
                blockValue: 'block',
                pageId: '12345',
                teaserPositionPage: 'stylebook|12345'
            });
        });

        it('should return empty teaserPositionPage when data missing', () => {
            const result = RaspHelpers.getTeaserTrackingData();

            expect(result.teaserPositionPage).toBe('');
        });
    });

    describe('getPageReloadStatus', () => {
        it('should return navigation type from performance API', () => {
            window.performance = {
                getEntriesByType: jest.fn().mockReturnValue([{ type: 'navigate' }])
            };

            expect(RaspHelpers.getPageReloadStatus()).toBe('navigate');
        });

        it('should return empty string when performance API not available', () => {
            expect(RaspHelpers.getPageReloadStatus()).toBe('');
        });
    });

    describe('getAdvertisingBranch', () => {
        it('should return branch from ASCDP', () => {
            window.ASCDP = {
                pageSet: {
                    branch: 'testBranch'
                }
            };

            expect(RaspHelpers.getAdvertisingBranch()).toBe('testBranch');
        });

        it('should return noAdlib when ASCDP not available', () => {
            expect(RaspHelpers.getAdvertisingBranch()).toBe('noAdlib');
        });
    });

    describe('getAllTrackingData', () => {
        it('should return complete tracking data object', () => {
            utag.data['qp.cid'] = 'brand.segment.stylebook';
            utag.data['cp.utag_main_tb'] = 'block_value';
            utag.data.page_id = '12345';
            utag.data['qp.icid'] = 'icid_123';

            window.ASCDP = {
                pageSet: {
                    branch: 'testBranch'
                }
            };

            window.performance = {
                getEntriesByType: jest.fn().mockReturnValue([{ type: 'navigate' }])
            };

            const result = RaspHelpers.getAllTrackingData();

            expect(result).toEqual({
                trackingValue: 'stylebook',
                blockValue: 'block',
                pageId: '12345',
                teaserPositionPage: 'stylebook|12345',
                cid: 'cid=brand.segment.stylebook',
                icid: 'icid_123',
                pageReloadStatus: 'navigate',
                adLibBranch: 'testBranch'
            });
        });

        it('should handle missing data gracefully', () => {
            const result = RaspHelpers.getAllTrackingData();

            expect(result.adLibBranch).toBe('noAdlib');
            expect(result.cid).toBe('');
        });
    });
});
