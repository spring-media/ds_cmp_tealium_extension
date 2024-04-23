const sObject = require('../../extensions/doPlugins/doPlugins_bild_apps');

describe('_eventsObj', () => {
    let s;
    beforeEach(() => {
        // Provide a fresh copy of the s-object for each test.
        s = {...sObject};
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('addEvent(event)', () => {
        it('should push passed in event string to internal events array', () => {
            const event1 = 'event-1';
            const event2 = 'event-2';

            expect(s._eventsObj.events).toEqual([]);

            s._eventsObj.addEvent(event1);
            expect(s._eventsObj.events).toEqual([event1]);

            s._eventsObj.addEvent(event2);
            expect(s._eventsObj.events).toEqual([event1, event2]);
        });
    });

    describe('setEventsProperty(s)', () => {
        let aplMock;
        beforeEach(() => {
            aplMock = jest.spyOn(s, 'apl').mockImplementation();

        });

        it('should set s.events property by calling s.apl() plugin', function () {
            const anyEvent = 'any-event';
            s._eventsObj.events = [anyEvent];
            aplMock.mockReturnValue(anyEvent);

            s._eventsObj.setEventsProperty(s);
            expect(aplMock).toHaveBeenCalledWith('', anyEvent);
            expect(s.events).toBe(anyEvent);
        });

        it('should create a comma separated list of events', function () {
            const eventsArray = ['event-1', 'event-2', 'event-3'];
            const expectedEventsList = 'event-1,event-2,event-3';
            s._eventsObj.events = eventsArray;
            s._eventsObj.setEventsProperty(s);
            expect(aplMock).toHaveBeenCalledWith('', expectedEventsList);
        });

        it('should clear the internal events array afterwards', function () {
            const anyEvent = 'any-event';
            s._eventsObj.events = [anyEvent];
            s._eventsObj.setEventsProperty(s);
            expect(s._eventsObj.events).toEqual([]);
        });
    });
});