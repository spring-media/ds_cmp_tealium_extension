/******************************************* BEGIN CODE TO DEPLOY *******************************************/

var existingCookie = document.cookie.match(/__utag_cmp_vendor_list=([a-zA-z0-9_,-]*)/);
var existingFallbackCookie = document.cookie.match(/cmp_cv_list=([a-zA-z0-9_,-]*)/);
if ((existingCookie && existingCookie[0].indexOf('adobe_analytics') >= 0) || (existingFallbackCookie && existingFallbackCookie[0].indexOf('adobe_analytics') >= 0)) {


    /* Adobe Consulting Plugin: getPercentPageViewed v4.0 w/handlePPVevents helper function (Requires p_fo plug-in) */
    /*s.getPercentPageViewed=function(pid,ch){var s=this,a=s.c_r("s_ppv");a=-1<a.indexOf(",")?a.split(","):[];a[0]=s.unescape(a[0]); pid=pid?pid:s.pageName?s.pageName:document.location.href;s.ppvChange="undefined"===typeof ch||!0==ch?!0:!1;if("undefined"=== typeof s.linkType||"o"!==s.linkType)s.ppvID&&s.ppvID===pid||(s.ppvID=pid,s.c_w("s_ppv",""),s.handlePPVevents()), s.p_fo("s_gppvLoad") &&window.addEventListener&&(window.addEventListener("load",s.handlePPVevents,!1),window.addEventListener("click",s.handlePPVevents, !1),window.addEventListener("scroll",s.handlePPVevents,!1)),s._ppvPreviousPage=a[0]?a[0]:"",s._ppvHighestPercentViewed=a[1]?a[1]:"",s._ppvInitialPercentViewed=a[2]?a[2]:"",s._ppvHighestPixelsSeen=a[3]?a[3]:"",s._ppvFoldsSeen=a[4]?a[4]:"",s._ppvFoldsAvailable=a[5]?a[5]:""};
    */
    /* Adobe Consulting Plugin: handlePPVevents helper function (for getPercentPageViewed v4.0 Plugin) */
    /*s.handlePPVevents=function(){if("undefined"!==typeof s_c_il){for(var c=0,g=s_c_il.length;c<g;c++)if(s_c_il[c]&& (s_c_il[c].getPercentPageViewed||s_c_il[c].getPreviousPageActivity)){var s=s_c_il[c];break}if(s&&s.ppvID){var f=Math.max (Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),Math.max(document.body.clientHeight,document.documentElement.clientHeight)),h= window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;c=(window.pageYOffset|| window.document.documentElement.scrollTop||window.document.body.scrollTop)+h;g=Math.min(Math.round(c/f*100),100);var k=Math.floor(c/h);h=Math.floor(f/h);var d="";if(!s.c_r("s_tp")||s.unescape(s.c_r("s_ppv").split(",")[0])!==s.ppvID||s.p_fo(s.ppvID) ||1==s.ppvChange&&s.c_r("s_tp")&&f!=s.c_r("s_tp")){(s.unescape(s.c_r("s_ppv").split(",")[0])!==s.ppvID||s.p_fo(s.ppvID+"1"))&&s.c_w("s_ips",c);if(s.c_r("s_tp")&&s.unescape(s.c_r("s_ppv").split(",")[0])===s.ppvID){s.c_r("s_tp");d=s.c_r("s_ppv");var e=-1< d.indexOf(",")?d.split(","):[];d=e[0]?e[0]:"";e=e[3]?e[3]:"";var l=s.c_r("s_ips");d=d+","+Math.round(e/f*100)+","+Math.round(l/ f*100)+","+e+","+k}s.c_w("s_tp",f)}else d=s.c_r("s_ppv");var b=d&&-1<d.indexOf(",")?d.split(",",6):[];f=0<b.length?b[0]: escape(s.ppvID);e=1<b.length?parseInt(b[1]):g;l=2<b.length?parseInt(b[2]):g;var m=3<b.length?parseInt(b[3]):c,n=4<b.length? parseInt(b[4]):k;b=5<b.length?parseInt(b[5]):h;0<g&&(d=f+","+(g>e?g:e)+","+l+","+(c>m?c:m)+","+(k>n?k:n)+","+(h>b?h:b)); s.c_w("s_ppv",d)}}};
    */

    /* Adobe Consulting Plugin: getPercentPageViewed v5.0.1 w/handlePPVevents helper function (Requires AppMeasurement and the p_fo plugin) */
    s.getPercentPageViewed = function (pid, ch) {
        var l = pid,
            p = ch;

        function m() {
            if (window.ppvID) {
                var c = Math.max(
                        Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight
                        ),
                        Math.max(
                            document.body.offsetHeight,
                            document.documentElement.offsetHeight
                        ),
                        Math.max(
                            document.body.clientHeight,
                            document.documentElement.clientHeight
                        )
                    ),
                    b =
                        window.innerHeight ||
                        document.documentElement.clientHeight ||
                        document.body.clientHeight,
                    k =
                        (window.pageYOffset ||
                            window.document.documentElement.scrollTop ||
                            window.document.body.scrollTop) + b,
                    a = Math.min(Math.round((k / c) * 100), 100),
                    n = Math.floor(k / b);
                b = Math.floor(c / b);
                var d = "";
                if (
                    !window.cookieRead("s_tp") ||
                    decodeURIComponent(window.cookieRead("s_ppv").split(",")[0]) !==
                    window.ppvID ||
                    window.p_fo(window.ppvID) ||
                    (1 == window.ppvChange &&
                        window.cookieRead("s_tp") &&
                        c != window.cookieRead("s_tp"))
                ) {
                    (decodeURIComponent(window.cookieRead("s_ppv").split(",")[0]) !==
                        window.ppvID ||
                        window.p_fo(window.ppvID + "1")) &&
                    window.cookieWrite("s_ips", k, 30);
                    if (
                        window.cookieRead("s_tp") &&
                        decodeURIComponent(window.cookieRead("s_ppv").split(",")[0]) ===
                        window.ppvID
                    ) {
                        window.cookieRead("s_tp");
                        d = window.cookieRead("s_ppv");
                        var f = -1 < d.indexOf(",") ? d.split(",") : [];
                        d = f[0] ? f[0] : "";
                        f = f[3] ? f[3] : "";
                        var e = window.cookieRead("s_ips");
                        d =
                            d +
                            "," +
                            Math.round((f / c) * 100) +
                            "," +
                            Math.round((e / c) * 100) +
                            "," +
                            f +
                            "," +
                            n;
                    }
                    window.cookieWrite("s_tp", c, 30);
                } else d = window.cookieRead("s_ppv");
                var h = d && -1 < d.indexOf(",") ? d.split(",", 6) : [];
                c = 0 < h.length ? h[0] : encodeURIComponent(window.ppvID);
                f = 1 < h.length ? parseInt(h[1]) : a;
                e = 2 < h.length ? parseInt(h[2]) : a;
                var l = 3 < h.length ? parseInt(h[3]) : k,
                    m = 4 < h.length ? parseInt(h[4]) : n;
                h = 5 < h.length ? parseInt(h[5]) : b;
                0 < a &&
                (d =
                    c +
                    "," +
                    (a > f ? a : f) +
                    "," +
                    e +
                    "," +
                    (k > l ? k : l) +
                    "," +
                    (n > m ? n : m) +
                    "," +
                    (b > h ? b : h));
                window.cookieWrite("s_ppv", d, 30);
            }
        }

        if ("-v" === l) return {plugin: "getPercentPageViewed", version: "5.0.1"};
        var e = (function () {
            if ("undefined" !== typeof window.s_c_il)
                for (var c = 0, b; c < window.s_c_il.length; c++)
                    if (((b = window.s_c_il[c]), b._c && "s_c" === b._c)) return b;
        })();
        "undefined" !== typeof e && (e.contextData.getPercentPageViewed = "5.0.1");
        window.pageName = ("undefined" !== typeof e && e.pageName) || "";
        window.cookieWrite =
            window.cookieWrite ||
            function (c, b, a) {
                if ("string" === typeof c) {
                    var k = window.location.hostname,
                        e = window.location.hostname.split(".").length - 1;
                    if (k && !/^[0-9.]+$/.test(k)) {
                        e = 2 < e ? e : 2;
                        var d = k.lastIndexOf(".");
                        if (0 <= d) {
                            for (; 0 <= d && 1 < e;) (d = k.lastIndexOf(".", d - 1)), e--;
                            d = 0 < d ? k.substring(d) : k;
                        }
                    }
                    g = d;
                    b = "undefined" !== typeof b ? "" + b : "";
                    if (a || "" === b)
                        if (("" === b && (a = -60), "number" === typeof a)) {
                            var f = new Date();
                            f.setTime(f.getTime() + 6e4 * a);
                        } else f = a;
                    return c &&
                    ((document.cookie =
                        encodeURIComponent(c) +
                        "=" +
                        encodeURIComponent(b) +
                        "; path=/;" +
                        (a ? " expires=" + f.toUTCString() + ";" : "") +
                        (g ? " domain=" + g + ";" : "")+';secure'),
                    "undefined" !== typeof window.cookieRead)
                        ? window.cookieRead(c) === b
                        : !1;
                }
            };
        window.cookieRead =
            window.cookieRead ||
            function (a) {
                if ("string" === typeof a) a = encodeURIComponent(a);
                else return "";
                var b = " " + document.cookie,
                    c = b.indexOf(" " + a + "="),
                    e = 0 > c ? c : b.indexOf(";", c);
                return (a =
                    0 > c
                        ? ""
                        : decodeURIComponent(
                            b.substring(c + 2 + a.length, 0 > e ? b.length : e)
                        ))
                    ? a
                    : "";
            };
        window.p_fo =
            window.p_fo ||
            function (a) {
                window.__fo || (window.__fo = {});
                if (window.__fo[a]) return !1;
                window.__fo[a] = {};
                return !0;
            };
        var a = window.cookieRead("s_ppv");
        a = -1 < a.indexOf(",") ? a.split(",") : [];
        l = l ? l : window.pageName ? window.pageName : document.location.href;
        a[0] = decodeURIComponent(a[0]);
        window.ppvChange = "undefined" === typeof p || 1 == p ? !0 : !1;
        ("undefined" !== typeof e && e.linkType && "o" === e.linkType) ||
        ((window.ppvID && window.ppvID === l) ||
        ((window.ppvID = l), window.cookieWrite("s_ppv", "", 30), m()),
        window.p_fo("s_gppvLoad") &&
        window.addEventListener &&
        (window.addEventListener("load", m, !1),
            window.addEventListener("click", m, !1),
            window.addEventListener("scroll", m, !1)),
            (this._ppvPreviousPage = a[0] ? a[0] : ""),
            (this._ppvHighestPercentViewed = a[1] ? a[1] : ""),
            (this._ppvInitialPercentViewed = a[2] ? a[2] : ""),
            (this._ppvHighestPixelsSeen = a[3] ? a[3] : ""),
            (this._ppvFoldsSeen = a[4] ? a[4] : ""),
            (this._ppvFoldsAvailable = a[5] ? a[5] : ""));
    }


    /* Adobe Consulting Plugin: p_fo (pageFirstOnly) v2.0 */
    s.p_fo = function (on) {
        var s = this;
        s.__fo || (s.__fo = {});
        if (s.__fo[on]) return !1;
        s.__fo[on] = {};
        return !0
    };

} else {
}
/* Adobe Consulting Plugin: p_fo (pageFirstOnly) v2.0 (Requires AppMeasurement) */
s.p_fo = function (on) {
    var s = this;
    s.__fo || (s.__fo = {});
    if (s.__fo[on]) return !1;
    s.__fo[on] = {};
    return !0
};

