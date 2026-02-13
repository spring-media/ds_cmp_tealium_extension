export const googleExtension = (a: any, b: any) => {
    b['a_rand'] = (Math.random())*10000000000000;

}
export const googleExtensionPropens = (a: any, b: any) => {
    b['google_propens'] = sessionStorage.getItem("google_prop");

}
export const googleExtensionConversion = (a: any, b: any) => {
     if ((typeof b['cp.utag_main_va'] != 'undefined' && b['cp.utag_main_va'].toString().toLowerCase() == 'false'.toLowerCase() && typeof b['page_isPremium'] != 'undefined' && b['page_isPremium'].toString().toLowerCase() == 'true'.toLowerCase())) {
            b['gps_userEvent'] = 'paywall';
        }

}