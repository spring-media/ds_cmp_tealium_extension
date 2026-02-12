import { Converter, ExtensionData } from './types';

export class PathnameTokenizerConverter implements Converter {
    convert(extension: ExtensionData): string | false {
        const code = '/* eslint-disable */\n'
        + `/* Based on PATHNAME TOKENIZER ${extension.name} ${extension.id} */\n`        
        + `(function(a, b, c) {\n`
        + `    if (typeof utag_data == 'undefined')\n`
        + `        utag_data = {};\n`
        + `    a = location.pathname.split('/');\n`
        + `    b = (a.length > 9) ? 9 : a.length;\n`
        + `    for (c = 1; c < b; c++) {\n`
        + `        utag_data['_pathname' + c] = (typeof a[c] != 'undefined') ? a[c] : ''\n`
        + `    }\n`
        + `})();\n`;
        return code;
    }
}
