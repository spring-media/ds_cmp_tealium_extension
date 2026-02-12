import { LookupTableConverter } from './LookupTableConverter';
import { ExtensionData, LookupTableConfiguration } from './types';

describe('LookupTableConverter', () => {
    it('creates lookup table with equals filter and logic=false', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Set Facebook vc.content_type',
            id: 132,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'article', value: 'product' },
                    { name: 'live', value: 'product' },
                    { name: 'video', value: 'product' },
                    { logic: 'false' }
                ],
                vartype: 'string',
                settotext: 'product',
                var: 'js.fb_vc_content_type',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.page_type'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE Set Facebook vc.content_type 132 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['page_type'] == 'article') {\n" +
            "                b['fb_vc_content_type'] = 'product';\n" +
            "            } else if (b['page_type'] == 'live') {\n" +
            "                b['fb_vc_content_type'] = 'product';\n" +
            "            } else if (b['page_type'] == 'video') {\n" +
            "                b['fb_vc_content_type'] = 'product';\n" +
            '            } else {\n' +
            "                b['fb_vc_content_type'] = 'product';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('creates lookup table with equals filter and logic=true (no default)', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'ADOBE : set suite by environment',
            id: 164,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'dev', value: 'axelspringerweltdev' },
                    { name: 'qa', value: 'axelspringerweltdev' },
                    { name: 'prod', value: 'axelspringerwelt' },
                    { logic: 'true' }
                ],
                vartype: 'string',
                var: 'js.ad_suite',
                settotext: '',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.ut.env'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE ADOBE : set suite by environment 164 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['ut.env'] == 'dev') {\n" +
            "                b['ad_suite'] = 'axelspringerweltdev';\n" +
            "            } else if (b['ut.env'] == 'qa') {\n" +
            "                b['ad_suite'] = 'axelspringerweltdev';\n" +
            "            } else if (b['ut.env'] == 'prod') {\n" +
            "                b['ad_suite'] = 'axelspringerwelt';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('creates lookup table with contains filter', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Adobe : Page Editor Team (taxonomie)',
            id: 308,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'Investiga', value: 'Investigation & Reportage' },
                    { name: 'Newsteam', value: 'Nachrichten & Unterhaltung' },
                    { name: '2news', value: 'Bot Article' },
                    { logic: 'true' }
                ],
                vartype: 'string',
                filtertype: 'contains',
                varlookup: 'js.page_keywords_string',
                var: 'js.page_editor_team',
                settotext: '',
                constructor: '',
                initialize: ''
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE Adobe : Page Editor Team (taxonomie) 308 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['page_keywords_string'] && b['page_keywords_string'].indexOf('Investiga') !== -1) {\n" +
            "                b['page_editor_team'] = 'Investigation & Reportage';\n" +
            "            } else if (b['page_keywords_string'] && b['page_keywords_string'].indexOf('Newsteam') !== -1) {\n" +
            "                b['page_editor_team'] = 'Nachrichten & Unterhaltung';\n" +
            "            } else if (b['page_keywords_string'] && b['page_keywords_string'].indexOf('2news') !== -1) {\n" +
            "                b['page_editor_team'] = 'Bot Article';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('handles cookie prefix (cp.) in varlookup', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Google Prop Lookup State',
            id: 336,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'true', value: 'subscriber' },
                    { name: 'false', value: 'non_subscriber' },
                    { logic: 'false' }
                ],
                vartype: 'string',
                settotext: 'unkown',
                var: 'js.gps_state',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'cp.utag_main_va'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE Google Prop Lookup State 336 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['utag_main_va'] == 'true') {\n" +
            "                b['gps_state'] = 'subscriber';\n" +
            "            } else if (b['utag_main_va'] == 'false') {\n" +
            "                b['gps_state'] = 'non_subscriber';\n" +
            '            } else {\n' +
            "                b['gps_state'] = 'unkown';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('handles conditions correctly', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Conditional Lookup',
            id: 999,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [[{ variable: 'js.page_type', operator: 'equals', value: 'article' }]],
            configuration: {
                configs: [
                    { name: 'desktop', value: 'welt' },
                    { name: 'mobile', value: 'mobwelt' },
                    { logic: 'false' }
                ],
                vartype: 'string',
                var: 'js.ivw_platform',
                settotext: 'mobwelt',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.page_platform'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE Conditional Lookup 999 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            "        if (b['js.page_type'] == 'article') {\n" +
            "            if (b['page_platform'] == 'desktop') {\n" +
            "                b['ivw_platform'] = 'welt';\n" +
            "            } else if (b['page_platform'] == 'mobile') {\n" +
            "                b['ivw_platform'] = 'mobwelt';\n" +
            '            } else {\n' +
            "                b['ivw_platform'] = 'mobwelt';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('returns false for empty configs', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Empty Lookup',
            id: 999,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [{ logic: 'false' }],
                vartype: 'string',
                var: 'js.test',
                settotext: '',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.source'
            } as LookupTableConfiguration
        };

        expect(converter.convert(extension)).toBe(false);
    });

    it('creates lookup table with logic=false and default value', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'IVW Platform for IVW Mediatracking',
            id: 311,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'desktop', value: 'welt' },
                    { name: 'mobile', value: 'mobwelt' },
                    { name: 'amp', value: 'mobwelt' },
                    { logic: 'false' }
                ],
                vartype: 'string',
                var: 'js.ivw_platform',
                settotext: 'mobwelt',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.page_platform'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE IVW Platform for IVW Mediatracking 311 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['page_platform'] == 'desktop') {\n" +
            "                b['ivw_platform'] = 'welt';\n" +
            "            } else if (b['page_platform'] == 'mobile') {\n" +
            "                b['ivw_platform'] = 'mobwelt';\n" +
            "            } else if (b['page_platform'] == 'amp') {\n" +
            "                b['ivw_platform'] = 'mobwelt';\n" +
            '            } else {\n' +
            "                b['ivw_platform'] = 'mobwelt';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('creates lookup table with logic=true and default value', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'Test with default',
            id: 999,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'option1', value: 'value1' },
                    { name: 'option2', value: 'value2' },
                    { logic: 'true' }
                ],
                vartype: 'string',
                var: 'js.target',
                settotext: 'default_value',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'js.source'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE Test with default 999 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['source'] == 'option1') {\n" +
            "                b['target'] = 'value1';\n" +
            "            } else if (b['source'] == 'option2') {\n" +
            "                b['target'] = 'value2';\n" +
            '            } else {\n' +
            "                b['target'] = 'default_value';\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });

    it('handles udo. prefix in varlookup', () => {
        const converter = new LookupTableConverter();

        const extension: ExtensionData = {
            name: 'UDO Lookup',
            id: 999,
            scope: 'After Load Rules',
            extensionType: 'Lookup Table',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {
                configs: [
                    { name: 'test', value: 'result' },
                    { logic: 'false' }
                ],
                vartype: 'string',
                var: 'js.output',
                settotext: '',
                constructor: '',
                filtertype: 'equals',
                initialize: '',
                varlookup: 'udo.input_var'
            } as LookupTableConfiguration
        };

        const expectedCode =
            '/* eslint-disable */\n' +
            '/* Based on LOOKUP TABLE UDO Lookup 999 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            '        if (1) {\n' +
            "            if (b['input_var'] == 'test') {\n" +
            "                b['output'] = 'result';\n" +
            '            } else {\n' +
            "                b['output'] = undefined;\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';

        expect(converter.convert(extension)).toBe(expectedCode);
    });
});
