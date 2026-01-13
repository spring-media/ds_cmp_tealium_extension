/**
 * Tests for rasp.js
 * Rasp Tracking Integration - Initializes ringDataLayer and loads Simetra script
 */

/* global utag */

const RaspTracking = require('../../../extensions/welt/rasp/rasp');
const RaspHelpers = require('../../../extensions/welt/rasp/rasp_helpers');

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
            EventsApi: undefined,
            ASCDP: {
                pageSet: {
                    branch: 'testBranch'
                }
            }
        };
        global.window = mockWindow;

        // Set performance after window is assigned
        mockWindow.performance = {
            getEntriesByType: jest.fn((type) => {
                if (type === 'navigation') {
                    return [{ type: 'navigate' }];
                }
                return [];
            })
        };

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
                peterId: 'peter456',
                'qp.cid': 'kooperation.home.outbrain.desktop.AR_2.stylebook',
                'cp.utag_main_tb': 'block1_segment',
                page_id: '12345',
                'qp.icid': 'icid123'
            }
        };
        global.utag = mockUtag;
        mockWindow.utag = mockUtag;

        // Mock RaspHelpers
        global.RaspHelpers = RaspHelpers;
        mockWindow.RaspHelpers = RaspHelpers;

        global.console = {
            error: jest.fn(),
            log: jest.fn()
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
        it('should create ringDataLayer with RaspHelpers data', () => {
            RaspTracking.initialize();

            expect(window.ringDataLayer).toBeDefined();
            expect(window.ringDataLayer.edl.teaserPosition).toBe('stylebook');
            expect(window.ringDataLayer.edl.teaserBlock).toBe('block1');
            expect(window.ringDataLayer.edl.pageId).toBe('12345');
            expect(window.ringDataLayer.edl.teaserPositionPage).toBe('stylebook|12345');
            expect(window.ringDataLayer.edl.cid).toBe('cid=kooperation.home.outbrain.desktop.AR_2.stylebook');
            expect(window.ringDataLayer.edl.icid).toBe('icid123');
            expect(window.ringDataLayer.content.type).toBe('article');
            expect(window.ringDataLayer.content.source.id).toBe('12345');
        });

        it('should handle missing RaspHelpers gracefully', () => {
            delete global.RaspHelpers;

            RaspTracking.initialize();

            expect(window.ringDataLayer.edl.teaserPosition).toBe('');
            expect(window.ringDataLayer.edl.adLibBranch).toBe('');
            expect(window.ringDataLayer.edl.cid).toBe('');
            expect(window.ringDataLayer.edl.icid).toBe('');
        });
    });

    describe('Cookie consent and script loading', () => {
        it('should load Simetra script when rasp consent cookie is present', () => {
            document.cookie = 'cmp_cv_list=rasp,other';

            RaspTracking.initialize();

            expect(document.createElement).toHaveBeenCalledWith('script');
            const scriptCall = mockDocument.createElement.mock.results[0].value;
            expect(scriptCall.src).toBe(
                'https://simetra.tracking.ringieraxelspringer.tech/EA-3734738/simetra.boot.js?domain=welt.de'
            );
            expect(scriptCall.async).toBe(true);
            expect(mockDocument.head.appendChild).toHaveBeenCalled();
        });

        it('should not load script when rasp consent cookie is absent', () => {
            document.cookie = 'cmp_cv_list=other,vendor';

            RaspTracking.initialize();

            expect(document.createElement).not.toHaveBeenCalled();
            expect(mockDocument.head.appendChild).not.toHaveBeenCalled();
        });

        it('should initialize dlApi.kropka.DX with correct format when consent given', () => {
            document.cookie = 'cmp_cv_list=rasp';

            RaspTracking.initialize();

            expect(window.dlApi.kropka.DX).toBe('PV_4,welt_de,12345,1');
        });

        it('should add event listener for simetra-load when consent given', () => {
            document.cookie = 'cmp_cv_list=rasp';

            RaspTracking.initialize();

            expect(window.addEventListener).toHaveBeenCalledWith(
                'simetra-load',
                expect.any(Function)
            );
        });
    });

    describe('Event listener and TCF API', () => {
        it('should call __tcfapi and start EventsApi when successful', () => {
            jest.useFakeTimers();

            window.EventsApi = {
                start: jest.fn()
            };

            document.cookie = 'cmp_cv_list=rasp';

            RaspTracking.initialize();

            // Get the simetra-load event handler
            const simetraLoadHandler =
                window.addEventListener.mock.calls.find(
                    (call) => call[0] === 'simetra-load'
                )[1];

            // Mock __tcfapi to call the callback
            window.__tcfapi = jest.fn((command, version, callback) => {
                callback({ tcString: 'test' }, true);
            });

            // Trigger the simetra-load event
            simetraLoadHandler();

            expect(window.__tcfapi).toHaveBeenCalledWith(
                'addEventListener',
                2,
                expect.any(Function)
            );

            jest.advanceTimersByTime(1000);
            expect(window.EventsApi.start).toHaveBeenCalled();

            jest.useRealTimers();
        });

        it('should not start EventsApi when TCF API returns unsuccessful', () => {
            jest.useFakeTimers();

            window.EventsApi = {
                start: jest.fn()
            };

            document.cookie = 'cmp_cv_list=rasp';

            RaspTracking.initialize();

            const simetraLoadHandler =
                window.addEventListener.mock.calls.find(
                    (call) => call[0] === 'simetra-load'
                )[1];

            window.__tcfapi = jest.fn((command, version, callback) => {
                callback({ tcString: 'test' }, false);
            });

            simetraLoadHandler();

            jest.advanceTimersByTime(1000);
            expect(window.EventsApi.start).not.toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe('Error handling', () => {
        it('should catch and log errors during initialization', () => {
            // Force an error by making utag.cfg.utid.split throw
            mockUtag.cfg.utid = null;

            RaspTracking.initialize();

            expect(console.error).toHaveBeenCalledWith(
                '[TEALIUM RASP] Error initializing Rasp tracking:',
                expect.any(Error)
            );
        });
    });

    describe('Path extraction', () => {
        it('should correctly extract path from pathname', () => {
            window.location.pathname = '/section/subsection/article/';

            RaspTracking.initialize();

            expect(window.ringDataLayer.context.publication_structure.path).toBe(
                'section/subsection/article'
            );
        });

        it('should handle root path', () => {
            window.location.pathname = '/';

            RaspTracking.initialize();

            expect(window.ringDataLayer.context.publication_structure.path).toBe(
                ''
            );
        });

        it('should handle path without trailing slash', () => {
            window.location.pathname = '/section/article';

            RaspTracking.initialize();

            expect(window.ringDataLayer.context.publication_structure.path).toBe(
                'section'
            );
        });
    });

    describe('Default values', () => {
        it('should use default pageType when missing', () => {
            delete utag.data.page_type;

            RaspTracking.initialize();

            expect(window.ringDataLayer.content.type).toBe('no pageType');
        });

        it('should use default pageId when missing', () => {
            delete utag.data.page_escenicId;

            RaspTracking.initialize();

            expect(window.ringDataLayer.content.source.id).toBe('no pageId');
        });

        it('should handle missing user data', () => {
            delete utag.data.user_jaId2;
            delete utag.data.peterId;

            RaspTracking.initialize();

            expect(window.ringDataLayer.user.sso.logged.id).toBe('');
            expect(window.ringDataLayer.user.id.external.id.peterId).toBe('');
        });
    });
});
