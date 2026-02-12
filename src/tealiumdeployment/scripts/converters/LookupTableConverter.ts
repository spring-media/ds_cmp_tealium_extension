import { createCondition } from '../conditions';
import { Converter, ExtensionData, LookupTableConfiguration } from './types';

export class LookupTableConverter implements Converter {
    public convert(extension: ExtensionData): string | false {
        // Simple casting - following the same pattern as other converters
        const config = extension.configuration as LookupTableConfiguration;

        // Validate required properties
        if (!config.configs || !config.varlookup || !config.var || !config.filtertype) {
            return false;
        }

        // Generate code directly - no intermediate object needed
        const conditionCode = createCondition(extension.conditions);
        const logic = this.createLogic(config);

        if (logic === false) {
            console.log('skipped');
            return false;
        }

        // Put together all code
        const code =
            '/* eslint-disable */\n' +
            `/* Based on LOOKUP TABLE ${extension.name} ${extension.id} */\n` +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            `        if (${conditionCode}) {\n` +
            logic +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})();\n';
        return code;
    }

    private createLogic(config: LookupTableConfiguration): string | false {
        const lookupVar = config.varlookup.replace('js.', '').replace('udo.', '').replace('cp.', '');
        const targetVar = config.var.replace('js.', '');
        const filterType = config.filtertype;
        const defaultValue = config.settotext || '';
        const lookupEntries = config.configs.filter((c) => c.name !== undefined);
        const logicEntry = config.configs.find((c) => c.logic !== undefined);
        const useDefaultOnNoMatch = logicEntry?.logic === 'true';

        if (lookupEntries.length === 0) {
            return false;
        }

        let logic = '';

        // Generate if-else chain for lookup
        lookupEntries.forEach((entry, index) => {
            const lookupKey = entry.name || '';
            const lookupValue = entry.value || '';
            const indent = index === 0 ? '            ' : '            } else ';

            if (filterType === 'equals') {
                logic += `${indent}if (b['${lookupVar}'] == '${lookupKey}') {\n`;
            } else if (filterType === 'contains') {
                logic += `${indent}if (b['${lookupVar}'] && b['${lookupVar}'].indexOf('${lookupKey}') !== -1) {\n`;
            } else {
                // Unsupported filter type
                return false;
            }

            logic += `                b['${targetVar}'] = '${lookupValue}';\n`;
        });

        // Add final else clause based on logic flag
        if (useDefaultOnNoMatch && defaultValue) {
            logic += `            } else {\n`;
            logic += `                b['${targetVar}'] = '${defaultValue}';\n`;
        } else if (!useDefaultOnNoMatch) {
            logic += `            } else {\n`;
            logic += `                b['${targetVar}'] = ${defaultValue ? `'${defaultValue}'` : 'undefined'};\n`;
        }

        logic += '            }\n';

        return logic;
    }
}
