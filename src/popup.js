/*
 * popup.js
 * (c) 2022 Ananda Masri
 * Released under the MIT license
 * auro.technology/open-source/popup
 */


import './popup.styl';
import closeIcon from './close-icon.svg';
import { getViewportOffset, isVisible, onTopZIndex } from '@aamasri/dom-utils';


// module scope vars
const debug = false;
let loadUrlBusy;
let popupCount = 0;
let $body;
let $window;


/** launches a content popup box configured by an options object
 *
 * @param {Object} options
 * @param {string|object|undefined} options.source - the content source: html content, selector, url(GET encoded data), or element
 * @param {string|undefined } options.fragment - (optional) selector by which to isolate a portion of the source HTML
 * @param {boolean|undefined} options.modal - (default false) page background dimming
 * @param {string|object|undefined} options.target - the target: selector, jQuery object or element
 * @param {boolean|undefined} options.replace - (default true) whether to close any existing popups or layer up
 * @param {boolean|undefined} options.persistent - (default false) whether ESC/blur automatically closes the popup
 * @param {function|string|undefined} options.onClose - (optional) function or eval(string) callback to execute after popup dismissed
 * @param {string|undefined} options.classes - (optional) classes to apply to the popup
 * @param {string|undefined} options.attributes - (optional) attributes to apply to the popup
 *
 * @returns {Promise}
 */
async function open(options) {
    options = options || {};

    if (debug) console.debug('popup.open invoked with options', options);

    // lazy load dependencies
    if (window.jQuery === undefined) {
        window.jQuery = await import(/* webpackChunkName: "jquery" */ 'jquery');
        window.jQuery = window.jQuery.default;
    }

    if (debug) console.debug('jQuery loaded', typeof window.jQuery);

    if (window.anime === undefined) {
        window.anime = await import(/* webpackChunkName: "anime" */ 'animejs/lib/anime.es.js');
        window.anime = window.anime.default;
    }

    if (debug) console.debug('animejs loaded', typeof window.anime);

    const domUtils = await import(/* webpackChunkName: "dom-utils" */ '@aamasri/dom-utils');

    if (debug) console.debug('dom-utils loaded', typeof domUtils);

    $body = $body || domUtils.$cache().$body;
    $window = $window || domUtils.$cache().$window;

    if (!options.title && !options.source) {
        options.title = 'Popup Cheat Sheet';
        options.source = usageInstructions;
    }

    // variables for constructing the popup UI component
    let popupId = `popup-${++popupCount}`;
    let popupBody;
    let popupTitle = options.title || '';

    // autodetect if specified source is an url (ie starts with "http" or "/")
    const sourceIsUrl = typeof options.source === 'string' && (/^https?:\/\/[a-z]+/.test(options.source) || /^\/[a-z]+/.test(options.source));

    // selector or raw content?
    if (!sourceIsUrl) {
        if (debug) console.debug(`not url`);  // non-url source

        try {
            const sourceElement = document.querySelector(options.source);
            if (debug) console.debug('source is an element');

            if (sourceElement) {
                popupBody = sourceElement.innerHTML;
                popupTitle = popupTitle || elementTitle(sourceElement) || '';
            }

            if (debug) console.debug(`popup title:${popupTitle} \n\n body:${popupBody}`);
        } catch (error) {
            // ignore error - just means options.source isn't a selector
            if (debug) console.debug(`source "${options.source}" is not a selector`);
        }

        popupBody = popupBody || options.source || '';
    }

    options.replace = typeof options.replace === 'undefined' || !!options.replace;  // default true
    if (options.replace)
        closeAll();     // close all existing popups

    // build the popup UI
    const modalDiv = options.modal ? `<div class="popup-modal" data-for="${popupId}"></div>` : '';

    const createdData = `data-created="${Date.now()}"`;

    let classes = [];
    if (options.persistent) classes.push('persistent');
    if (options.classes && typeof options.classes === 'string') classes.push(options.classes);

    const attributes = options.attributes || '';

    let $popup = jQuery(`${modalDiv}
                        <div id="${popupId}" class="popup-box ${classes.join(' ')}" ${attributes} ${createdData}>
                            <div class="arrow"></div>
                            
                            <div class="icons">
                                <span class="icon-close">${closeIcon}</span>
                            </div>
                            
                            <div class="popup-body">
                                ${(popupBody || 'Loading •••')}
                            </div>
                        </div>`);

    $popup.appendTo($body);

    // apply z-index to modal underlay and popup box
    const onTop = domUtils.onTopZIndex();
    if (onTop)
        $popup.css('z-index', onTop);


    if (options.modal)
        $popup = $body.find(`#${popupId}`);    // exclude the modal overlay div

    if (debug) console.debug(`popup ${popupId} appended to body`, $popup.length);


    initPopupListeners();   // popup events: fullscreen, close(ESC, blur, close icon)

    if (options.onClose)
        bindCloseCallback($popup, options.onClose);

    let openAnimation = openAnimatePopup($popup, options.target);

    // fetch the url content
    if (sourceIsUrl) {
        // give urls a chance to load (with a timeout)
        if (loadUrlBusy) {
            console.warn('popup cancelled because another popup is busy loading');
            $popup.remove();
            return;
        }

        loadUrlBusy = window.setTimeout(function () {
            loadUrlBusy = false;
        }, 5000);


        // jQuery.get() is CORS compatible (allows non SSL http://site to access SSL https://site e.g. when login is SSL only)
        try {
            popupBody = await jQuery.get(options.source);
            popupBody = options.fragment ? jQuery(popupBody).find(options.fragment).html() : popupBody;		//if html fragment specified (mimics jQuery.load fragment functionality) then discard all but the specified selector content

            if (popupBody.includes('<head')) {
                popupBody = `<iframe src="${options.source}"></iframe>`;
                $popup.addClass('has-iframe');
            }

        } catch (error) {
            if (error.responseText)
                popupBody = error.responseText;    // backend error message
            else if (error.statusText)              // backend error status eg. 404 Not Found
                popupBody = `Loading url ${options.source} failed with "${error.statusText}"`;
            else
                popupBody = 'Loading url ${options.source} failed!';      // whoops - we've got no idea what went wrong
        }

        loadUrlBusy = false;
        $popup.find('.popup-body').html(popupBody);

        if (debug) console.debug('replace content:', $popup.find('.popup-body').html());

        // animate popup open again as it's remotely loaded content is probably bigger
        openAnimation.pause();
        openAnimation = openAnimatePopup($popup, options.target);
    }

    await openAnimation.finished;   // resolved on animation complete

    $popup.find('.icons svg').fadeIn();     // this is really just to get Firefox to re-render them properly

    return $popup[0];  // enables popup element to be manipulated by invoker
}




