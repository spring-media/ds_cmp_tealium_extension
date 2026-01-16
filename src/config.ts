/* eslint-disable no-process-env */
export const config = {
    tealium: {
        account: process.env.TEALIUM_DEPLOY_ACCOUNT || '',
        user: process.env.TEALIUM_DEPLOY_USER || '',
        apiKey: process.env.TEALIUM_DEPLOY_API_KEY || ''
    }
};
