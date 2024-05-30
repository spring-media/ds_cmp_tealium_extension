var existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-z0-9_,-]*)/)?.pop() || '';
var isAdobeConsentGiven = (existingCookie.indexOf('adobe_analytics') >= 0);

if (isAdobeConsentGiven && utag.data.pur_subscription && utag.data.pur_subscription.indexOf('true') < 0) {

    window.addEventListener("load", function (event) {
        sessionStorage.removeItem('bounce_over_5_sec');
        sessionStorage.removeItem('bounce_under_5_sec');
        sessionStorage.removeItem('super_bounce');

        setTimeout(function () { sessionStorage.setItem('bounce_over_5_sec', 'true'); }, 5000);
        //console.log("5");

    });






    window.addEventListener("unload", function (event) {

        if (sessionStorage.getItem("bounce_over_5_sec") === "true" && utag.data.pageName && utag.data.pageName.indexOf("article") != -1) {
        
            sessionStorage.setItem("super_bounce", "5+");
            utag.data["super_bounce"] = "true"
        }
        else if (sessionStorage.getItem("bounce_over_5_sec") === "true" && utag.data.pageName && utag.data.pageName.indexOf("media") != -1) {
            sessionStorage.setItem("super_bounce", "5+");
            utag.data["super_bounce"] = "true"
        }


    });


}
else {
    console.log('p_fp_nc');
}

