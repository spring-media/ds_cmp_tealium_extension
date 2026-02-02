import { createCondition, ExtensionData, SetDataValuesConverter } from './Converter';

describe('create Javascript Code from JSON', () => {

    describe('create condition', () => {

        it('returns undefined if conditions empty', () => {
            const condition = createCondition([]);
            expect(condition).toBe('1');
        });

        it('returns equals value condition', () => {
            const condition = createCondition([[{
                variable: 'udo.page_name',
                operator: 'equals',
                value: 'Podigee-Standalone'
            }]]);
            expect(condition).toBe("b['page_name'] == 'Podigee-Standalone'");
        });

        it('returns does_not_equal value condition', () => {
            const condition = createCondition([[{
                variable: 'udo.page_name',
                operator: 'does_not_equal',
                value: 'Podigee-Standalone'
            }]]);
            expect(condition).toBe("b['page_name'] != 'Podigee-Standalone'");
        });

        it('returns equals_ignore_case value condition', () => {
            const condition = createCondition([[{
                variable: 'cp.utag_main_va',
                operator: 'equals_ignore_case',
                value: 'false'
            }]]);
            expect(condition).toBe("b['cp.utag_main_va'].toString().toLowerCase() == 'false'.toLowerCase()");
        });

        it('returns contains_ignore_case value condition', () => {
            const condition = createCondition([[{
                variable: 'dom.query_string',
                operator: 'contains_ignore_case',
                value: 'notify=success_subscription'
            }]]);
            expect(condition).toBe("b['dom.query_string'].toString().toLowerCase().indexOf('notify=success_subscription'.toLowerCase()) > -1");
        });

        it('returns starts_with value condition', () => {

            const condition = createCondition([[{
                variable: 'udo.dom.pathname',
                operator: 'starts_with',
                value: '/vergleich/'
            }]]);
            expect(condition).toBe("/^\/vergleich\//.test(b['dom.pathname'])");
        });

        it('returns less_than value condition', () => {
            const condition = createCondition([[{
                variable: 'dom.viewport_width',
                operator: 'less_than',
                value: '600'
            }]]);
            expect(condition).toBe("parseFloat(b['dom.viewport_width']) < parseFloat(600)");
        });

        it('returns less_than_equal_to value condition', () => {
            const condition = createCondition([[{
                variable: 'dom.viewport_width',
                operator: 'less_than_equal_to',
                value: '600'
            }]]);
            expect(condition).toBe("parseFloat(b['dom.viewport_width']) <= parseFloat(600)");
        });

        it('returns greater_than value condition', () => {
            const condition = createCondition([[{
                variable: 'dom.viewport_width',
                operator: 'greater_than',
                value: '600'
            }]]);
            expect(condition).toBe("parseFloat(b['dom.viewport_width']) > parseFloat(600)");
        });

        it('returns defined value condition', () => {
            const condition = createCondition([[{
                variable: 'page_authorNames',
                operator: 'defined',
                value: ''
            }]]);
            expect(condition).toBe("typeof b['page_authorNames'] != 'undefined'");
        });

        it('returns notdefined value condition', () => {
            const condition = createCondition([[{
                variable: 'page_authorNames',
                operator: 'notdefined',
                value: ''
            }]]);
            expect(condition).toBe("typeof b['page_authorNames'] == 'undefined'");
        });

        it('returns contains value condition', () => {
            const condition = createCondition([[{
                variable: 'page_authorNames',
                operator: 'notdefined',
                value: ''
            }]]);
            expect(condition).toBe("typeof b['page_authorNames'] == 'undefined'");
        });

        it('returns does_not_contain value condition', () => {
            const condition = createCondition([[{
                variable: 'udo.page_keywords_string',
                operator: 'does_not_contain',
                value: 'Newsteam'
            }]]);
            expect(condition).toBe("b['page_keywords_string'].toString().indexOf('Newsteam') < 0");
        });

        it('returns equals value condition combined with &&', () => {
            const condition = createCondition([[{
                variable: 'udo.var1',
                operator: 'equals',
                value: 'value1'
            }, {
                variable: 'var2',
                operator: 'equals',
                value: 'value2'
            }]]);
            expect(condition).toBe("(b['var1'] == 'value1' && b['var2'] == 'value2')");
        });

        it('returns notpopulated value condition', () => {
            const condition = createCondition([[{
                variable: 'udo.user_ssoId',
                operator: 'notpopulated',
                value: ''
            }]]);
            expect(condition).toBe("b['user_ssoId'] == ''");
        });

        it('returns equals value condition combined with &&', () => {
            const condition = createCondition([
                [
                    {
                        variable: 'udo.var1',
                        operator: 'equals',
                        value: 'value1'
                    }
                ],
                [
                    {
                        variable: 'var2',
                        operator: 'equals',
                        value: 'value2'
                    }
                ]
            ]);
            expect(condition).toBe("(b['var1'] == 'value1' || b['var2'] == 'value2')");
        });
    });

    describe('SetDataValueConverter', ()=>{
        it('creates empty javascript code', () => {

            const exampeExtension: ExtensionData = {
                name: 'just a test',
                id: 1234,
                conditions: [],
                configuration: {
                    configs: []
                }
            }

            const converter = new SetDataValuesConverter();
            const resultingCode = ''
            + '/* eslint-disable */\n'
            + '/* Based on SET DATA VALUE just a test 1234 */\n'
            + '/* global utag, a, b */\n'
            + '(function(a, b) {\n'
            + '    try {\n'
            + '        if (1) {\n'
            + '        }\n'
            + '    } catch (e) {\n'
            + '        window.utag.DB(e);\n'
            + '    }\n'
            + '})();\n';
            expect(converter.convert(exampeExtension)).toBe(resultingCode);
        });

        it('creates javascript code with text config', () => {

            const exampeExtension: ExtensionData = {
                name: 'just a test',
                id: 1234,
                conditions: [],
                configuration: {
                    configs: [
                        {
                            setoption: 'text',
                            set: 'testVar',
                            settotext: 'Hello World!',
                            settovar: ''
                        }
                    ]
                }
            }

            const converter = new SetDataValuesConverter();
            const resultingCode = ''
            + '/* eslint-disable */\n'
            + '/* Based on SET DATA VALUE just a test 1234 */\n'
            + '/* global utag, a, b */\n'
            + '(function(a, b) {\n'
            + '    try {\n'
            + '        if (1) {\n'
            + "             b['testVar'] = 'Hello World!';\n"
            + '        }\n'
            + '    } catch (e) {\n'
            + '        window.utag.DB(e);\n'
            + '    }\n'
            + '})();\n';
            expect(converter.convert(exampeExtension)).toBe(resultingCode);
        });

        it('creates javascript code with code config', () => {

            const exampeExtension: ExtensionData = {
                name: 'just a test',
                id: 1234,
                conditions: [],
                configuration: {
                    configs: [
                        {
                            setoption: 'code',
                            set: 'js.testVar',
                            settotext: 'a == b',
                            settovar: ''
                        }
                    ]
                }
            }

            const converter = new SetDataValuesConverter();
            const resultingCode = ''
            + '/* eslint-disable */\n'
            + '/* Based on SET DATA VALUE just a test 1234 */\n'
            + '/* global utag, a, b */\n'
            + '(function(a, b) {\n'
            + '    try {\n'
            + '        if (1) {\n'
            + '            try {\n'
            + "                b['testVar'] = a == b;\n"
            + '            } catch (e) {}\n' 
            + '        }\n'
            + '    } catch (e) {\n'
            + '        window.utag.DB(e);\n'
            + '    }\n'
            + '})();\n';
            expect(converter.convert(exampeExtension)).toBe(resultingCode);
        });
    });

    it('creates javascript code with var config', () => {
        const exampeExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            conditions: [],
            configuration: {
                configs: [
                    {
                        setoption: 'var',
                        set: 'js.testVar',
                        settovar: 'udo.srcVar',
                        settotext: ''
                    }
                ]
            }
        }

        const converter = new SetDataValuesConverter();
        const resultingCode = ''
        + '/* eslint-disable */\n'
        + '/* Based on SET DATA VALUE just a test 1234 */\n'
        + '/* global utag, a, b */\n'
        + '(function(a, b) {\n'
        + '    try {\n'
        + '        if (1) {\n'
        + "            b['testVar'] = b['srcVar'];\n"
        + '        }\n'
        + '    } catch (e) {\n'
        + '        window.utag.DB(e);\n'
        + '    }\n'
        + '})();\n';
        expect(converter.convert(exampeExtension)).toBe(resultingCode);
    });

    it('creates javascript code with condition config', () => {
        const exampeExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            conditions: [[{ variable: 'udo.test', operator: 'equals', value: 'hello world'}]],
            configuration: {
                configs: [
                    {
                        setoption: 'var',
                        set: 'js.testVar',
                        settovar: 'udo.srcVar',
                        settotext: ''
                    }
                ]
            }
        }

        const converter = new SetDataValuesConverter();
        const resultingCode = ''
        + '/* eslint-disable */\n'
        + '/* Based on SET DATA VALUE just a test 1234 */\n'
        + '/* global utag, a, b */\n'
        + '(function(a, b) {\n'
        + '    try {\n'
        + "        if (b['test'] == 'hello world') {\n"
        + "            b['testVar'] = b['srcVar'];\n"
        + '        }\n'
        + '    } catch (e) {\n'
        + '        window.utag.DB(e);\n'
        + '    }\n'
        + '})();\n';
        expect(converter.convert(exampeExtension)).toBe(resultingCode);
    });
});
