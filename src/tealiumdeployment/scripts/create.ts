import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import { SetDataValuesConverter } from './converters/SetDataValuesConverter';
import { Converter } from './converters/types';
import { PersistDataValueConverter } from './converters/PersistDataValueConverter';
import { JoinDataValuesConverter } from './converters/JoinDataValuesConverter';
import { LookupTableConverter } from './converters/LookupTableConverter';

(async () => {
    const loggerFormat = winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
    });

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), loggerFormat),
        defaultMeta: {},
        transports: [new winston.transports.Console()]
    });

    const profile = process.argv[2];
    if (!profile) {
        logger.error('Error: profile is required!');
        logger.info('Usage: npm run diff -- "Your Profile"');
        logger.info('Example: npm run diff -- "welt"');
        process.exit(1);
    }

    const outputDir = path.join(__dirname, '../../../output');

    // Finde die neueste Profil-Datei
    const files = await fs.readdir(outputDir);
    const profileFiles = files.filter(
        (f) => f.startsWith(`tealium_profile_${profile}_`) && f.endsWith('.json')
    );

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

    const outputDirExtensions = path.join(__dirname, `../../../src/profiles/${profile}/extensions`);

    for (const extension of tealiumProfile.extensions) {
        let converter: Converter | null = null;
        switch (extension.extensionType) {
            case 'Set Data Values': {
                converter = new SetDataValuesConverter();
                break;
            }
            case 'Persist Data Value': {
                converter = new PersistDataValueConverter();
                break;
            }
            case 'Join Data Values': {
                converter = new JoinDataValuesConverter();
                break;
            }
            case 'Lookup Table': {
                converter = new LookupTableConverter();
                break;
            }
            default: {
                break;
            }
        }

        if (converter == null) {
            continue;
        }

        const fileName = `${extension.name.replaceAll('/', ' ').split(' ').join('_')}_${extension.id}.js`;
        const outputFilePath = path.join(outputDirExtensions, fileName);
        console.log(outputFilePath);

        const code = converter.convert(extension);
        if (!code) {
            continue;
        }

        await fs.writeFile(outputFilePath, code, 'utf-8');
    }
})();
