/*
 * global loader (attaches popup to the global window object)
 */

const debug = false;

// lazy load popup and it's dependencies (on first invocation only)
import(/* webpackChunkName: "popup" */ './popup.mjs').then(function (popupModule) {
    window.popup = popupModule;
    if (debug) console.debug('popup loaded', typeof window.popup);
});