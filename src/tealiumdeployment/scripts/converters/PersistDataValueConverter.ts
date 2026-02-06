import { Scope } from '../../TealiumAPI';
import { createCondition } from '../conditions';
import { Converter, ExtensionData, PersistDataValueConfiguration } from './types';

export class PersistDataValueConverter implements Converter {

     public convert(extension: ExtensionData): string | false {

        if (!['After Load Rules'].includes(extension.scope) && !Scope.isTagScoped(extension.scope)) {
            throw Error(`Scope ${extension.scope} not supported`);
        }


        const conditionCode = createCondition(extension.conditions);
        const logic = this.createLogic(extension);

        const code = `/* Based on PERSIST DATA VALUE ${extension.name} ${extension.id} */\n`
        + '/* global utag, a, b */\n'
        + `(function(a, b) {\n`
        + `    try {\n`
        + `        if (${conditionCode}) {\n`
        + `${logic}`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`
        return code;
    }

    private createLogic(extension: ExtensionData): string | false{
        let logic = '';
        const config = extension.configuration as PersistDataValueConfiguration;
        const setoption = config.setoption;
        // const column = config.set.replace('js.', '');
        const value = config.settotext;

        // if (setoption == 'text') {
        //     logic +=
        //     `            b['${column}'] = '${value}';\n`;
        // } else if (setoption == 'code') {
        //     logic +=
        //     '            try {\n' +
        //     `                b['${column}'] = ${value}${value.endsWith(';') ? '' : ';'}\n` +
        //     '            } catch (e) {}\n';
        if (setoption == 'var') {
            const variable = config.var;
            const sourceVar = config.settovar
                .replace('js.', '')
                .replace('udo.', '');
            const sessionVariable = sourceVar.replace('qp.', '')
            if (variable.startsWith('cp.utag_main_')) {
                const key = variable.replace('cp.utag_main_', '');
                logic += `            utag.loader.SC('utag_main', {\n`
                logic += `                '${key}': b['${sourceVar}'] + ';exp-session'\n`
                logic += `            });\n`
            } else {
                logic += `            document.cookie = "${sessionVariable}=" + b['${sourceVar}'] + ";path=/;domain=" + utag.cfg.domain + ";expires=";\n`;
            }
            logic += `            b['${variable}'] = b['${sourceVar}'];\n`;
        } else {
            return false;
        }

        return logic;
    }
}