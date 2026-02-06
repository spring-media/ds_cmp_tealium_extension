import { ExtensionData, SetDataValuesConverter } from './SetDataValuesConverter';

describe('SetDataValuesConverter', ()=>{
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
        + "            b['testVar'] = 'Hello World!';\n"
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