/******************************************** END CODE TO DEPLOY ********************************************/


/********************************************************************
 *
 * Main Plug-in code (should be in Plug-ins section)
 *
 *******************************************************************/
/*
 * Plugin: getValOnce_v1.11
 */
s.getValOnce = new Function("v", "c", "e", "t", ""
    + "var s=this,a=new Date,v=v?v:'',c=c?c:'s_gvo',e=e?e:0,i=t=='m'?6000"
    + "0:86400000,k=s.c_r(c);if(v){a.setTime(a.getTime()+e*i);s.c_w(c,v,e"
    + "==0?0:a);}return v==k?'':v");


s.apl = new Function("L", "v", "d", "u", ""
    + "var s=this,m=0;if(!L)L='';if(u){var i,n,a=s.split(L,d);for(i=0;i<a."
    + "length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas"
    + "e()));}}if(!m)L=L?L+d+v:v;return L");
/*
* Utility Function: split v1.5 - split a string (JS 1.0 compatible)
*/
s.split = new Function("l", "d", ""
    + "var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
    + "++]=l.substring(0,i);l=l.substring(i+d.length);}return a");

/**
 * @todo Diese Prüfung hier sollte identisch sein mit der in Tealium Laderegeln! Vielleicht kann sogar eine Laderegel hier genutzt werden?
 */
