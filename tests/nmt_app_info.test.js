const getNmtAppInfo = require('../extensions/nmt_app_info');
const { createWindowMock } = require('./mocks/browserMocks');

describe('NMT App Info Extension', () => {
    beforeEach(() => {
        // Create a fresh window mock for each test
        const windowMock = createWindowMock();
        
        // Ensure window is properly set on global
        Object.defineProperty(global, 'window', {
            value: windowMock,
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.window;
    });

    describe('getAppName', () => {
        it('should return "BILD News" for BILD News app identifiers', () => {
            expect(getNmtAppInfo.getAppName('de.bild.newsapp')).toBe('BILD News');
            expect(getNmtAppInfo.getAppName('de.bild.newsapp-legacy')).toBe('BILD News');
            expect(getNmtAppInfo.getAppName('de.bild.ipad-legacy')).toBe('BILD News');
            expect(getNmtAppInfo.getAppName('de.bild.ipad')).toBe('BILD News');
            expect(getNmtAppInfo.getAppName('com.netbiscuits.bild.android')).toBe('BILD News');
        });

        it('should return "BILD Sport" for BILD Sport app identifiers', () => {
            expect(getNmtAppInfo.getAppName('de.bild.bundesliga-legacy')).toBe('BILD Sport');
            expect(getNmtAppInfo.getAppName('de.bild.bundesliga')).toBe('BILD Sport');
            expect(getNmtAppInfo.getAppName('de.bild.MeinKlub')).toBe('BILD Sport');
        });

        it('should return "WELT News" for WELT News app identifiers', () => {
            expect(getNmtAppInfo.getAppName('de.cellular.n24hybrid')).toBe('WELT News');
            expect(getNmtAppInfo.getAppName('de.cellular.n24hybrid.staging')).toBe('WELT News');
            expect(getNmtAppInfo.getAppName('de.axelspringer.weltmobil')).toBe('WELT News');
        });

        it('should return "WELT Edition" for WELT Edition app identifiers', () => {
            expect(getNmtAppInfo.getAppName('com.sprylab.axelspringer.tablet.welt')).toBe('WELT Edition');
            expect(getNmtAppInfo.getAppName('de.axelspringer.weltipad')).toBe('WELT Edition');
            expect(getNmtAppInfo.getAppName('de.axelspringer.SessionPaymentFeaturesPreview')).toBe('WELT Edition');
        });

        it('should return "Unknown App" for unrecognized app identifiers', () => {
            expect(getNmtAppInfo.getAppName('unknown.app.identifier')).toBe('Unknown App');
            expect(getNmtAppInfo.getAppName('com.example.app')).toBe('Unknown App');
            expect(getNmtAppInfo.getAppName('')).toBe('Unknown App');
        });

        it('should handle null or undefined app identifiers', () => {
            expect(getNmtAppInfo.getAppName(null)).toBe('Unknown App');
            expect(getNmtAppInfo.getAppName(undefined)).toBe('Unknown App');
        });
    });

    describe('getWebviewData', () => {
        it('should populate window.utag.data when nmtAppInfo is defined with iOS platform', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'ios',
                semanticVersion: '1.2.3'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.nmtAppInfo).toEqual(window.nmtAppInfo);
            expect(window.utag.data.app_name).toBe('BILD News');
            expect(window.utag.data.page_platform).toBe('app');
            expect(window.utag.data.app_os).toBe('iOS'); // Corrected from 'ios'
            expect(window.utag.data.app_version).toBe('1.2.3');
            expect(window.utag.data.page_sub_type).toBe('webview');
        });

        it('should populate window.utag.data when nmtAppInfo is defined with Android platform', () => {
            window.nmtAppInfo = {
                appIdentifier: 'com.netbiscuits.bild.android',
                platform: 'android',
                semanticVersion: '2.3.4'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.nmtAppInfo).toEqual(window.nmtAppInfo);
            expect(window.utag.data.app_name).toBe('BILD News');
            expect(window.utag.data.page_platform).toBe('app');
            expect(window.utag.data.app_os).toBe('Android'); // Corrected from 'android'
            expect(window.utag.data.app_version).toBe('2.3.4');
            expect(window.utag.data.page_sub_type).toBe('webview');
        });

        it('should handle WELT News app', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.cellular.n24hybrid',
                platform: 'ios',
                semanticVersion: '3.0.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_name).toBe('WELT News');
            expect(window.utag.data.app_os).toBe('iOS');
        });

        it('should handle WELT Edition app', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.axelspringer.weltipad',
                platform: 'ios',
                semanticVersion: '4.1.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_name).toBe('WELT Edition');
        });

        it('should handle BILD Sport app', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.bundesliga',
                platform: 'android',
                semanticVersion: '5.2.1'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_name).toBe('BILD Sport');
            expect(window.utag.data.app_os).toBe('Android');
        });

        it('should set app_name to "no-entry" for unknown app identifier', () => {
            window.nmtAppInfo = {
                appIdentifier: 'unknown.app',
                platform: 'ios',
                semanticVersion: '1.0.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_name).toBe('Unknown App');
        });

        it('should handle missing platform property', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                semanticVersion: '1.2.3'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_os).toBe('');
        });

        it('should handle missing semanticVersion property', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'ios'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_version).toBe('');
        });

        it('should handle platform with different casing', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'iOS', // Already correct casing
                semanticVersion: '1.0.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_os).toBe('iOS');
        });

        it('should handle platform with different casing for Android', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'Android', // Already correct casing
                semanticVersion: '1.0.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_os).toBe('Android');
        });

        it('should not populate data when nmtAppInfo is undefined', () => {
            window.nmtAppInfo = undefined;

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.nmtAppInfo).toBeUndefined();
            expect(window.utag.data.app_name).toBeUndefined();
            expect(window.utag.data.page_platform).toBeUndefined();
        });

        it('should handle empty nmtAppInfo object', () => {
            window.nmtAppInfo = {};

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.nmtAppInfo).toEqual({});
            expect(window.utag.data.app_name).toBe('Unknown App');
            expect(window.utag.data.app_os).toBe('');
            expect(window.utag.data.app_version).toBe('');
        });

        it('should handle unknown platform value', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'windows',
                semanticVersion: '1.0.0'
            };

            getNmtAppInfo.getWebviewData();

            expect(window.utag.data.app_os).toBe('windows'); // Not corrected, keeps original
        });
    });

    describe('init', () => {
        it('should call getWebviewData', () => {
            const getWebviewDataSpy = jest.spyOn(getNmtAppInfo, 'getWebviewData');
            
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.newsapp',
                platform: 'ios',
                semanticVersion: '1.2.3'
            };

            getNmtAppInfo.init();

            expect(getWebviewDataSpy).toHaveBeenCalled();
            expect(window.utag.data.app_name).toBe('BILD News');
        });

        it('should not throw when nmtAppInfo is undefined', () => {
            window.nmtAppInfo = undefined;

            expect(() => getNmtAppInfo.init()).not.toThrow();
        });
    });

    describe('Edge cases and integration', () => {
        it('should handle all BILD News app identifiers correctly', () => {
            const bildNewsApps = [
                'de.bild.newsapp',
                'de.bild.newsapp-legacy',
                'de.bild.ipad-legacy',
                'de.bild.ipad',
                'com.netbiscuits.bild.android'
            ];

            bildNewsApps.forEach(appId => {
                window.nmtAppInfo = {
                    appIdentifier: appId,
                    platform: 'ios',
                    semanticVersion: '1.0.0'
                };

                getNmtAppInfo.getWebviewData();
                expect(window.utag.data.app_name).toBe('BILD News');
            });
        });

        it('should handle complete app info flow for iOS', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.cellular.n24hybrid',
                platform: 'ios',
                semanticVersion: '6.7.8'
            };

            getNmtAppInfo.init();

            expect(window.utag.data.nmtAppInfo).toBeDefined();
            expect(window.utag.data.app_name).toBe('WELT News');
            expect(window.utag.data.page_platform).toBe('app');
            expect(window.utag.data.app_os).toBe('iOS');
            expect(window.utag.data.app_version).toBe('6.7.8');
            expect(window.utag.data.page_sub_type).toBe('webview');
        });

        it('should handle complete app info flow for Android', () => {
            window.nmtAppInfo = {
                appIdentifier: 'de.bild.MeinKlub',
                platform: 'android',
                semanticVersion: '9.10.11'
            };

            getNmtAppInfo.init();

            expect(window.utag.data.app_name).toBe('BILD Sport');
            expect(window.utag.data.app_os).toBe('Android');
            expect(window.utag.data.app_version).toBe('9.10.11');
        });
    });
});
