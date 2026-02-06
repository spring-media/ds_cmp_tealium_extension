import { SetDataValuesConverter } from './SetDataValuesConverter';
import { ExtensionData } from './types';

describe('SetDataValuesConverter', ()=>{
    it('creates empty javascript code', () => {

        const exampleExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            scope: '',
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
        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('creates javascript code with text config', () => {

        const exampleExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            scope: '',
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
        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('creates javascript code with code config', () => {

        const exampleExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            scope: '',
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
        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('creates javascript code with var config', () => {
        const exampleExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            scope: '',
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
            },
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
        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('creates javascript code with condition config', () => {
        const exampleExtension: ExtensionData = {
            name: 'just a test',
            id: 1234,
            scope: '',
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
        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });
});
