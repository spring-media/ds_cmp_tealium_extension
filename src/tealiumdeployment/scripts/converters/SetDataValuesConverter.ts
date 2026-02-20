import { createCondition } from '../conditions';
import { ConfigurationGroup, Converter, ExtensionData } from '../converters/types';

export class SetDataValuesConverter implements Converter {
    public convert(extension: ExtensionData): string | false {

        const conditionCode = createCondition(extension.conditions);
        const logic = this.createLogic(extension);
        if (logic === false) {
            return false;
        }

        // Put together all code
        const code = '/* eslint-disable */\n' +
        `/* Based on SET DATA VALUE ${extension.name} ${extension.id} */\n` +
        '/* global utag, a, b */\n' +
        '(function(a, b) {\n' +
        '    try {\n' +
        `        if (${conditionCode}) {\n` +
        logic +
        '        }\n' +
        '    } catch (e) {\n' +
        '        window.utag.DB(e);\n' +
        '    }\n' +
        '})(a, b);\n';
        return code;
    }

    private createLogic(extension: ExtensionData): string | false{
        let logic = '';
        const configGroup = extension.configuration as ConfigurationGroup;
        for (const config of configGroup.configs) {
            const setoption = config.setoption;
            const column = config.set.replace('js.', '');
            const value = config.settotext;

             if (setoption == 'text') {
                logic +=
                `            b['${column}'] = '${value}';\n`;
            } else if (setoption == 'code') {
                logic +=
                '            try {\n' +
                `                b['${column}'] = ${value}${value.endsWith(';') ? '' : ';'}\n` +
                '            } catch (e) {}\n';
            } else if (setoption == 'var') {
                const sourceVar = config.settovar
                    .replace('js.', '')
                    .replace('udo.', '');

                logic += `            b['${column}'] = b['${sourceVar}'];\n`;
            } else {
                return false;
            }
        }
        return logic;
    }
}
