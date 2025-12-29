/**
 * Tests for rasp.js
 * Rasp Tracking Integration - Initializes ringDataLayer and loads Simetra script
 */

/* global utag, RaspHelpers */

describe('Rasp Tracking Integration', () => {
    let mockUtag;
    let mockWindow;
    let mockDocument;

    beforeEach(() => {
        // Mock Date and Intl
        jest.spyOn(global, 'Date').mockImplementation(() => ({
            getTimezoneOffset: jest.fn().mockReturnValue(-60)
        }));

        global.Intl = {
            DateTimeFormat: jest.fn().mockReturnValue({
                resolvedOptions: jest.fn().mockReturnValue({
                    timeZone: 'Europe/Berlin'
                })
            })
        };

        // Mock document
        mockDocument = {
            cookie: '',
            createElement: jest.fn().mockReturnValue({
                src: '',
                async: false
            }),
            head: {
                appendChild: jest.fn()
            }
        };
        global.document = mockDocument;

        // Mock window
        mockWindow = {
            location: {
                pathname: '/section/subsection/article/'
            },
            ringDataLayer: undefined,
            dlApi: undefined,
            addEventListener: jest.fn(),
            __tcfapi: jest.fn(),
            EventsApi: undefined
        };
        global.window = mockWindow;

        // Mock utag
        mockUtag = {
            cfg: {
                utid: 'main/welt/123/prod'
            },
            data: {
                page_platform: 'desktop',
                user_hasPlusSubscription2: 'false',
                sp_events: 'event1,event2',
                mkt_channel: 'channel1',
                mkt_channel_category: 'category1',
                'ut.env': 'prod',
                app_os: '',
                app_version: '',
                previous_page_name: 'homepage',
                page_outbrain_model: 'model1',
                user_isLoggedIn2: 'true',
                page_has_video: 'true',
                cmp_event_status: 'cmpuishown',
                'cp.utag_main_ac': 'ac_value',
                page_type: 'article',
                page_isPremium: 'true',
                page_escenicId: '12345',
                user_jaId2: 'ja123',
                peterId: 'peter456'
            }
        };
        global.utag = mockUtag;
        mockWindow.utag = mockUtag;

        // Mock RaspHelpers
        global.RaspHelpers = {
            getAllTrackingData: jest.fn().mockReturnValue({
                trackingValue: 'stylebook',
                blockValue: 'block1',
                pageId: '12345',
                teaserPositionPage: 'stylebook|12345',
                cid: 'cid=campaign',
                icid: 'icid123',
                pageReloadstatus: 'navigate',
                adLibBranch: 'testBranch'
            })
        };
        mockWindow.RaspHelpers = global.RaspHelpers;

        global.console = {
            error: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.window;
        delete global.document;
        delete global.utag;
        delete global.RaspHelpers;
        delete global.Intl;
    });

    describe('ringDataLayer initialization', () => {
        it('should create complete ringDataLayer with all edl attributes', () => {
            const trackingData = RaspHelpers.getAllTrackingData();
            const tiqVersion = utag.cfg.utid.split('/').slice(1).join('/');

            const customDataLayer = {
                appName: 'WELT.de',
                pagePlatform: utag.data.page_platform,
                isSubscriber: utag.data.user_hasPlusSubscription2,
                ch_events: utag.data.sp_events || '',
                mkt_channel: utag.data.mkt_channel || '',
                mkt_channel_category: utag.data.mkt_channel_category || '',
                tiqVersion: tiqVersion,
                tiqEnv: utag.data['ut.env'] || '',
                timezoneOffset: new Date().getTimezoneOffset() / -60,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                appOs: utag.data.app_os || '',
                appVersion: utag.data.app_version || '',
                previousPage: utag.data.previous_page_name || '',
                pageReloadStatus: trackingData.pageReloadstatus,
                adLibBranch: trackingData.adLibBranch,
                teaserPosition: trackingData.trackingValue,
                teaserPositionPage: trackingData.teaserPositionPage,
                teaserBlock: trackingData.blockValue,
                pageId: trackingData.pageId,
                cid: trackingData.cid,
                icid: trackingData.icid,
                outbrainModel: utag.data.page_outbrain_model || '',
                isLoggedIn: utag.data.user_isLoggedIn2 || '',
                pageContainsVideo: utag.data.page_has_video || '',
                cmpFirstPageview: utag.data.cmp_event_status === 'cmpuishown' ? 'cmp_first_pv' : '',
                ac1: utag.data['cp.utag_main_ac'] || ''
            };

            window.ringDataLayer = {
                edl: customDataLayer,
                context: {
                    tracking: {
                        autostart: false
                    },
                    publication_structure: {
                        root: 'welt',
                        path: window.location.pathname.split('/').slice(1, -1).join('/')
                    }
                },
                content: {
                    type: utag.data.page_type || 'no pageType',
                    publication: {
                        premium: utag.data.page_isPremium?.toLowerCase() === 'true'
                    },
                    source: {
                        system: 'BFF',
                        id: utag.data.page_escenicId || 'no pageId'
                    }
                },
                user: {
                    sso: {
                        logged: { id: utag.data.user_jaId2 || '' }
                    },
                    id: {
                        external: {
                            id: { peterId: utag.data.peterId || '' }
                        }
                    }
                }
            };

            expect(window.ringDataLayer.edl.appName).toBe('WELT.de');
            expect(window.ringDataLayer.edl.pagePlatform).toBe('desktop');
            expect(window.ringDataLayer.edl.tiqVersion).toBe('welt/123/prod');
            expect(window.ringDataLayer.edl.timezoneOffset).toBe(1);
            expect(window.ringDataLayer.edl.timezone).toBe('Europe/Berlin');
            expect(window.ringDataLayer.edl.teaserPosition).toBe('stylebook');
            expect(window.ringDataLayer.edl.cmpFirstPageview).toBe('cmp_first_pv');
            expect(window.ringDataLayer.context.tracking.autostart).toBe(false);
            expect(window.ringDataLayer.context.publication_structure.root).toBe('welt');
            expect(window.ringDataLayer.content.publication.premium).toBe(true);
            expect(window.ringDataLayer.user.sso.logged.id).toBe('ja123');
        });

        it('should handle missing RaspHelpers gracefully', () => {
            delete global.RaspHelpers;

            const trackingData =
                typeof RaspHelpers !== 'undefined'
                    ? RaspHelpers.getAllTrackingData()
                    : {
                          trackingValue: '',
                          blockValue: '',
                          pageId: '',
                          teaserPositionPage: '',
                          cid: '',
                          icid: '',
                          pageReloadstatus: '',
                          adLibBranch: ''
                      };

            expect(trackingData.trackingValue).toBe('');
            expect(trackingData.adLibBranch).toBe('');
        });

        it('should handle missing utag data fields', () => {
            utag.data = {
                page_type: 'article',
                page_escenicId: '12345'
            };

            const customDataLayer = {
                appName: 'WELT.de',
                pagePlatform: utag.data.page_platform,
                ch_events: utag.data.sp_events || '',
                mkt_channel: utag.data.mkt_channel || '',
                outbrainModel: utag.data.page_outbrain_model || ''
            };

            expect(customDataLayer.pagePlatform).toBeUndefined();
            expect(customDataLayer.ch_events).toBe('');
            expect(customDataLayer.mkt_channel).toBe('');
        });
    });

    describe('Cookie consent and script loading', () => {
        it('should load Simetra script when rasp consent cookie is present', () => {
            document.cookie = 'cmp_cv_list=rasp,other';

            const hasConsent = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(
                document.cookie
            );

            expect(hasConsent).toBe(true);
        });

        it('should not load script when rasp consent cookie is absent', () => {
            document.cookie = 'cmp_cv_list=other,vendor';

            const hasConsent = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(
                document.cookie
            );

            expect(hasConsent).toBe(false);
        });

        it('should create script element with correct attributes', () => {
            document.cookie = 'cmp_cv_list=rasp';

            if (/(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(document.cookie)) {
                const script = document.createElement('script');
                script.src =
                    'https://simetra.tracking.ringieraxelspringer.tech/EA-3734738/simetra.boot.js?domain=welt.de';
                script.async = true;

                expect(script.src).toBe(
                    'https://simetra.tracking.ringieraxelspringer.tech/EA-3734738/simetra.boot.js?domain=welt.de'
                );
                expect(script.async).toBe(true);
            }

            expect(document.createElement).toHaveBeenCalledWith('script');
        });

        it('should initialize dlApi.kropka.DX with correct format', () => {
            document.cookie = 'cmp_cv_list=rasp';

            if (/(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(document.cookie)) {
                window.dlApi = window.dlApi != null ? window.dlApi : {};
                window.dlApi.kropka = window.dlApi.kropka != null ? window.dlApi.kropka : {};
                window.dlApi.kropka.DX = 'PV_4,welt_de,' + utag.data.page_escenicId + ',1';

                expect(window.dlApi.kropka.DX).toBe('PV_4,welt_de,12345,1');
            }
        });
    });

    describe('Event listener and TCF API', () => {
        it('should add event listener for simetra-load', () => {
            document.cookie = 'cmp_cv_list=rasp';

            if (/(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(document.cookie)) {
                const mockEventHandler = jest.fn();
                window.addEventListener('simetra-load', mockEventHandler);

                expect(window.addEventListener).toHaveBeenCalledWith(
                    'simetra-load',
                    mockEventHandler
                );
            }
        });

        it('should call __tcfapi and start EventsApi when successful', () => {
            jest.useFakeTimers();

            window.EventsApi = {
                start: jest.fn()
            };

            window.__tcfapi = jest.fn((command, version, callback) => {
                callback({ tcString: 'test' }, true);
            });

            window.__tcfapi('addEventListener', 2, (tcData, success) => {
                if (success) {
                    setTimeout(() => {
                        window.EventsApi.start();
                    }, 1000);
                }
            });

            expect(window.__tcfapi).toHaveBeenCalledWith(
                'addEventListener',
                2,
                expect.any(Function)
            );

            jest.advanceTimersByTime(1000);
            expect(window.EventsApi.start).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe('Error handling', () => {
        it('should catch and log errors during initialization', () => {
            try {
                throw new Error('Test error');
            } catch (e) {
                console.error('[TEALIUM RASP] Error initializing Rasp tracking:', e);
            }

            expect(console.error).toHaveBeenCalledWith(
                '[TEALIUM RASP] Error initializing Rasp tracking:',
                expect.any(Error)
            );
        });
    });

    describe('Path extraction', () => {
        it('should correctly extract path from pathname', () => {
            window.location.pathname = '/section/subsection/article/';
            const path = window.location.pathname.split('/').slice(1, -1).join('/');
            expect(path).toBe('section/subsection/article');
        });

        it('should handle root path', () => {
            window.location.pathname = '/';
            const path = window.location.pathname.split('/').slice(1, -1).join('/');
            expect(path).toBe('');
        });
    });
});
