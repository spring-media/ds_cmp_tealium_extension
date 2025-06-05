const { getSegmentsWithTimeout } = require('../extensions/piano_segments');
const { handlePianoSegments, pianoConfig } = require('../extensions/piano_segments');
const { createWindowMock } = require('./mocks/browserMocks');

  function createPianoMock() {
    global.window = global.window || {};
  
    window.gtag = jest.fn();
    window.fbq = jest.fn();
    window.cX = {
      getSegments: jest.fn((params, _) => {
        setTimeout(() => {
          params.callback([{ id: '8n4danypt3nz', shortId: 'abc' }]);
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
        setTimeout(() => params.callback([{ id: '8n4danypt3nz', shortId: 'abc' }]), 100);
      },
    };

    const result = await getSegmentsWithTimeout('query-id', ['123'], 500, cXMock);
    expect(result).toEqual([{ id: '8n4danypt3nz', shortId: 'abc' }]);
  });

  test('should timeout if callback never fires', async () => {
    window.cX = {
        getSegments: jest.fn((_params, _options) => {
          // do nothing → callback wird NICHT aufgerufen
        }),
      };

    await expect(
      getSegmentsWithTimeout('query-id', ['123'], 100, window.cX)
    ).rejects.toMatch('Timeout: getSegments did not respond in time');
  });

  test('should reject if cX is not defined', async () => {
    window.cX = undefined 

    await expect(
      getSegmentsWithTimeout('query-id', ['123'], 100, window.cX)
    ).rejects.toMatch('cX or cX.getSegments not available');
  });
});


describe('handlePianoSegments', () => {
  let windowMock;

  beforeEach(() => {
    windowMock = createWindowMock();
    windowMock.location.hostname = 'test.welt.de';

    windowMock.gtag = jest.fn();
    windowMock.fbq = jest.fn();

    pianoConfig.length = 0;
    pianoConfig.push({
      domainMatch: 'welt.de',
      persistedQueryId: 'test-query-id',
      candidateSegmentIds: ['8n4danypt3nz'],
    });
  });

  test('should populate utag.data and call gtag/fbq', async () => {
    console.log('[TEST DEBUG test] windowMock.location.hostname:', windowMock.location.hostname);
    await handlePianoSegments(windowMock);
    
    expect(windowMock.utag.data.piano_candidates_short).toBe('abc');

    expect(windowMock.gtag).toHaveBeenCalledWith(
      'event',
      'piano_short',
      expect.objectContaining({
        piano_short: '.abc.',
      })
    );

    expect(windowMock.fbq).toHaveBeenCalledWith(
      'trackCustom',
      'piano_short',
      expect.objectContaining({
        piano_short: 'abc',
      })
    );
  });
});

/*describe('handlePianoSegments', () => {
    let windowMock;

    beforeEach(() => {
        piano.pianoConfig.length = 0; // leeren
        piano.pianoConfig.push({
          domainMatch: 'welt.de',
          persistedQueryId: 'test-id',
          candidateSegmentIds: ['8n4danypt3nz'],
        });
        
        const windowMock = createWindowMock();
        const pianoMock = createPianoMock();
        
        Object.assign(windowMock, pianoMock); 
        global.window = windowMock;
        windowMock.utag.data.piano_candidates_short = 'hello';
    });

    test('should populate utag.data and call gtag/fbq', async () => {
        window.location.hostname = 'test.welt.de';
     
      await handlePianoSegments(windowMock);
  
      expect(windowMock.utag.data.piano_candidates_short).toBe('abc');
      expect(windowMock.gtag).toHaveBeenCalledWith(
        'event',
        'piano_short',
        expect.objectContaining({
          piano_short: '.abc.',
        })
      );
      expect(windowMock.fbq).toHaveBeenCalledWith(
        'trackCustom',
        'piano_short',
        expect.objectContaining({
          piano_short: 'abc',
        })
      );
    });
  });
  */