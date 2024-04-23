# DoPlugins Tealium Extension

The so called 'doPlugins' Tealium extension contains various custom Adobe Analytics tracking features. 

The [GitHub hosted 'global' version](https://github.com/spring-media/ds_cmp_tealium_extension/blob/master/extensions/doPlugins_global.js) of this extension is the result of a centralization and refactoring process of all
previously existing doPlugins extension of all media brands.

The various features of this extension are provided as a collection of Javascript objects which get attached to the global
Adobe Analytics 's-object'. A common practice and already existing pattern. 

## Tracking Features
* [Page View Events](#page-view-types-s_articleviewtypeobj)
* [External Referrer Events](#external-referrer-events-s_setexternalreferringdomainevents)
* [Kameleoon Tracking](#kameleoon-s_setkameleoontracking)
* [Homepage Teaser Tracking](#homepage-teaser-tracking-s_setteasertrackingevars)
* [Bild page names](#bild-page-names-s_bildpagenameobj)
* [Adobe Campaign Tracking](#adobe-campaign-tracking-s_campaignobj)
* [Scroll Depth Tracking](#scroll-depth-tracking-s_scrolldepthobj)
* [ICID Campaign Tracking](#icid-campaign-tracking-s_icidtracking)


### Page View Types (s._articleViewTypeObj)
This feature sets page-view events according to the referring context of an article view.
It tracks from where (from which sources/URLs) the readers of articles are coming from. These sources are grouped and 
categorized and in the end assigned to a certain page-view events (eg. event22, event27, etc.).

There are two ways of evaluating the event type:

    1. By tracking value
    2. By document referrer

#### View events by tracking value
Tracking values are added to article URLs as query parameters (cid, wtrid, wtmc). They are provided in context of 
marketing campaigns and should be used for setting the event type when there is no document referrer 
available (e.g. email campaigns).

Events which can be set by tracking values:
* event23 (other internal)
* event24 (search engines)
* event25 (social media)
* event26 (dark social / unknown)


#### View events by document referrer
The referring page URL (document.location.referrer) is analysed against various criteria in order to determine the correct view event.
Important criteria are:
* Is from same or different domain
* Is from homepage
* Is from internal recommendation system (Outbrain)
* Is from search engine result list
* Is from social media
* Is from Bild
* Is from login page

Events which can be set by referrer:
* event22 (homepage)
* event23 (other internal)
* event24 (search engines)
* event25 (social media)
* event27 (other external)
* event76 (Bild homepage)
* event77 (Bilde homepage mobile)
* event102 (article recommendation)


There are special cases in which the document referrer does not contain the correct referring URL. These cases are
caused by automated re-directs after:
* viewport/version switches on Bild
* login/sign-in
* purchases
* links from content recommendation system (Outbrain)

In these cases the original referring URL is attached as a hash parameter ('###wt_ref=') to the re-directed article URL
and should be used instead of the actual document referrer.

There is also a content recommendation system called Outbrain which creates dynamic links to articles which should fit
the user's interests. These links are using re-directs as well. But here the original source URL is provided by the 
CID tracking value attached as a query parameter to the article URL.

Some of these channels are only Bild related. This is due to the fact that Bild has various sub brands like Computerbild
or Sportbild which receive most of their traffic from it's 'mother brand'. The sub brands are published on their own 
domains with the one exception of Sportbild (www.sportbild.bild.de). 

Please take these special cases in mind for understanding implementation details and exceptions.

### External Referrer Events (s._setExternalReferringDomainEvents)
Setting additional events depending on the referrer context.


### Kameleoon (s._setKameleoonTracking)


### Homepage Teaser Tracking (s._setTeaserTrackingEvars)
Tracking of the homepage teaser clicks.


### Bild Page Names (s._bildPageNameObj)
Setting/Modification of the tracking parameter pageName only for Bild.


### Adobe Campaign Tracking (s._campaignObj)
Adobe marketing campaigns tracking.


### Scroll Depth Tracking (s._scrollDepthObj)
Scroll depth tracking: How far down did a user scroll the page before he/she clicks on a link?
The actual tracking of this information happens on the next page view. This feature uses the Adobe plugin 'getPercentPageViewed'.

As a side effect the property s._ppvPreviousPage gets set which is used by other features (!!!).

Because the needed property s.pageName is not available on initialization of the extension it needs to get called from
the global doPlugins callback (even though it should be executed only once).


### ICID Campaign Tracking (s._ICIDTracking)
Some internal campaign tracking.


## Internal Features
* [Init Function](#s_init)
* [Doplugins Function](#s_dopluginsglobal)
* [Utils Object](#s_utils)
* [Events Object](#s_eventsobj)

### s._init
Starting point of the extension. Contains all functionalities which needs to get executed (once) on every page view
and global tracking configurations.


### s._doPluginsGlobal
Global doPlugins callback function. It contains all features which needs to get executed an every tracking call. This
function needs to be get called from within the doPlugins function of every profile.


### s._utils
A collection of functions which get used by different features.


#### s._eventsObj
Handling of the important s.event tracking property. The event property can contain several values and is set in
context of the doPlugins callback.
