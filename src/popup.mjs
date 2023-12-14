import './popup.styl';
import { getDocumentOffset, getViewportOffset, isVisible, onTopZIndex } from '@aamasri/dom-utils';


// module scope vars
let debug = false;
let loadUrlBusy;
let $body;
let $window;
let $popup;


/** launches a content popup box configured by an options object
 *
 * @param {Object} options
 * @param {Element|string|object|undefined} options.source - the content source: html content, selector, url(GET encoded data), or element
 * @param {string|undefined } options.fragment - (optional) selector by which to isolate a portion of the source HTML
 * @param {boolean|undefined} options.modal - (default false) page background dimming
 * @param {Element|string|object|undefined} options.target - the target: selector, jQuery object or element
 * @param {boolean|undefined} options.showCloseButton - (default false) whether to show the close button
 * @param {function|string|undefined} options.onClose - (optional) function or eval(string) callback to execute after popup dismissed
 * @param {string|undefined} options.classes - (optional) classes to apply to the popup
 * @param {string|undefined} options.attributes - (optional) attributes to apply to the popup
 * @param {boolean|undefined} options.debug - (default false) whether to log debugging info to the console
 *
 * @returns {Promise}
 */
async function open(options) {
    options = options || {};

    if (options.debug)
        debug = true;

    if (debug) console.debug('popup.open invoked with options', options);

    // lazy load dependencies
    if (window.jQuery === undefined) {
        window.jQuery = await import(/* webpackChunkName: "jquery" */ 'jquery');
        window.jQuery = window.jQuery.default;
        if (debug) console.debug('jQuery loaded', typeof window.jQuery);
    }

    $body = $body || jQuery('body');
    $window = $window || jQuery(window);

    if (!options.source)
        options.source = usageInstructions;

    // variables for constructing the popup UI component
    let popupBody;

    // autodetect if specified source is an url (ie starts with "http" or "/")
    const sourceIsUrl = typeof options.source === 'string' && (/^https?:\/\/[a-z]+/.test(options.source) || /^\/[a-z]+/.test(options.source));

    // selector or raw content?
    if (!sourceIsUrl) {
        if (debug) console.debug(`not url`);  // non-url source

        try {
            const sourceElement = document.querySelector(options.source);
            if (debug) console.debug('source is an element');

            if (sourceElement)
                popupBody = sourceElement.innerHTML;

            if (debug) console.debug(`popup body:${popupBody}`);
        } catch (error) {
            // ignore error - just means options.source isn't a selector
            if (debug) console.debug(`source "${options.source}" is not a selector`);
        }

        popupBody = popupBody || options.source || '';
    }

    let existingPopup = document.querySelector('.popup-box');
    if (existingPopup) {
        $popup = jQuery(existingPopup);
        existingPopup.dataset.created = Date.now().toString();

        const existingModal = document.querySelector('.popup-modal');
        existingModal.style.display = options.modal ? 'block' : 'none';

        // only replace content if it's changed (avoids network hits from reloaded assets)
        const $popupBody = $popup.find('.popup-body');
        const previousContent = $popupBody.html();

        const newContent = popupBody || 'Loading •••';
        if (newContent !== previousContent)
            $popupBody.html(newContent);

        $popup.find('.arrow').css({ 'display': 'none' }).removeClass('top bottom left right');  // reset arrow

        // undo closed styles (bypassing CSS transitions)
        const originalTransition = existingPopup.style.transition;
        existingPopup.classList.remove('large');
        existingPopup.style.transition = 'none';
        existingPopup.style.display = 'block';
        existingPopup.style.opacity = '1';
        existingPopup.style.transform = existingPopup.style.transform.replace(/scale[(0-9.)]+/g, '').trim();
        existingPopup.offsetWidth; // force reflow
        existingPopup.style.transition = originalTransition;

        if (debug) console.debug(`popup has been repurposed`);

    } else {
        // build the popup from scratch
        const modalDiv = `<div class="popup-modal" style="display: ${options.modal ? 'block' : 'none'}"></div>`;
        const closeButton = `<span class="icon-close" style="display: ${options.showCloseButton ? 'block' : 'none'}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="28 28 116 116">
                                            <path d="M35.76335,28.59668c-2.91628,0.00077 -5.54133,1.76841 -6.63871,4.47035c-1.09737,2.70194 -0.44825,5.79937 1.64164,7.83336l45.09961,45.09961l-45.09961,45.09961c-1.8722,1.79752 -2.62637,4.46674 -1.97164,6.97823c0.65473,2.51149 2.61604,4.4728 5.12753,5.12753c2.51149,0.65473 5.18071,-0.09944 6.97823,-1.97165l45.09961,-45.09961l45.09961,45.09961c1.79752,1.87223 4.46675,2.62641 6.97825,1.97168c2.5115,-0.65472 4.47282,-2.61605 5.12755,-5.12755c0.65472,-2.5115 -0.09946,-5.18073 -1.97168,-6.97825l-45.09961,-45.09961l45.09961,-45.09961c2.11962,-2.06035 2.75694,-5.21064 1.60486,-7.93287c-1.15207,-2.72224 -3.85719,-4.45797 -6.81189,-4.37084c-1.86189,0.05548 -3.62905,0.83363 -4.92708,2.1696l-45.09961,45.09961l-45.09961,-45.09961c-1.34928,-1.38698 -3.20203,-2.16948 -5.13704,-2.1696z"/>
                                        </svg>
                                    </span>`;
        const createdData = `data-created="${Date.now()}"`;
        let classes = [];
        if (options.classes && typeof options.classes === 'string') classes.push(options.classes);
        const attributes = options.attributes || '';

        const $popupAndModal = jQuery(`${modalDiv}
                        <div class="popup-box ${classes.join(' ')}" ${attributes} ${createdData}>
                            <div class="arrow"></div>
                            
                            <div class="icons">
                                ${closeButton}
                            </div>
                            
                            <div class="popup-body">
                                ${(popupBody || 'Loading •••')}
                            </div>
                        </div>`);

        $popupAndModal.appendTo($body);

        // apply z-index to modal underlay and popup box
        const onTop = onTopZIndex();
        if (onTop)
            $popupAndModal.css('z-index', onTop);

        $popup = jQuery('.popup-box');

        if (debug) console.debug(`popup appended to body`, $popup.length);

        initPopupListeners();   // popup events: fullscreen, close(ESC, blur, close icon)

        if (options.onClose)
            bindCloseCallback(options.onClose);
    }

    openAnimatePopup(options.target);

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
        openAnimatePopup(options.target);
    }

    $popup.find('.icons svg').fadeIn();     // this is really just to get Firefox to re-render them properly

    return $popup[0];  // enables popup element to be manipulated by invoker
}




