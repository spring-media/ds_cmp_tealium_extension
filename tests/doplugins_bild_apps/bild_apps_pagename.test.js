const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');
const { createWindowMock } = require('../mocks/browserMocks');

describe('_bildAppsPageNameObj', () => {
    let s;
    let isDocTypeArticleMock;
    let isLive;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));

        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };

        isDocTypeArticleMock = jest.spyOn(s._utils, 'isDocTypeArticle');
        isLive = jest.spyOn(s._bildAppsPageNameObj, 'isLive');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('isLive', () => {
        it('should be false if page_cms_path is not defined', () => {
            const returnValue = s._bildAppsPageNameObj.isLive();
            expect(returnValue).toBe(false);
        });

        it('should be true if document type is article and page_cms_path contains im-live-ticker', () => {
            window.utag.data.page_cms_path = 'test/im-live-ticker/';
            //isDocTypeArticleMock.mockReturnValue(true);

            const returnValue = s._bildAppsPageNameObj.isLive();
            expect(returnValue).toBe(true);
        });
    });

    describe('isSport', () => {
        it('should be false if isDocTypeArticle is false', () => {
            window.utag.data.page_cms_path = 'test/im-liveticker/';
            isDocTypeArticleMock.mockReturnValue(false);

            const returnValue = s._bildAppsPageNameObj.isSport();
            expect(returnValue).toBe(false);
        });

        it('should be false if page_cms_path is not defined', () => {
            window.utag.data.page_cms_path = 'test/im-liveticker/';
            isDocTypeArticleMock.mockReturnValue(true);

            const returnValue = s._bildAppsPageNameObj.isSport();
            expect(returnValue).toBe(false);
        });

        it('should be true if document type is article and page_cms_path contains im-liveticker', () => {
            window.utag.data.page_cms_path = 'test/sportdaten';
            isDocTypeArticleMock.mockReturnValue(true);
            isLive.mockReturnValue(true);

            const returnValue = s._bildAppsPageNameObj.isSport();
            expect(returnValue).toBe(true);
        });

        it('should be true if document type is article and page_cms_path contains /liveticker/', () => {
            window.utag.data.page_cms_path = 'test/sportdaten/';
            isDocTypeArticleMock.mockReturnValue(true);

            const returnValue = s._bildAppsPageNameObj.isSport();
            expect(returnValue).toBe(true);
        });
    });

    describe('setDocTypeProperty', () => { 
        it('should set mapped_page_document_type if it is defined to the argument value', () => {
            window.utag.data.mapped_page_document_type = 'test_mapped_page_document_type';

            s._bildAppsPageNameObj.setDocTypeProperty('live');

            expect(window.utag.data.mapped_page_document_type).toBe('live');
        });

        it('should set mapped_page_doc_type if it is defined to the argument value', () => {
            window.utag.data.mapped_page_doc_type = 'test_mapped_page_doc_type';

            s._bildAppsPageNameObj.setDocTypeProperty('live-sport');

            expect(window.utag.data.mapped_page_doc_type).toBe('live-sport');
        });

        it('should set mapped_page_document_type if it is defined to the argument value', () => {
            window.utag.data.mapped_document_type = 'test_mapped_document_type';

            s._bildAppsPageNameObj.setDocTypeProperty('live');

            expect(window.utag.data.mapped_document_type).toBe('live');
        });
    });

    describe('setAppsPageName', () => {
        let isLive;
        let isSport;
        let setDocTypePropertyMock;

        beforeEach(() => {
            isLive = jest.spyOn(s._bildAppsPageNameObj, 'isLive').mockReturnValue(false);
            isSport = jest.spyOn(s._bildAppsPageNameObj, 'isSport').mockReturnValue(false);
            setDocTypePropertyMock = jest.spyOn(s._bildAppsPageNameObj, 'setDocTypeProperty');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should not set any data if isLive and isLiveSport are both false', () => {
            s._bildAppsPageNameObj.setAppsPageName(s);

            expect(setDocTypePropertyMock).not.toHaveBeenCalled();
            expect(s.pageName).toBeUndefined();
            expect(s.eVar3).toBeUndefined();
            expect(s.prop3).toBeUndefined();
        });

        it('should set relevant data if isLive is true and isSport is false', () => {
            window.utag.data.page_id = '12345678';
            isDocTypeArticleMock.mockReturnValue(true);
            isLive.mockReturnValue(true);
            isSport.mockReturnValue(false);
            
            s._bildAppsPageNameObj.setAppsPageName(s);

            expect(setDocTypePropertyMock).toHaveBeenCalledWith('live');
            expect(s.eVar3).toBe('live');
            expect(s.prop3).toBe('live');
            expect(s.pageName).toBe('live : ' + window.utag.data.page_id);
        });

        it('should set relevant data if isSport is true and isLive is true', () => {
            window.utag.data.page_id = '12345678';
            isDocTypeArticleMock.mockReturnValue(true);
            isSport.mockReturnValue(true);
            isLive.mockReturnValue(true);

            s._bildAppsPageNameObj.setAppsPageName(s);

            expect(setDocTypePropertyMock).toHaveBeenCalledWith('live-sport');
            expect(s.eVar3).toBe('live-sport');
            expect(s.prop3).toBe('live-sport');
            expect(s.pageName).toBe('live-sport : ' + window.utag.data.page_id);
        });
    });
});
