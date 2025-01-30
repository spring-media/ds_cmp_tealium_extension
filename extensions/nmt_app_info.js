const getNmtAppInfo = {
  getWebviewData: function () {
    if (typeof nmtAppInfo != "undefined") {
      utag.data.app_name = this.getAppName(nmtAppInfo.appIdentifier);
      utag.data.page_platform = "app";
      utag.data.app_os = nmtAppInfo.platform;
      utag.data.app_version = nmtAppInfo.semanticVersion;
      utag.data.page_sub_type = "webview";

      //Typo correction ios/iOS, android/Android
      if (utag.data.app_os == "ios") {
        utag.data.app_os = "iOS";
      } else if (utag.data.app_os == "android") {
        utag.data.app_os = "Android";
      } else if (typeof nmtAppInfo == "undefined") {
        utag.data.app_os = "no-entry";
      }
    } else return;
  },

  getAppName: function (appIdentifier) {
    const bildNews = [
      "de.bild.newsapp",
      "de.bild.newsapp-legacy",
      "de.bild.ipad-legacy",
      "de.bild.ipad",
      "com.netbiscuits.bild.android",
      "de.bild.MeinKlub",
    ];
    const bildSport = ["de.bild.bundesliga-legacy", "de.bild.bundesliga"];
    const weltNews = [
      "de.cellular.n24hybrid",
      "de.cellular.n24hybrid.staging",
      "de.axelspringer.weltmobil",
    ];
    const weltEdition = [
      "com.sprylab.axelspringer.tablet.welt",
      "de.axelspringer.weltipad",
      "de.axelspringer.weltipad",
      "de.axelspringer.SessionPaymentFeaturesPreview",
    ];

    const appGroups = {
      "BILD News": bildNews,
      "BILD Sport": bildSport,
      "WELT News": weltNews,
      "WELT Edition": weltEdition,
    };

    for (const [groupName, apps] of Object.entries(appGroups)) {
      if (apps.includes(appIdentifier)) {
        return groupName;
      }
    }

    // Fallback if appIdentifier not found in appGroups
    return "Unknown App";
  },

  // Initialize
  init: function () {
    this.getWebviewData();
  },
};

if (typeof exports === "object") {
  // Export object with all functions for unit testing
  module.exports = getNmtAppInfo;
} else {
  getNmtAppInfo.init();
}
