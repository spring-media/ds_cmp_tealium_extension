/* eslint-disable */
const s = window.s || {};

// START: Pre-defined Adobe Plugins

/* Adobe Consulting Plugin: getPreviousValue v3.0 */
s.getPreviousValue = function(v,c){var k=v,d=c;if("-v"===k)return{plugin:"getPreviousValue",version:"3.0"};var a=function(){if("undefined"!==typeof window.s_c_il)for(var c=0,b;c<window.s_c_il.length;c++)if(b=window.s_c_il[c],b._c&&"s_c"===b._c)return b}();"undefined"!==typeof a&&(a.contextData.getPreviousValue="3.0");window.cookieWrite=window.cookieWrite||function(c,b,f){if("string"===typeof c){var h=window.location.hostname,a=window.location.hostname.split(".").length-1;if(h&&!/^[0-9.]+$/.test(h)){a=2<a?a:2;var e=h.lastIndexOf(".");if(0<=e){for(;0<=e&&1<a;)e=h.lastIndexOf(".",e-1),a--;e=0<e?h.substring(e):h}}g=e;b="undefined"!==typeof b?""+b:"";if(f||""===b)if(""===b&&(f=-60),"number"===typeof f){var d=new Date;d.setTime(d.getTime()+6E4*f)}else d=f;return c&&(document.cookie=encodeURIComponent(c)+"="+encodeURIComponent(b)+"; path=/;"+(f?" expires="+d.toUTCString()+";":"")+(g?" domain="+g+";":""),"undefined"!==typeof cookieRead)?cookieRead(c)===b:!1}};window.cookieRead=window.cookieRead||function(c){if("string"===typeof c)c=encodeURIComponent(c);else return"";var b=" "+document.cookie,a=b.indexOf(" "+c+"="),d=0>a?a:b.indexOf(";",a);return(c=0>a?"":decodeURIComponent(b.substring(a+2+c.length,0>d?b.length:d)))?c:""};var l;d=d||"s_gpv";a=new Date;a.setTime(a.getTime()+18E5);window.cookieRead(d)&&(l=window.cookieRead(d));k?window.cookieWrite(d,k,a):window.cookieWrite(d,l,a);return l};
/* istanbul ignore next */
/* Adobe Consulting Plugin: p_fo (pageFirstOnly) v3.0 (Requires AppMeasurement) */
s.p_fo = function (c) { if ("-v" === c) return { plugin: "p_fo", version: "3.0" }; a: { if ("undefined" !== typeof window.s_c_il) { var a = 0; for (var b; a < window.s_c_il.length; a++)if (b = window.s_c_il[a], b._c && "s_c" === b._c) { a = b; break a } } a = void 0 } "undefined" !== typeof a && (a.contextData.p_fo = "3.0"); window.__fo || (window.__fo = {}); if (window.__fo[c]) return !1; window.__fo[c] = {}; return !0 };
/* istanbul ignore next */
/* Adobe Consulting Plugin: apl (appendToList) v4.0 */
s.apl = function (lv, va, d1, d2, cc) { var b = lv, d = va, e = d1, c = d2, g = cc; if ("-v" === b) return { plugin: "apl", version: "4.0" }; var h = function () { if ("undefined" !== typeof window.s_c_il) for (var k = 0, b; k < window.s_c_il.length; k++)if (b = window.s_c_il[k], b._c && "s_c" === b._c) return b }(); "undefined" !== typeof h && (h.contextData.apl = "4.0"); window.inList = window.inList || function (b, d, c, e) { if ("string" !== typeof d) return !1; if ("string" === typeof b) b = b.split(c || ","); else if ("object" !== typeof b) return !1; c = 0; for (a = b.length; c < a; c++)if (1 == e && d === b[c] || d.toLowerCase() === b[c].toLowerCase()) return !0; return !1 }; if (!b || "string" === typeof b) { if ("string" !== typeof d || "" === d) return b; e = e || ","; c = c || e; 1 == c && (c = e, g || (g = 1)); 2 == c && 1 != g && (c = e); d = d.split(","); h = d.length; for (var f = 0; f < h; f++)window.inList(b, d[f], e, g) || (b = b ? b + c + d[f] : d[f]) } return b };
/******************************************** END CODE TO DEPLOY ********************************************/
/* eslint-enable */
// END: Pre-defined Adobe Plugins

s._utils = {
    isDocTypeArticle: function () {
        const docType = window.utag.data.mapped_page_document_type
            || window.utag.data.mapped_page_doc_type
            || window.utag.data.mapped_document_type
            || '';
        return docType === 'article';
    },
};

s._setPageAgeForCheckout = function () {
    if (typeof window.utag.data.page_age !== 'undefined'
        && s._utils.isDocTypeArticle()) {

        window.utag.loader.SC('utag_main', { 'pa': window.utag.data.page_age + ';exp-session' });
        window.utag.data['cp.utag_main_pa'] = window.utag.data.page_age;

    }
};

