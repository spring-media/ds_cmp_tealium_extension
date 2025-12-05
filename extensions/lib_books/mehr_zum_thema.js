//  Mehr zum Thema (More on this topic) Link Tracking
// This extension tracks user interactions with "Mehr zum Thema" links and sets event14 in the page view of the linked article via utag_main cookie

/* eslint-disable no-undef */
// a, b, and utag are provided by Tealium at runtime

if (a === 'link' && b && typeof b.event_name != 'undefined' && b.event_name === 'Mehr zum Thema') {
    utag.loader.SC('utag_main', { 'mzt': '1' }, 'session');

} else if (a !== 'link') {
    utag.loader.SC('utag_main', { 'mzt': '0' }, 'session');
}
