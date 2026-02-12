const { _whoamiSnipped_getAsInfo, updateUserSubscriptionsStatus, handleWhoami } = require('../extensions/whoami');

describe('Whoami Extension', () => {
    beforeEach(() => {
        // Mock document.cookie
        let cookies = '';
        Object.defineProperty(document, 'cookie', {
            get: () => cookies,
            set: value => {
                cookies = value;
            },
            configurable: true
        });

        // Mock window and global objects
        global.window = {
            location: {
                host: 'localhost',
                hostname: 'localhost'
            },
            document: {
                cookie: ''
            },
            utag: {
                data: {}
            },
            atob: str => Buffer.from(str, 'base64').toString('binary')
        };

        // Mock console.log to prevent test output pollution
        global.console = {
            log: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.cookie = '';
    });

    describe('_whoamiSnipped_getAsInfo', () => {
        test('should return null when cookie is not present', () => {
            const windowMock = {
                ...global.window,
                document: { cookie: 'other_cookie=value' },
                utag: { data: {} }
            };
            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toBeNull();
        });

        test('should return null when asinfo cookie is empty', () => {
            const windowMock = {
                ...global.window,
                document: { cookie: 'asinfo=' },
                utag: { data: {} }
            };
            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toBeNull();
        });

        test('should parse valid asinfo cookie correctly', () => {
            const asinfoData = { subOrigin: 'as', jaId: 'test-ja-id', purchaseData: { entitlements: ['weltplus'] } };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                utag: { data: {} }
            };

            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toEqual(asinfoData);
        });

        test('should parse asinfo cookie with quotes removed', () => {
            const asinfoData = { subOrigin: 'as', jaId: 'test-ja-id' };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo="${encodedData}"` },
                utag: { data: {} }
            };

            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toEqual(asinfoData);
        });

        test('should handle multiple cookies and extract asinfo correctly', () => {
            const asinfoData = { subOrigin: 'as', jaId: 'test-ja-id' };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `cookie1=value1; asinfo=${encodedData}; cookie2=value2` },
                utag: { data: {} }
            };

            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toEqual(asinfoData);
        });

        test('should return null and set error when cookie parsing fails', () => {
            const windowMock = {
                ...global.window,
                document: { cookie: 'asinfo=invalid-base64-data' },
                utag: { data: {} }
            };

            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toBeNull();
            expect(windowMock.utag.data.errors).toBe('whoami-cookie-parsing');
        });

        test('should return null and set error when JSON parsing fails', () => {
            const invalidJson = Buffer.from('not-a-json').toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${invalidJson}` },
                utag: { data: {} }
            };

            const result = _whoamiSnipped_getAsInfo(windowMock);
            expect(result).toBeNull();
            expect(windowMock.utag.data.errors).toBe('whoami-cookie-parsing');
        });
    });

    describe('updateUserSubscriptionsStatus', () => {
        test('should set hasPurSubscription to true for welt.de with welt-pur entitlement', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: { user_entitlements2: ['welt-pur'] } }
            };

            updateUserSubscriptionsStatus('www.welt.de', windowMock);

            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('false');
        });

        test('should set hasPlusSubscription to true for welt.de with weltplus entitlement', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: { user_entitlements2: ['weltplus'] } }
            };

            updateUserSubscriptionsStatus('www.welt.de', windowMock);

            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('false');
        });

        test('should set both subscriptions to true when user has both entitlements', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: { user_entitlements2: ['welt-pur', 'weltplus'] } }
            };

            updateUserSubscriptionsStatus('www.welt.de', windowMock);

            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
        });

        test('should set hasPurSubscription to true for bild.de with bild-pur entitlement', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.bild.de', hostname: 'www.bild.de' },
                utag: { data: { user_entitlements2: ['bild-pur'] } }
            };

            updateUserSubscriptionsStatus('www.bild.de', windowMock);

            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('false');
        });

        test('should set hasPlusSubscription to true for bild.de with bildplus entitlement', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.bild.de', hostname: 'www.bild.de' },
                utag: { data: { user_entitlements2: ['bildplus'] } }
            };

            updateUserSubscriptionsStatus('www.bild.de', windowMock);

            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('false');
        });

        test('should not set subscription flags for unknown domain', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.unknown.com', hostname: 'www.unknown.com' },
                utag: { data: { user_entitlements2: ['some-entitlement'] } }
            };

            updateUserSubscriptionsStatus('www.unknown.com', windowMock);

            expect(windowMock.utag.data.user_hasPurSubscription2).toBeUndefined();
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBeUndefined();
        });

        test('should handle empty entitlements array', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: { user_entitlements2: [] } }
            };

            updateUserSubscriptionsStatus('www.welt.de', windowMock);

            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('false');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('false');
        });

        test('should work with subdomain variations', () => {
            const windowMock = {
                ...global.window,
                location: { host: 'edition.welt.de', hostname: 'edition.welt.de' },
                utag: { data: { user_entitlements2: ['weltplus'] } }
            };

            updateUserSubscriptionsStatus('edition.welt.de', windowMock);

            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
        });
    });

    describe('handleWhoami', () => {
        test('should set user_isLoggedIn2 to false when no asinfo cookie exists', () => {
            const windowMock = {
                ...global.window,
                document: { cookie: '' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('false');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('false');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('false');
            expect(windowMock.utag.data.user_jaId2).toBe('false');
            expect(windowMock.utag.data.user_entitlements2).toBe('false');
        });

        test('should set user_isLoggedIn2 to false when subOrigin is not "as"', () => {
            const asinfoData = { subOrigin: 'other', jaId: 'test-ja-id' };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('false');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('false');
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('false');
            expect(windowMock.utag.data.user_jaId2).toBe('false');
            expect(windowMock.utag.data.user_entitlements2).toBe('false');
        });

        test('should set user_isLoggedIn2 to true and populate user data when logged in', () => {
            const asinfoData = { 
                subOrigin: 'as', 
                jaId: 'test-ja-id-123',
                purchaseData: { entitlements: ['weltplus', 'welt-pur'] }
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_jaId2).toBe('test-ja-id-123');
            expect(windowMock.utag.data.user_entitlements2).toEqual(['weltplus', 'welt-pur']);
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
        });

        test('should handle missing jaId gracefully', () => {
            const asinfoData = { 
                subOrigin: 'as',
                purchaseData: { entitlements: ['weltplus'] }
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_jaId2).toBe('');
            expect(windowMock.utag.data.user_entitlements2).toEqual(['weltplus']);
        });

        test('should handle missing purchaseData gracefully', () => {
            const asinfoData = { 
                subOrigin: 'as',
                jaId: 'test-ja-id'
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_jaId2).toBe('test-ja-id');
            expect(windowMock.utag.data.user_entitlements2).toEqual([]);
        });

        test('should handle missing entitlements in purchaseData', () => {
            const asinfoData = { 
                subOrigin: 'as',
                jaId: 'test-ja-id',
                purchaseData: {}
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_jaId2).toBe('test-ja-id');
            expect(windowMock.utag.data.user_entitlements2).toEqual([]);
        });

        test('should work correctly for bild.de domain', () => {
            const asinfoData = { 
                subOrigin: 'as',
                jaId: 'bild-user-id',
                purchaseData: { entitlements: ['bildplus', 'bild-pur'] }
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.bild.de', hostname: 'www.bild.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_jaId2).toBe('bild-user-id');
            expect(windowMock.utag.data.user_entitlements2).toEqual(['bildplus', 'bild-pur']);
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
        });

        test('should handle cookie parsing error gracefully', () => {
            const windowMock = {
                ...global.window,
                document: { cookie: 'asinfo=invalid-data' },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('false');
            expect(windowMock.utag.data.errors).toBe('whoami-cookie-parsing');
        });

        test('should handle null subOrigin in asinfo data', () => {
            const asinfoData = { 
                subOrigin: null,
                jaId: 'test-ja-id'
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('false');
        });

        test('should handle multiple entitlements correctly', () => {
            const asinfoData = { 
                subOrigin: 'as',
                jaId: 'test-ja-id',
                purchaseData: { entitlements: ['weltplus', 'welt-pur', 'other-entitlement'] }
            };
            const encodedData = Buffer.from(JSON.stringify(asinfoData)).toString('base64');
            const windowMock = {
                ...global.window,
                document: { cookie: `asinfo=${encodedData}` },
                location: { host: 'www.welt.de', hostname: 'www.welt.de' },
                utag: { data: {} }
            };

            handleWhoami(windowMock);

            expect(windowMock.utag.data.user_isLoggedIn2).toBe('true');
            expect(windowMock.utag.data.user_entitlements2).toEqual(['weltplus', 'welt-pur', 'other-entitlement']);
            expect(windowMock.utag.data.user_hasPlusSubscription2).toBe('true');
            expect(windowMock.utag.data.user_hasPurSubscription2).toBe('true');
        });
    });
});
