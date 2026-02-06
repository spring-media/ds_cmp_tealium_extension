import { Condition } from './converters/types';


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
        case 'populated': {
            conditionCode += `typeof b['${leftVar}'] != 'undefined' && b['qp.activate_tag'] != ''`;
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
