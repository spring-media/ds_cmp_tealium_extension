/**
 * Bot Traffic Detection Extension
 *
 * This extension detects bot traffic by checking the user agent against
 * a predefined list of known bot user agents and sets the result in utag.data
 *
 * Scope: Before Load Rules
 */

/* global utag, navigator */

/**
 * List of known bot user agents
 * @returns {Array<string>} Array of bot user agent strings
 */
const getBotUserAgents = () => {
    return [
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64; special_archiver; Archive-It; +http://archive-it.org/files/site-owners-special.html) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
    ];
};

/**
 * Check if the current user agent is a known bot
 * @param {string} userAgent - The user agent string to check
 * @param {Array<string>} botArray - Array of known bot user agents
 * @returns {boolean} True if the user agent is a bot, false otherwise
 */
const isBotUserAgent = (userAgent, botArray) => {
    if (!userAgent || typeof userAgent !== 'string') {
        return false;
    }

    if (!Array.isArray(botArray)) {
        return false;
    }

    return botArray.includes(userAgent);
};

/**
 * Set bot traffic detection result in utag.data
 * @param {boolean} isBot - Whether the user agent is a bot
 */
const setBotTrafficData = (isBot) => {
    if (typeof utag === 'undefined' || !utag.data) {
        return;
    }

    utag.data.bot_traffic = isBot.toString();
};

/**
 * Get the current user agent from navigator
 * @returns {string} The current user agent string
 */
const getUserAgent = () => {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
        return navigator.userAgent;
    }
    return '';
};

/**
 * Main initialization function for bot traffic detection
 */
const initBotTrafficDetection = () => {
    const botArray = getBotUserAgents();
    const userAgent = getUserAgent();
    const isBot = isBotUserAgent(userAgent, botArray);

    setBotTrafficData(isBot);

    return {
        userAgent,
        isBot,
        botTrafficValue: isBot.toString()
    };
};

// Execute in browser context
if (typeof window !== 'undefined' && typeof utag !== 'undefined' && typeof navigator !== 'undefined') {
    initBotTrafficDetection();
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        getBotUserAgents,
        isBotUserAgent,
        setBotTrafficData,
        getUserAgent,
        initBotTrafficDetection
    };
}
