const myCW = require('../extensions/my_CW');
const { createWindowMock } = require('./mocks/browserMocks');

describe('CW time format: CW {week} {year} {first DOW} - {last DOW}', () => {
    let leadingZeroMock;
    const cw = { ...myCW };

    beforeEach(() => {
        const windowMock = createWindowMock();
        jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock);
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
            const getDayOfWeekMock = jest.spyOn(cw, 'getDayOfWeek').mockImplementation();
            getDayOfWeekMock.mockReturnValueOnce(mockDate1);
            getDayOfWeekMock.mockReturnValueOnce(mockDate2);

            const getWeekMock = jest.spyOn(cw, 'getWeek');
            const getMonthDayMock = jest.spyOn(cw, 'getMonthDay');

            expect(cw.getCW(mockDate)).toBe('CW 01 2021.12.27 - 01.02.');

            expect(getWeekMock).toHaveBeenCalledWith(mockDate);
            expect(getMonthDayMock).toHaveBeenNthCalledWith(1, mockDate1);
            expect(getMonthDayMock).toHaveBeenNthCalledWith(2, mockDate2);
        });
    });

    describe('init', () => {
        it('should set window.utag.data.myCW to the result of _myCW.getCW()', () => {
            const returnValue = 'any-value';
            jest.spyOn(cw, 'getCW').mockImplementation().mockReturnValue(returnValue);
            cw.init();

            expect(window.utag.data.myCW).toBe(returnValue);
        });

        it('should not set myCW when window.utag is undefined', () => {
            // Save original
            const originalWindow = global.window;
            
            // Set up test scenario
            delete global.window;
            global.window = { utag: undefined };
            
            // Should not throw error
            expect(() => cw.init()).not.toThrow();
            
            // Restore
            global.window = originalWindow;
        });

        it('should not set myCW when window.utag.data is undefined', () => {
            // Save original
            const originalWindow = global.window;
            
            // Set up test scenario
            delete global.window;
            global.window = { utag: {} };
            
            // Should not throw error
            expect(() => cw.init()).not.toThrow();
            
            // Restore
            global.window = originalWindow;
        });

        it('should handle when window.utag exists but data is null', () => {
            // Save original
            const originalWindow = global.window;
            
            // Set up test scenario
            delete global.window;
            global.window = { utag: { data: null } };
            
            // Should not throw error
            expect(() => cw.init()).not.toThrow();
            
            // Restore
            global.window = originalWindow;
        });
    });

    describe('Edge cases and additional coverage', () => {
        it('leadingZero should handle zero', () => {
            expect(cw.leadingZero(0)).toBe('00');
        });

        it('leadingZero should handle double-digit numbers at boundary', () => {
            expect(cw.leadingZero(9)).toBe('09');
            expect(cw.leadingZero(10)).toBe('10');
        });

        it('getDayOfWeek should handle different days of the week', () => {
            const mockDate = new Date(2022, 0, 5); // Wednesday
            
            const sunday = cw.getDayOfWeek(mockDate, 0);
            const monday = cw.getDayOfWeek(mockDate, 1);
            const saturday = cw.getDayOfWeek(mockDate, 6);
            
            expect(sunday.getDay()).toBe(0);
            expect(monday.getDay()).toBe(1);
            expect(saturday.getDay()).toBe(6);
        });

        it('getWeek should handle different weeks of the year', () => {
            const midYear = new Date(2022, 5, 15); // Mid-year
            const endYear = new Date(2022, 11, 31); // End of year
            
            const weekMid = cw.getWeek(midYear);
            const weekEnd = cw.getWeek(endYear);
            
            expect(weekMid).toMatch(/^\d{2}$/);
            expect(weekEnd).toMatch(/^\d{2}$/);
            expect(parseInt(weekEnd)).toBeGreaterThan(parseInt(weekMid));
        });

        it('getMonthDay should handle different months', () => {
            const jan = new Date(2022, 0, 15);
            const dec = new Date(2022, 11, 25);
            
            expect(cw.getMonthDay(jan)).toBe('01.15');
            expect(cw.getMonthDay(dec)).toBe('12.25');
        });

        it('getCW should handle year boundary (week spans two years)', () => {
            const mockDate = new Date(2022, 0, 1); // Saturday, Jan 1, 2022
            
            const result = cw.getCW();
            
            expect(result).toMatch(/^CW \d{2} \d{4}\.\d{2}\.\d{2} - \d{2}\.\d{2}\.$/);
        });

        it('getDayOfWeek should correctly calculate for edge case dates', () => {
            const leapYearDate = new Date(2020, 1, 29); // Feb 29, 2020 (leap year)
            const result = cw.getDayOfWeek(leapYearDate, 1);
            
            expect(result.getDay()).toBe(1); // Should be Monday
        });
    });
});