function openAnimatePopup($popup, target=null) {
    if (debug) console.debug(`openAnimatePopup `, $popup[0].id);

    // popup sizing
    const popupWidth = $popup.width();
    const popupHeight = $popup.height();
    const popupArea = popupHeight * popupWidth;
    const windowWidth = $window.width();
    const windowHeight = $window.height();
    const windowArea = windowHeight * windowWidth;
    const wide = (popupWidth / windowWidth) > 0.8;   // avoid overshooting the viewport (hence 2 animations)
    const large = popupArea / windowArea > 0.3;

    if (large)
        $popup.addClass('large');

    if (debug) console.debug(`popup size relative to window`, popupArea/windowArea);

    // focus/select first input element of any form content
    const formInput = document.querySelector(`#${$popup[0].id} .popup-body input`);
    if (formInput) {
        formInput.focus();
        formInput.select();
    }

    let animeConfig;


    const $target = jQuery(target);
    if ($target.length && isVisible($target)) {
        positionPopup($popup, $target, 40);     // position the popup relative to the target
        animeConfig = {
            targets: $popup[0],
            scale: [ 0, 1 ],
            duration: 300,
            easing: 'easeInOutCubic'
        };
    } else {
        // popup in centre of the viewport (default CSS)
        animeConfig = {
            targets: $popup[0],
            translateX: [ '-50%', '-50%' ],
            translateY: [ '-50%', '-50%' ],
            scale: [ 0, 1 ],
            duration: 300,
            easing: 'easeInOutCubic'
        };
    }

    return anime(animeConfig);   // run open animation
}



