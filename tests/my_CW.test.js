const { getMonthDay } = require('../extensions/my_CW');
const myCW = require('../extensions/my_CW');
const { createWindowMock } = require('./mocks/browserMocks');

describe('CW time format: CW {week} {year} {first DOW} - {last DOW}', () => {

    let cw;
    let leadingZeroMock;
    cw = { ...myCW };

    beforeEach(() => {
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get')
            .mockImplementation(() => (windowMock));
    });

    afterEach(() => {
        jest.restoreAllMocks();

    });

    describe('leadingZero', () => {

        it('should add a 0 before one-digit numbers', () => {
            const date1 = 3;
            const date2 = 13;

            const result1 = cw.leadingZero(date1);
            const result2 = cw.leadingZero(date2);

            expect(result1).toBe('03');
            expect(result2).toBe('13');
        });
    });

    describe('getWeek', () => {

        it('should return correct week of the year', () => {
            const mockDate1 = new Date(2022, 0, 1);
            leadingZeroMock = jest.spyOn(cw, 'leadingZero');
            expect(cw.getWeek(mockDate1)).toBe('01');
            expect(leadingZeroMock).toHaveBeenCalledWith(1);
        });

        it('should have matching return value with leadingZero function', () => {
            const mockDate1 = new Date(2022, 0, 1);
            const anyValue = 'any-value';

            leadingZeroMock = jest.spyOn(cw, 'leadingZero').mockImplementation();
            leadingZeroMock.mockReturnValue(anyValue);

            expect(cw.getWeek(mockDate1)).toBe(anyValue);
        });
    });

    describe('getMonthDay', () => {

        it('should return mm.dd from a given date', () => {
            const mockDate = new Date(2022, 0, 1);
            leadingZeroMock = jest.spyOn(cw, 'leadingZero');
            expect(cw.getMonthDay(mockDate)).toBe('01.01');
            expect(leadingZeroMock).toHaveBeenNthCalledWith(1, 1);
            expect(leadingZeroMock).toHaveBeenNthCalledWith(2, 1);
        });

        it('should return concatenated return values of leadingZero function', () => {
            const mockDate = new Date(2022, 0, 1);
            const anyValue = 'any-value';

            leadingZeroMock = jest.spyOn(cw, 'leadingZero').mockImplementation();
            leadingZeroMock.mockReturnValue(anyValue);
            expect(cw.getMonthDay(mockDate)).toBe(anyValue + '.' + anyValue);
        });
    });

    describe('getDayOfWeek', () => {

        it('should return the date of first DOW based on given date', () => {
            const mockDate = new Date(2022, 0, 1);
            const expectedDate = new Date(2021, 11, 27);

            expect(cw.getDayOfWeek(mockDate, 1).toString()).toBe(expectedDate.toString());

        });

    });



    describe('getCW', () => {

        it('should return the CW date format', () => {
            const mockDate = new Date(2022, 0, 1);
            const mockDate1 = new Date(2021, 11, 27);
            const mockDate2 = new Date(2022, 0, 2);

            jest.spyOn(global, 'Date').mockImplementation().mockReturnValue(mockDate);
            getDayOfWeekMock = jest.spyOn(cw, 'getDayOfWeek').mockImplementation();
            getDayOfWeekMock.mockReturnValueOnce(mockDate1);
            getDayOfWeekMock.mockReturnValueOnce(mockDate2);

            getWeekMock = jest.spyOn(cw, 'getWeek');
            getMonthDayMock = jest.spyOn(cw, 'getMonthDay');

            expect(cw.getCW(mockDate)).toBe('CW 01 2021.12.27 - 01.02.');

            expect(getWeekMock).toHaveBeenCalledWith(mockDate);
            expect(getMonthDayMock).toHaveBeenNthCalledWith(1, mockDate1);
            expect(getMonthDayMock).toHaveBeenNthCalledWith(2, mockDate2);

        });
    });

    describe('init', () => {

        it('should set window.utag.data.myCW to the result of _myCW.getCW()', () => {
            const returnValue = 'any-value';
            getCWMock = jest.spyOn(cw, 'getCW').mockImplementation().mockReturnValue(returnValue);
            cw.init();

            expect(window.utag.data.myCW).toBe(returnValue);

        });
    });
});