function openAnimatePopup(target=null) {
    if (debug) console.debug(`openAnimatePopup target`, target);

    // popup sizing
    const popupWidth = $popup.width();
    const popupHeight = $popup.height();
    const popupArea = popupHeight * popupWidth;
    const windowWidth = $window.width();
    const windowHeight = $window.height();
    const windowArea = windowHeight * windowWidth;
    const large = popupArea / windowArea > 0.3;

    if (large)
        $popup.addClass('large');

    if (debug) console.debug(`popup size relative to window`, popupArea/windowArea);

    // focus/select first input element of any form content
    const formInput = document.querySelector(`.popup-box .popup-body input`);
    if (formInput) {
        formInput.focus();
        formInput.select();
    }

    const $target = jQuery(target);
    positionPopup($target, 40);     // position the popup on target (or centered in viewport)
}



// position popup relative to specified target element
// based on available space, the popup will be positioned above, below, left or right of the target
// if the popup is too large to fit beside the target, it will be positioned above or below the target
// if the popup is still too large, it will be positioned in the center of the viewport.
function positionPopup(target, TARGET_MARGIN = 40, PAGE_MARGIN = 20) {
    if (debug) console.log('positionPopup');
    const $target = jQuery(target);
    if (!$popup.length)
        return;

    $popup.css({ width: 'auto' });      // unlock repurposed popup

    if (!$target.length || !isVisible($target)) {
        if (debug) console.log(' centering');
        // centre the popup in the viewport
        $popup.css({
            top: '50vh',
            left: '50vw',
            transform: 'translateX(-50%) translateY(-50%) scale(1)'
        });
        return;
    }

    if (debug) console.log(' on target', target);

    // in the case of loading content from a remote endpoint, this would be a second positioning
    // pass, so we will unlock the width in order to access the true popup width
    const $arrow = $popup.find('.arrow');
    $popup.css('width', 'auto');                // unlock width
    $popup.css('height', 'auto');                // unlock height

    const POPUP_WIDTH = $popup.outerWidth();
    const POPUP_HEIGHT = $popup.outerHeight();
    const TARGET_WIDTH = $target.outerWidth();
    const TARGET_HEIGHT = $target.outerHeight();
    const WINDOW_WIDTH = jQuery(window).width();
    const WINDOW_HEIGHT = jQuery(window).height();
    const targetViewOffset = getViewportOffset($target);
    const targetDocOffset = getDocumentOffset($target);

    if (debug) console.log(`targetDocOffset`, targetDocOffset);
    const left = targetViewOffset.left >= targetViewOffset.right;
    const top = targetViewOffset.top >= targetViewOffset.bottom;
    const horizontalSpace = (left ? targetViewOffset.left : targetViewOffset.right) - TARGET_MARGIN - PAGE_MARGIN;
    const verticalSpace = (top ? targetViewOffset.top : targetViewOffset.bottom) - TARGET_MARGIN - PAGE_MARGIN;
    let positionBesideTarget = horizontalSpace >= POPUP_WIDTH;  // prefer positioning beside the target
    if (positionBesideTarget && (targetViewOffset.top < TARGET_MARGIN || targetViewOffset.bottom < TARGET_MARGIN))
        positionBesideTarget = false;     // we need a bit more space above or below the target to show popup beside it

    if (POPUP_WIDTH > horizontalSpace && POPUP_HEIGHT > verticalSpace)
        return;    // abort positioning (popup too large to fit beside/above/below the target)

    $arrow.css('display', 'block');  // target is visible, so we're going to point to it

    if (debug) console.log(`positionPopup 
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

        target document offset left: ${Math.round(targetDocOffset.left)} 
        target document offset right: ${Math.round(targetDocOffset.right)} 
        target document offset top: ${Math.round(targetDocOffset.top)} 
        target document offset bottom: ${Math.round(targetDocOffset.bottom)} 

        horizontal space: ${Math.round(horizontalSpace)} 
        vertical space: ${Math.round(verticalSpace)}
        
        show on left: ${left}
        show on top: ${top}
        space beside: ${positionBesideTarget}
    `);

    const position = ($target.css('position') === 'fixed') ? 'fixed' : 'absolute';
    const targetOffset = (position === 'fixed') ? targetViewOffset : targetDocOffset;

    // defaults
    const popupCss = {
        position: position,   // we need to position the popup relative to the target
        overflow: 'visible',
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
        left: 'auto',
        opacity: 1,
        transform: 'translateX(0) translateY(0)',
        width: POPUP_WIDTH + 'px',  // fixing the popup width avoids misalignment and allows width transitions
        zIndex: onTopZIndex()
    };

    // arrow
    const arrow = $arrow[0];
    const HALF_ARROW_SIZE = Math.sqrt(Math.pow($arrow.outerWidth(), 2) * 2) / 2;

    // there are 8 possible positions for the popup (beside/above/below/left/right of the target)
    if (positionBesideTarget) {
        if (left) {
            // position to left of target
            popupCss.left = targetOffset.left - POPUP_WIDTH - HALF_ARROW_SIZE - TARGET_MARGIN;
            $arrow.addClass('right')    // arrow on right side of popup
        } else {
            // position to right of target
            popupCss.left = targetOffset.left + TARGET_WIDTH + HALF_ARROW_SIZE + TARGET_MARGIN;
            $arrow.addClass('left')     // arrow on left side of popup
        }

        if (top) {
            // top left     |-------|
            // beside       | POPUP |     |--|
            //              |_______|> .. |__|
            popupCss.top = targetOffset.top - POPUP_HEIGHT + TARGET_HEIGHT + TARGET_MARGIN;
        } else {
            // bottom left  |-------|> .. |--|
            // beside       | POPUP |     |__|
            //              |_______|
            popupCss.top = (targetOffset.top - TARGET_MARGIN);
        }

        // position arrow vertically
        let arrowTop = targetOffset.top - popupCss.top + (TARGET_HEIGHT / 2) - $arrow.position().top - HALF_ARROW_SIZE;
        arrowTop = (arrowTop < 0) ? 0 : arrowTop;
        arrow.style.marginTop = arrowTop + 'px';
        arrow.style.marginLeft = 'auto';

    } else {
        // there's not enough space beside the target, or the target is close to the top/bottom of the viewport,
        // so position above/below the target aligned to document left/right edge (to prevent overflow)
        popupCss.maxWidth = WINDOW_WIDTH - (PAGE_MARGIN * 2);
        popupCss.left = targetOffset.left + TARGET_WIDTH + TARGET_MARGIN - POPUP_WIDTH + $window.scrollLeft();  // align horizontally relative to the target
        if (debug) console.log(`popup left margin`, popupCss.left);

        // if popup is squished up against left edge, then center it horizontally on page
        if ((popupCss.left + $window.scrollLeft()) < PAGE_MARGIN) {
            if (debug) console.log(`popup is squished up against left edge, centering it`);
            popupCss.left = (WINDOW_WIDTH / 2) - (POPUP_WIDTH / 2) + $window.scrollLeft();
        }

        if (debug)
            console.debug(`popup arrow left
                            targetOffset.left:${targetOffset.left} 
                            - popupCss.left:${popupCss.left} 
                            + (TARGET_WIDTH / 2):${(TARGET_WIDTH / 2)}
                            + ${$arrow.position().left}
                            - HALF_ARROW_SIZE:${HALF_ARROW_SIZE}
                        `);

        let arrowLeft = targetOffset.left - popupCss.left + (TARGET_WIDTH / 2) - $arrow.position().left - HALF_ARROW_SIZE;
        arrowLeft = (arrowLeft < 0) ? 0 : arrowLeft;
        arrow.style.marginLeft = arrowLeft + 'px';
        arrow.style.marginTop = 'auto';

        if (top) {
            // top left       |-------|
            // !beside        | POPUP |
            //                |_______|
            //                      .
            //                    |--|
            //                    |__|
            popupCss.top = targetOffset.top - POPUP_HEIGHT - TARGET_MARGIN;
            $arrow.addClass('bottom')   // point to the target below
        } else {
            //                    |--|
            //                    |__|
            //                       .
            // bottom left   |-------|
            // !beside       | POPUP |
            //               |_______|
            popupCss.top = targetOffset.top + TARGET_HEIGHT + TARGET_MARGIN;
            $arrow.addClass('top')   // point to the target above
        }
    }

    if (debug) console.log(`popup css absolute`, popupCss);
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



/** close/destroy the specified popup
 * @returns {void}
 */
function close() {
    const popup = document.querySelector('.popup-box');
    if (!popup)
        return;

    if (debug) console.debug(`  closing popup`);

    // click that launched a popup shouldn't also remove it
    const createdAt = popup.dataset.created;
    if (debug) console.debug(`    popup is ${Date.now() - createdAt} mS old`);
    if ((Date.now() - createdAt) < 500) {
        if (debug) console.debug(`    cancelled close popup because it's less than a second old`);
        return;
    }

    // minimize popup/modal
    document.querySelector('.popup-modal').style.display = 'none';
    popup.style.transform = popup.style.transform.replace(/scale[(0-9.)]+/g, '').trim();
    popup.style.transform += ' scale(0)';
    popup.style.opacity = '0';
}


/////////////////////// DEPRECATED CLOSE METHODS ///////////////////////
function closeLast() {
    close();
    console.warn('package @aamasri/popup method closeLast() is deprecated because there is only ONE popup instance - use popup.close() instead');
}
function closeAll() {
    close();
    console.warn('package @aamasri/popup method closeAll() is deprecated because there is only ONE popup instance - use popup.close() instead');
}
function closeAllButLast() {
    console.warn('package @aamasri/popup method closeAllButLast() is deprecated because there is only ONE popup instance.');
    return document.querySelector('.popup-box');
}
////////////////////////////////////////////////////////////////////////




// setup popup blur event detection once (on body element)
let blurHandlerBound = false;
function initPopupListeners() {
    if (blurHandlerBound)
        return;

    blurHandlerBound = true;

    jQuery(document).on('click', event => {
        const clicked = event.target;
        if (debug) console.debug(`clicked on ${clicked.nodeName} "${clicked.innerText.substring(0,10)}.."`);

        // interacting with a popup only closes any later/on-top popups
        const closestPopupBox = clicked.closest('.popup-box');
        if (closestPopupBox) {
            if (debug) console.debug(`  clicked on the popup. On it's close button ${clicked.closest('.icon-close')}`);

            if (clicked.closest('.icon-close') === null)
                return;     // ignore clicks on the popup itself
        }

        if (debug) console.debug(`  closing popup`);
        close();

    }).on('keydown', (event) => {
        if (debug) console.debug(`key pressed`, event.key);
        if (event.key === 'Escape') {
            // ESC on a form input first blurs the form - then closes the top popup
            if (document.activeElement && document.activeElement.nodeName !== "BODY") {
                if (debug) console.debug(`blurring`, document.activeElement.nodeName);
                document.activeElement.blur();
            } else
                close();
        }
    });
}



// Create an observer instance linked to the callback function
function bindCloseCallback(callback) {
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




const usageInstructions = `<p>Usage instructions for developers:</p> 
<pre style="color:#888; font-size: 12px;">
options object {
    source:     string | object     the content source: html content, selector, url, or element
    target:     string | object     popup target: html content, selector, jQuery object, or element
    fragment:   selector            selector by which to isolate a portion of the source HTML
    modal:      boolean             page background dimming
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


export { open, close, closeLast, closeAll, closeAllButLast };