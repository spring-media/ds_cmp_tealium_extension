const { getSegmentsWithTimeout, handlePianoSegments, pianoConfig } = require('../extensions/piano_segments');
const { createWindowMock } = require('./mocks/browserMocks');

describe('getSegmentsWithTimeout', () => {
  test('should resolve if callback is called with result', async () => {
    const windowLike = createWindowMock({
      candidates: ['test-id'],
      shortIds: ['abc'],
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
  let windowMock;

  beforeEach(() => {
    pianoConfig.length = 0;
    pianoConfig.push({
      domainMatch: 'welt.de',
      persistedQueryId: 'query-id',
      candidateSegmentIds: ['test-id'],
    });
    pianoConfig.push({
      domainMatch: 'bild.de',
      persistedQueryId: 'query-id',
      candidateSegmentIds: ['test-id'],
    });

    windowMockWelt = createWindowMock({
      hostname: 'www.welt.de',
      candidates: ['test-id'],
      shortIds: ['abc'],
    });
    windowMockBILD = createWindowMock({
      hostname: 'www.bild.de',
      candidates: ['test-id'],
      shortIds: ['abc'],
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



/*const { getSegmentsWithTimeout } = require('../extensions/piano_segments');
const { handlePianoSegments, pianoConfig } = require('../extensions/piano_segments');
const { createWindowMock } = require('./mocks/browserMocks');

  function createPianoMock() {
    windowLike = global.window || {};
    windowLike.gtag = jest.fn();
    windowLike.fbq = jest.fn();
    windowLike.cX = {
      getSegments: jest.fn((params, _) => {
        setTimeout(() => {
          params.callback([{ id: 'any-id', shortId: 'any-shortid' }]);
        }, 10);
      }),
    };
  }

describe('getSegmentsWithTimeout', () => {
    beforeEach(() => {
        
        const windowMock = createWindowMock();
        const pianoMock = createPianoMock();
        
        Object.assign(windowMock, pianoMock); 
    });

    afterEach(() => {
        jest.restoreAllMocks();

    });

  test('should resolve if callback is called with result', async () => {
    const cXMock = {
      getSegments: (params, _) => {
        setTimeout(() => params.callback([{ id: 'any-id', shortId: 'any-shortid' }]), 100);
      },
    };

    const result = await getSegmentsWithTimeout('query-id', ['123'], 500, cXMock);
    expect(result).toEqual([{ id: 'any-id', shortId: 'any-shortid' }]);
  });

  test('should timeout if callback never fires', async () => {
    windowLike.cX = {
        getSegments: jest.fn((_params, _options) => {
          // do nothing → callback wird NICHT aufgerufen
        }),
      };

    await expect(
      getSegmentsWithTimeout('query-id', ['123'], 100, windowLike.cX)
    ).rejects.toMatch('Timeout: getSegments did not respond in time');
  });

  test('should reject if cX is not defined', async () => {
    windowLike.cX = undefined 

    await expect(
      getSegmentsWithTimeout('query-id', ['123'], 100, windowLike.cX)
    ).rejects.toMatch('cX or cX.getSegments not available');
  });
});


describe('handlePianoSegments WELT', () => {
  let windowMock;

  beforeEach(() => {
    windowMock = createWindowMock();
    windowMock.location.hostname = 'www.welt.de';
    windowMock.gtag = jest.fn();
    windowMock.fbq = jest.fn();
    windowMock.cX = {
      getSegments: jest.fn((params, _) => {
        setTimeout(() => {
          params.callback([{ id: '8n4danypt3nz', shortId: 'abc' }]);
        }, 10);
      }),
    };

    pianoConfig.length = 0;
    pianoConfig.push({
      domainMatch: 'welt.de',
      persistedQueryId: 'test-query-id',
      candidateSegmentIds: ['8n4danypt3nz'],
    });
  });

  test('should populate utag.data and call gtag/fbq', async () => {

    await handlePianoSegments(windowMock);
    console.log('[TEST DEBUG] hostname:', windowLike.location.hostname);
    console.log('[TEST DEBUG] config:', config);
    console.log('[TEST DEBUG] res:', res);
    console.log('[TEST DEBUG] filtered:', filtered);
    expect(windowMock.utag.data.piano_candidates_short).toBe('abc');
    expect(windowMock.gtag).toHaveBeenCalledWith(
      'event',
      'piano_short',
      expect.objectContaining({ piano_short: '.abc.' })
    );
    expect(windowMock.fbq).toHaveBeenCalledWith(
      'trackCustom',
      'piano_short',
      expect.objectContaining({ piano_short: 'abc' })
    );
  });
});
*/