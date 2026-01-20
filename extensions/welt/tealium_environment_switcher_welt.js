/*
###############################################
### PROFILE/ENVIRONMENT SWITCHING EXTENSION ###
###############################################

Author : roshan@tealium.com

Notes:
This extension:

- Allows users to change profile or environment by adding 'tealium_env=[env name]':

    e.g. greatsite.co.uk?tealium_env=qa
    e.g. greatsite.co.uk?tealium_env=dev

- Allows users to change profile by adding 'tealium_profile=[profile name]' 'tealium_env=[env name]':

    Note: If you don't change environment Tealium will force a change of environment to ensure the profile will change

    e.g. greatsite.co.uk?tealium_profile=greatprofile
    e.g. greatsite.co.uk?tealium_profile=greatprofile&tealium_env=qa

- Allows you to bust the cache by adding 'tealium_cb = 'true'

    Note : This won't work without changing to a different environment to the original page

    e.g. greatsite.co.uk?tealium_env=dev&tealium_cb=true
    e.g. greatsite.co.uk?tealium_env=dev&tealium_profile=greatprofile&tealium_cb=true

    Note: You cannot cachebust on 'prod' environments

- To remove all environment switching, just add 'tealium_env=clear' to your query-string:

    e.g. greatsite.co.uk?tealium_env=clear


*/
// PROFILE/ENVIRONMENT SWITCHER

/* jslint browser: true, nomen: true, plusplus: true, regexp: true */

// Tealium Environment Switcher: MUST BE FIRST. DO NOT MOVE

// Update "profile" var to the name of the current tealium profile
(function() {
    'use strict';
    try {
        if (
            window.location.search &&
            (window.location.search.indexOf('tealium_env=') > -1 ||
                window.location.search.indexOf('tealium_profile') > -1) &&
            !window.utag_condload_env
        ) {
            /*
            ### SET ALL OF THE RELEVANT VARS : For use in the rules ###
            Pull vars from the query string etc
            */

            const qs = window.location.search || '';
            let env = qs.match(/(tealium_env=)(dev|qa|prod|clear)/);
            // Check to see if switching profile
            let new_profile = qs.match(/(tealium_profile=)(.*)/);
            // Check for cachebuster
            let cachebuster = qs.match(/(tealium_cb=)(true)/);
            // uncomment the correct line below to switch between different tealium domains
            const tealium_domain = '//ast.welt.de'; // multi-cdn
            // tealium_domain = "//tags-eu.tiqcdn.com", //multi-cdn (EU ONLY)
            // tealium_domain = "//tealium.hs.llnwd.net/o43", //limelight only

            // Update "account" & "profile" var to the name of the current tealium profile:
            const scripts = document.getElementsByTagName('script');
            const script_array = [];

            for (let i = 0; i < scripts.length; i++) {
                script_array.push(scripts[i].outerHTML);
            }

            const script_string = script_array.join(';');

            // Set 'profile'
            const tealium_string = script_string.split('utag.js')[0].split('/');
            const profile = tealium_string[tealium_string.length - 3];

            // Clean new_profile
            if (new_profile) {
                new_profile = new_profile[2].split('&')[0];
            }

            // Set env
            if (env && env.length && env[2]) {
                env = env[2];
            }

            /*
            ### CHECK CHANGES TO BE MADE ###
            We'll check whether to change environment, bust the cache, switch profile or clear all settings
            */

            // Check cachebuster
            if (cachebuster) {
                cachebuster = '?_cb=' + Math.random() * 10000000000000000000;
            } else {
                cachebuster = '';
            }

            // Check for environment switch
            let tealium_env_switch = false;
            if (env) {
                tealium_env_switch = true;
            }

            // Check for profile switch
            let tealium_profile_switch = false;
            if (new_profile) {
                if (new_profile.length && new_profile[2]) {
                    tealium_profile_switch = true;

                    // If no environment change specified - add it
                    if (!env) {
                        env = tealium_string[tealium_string.length - 2];

                        // Change 'env' to a new env to ensure that it will change profile
                        if (env === 'prod' || env === 'qa') {
                            env = 'dev';
                        } else {
                            env = 'qa';
                        }

                        // Flag so Tealium changes environment
                        tealium_env_switch = true;
                    }
                }
            }

            // Check for tealium reset (i.e. clear all settings and revert to standard settings)
            let stop = false;
            if (tealium_env_switch === true) {
                if (env.indexOf('clear') > -1) {
                    document.cookie =
                        'utag_env_' +
                        '_' +
                        profile +
                        '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
                    if (window.console) {
                        window.console.log(
                            'Custom Tealium environment CLEARED. Default environment for this page will be used.'
                        );
                    }
                    // reload the page to switch back to default environment
                    window.location.search = '';
                    stop = true;
                }
            }

            // Log what is happening to the console
            if ((tealium_profile_switch === true || tealium_env_switch === true) && stop !== true) {
                if (window.console) {
                    if (tealium_env_switch === true) {
                        window.console.log("tealium environment = '" + env + "'");
                    }
                    if (tealium_profile_switch === true) {
                        window.console.log(
                            "tealium profile = '" +
                                new_profile +
                                "'' and will change after page refresh"
                        );
                    }
                    if (cachebuster) {
                        window.console.log('tealium cachebuster is ON');
                    }
                }

                window.utag_condload_env = true;
                window.utag_condload = true;

                // Switch profile if set
                if (tealium_profile_switch !== true) {
                    new_profile = profile;
                }

                // Define new path for cookie
                const src =
                    tealium_domain + '/' + new_profile + '/' + env + '/utag.js' + cachebuster;

                /*
                ### RUN CHANGES : Now we'll start making changes ###
                Rewrite Tealium cookie/inject new utag.js into page based on above rules to change settings
                */

                // Check if cookie exists - if it does then we'll need to reload the page in a moment
                let reload = false;
                if (document.cookie.indexOf('utag_env_' + '_' + profile) > -1) {
                    reload = true;
                }
                document.cookie = 'utag_env_' + '_' + profile + '=' + src + ';path=/';

                // Refresh page if we need to (to ensure we load the desired profile)
                if (reload === true) {
                    window.location.search = '';
                } else {
                    // Otherwise inject the new utag.js into the page
                    const a = document;
                    const b = a.createElement('script');
                    b.language = 'javascript';
                    b.type = 'text/javascript';
                    b.src = src;
                    a.getElementsByTagName('head')[0].appendChild(b);
                }
            }
        }
    } catch (e) {
        console.log('Error: ' + e);
    }
})();
