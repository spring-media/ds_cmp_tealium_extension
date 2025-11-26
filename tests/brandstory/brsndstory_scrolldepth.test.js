const { getCookie, getDomainTagValue, sendLinkEvent } = require('../../extensions/brandstory/brandstory_scrolldepth');

beforeEach(() => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
        value: '',
        writable: true,
    });

    // Mock window.location.hostname
    jest.spyOn(window, 'location', 'get').mockReturnValue({
        hostname: ''
    });

    // Mock window.utag.link
    if (!window.utag) {
        window.utag = {};
    }
    window.utag.link = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe('getCookie', () => {

    test('returns the value from the cookie', () => {
        document.cookie = 'testCookie=someValue,value2;secure';
        expect(getCookie('testCookie')).toBe('value2');
    });

    test('returns an empty string if the cookie is not found', () => {
        document.cookie = 'anotherCookie=value;secure';
        expect(getCookie('testCookie')).toBe('');
    });
});

describe('getDomainTagValue', () => {
    test('returns [206] for welt.de domain', () => {
        expect(getDomainTagValue('www.welt.de')).toEqual([206]);
    });

    test('returns [10] for bild.de domain', () => {
        expect(getDomainTagValue('www.bild.de')).toEqual([10]);
    });

    test('returns [] for other domains', () => {
        expect(getDomainTagValue('www.example.com')).toEqual([]);
    });
});

describe('scroll event listener', () => {
    let scrollArray;
    let triggered50;
    let triggered75;
    let triggered100;

    beforeEach(() => {
        jest.clearAllMocks();

        window.utag.data = {
            page_platform: 'web',
            adobe_pageName: 'homepage'
        };
    });

    const triggerScroll = (scrollDepth, hostname) => {
        document.cookie = `s_ppv=test,${scrollDepth};secure`;

        window.location.hostname = hostname;

        // Simulate scroll event
        const event = new Event('scroll');
        window.dispatchEvent(event);
    };

    test('triggers event at 50% scroll depth', () => {
        triggerScroll(50, 'www.welt.de');

        expect(window.utag.link).toHaveBeenCalled();
    });

    test('triggers event at 75% scroll depth', () => {
        triggerScroll(75, 'www.bild.de');

        expect(window.utag.link).toHaveBeenCalled();
    });

    test('triggers event at 100% scroll depth', () => {
        triggerScroll(100, 'www.example.com');

        expect(window.utag.link).toHaveBeenCalled();
    });

    test('does not trigger event if scroll depth is not 50, 75, or 100', () => {
        triggerScroll(60, 'www.welt.de');

        expect(window.utag.link).not.toHaveBeenCalled();
    });

    test('does not trigger event if already triggered', () => {
        triggered50 = true;
        triggerScroll(50, 'www.welt.de');

        expect(window.utag.link).not.toHaveBeenCalled();
    });
});

