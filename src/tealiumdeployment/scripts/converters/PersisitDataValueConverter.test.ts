import { PersistDataValueConverter } from './PersistDataValueConverter';
import { Configuration, ExtensionData, PersistDataValueConfiguration } from './types';

describe('PersistDataValueConverter', ()=> {
    it('creates empty javascript code', ()=> {
        const converter = new PersistDataValueConverter();

        const extension: ExtensionData = {
            name: '',
            id: 165,
            scope: 'After Load Rules',
            extensionType: '',
            occurrence: null,
            loadRule: null,
            conditions: [
                [{
                    variable: "qp.activate_tag",
                    operator: "populated",
                    value: ""
                }]
            ],
            configuration: {
                setoption: 'var',
                set: '',
                settotext: '',
                settovar: 'qp.activate_tag',
                var: "cp.activate_tag",
                persistencetext: "",
                allowupdate: "multiple",
                constructor: "",
                persistence: "session",
                initialize: "",
                configs: []
            } as PersistDataValueConfiguration
        }

        const code = ''
        + `/* Based on PERSIST DATA VALUE  165 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b) {\n`
        + `    try {\n`
        + `        if (typeof b['qp.activate_tag'] != 'undefined' && b['qp.activate_tag'] != '') {\n`
        + `            document.cookie = "activate_tag=" + b['qp.activate_tag'] + ";path=/;domain=" + utag.cfg.domain + ";expires=";\n`
        + `            b['cp.activate_tag'] = b['qp.activate_tag'];\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;
        expect(converter.convert(extension)).toBe(code);

    })

    it('creates another on', ()=> {
        const converter = new PersistDataValueConverter();


        const extension: ExtensionData = {
            name: 'Adobe : Autocuration eVar241 for each page view',
            id: 474,
            scope: '233,206,155',
            extensionType: '',
            occurrence: null,
            loadRule: null,
            conditions: [
                [{
                    variable: 'udo.event_name',
                    operator: 'equals',
                    value: 'autocuration'
                }]
            ],
            configuration: {
                setoption: 'var',
                set: '',
                settotext: '',
                settovar: 'js.event_action',
                var: 'cp.utag_main_ac',
                persistencetext: '',
                allowupdate: 'multiple',
                constructor: '',
                persistence: 'session',
                initialize: '',
            } as PersistDataValueConfiguration
        }

        const code = ''
        + `/* Based on PERSIST DATA VALUE Adobe : Autocuration eVar241 for each page view 474 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b) {\n`
        + `    try {\n`
        + `        if (b['event_name'] == 'autocuration') {\n`
        + `            utag.loader.SC('utag_main', {\n`
        + `                'ac': b['event_action'] + ';exp-session'\n`
        + `            });\n`
        + `            b['cp.utag_main_ac'] = b['event_action'];\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;
        expect(converter.convert(extension)).toBe(code);
    })

    it('tests with allowupdate once and persistence visitor', ()=> {
        const converter = new PersistDataValueConverter();

        const extension: ExtensionData = {
            name: 'SSO Id in utag_main speichern',
            id: 339,
            scope: 'After Load Rules',
            extensionType: '',
            occurrence: null,
            loadRule: null,
            conditions: [
                [{
                    variable: 'udo.user_ssoId',
                    operator: 'defined',
                    value: ''
                }]
            ],
            configuration: {
                setoption: 'var',
                set: '',
                settotext: '',
                settovar: 'js.user_ssoId',
                var: 'cp.utag_main_uid',
                persistencetext: '',
                allowupdate: 'once',
                constructor: '',
                persistence: 'visitor',
                initialize: '',
            } as PersistDataValueConfiguration
        }

        const code = ''
        + `/* Based on PERSIST DATA VALUE SSO Id in utag_main speichern 339 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b) {\n`
        + `    try {\n`
        + `        if (typeof b['user_ssoId'] != 'undefined') {\n`
        + `            if (typeof b['cp.utag_main_uid'] == 'undefined') {\n`
        + `                utag.loader.SC('utag_main', {\n`
        + `                    'uid': b['user_ssoId']\n`
        + `                });\n`
        + `                b['cp.utag_main_uid'] = b['user_ssoId'];\n`
        + `            }\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;

        expect(converter.convert(extension)).toBe(code);
    })

    it('tests with allowupdate once', ()=> {
        const converter = new PersistDataValueConverter();

        const extension: ExtensionData = {
            name: 'ADOBE : persist first referrer',
            id: 173,
            scope: '155',
            extensionType: '',
            occurrence: null,
            loadRule: null,
            conditions: [
                [{
                    "variable": "cp.utag_main__ss",
                    "operator": "contains",
                    "value": "1"
                }]
            ],
            configuration: {
                setoption: 'var',
                set: '',
                settotext: '',
                settovar: 'js.ad_referrer_first',
                var: 'cp.utag_main_ref_first',
                persistencetext: '',
                allowupdate: 'once',
                constructor: '',
                persistence: 'session',
                initialize: '',
                configs: []
            } as PersistDataValueConfiguration
        }

        const code = ''
        + `/* Based on PERSIST DATA VALUE ADOBE : persist first referrer 173 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b) {\n`
        + `    try {\n`
        + `        if (b['cp.utag_main__ss'].toString().indexOf('1') > -1) {\n`
        + `            if (typeof b['cp.utag_main_ref_first'] == 'undefined') {\n`
        + `                utag.loader.SC('utag_main', {\n`
        + `                    'ref_first': b['ad_referrer_first'] + ';exp-session'\n`
        + `                });\n`
        + `                b['cp.utag_main_ref_first'] = b['ad_referrer_first'];\n`
        + `            }\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;

        expect(converter.convert(extension)).toBe(code);
    })
});