//var isAdobeConsentGiven = ((existingCookie.indexOf('adobe_analytics') >= 0) || (existingFallbackCookie.indexOf('adobe_analytics') >= 0));

s.usePlugins = true;
s.expectSupplementalData = false;
s.currencyCode = "EUR";
s.myChannels = 0;
s._articleViewType = '';
s._appDomain = b.ad_track_server;   // set to domain being ntracking, i.e. welt.de or bild.de
s._searchEngines = ".google.|bing.com|ecosia.org|duckduckgo.com|amp-welt-de.cdn.ampproject.org|qwant.com|suche.t-online.de|.yandex.|.yahoo.com|googleapis.com|nortonsafe.search.ask.com|wikipedia.org|googleadservices.com|search.myway.com|lycos.de";
s._referringDomain = document.referrer;

s._socialDomains = "facebook.com|xing.com|instagram.com|youtube.com|t.co|www.linkedin.com|away.vk.com|www.pinterest.de|linkedin.android|ok.ru|mobile.ok.ru|www.yammer.com|twitter.com|www.netvibes.com|pinterest.com|wordpress.com|blogspot.com|lnkd.in|xing.android|vk.com|com.twitter.android|m.ok.ru";
s._referringDomain = (s._referringDomain.indexOf("?") > 0) ? document.referrer.split("?")[0] : s._referringDomain;

