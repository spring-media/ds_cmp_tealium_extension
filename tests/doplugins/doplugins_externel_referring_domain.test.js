const sObject = require('../../extensions/doPlugins/doPlugins_global');
const { createWindowMock } = require('../mocks/browserMocks');

describe('External referring domains', () => {
    let s;
    let addEventMock;
    let getReferrerMock;

    beforeEach(() => {
        // Create a fresh window mock for each test.
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));
        // Provide a fresh copy of the s-object for each test.
        s = { ...sObject };
        addEventMock = jest.spyOn(s._eventsObj, 'addEvent').mockImplementation();
        getReferrerMock = jest.spyOn(s._utils, 'getReferrer').mockImplementation();
        jest.spyOn(s._utils, 'isArticlePage').mockImplementation().mockReturnValue(true);
        jest.spyOn(s._articleViewTypeObj, 'isOtherTrackingValue').mockImplementation().mockReturnValue(false);
        jest.spyOn(s._articleViewTypeObj, 'isFromInternal').mockImplementation().mockReturnValue(false);

    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set event49 and it should not set event213 if the referring domain is www.google.de', () => {
        getReferrerMock.mockReturnValue('www.google.com');

        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event49,event212');
        expect(addEventMock).not.toHaveBeenCalledWith('event213');
    });

    it('should set event213 and should not set event49,event212 if the referring domain is www.google.com/', () => {
        getReferrerMock.mockReturnValue('www.google.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event49,event212');
        expect(addEventMock).toHaveBeenCalledWith('event213');
    });

    it('should set event49,event212 and it should not set event213 if the referring domain includes googlequicksearch/', () => {
        getReferrerMock.mockReturnValue('googlequicksearchbox/test');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event49,event212');
        expect(addEventMock).not.toHaveBeenCalledWith('event213');
    });

    it('should set event213 and it should not set event49,event212 if the referring domain ends googlequicksearch', () => {
        getReferrerMock.mockReturnValue('googlequicksearchbox');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event213');
        expect(addEventMock).not.toHaveBeenCalledWith('event49,event212');
    });

    it('should set event213 if the referring domain is from search engine bing.com', () => {
        getReferrerMock.mockReturnValue('bing.com');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event213');
    });

    it('should set event213 if the referring domain is from search engine qwant.com', () => {
        getReferrerMock.mockReturnValue('qwant.com');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event213');
    });

    it('should set event48 if the referring domain includes news.google', () => {
        getReferrerMock.mockReturnValue('news.google/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event48,event211');
    });

    it('should set event53 if the referring domain includes instagram.com', () => {
        getReferrerMock.mockReturnValue('instagram.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event53,event224');
    });

    it('should set event53 if the referring domain includes linkin.bio', () => {
        getReferrerMock.mockReturnValue('linkin.bio');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event53,event224');
    });

    it('should set event50 if the referring domain includes youtube.com', () => {
        getReferrerMock.mockReturnValue('youtube.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event50,event223');
    });

    it('should set event51 if the referring domain includes twitter.com', () => {
        getReferrerMock.mockReturnValue('twitter.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event51,event222');
    });

    it('should set event51 if the referring domain includes android-app://com.twitter.android', () => {
        getReferrerMock.mockReturnValue('android-app://com.twitter.android/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event51,event222');
    });

    it('should set event51 if the referring domain includes t.co/', () => {
        getReferrerMock.mockReturnValue('https://t.co/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event51,event222');
    });

    it('should NOT set event51 if the referring domain includes getpocket.com (that could match t.co)', () => {
        getReferrerMock.mockReturnValue('getpocket.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event51,event222');
    });

    it('should set event52 if the referring domain includes facebook.com', () => {
        getReferrerMock.mockReturnValue('facebook.com/');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event52,event221');
    });

    it('should set event225 if the referring domain includes telegram.org', () => {
        getReferrerMock.mockReturnValue('telegram.org');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event225');
    });

    it('should set event225 if the referring domain includes org.telegram', () => {
        getReferrerMock.mockReturnValue('org.telegram');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event225');
    });

    it('should set event227 if the referring domain includes org.linkedin', () => {
        getReferrerMock.mockReturnValue('org.linkedin');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event227');
    });

    it('should set event227 if the referring domain includes linkedin.com', () => {
        getReferrerMock.mockReturnValue('linkedin.com');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event227');
    });

    it('should set event227 if the referring domain includes xing.com', () => {
        getReferrerMock.mockReturnValue('xing.com');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event228');
    });

    it('should set event227 if the referring domain includes pinterest.com', () => {
        getReferrerMock.mockReturnValue('pinterest.com');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event229');
    });

    it('should set event226 if the referring domain includes a social referrer like .threads.net', () => {
        getReferrerMock.mockReturnValue('.threads.net');
        s._setExternalReferringDomainEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event226');
    });
});
