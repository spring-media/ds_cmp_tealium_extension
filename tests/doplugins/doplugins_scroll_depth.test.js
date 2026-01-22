const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('_scrollDepthObj', () => {
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

    describe('isArticlePage', () => {
        it('should return false if doc_type is not defined', () => {
            const result = s._utils.isArticlePage(s);

            expect(result).toBe(false);
        });

        it('should return true if doc_type is article', () => {
            window.utag.data.page_mapped_doctype_for_pagename = 'article';
            const result = s._utils.isArticlePage(s);

            expect(result).toBe(true);
        });

        it('should return true if doc_type is video', () => {
            window.utag.data.page_mapped_doctype_for_pagename = 'video';
            const result = s._utils.isArticlePage(s);

            expect(result).toBe(true);
        });

        it('should return true if doc_type is single', () => {
            window.utag.data.page_mapped_doctype_for_pagename = 'single';
            const result = s._utils.isArticlePage(s);

            expect(result).toBe(true);
        });

        it('should return true if doc_type is post', () => {
            window.utag.data.page_mapped_doctype_for_pagename = 'post';
            const result = s._utils.isArticlePage(s);

            expect(result).toBe(true);
        });
    });

    describe('getPageId', () => {
        it('should return empty string if no page id is present', () => {
            const value = s._scrollDepthObj.getPageId();

            expect(value).toBe('');
        });

        it('should return page_id if it is present', () => {
            window.utag.data.page_id = 'test_page_id';
            const value = s._scrollDepthObj.getPageId();

            expect(value).toBe(window.utag.data.page_id);
        });

        it('should return cid if it is present', () => {
            window.utag.data.cid = 'test_cid';
            const value = s._scrollDepthObj.getPageId();

            expect(value).toBe(window.utag.data.cid);
        });

        it('should return screen_escenicId if it is present', () => {
            window.utag.data.screen_escenicId = 'test_screen_escenicId';
            const value = s._scrollDepthObj.getPageId();

            expect(value).toBe(window.utag.data.screen_escenicId);
        });

        it('should return page_escenicId if it is present', () => {
            window.utag.data.page_escenicId = 'test_page_escenicId';
            const value = s._scrollDepthObj.getPageId();

            expect(value).toBe(window.utag.data.page_escenicId);
        });
    });

    describe('getPageChannel', () => {
        it('should return empty string if no page channel is present', () => {
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe('');
        });

        it('should return _pathname1 if it is present', () => {
            window.utag.data._pathname1 = 'test_pathname1';
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe(window.utag.data._pathname1);
        });

        it('should return page_channel1 if it is present', () => {
            window.utag.data.page_channel1 = 'test_page_channel1';
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe(window.utag.data.page_channel1);
        });

        it('should return nav1 if it is present', () => {
            window.utag.data.nav1 = 'test_nav1';
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe(window.utag.data.nav1);
        });

        it('should return screen_sectionPath_level1 if it is present', () => {
            window.utag.data.screen_sectionPath_level1 = 'test_screen_sectionPath_level1';
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe(window.utag.data.screen_sectionPath_level1);
        });

        it('should return page_sectionPath1 if it is present', () => {
            window.utag.data.page_sectionPath1 = 'test_page_sectionPath1';
            const value = s._scrollDepthObj.getPageChannel();

            expect(value).toBe(window.utag.data.page_sectionPath1);
        });
    });

    describe('getPagePremiumStatus', () => {
        it('should return empty string if no page premium status is present', () => {
            const value = s._scrollDepthObj.getPagePremiumStatus();

            expect(value).toBe('');
        });

        it('should return is_status_premium if it is present', () => {
            window.utag.data.is_status_premium = 'is_status_premium_yes';
            const value = s._scrollDepthObj.getPagePremiumStatus();

            expect(value).toBe(window.utag.data.is_status_premium + ' : ');
        });

        it('should return page_isPremium if it is present', () => {
            window.utag.data.page_isPremium = 'page_isPremium_yes';
            const value = s._scrollDepthObj.getPagePremiumStatus();

            expect(value).toBe(window.utag.data.page_isPremium + ' : ');
        });

        it('should return screen_isPremium if it is present', () => {
            window.utag.data.screen_isPremium = 'screen_isPremium_yes';
            const value = s._scrollDepthObj.getPagePremiumStatus();

            expect(value).toBe(window.utag.data.screen_isPremium + ' : ');
        });
    });

    describe('setPreviousPage', () => {
        it('should set the right _prevPage if docType is not article or video', () => {
            s.pageName = 'test_pageName';
            jest.spyOn(s._utils, 'isArticlePage').mockReturnValue(false);

            s._scrollDepthObj.setPreviousPage(s);

            expect(s._prevPage).toBe(s.pageName);
        });

        it('should set the right _prevPage if docType is article or video', () => {
            jest.spyOn(s._utils, 'isArticlePage').mockReturnValue(true);
            jest.spyOn(s._utils, 'getDocType').mockReturnValue('test_docType');
            jest.spyOn(s._scrollDepthObj, 'getPageId').mockReturnValue('test_pageId');
            jest.spyOn(s._scrollDepthObj, 'getPageChannel').mockReturnValue('test_pageChannel');
            jest.spyOn(s._scrollDepthObj, 'getPagePremiumStatus').mockReturnValue('test_is_page_premium_yes : ');
            s._scrollDepthObj.setPreviousPage(s);

            expect(s._prevPage).toBe('test_docType : test_is_page_premium_yes : test_pageId : test_pageChannel');
        });
    });

    describe('setScrollDepthProperties', () => {
        afterEach(() => {
            s._scrollDepthObj.isFirstRun = true;
        });

        it('should call setPreviousPage and getPercentPageViewed if pageName is defined', () => {
            s.pageName = 'test_pageName';
            const setPrevPage = jest.spyOn(s._scrollDepthObj, 'setPreviousPage');
            jest.spyOn(s, 'getPercentPageViewed').mockImplementation(jest.fn());

            s._scrollDepthObj.setScrollDepthProperties(s);

            expect(setPrevPage).toHaveBeenCalledWith(s);
            expect(s.getPercentPageViewed).toHaveBeenCalledWith(s._prevPage);
        });

        it('should call setData if pageName and _ppvPreviousPage is defined', () => {
            s.pageName = 'test_pageName';
            s._ppvPreviousPage = 'test_ppvPreviousPage';

            jest.spyOn(s, 'getPercentPageViewed').mockImplementation(jest.fn());
            const setData = jest.spyOn(s._scrollDepthObj, 'setData');

            s._scrollDepthObj.setScrollDepthProperties(s);

            expect(setData).toHaveBeenCalledWith(s);
        });

        it('should run only once', () => {
            s.pageName = 'test_pageName';
            s._ppvPreviousPage = 'test_ppvPreviousPage';

            jest.spyOn(s, 'getPercentPageViewed').mockImplementation(jest.fn());
            const setData = jest.spyOn(s._scrollDepthObj, 'setData');

            s._scrollDepthObj.setScrollDepthProperties(s);
            s._scrollDepthObj.setScrollDepthProperties(s);

            expect(setData).toHaveBeenCalledTimes(1);
        });
    });

    describe('setData', () => {
        it('should set scroll depth data in s object when called', () => {
            const addEventMock = jest.spyOn(s._eventsObj, 'addEvent').mockImplementation();
            s._ppvPreviousPage = 'test_ppvPreviousPage';
            s._ppvInitialPercentViewed = '1';
            s._ppvHighestPixelsSeen = '100';
            s._ppvHighestPercentViewed = '12';

            s._scrollDepthObj.setData(s);

            expect(s.eVar33).toBe(s._ppvPreviousPage);
            expect(s.prop61).toBe(s._ppvPreviousPage);
            expect(s.prop62).toBe(s._ppvInitialPercentViewed);
            expect(s.prop63).toBe(s._ppvHighestPixelsSeen);
            expect(s.prop64).toBe(Math.round(s._ppvInitialPercentViewed / 10) * 10);
            expect(s.prop65).toBe(Math.round(s._ppvHighestPercentViewed / 10) * 10);
            expect(addEventMock).toHaveBeenCalledWith('event45=' + s.prop64);
            expect(addEventMock).toHaveBeenCalledWith('event46=' + s.prop65);
        });
    });
});
