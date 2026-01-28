/* eslint-disable */
/* Based on SET DATA VALUE ADOBE : set Param : Default 301 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['minute_slice_6'] = getMinuteSlices(6); function getMinuteSlices(interval) {     var today = new Date();     var hh = today.getHours();     if (hh < 10) {         hh = '0' + hh;     }     var mm = Math.floor(today.getMinutes() / interval) * interval;     if (mm < 10) {          mm = '0' + mm;      }     return hh + ":" + mm; };
            } catch (e) {}
            try {
                b['minute_slice_10'] = getMinuteSlices(10); function getMinuteSlices(interval) {     var today = new Date();     var hh = today.getHours();     if (hh < 10) {         hh = '0' + hh;     }     var mm = Math.floor(today.getMinutes() / interval) * interval;     if (mm < 10) {          mm = '0' + mm;      }     return hh + ":" + mm; };
            } catch (e) {}
            try {
                b['page_escenicId'] = b.page_escenicId == undefined && adSSetup != undefined ? adSSetup.pid : b.page_escenicId;
            } catch (e) {}
            try {
                b['page_reloadStatus'] = (performance.navigation.type === 0) ? "false" : "true";
            } catch (e) {}
            try {
                b['page_orientation'] = screen.orientation.type;
            } catch (e) {}
            try {
                b['event_name_and_action'] = b['event_name'] + "_" + b['event_action'];
            } catch (e) {}
            try {
                b['page_datePublication_short'] = (b['page_datePublication'] !== undefined) ? b['page_datePublication'].substring(0,10) : "" ;
            } catch (e) {}
            try {
                b['page_dateLastModified_short'] = (b['page_dateLastModified'] !== undefined) ? b['page_dateLastModified'].substring(0,10) : "";
            } catch (e) {}
            try {
                b['page_datePublication_time'] = (b['page_datePublication'] !== undefined) ? b['page_datePublication'].substring(11,16) : "";
            } catch (e) {}
            try {
                b['page_dateLastModified_time'] = (b['page_dateLastModified'] !== undefined) ? b['page_dateLastModified'].substring(11,16) : "";
            } catch (e) {}
            try {
                b['page_age'] = (b['page_datePublication_short'] !== undefined ) ? calcDate(b['page_datePublication_short']): "";   function calcDate(d) {      	var d1 = new Date();     	var d2 =  new Date(d.replace(/-/g, "/")) ;   	 if (isNaN(d2) == false) {     	      shortenDate(d1);          	      shortenDate(d2);         	       var timeDiff = Math.abs(d1.getTime() - d2.getTime());          	       var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));      	           return diffDays.toString();     } }   	            function shortenDate(d) {      	            	d.setMilliseconds(0);      	            	d.setSeconds(0);     	            	 d.setMinutes(0);    	            	   d.setHours(0); };
            } catch (e) {}
            try {
                b['page_dateLastModified_age'] = (b['page_dateLastModified'] !== undefined) ? calcDate(b['page_dateLastModified']) : "";  function calcDate(d) {     var d1 = new Date();     var d2 = new Date(d);     if (isNaN(d2) == false) {         shortenDate(d1);         shortenDate(d2);         var timeDiff = Math.abs(d1.getTime() - d2.getTime());         var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));         return diffDays.toString();     } }  function shortenDate(d) {     d.setMilliseconds(0);     d.setSeconds(0);     d.setMinutes(0);     d.setHours(0); };
            } catch (e) {}
            try {
                b['adobe_pageName'] = b.page_type + " : " + b.page_escenicId;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
