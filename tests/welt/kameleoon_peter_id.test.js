/**
 * Tests for kameleoon_peter_id.js
 * Tests setting Peter ID in Kameleoon custom data
 */

/* global utag */

const { setKameleoonPeterId } = require('../../extensions/welt/kameleoon_peter_id');

describe('Kameleoon Peter ID Extension', () => {
    let mockWindow;
    let mockUtag;
    let mockSetCustomData;

    beforeEach(() => {
        // Mock console.error
        global.console.error = jest.fn();

        // Setup mock Kameleoon API
        mockSetCustomData = jest.fn();
        mockWindow = {
            kameleoonQueue: [],
            Kameleoon: {
                API: {
                    Data: {
                        setCustomData: mockSetCustomData
                    }
                }
            }
        };

        // Setup mock utag
        mockUtag = {
            data: {
                peterId: 'peter-123-456'
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize kameleoonQueue if it does not exist', () => {
        const windowWithoutQueue = {
            Kameleoon: mockWindow.Kameleoon
        };
        const utag = { data: { peterId: 'peter-123' } };

        setKameleoonPeterId(windowWithoutQueue, utag);

        expect(windowWithoutQueue.kameleoonQueue).toBeDefined();
        expect(Array.isArray(windowWithoutQueue.kameleoonQueue)).toBe(true);
    });

    it('should push function to kameleoonQueue when peterId is valid', () => {
        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(1);
        expect(typeof mockWindow.kameleoonQueue[0]).toBe('function');
    });

    it('should call Kameleoon.API.Data.setCustomData with correct parameters when queue function executes', () => {
        setKameleoonPeterId(mockWindow, mockUtag);

        // Execute the queued function
        mockWindow.kameleoonQueue[0]();

        expect(mockSetCustomData).toHaveBeenCalledWith('peterId', 'peter-123-456');
        expect(mockSetCustomData).toHaveBeenCalledTimes(1);
    });

    it('should not push to queue when peterId is "false"', () => {
        mockUtag.data.peterId = 'false';

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not push to queue when peterId is undefined', () => {
        mockUtag.data.peterId = undefined;

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not push to queue when peterId is null', () => {
        mockUtag.data.peterId = null;

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not push to queue when peterId is empty string', () => {
        mockUtag.data.peterId = '';

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not push to queue when utag.data is undefined', () => {
        mockUtag.data = undefined;

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not push to queue when utag is undefined', () => {
        setKameleoonPeterId(mockWindow, undefined);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should handle existing kameleoonQueue without overwriting', () => {
        const existingFunc = jest.fn();
        mockWindow.kameleoonQueue = [existingFunc];

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(2);
        expect(mockWindow.kameleoonQueue[0]).toBe(existingFunc);
    });

    it('should handle errors gracefully and log to console', () => {
        // Create a window object that throws error on queue access
        const errorWindow = {
            get kameleoonQueue() {
                throw new Error('Queue access error');
            }
        };

        expect(() => setKameleoonPeterId(errorWindow, mockUtag)).not.toThrow();
        expect(console.error).toHaveBeenCalledWith(
            '[TEALIUM KAMELEOON PETER ID] Error:',
            expect.any(Error)
        );
    });

    it('should work with valid numeric peterId', () => {
        mockUtag.data.peterId = '123456789';

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(1);

        // Execute the queued function
        mockWindow.kameleoonQueue[0]();

        expect(mockSetCustomData).toHaveBeenCalledWith('peterId', '123456789');
    });

    it('should work with valid UUID-style peterId', () => {
        mockUtag.data.peterId = 'abc-123-def-456';

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(1);

        // Execute the queued function
        mockWindow.kameleoonQueue[0]();

        expect(mockSetCustomData).toHaveBeenCalledWith('peterId', 'abc-123-def-456');
    });

    it('should handle multiple calls to setKameleoonPeterId', () => {
        const utag1 = { data: { peterId: 'peter-123-456' } };
        const utag2 = { data: { peterId: 'peter-different-id' } };

        setKameleoonPeterId(mockWindow, utag1);
        setKameleoonPeterId(mockWindow, utag2);

        expect(mockWindow.kameleoonQueue.length).toBe(2);

        // Execute both queued functions
        mockWindow.kameleoonQueue[0]();
        mockWindow.kameleoonQueue[1]();

        expect(mockSetCustomData).toHaveBeenCalledTimes(2);
        expect(mockSetCustomData).toHaveBeenNthCalledWith(1, 'peterId', 'peter-123-456');
        expect(mockSetCustomData).toHaveBeenNthCalledWith(2, 'peterId', 'peter-different-id');
    });

    it('should handle case where utag.data exists but is empty object', () => {
        mockUtag.data = {};

        setKameleoonPeterId(mockWindow, mockUtag);

        expect(mockWindow.kameleoonQueue.length).toBe(0);
    });

    it('should not execute until function is called from queue', () => {
        setKameleoonPeterId(mockWindow, mockUtag);

        // Should not be called yet
        expect(mockSetCustomData).not.toHaveBeenCalled();

        // Execute the queued function
        mockWindow.kameleoonQueue[0]();

        // Now it should be called
        expect(mockSetCustomData).toHaveBeenCalledTimes(1);
    });
});
