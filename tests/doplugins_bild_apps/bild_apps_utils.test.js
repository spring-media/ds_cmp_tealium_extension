const { createWindowMock } = require('../mocks/browserMocks');
const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');

describe('s._utils', () => {
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

    describe('isDocTypeArticle', () => {
        it('should return true if any of the possible document types is article', () => {
            const PROPERTY_NAMES = ['mapped_page_document_type', 'mapped_page_doc_type', 'mapped_document_type'];

            PROPERTY_NAMES.forEach(propertyName => {
                window.utag.data[propertyName] = 'article';
                const result = s._utils.isDocTypeArticle();
                expect(result).toBe(true);
                delete window.utag.data[propertyName];
            });
        });
    });
});
