import { PersistDataValueConverter } from './PersistDataValueConverter';
import { Configuration } from './types';

describe('PersistDataValueConverter', ()=> {
        it('creates empty javascript code', ()=> {
            const converter = new PersistDataValueConverter();

            const extension = {
                name: '',
                id: 165,
                scope: 'After Load Rules',
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
                } as Configuration
            }

            const code = ''
            + `/* Based on PERSIST DATA VALUE  0 */\n`
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


            const extension = {
                name: 'Adobe : Autocuration eVar241 for each page view',
                id: 474,
                scope: "233,206,155",
                conditions: [
                    [{
                        variable: "udo.event_name",
                        operator: "equals",
                        value: "autocuration"
                    }]
                ],
                configuration: {
                    setoption: 'var',
                    set: '',
                    settotext: '',
                    settovar: 'js.event_action',
                    var: "cp.utag_main_ac",
                    persistencetext: "",
                    allowupdate: "multiple",
                    constructor: "",
                    persistence: "session",
                    initialize: "",
                } as Configuration
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
    });