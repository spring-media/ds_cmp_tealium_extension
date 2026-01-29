import winston from 'winston';
import { TealiumAPI } from '../TealiumAPI';
import { config } from '../../config';
import fs from 'fs/promises';
import path from 'path';

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
        logger.info('Usage: npm run deploy -- "Your Profile"');
        logger.info('Example: npm run deploy -- "welt"');
        process.exit(1);
    }
    logger.info(`Pull extensions from Tealium ${profile}`);

    const username = config.tealium.user;
    const apiKey = config.tealium.apiKey;
    const account = config.tealium.account;

    const api = new TealiumAPI(username, apiKey, logger);
    await api.connect(account, profile);
    const tealiumProfile = await api.getProfile();
    if (!tealiumProfile) {
        logger.info('No profile found');
        return;
    }

    const outputDir = path.join(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `tealium_profile_${profile}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(outputDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(tealiumProfile, null, 2), 'utf-8');
    logger.info(`Profile saved to: ${filePath}`);

    console.log(tealiumProfile);

})();

