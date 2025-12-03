const { getSegmentsWithTimeout, handlePianoSegments, pianoConfig } = require('../extensions/piano_segments');
const { createWindowMock } = require('./mocks/browserMocks');

describe('getSegmentsWithTimeout', () => {
    test('should resolve if callback is called with result', async () => {
        const windowLike = createWindowMock({
            candidates: ['test-id'],
            shortIds: ['abc']
        });

        const result = await getSegmentsWithTimeout('query-id', ['test-id'], 500, windowLike);
        expect(result).toEqual([{ id: 'test-id', shortId: 'abc' }]);
    });

    test('should timeout if callback never fires', async () => {
        const windowLike = createWindowMock({ simulateTimeout: true });

        await expect(
            getSegmentsWithTimeout('query-id', ['123'], 100, windowLike)
        ).rejects.toMatch('Timeout: getSegments did not respond in time');
    });

    test('should reject if cX is not defined', async () => {
        const windowLike = {}; // no cX
        await expect(
            getSegmentsWithTimeout('query-id', ['123'], 100, windowLike)
        ).rejects.toMatch('cX or cX.getSegments not available');
    });
});

describe('handlePianoSegments', () => {
    let windowMockWelt;
    let windowMockBILD;

    beforeEach(() => {
        pianoConfig.length = 0;
        pianoConfig.push({
            domainMatch: 'welt.de',
            persistedQueryId: 'query-id',
            candidateSegmentIds: ['test-id']
        });
        pianoConfig.push({
            domainMatch: 'bild.de',
            persistedQueryId: 'query-id',
            candidateSegmentIds: ['test-id']
        });

        windowMockWelt = createWindowMock({
            hostname: 'www.welt.de',
            candidates: ['test-id'],
            shortIds: ['abc']
        });
        windowMockBILD = createWindowMock({
            hostname: 'www.bild.de',
            candidates: ['test-id'],
            shortIds: ['abc']
        });
    });

    test('should populate utag.data and call gtag/fbq - WELT', async () => {
        await handlePianoSegments(windowMockWelt);

        expect(windowMockWelt.utag.data.piano_candidates_short).toBe('abc');
        expect(windowMockWelt.gtag).toHaveBeenCalledWith(
            'event',
            'piano_short',
            expect.objectContaining({ piano_short: '.abc.' })
        );
        expect(windowMockWelt.fbq).toHaveBeenCalledWith(
            'trackCustom',
            'piano_short',
            expect.objectContaining({ piano_short: 'abc' })
        );
    });

    test('should populate utag.data and call gtag/fbq - BILD', async () => {
        await handlePianoSegments(windowMockBILD);

        expect(windowMockBILD.utag.data.piano_candidates_short).toBe('abc');
        expect(windowMockBILD.gtag).toHaveBeenCalledWith(
            'event',
            'piano_short',
            expect.objectContaining({ piano_short: '.abc.' })
        );
        expect(windowMockBILD.fbq).toHaveBeenCalledWith(
            'trackCustom',
            'piano_short',
            expect.objectContaining({ piano_short: 'abc' })
        );
    });
});
