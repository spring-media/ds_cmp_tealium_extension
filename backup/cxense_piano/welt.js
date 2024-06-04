/*
* short segments
*/

/*var cX = window.cX = window.cX || {}; cX.callQueue = cX.callQueue || [];
if (typeof window.cX != 'undefined'){
    window.cX.getUserSegmentIds({persistedQueryId: "4fea5b05fa97c40ca24d19373adb161c344008bf"});
}
*/
if (typeof window.cX != 'undefined' && typeof window.cX.getUserSegmentIds != 'undefined') {
    segmentPqs = { "4fea5b05fa97c40ca24d19373adb161c344008bf": "short", "9a4060edca15bc6ed4a5f88cf474f3116f3ddb07": "long" };
    segmentInfo = localStorage.getItem("_cX_segmentInfo");
    segments = segmentInfo.split('/').reduce((initial, curr, idx, arr) => { initial[segmentPqs[curr.split("_")[0]]] = "." + curr.split("_")[2] + "."; return initial; }, {});
    utag.data.piano_short = segments.short;
    console.log('Debug Segments : ' + utag.data.piano_short);
    utag.view({ "piano_short": utag.data.piano_short, "cxense_segments": "true" }, null, [147])
}




//Shortcodes Usersegmente

