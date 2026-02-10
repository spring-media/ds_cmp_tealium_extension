import { LookupTableConverter, LookupTableExtensionData } from './LookupTableConverter';

describe('LookupTableConverter', () => {
    let converter: LookupTableConverter;

    beforeEach(() => {
        converter = new LookupTableConverter();
    });

    describe('convert', () => {
        it('should convert a simple equals lookup table', () => {
            const extension: LookupTableExtensionData = {
                name: 'Set Facebook vc.content_type',
                id: 132,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'article', value: 'product' },
                        { name: 'live', value: 'product' },
                        { name: 'video', value: 'product' },
                        { logic: 'false' },
                    ],
                    vartype: 'string',
                    settotext: 'product',
                    var: 'js.fb_vc_content_type',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.page_type',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain('/* Based on LOOKUP TABLE Set Facebook vc.content_type 132 */');
            expect(result).toContain("if (b['page_type'] == 'article')");
            expect(result).toContain("b['fb_vc_content_type'] = 'product'");
            expect(result).toContain("} else if (b['page_type'] == 'live')");
            expect(result).toContain("} else if (b['page_type'] == 'video')");
            expect(result).toContain("} else {");
            expect(result).toContain("b['fb_vc_content_type'] = 'product'");
        });

        it('should convert a lookup table with logic=true (use default on no match)', () => {
            const extension: LookupTableExtensionData = {
                name: 'ADOBE : set suite by environment',
                id: 164,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'dev', value: 'axelspringerweltdev' },
                        { name: 'qa', value: 'axelspringerweltdev' },
                        { name: 'prod', value: 'axelspringerwelt' },
                        { logic: 'true' },
                    ],
                    vartype: 'string',
                    var: 'js.ad_suite',
                    settotext: '',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.ut.env',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['ut.env'] == 'dev')");
            expect(result).toContain("b['ad_suite'] = 'axelspringerweltdev'");
            expect(result).toContain("} else if (b['ut.env'] == 'qa')");
            expect(result).toContain("} else if (b['ut.env'] == 'prod')");
            expect(result).toContain("b['ad_suite'] = 'axelspringerwelt'");
            // With logic=true and empty settotext, should not have else clause with default
            expect(result).not.toContain("} else {");
        });

        it('should convert a contains filter type lookup table', () => {
            const extension: LookupTableExtensionData = {
                name: 'Adobe : Page Editor Team (taxonomie)',
                id: 308,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'Investiga', value: 'Investigation & Reportage' },
                        { name: 'Newsteam', value: 'Nachrichten & Unterhaltung' },
                        { name: '2news', value: 'Bot Article' },
                        { logic: 'true' },
                    ],
                    vartype: 'string',
                    filtertype: 'contains',
                    varlookup: 'js.page_keywords_string',
                    var: 'js.page_editor_team',
                    settotext: '',
                    constructor: '',
                    initialize: '',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['page_keywords_string'] && b['page_keywords_string'].indexOf('Investiga') !== -1)");
            expect(result).toContain("b['page_editor_team'] = 'Investigation & Reportage'");
            expect(result).toContain("} else if (b['page_keywords_string'] && b['page_keywords_string'].indexOf('Newsteam') !== -1)");
            expect(result).toContain("b['page_editor_team'] = 'Nachrichten & Unterhaltung'");
        });

        it('should handle cookie prefix (cp.) in varlookup', () => {
            const extension: LookupTableExtensionData = {
                name: 'Google Prop Lookup State',
                id: 336,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'true', value: 'subscriber' },
                        { name: 'false', value: 'non_subscriber' },
                        { logic: 'false' },
                    ],
                    vartype: 'string',
                    settotext: 'unkown',
                    var: 'js.gps_state',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'cp.utag_main_va',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['utag_main_va'] == 'true')");
            expect(result).toContain("b['gps_state'] = 'subscriber'");
            expect(result).toContain("} else if (b['utag_main_va'] == 'false')");
            expect(result).toContain("b['gps_state'] = 'non_subscriber'");
            expect(result).toContain("} else {");
            expect(result).toContain("b['gps_state'] = 'unkown'");
        });

        it('should handle conditions', () => {
            const extension: LookupTableExtensionData = {
                name: 'Conditional Lookup',
                id: 999,
                conditions: [[{ variable: 'js.page_type', operator: 'equals', value: 'article' }]],
                configuration: {
                    configs: [
                        { name: 'desktop', value: 'welt' },
                        { name: 'mobile', value: 'mobwelt' },
                        { logic: 'false' },
                    ],
                    vartype: 'string',
                    var: 'js.ivw_platform',
                    settotext: 'mobwelt',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.page_platform',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['js.page_type'] == 'article')");
            expect(result).toContain("if (b['page_platform'] == 'desktop')");
        });

        it('should return false for empty configs', () => {
            const extension: LookupTableExtensionData = {
                name: 'Empty Lookup',
                id: 999,
                conditions: [],
                configuration: {
                    configs: [{ logic: 'false' }],
                    vartype: 'string',
                    var: 'js.test',
                    settotext: '',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.source',
                },
            };

            const result = converter.convert(extension);

            expect(result).toBe(false);
        });

        it('should handle logic=false with default value', () => {
            const extension: LookupTableExtensionData = {
                name: 'IVW Platform for IVW Mediatracking',
                id: 311,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'desktop', value: 'welt' },
                        { name: 'mobile', value: 'mobwelt' },
                        { name: 'amp', value: 'mobwelt' },
                        { logic: 'false' },
                    ],
                    vartype: 'string',
                    var: 'js.ivw_platform',
                    settotext: 'mobwelt',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.page_platform',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['page_platform'] == 'desktop')");
            expect(result).toContain("b['ivw_platform'] = 'welt'");
            expect(result).toContain("} else if (b['page_platform'] == 'mobile')");
            expect(result).toContain("} else if (b['page_platform'] == 'amp')");
            expect(result).toContain("b['ivw_platform'] = 'mobwelt'");
            expect(result).toContain("} else {");
            expect(result).toContain("b['ivw_platform'] = 'mobwelt'");
        });

        it('should handle logic=true with default value', () => {
            const extension: LookupTableExtensionData = {
                name: 'Test with default',
                id: 999,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'option1', value: 'value1' },
                        { name: 'option2', value: 'value2' },
                        { logic: 'true' },
                    ],
                    vartype: 'string',
                    var: 'js.target',
                    settotext: 'default_value',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'js.source',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['source'] == 'option1')");
            expect(result).toContain("b['target'] = 'value1'");
            expect(result).toContain("} else if (b['source'] == 'option2')");
            expect(result).toContain("b['target'] = 'value2'");
            expect(result).toContain("} else {");
            expect(result).toContain("b['target'] = 'default_value'");
        });

        it('should handle udo. prefix in varlookup', () => {
            const extension: LookupTableExtensionData = {
                name: 'UDO Lookup',
                id: 999,
                conditions: [],
                configuration: {
                    configs: [
                        { name: 'test', value: 'result' },
                        { logic: 'false' },
                    ],
                    vartype: 'string',
                    var: 'js.output',
                    settotext: '',
                    constructor: '',
                    filtertype: 'equals',
                    initialize: '',
                    varlookup: 'udo.input_var',
                },
            };

            const result = converter.convert(extension);

            expect(result).toContain("if (b['input_var'] == 'test')");
            expect(result).toContain("b['output'] = 'result'");
        });
    });
});
