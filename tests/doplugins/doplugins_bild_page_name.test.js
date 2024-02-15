const sObject = require('../../extensions/doPlugins_global');
const {createWindowMock} = require('../mocks/browserMocks');

describe('_bildPageNameObj', () => {
    let s;
    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = {...sObject};
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('isDocTypeArticle', () => {
        let getDocTypeMock;

        beforeEach(() => {
            getDocTypeMock = jest.spyOn(s._utils, 'getDocType').mockImplementation();
        });

        it('should be false if page_mapped_doctype_for_pagename is not article', () => {
            getDocTypeMock.mockReturnValue('any-non-article-type');

            const returnValue = s._bildPageNameObj.isDocTypeArticle();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_mapped_doctype_for_pagename is article', () => {
            getDocTypeMock.mockReturnValue('article');

            const returnValue = s._bildPageNameObj.isDocTypeArticle();
            expect(returnValue).toBe(true);
        });
    });

    describe('isHome', () => {
        it('should be false if page_id is incorrect', () => {
            window.utag.data.page_id = 12345678;

            const returnValue = s._bildPageNameObj.isHome();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_id is 22P2NufXQ03Ny17A6vwi (Bild home desktop)', () => {
            window.utag.data.page_id = '22P2NufXQ03Ny17A6vwi';

            const returnValue = s._bildPageNameObj.isHome();
            expect(returnValue).toBe(true);
        });

        it('should be true if page_id is wDmWJyqHFeqhJHmeuqfN (Bild home mobile)', () => {
            window.utag.data.page_id = 'wDmWJyqHFeqhJHmeuqfN';

            const returnValue = s._bildPageNameObj.isHome();
            expect(returnValue).toBe(true);
        });

    });

    describe('isLive', () => {
        it('should be false if page_mapped_doctype_for_pagename is not article', () => {
            window.utag.data.is_page_live_article = '1';
            window.utag.data.page_mapped_doctype_for_pagename = 'home';

            const returnValue = s._bildPageNameObj.isLive();
            expect(returnValue).toBe(false);
        });

        it('should be false if is_page_live_article is not correct', () => {
            window.utag.data.is_page_live_article = '0';
            window.utag.data.page_mapped_doctype_for_pagename = 'article';

            const returnValue = s._bildPageNameObj.isLive();
            expect(returnValue).toBe(false);
        });

        it('should be false if page_sub_type is not correct', () => {
            window.utag.data.page_sub_type = 'any-non-Liveticker';
            window.utag.data.page_mapped_doctype_for_pagename = 'article';

            const returnValue = s._bildPageNameObj.isLive();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_mapped_doctype_for_pagename is article and is_page_live_article is 1', () => {
            window.utag.data.is_page_live_article = '1';
            window.utag.data.page_mapped_doctype_for_pagename = 'article';

            const returnValue = s._bildPageNameObj.isLive();
            expect(returnValue).toBe(true);
        });

        it('should be true if page_mapped_doctype_for_pagename is article and page_sub_type is LIVETICKER', () => {
            window.utag.data.page_sub_type = 'LIVETICKER';
            window.utag.data.page_mapped_doctype_for_pagename = 'article';

            const returnValue = s._bildPageNameObj.isLive();
            expect(returnValue).toBe(true);
        });        
    });

    describe('isSportDatencenterTyp', () => {
        it('should be false if Domain is not sport', () => {
            window.location.hostname = 'any-sport.domain.de';
            const returnValue = s._bildPageNameObj.isSportDatencenterTyp(s);
            expect(returnValue).toBe(false);
        });

        it('should be sportdaten if Domain is sport.bild.de', () => {
            window.location.hostname = 'sport.bild.de';
            const returnValue = s._bildPageNameObj.isSportDatencenterTyp(s);
            expect(returnValue).toBe('sportdaten');
        });

        it('should be sportdaten if Domain is sportdaten.sportbild.bild.de', () => {
            window.location.hostname = 'sportdaten.sportbild.bild.de';
            const returnValue = s._bildPageNameObj.isSportDatencenterTyp(s);
            expect(returnValue).toBe('sportdaten');
        });

    });

    describe('isAdWall', () => {
        let getDocTypeMock;

        beforeEach(() => {
            getDocTypeMock = jest.spyOn(s._utils, 'getDocType').mockImplementation();
        });

        it('should be false if page_mapped_doctype_for_pagename is not adwall', () => {
            getDocTypeMock.mockReturnValue('any-non-article-type');

            const returnValue = s._bildPageNameObj.isAdWall();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_mapped_doctype_for_pagename is adwall', () => {
            getDocTypeMock.mockReturnValue('adwall');

            const returnValue = s._bildPageNameObj.isAdWall();
            expect(returnValue).toBe(true);
        });
    });

    describe('isErrorPage', () => {
        let getDocTypeMock;

        beforeEach(() => {
            getDocTypeMock = jest.spyOn(s._utils, 'getDocType').mockImplementation();
        });

        it('should be false if page_mapped_doctype_for_pagename is not ErrorPage', () => {
            getDocTypeMock.mockReturnValue('any-non-article-type');

            const returnValue = s._bildPageNameObj.isErrorPage();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_mapped_doctype_for_pagename is ErrorPage', () => {
            getDocTypeMock.mockReturnValue('errorpage');

            const returnValue = s._bildPageNameObj.isErrorPage();
            expect(returnValue).toBe(true);
        });    
    });

    describe('isSearchPage', () => {
        let getDocTypeMock;

        beforeEach(() => {
            getDocTypeMock = jest.spyOn(s._utils, 'getDocType').mockImplementation();
        });

        it('should be false if page_mapped_doctype_for_pagename is not SearchPage', () => {
            getDocTypeMock.mockReturnValue('any-non-article-type');

            const returnValue = s._bildPageNameObj.isSearchPage();
            expect(returnValue).toBe(false);
        });

        it('should be true if page_mapped_doctype_for_pagename is SearchPage', () => {
            getDocTypeMock.mockReturnValue('search');

            const returnValue = s._bildPageNameObj.isSearchPage();
            expect(returnValue).toBe(true);
        });    
    });   

    describe('setPageName', () => {
        let isHome;
        let isLive;
        let isAdWall;
        let isErrorPage;
        let isSearchPage;

        beforeEach(() => {
            isHome = jest.spyOn(s._bildPageNameObj, 'isHome').mockReturnValue(false);
            isLive = jest.spyOn(s._bildPageNameObj, 'isLive').mockReturnValue(false);
            isAdWall = jest.spyOn(s._bildPageNameObj, 'isAdWall').mockReturnValue(false);
            isErrorPage = jest.spyOn(s._bildPageNameObj, 'isErrorPage').mockReturnValue(false);
            isSearchPage = jest.spyOn(s._bildPageNameObj, 'isSearchPage').mockReturnValue(false);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should not set any data if isHome, isLive, isLiveSport are all false', () => {
            s._bildPageNameObj.setPageName(s);

            expect(window.utag.data.page_mapped_doctype_for_pagename).toBeUndefined();
            expect(s.pageName).toBeUndefined();
            expect(s.eVar3).toBeUndefined();
            expect(s.prop3).toBeUndefined();
        });

        it('should set relevant data if isHome is true', () => {
            window.utag.data.page_id = '12345678';
            isHome.mockReturnValue(true);
            s._bildPageNameObj.setPageName(s);

            expect(window.utag.data.page_mapped_doctype_for_pagename).toBe('home');
            expect(s.eVar3).toBe('home');
            expect(s.prop3).toBe('home');
            expect(s.eVar4).toBe('/');
            expect(s.eVar5).toBe('home');
            expect(s.pageName).toBe('home : ' + window.utag.data.page_id);
        });

        it('should set relevant data if isLive is true', () => {
            window.utag.data.page_id = '12345678';
            isLive.mockReturnValue(true);
            s._bildPageNameObj.setPageName(s);

            expect(window.utag.data.page_mapped_doctype_for_pagename).toBe('live');
            expect(s.eVar3).toBe('live');
            expect(s.prop3).toBe('live');
            expect(s.pageName).toBe('live : ' + window.utag.data.page_id);
        });

        it('should set relevant data if isSportdatencentertyp live-sport is true', () => {
            window.utag.data.page_id = '12345678';
            window.location.hostname = 'www.sport.bild.de';
            window.location.pathname = 'any/path/liveticker/';

            s._bildPageNameObj.setPageName(s);

            expect(s.eVar3).toBe('live-sport');
            expect(s.prop3).toBe('live-sport');
            expect(s.pageName).toBe('live-sport : ' + window.utag.data.page_id);
        });

        it('should set relevant data if isSportdatencentertyp sportdaten is true', () => {
            window.utag.data.page_id = '12345678';
            window.location.hostname = 'www.sport.bild.de';
            window.location.pathname = 'any/path/';
            
            s._bildPageNameObj.setPageName(s);
            
            expect(s.eVar3).toBe('sportdaten');
            expect(s.prop3).toBe('sportdaten');
            expect(s.pageName).toBe('sportdaten : ' + window.utag.data.page_id);
        });

        it('should set relevant data if isAdWall is true', () => {
            window.utag.data._pathname1 = 'any-pathname1';
            window.utag.data.page_document_type = 'adwall';
            isAdWall.mockReturnValue(true);
            s._bildPageNameObj.setPageName(s);

            expect(s.pageName).toBe('adwall : any-pathname1');
        });

        it('should set relevant data if isErrorPage is true', () => {
            window.utag.data._pathname1 = 'any-pathname1';
            window.utag.data.page_document_type = 'errorpage';
            isErrorPage.mockReturnValue(true);
            s._bildPageNameObj.setPageName(s);

            expect(s.pageName).toBe('errorpage : any-pathname1');
        });

        it('should set relevant data if isSearchPage is true', () => {
            window.utag.data.page_document_type = 'search';
            isSearchPage.mockReturnValue(true);
            s._bildPageNameObj.setPageName(s);
            expect(s.pageName).toBe('search : search');
        });        
    });
});