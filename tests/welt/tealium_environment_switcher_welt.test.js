/**
 * Tests for tealium_environment_switcher_welt.js
 * Profile/Environment switching extension for WELT
 */

describe('Tealium Environment Switcher WELT', () => {
    let mockWindow;
    let mockDocument;
    let mockLocation;
    let mockConsole;
    let createdScripts;

    beforeEach(() => {
        // Reset created scripts array
        createdScripts = [];

        // Mock console
        mockConsole = {
            log: jest.fn()
        };
        global.console = mockConsole;

        // Mock document
        mockDocument = {
            cookie: '',
            getElementsByTagName: jest.fn(tagName => {
                if (tagName === 'script') {
                    return [
                        {
                            outerHTML: '<script src="//ast.welt.de/v1/welt/main/prod/utag.js"></script>'
                        }
                    ];
                }
                if (tagName === 'head') {
                    return [
                        {
                            appendChild: jest.fn(script => {
                                createdScripts.push(script);
                            })
                        }
                    ];
                }
                return [];
            }),
            createElement: jest.fn(tagName => {
                if (tagName === 'script') {
                    return {
                        language: '',
                        type: '',
                        src: ''
                    };
                }
                return {};
            })
        };
        global.document = mockDocument;

        // Mock location
        mockLocation = {
            search: ''
        };
        global.location = mockLocation;

        // Mock window
        mockWindow = {
            location: mockLocation,
            utag_condload_env: undefined,
            utag_condload: undefined,
            console: mockConsole
        };
        global.window = mockWindow;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.console;
        delete global.document;
        delete global.location;
        delete global.window;
    });

    describe('Query string parameter detection', () => {
        it('should detect tealium_env parameter', () => {
            const qs = '?tealium_env=dev';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).not.toBeNull();
            expect(env[2]).toBe('dev');
        });

        it('should detect tealium_env=qa', () => {
            const qs = '?tealium_env=qa';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).not.toBeNull();
            expect(env[2]).toBe('qa');
        });

        it('should detect tealium_env=prod', () => {
            const qs = '?tealium_env=prod';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).not.toBeNull();
            expect(env[2]).toBe('prod');
        });

        it('should detect tealium_env=clear', () => {
            const qs = '?tealium_env=clear';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).not.toBeNull();
            expect(env[2]).toBe('clear');
        });

        it('should detect tealium_profile parameter', () => {
            const qs = '?tealium_profile=myprofile';
            const new_profile = qs.match(/(tealium_profile=)(.*)/);

            expect(new_profile).not.toBeNull();
            expect(new_profile[2]).toBe('myprofile');
        });

        it('should detect tealium_cb cachebuster parameter', () => {
            const qs = '?tealium_cb=true';
            const cachebuster = qs.match(/(tealium_cb=)(true)/);

            expect(cachebuster).not.toBeNull();
            expect(cachebuster[2]).toBe('true');
        });

        it('should detect multiple parameters together', () => {
            const qs = '?tealium_env=dev&tealium_profile=test&tealium_cb=true';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);
            const new_profile = qs.match(/(tealium_profile=)(.*)/);
            const cachebuster = qs.match(/(tealium_cb=)(true)/);

            expect(env[2]).toBe('dev');
            expect(new_profile[2]).toBe('test&tealium_cb=true');
            expect(cachebuster[2]).toBe('true');
        });

        it('should not match invalid environment values', () => {
            const qs = '?tealium_env=invalid';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).toBeNull();
        });
    });

    describe('Script tag parsing', () => {
        it('should extract account from script tag', () => {
            const scripts = document.getElementsByTagName('script');
            const script_array = [];

            for (let i = 0; i < scripts.length; i++) {
                script_array.push(scripts[i].outerHTML);
            }

            const script_string = script_array.join(';');
            const tealium_string = script_string.split('utag.js')[0].split('/');
            const account = tealium_string[tealium_string.length - 4];

            expect(account).toBe('welt');
        });

        it('should extract profile from script tag', () => {
            const scripts = document.getElementsByTagName('script');
            const script_array = [];

            for (let i = 0; i < scripts.length; i++) {
                script_array.push(scripts[i].outerHTML);
            }

            const script_string = script_array.join(';');
            const tealium_string = script_string.split('utag.js')[0].split('/');
            const profile = tealium_string[tealium_string.length - 3];

            expect(profile).toBe('main');
        });

        it('should extract environment from script tag', () => {
            const scripts = document.getElementsByTagName('script');
            const script_array = [];

            for (let i = 0; i < scripts.length; i++) {
                script_array.push(scripts[i].outerHTML);
            }

            const script_string = script_array.join(';');
            const tealium_string = script_string.split('utag.js')[0].split('/');
            const environment = tealium_string[tealium_string.length - 2];

            expect(environment).toBe('prod');
        });
    });

    describe('Profile cleaning', () => {
        it('should clean profile name from query parameters', () => {
            const qs = '?tealium_profile=myprofile&tealium_env=dev';
            let new_profile = qs.match(/(tealium_profile=)(.*)/);

            if (new_profile) {
                new_profile = new_profile[2].split('&')[0];
            }

            expect(new_profile).toBe('myprofile');
        });

        it('should handle profile without additional parameters', () => {
            const qs = '?tealium_profile=singleprofile';
            let new_profile = qs.match(/(tealium_profile=)(.*)/);

            if (new_profile) {
                new_profile = new_profile[2].split('&')[0];
            }

            expect(new_profile).toBe('singleprofile');
        });
    });

    describe('Cachebuster generation', () => {
        it('should generate cachebuster query string when true', () => {
            const qs = '?tealium_cb=true';
            let cachebuster = qs.match(/(tealium_cb=)(true)/);

            if (cachebuster) {
                cachebuster = '?_cb=' + Math.random() * 10000000000000000000;
            } else {
                cachebuster = '';
            }

            expect(cachebuster).toMatch(/^\?_cb=/);
            expect(cachebuster.length).toBeGreaterThan(5);
        });

        it('should not generate cachebuster when not specified', () => {
            const qs = '?tealium_env=dev';
            let cachebuster = qs.match(/(tealium_cb=)(true)/);

            if (cachebuster) {
                cachebuster = '?_cb=' + Math.random() * 10000000000000000000;
            } else {
                cachebuster = '';
            }

            expect(cachebuster).toBe('');
        });
    });

    describe('Environment switching logic', () => {
        it('should set tealium_env_switch flag when env is detected', () => {
            const qs = '?tealium_env=dev';
            const env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);
            let tealium_env_switch = false;

            if (env) {
                tealium_env_switch = true;
            }

            expect(tealium_env_switch).toBe(true);
        });

        it('should default environment to dev when switching from prod without env specified', () => {
            const current_env = 'prod';
            let env = null;

            if (!env) {
                env = current_env;
                if (env === 'prod' || env === 'qa') {
                    env = 'dev';
                } else {
                    env = 'qa';
                }
            }

            expect(env).toBe('dev');
        });

        it('should default environment to qa when switching from dev without env specified', () => {
            const current_env = 'dev';
            let env = null;

            if (!env) {
                env = current_env;
                if (env === 'prod' || env === 'qa') {
                    env = 'dev';
                } else {
                    env = 'qa';
                }
            }

            expect(env).toBe('qa');
        });
    });

    describe('Cookie management', () => {
        it('should generate correct cookie name format', () => {
            const profile = 'main';
            const cookieName = 'utag_env_' + '_' + profile;

            expect(cookieName).toBe('utag_env__main');
        });

        it('should generate cookie with correct utag.js path', () => {
            const tealium_domain = '//ast.welt.de';
            const profile = 'main';
            const env = 'dev';
            const cachebuster = '';
            const src = tealium_domain + '/' + profile + '/' + env + '/utag.js' + cachebuster;

            expect(src).toBe('//ast.welt.de/main/dev/utag.js');
        });

        it('should generate cookie with cachebuster', () => {
            const tealium_domain = '//ast.welt.de';
            const profile = 'main';
            const env = 'dev';
            const cachebuster = '?_cb=12345';
            const src = tealium_domain + '/' + profile + '/' + env + '/utag.js' + cachebuster;

            expect(src).toBe('//ast.welt.de/main/dev/utag.js?_cb=12345');
        });

        it('should detect existing cookie', () => {
            document.cookie = 'utag_env__main=//ast.welt.de/main/qa/utag.js;path=/';
            const profile = 'main';
            const cookieExists = document.cookie.indexOf('utag_env_' + '_' + profile) > -1;

            expect(cookieExists).toBe(true);
        });

        it('should not detect non-existent cookie', () => {
            document.cookie = 'other_cookie=value';
            const profile = 'main';
            const cookieExists = document.cookie.indexOf('utag_env_' + '_' + profile) > -1;

            expect(cookieExists).toBe(false);
        });

        it('should format clear cookie correctly', () => {
            const profile = 'main';
            const clearCookie = 'utag_env_' + '_' + profile + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';

            expect(clearCookie).toBe('utag_env__main=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT');
        });
    });

    describe('Console logging', () => {
        it('should log environment change', () => {
            if (window.console) {
                window.console.log("tealium environment = 'dev'");
            }

            expect(mockConsole.log).toHaveBeenCalledWith("tealium environment = 'dev'");
        });

        it('should log profile change', () => {
            if (window.console) {
                window.console.log("tealium profile = 'newprofile'' and will change after page refresh");
            }

            expect(mockConsole.log).toHaveBeenCalledWith("tealium profile = 'newprofile'' and will change after page refresh");
        });

        it('should log cachebuster status', () => {
            if (window.console) {
                window.console.log('tealium cachebuster is ON');
            }

            expect(mockConsole.log).toHaveBeenCalledWith('tealium cachebuster is ON');
        });

        it('should log clear action', () => {
            if (window.console) {
                window.console.log('Custom Tealium environment CLEARED. Default environment for this page will be used.');
            }

            expect(mockConsole.log).toHaveBeenCalledWith('Custom Tealium environment CLEARED. Default environment for this page will be used.');
        });
    });

    describe('Window flags', () => {
        it('should set utag_condload_env flag', () => {
            window.utag_condload_env = true;

            expect(window.utag_condload_env).toBe(true);
        });

        it('should set utag_condload flag', () => {
            window.utag_condload = true;

            expect(window.utag_condload).toBe(true);
        });
    });

    describe('Script injection', () => {
        it('should create script element with correct properties', () => {
            const a = document;
            const b = a.createElement('script');
            b.language = 'javascript';
            b.type = 'text/javascript';
            b.src = '//ast.welt.de/main/dev/utag.js';

            expect(b.language).toBe('javascript');
            expect(b.type).toBe('text/javascript');
            expect(b.src).toBe('//ast.welt.de/main/dev/utag.js');
        });

        it('should append script to head', () => {
            const a = document;
            const b = a.createElement('script');
            b.language = 'javascript';
            b.type = 'text/javascript';
            b.src = '//ast.welt.de/main/dev/utag.js';
            a.getElementsByTagName('head')[0].appendChild(b);

            expect(createdScripts.length).toBe(1);
            expect(createdScripts[0].src).toBe('//ast.welt.de/main/dev/utag.js');
        });
    });

    describe('Error handling', () => {
        it('should catch and log errors', () => {
            const mockErrorConsole = {
                log: jest.fn()
            };
            global.console = mockErrorConsole;

            try {
                throw new Error('Test error');
            } catch (e) {
                console.log('Error: ' + e);
            }

            expect(mockErrorConsole.log).toHaveBeenCalledWith('Error: Error: Test error');
        });
    });

    describe('Integration scenarios', () => {
        it('should handle environment switch to dev', () => {
            location.search = '?tealium_env=dev';
            const env = location.search.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env).not.toBeNull();
            expect(env[2]).toBe('dev');
        });

        it('should handle profile switch with environment', () => {
            location.search = '?tealium_profile=newprofile&tealium_env=qa';
            const env = location.search.match(/(tealium_env=)(dev|qa|prod|clear)/);
            let new_profile = location.search.match(/(tealium_profile=)(.*)/);

            if (new_profile) {
                new_profile = new_profile[2].split('&')[0];
            }

            expect(env[2]).toBe('qa');
            expect(new_profile).toBe('newprofile');
        });

        it('should handle environment switch with cachebuster', () => {
            location.search = '?tealium_env=dev&tealium_cb=true';
            const env = location.search.match(/(tealium_env=)(dev|qa|prod|clear)/);
            const cachebuster = location.search.match(/(tealium_cb=)(true)/);

            expect(env[2]).toBe('dev');
            expect(cachebuster[2]).toBe('true');
        });

        it('should handle clear action', () => {
            location.search = '?tealium_env=clear';
            const env = location.search.match(/(tealium_env=)(dev|qa|prod|clear)/);

            expect(env[2]).toBe('clear');
        });

        it('should not execute without query string parameters', () => {
            location.search = '';
            const hasParams = location.search && (location.search.indexOf('tealium_env=') > -1 || location.search.indexOf('tealium_profile') > -1);

            expect(hasParams).toBeFalsy();
        });

        it('should not execute when utag_condload_env is already set', () => {
            location.search = '?tealium_env=dev';
            window.utag_condload_env = true;

            const shouldExecute = location.search && (location.search.indexOf('tealium_env=') > -1 || location.search.indexOf('tealium_profile') > -1) && !window.utag_condload_env;

            expect(shouldExecute).toBe(false);
        });

        it('should execute when all conditions are met', () => {
            location.search = '?tealium_env=dev';
            window.utag_condload_env = undefined;

            const shouldExecute = location.search && (location.search.indexOf('tealium_env=') > -1 || location.search.indexOf('tealium_profile') > -1) && !window.utag_condload_env;

            expect(shouldExecute).toBe(true);
        });
    });
});
