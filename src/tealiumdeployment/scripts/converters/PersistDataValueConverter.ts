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
        const lines = [];
        const config = extension.configuration as PersistDataValueConfiguration;
        const setoption = config.setoption;

        if (setoption == 'var') {
            const variable = config.var;
            const sourceVar = config.settovar
                .replace('js.', '')
                .replace('udo.', '');
            const sessionVariable = sourceVar.replace('qp.', '')
            if (variable.startsWith('cp.utag_main_')) {
                const key = variable.replace('cp.utag_main_', '');
                lines.push(`            utag.loader.SC('utag_main', {\n`);
                lines.push(`                '${key}': b['${sourceVar}']${config.persistence == 'visitor' ?'':" + ';exp-session'"}\n`);
                lines.push(`            });\n`);
            } else {
                lines.push(`            document.cookie = "${sessionVariable}=" + b['${sourceVar}'] + ";path=/;domain=" + utag.cfg.domain + ";expires=";\n`);
            }
            lines.push(`            b['${variable}'] = b['${sourceVar}'];\n`);

            if(config.allowupdate == 'once') {
                const condition = ''
                + `            if (typeof b['${variable}'] == 'undefined') {\n`
                + lines.map(line => `    ${line}`).join('')
                + `            }\n`;

                return condition;
            } else if(config.allowupdate == 'multiple') {
                return lines.join('');
            } else {
                throw new Error(`AllowUpdate: ${config.allowupdate} not supported`);
            }

        } else {
            throw new Error(`SetOption: ${setoption} not supported`);
        }
    }
}