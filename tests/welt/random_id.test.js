/**
 * Tests for random_id.js
 * Tests random ID generation and assignment to utag.data
 */

/* global utag */

const {
    generateRandomId,
    setGlobalEventId,
    assignRandomIdToUtagData,
    initRandomId
} = require('../../extensions/welt/random_id');

describe('Random ID Generator', () => {
    beforeEach(() => {
        global.utag = { data: {} };
        global.window = { global_event_id: undefined };
        global.console.log = jest.fn();
    });

    afterEach(() => {
        delete global.utag;
        delete global.window;
        jest.restoreAllMocks();
    });

    describe('generateRandomId', () => {
        it('should generate a random ID string', () => {
            const id = generateRandomId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });

        it('should generate different IDs on subsequent calls', () => {
            const id1 = generateRandomId();
            const id2 = generateRandomId();
            expect(id1).not.toBe(id2);
        });

        it('should concatenate three random numbers', () => {
            const id = generateRandomId();
            // The ID should contain numeric characters
            expect(id).toMatch(/[\d.e+-]+/);
        });

        it('should generate ID with expected format (numbers concatenated with empty strings)', () => {
            // Mock Math.random to return predictable values
            const mockValues = [0.1, 0.2, 0.3];
            let callIndex = 0;
            const mockRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
                return mockValues[callIndex++];
            });

            const id = generateRandomId();

            // Verify that Math.random was called 3 times
            expect(mockRandom).toHaveBeenCalledTimes(3);

            // Verify the ID is a string and contains numeric content
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
            expect(id).toMatch(/^[\d.e+-]+$/);

            mockRandom.mockRestore();
        });
    });

    describe('setGlobalEventId', () => {
        it('should set global_event_id on window object', () => {
            const testId = 'test-random-id-123';
            setGlobalEventId(testId);
            expect(window.global_event_id).toBe(testId);
        });

        it('should handle numeric ID values', () => {
            const numericId = '123456789.987654321';
            setGlobalEventId(numericId);
            expect(window.global_event_id).toBe(numericId);
        });

        it('should overwrite existing global_event_id', () => {
            window.global_event_id = 'old-id';
            const newId = 'new-id';
            setGlobalEventId(newId);
            expect(window.global_event_id).toBe(newId);
        });

        it('should not throw error when window is undefined', () => {
            delete global.window;
            expect(() => setGlobalEventId('test-id')).not.toThrow();
        });
    });

    describe('assignRandomIdToUtagData', () => {
        it('should assign ID to global_event_id for WON frontpage', () => {
            utag.data.page_sectionName = 'WON frontpage';
            const testId = 'test-id-won';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBe(testId);
        });

        it('should assign ID to global_event_id_article for article page type', () => {
            utag.data.page_type = 'article';
            const testId = 'test-id-article';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id_article).toBe(testId);
        });

        it('should not assign ID if page_sectionName is not WON frontpage', () => {
            utag.data.page_sectionName = 'Other Section';
            const testId = 'test-id';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBeUndefined();
            expect(utag.data.global_event_id_article).toBeUndefined();
        });

        it('should not assign ID if page_type is not article', () => {
            utag.data.page_type = 'homepage';
            const testId = 'test-id';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBeUndefined();
            expect(utag.data.global_event_id_article).toBeUndefined();
        });

        it('should prioritize WON frontpage over article if both conditions exist', () => {
            utag.data.page_sectionName = 'WON frontpage';
            utag.data.page_type = 'article';
            const testId = 'test-id-both';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBe(testId);
            expect(utag.data.global_event_id_article).toBeUndefined();
        });

        it('should handle undefined utag gracefully', () => {
            delete global.utag;
            expect(() => assignRandomIdToUtagData('test-id')).not.toThrow();
        });

        it('should handle utag without data property', () => {
            global.utag = {};
            expect(() => assignRandomIdToUtagData('test-id')).not.toThrow();
        });

        it('should not assign ID when neither condition is met', () => {
            utag.data.page_sectionName = 'Some Other Section';
            utag.data.page_type = 'homepage';
            const testId = 'test-id';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBeUndefined();
            expect(utag.data.global_event_id_article).toBeUndefined();
        });

        it('should handle empty utag.data', () => {
            const testId = 'test-id';
            assignRandomIdToUtagData(testId);
            expect(utag.data.global_event_id).toBeUndefined();
            expect(utag.data.global_event_id_article).toBeUndefined();
        });
    });

    describe('initRandomId', () => {
        it('should generate and assign random ID for WON frontpage', () => {
            utag.data.page_sectionName = 'WON frontpage';
            initRandomId();

            expect(window.global_event_id).toBeDefined();
            expect(utag.data.global_event_id).toBeDefined();
            expect(utag.data.global_event_id).toBe(window.global_event_id);
            expect(console.log).toHaveBeenCalledWith(window.global_event_id);
        });

        it('should generate and assign random ID for article page', () => {
            utag.data.page_type = 'article';
            initRandomId();

            expect(window.global_event_id).toBeDefined();
            expect(utag.data.global_event_id_article).toBeDefined();
            expect(utag.data.global_event_id_article).toBe(window.global_event_id);
            expect(console.log).toHaveBeenCalledWith(window.global_event_id);
        });

        it('should log the generated ID', () => {
            utag.data.page_sectionName = 'WON frontpage';
            initRandomId();

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(typeof console.log.mock.calls[0][0]).toBe('string');
        });

        it('should generate unique IDs on multiple calls', () => {
            utag.data.page_sectionName = 'WON frontpage';

            initRandomId();
            const firstId = utag.data.global_event_id;

            initRandomId();
            const secondId = utag.data.global_event_id;

            expect(firstId).not.toBe(secondId);
        });

        it('should work when no page conditions are met', () => {
            expect(() => initRandomId()).not.toThrow();
            expect(window.global_event_id).toBeDefined();
            expect(console.log).toHaveBeenCalled();
        });

        it('should handle complete workflow for WON frontpage', () => {
            utag.data = {
                page_sectionName: 'WON frontpage',
                other_data: 'preserved'
            };

            initRandomId();

            expect(utag.data.global_event_id).toBeDefined();
            expect(utag.data.other_data).toBe('preserved');
            expect(typeof utag.data.global_event_id).toBe('string');
        });

        it('should handle complete workflow for article page', () => {
            utag.data = {
                page_type: 'article',
                other_data: 'preserved'
            };

            initRandomId();

            expect(utag.data.global_event_id_article).toBeDefined();
            expect(utag.data.other_data).toBe('preserved');
            expect(typeof utag.data.global_event_id_article).toBe('string');
        });
    });

    describe('Integration tests', () => {
        it('should work end-to-end for WON frontpage scenario', () => {
            global.utag = {
                data: {
                    page_sectionName: 'WON frontpage'
                }
            };

            initRandomId();

            expect(window.global_event_id).toBeDefined();
            expect(utag.data.global_event_id).toBeDefined();
            expect(utag.data.global_event_id).toBe(window.global_event_id);
        });

        it('should work end-to-end for article scenario', () => {
            global.utag = {
                data: {
                    page_type: 'article'
                }
            };

            initRandomId();

            expect(window.global_event_id).toBeDefined();
            expect(utag.data.global_event_id_article).toBeDefined();
            expect(utag.data.global_event_id_article).toBe(window.global_event_id);
        });

        it('should generate valid random IDs consistently', () => {
            utag.data.page_sectionName = 'WON frontpage';

            for (let i = 0; i < 10; i++) {
                initRandomId();
                expect(utag.data.global_event_id).toBeDefined();
                expect(typeof utag.data.global_event_id).toBe('string');
                expect(utag.data.global_event_id.length).toBeGreaterThan(0);
            }
        });
    });
});