// position popup relative to specified target element
// based on available space, the popup will be positioned above, below, left or right of the target
// if the popup is too large to fit beside the target, it will be positioned above or below the target
// if the popup is still too large, it will be positioned in the center of the viewport.
function positionPopup(popup, target, TARGET_MARGIN = 40, PAGE_MARGIN = 20) {
    const $popup = jQuery(popup);
    const $target = jQuery(target);
    if (!$popup.length || !$target.length || !isVisible($target))
        return;    // abort positioning on the target (not visible)

    const POPUP_WIDTH = $popup.outerWidth();
    const POPUP_HEIGHT = $popup.outerHeight();
    const TARGET_WIDTH = $target.outerWidth();
    const TARGET_HEIGHT = $target.outerHeight();
    const WINDOW_WIDTH = jQuery(window).width();
    const WINDOW_HEIGHT = jQuery(window).height();
    const targetViewOffset = getViewportOffset($target);
    const DOC_WIDTH = jQuery(document).width();
    const DOC_HEIGHT = jQuery(document).height();
    const targetDocOffset = $target.offset();   // top/left offset relative to document
    targetDocOffset.right = DOC_WIDTH - targetDocOffset.left - TARGET_WIDTH;
    targetDocOffset.bottom = DOC_HEIGHT - targetDocOffset.top - TARGET_HEIGHT;

    console.log(`targetDocOffset`, targetDocOffset);
    const left = targetViewOffset.left >= targetViewOffset.right;
    const top = targetViewOffset.top >= targetViewOffset.bottom;
    const horizontalSpace = (left ? targetViewOffset.left : targetViewOffset.right) - TARGET_MARGIN - PAGE_MARGIN;
    const verticalSpace = (top ? targetViewOffset.top : targetViewOffset.bottom) - TARGET_MARGIN - PAGE_MARGIN;
    const beside = horizontalSpace >= POPUP_WIDTH;  // prefer positioning beside the target

    if (POPUP_WIDTH > horizontalSpace && POPUP_HEIGHT > verticalSpace)
        return;    // abort positioning (popup too large to fit beside/above/below the target)

    console.log(`positionPopup 
        target width: ${TARGET_WIDTH} 
        target height: ${TARGET_HEIGHT}

        popup width: ${POPUP_WIDTH} 
        popup height: ${POPUP_HEIGHT}

        window width: ${WINDOW_WIDTH}
        window height: ${WINDOW_HEIGHT} 

        requested target margin: ${TARGET_MARGIN}
        requested page margin: ${PAGE_MARGIN}
        
        target viewport offset left: ${Math.round(targetViewOffset.left)} 
        target viewport offset right: ${Math.round(targetViewOffset.right)} 
        target viewport offset top: ${Math.round(targetViewOffset.top)} 
        target viewport offset bottom: ${Math.round(targetViewOffset.bottom)} 

        horizontal space: ${Math.round(horizontalSpace)} 
        vertical space: ${Math.round(verticalSpace)}
        
        show on left: ${left}
        show on top: ${top}
        show beside: ${beside}
    `);

    const popupCss = {
        //position: ($target.style.position === 'fixed') ? 'fixed' : 'absolute',   // we need to position the popup relative to the target
        overflow: 'visible',
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
        left: 'auto',
        zIndex: onTopZIndex()
    };

    // arrow
    const $arrow = $popup.find('.arrow');
    const arrow = $arrow[0];
    const ARROW_SIZE = $arrow.outerWidth();

    // there are 8 possible positions for the popup (beside/above/below/left/right of the target)
    if (beside) {
        if (left) {
            // position to left of target
            popupCss.right = (WINDOW_WIDTH - targetDocOffset.left + TARGET_MARGIN) + 'px';
            $arrow.addClass('right')    // arrow on right side of popup

        } else {
            // position to right of target
            popupCss.left = (WINDOW_WIDTH - targetDocOffset.right + TARGET_MARGIN) + 'px';
            $arrow.addClass('left')     // arrow on left side of popup
        }

        if (top) {
            // top left     |-------|
            // beside       | POPUP |     |--|
            //              |_______|> .. |__|
            popupCss.bottom = (targetDocOffset.bottom - TARGET_MARGIN) + 'px';
            arrow.style.marginTop = POPUP_HEIGHT - (ARROW_SIZE * 3) - (TARGET_HEIGHT / 2) + 'px';
        } else {
            // bottom left  |-------|> .. |--|
            // beside       | POPUP |     |__|
            //              |_______|
            popupCss.top = (targetDocOffset.top - TARGET_MARGIN) + 'px';
            arrow.style.marginTop = (ARROW_SIZE / 2) + (TARGET_HEIGHT / 2) + 'px';
        }

    } else {
        // there's not enough space beside the target, so position above/below the target
        // aligned to document left/right edge (to prevent overflow)
        popupCss.maxWidth = WINDOW_WIDTH - (PAGE_MARGIN * 2);

        if (left) {
            // position below (left) of target
            popupCss.left = PAGE_MARGIN + 'px';
            arrow.style.marginLeft = targetDocOffset.left - $arrow.offset().left + (TARGET_WIDTH / 2) + (ARROW_SIZE / 3) + 'px';
            //arrow.style.marginLeft = POPUP_WIDTH - (ARROW_SIZE * 3) - (TARGET_WIDTH / 2) + 'px';
        } else {
            // position below (right) of target
            popupCss.right = PAGE_MARGIN + 'px';
            arrow.style.marginLeft = targetDocOffset.left - $arrow.offset().left + (TARGET_WIDTH / 2) - (ARROW_SIZE) + 'px';
        }

        if (top) {
            // top left       |-------|
            // !beside        | POPUP |
            //                |_______|
            //                      .
            //                    |--|
            //                    |__|

            popupCss.top = (targetDocOffset.top - POPUP_HEIGHT - TARGET_MARGIN) + 'px';
            $arrow.addClass('bottom')   // point to the target below
        } else {
            //                    |--|
            //                    |__|
            //                       .
            // bottom left   |-------|
            // !beside       | POPUP |
            //               |_______|
            popupCss.bottom = (targetDocOffset.bottom - POPUP_HEIGHT - TARGET_MARGIN) + 'px';
            console.log(`css.bottom = (${targetDocOffset.bottom} - ${POPUP_HEIGHT} - ${TARGET_MARGIN}) + 'px' =`, popupCss.bottom)
            $arrow.addClass('top')   // point to the target above
        }
    }

    console.log(`popup css`, popupCss);

    $popup.css(popupCss);
}




