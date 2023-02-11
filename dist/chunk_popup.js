"use strict";(self.webpackChunk_aamasri_popup=self.webpackChunk_aamasri_popup||[]).push([[42],{402:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{_l:()=>getViewportOffset,n3:()=>onTopZIndex,pn:()=>isVisible,qB:()=>getDocumentOffset});function isVisible(el){if(!el instanceof Object)return!1;if(el instanceof jQuery&&(el=el[0]),"none"===getAppliedStyle(el,"display")||"hidden"===getAppliedStyle(el,"visibility")||parseFloat(getAppliedStyle(el,"opacity"))<.1)return!1;try{const rect=el.getBoundingClientRect();return rect.top>=0&&rect.left>=0&&rect.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&rect.right<=(window.innerWidth||document.documentElement.clientWidth)}catch(error){return console.warn("dom-utils.isVisible(el) threw error",error),!1}}function getViewportOffset($element){if(!($element=jQuery($element)).length)return void console.error("function getViewportOffset(element) expects a DOM element, jQuery object, or CSS selector!");let offset;try{offset=$element.offset()}catch(error){return void console.error("function getViewportOffset(element) could not determine the element offset!")}const $win=jQuery(window),left=offset.left-$win.scrollLeft(),top=offset.top-$win.scrollTop();return{top:top,right:$win.width()-left-$element.outerWidth(),bottom:$win.height()-top-$element.outerHeight(),left:left}}function getDocumentOffset($element){if(!($element=jQuery($element)).length)return void console.error("function getDocumentOffset(element) expects a DOM element, jQuery object, or CSS selector!");let offset;try{offset=$element.offset()}catch(error){return void console.error("function getViewportOffset(element) could not determine the element offset!")}const $win=jQuery(window),left=offset.left,top=offset.top;return{top:top,right:$win.width()+$win.scrollLeft()-left-$element.outerWidth(),bottom:$win.height()+$win.scrollTop()-top-$element.outerHeight(),left:left}}function onTopZIndex(){let zTop=0;const elements=document.getElementsByTagName("*");for(let i=0;i<elements.length;i++){let zIndex=getZIndex(elements[i]);zIndex&&zIndex>zTop&&(zTop=zIndex)}return zTop}function getZIndex(element,recursive=!1){let zIndex=getAppliedStyle(element,"z-Index")||0;return zIndex=isNaN(zIndex)||2147483647==zIndex?0:parseInt(zIndex),recursive&&0===zIndex?getZIndex(element.parentNode,!0):zIndex}function getAppliedStyle(el,style){if(el instanceof jQuery&&(el=el[0]),!el instanceof Object)return"";try{return window.getComputedStyle(el).getPropertyValue(style)}catch(error){return console.warn("dom-utils.getAppliedStyle(el, style) threw error",error),""}}},601:(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{close:()=>close,closeAll:()=>closeAll,closeAllButLast:()=>closeAllButLast,closeLast:()=>closeLast,open:()=>open});var _aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(402);let debug=!1,loadUrlBusy,popupCount=0,$body,$window,preventClose=!1,removeClosedPopupTimeout;async function open(options){(options=options||{}).debug&&(debug=!0),debug&&console.debug("popup.open invoked with options",options),window.clearTimeout(removeClosedPopupTimeout),void 0===window.jQuery&&(window.jQuery=await __webpack_require__.e(729).then(__webpack_require__.t.bind(__webpack_require__,755,19)),window.jQuery=window.jQuery.default,debug&&console.debug("jQuery loaded",typeof window.jQuery)),$body=$body||jQuery("body"),$window=$window||jQuery(window),options.source||(options.source=usageInstructions);let popupBody,popupId="popup-"+ ++popupCount;const sourceIsUrl="string"==typeof options.source&&(/^https?:\/\/[a-z]+/.test(options.source)||/^\/[a-z]+/.test(options.source));if(!sourceIsUrl){debug&&console.debug("not url");try{const sourceElement=document.querySelector(options.source);debug&&console.debug("source is an element"),sourceElement&&(popupBody=sourceElement.innerHTML),debug&&console.debug(`popup body:${popupBody}`)}catch(error){debug&&console.debug(`source "${options.source}" is not a selector`)}popupBody=popupBody||options.source||""}let $popup,$lastPopup=null;options.replace=void 0===options.replace||!!options.replace,options.replace&&($lastPopup=jQuery(closeAllButLast()));const repurposeLastPopup=options.replace&&$lastPopup.length&&$lastPopup.is(":visible");if(repurposeLastPopup){preventClose=!0,$popup=$lastPopup,$popup.attr("data-created",Date.now());const $popupBody=$popup.find(".popup-body"),newContent=popupBody||"Loading •••";newContent!==$popupBody.html()&&$popupBody.html(newContent),$popup.find(".arrow").css({display:"none"}).removeClass("top bottom left right"),debug&&console.debug(`popup ${popupId} being repurposed`,$popup.length)}else{const modalDiv=options.modal?`<div class="popup-modal" data-for="${popupId}"></div>`:"",closeButton=options.showCloseButton?'\n        <div class="icons">\n            <span class="icon-close">\n                <svg xmlns="http://www.w3.org/2000/svg" viewBox="28 28 116 116">\n                    <path d="M35.76335,28.59668c-2.91628,0.00077 -5.54133,1.76841 -6.63871,4.47035c-1.09737,2.70194 -0.44825,5.79937 1.64164,7.83336l45.09961,45.09961l-45.09961,45.09961c-1.8722,1.79752 -2.62637,4.46674 -1.97164,6.97823c0.65473,2.51149 2.61604,4.4728 5.12753,5.12753c2.51149,0.65473 5.18071,-0.09944 6.97823,-1.97165l45.09961,-45.09961l45.09961,45.09961c1.79752,1.87223 4.46675,2.62641 6.97825,1.97168c2.5115,-0.65472 4.47282,-2.61605 5.12755,-5.12755c0.65472,-2.5115 -0.09946,-5.18073 -1.97168,-6.97825l-45.09961,-45.09961l45.09961,-45.09961c2.11962,-2.06035 2.75694,-5.21064 1.60486,-7.93287c-1.15207,-2.72224 -3.85719,-4.45797 -6.81189,-4.37084c-1.86189,0.05548 -3.62905,0.83363 -4.92708,2.1696l-45.09961,45.09961l-45.09961,-45.09961c-1.34928,-1.38698 -3.20203,-2.16948 -5.13704,-2.1696z"/>\n                </svg>\n            </span>\n        </div>':"",createdData=`data-created="${Date.now()}"`;let classes=[];options.classes&&"string"==typeof options.classes&&classes.push(options.classes);const attributes=options.attributes||"";$popup=jQuery(`${modalDiv}\n                        <div id="${popupId}" class="popup-box ${classes.join(" ")}" ${attributes} ${createdData}>\n                            <div class="arrow"></div>\n                            \n                            ${closeButton}\n                            \n                            <div class="popup-body">\n                                ${popupBody||"Loading •••"}\n                            </div>\n                        </div>`),$popup.appendTo($body);const onTop=(0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__.n3)();onTop&&$popup.css("z-index",onTop),options.modal&&($popup=$body.find(`#${popupId}`)),debug&&console.debug(`popup ${popupId} appended to body`,$popup.length),initPopupListeners(),options.onClose&&bindCloseCallback($popup,options.onClose)}openAnimatePopup($popup,options.target,repurposeLastPopup);if(sourceIsUrl){if(loadUrlBusy)return console.warn("popup cancelled because another popup is busy loading"),void $popup.remove();loadUrlBusy=window.setTimeout((function(){loadUrlBusy=!1}),5e3);try{popupBody=await jQuery.get(options.source),popupBody=options.fragment?jQuery(popupBody).find(options.fragment).html():popupBody,popupBody.includes("<head")&&(popupBody=`<iframe src="${options.source}"></iframe>`,$popup.addClass("has-iframe"))}catch(error){popupBody=error.responseText?error.responseText:error.statusText?`Loading url ${options.source} failed with "${error.statusText}"`:"Loading url ${options.source} failed!"}loadUrlBusy=!1,$popup.find(".popup-body").html(popupBody),debug&&console.debug("replace content:",$popup.find(".popup-body").html()),openAnimatePopup($popup,options.target,repurposeLastPopup)}return $popup.find(".icons svg").fadeIn(),preventClose=!1,$popup[0]}function openAnimatePopup($popup,target=null,repurposeLastPopup=!1){debug&&console.debug("openAnimatePopup ",$popup[0].id);const popupWidth=$popup.width(),popupArea=$popup.height()*popupWidth,windowWidth=$window.width(),windowArea=$window.height()*windowWidth;popupArea/windowArea>.3&&$popup.addClass("large"),debug&&console.debug("popup size relative to window",popupArea/windowArea);const formInput=document.querySelector(`#${$popup[0].id} .popup-body input`);formInput&&(formInput.focus(),formInput.select());positionPopup($popup,jQuery(target),40)}function positionPopup(popup,target,TARGET_MARGIN=40,PAGE_MARGIN=20){debug&&console.log("positionPopup");const $popup=jQuery(popup),$target=jQuery(target);if(!$popup.length)return;if($popup.css({width:"auto"}),!$target.length||!(0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__.pn)($target))return debug&&console.log(" centering"),void $popup.css({top:"50vh",left:"50vw",transform:"translateX(-50%) translateY(-50%) scale(1)"});debug&&console.log(" on target",target);const $arrow=$popup.find(".arrow");$popup.css("width","auto"),$popup.css("height","auto");const POPUP_WIDTH=$popup.outerWidth(),POPUP_HEIGHT=$popup.outerHeight(),TARGET_WIDTH=$target.outerWidth(),TARGET_HEIGHT=$target.outerHeight(),WINDOW_WIDTH=jQuery(window).width(),WINDOW_HEIGHT=jQuery(window).height(),targetViewOffset=(0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__._l)($target),targetDocOffset=(0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__.qB)($target);debug&&console.log("targetDocOffset",targetDocOffset);const left=targetViewOffset.left>=targetViewOffset.right,top=targetViewOffset.top>=targetViewOffset.bottom,horizontalSpace=(left?targetViewOffset.left:targetViewOffset.right)-TARGET_MARGIN-PAGE_MARGIN,verticalSpace=(top?targetViewOffset.top:targetViewOffset.bottom)-TARGET_MARGIN-PAGE_MARGIN;let positionBesideTarget=horizontalSpace>=POPUP_WIDTH;if(positionBesideTarget&&(targetViewOffset.top<TARGET_MARGIN||targetViewOffset.bottom<TARGET_MARGIN)&&(positionBesideTarget=!1),POPUP_WIDTH>horizontalSpace&&POPUP_HEIGHT>verticalSpace)return;$arrow.css("display","block"),debug&&console.log(`positionPopup \n        target width: ${TARGET_WIDTH} \n        target height: ${TARGET_HEIGHT}\n\n        popup width: ${POPUP_WIDTH} \n        popup height: ${POPUP_HEIGHT}\n\n        window width: ${WINDOW_WIDTH}\n        window height: ${WINDOW_HEIGHT} \n\n        requested target margin: ${TARGET_MARGIN}\n        requested page margin: ${PAGE_MARGIN}\n        \n        target viewport offset left: ${Math.round(targetViewOffset.left)} \n        target viewport offset right: ${Math.round(targetViewOffset.right)} \n        target viewport offset top: ${Math.round(targetViewOffset.top)} \n        target viewport offset bottom: ${Math.round(targetViewOffset.bottom)} \n\n        target document offset left: ${Math.round(targetDocOffset.left)} \n        target document offset right: ${Math.round(targetDocOffset.right)} \n        target document offset top: ${Math.round(targetDocOffset.top)} \n        target document offset bottom: ${Math.round(targetDocOffset.bottom)} \n\n        horizontal space: ${Math.round(horizontalSpace)} \n        vertical space: ${Math.round(verticalSpace)}\n        \n        show on left: ${left}\n        show on top: ${top}\n        space beside: ${positionBesideTarget}\n    `);const position="fixed"===$target.css("position")?"fixed":"absolute",targetOffset="fixed"===position?targetViewOffset:targetDocOffset,popupCss={position:position,overflow:"visible",top:"auto",right:"auto",bottom:"auto",left:"auto",opacity:1,transform:"translateX(0) translateY(0)",width:POPUP_WIDTH+"px",zIndex:(0,_aamasri_dom_utils__WEBPACK_IMPORTED_MODULE_0__.n3)()},arrow=$arrow[0],HALF_ARROW_SIZE=Math.sqrt(2*Math.pow($arrow.outerWidth(),2))/2;if(positionBesideTarget){left?(popupCss.left=targetOffset.left-POPUP_WIDTH-HALF_ARROW_SIZE-TARGET_MARGIN,$arrow.addClass("right")):(popupCss.left=targetOffset.left+TARGET_WIDTH+HALF_ARROW_SIZE+TARGET_MARGIN,$arrow.addClass("left")),popupCss.top=top?targetOffset.top-POPUP_HEIGHT+TARGET_HEIGHT+TARGET_MARGIN:targetOffset.top-TARGET_MARGIN;let arrowTop=targetOffset.top-popupCss.top+TARGET_HEIGHT/2-$arrow.position().top-HALF_ARROW_SIZE;arrowTop=arrowTop<0?0:arrowTop,arrow.style.marginTop=arrowTop+"px",arrow.style.marginLeft="auto"}else{popupCss.maxWidth=WINDOW_WIDTH-2*PAGE_MARGIN,popupCss.left=targetOffset.left+TARGET_WIDTH+TARGET_MARGIN-POPUP_WIDTH+$window.scrollLeft(),debug&&console.log("popup left margin",popupCss.left),popupCss.left+$window.scrollLeft()<PAGE_MARGIN&&(debug&&console.log("popup is squished up against left edge, centering it"),popupCss.left=WINDOW_WIDTH/2-POPUP_WIDTH/2+$window.scrollLeft()),debug&&console.debug(`popup arrow left\n                            targetOffset.left:${targetOffset.left} \n                            - popupCss.left:${popupCss.left} \n                            + (TARGET_WIDTH / 2):${TARGET_WIDTH/2}\n                            + ${$arrow.position().left}\n                            - HALF_ARROW_SIZE:${HALF_ARROW_SIZE}\n                        `);let arrowLeft=targetOffset.left-popupCss.left+TARGET_WIDTH/2-$arrow.position().left-HALF_ARROW_SIZE;arrowLeft=arrowLeft<0?0:arrowLeft,arrow.style.marginLeft=arrowLeft+"px",arrow.style.marginTop="auto",top?(popupCss.top=targetOffset.top-POPUP_HEIGHT-TARGET_MARGIN,$arrow.addClass("bottom")):(popupCss.top=targetOffset.top+TARGET_HEIGHT+TARGET_MARGIN,$arrow.addClass("top"))}debug&&console.log("popup css absolute",popupCss),$popup.css(popupCss)}function executeCallback(callback){switch(typeof callback){case"function":return void callback();case"string":try{eval(callback)}catch(error){console.error("close callback failed with",error)}}}function closeAll(){const popups=getAllPopups(),modals=getAllModals();popups.length&&popups.forEach((popup=>{popup.remove()})),modals.length&&modals.forEach((modal=>{modal.remove()}))}function closeLast(){const popups=getAllPopups();if(popups.length){close(popups[popups.length-1])}}function closeAllButLast(){let popups=getAllPopups();popups=[...popups],debug&&console.log("closeAllButLast popups",popups);const lastPopup=popups.length?popups.pop():null;return popups.length&&popups.forEach((popup=>{const modal=getRelatedModal(popup);modal&&modal.remove(),popup.remove()})),lastPopup}function close(popup){const $popup=jQuery(popup).closest(".popup-box");if(!$popup.length)return;popup=$popup[0],debug&&console.debug("  closing popup",popup.id);const createdAt=popup.getAttribute("data-created");if(Date.now()-createdAt<500)return void(debug&&console.debug("    cancelled close popup because it's less than a second old"));debug&&console.debug(`    popup is ${Date.now()-createdAt} mS old`);const relatedModal=getRelatedModal(popup);popup.style.opacity="0",popup.style.transform=popup.style.transform.replace("scale(1)","scale(0)"),removeClosedPopupTimeout=window.setTimeout((function(){popup.remove(),relatedModal&&relatedModal.remove()}),500)}function getAllPopups(){return document.querySelectorAll(".popup-box")}function getAllModals(){return document.querySelectorAll(".popup-modal")}function getRelatedModal(popup){return document.querySelector(`.popup-modal[data-for="${popup.id}"]`)}function getRelatedPopup(modal){const popupId=modal.getAttribute("data-for");return document.getElementById(popupId)}let blurHandlerBound=!1;function initPopupListeners(){blurHandlerBound||preventClose||(blurHandlerBound=!0,jQuery(document).on("click",(event=>{const $clicked=jQuery(event.target);debug&&console.debug(`clicked on ${$clicked[0].nodeName} "${$clicked.text().substring(0,10)}.."`);const $closestPopupBox=$clicked.closest(".popup-box");if($closestPopupBox.length){debug&&console.debug("  clicked on popup",$closestPopupBox[0].id);const createdAt=$closestPopupBox[0].getAttribute("data-created");if(getAllPopups().forEach((popup=>{popup.getAttribute("data-created")>createdAt&&close(popup)})),$clicked.closest(".icon-close").length&&(debug&&console.debug("  clicked on popup close button"),close($closestPopupBox)),$clicked.closest(".icon-fullscreen").length){const url=$closestPopupBox.data("url");debug&&console.debug("  clicked on popup fullscreen button",url),window.open(url,"_self")}return}const $closestModalOverlay=$clicked.closest(".popup-modal");if($closestModalOverlay.length){const relatedPopup=getRelatedPopup($closestModalOverlay[0]);if(relatedPopup){debug&&console.debug("  clicked on modal for popup",relatedPopup.id);const createdAt=relatedPopup.getAttribute("data-created");getAllPopups().forEach((popup=>{popup.getAttribute("data-created")>=createdAt&&close(popup)}))}else debug&&console.debug("  clicked on a modal but it's related popup is no longer in the DOM")}else console.log(" click outside popup -> closing last popup"),closeLast()})).on("keydown",(event=>{debug&&console.debug("key pressed",event.key),"Escape"===event.key&&(document.activeElement&&"BODY"!==document.activeElement.nodeName?(debug&&console.debug("blurring",document.activeElement.nodeName),document.activeElement.blur()):closeLast())})))}function bindCloseCallback($popup,callback){new MutationObserver((mutationsList=>{mutationsList.forEach((mutation=>{mutation.removedNodes.forEach((node=>{$popup.is(jQuery(node))&&(debug&&console.debug("popup removed:",node),executeCallback(callback))}))}))})).observe(document.querySelector("body"),{childList:!0,subtree:!0})}const usageInstructions='<p>Usage instructions for developers:</p> \n<pre style="color:#888; font-size: 12px;">\noptions object {\n    source:     string | object     the content source: html content, selector, url, or element\n    target:     string | object     popup target: html content, selector, jQuery object, or element\n    fragment:   selector            selector by which to isolate a portion of the source HTML\n    modal:      boolean             page background dimming\n    replace:    boolean             whether to close any existing popups or layer up\n    onClose:    function | string   callback function or eval(string) to execute after popup dismissed\n    classes:    string              classes to apply to the popup container element\n    attributes: string              attributes to apply to the popup container element eg. \'data-ignore-events="true"\'\n}\n</pre>\n\n<pre style="color: royalblue;  font-size: 12px;">\npopup.open(options).then(function() {\n    console.log(\'popup launched\');\n});\n</pre>'}}]);