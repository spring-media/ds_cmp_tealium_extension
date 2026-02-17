import { createCondition } from '../conditions';
import { Converter, ExtensionData, CryptoConfiguration, Condition } from './types';

export class CryptoConverter implements Converter {
    public convert(extension: ExtensionData): string | false {
        const config = extension.configuration as CryptoConfiguration;

        // Validate hash type
        if (!config.hash || !['1', '2', '3'].includes(config.hash)) {
            return false;
        }

        // Extract variables from conditions (those with operator: null mean "is defined")
        const variablesToHash = this.extractVariablesFromConditions(extension.conditions);

        if (variablesToHash.length === 0) {
            return false;
        }

        const conditionCode = createCondition(extension.conditions);
        const logic = this.createLogic(variablesToHash, config.hash);

        // Put together all code
        const code =
            '/* eslint-disable */\n' +
            `/* Based on CRYPTO EXTENSION ${extension.name} ${extension.id} */\n` +
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

    private extractVariablesFromConditions(conditions: Condition[][]): string[] {
        const variables: string[] = [];

        for (const conditionGroup of conditions) {
            for (const condition of conditionGroup) {
                // Conditions with operator: null mean "variable is defined"
                if (condition.operator === null || condition.operator === 'defined') {
                    const varName = condition.variable
                        .replace('udo.', '')
                        .replace('js.', '')
                        .replace('cp.', '');
                    if (!variables.includes(varName)) {
                        variables.push(varName);
                    }
                }
            }
        }

        return variables;
    }

    private createLogic(variables: string[], hashType: string): string {
        const hashFunction = this.getHashFunction(hashType);
        let logic = '';

        for (const varName of variables) {
            logic += `            if (typeof b['${varName}'] != 'undefined' && b['${varName}'] !== '') {\n`;
            logic += `                b['${varName}'] = ${hashFunction}(b['${varName}']);\n`;
            logic += `            }\n`;
        }

        return logic;
    }

    private getHashFunction(hashType: string): string {
        switch (hashType) {
            case '1':
                return 'utag.ut.md5';
            case '2':
                return 'utag.ut.sha1';
            case '3':
                return 'utag.ut.sha256';
            default:
                throw new Error(`Unsupported hash type: ${hashType}`);
        }
    }
}
