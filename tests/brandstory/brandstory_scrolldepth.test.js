const { getCookie, getDomainTagValue } = require('../../extensions/brandstory/brandstory_scrolldepth');

beforeEach(() => {
  // reset document.cookie before each test
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
});

describe('getCookie', () => {
  it('should return the correct value when the cookie exists', () => {
    document.cookie = 's_ppv=xyz,50';
    expect(getCookie('s_ppv')).toBe('50');
  });

  it('should return an empty string if the cookie does not exist', () => {
    document.cookie = 'another_cookie=abc,123';
    expect(getCookie('s_ppv')).toBe('');
  });

  it('should decode the cookie value correctly', () => {
    document.cookie = 's_ppv=abc%20def,75';
    expect(getCookie('s_ppv')).toBe('75');
  });
});

describe('getDomainTagValue', () => {
  it('should return [206] for "welt.de" domain', () => {
    expect(getDomainTagValue('www.welt.de')).toEqual([206]);
  });

  it('should return [10] for "bild.de" domain', () => {
    expect(getDomainTagValue('www.bild.de')).toEqual([10]);
  });

  it('should return [31] for "fitbook.de" domain', () => {
    expect(getDomainTagValue('www.fitbook.de')).toEqual([31]);
  });

  it('should return [31] for "magazine-fitbook.com" domain', () => {
    expect(getDomainTagValue('www.magazine-fitbook.com')).toEqual([31]);
  });

  it('should return [79] for "petbook.de" domain', () => {
    expect(getDomainTagValue('www.petbook.de')).toEqual([79]);
  });

  it('should return an empty array for an unknown domain', () => {
    expect(getDomainTagValue('unknown.com')).toEqual([]);
  });
});

describe('Scroll event listener', () => {
  let addEventListenerSpy;
  let mockUtag;

  beforeEach(() => {
    // window.utag mock
    mockUtag = {
      link: jest.fn(),
      data: {
        page_platform: 'desktop',
        adobe_pageName: 'home',
      },
    };
    global.window.utag = mockUtag;

    // window.location.hostname mock
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'www.welt.de',
      },
      writable: true,
    });

    // addEventListener mock
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    // cookie values mock
    document.cookie = 's_ppv=xyz,50';

    // trigger scroll event
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger the "scroll depth" event at 50% scroll depth', () => {
    expect(mockUtag.link).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'scroll depth',
        event_action: 'view50',
      }),
      null,
      [206]
    );
  });
});
