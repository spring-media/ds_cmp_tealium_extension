import { Scope } from '../../TealiumAPI';
import { Converter, ExtensionData, JoinDataValuesConfiguration } from './types';

export class JoinDataValuesConverter implements Converter {
    convert(extension: ExtensionData): string | false {

        const config = extension.configuration as JoinDataValuesConfiguration;

        if(extension.extensionType !== 'Join Data Values') {
            throw new Error(`Wrong type. Join Data Values expected. Was ${extension.extensionType}`);
        }

        if(!Scope.isTagScoped(extension.scope) && !['After Load Rules'].includes(extension.scope)) {
            throw new Error(`Wrong scope. Scope ${extension.scope} not supported.`);
        }

        if(extension.occurrence && !['Run Always'].includes(extension.occurrence)) {
            throw new Error(`Wrong occurrence. Occurrence ${extension.occurrence} not supported.`);
        }

        if(extension.loadRule != null) {
            throw new Error('loadRule: not supported');            
        }

        if(config.leadingdelimiter) {
            throw new Error('leadingdelimiter: true not supported');            
        }

        const condition = '1';
        const setStatement = this.createSetStatement(config);
        const defaultStatement = this.createDefaultStatement(config);
        const dstVariable = config.var.replace('js.', '');

        const code = `/* Based on JOIN DATA VALUES ${extension.name} ${extension.id} */\n`
        + '/* global utag, a, b */\n'
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (${condition}) {\n`
        + `            ${setStatement}${defaultStatement}`
        + `            b['${dstVariable}'] = c.join('${config.delimiter}')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})(a, b, c, d);\n`;
        return code;
    }

    private createSetStatement(config: JoinDataValuesConfiguration) {

        const items: string[] = []
        for(let i = 0; i < config.configs.length; i++) {
            const c = config.configs[i] ?? {};
            if(c.set === 'textvalue') {
                // is there something with _set_text?
                let value = '';
                const textKey: string | undefined = Object.keys(config).find(key => key.endsWith('_set_text'));
                if(textKey) {
                   value = (config as any)[textKey] ?? '';
                }
                if(value === '') {
                    value = this.findNextTextItem(config, i)
                }

                items.push(`'${value}'`);
            } else if(c.set !== undefined) {
                items.push(`b['${c.set?.replace('js.', '')}']`);
            }
        }

        return `c = [${items.join(', ')}];\n`;
        // return `            c = [b['page_channel1'], 'platform: beta'];\n`;
    }

    private createDefaultStatement(config: JoinDataValuesConfiguration) {
        if(config.defaultvalue === '') {
            return '';
        }
        const code = ''
        + `            for (d = 0; d < c.length; d++) {\n`
        + `                if (typeof c[d] == 'undefined' || c[d] == '')\n`
        + `                    c[d] = '${config.defaultvalue}'\n`
        + `            }\n`;
        return code;
    }

    private findNextTextItem(config: JoinDataValuesConfiguration, startIndex: number) {
        for(let i = startIndex; i < config.configs.length; i++) {
            const item = config.configs[i];
            if(item?.text) {
                return item.text;
            }
        }
        return '';
    }
}
