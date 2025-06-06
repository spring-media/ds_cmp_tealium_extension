function localStorageMock() {
    let store = {};
  
    return {
      getItem: jest.fn().mockImplementation((key) => {
        return store[key] || null;
      }),
      setItem: jest.fn().mockImplementation((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn().mockImplementation(() => {
        store = {};
      }),
    };
  }
  
  /**
   * Erstellt ein konfigurierbares window-Mock-Objekt für Tests.
   * @param {Object} options
   * @param {string} options.hostname - Der Hostname (z. B. 'www.welt.de')
   * @param {string[]} options.candidates - Kandidaten-Segment-IDs (z. B. ['8n4...'])
   * @param {string[]} options.shortIds - Optionale shortIds für jedes Segment
   * @param {boolean} options.simulateTimeout - Wenn true, wird getSegments nie aufgerufen
   * @returns {object} Mock für window
   */
  function createWindowMock({
    hostname = 'localhost',
    candidates = [],
    shortIds = [],
    simulateTimeout = false,
  } = {}) {
    return {
      location: {
        hostname,
        hash: '',
        search: '',
        pathname: '',
      },
      document: {
        referrer: '',
        domain: '',
        location: {
          hostname,
          pathname: '',
        },
      },
      navigator: {
        userAgent: '',
      },
      screen: {
        width: '',
        height: '',
      },
      utag: {
        data: {},
        loader: {},
      },
      gtag: jest.fn(),
      fbq: jest.fn(),
      cX: {
        getSegments: jest.fn((params, _) => {
          if (simulateTimeout) return;
          setTimeout(() => {
            const data = candidates.map((id, i) => ({
              id,
              shortId: shortIds[i] || `short-${id}`,
            }));
            params.callback(data);
          }, 10);
        }),
      },
    };
  }
  
  module.exports = {
    localStorageMock: localStorageMock(),
    createWindowMock,
  };
  

/*

//browserMocks.js
function localStorageMock() {
    let store = {};

    return {
        getItem: jest.fn().mockImplementation(key => {
            return store[key] || null;
        }),
        setItem: jest.fn().mockImplementation((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn().mockImplementation(() => {
            store = {};
        })
    };
}

function createWindowMock() {
    return {
        document: {
            referrer: '',
            domain: '',
            location: {
                pathname: '',
                hostname: ''
            }
        },
        navigator: {
            userAgent: ''
        },
        screen: {
            width: '',
            height: ''
        },
        utag: {
            data: {},
            loader: {},
        },
        location: {
            hash: '',
            search: '',
            pathname: '',
            hostname: ''
        },
        candidates : [],
        shortIds : [],
        simulateTimeout : false,
        gtag: jest.fn(),
        fbq: jest.fn(),
        cX: {
        getSegments: jest.fn((params, _) => {
            if (simulateTimeout) return;
            setTimeout(() => {
            const data = candidates.map((id, i) => ({
                id,
                shortId: shortIds[i] || `short-${id}`,
            }));
            params.callback(data);
            }, 10);
        }),
        },
    };
}

module.exports = {
    localStorageMock: localStorageMock(),
    createWindowMock: createWindowMock
};
*/