s._bildAppsPageNameObj = {
    isLive: function () {
        return (!!window.utag.data.page_cms_path && 
                (window.utag.data.page_cms_path.indexOf('/im-live-ticker/') !== -1
                    || window.utag.data.page_cms_path.indexOf('im-liveticker') !== -1
                    || window.utag.data.page_cms_path.indexOf('/liveticker/') !== -1
                    || window.utag.data.page_cms_path.startsWith('liveticker/') 
                    || (!!window.utag.data.keywords && window.utag.data.keywords.indexOf('Live-Ticker') !== -1)));
    },

    isSport: function () {
        const lowerCmsPath = window.utag.data.page_cms_path.toLowerCase() || '';
        return (!!window.utag.data.page_cms_path && (lowerCmsPath.indexOf('sport/') !== -1
                    || lowerCmsPath.indexOf('sportdaten') !== -1));
    },

    setDocTypeProperty: function (value) {
        if (window.utag.data.mapped_page_document_type)
            window.utag.data.mapped_page_document_type = value;

        else if (window.utag.data.mapped_page_doc_type)
            window.utag.data.mapped_page_doc_type = value;

        else if (window.utag.data.mapped_document_type)
            window.utag.data.mapped_document_type = value;
    },

    setAppsPageName: function (s) {
        if (s._utils.isDocTypeArticle()){
            if (this.isLive() && !this.isSport()) {
                this.setDocTypeProperty('live');
                s.eVar3 = 'live';
                s.prop3 = 'live';
                s.pageName = 'live : ' + window.utag.data['page_id'];
            } else if (this.isLive() && this.isSport()) {
                this.setDocTypeProperty('live-sport');
                s.eVar3 = 'live-sport';
                s.prop3 = 'live-sport';
                s.pageName = 'live-sport : ' + window.utag.data['page_id'];
            }
        }
    },
};

s._orderViaArticle = function (s) {
    if (window.utag.data.order_via && window.utag.data.order_via === 'article') {
        s.eVar17 = window.utag.data['cp.utag_main_pa'];
    }
};

s._setPageCmsPathWithoutBild = function (s) {
    if (typeof window.utag.data.page_cms_path !== 'undefined'
        && window.utag.data.page_cms_path.indexOf('/BILD/') !== -1) {

        s.eVar4 = window.utag.data.page_cms_path.replace('/BILD/', '');
        s.prop4 = window.utag.data.page_cms_path.replace('/BILD/', '');
        window.utag.data.page_cms_path = window.utag.data.page_cms_path.replace('/BILD/', '');
    }
};

/**
 * Configuration of events property
 */
s._eventsObj = {
    events: [],
    addEvent: function (eventName) {
        this.events.push(eventName);
    },
    setEventsProperty: function (s) {
        const eventsString = this.events.join(',');
        if (eventsString) {
            s.events = s.events || '';
            s.events = s.apl(s.events, eventsString);
            this.events = [];
        }
    }
};

/**
 * previous Page tracking.
 */
s._prevPageObj = {
    isFirstRun: true,

    getPreviousPageValue: function (s) {
        s.eVar33 = s.prop61 = s._prevPage = s.getPreviousValue(s.pageName, 'gpv_Page');
    },
   
    isFromHomePageId: function (s) {
        return s._prevPage.includes('20595788') || s._prevPage.includes('52081556') ||s._prevPage.includes('26324062') || s._prevPage.includes('52081598' || s.pageName.includes('jJt31TLVzDZzInKWHyk1'));
    },

    isArticlePage: function (s) {
        return s.pageName && (s.pageName.includes('article') || s.pageName.includes('media'));
    },

    isHomePage: function (s) {
        return (s.pageName.includes('20595788') || s.pageName.includes('52081556') ||s.pageName.includes('26324062') || s.pageName.includes('52081598') || s.pageName.includes('jJt31TLVzDZzInKWHyk1'));
    },
    
    setPrevPageData: function (s) {
        if (this.isFirstRun && s.pageName) {
            this.getPreviousPageValue(s);
            const isFromHomePageId = this.isFromHomePageId(s);
            const isArticlePage = this.isArticlePage(s);
            const isHomePage = this.isHomePage(s);

            // Should be executed only once.
            this.isFirstRun = false;
            if (isFromHomePageId && isArticlePage) {
                s._eventsObj.addEvent('event22');
            } 
            if (isFromHomePageId && !isHomePage) {
                s._eventsObj.addEvent('event20');
            }
        }
    },
};

s._bildAppsInit = function (s) {
    s.usePlugins = true;
    s.currencyCode = 'EUR';

    s.eVar61 = window.navigator.userAgent;

    //height & width for iPhones
    if (window.navigator.userAgent.indexOf('iPhone') > -1) {
        s.eVar94 = window.screen.width + 'x' + window.screen.height;
    }

};

s.doPlugins = function (s) {
    //no sdid for A4T
    s.expectSupplementalData = false; // Force to false;

    s.eVar63 = s.version;
    s.eVar64 = s.visitor && s.visitor.version ? s.visitor.version : undefined;

    s.eVar184 = new Date().getHours().toString();
    s.eVar181 = new Date().getMinutes().toString();
    s.eVar185 = window.utag.data.myCW || '';
    s.eVar33 = s.prop61 = s.getPreviousValue(s.pageName);
    s.prop65 = Math.round(s._ppvHighestPercentViewed / 10) * 10;

    s._bildAppsPageNameObj.setAppsPageName(s);
    s._orderViaArticle(s);
    s._setPageCmsPathWithoutBild(s);
    s._setPageAgeForCheckout();
    s._prevPageObj.setPrevPageData(s);
    s._eventsObj.setEventsProperty(s);
};

// Evaluate runtime environment
if (typeof exports === 'object') {
    // Export s-object with all functions for unit testing
    module.exports = s;
} else {
    s._bildAppsInit(s);
}