function executeCallback(callback) {
    switch (typeof (callback)) {
        case 'function':
            callback();
            return;

        case 'string':
            try {
                eval(callback);
            } catch (error) {
                console.error('close callback failed with', error);
            }
    }
}



/** close/destroy all popup popups
 * @returns {void}
 */
function closeAll() {
    const popups = getAllPopups();
    const modals = getAllModals();

    if (popups.length)
        popups.forEach((popup) => {
            popup.remove();
        });

    if (modals.length)
        modals.forEach((modal) => {
            modal.remove();
        });
}


/** close/destroy the topmost popup
 * @returns {void}
 */
function closeLast() {
    const popups = getAllPopups();
    if (popups.length) {
        const lastPopup = popups[popups.length - 1];

        // persistent popups don't close on blur
        if (!lastPopup.classList.contains('persistent'))
            close(lastPopup);
    }
}


/** close/destroy the specified popup
 * @param {object|jQuery|HTMLElement|Element } popup
 * @returns {void}
 */
function close(popup) {
    const $popup = jQuery(popup).closest('.popup-box');
    if (!$popup.length)
        return;

    popup = $popup[0];

    if (debug) console.debug(`  closing popup`, popup.id);

    // click that launched a popup shouldn't also remove it
    const createdAt = popup.getAttribute('data-created');
    if ((Date.now() - createdAt) < 500) {
        if (debug) console.debug(`    cancelled because it's less than a second old`);
        return;
    }

    if (debug) console.debug(`    popup is ${Date.now() - createdAt} mS old`);

    const relatedModal = getRelatedModal(popup);

    // close popup animation
    const animeConfig = {
        targets: popup,
        scale: [
            { value: [ 1, 0.9 ] }
        ],
        opacity: [
            { value: [ 1, 0 ] }
        ],
        duration: 300,
        easing: 'linear'
    };

    anime(animeConfig).finished.then(() => {
        popup.remove();

        if (relatedModal)
            relatedModal.remove();
    });

}


function getAllPopups() {
    return document.querySelectorAll('.popup-box');
}

