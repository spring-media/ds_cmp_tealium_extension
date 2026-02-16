import { PathnameTokenizerConverter } from './PathnameTokenizerConverter';
import { ExtensionData } from './types';

describe('PathnameTokenizer', ()=> {
    it('create extension', ()=>{
        const converter = new PathnameTokenizerConverter();
        const extension: ExtensionData = {
            name: 'test name',
            id: 123,
            scope: '',
            extensionType: '',
            occurrence: null,
            loadRule: null,
            conditions: [],
            configuration: {}
        } 
        const code = `/* eslint-disable */\n`
        + `/* Based on PATHNAME TOKENIZER test name 123 */\n`
        + `(function(a, b, c) {\n`
        + `    try {\n`
        + `        if (typeof utag_data == 'undefined')\n`
        + `            utag_data = {};\n`
        + `        a = location.pathname.split('/');\n`
        + `        b = (a.length > 9) ? 9 : a.length;\n`
        + `        for (c = 1; c < b; c++) {\n`
        + `            utag_data['_pathname' + c] = (typeof a[c] != 'undefined') ? a[c] : ''\n`
        + `        }\n`
        + `    } catch(e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;
        expect(converter.convert(extension)).toBe(code);
    })
});