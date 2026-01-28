import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';


const getCondition = (condition: any) => {
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

const createConditionAnd = (data: any[]) => {
    const blocks = data.map(d => getCondition(d));
    if (blocks.length < 2) {
        return blocks.join(' && ');
    } else {
        return `(${blocks.join(' && ')})`;
    }
};

export const createCondition = (data: any[]) => {
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

export const createLogic = (extension: any) => {
    let logic = '';
    for (const config of extension.configuration.configs) {
        const setoption = config.setoption;
        const column = config.set.replace('js.', '');
        const value = config.settotext;

        if (setoption == 'text') {
            logic +=
            `             b['${column}'] = '${value}';\n`;
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
};

(async () => {
    const loggerFormat = winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
    });

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            loggerFormat
        ),
        defaultMeta: { },
        transports: [new winston.transports.Console()]
    });

    const profile = process.argv[2];
    if (!profile) {
        logger.error('Error: profile is required!');
        logger.info('Usage: npm run diff -- "Your Profile"');
        logger.info('Example: npm run diff -- "welt"');
        process.exit(1);
    }

    const outputDir = path.join(__dirname, '../../output');

    // Finde die neueste Profil-Datei
    const files = await fs.readdir(outputDir);
    const profileFiles = files.filter(f => f.startsWith(`tealium_profile_${profile}_`) && f.endsWith('.json'));

    if (profileFiles.length === 0) {
        logger.error(`No profile file found for ${profile} in ${outputDir}`);
        logger.info('Run "npm run pull" first to download a profile');
        process.exit(1);
    }

    // Sortiere nach Dateiname (enthält Zeitstempel), neueste zuerst
    profileFiles.sort().reverse();
    const latestFile = profileFiles[0];
    if (!latestFile) {
        logger.info('Profile loaded failed. File not found.');
        return;
    }
    const inputFilePath = path.join(outputDir, latestFile);

    logger.info(`Reading profile from: ${latestFile}`);
    const fileContent = await fs.readFile(inputFilePath, 'utf-8');
    const tealiumProfile = JSON.parse(fileContent);

    logger.info('Profile loaded successfully');

    logger.info(tealiumProfile);
    logger.info(`Extensions count: ${tealiumProfile.extensions.length}`);

    const outputDirExtensions = path.join(__dirname, `../../src/profiles/${profile}/extensions`);

    for (const extension of tealiumProfile.extensions) {
        if (extension.extensionType != 'Set Data Values') {
            continue;
        }

        const fileName = `${extension.name.replaceAll('/', ' ').split(' ').join('_')}_${extension.id}.js`;
        const outputFilePath = path.join(outputDirExtensions, fileName);
        console.log(outputFilePath);

        const conditionCode = createCondition(extension.conditions);
        const logic = createLogic(extension);
        if (logic === false) {
            console.log('skipped');
            continue;
        }


        // Put together all code
        const code = `/* Based on SET DATA VALUE ${extension.name} ${extension.id} */\n` +
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

        await fs.writeFile(outputFilePath, code, 'utf-8');
    }

})();
