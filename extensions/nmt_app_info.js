const getNmtAppInfo = {

    const bildNews = [
        'de.bild.newsapp',
        'de.bild.newsapp-legacy',
        'de.bild.ipad-legacy',
        'de.bild.ipad',
        'com.netbiscuits.bild.android',
        'de.bild.MeinKlub',
    ];
    const bildSport = ['de.bild.bundesliga-legacy', 'de.bild.bundesliga'];
    const weltNews = [
        'de.cellular.n24hybrid',
        'de.cellular.n24hybrid.staging',
        'de.axelspringer.weltmobil,',
    ];
    const weltEdition = [
        'com.sprylab.axelspringer.tablet.welt',
        'de.axelspringer.weltipad',
        'de.axelspringer.weltipad',
        'de.axelspringer.SessionPaymentFeaturesPreview',
    ];

    const appGroups = {
        'BILD News': bildNews,
        'BILD Sport': bildSport,
        'WELT News': weltNews,
        'WELT Edition': weltEdition,
    };

    getWebviewData: function() {
        if (typeof window.nmtAppInfo != 'undefined') {
            window.utag.data.app_name = this.getAppName(
                window.nmtAppInfo.appIdentifier
            );
            window.utag.data.page_platform = 'app';
            window.utag.data.app_os = window.nmtAppInfo.platform || '';
            window.utag.data.app_version = window.nmtAppInfo.semanticVersion || '';
            window.utag.data.page_sub_type = 'webview';

            //Typo correction ios/iOS, android/Android
            if (window.utag.data.app_os == 'ios') {
                window.utag.data.app_os = 'iOS';
            } else if (window.utag.data.app_os == 'android') {
                window.tag.data.app_os = 'Android';
            } else if (typeof window.nmtAppInfo == 'undefined') {
                window.utag.data.app_os = 'no-entry';
            }
        } else return;
    },

    getAppName: function(appIdentifier) {

        for (const [groupName, apps] of Object.entries(appGroups)) {
            if (apps.includes(appIdentifier)) {
                return groupName;
            }
        }

        // Fallback if appIdentifier not found in appGroups
        return 'Unknown App';
    },

    // Initialize
    init: function() {
        this.getWebviewData();
    },
};

if (typeof exports === 'object') {
    // Export object with all functions for unit testing
    module.exports = getNmtAppInfo;
} else {
    getNmtAppInfo.init();
}
