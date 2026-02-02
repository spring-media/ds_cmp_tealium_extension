type Condition = {
    variable: string,
    operator: string,
    value: string,
}

const getCondition = (condition: Condition) => {
    let conditionCode = '';

    const leftVar = condition.variable
        .replace('udo.', '');

    switch (condition.operator) {
        case 'equals': {
            conditionCode += `b['${leftVar}'] == '${condition.value}'`;
            break;
        }
        case 'does_not_equal': {
            conditionCode += `b['${leftVar}'] != '${condition.value}'`;
            break;
        }
        case 'equals_ignore_case': {
            conditionCode += `b['${leftVar}'].toString().toLowerCase() == '${condition.value}'.toLowerCase()`;
            break;
        }
        case 'contains_ignore_case': {
            conditionCode += `b['${leftVar}'].toString().toLowerCase().indexOf('${condition.value}'.toLowerCase()) > -1`;
            break;
        }
        case 'starts_with': {
            conditionCode += `/^${condition.value}/.test(b['${leftVar}'])`;
            break;
        }
        case 'less_than': {
            conditionCode += `parseFloat(b['${leftVar}']) < parseFloat(${condition.value})`;
            break;
        }
        case 'less_than_equal_to': {
            conditionCode += `parseFloat(b['${leftVar}']) <= parseFloat(${condition.value})`;
            break;
        }
        case 'greater_than': {
            conditionCode += `parseFloat(b['${leftVar}']) > parseFloat(${condition.value})`;
            break;
        }
        case 'defined': {
            conditionCode += `typeof b['${leftVar}'] != 'undefined'`;
            break;
        }
        case 'notdefined': {
            conditionCode += `typeof b['${leftVar}'] == 'undefined'`;
            break;
        }
        case 'contains': {
            conditionCode += `b['${leftVar}'].toString().indexOf('${condition.value}') > -1`;
            break;
        }
        case 'does_not_contain': {
            conditionCode += `b['${leftVar}'].toString().indexOf('${condition.value}') < 0`;
            break;
        }
        case 'notpopulated': {
            conditionCode += `b['${leftVar}'] == ''`;
            break;
        }
        default: {
            throw new Error(`Unsopported operator ${condition.operator}`);
        }
    }
    return `${conditionCode}`;
};

const createConditionAnd = (data: Condition[]) => {
    const blocks = data.map(d => getCondition(d));
    if (blocks.length < 2) {
        return blocks.join(' && ');
    } else {
        return `(${blocks.join(' && ')})`;
    }
};

export const createCondition = (data: Condition[][]) => {
    if (data.length === 0) {
        return '1';
    }

    const blocks = data.map(d => createConditionAnd(d));
    if (blocks.length < 2) {
        return blocks.join(' || ');
    } else {
        return `(${blocks.join(' || ')})`;
    }
};

export type ExtensionData = {
    name: string,
    id: number,
    conditions: Condition[][],
    configuration: {
        configs: {
            setoption: string,
            set: string,
            settotext: string,
            settovar: string
        }[]
    }
}

export class SetDataValuesConverter {
    public convert(extension: ExtensionData): string | false {

        const conditionCode = createCondition(extension.conditions);
        const logic = this.createLogic(extension);
        if (logic === false) {
            console.log('skipped');
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
        '})();\n';
        return code;
    }

    private createLogic(extension: ExtensionData): string | false{
        let logic = '';
        for (const config of extension.configuration.configs) {
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