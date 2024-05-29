/*
* long segments
*/

var lsc = localStorage.getItem("_cX_segmentInfo").substr(localStorage.getItem("_cX_segmentInfo").lastIndexOf("_") + 1);
//var segments = localStorage.getItem("_cX_segmentInfo").substr(localStorage.getItem("_cX_segmentInfo").lastIndexOf("")+1).split('.').filter(function(s){return (s && 0 !== s.length)});

function sTq(s, t) {
    var qs = []; var sl = s.split("."); var n = sl.length / Math.ceil(s.length / t);
    for (var i = 0; i < s.length; i++) { var it = sl.slice(Math.floor(i * n), Math.floor(i * n + n)); qs.push(it); }
    return qs.map(function (q) { return q.join(".") });
}


utag.data.piano_01 = sTq(lsc, 200)[0] || "";
utag.data.piano_02 = sTq(lsc, 200)[1] || "";
utag.data.piano_03 = sTq(lsc, 200)[2] || "";
utag.data.piano_04 = sTq(lsc, 200)[3] || "";
utag.data.piano_05 = sTq(lsc, 200)[4] || "";

/*
* short segments
*/

//Shortcodes Usersegmente
/*var cX = window.cX = window.cX || {}; cX.callQueue = cX.callQueue || [];
if (typeof window.cX != 'undefined'){
    window.cX.getUserSegmentIds({persistedQueryId: "1bb0283fe6bf0c26d91e4997c5b5afa1bf6f9d07"});
}*/
//if (typeof window.cX.getUserSegmentIds != 'undefined'){
segmentPqs = { "1bb0283fe6bf0c26d91e4997c5b5afa1bf6f9d07": "short", "9a4060edca15bc6ed4a5f88cf474f3116f3ddb07": "long" };
segmentInfo = localStorage.getItem("_cX_segmentInfo");
segments = segmentInfo.split('/').reduce((initial, curr, idx, arr) => { initial[segmentPqs[curr.split("_")[0]]] = "." + curr.split("_")[2] + "."; return initial; }, {});
utag.data.piano_short = segments.short;
//}        
