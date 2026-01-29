/* eslint-disable no-process-env */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
    tealium: {
        account: process.env.TEALIUM_DEPLOY_ACCOUNT || '',
        user: process.env.TEALIUM_DEPLOY_USER || '',
        apiKey: process.env.TEALIUM_DEPLOY_API_KEY || ''
    }
};
