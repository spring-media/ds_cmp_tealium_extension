const {createWindowMock} = require('../mocks/browserMocks');
const sObject = require('../../extensions/doPlugins_global');

describe('s_utils', () => {
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

    describe('getDomainFromURLString(URLString)', () => {
        it('should return domain from URL string', () => {
            const domain = 'www.bild.de';
            const urlString = `https://${domain}/any-path`;
            const result = s._utils.getDomainFromURLString(urlString);
            expect(result).toBe(domain);
        });

        it('should return an empty string if passed in string is not a valid URL', () => {
            const anyString = 'invalid-url-string';
            const result = s._utils.getDomainFromURLString(anyString);
            expect(result).toBe('');
        });
    });

    describe('getDocType', () => {
        it('should return empty string if no document type is present', () => {
            const value = s._utils.getDocType();

            expect(value).toBe('');
        });

        it('should return the document type from various sources', () => {

            const PROPERTY_NAMES = [
                'page_type',
                'page_document_type',
                'adobe_docType',
                'adobe_doc_type',
                'ad_page_document_type',
                'page_mapped_doctype_for_pagename'];

            PROPERTY_NAMES.forEach(propertyName => {
                window.utag.data[propertyName] = 'any-' + propertyName;
                const result = s._utils.getDocType();
                expect(result).toBe('any-' + propertyName);
                delete window.utag.data[propertyName];
            });

        });
    });

    describe('isFirstPageView', () => {
        it('should return true if an global object with name cmp exists', () => {
            window.cmp = {};
            const result = s._utils.isFirstPageView();

            expect(result).toBe(true);
        });

        it('should return false if there is no global object with the name cmp', () => {
            const result = s._utils.isFirstPageView();

            expect(result).toBe(false);
        });
    });
});
