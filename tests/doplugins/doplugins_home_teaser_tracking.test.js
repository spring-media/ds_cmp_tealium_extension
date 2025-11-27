const { createWindowMock } = require('../mocks/browserMocks');
const sObject = require('../../extensions/doPlugins/doPlugins_global');

describe('_homeTeaserTrackingObj', () => {
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

    describe('getTeaserBrandFromCID', () => {
        it('should return the brand segment of the CID string', function() {
            const brandSegment = 'any-brand';
            window.utag.data['qp.cid'] = 'kooperation.reco.outbrain.free.welt.desktop.AR_2.' + brandSegment;
            const result = s._homeTeaserTrackingObj.getTeaserBrandFromCID();
            expect(result).toBe(brandSegment);
        });

        it('should return an empty string if there is no CID value', function() {
            const result = s._homeTeaserTrackingObj.getTeaserBrandFromCID();
            expect(result).toBe('');
        });
    });

    describe('getTrackingValue', () => {
        it('should return the hti value from utag_main cookie if available', function() {
            window.utag.data['cp.utag_main_hti'] = 'any-hti-value';
            const result = s._homeTeaserTrackingObj.getTrackingValue();
            expect(result).toBe(window.utag.data['cp.utag_main_hti']);
        });

        it('should return the teaser brand segment from CID URL query parameter if available', function() {
            const anyTeaserBrand = 'any-brand';
            jest.spyOn(s._homeTeaserTrackingObj, 'getTrackingValue').mockImplementation().mockReturnValue(anyTeaserBrand);
            const result = s._homeTeaserTrackingObj.getTrackingValue();
            expect(result).toBe(anyTeaserBrand);
        });

        it('should return the dtp URL query parameter if available', function() {
            window.utag.data['qp.dtp'] = 'any-dtp-value';
            const result = s._homeTeaserTrackingObj.getTrackingValue();
            expect(result).toBe(window.utag.data['qp.dtp']);
        });
    });

    describe('getBlockValue', () => {
        it('should return the tb value from utag_main cookie if available', function() {
            window.utag.data['cp.utag_main_tb'] = 'any-tb-value';
            const result = s._homeTeaserTrackingObj.getBlockValue();
            expect(result).toBe(window.utag.data['cp.utag_main_tb']);
        });

        it('should return the tbl URL query parameter if available', function() {
            window.utag.data['qp.tbl'] = 'any-dtp-value';
            const result = s._homeTeaserTrackingObj.getBlockValue();
            expect(result).toBe(window.utag.data['qp.tbl']);
        });
    });

    describe('getPageId', () => {
        it('should return empty string if no page id is present', () => {
            const value = s._homeTeaserTrackingObj.getPageId();

            expect(value).toBe('');
        });

        it('should return page_id if it is present', () => {
            window.utag.data.page_id = 'test_page_id';
            const value = s._homeTeaserTrackingObj.getPageId();

            expect(value).toBe(window.utag.data.page_id);
        });

        it('should return page_escenicId if it is present', () => {
            window.utag.data.page_escenicId = 'test_page_escenicId';
            const value = s._homeTeaserTrackingObj.getPageId();

            expect(value).toBe(window.utag.data.page_escenicId);
        });

    });


    describe('setEvars', () => {
        it('should assign teaser tracking values to certain eVars', function() {
            const anyTrackingValue = 'any-tracking-value';
            const anyBlockValue = 'any-block-value';
            const anyPageId = '123456';
            window.utag.data.page_id = anyPageId;
            jest.spyOn(s._homeTeaserTrackingObj, 'getTrackingValue').mockImplementation().mockReturnValue(anyTrackingValue);
            jest.spyOn(s._homeTeaserTrackingObj, 'getBlockValue').mockImplementation().mockReturnValue(anyBlockValue);
            jest.spyOn(s._homeTeaserTrackingObj, 'getPageId').mockImplementation().mockReturnValue(anyPageId);
            s._homeTeaserTrackingObj.setEvars(s);
            expect(s.eVar66).toBe(anyTrackingValue);
            expect(s.eVar92).toBe(anyTrackingValue + '|' + anyPageId);
            expect(s.eVar97).toBe(anyBlockValue);
        });
    });

    describe('deleteTrackingValuesFromCookie()', () => {
        it('should delete the hti and tb values of the utag_main cookie', function() {
            window.utag.loader.SC = jest.fn();
            s._homeTeaserTrackingObj.deleteTrackingValuesFromCookie();
            expect(window.utag.loader.SC).toHaveBeenNthCalledWith(1, 'utag_main', {'hti': ';exp-session'});
            expect(window.utag.loader.SC).toHaveBeenNthCalledWith(2, 'utag_main', {'tb': ';exp-session'});
        });
    });

    describe('setHomeTeaserProperties', () => {
        let setEvarsMock;
        let deleteTrackingValuesFromCookieMock;

        beforeEach(() => {
            setEvarsMock = jest.spyOn(s._homeTeaserTrackingObj, 'setEvars').mockImplementation();
            deleteTrackingValuesFromCookieMock = jest.spyOn(s._homeTeaserTrackingObj, 'deleteTrackingValuesFromCookie').mockImplementation();
        });

        it('should call this.setEvars(s) and this.deleteTrackingValuesFromCookie()', function() {
            s._homeTeaserTrackingObj.setHomeTeaserProperties(s);
            expect(setEvarsMock).toHaveBeenCalledTimes(1);
            expect(deleteTrackingValuesFromCookieMock).toHaveBeenCalledTimes(1);
        });
    });
});