function getAllModals() {
    return document.querySelectorAll('.popup-modal');
}

function getRelatedModal(popup) {
    return document.querySelector(`.popup-modal[data-for="${popup.id}"]`);
}

function getRelatedPopup(modal) {
    const popupId = modal.getAttribute('data-for');
    return document.getElementById(popupId);
}


// setup popup blur event detection once (on body element)
let blurHandlerBound = false;
function initPopupListeners() {
    if (blurHandlerBound)
        return;

    blurHandlerBound = true;

    jQuery(document).on('click', (event) => {
        const $clicked = jQuery(event.target);

        if (debug) console.debug(`clicked on ${$clicked[0].nodeName} "${$clicked.text().substring(0,10)}.."`);

        // interacting with a popup only closes any later/on-top popups
        const $closestPopupBox = $clicked.closest('.popup-box');
        if ($closestPopupBox.length) {
            if (debug) console.debug(`  clicked on popup`, $closestPopupBox[0].id);
            const createdAt = $closestPopupBox[0].getAttribute('data-created');

            getAllPopups().forEach((popup) => {
                if (popup.getAttribute('data-created') > createdAt)
                    close(popup);
            });

            if ($clicked.closest('.icon-close').length) {
                if (debug) console.debug(`  clicked on popup close button`);
                close($closestPopupBox);
            }

            if ($clicked.closest('.icon-fullscreen').length) {
                const url = $closestPopupBox.data('url');
                if (debug) console.debug(`  clicked on popup fullscreen button`, url);
                window.open(url, '_self');
            }

            return;
        }

        // clicking on a modal overlay closes it, it's related popup and all later/on-top popups/modals
        const $closestModalOverlay = $clicked.closest('.popup-modal');
        if ($closestModalOverlay.length) {
            const relatedPopup = getRelatedPopup($closestModalOverlay[0]);
            if (relatedPopup) {
                if (debug) console.debug(`  clicked on modal for popup`, relatedPopup.id);

                const createdAt = relatedPopup.getAttribute('data-created');

                getAllPopups().forEach((popup) => {
                    if (popup.getAttribute('data-created') >= createdAt) {

                        // persistent popups don't close on blur
                        if (!popup.classList.contains('persistent'))
                            close(popup);
                    }
                });
            } else
                if (debug) console.debug(`  clicked on a modal but it's related popup is no longer in the DOM`);

            return;
        }

        closeLast();    // click was not on a popup or modal

    }).on('keydown', (event) => {
        if (debug) console.debug(`key pressed`, event.key);
        if (event.key === 'Escape') {
            // ESC on a form input first blurs the form - then closes the top popup
            if (document.activeElement && document.activeElement.nodeName !== "BODY") {
                if (debug) console.debug(`blurring`, document.activeElement.nodeName);
                document.activeElement.blur();
            } else
                closeLast();
        }
    });
}



function bindCloseCallback($popup, callback) {

// Create an observer instance linked to the callback function
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if ($popup.is(jQuery(node))) {
                    if (debug) console.debug('popup removed:', node);
                    executeCallback(callback);
                }
            });
        });
    });

// Start observing the target node for configured mutations
    observer.observe(document.querySelector('body'), { childList: true, subtree: true });
}




function elementTitle(element) {
    if (element instanceof jQuery)
        return element[0].title || element.data('title') || '';
    else
        return element.title || jQuery(element).data('title') || '';
}



const usageInstructions = `Usage instructions for developers: 
<pre style="color:#888; font-size: 12px;">
options object {
    source:     string | object     the content source: html content, selector, url, or element
    target:     string | object     popup target: html content, selector, jQuery object, or element
    fragment:   selector            selector by which to isolate a portion of the source HTML
    modal:      boolean             page background dimming
    replace:    boolean             whether to close any existing popups or layer up
    persistent: boolean             whether ESC/blur automatically closes the popup
    onClose:    function | string   callback function or eval(string) to execute after popup dismissed
    classes:    string              classes to apply to the popup container element
    attributes: string              attributes to apply to the popup container element eg. 'data-ignore-events="true"'
}
</pre>

<pre style="color: royalblue;  font-size: 12px;">
popup.open(options).then(function() {
    console.log('popup launched');
});
</pre>`;


export { open, close, closeLast, closeAll };