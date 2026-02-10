import { JoinDataValuesConverter } from './JoinDataValuesConverter';
import { ExtensionData } from './types';

describe('Join Data Value Converter', () => {
    it('creates a join data values extension', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set CB sections',
          id: 43,
          scope: 'After Load Rules',
          conditions: [],
          configuration: {
            "147090402697400018_set_text": '',
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.cb_sections',
            delimiter: ',',
            defaultvalue: '',
            configs: [
              {set: 'js.page_channel1'},
              {set: "textvalue"},
              {text: "platform: beta"}
            ]

          },
          extensionType: 'Join Data Values',
          occurrence: 'Run Always',
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set CB sections 43 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = [b['page_channel1'], 'platform: beta'];\n`
        + `            b['cb_sections'] = c.join(',')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})(a, b, c, d);\n`

        expect(converter.convert(extension)).toBe(code);
    });

    it('creates a join data values extension, default values, multiple sets', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set IVW cp',
          id: 35,
          scope: '233,155',
          conditions: [],
          configuration: {
            '146788819930700022_set_text': 'a',
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.ivw_cp',
            delimiter: '_',
            defaultvalue: 'a_sonstige_test',
            configs: [
              { set: 'textvalue'}, 
              { set: 'js.page_channel1'},
              { set: 'js.page_type'}]
          },
          extensionType: 'Join Data Values',
          occurrence: null,
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set IVW cp 35 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = ['a', b['page_channel1'], b['page_type']];\n`
        + `            for (d = 0; d < c.length; d++) {\n`
        + `                if (typeof c[d] == 'undefined' || c[d] == '')\n`
        + `                    c[d] = 'a_sonstige_test'\n`
        + `            }\n`
        + `            b['ivw_cp'] = c.join('_')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})(a, b, c, d);\n`;

        expect(converter.convert(extension)).toBe(code);
    });

    it('creates a join data values extension, without default value, multiple sets', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set IVW cp',
          id: 35,
          scope: '233,155',
          conditions: [],
          configuration: {
            '146788819930700022_set_text': 'a',
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.ivw_cp',
            delimiter: '_',
            defaultvalue: '',
            configs: [
              { set: 'textvalue'}, 
              { set: 'js.page_channel1'},
              { set: 'js.page_type'}]
          },
          extensionType: 'Join Data Values',
          occurrence: null,
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set IVW cp 35 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = ['a', b['page_channel1'], b['page_type']];\n`
        + `            b['ivw_cp'] = c.join('_')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})(a, b, c, d);\n`;

        expect(converter.convert(extension)).toBe(code);
    });

    it('creates a join data values extension, test fallback if _set_text is undefined', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set IVW cp',
          id: 35,
          scope: '233,155',
          conditions: [],
          configuration: {
            '146788819930700022_set_text': undefined,
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.ivw_cp',
            delimiter: '_',
            defaultvalue: '',
            configs: [
              { set: 'textvalue'},
              { text: 'this should be used'},
              { set: 'js.page_channel1'},
              { set: 'js.page_type'}]
          },
          extensionType: 'Join Data Values',
          occurrence: null,
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set IVW cp 35 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = ['this should be used', b['page_channel1'], b['page_type']];\n`
        + `            b['ivw_cp'] = c.join('_')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})(a, b, c, d);\n`;

        expect(converter.convert(extension)).toBe(code);
    });

    describe('Security: escaping special characters', () => {
        it('escapes single quotes in extension name', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: "Test */ alert('XSS') /*",
                id: 99,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: 'js.test_var',
                    delimiter: ',',
                    defaultvalue: '',
                    configs: []
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Comment should be properly escaped
            expect(code).toContain("Test *\\/ alert('XSS') /*");
        });

        it('escapes single quotes in text values', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: 'Test',
                id: 100,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: 'js.test_var',
                    delimiter: ',',
                    defaultvalue: '',
                    configs: [
                        { set: 'textvalue', text: "it's a test" }
                    ]
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Text value should have escaped quote
            expect(code).toContain("'it\\'s a test'");
        });

        it('escapes backslashes in delimiter', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: 'Test',
                id: 101,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: 'js.test_var',
                    delimiter: '\\',
                    defaultvalue: '',
                    configs: []
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Delimiter should be properly escaped
            expect(code).toContain("c.join('\\\\')");
        });

        it('escapes quotes in default value', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: 'Test',
                id: 102,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: 'js.test_var',
                    delimiter: '_',
                    defaultvalue: "default'value",
                    configs: []
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Default value should have escaped quote
            expect(code).toContain("c[d] = 'default\\'value'");
        });

        it('escapes newlines in text values', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: 'Test',
                id: 103,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: 'js.test_var',
                    delimiter: ',',
                    defaultvalue: '',
                    configs: [
                        { set: 'textvalue', text: 'line1\nline2' }
                    ]
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Newline should be escaped
            expect(code).toContain("'line1\\nline2'");
        });

        it('escapes variable names with special characters', () => {
            const converter = new JoinDataValuesConverter();

            const extension: ExtensionData = {
                name: 'Test',
                id: 104,
                scope: 'After Load Rules',
                conditions: [],
                configuration: {
                    setoption: '',
                    set: '',
                    settotext: '',
                    settovar: '',
                    leadingdelimiter: false,
                    var: "js.test'var",
                    delimiter: ',',
                    defaultvalue: '',
                    configs: [
                        { set: "js.source'var" }
                    ]
                },
                extensionType: 'Join Data Values',
                occurrence: 'Run Always',
                loadRule: null
            };

            const code = converter.convert(extension) as string;
            
            // Variable names should be escaped
            expect(code).toContain("b['test\\'var']");
            expect(code).toContain("b['source\\'var']");
        });
    });
});