s.doPlugins = function (s) {

//Config
    s.currencyCode = "EUR";
    s.eVar63 = s.version;
    s.eVar64 = (typeof s.visitor !== "undefined") ? s.visitor.version : "undefined";

//Campaign
    s.campaign = s.getValOnce(s.campaign, 's_ev0', 0, "m");
    s.eVar88 = b["campaign_value"];

//internal Campaign
    s.getICID = s.Util.getQueryParam('icid') || '';
    s.eVar78 = s.getICID;
    s.eVar79 = s.getICID;

//AD Wall Page Name
    if (s.pageName.indexOf("42925516") != -1 || s.pageName.indexOf("54578900") != -1) {
        b.adobe_doc_type = "ad wall";
        s.pageName = "ad wall : " + s.eVar1;
        s.eVar3 = "ad wall";
        s.prop3 = "ad wall";
    }


//live is live
    if (typeof b.adobe_doc_type !== "undefined" && b.adobe_doc_type == "article" && typeof b.page_cms_path !== "undefined" && b.page_cms_path.indexOf("im-live-ticker") > -1) {
        b.adobe_doc_type = "live";
        s.eVar3 = 'live';
        s.prop3 = 'live';
        s.pageName = "live : " + b['page_id'];

    }

//liveticker sportdaten
    if (typeof b.adobe_doc_type !== "undefined" && b.adobe_doc_type == "article" && typeof b.page_cms_path !== "undefined" && (b.page_cms_path.indexOf("im-liveticker") > -1 || b.page_cms_path.indexOf("/liveticker/") > -1)) {
        b.adobe_doc_type = "live-sport";
        s.eVar3 = 'live-sport';
        s.prop3 = 'live-sport';
        s.pageName = "live-sport : " + b['page_id'];

    }

//Time
    s.eVar184 = new Date().getHours().toString();
    s.eVar181 = new Date().getMinutes().toString();
    s.eVar185 = b.myCW;



    //Scrolltiefe
    /**
     * Scrolltiefe kommt aus dem Cookie vom letzten Aufruf, wenn wir kein Adobe Consent haben gibt es keine Cookies!
     */
    //if (isAdobeConsentGiven && typeof s.pageName  != 'undefined' && s.pageName != '') {
    if (typeof s.pageName != 'undefined' && s.pageName != '') {
        // Previous Page für article und video ==> document type : page_is_premium : page_id : page_channel
        if (typeof b.adobe_doc_type != 'undefined' && (b.adobe_doc_type == 'article' || b.adobe_doc_type == 'video')) {
            s._prevPage = b.adobe_doc_type + " : " + b.is_status_premium + " : " + b.page_id + " : " + b._pathname1;
        } else {
            s._prevPage = s.pageName;
        }
    }

    if (typeof s._prevPage != 'undefined' && s._prevPage != '') {
        s.getPercentPageViewed(s._prevPage);

        if (typeof s._ppvPreviousPage != 'undefined' && s._ppvPreviousPage != '') {

            s.eVar33 = s._ppvPreviousPage;
            s.prop61 = s._ppvPreviousPage;
            s.prop62 = s._ppvInitialPercentViewed;
            s.prop63 = s._ppvHighestPixelsSeen;
            s.prop64 = Math.round(s._ppvInitialPercentViewed / 10) * 10;
            s.prop65 = Math.round(s._ppvHighestPercentViewed / 10) * 10;
            event45 = "event45=" + Math.round(s._ppvInitialPercentViewed / 10) * 10;
            event46 = "event46=" + Math.round(s._ppvHighestPercentViewed / 10) * 10;
            s.events = s.apl(s.events, event45, ",", 1);
            s.events = s.apl(s.events, event46, ",", 1);
            //Home Teaser Tracking evars
            if (sessionStorage.getItem("home_teaser_info") != "undefined"
                && (utag.data.page_document_type === "article" || utag.data.page_document_type === "video")
                && s._ppvPreviousPage.indexOf("home") === 0) {

                s.eVar66 = sessionStorage.getItem("home_teaser_info");
                s.eVar92 = sessionStorage.getItem("home_teaser_info") + '|' + s.eVar1;

            }
        }
    }

//Analytics4T
    s.expectSupplementalData = false; // Force to false;

//Activity Map
    s.trackInlineStats = false;
    s.linkLeaveQueryString = true;

    //Channels (Kopie von bild)
    if (s.myChannels === 0) {
        s.events = s.events ? s.events : '';
        if (utag_data.page_document_type && utag_data.page_document_type.match(/(article|media|sportdaten|live-sport)/i) !== null) {
            // if (b['page_type'].match(/(article|artikel)/i) != null) {
            s.getWTRID = s.Util.getQueryParam('wtrid') || '';
            s.getWTMC = s.Util.getQueryParam('wtmc') || '';
            s.getCID = s.Util.getQueryParam('cid') || '';

            if (document.referrer !== '') {
                var _isSearchView = new RegExp(s._searchEngines.replace(/\./g, "\\.")).exec(s._referringDomain) !== null;
                if (_isSearchView)
                    s._articleViewType = 'event24';
                else {
                    var _isSocialView = new RegExp(s._socialDomains.replace(/\./g, "\\.")).exec(s._referringDomain) !== null;
                    if (_isSocialView) s._articleViewType = 'event25';
                    else {
                        var _isIntDomain = s._referringDomain.indexOf(document.domain) > -1 || (s._referringDomain.indexOf("www.bild.de") && document.domain.indexOf("m.bild.de") || (document.referrer == "https://m.bild.de/" && document.domain == "m.sport.bild.de") || (document.referrer == "https://www.bild.de/" && document.domain == "www.sport.bild.de")) > -1;
                        if (_isIntDomain && s.getWTRID.indexOf("kooperation.reco.taboola.") === 0) s._articleViewType = 'event102';
                        //if (_isIntDomain) {
                        else if (_isIntDomain) {
                            //var _isHomeView = new RegExp(document.domain.replace(/\./g, "\\.") + "\/*$").exec(s._referringDomain) !== null;
                            var _isHomeView = new RegExp(document.domain.replace(/\./g, "\\.") + "\/*$").exec(s._referringDomain.replace("https://", "").split(",")[0]) !== null;
                            if (_isHomeView) s._articleViewType = 'event22';
                            var _isHomeSportView = (document.referrer == "https://m.bild.de/" || document.referrer == "https://www.bild.de/") && (document.domain == "m.sport.bild.de" || document.domain == "www.sport.bild.de");
                            if (_isHomeSportView) s._articleViewType = 'event22';
                                //if (_isHomeView && s.getWTRID.indexOf("kooperation.reco.taboola.") === 0) s._articleViewType = 'event102';
                            //else if (_isHomeView) s._articleViewType = 'event22';
                            else if (_isHomeSportView == 'false' || _isHomeView == 'false') s._articleViewType = 'event23';
                        } else s._articleViewType = 'event27';
                    }
                }
            } else {
                s._articleViewType = 'event26';
                if (s.getWTRID.indexOf('sea.') === 0 || s.getWTMC.indexOf('sea.') === 0 || s.getCID.indexOf('sea.') === 0) s._articleViewType = 'event24';
                if (s.getWTRID.indexOf('socialmedia') === 0 || s.getWTMC.indexOf('socialmedia') === 0 || s.getCID.indexOf('social') === 0) s._articleViewType = 'event25';
                if (s.getWTRID.indexOf('kooperation') === 0 || s.getWTMC.indexOf('kooperation') === 0 || s.getCID.indexOf('affiliate') === 0) s._articleViewType = 'event23';
            }
        }
        if (s._articleViewType !== '') s.events = s.apl(s.events, s._articleViewType, ',', 1);
    }
    s.myChannels++;


// PV Events und Page Age für Order in utag_main cookie mitgeben
    if (typeof s._articleViewType && typeof s._articleViewType !== 'undefined') {
        s.eVar44 = s._articleViewType;

        utag.loader.SC('utag_main', {'articleview': s._articleViewType + ';exp-session'});
        b['cp.utag_main_articleview'] = s._articleViewType;

//Page Age in den checkout schieben
        if (typeof utag_data.page_age && typeof utag_data.page_age !== 'undefined') {
            utag.loader.SC('utag_main', {'pa': utag_data.page_age + ';exp-session'});
            b['cp.utag_main_pa'] = utag_data.page_age;

        }
    }

// Google Discover
    if (s._referringDomain.substr(s._referringDomain.indexOf("google.com"), 100) === "google.com"
        || s._referringDomain.indexOf("googlequicksearch/") != -1) {

        s.events = s.apl(s.events, "event49", ',', 1);

    }

//Google News
    if (s._referringDomain.indexOf("news.google") != -1) {

        s.events = s.apl(s.events, "event48", ',', 1);
    }

//Instagram
    if (s._referringDomain.indexOf("instagram.com") != -1) {

        s.events = s.apl(s.events, "event53", ',', 1);
    }

//Youtube
    if (s._referringDomain.indexOf("youtube.com") != -1) {

        s.events = s.apl(s.events, "event50", ',', 1);
    }
//Twitter

    if (s._referringDomain.indexOf("t.co") != -1 || s._referringDomain.indexOf("twitter.com") != -1 || s._referringDomain.indexOf("android-app://com.twitter.android") != -1) {

        s.events = s.apl(s.events, "event51", ',', 1);
    }

//Facebook
    if (s._referringDomain.indexOf("facebook.com") != -1) {

        s.events = s.apl(s.events, "event52", ',', 1);
    }

    if (b.page_document_type && b.page_document_type == "article" && b["qp.source"]) {
        s.eVar235 = b["qp.source"];
        utag.loader.SC('utag_main', {'source': b["qp.source"] + ';exp-session'});
        b['cp.utag_main_source'] = b["qp.source"];

    } else if (b.page_document_type && b.page_document_type == "article" && (b["qp.source"] == null)) {
        utag.loader.SC('utag_main', {'source': '' + ';exp-session'});
        b['cp.utag_main_source'] = b["qp.source"];

    }
    //BILDPlus Dichte / ABtests
    if (b.page_document_type && (b.page_document_type == "article" || b.page_document_type == "section" || b.page_document_type == "home") && b["qp.source"]) {
        s.eVar235 = b["qp.source"];
        utag.loader.SC('utag_main', {
            'source': b["qp.source"] + ';exp-session'
        });
        b['cp.utag_main_source'] = b["qp.source"];

        //console.log("set cookie");

    } else if (b.page_document_type && (b.page_document_type == "article" || b.page_document_type == "section" || b.page_document_type == "home") || (b["qp.source"] == null)) {
        utag.loader.SC('utag_main', {
            'source': '' + ';exp-session'
        });
        b['cp.utag_main_source'] = b["qp.source"];

        //console.log("remove cookie");

    }


//Kameleon
    if (s.linkName === "Kameleoon Tracking") {
        if (window.Kameleoon) {
            Kameleoon.API.Tracking.processOmniture(s);
        }
        window.kameleoonOmnitureCallSent = true;
    }


//UserAgent String
    s.eVar61 = navigator.userAgent;

}