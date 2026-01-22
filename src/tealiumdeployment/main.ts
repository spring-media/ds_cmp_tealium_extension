import winston from 'winston';
import { deployment } from './deployment';
import { WeltDeploymentConfig } from './deploymentConfigurations';

(async() => {

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

    logger.info('Start deployment to tealium');

    // Parse command line arguments
    const commitMessage = process.argv[2];

    if (!commitMessage) {
        logger.error('Error: Commit message is required!');
        logger.info('Usage: npm run deploy -- "Your commit message"');
        logger.info('Example: npm run deploy -- "TICKET-123 - Update extensions"');
        process.exit(1);
    }

    try {
        await deployment(WeltDeploymentConfig.profile, WeltDeploymentConfig, commitMessage, logger);
        logger.info('Deployment finished');
    } catch (error: any) {
        logger.error(error.message);
        logger.info('Deployment aborted');
        process.exit(1);
    }
})();
