"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleExtensionConversion = exports.googleExtensionPropens = exports.googleExtension = void 0;
const googleExtension = function(a, b) {
    b['a_rand'] = (Math.random()) * 10000000000000;
};
exports.googleExtension = googleExtension;
const googleExtensionPropens = function(a, b) {
    b['google_propens'] = sessionStorage.getItem("google_prop");
};
exports.googleExtensionPropens = googleExtensionPropens;
const googleExtensionConversion = function(a, b) {
    if ((typeof b['cp.utag_main_va'] != 'undefined' && b['cp.utag_main_va'].toString().toLowerCase() == 'false'.toLowerCase() && typeof b['page_isPremium'] != 'undefined' && b['page_isPremium'].toString().toLowerCase() == 'true'.toLowerCase())) {
        b['gps_userEvent'] = 'paywall';
    }
};
exports.googleExtensionConversion = googleExtensionConversion;
