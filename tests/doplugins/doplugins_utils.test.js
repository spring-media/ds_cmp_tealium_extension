const {createWindowMock} = require('../mocks/browserMocks');
const sObject = require('../../extensions/doPlugins/doPlugins_global');

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

    describe('getAdobeObject', () => {
        const validAdobeObject = {
            version: 'any-version'
        };

        const invalidAdobeObject = {
            anyProperty: 'any-property'
        };

        it('should return the Adobe object when it has the name \'s\'', () => {
            window.s = validAdobeObject;
            const result = s._utils.getAdobeObject();
            expect(result).toBe(validAdobeObject);
        });

        it('should return an empty object when something else is assigned to the global variable with name \'s\'', () => {
            window.s = invalidAdobeObject;
            const result = s._utils.getAdobeObject();
            expect(result).toEqual({});
        });

        it('should return the Adobe object when it has the name \'cmp\'', () => {
            window.cmp = validAdobeObject;
            const result = s._utils.getAdobeObject();
            expect(result).toBe(validAdobeObject);
        });

        it('should return an empty object when something else is assigned to the global variable with name \'cmp\'', () => {
            window.cmp = invalidAdobeObject;
            const result = s._utils.getAdobeObject();
            expect(result).toEqual({});
        });

        it('should return an empty object when something else is assigned to the global variables \'s\' and \'cmp\' ', () => {
            window.s = invalidAdobeObject;
            window.cmp = invalidAdobeObject;
            const result = s._utils.getAdobeObject();
            expect(result).toEqual({});
        });
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

    describe('isAdWall', () => {
        it('should return false if none of the conditions are met', () => {
            const value = s._utils.isAdWall(s);

            expect(value).toBe(false);
        });

        it('should return true if pageName value is correct', () => {
            s.pageName = 'value_42925516';
            const value = s._utils.isAdWall(s);

            expect(value).toBe(true);

        });

        it('should return true if window.location value is correct', () => {
            window.location = 'value_unangemeldet-42925516';
            const value = s._utils.isAdWall(s);

            expect(value).toBe(true);

        });
    });


    describe('isArticlePage()', () => {
        let getDocTypeMock;

        beforeEach(() => {
            getDocTypeMock = jest.spyOn(s._utils, 'getDocType').mockImplementation();
        });

        it('should be false when page is NOT of type article', () => {
            getDocTypeMock.mockReturnValue('any-non-article-type');
            const result = s._utils.isArticlePage();
            expect(result).toBe(false);
        });

        it('should be true when page is of type article', () => {
            const ARTICLE_TYPES = [
                'article',
                'artikel',
                'live',
                'gallery',
                'video',
                'post',
                'media',
                'sportdaten',
                'live-sport',
                'channelizer-kaufberater',
                'scrubby'
            ];

            ARTICLE_TYPES.forEach(articleType => {
                getDocTypeMock.mockReturnValue(articleType);
                const result = s._utils.isArticlePage();
                expect(result).toBe(true);
            });
        });
    });

    describe('isFirstPageView', () => {
        it('should return true if cmp_event_status cmpuishown', () => {
            window.utag.data.cmp_event_status = 'cmpuishown';
            const result = s._utils.isFirstPageView();

            expect(result).toBe(true);
        });

        it('should return false if cmp_event_status is not cmpuishown', () => {
            window.utag.data.cmp_event_status = 'any-status';
            const result = s._utils.isFirstPageView();

            expect(result).toBe(false);
        });
    });


    describe('isValidURL', () => {
        it('should return true if passed string is URL', () => {
            urlString = 'https://www.bild.de';
            const result = s._utils.isValidURL(urlString);

            expect(result).toBe(true);
        });

        it('should return false if passed string is not URL', () => {
            urlString = 'www.bild.de';
            const result = s._utils.isValidURL(urlString);

            expect(result).toBe(false);
        });
    });

    describe('getReferrerFromLocationHash', () => {
        const anyValidUrl = 'https://any-valid-url.de';

        it('should return the referrer from the location hash', () => {
            window.location.hash = `###wt_ref=${anyValidUrl}`;
            const result = s._utils.getReferrerFromLocationHash();

            expect(result).toBe(anyValidUrl);
        });

        it('should ONLY return the referrer if location hash contains a valid URL', () => {
            const anyInvalidUrl = 'invalid-url';
            window.location.hash = `###wt_ref=${anyInvalidUrl}`;
            const result = s._utils.getReferrerFromLocationHash();

            expect(result).toBe('');
        });
    });

    describe('getReferrerFromGetParameter', () => {
        const anyValidUrl = 'https://any-valid-url.de';

        it('should return the referrer from the get parameter t_ref', () => {
            window.utag.data['qp.t_ref'] = anyValidUrl;
            const result = s._utils.getReferrerFromGetParameter();

            expect(result).toBe(anyValidUrl);
        });

        it('should ONLY return the referrer if the get parameter t_ref exists', () => {
            const anyInvalidUrl = 'invalid-url';
            window.location.search = `?t_ref=${anyInvalidUrl}`;
            const result = s._utils.getReferrerFromGetParameter();

            expect(result).toBe('');
        });
    });

    describe('getPageReloadStatus()', () => {

        beforeEach(() => {
            window.performance = {
                getEntriesByType: jest.fn().mockReturnValue([])
            };
        });

        it('should return any-type if window.performance is navigate', function () {
            window.performance.getEntriesByType.mockReturnValue([{ type: 'any-type' }]);

            const result = s._utils.getPageReloadStatus();
            expect(result).toBe('any-type');
        });

    });

});

