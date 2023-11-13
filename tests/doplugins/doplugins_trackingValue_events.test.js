const sObject = require('../../extensions/doPlugins_global');

describe('_setTrackingValueEvents (URL Parameter like cid)', () => {
    let s;
    let addEventMock;
    let getTrackingValueMock;
    let isArticlePageMock;
    let isSocialTrackingParameterMock;

    beforeEach(() => {
        // Provide a fresh copy of the s-object for each test.
        s = {...sObject};
        addEventMock = jest.spyOn(s._eventsObj, 'addEvent').mockImplementation();
        getTrackingValueMock = jest.spyOn(s._articleViewTypeObj, 'getTrackingValue').mockImplementation();
        isArticlePageMock = jest.spyOn(s._utils, 'isArticlePage').mockImplementation().mockReturnValue(true);
        isSocialTrackingParameterMock = jest.spyOn(s._articleViewTypeObj, 'isTrackingValueOrganicSocial').mockImplementation();
        
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should run only on article pages', function () {
        isArticlePageMock.mockReturnValue(false);

        s._setTrackingValueEvents(s);
        expect(getTrackingValueMock).not.toBeCalled();
    });
    
    //Telegram
    it('should set event225 if the trackingValue contains telegram', () => {
        getTrackingValueMock.mockReturnValue('telegram');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event225');
    });
    it('should not set event225 if the trackingValue does not contain telegram', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event225');
    });

    //Instagram
    it('should set event53 if the trackingValue contains instagram', () => {
        getTrackingValueMock.mockReturnValue('instagram');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event53,event224');
    });
    it('should not set event53 if the trackingValue does not contain instagram', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event53,event224');
    });   

    //Youtube
    it('should set event50 if the trackingValue contains youtube', () => {
        getTrackingValueMock.mockReturnValue('youtube');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event50,event223');
    });
    it('should not set event50 if the trackingValue does not contain youtube', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event50,event223');
    });     
 
    //Twitter
    it('should set event50 if the trackingValue contains twitter', () => {
        getTrackingValueMock.mockReturnValue('twitter');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event51,event222');
    });
    it('should not set event50 if the trackingValue does not contain twitter', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event51,event222');
    });         
    //Facebook
    it('should set event52 if the trackingValue contains facebook', () => {
        getTrackingValueMock.mockReturnValue('facebook');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event52,event221');
    });
    it('should not set event52 if the trackingValue does not contain facebook', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event52');
    });     

    //Linkedin
    it('should set event52 if the trackingValue contains linkedin', () => {
        getTrackingValueMock.mockReturnValue('linkedin');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event227');
    });
    it('should not set event52 if the trackingValue does not contain linkedin', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event227');
    });    

    //Xing
    it('should set event if the trackingValue contains xing', () => {
        getTrackingValueMock.mockReturnValue('xing');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event228');
    });
    it('should not set event52 if the trackingValue does not contain xing', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event228');
    });           

    //Pinterest
    it('should set event if the trackingValue contains pinterest', () => {
        getTrackingValueMock.mockReturnValue('pinterest');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event229');
    });
    it('should not set event52 if the trackingValue does not contain pinterest', () => {
        getTrackingValueMock.mockReturnValue('any-trackingValue');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event229');
    });    
    //other organic social 
    it('should set event226 if the trackingValue start with social ', () => {
        getTrackingValueMock.mockReturnValue('social');
        isSocialTrackingParameterMock.mockReturnValue(true);

        s._setTrackingValueEvents(s);
        expect(addEventMock).toHaveBeenCalledWith('event226');
    });      
 
    it('should not set event226 if the trackingValue start with social_paid ', () => {
        getTrackingValueMock.mockReturnValue('social_paid');
        isSocialTrackingParameterMock.mockReturnValue(false);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event226');
    }); 

    it('should not set event226 if the trackingValue start with socialmediapaid ', () => {
        getTrackingValueMock.mockReturnValue('socialmediapaid');
        isSocialTrackingParameterMock.mockReturnValue(false);

        s._setTrackingValueEvents(s);
        expect(addEventMock).not.toHaveBeenCalledWith('event226');
    }); 

});