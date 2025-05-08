var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
/*!
 PowerTip v1.3.2 (2022-03-06)
 https://stevenbenner.github.io/jquery-powertip/
 Copyright (c) 2022 Steven Benner (https://stevenbenner.com/).
 Released under MIT license.
 https://raw.github.com/stevenbenner/jquery-powertip/master/LICENSE.txt
*/
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("jquery"));
  } else {
    factory(root.jQuery);
  }
})(globalThis, function($2) {
  var $document = $2(document), $window = $2(window), $body = $2("body");
  var DATA_DISPLAYCONTROLLER = "displayController", DATA_HASACTIVEHOVER = "hasActiveHover", DATA_FORCEDOPEN = "forcedOpen", DATA_HASMOUSEMOVE = "hasMouseMove", DATA_MOUSEONTOTIP = "mouseOnToPopup", DATA_ORIGINALTITLE = "originalTitle", DATA_POWERTIP = "powertip", DATA_POWERTIPJQ = "powertipjq", DATA_POWERTIPTARGET = "powertiptarget", EVENT_NAMESPACE = ".powertip", RAD2DEG = 180 / Math.PI, MOUSE_EVENTS = [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseover",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "contextmenu"
  ];
  var session = {
    elements: [],
    tooltips: null,
    isTipOpen: false,
    isFixedTipOpen: false,
    isClosing: false,
    tipOpenImminent: false,
    activeHover: null,
    currentX: 0,
    currentY: 0,
    previousX: 0,
    previousY: 0,
    desyncTimeout: null,
    closeDelayTimeout: null,
    mouseTrackingActive: false,
    delayInProgress: false,
    windowWidth: 0,
    windowHeight: 0,
    scrollTop: 0,
    scrollLeft: 0
  };
  var Collision = {
    none: 0,
    top: 1,
    bottom: 2,
    left: 4,
    right: 8
  };
  $2.fn.powerTip = function(opts, arg) {
    var targetElements = this, options, tipController;
    if (!targetElements.length) {
      return targetElements;
    }
    if ($2.type(opts) === "string" && $2.powerTip[opts]) {
      return $2.powerTip[opts].call(targetElements, targetElements, arg);
    }
    options = $2.extend({}, $2.fn.powerTip.defaults, opts);
    $2.powerTip.destroy(targetElements);
    tipController = new TooltipController(options);
    initTracking();
    targetElements.each(/* @__PURE__ */ __name(function elementSetup() {
      var $this = $2(this), dataPowertip = $this.data(DATA_POWERTIP), dataElem = $this.data(DATA_POWERTIPJQ), dataTarget = $this.data(DATA_POWERTIPTARGET), title = $this.attr("title");
      if (!dataPowertip && !dataTarget && !dataElem && title) {
        $this.data(DATA_POWERTIP, title);
        $this.data(DATA_ORIGINALTITLE, title);
        $this.removeAttr("title");
      }
      $this.data(DATA_DISPLAYCONTROLLER, new DisplayController($this, options, tipController));
    }, "elementSetup"));
    if (!options.manual) {
      $2.each(options.openEvents, function(idx, evt) {
        if ($2.inArray(evt, options.closeEvents) > -1) {
          targetElements.on(evt + EVENT_NAMESPACE, /* @__PURE__ */ __name(function elementToggle(event) {
            $2.powerTip.toggle(this, event);
          }, "elementToggle"));
        } else {
          targetElements.on(evt + EVENT_NAMESPACE, /* @__PURE__ */ __name(function elementOpen(event) {
            $2.powerTip.show(this, event);
          }, "elementOpen"));
        }
      });
      $2.each(options.closeEvents, function(idx, evt) {
        if ($2.inArray(evt, options.openEvents) < 0) {
          targetElements.on(evt + EVENT_NAMESPACE, /* @__PURE__ */ __name(function elementClose(event) {
            $2.powerTip.hide(this, !isMouseEvent(event));
          }, "elementClose"));
        }
      });
      targetElements.on("keydown" + EVENT_NAMESPACE, /* @__PURE__ */ __name(function elementKeyDown(event) {
        if (event.keyCode === 27) {
          $2.powerTip.hide(this, true);
        }
      }, "elementKeyDown"));
    }
    session.elements.push(targetElements);
    return targetElements;
  };
  $2.fn.powerTip.defaults = {
    fadeInTime: 200,
    fadeOutTime: 100,
    followMouse: false,
    popupId: "powerTip",
    popupClass: null,
    intentSensitivity: 7,
    intentPollInterval: 100,
    closeDelay: 100,
    placement: "n",
    smartPlacement: false,
    offset: 10,
    mouseOnToPopup: false,
    manual: false,
    openEvents: ["mouseenter", "focus"],
    closeEvents: ["mouseleave", "blur"]
  };
  $2.fn.powerTip.smartPlacementLists = {
    n: ["n", "ne", "nw", "s"],
    e: ["e", "ne", "se", "w", "nw", "sw", "n", "s", "e"],
    s: ["s", "se", "sw", "n"],
    w: ["w", "nw", "sw", "e", "ne", "se", "n", "s", "w"],
    nw: ["nw", "w", "sw", "n", "s", "se", "nw"],
    ne: ["ne", "e", "se", "n", "s", "sw", "ne"],
    sw: ["sw", "w", "nw", "s", "n", "ne", "sw"],
    se: ["se", "e", "ne", "s", "n", "nw", "se"],
    "nw-alt": ["nw-alt", "n", "ne-alt", "sw-alt", "s", "se-alt", "w", "e"],
    "ne-alt": ["ne-alt", "n", "nw-alt", "se-alt", "s", "sw-alt", "e", "w"],
    "sw-alt": ["sw-alt", "s", "se-alt", "nw-alt", "n", "ne-alt", "w", "e"],
    "se-alt": ["se-alt", "s", "sw-alt", "ne-alt", "n", "nw-alt", "e", "w"]
  };
  $2.powerTip = {
    /**
     * Attempts to show the tooltip for the specified element.
     * @param {jQuery|Element} element The element to open the tooltip for.
     * @param {jQuery.Event=} event jQuery event for hover intent and mouse
     *     tracking (optional).
     * @return {jQuery|Element} The original jQuery object or DOM Element.
     */
    show: /* @__PURE__ */ __name(function apiShowTip(element, event) {
      if (isMouseEvent(event)) {
        trackMouse(event);
        session.previousX = event.pageX;
        session.previousY = event.pageY;
        $2(element).data(DATA_DISPLAYCONTROLLER).show();
      } else {
        $2(element).first().data(DATA_DISPLAYCONTROLLER).show(true, true);
      }
      return element;
    }, "apiShowTip"),
    /**
     * Repositions the tooltip on the element.
     * @param {jQuery|Element} element The element the tooltip is shown for.
     * @return {jQuery|Element} The original jQuery object or DOM Element.
     */
    reposition: /* @__PURE__ */ __name(function apiResetPosition(element) {
      $2(element).first().data(DATA_DISPLAYCONTROLLER).resetPosition();
      return element;
    }, "apiResetPosition"),
    /**
     * Attempts to close any open tooltips.
     * @param {(jQuery|Element)=} element The element with the tooltip that
     *     should be closed (optional).
     * @param {boolean=} immediate Disable close delay (optional).
     * @return {jQuery|Element|undefined} The original jQuery object or DOM
     *     Element, if one was specified.
     */
    hide: /* @__PURE__ */ __name(function apiCloseTip(element, immediate) {
      var displayController;
      immediate = element ? immediate : true;
      if (element) {
        displayController = $2(element).first().data(DATA_DISPLAYCONTROLLER);
      } else if (session.activeHover) {
        displayController = session.activeHover.data(DATA_DISPLAYCONTROLLER);
      }
      if (displayController) {
        displayController.hide(immediate);
      }
      return element;
    }, "apiCloseTip"),
    /**
     * Toggles the tooltip for the specified element. This will open a closed
     * tooltip, or close an open tooltip.
     * @param {jQuery|Element} element The element with the tooltip that
     *     should be toggled.
     * @param {jQuery.Event=} event jQuery event for hover intent and mouse
     *     tracking (optional).
     * @return {jQuery|Element} The original jQuery object or DOM Element.
     */
    toggle: /* @__PURE__ */ __name(function apiToggle(element, event) {
      if (session.activeHover && session.activeHover.is(element)) {
        $2.powerTip.hide(element, !isMouseEvent(event));
      } else {
        $2.powerTip.show(element, event);
      }
      return element;
    }, "apiToggle"),
    /**
     * Destroy and roll back any powerTip() instance on the specified elements.
     * If no elements are specified then all elements that the plugin is
     * currently attached to will be rolled back.
     * @param {(jQuery|Element)=} element The element with the powerTip instance.
     * @return {jQuery|Element|undefined} The original jQuery object or DOM
     *     Element, if one was specified.
     */
    destroy: /* @__PURE__ */ __name(function apiDestroy(element) {
      var $element, foundPowerTip = false, runTipCheck = true, i;
      if (session.elements.length === 0) {
        return element;
      }
      if (element) {
        $element = $2(element);
      } else {
        $2.each(session.elements, /* @__PURE__ */ __name(function cleanElsTracking(idx, els) {
          $2.powerTip.destroy(els);
        }, "cleanElsTracking"));
        session.elements = [];
        runTipCheck = false;
        $element = $2();
      }
      if (runTipCheck) {
        $element.each(/* @__PURE__ */ __name(function checkForPowerTip() {
          var $this = $2(this);
          if ($this.data(DATA_DISPLAYCONTROLLER)) {
            foundPowerTip = true;
            return false;
          }
          return true;
        }, "checkForPowerTip"));
        if (!foundPowerTip) {
          return element;
        }
      }
      if (session.isTipOpen && !session.isClosing && $element.filter(session.activeHover).length > 0) {
        if (session.delayInProgress) {
          session.activeHover.data(DATA_DISPLAYCONTROLLER).cancel();
        }
        $2.powerTip.hide(session.activeHover, true);
      }
      $element.off(EVENT_NAMESPACE).each(/* @__PURE__ */ __name(function destroy() {
        var $this = $2(this), dataAttributes = [DATA_ORIGINALTITLE, DATA_DISPLAYCONTROLLER, DATA_HASACTIVEHOVER, DATA_FORCEDOPEN];
        if ($this.data(DATA_ORIGINALTITLE)) {
          $this.attr("title", $this.data(DATA_ORIGINALTITLE));
          dataAttributes.push(DATA_POWERTIP);
        }
        $this.removeData(dataAttributes);
      }, "destroy"));
      for (i = session.elements.length - 1; i >= 0; i--) {
        session.elements[i] = session.elements[i].not($element);
        if (session.elements[i].length === 0) {
          session.elements.splice(i, 1);
        }
      }
      if (session.elements.length === 0) {
        $window.off(EVENT_NAMESPACE);
        $document.off(EVENT_NAMESPACE);
        session.mouseTrackingActive = false;
        if (session.tooltips) {
          session.tooltips.remove();
          session.tooltips = null;
        }
      }
      return element;
    }, "apiDestroy")
  };
  $2.powerTip.showTip = $2.powerTip.show;
  $2.powerTip.closeTip = $2.powerTip.hide;
  function CSSCoordinates() {
    var me = this;
    me.top = "auto";
    me.left = "auto";
    me.right = "auto";
    me.bottom = "auto";
    me.set = function(property, value) {
      if ($2.isNumeric(value)) {
        me[property] = Math.round(value);
      }
    };
  }
  __name(CSSCoordinates, "CSSCoordinates");
  function DisplayController(element, options, tipController) {
    var hoverTimer = null, myCloseDelay = null;
    function openTooltip(immediate, forceOpen) {
      cancelTimer();
      if (!element.data(DATA_HASACTIVEHOVER)) {
        if (!immediate) {
          session.tipOpenImminent = true;
          hoverTimer = setTimeout(/* @__PURE__ */ __name(function intentDelay() {
            hoverTimer = null;
            checkForIntent();
          }, "intentDelay"), options.intentPollInterval);
        } else {
          if (forceOpen) {
            element.data(DATA_FORCEDOPEN, true);
          }
          closeAnyDelayed();
          tipController.showTip(element);
        }
      } else {
        cancelClose();
      }
    }
    __name(openTooltip, "openTooltip");
    function closeTooltip(disableDelay) {
      if (myCloseDelay) {
        myCloseDelay = session.closeDelayTimeout = clearTimeout(myCloseDelay);
        session.delayInProgress = false;
      }
      cancelTimer();
      session.tipOpenImminent = false;
      if (element.data(DATA_HASACTIVEHOVER)) {
        element.data(DATA_FORCEDOPEN, false);
        if (!disableDelay) {
          session.delayInProgress = true;
          session.closeDelayTimeout = setTimeout(/* @__PURE__ */ __name(function closeDelay() {
            session.closeDelayTimeout = null;
            tipController.hideTip(element);
            session.delayInProgress = false;
            myCloseDelay = null;
          }, "closeDelay"), options.closeDelay);
          myCloseDelay = session.closeDelayTimeout;
        } else {
          tipController.hideTip(element);
        }
      }
    }
    __name(closeTooltip, "closeTooltip");
    function checkForIntent() {
      var xDifference = Math.abs(session.previousX - session.currentX), yDifference = Math.abs(session.previousY - session.currentY), totalDifference = xDifference + yDifference;
      if (totalDifference < options.intentSensitivity) {
        cancelClose();
        closeAnyDelayed();
        tipController.showTip(element);
      } else {
        session.previousX = session.currentX;
        session.previousY = session.currentY;
        openTooltip();
      }
    }
    __name(checkForIntent, "checkForIntent");
    function cancelTimer(stopClose) {
      hoverTimer = clearTimeout(hoverTimer);
      if (session.closeDelayTimeout && myCloseDelay === session.closeDelayTimeout || stopClose) {
        cancelClose();
      }
    }
    __name(cancelTimer, "cancelTimer");
    function cancelClose() {
      session.closeDelayTimeout = clearTimeout(session.closeDelayTimeout);
      session.delayInProgress = false;
    }
    __name(cancelClose, "cancelClose");
    function closeAnyDelayed() {
      if (session.delayInProgress && session.activeHover && !session.activeHover.is(element)) {
        session.activeHover.data(DATA_DISPLAYCONTROLLER).hide(true);
      }
    }
    __name(closeAnyDelayed, "closeAnyDelayed");
    function repositionTooltip() {
      tipController.resetPosition(element);
    }
    __name(repositionTooltip, "repositionTooltip");
    this.show = openTooltip;
    this.hide = closeTooltip;
    this.cancel = cancelTimer;
    this.resetPosition = repositionTooltip;
  }
  __name(DisplayController, "DisplayController");
  function PlacementCalculator() {
    function computePlacementCoords(element, placement, tipWidth, tipHeight, offset) {
      var placementBase = placement.split("-")[0], coords = new CSSCoordinates(), position;
      if (isSvgElement(element)) {
        position = getSvgPlacement(element, placementBase);
      } else {
        position = getHtmlPlacement(element, placementBase);
      }
      switch (placement) {
        case "n":
          coords.set("left", position.left - tipWidth / 2);
          coords.set("bottom", session.windowHeight - position.top + offset);
          break;
        case "e":
          coords.set("left", position.left + offset);
          coords.set("top", position.top - tipHeight / 2);
          break;
        case "s":
          coords.set("left", position.left - tipWidth / 2);
          coords.set("top", position.top + offset);
          break;
        case "w":
          coords.set("top", position.top - tipHeight / 2);
          coords.set("right", session.windowWidth - position.left + offset);
          break;
        case "nw":
          coords.set("bottom", session.windowHeight - position.top + offset);
          coords.set("right", session.windowWidth - position.left - 20);
          break;
        case "nw-alt":
          coords.set("left", position.left);
          coords.set("bottom", session.windowHeight - position.top + offset);
          break;
        case "ne":
          coords.set("left", position.left - 20);
          coords.set("bottom", session.windowHeight - position.top + offset);
          break;
        case "ne-alt":
          coords.set("bottom", session.windowHeight - position.top + offset);
          coords.set("right", session.windowWidth - position.left);
          break;
        case "sw":
          coords.set("top", position.top + offset);
          coords.set("right", session.windowWidth - position.left - 20);
          break;
        case "sw-alt":
          coords.set("left", position.left);
          coords.set("top", position.top + offset);
          break;
        case "se":
          coords.set("left", position.left - 20);
          coords.set("top", position.top + offset);
          break;
        case "se-alt":
          coords.set("top", position.top + offset);
          coords.set("right", session.windowWidth - position.left);
          break;
      }
      return coords;
    }
    __name(computePlacementCoords, "computePlacementCoords");
    function getHtmlPlacement(element, placement) {
      var objectOffset = element.offset(), objectWidth = element.outerWidth(), objectHeight = element.outerHeight(), left, top;
      switch (placement) {
        case "n":
          left = objectOffset.left + objectWidth / 2;
          top = objectOffset.top;
          break;
        case "e":
          left = objectOffset.left + objectWidth;
          top = objectOffset.top + objectHeight / 2;
          break;
        case "s":
          left = objectOffset.left + objectWidth / 2;
          top = objectOffset.top + objectHeight;
          break;
        case "w":
          left = objectOffset.left;
          top = objectOffset.top + objectHeight / 2;
          break;
        case "nw":
          left = objectOffset.left;
          top = objectOffset.top;
          break;
        case "ne":
          left = objectOffset.left + objectWidth;
          top = objectOffset.top;
          break;
        case "sw":
          left = objectOffset.left;
          top = objectOffset.top + objectHeight;
          break;
        case "se":
          left = objectOffset.left + objectWidth;
          top = objectOffset.top + objectHeight;
          break;
      }
      return {
        top,
        left
      };
    }
    __name(getHtmlPlacement, "getHtmlPlacement");
    function getSvgPlacement(element, placement) {
      var svgElement = element.closest("svg")[0], domElement = element[0], point = svgElement.createSVGPoint(), boundingBox = domElement.getBBox(), matrix = domElement.getScreenCTM(), halfWidth = boundingBox.width / 2, halfHeight = boundingBox.height / 2, placements = [], placementKeys = ["nw", "n", "ne", "e", "se", "s", "sw", "w"], coords, rotation, steps, x;
      function pushPlacement() {
        placements.push(point.matrixTransform(matrix));
      }
      __name(pushPlacement, "pushPlacement");
      point.x = boundingBox.x;
      point.y = boundingBox.y;
      pushPlacement();
      point.x += halfWidth;
      pushPlacement();
      point.x += halfWidth;
      pushPlacement();
      point.y += halfHeight;
      pushPlacement();
      point.y += halfHeight;
      pushPlacement();
      point.x -= halfWidth;
      pushPlacement();
      point.x -= halfWidth;
      pushPlacement();
      point.y -= halfHeight;
      pushPlacement();
      if (placements[0].y !== placements[1].y || placements[0].x !== placements[7].x) {
        rotation = Math.atan2(matrix.b, matrix.a) * RAD2DEG;
        steps = Math.ceil((rotation % 360 - 22.5) / 45);
        if (steps < 1) {
          steps += 8;
        }
        while (steps--) {
          placementKeys.push(placementKeys.shift());
        }
      }
      for (x = 0; x < placements.length; x++) {
        if (placementKeys[x] === placement) {
          coords = placements[x];
          break;
        }
      }
      return {
        top: coords.y + session.scrollTop,
        left: coords.x + session.scrollLeft
      };
    }
    __name(getSvgPlacement, "getSvgPlacement");
    this.compute = computePlacementCoords;
  }
  __name(PlacementCalculator, "PlacementCalculator");
  function TooltipController(options) {
    var placementCalculator = new PlacementCalculator(), tipElement = $2("#" + options.popupId);
    if (tipElement.length === 0) {
      tipElement = $2("<div/>", { id: options.popupId });
      if ($body.length === 0) {
        $body = $2("body");
      }
      $body.append(tipElement);
      session.tooltips = session.tooltips ? session.tooltips.add(tipElement) : tipElement;
    }
    if (options.followMouse) {
      if (!tipElement.data(DATA_HASMOUSEMOVE)) {
        $document.on("mousemove" + EVENT_NAMESPACE, positionTipOnCursor);
        $window.on("scroll" + EVENT_NAMESPACE, positionTipOnCursor);
        tipElement.data(DATA_HASMOUSEMOVE, true);
      }
    }
    function beginShowTip(element) {
      element.data(DATA_HASACTIVEHOVER, true);
      tipElement.queue(/* @__PURE__ */ __name(function queueTipInit(next) {
        showTip(element);
        next();
      }, "queueTipInit"));
    }
    __name(beginShowTip, "beginShowTip");
    function showTip(element) {
      var tipContent;
      if (!element.data(DATA_HASACTIVEHOVER)) {
        return;
      }
      if (session.isTipOpen) {
        if (!session.isClosing) {
          hideTip(session.activeHover);
        }
        tipElement.delay(100).queue(/* @__PURE__ */ __name(function queueTipAgain(next) {
          showTip(element);
          next();
        }, "queueTipAgain"));
        return;
      }
      element.trigger("powerTipPreRender");
      tipContent = getTooltipContent(element);
      if (tipContent) {
        tipElement.empty().append(tipContent);
      } else {
        return;
      }
      element.trigger("powerTipRender");
      session.activeHover = element;
      session.isTipOpen = true;
      tipElement.data(DATA_MOUSEONTOTIP, options.mouseOnToPopup);
      tipElement.addClass(options.popupClass);
      if (!options.followMouse || element.data(DATA_FORCEDOPEN)) {
        positionTipOnElement(element);
        session.isFixedTipOpen = true;
      } else {
        positionTipOnCursor();
      }
      if (!element.data(DATA_FORCEDOPEN) && !options.followMouse) {
        $document.on("click" + EVENT_NAMESPACE, /* @__PURE__ */ __name(function documentClick(event) {
          var target = event.target;
          if (target !== element[0]) {
            if (options.mouseOnToPopup) {
              if (target !== tipElement[0] && !$2.contains(tipElement[0], target)) {
                $2.powerTip.hide();
              }
            } else {
              $2.powerTip.hide();
            }
          }
        }, "documentClick"));
      }
      if (options.mouseOnToPopup && !options.manual && $2.inArray("mouseleave", options.closeEvents) > -1) {
        tipElement.on("mouseenter" + EVENT_NAMESPACE, /* @__PURE__ */ __name(function tipMouseEnter() {
          if (session.activeHover) {
            session.activeHover.data(DATA_DISPLAYCONTROLLER).cancel();
          }
        }, "tipMouseEnter"));
        tipElement.on("mouseleave" + EVENT_NAMESPACE, /* @__PURE__ */ __name(function tipMouseLeave() {
          if (session.activeHover) {
            session.activeHover.data(DATA_DISPLAYCONTROLLER).hide();
          }
        }, "tipMouseLeave"));
      }
      tipElement.fadeIn(options.fadeInTime, /* @__PURE__ */ __name(function fadeInCallback() {
        if (!session.desyncTimeout) {
          session.desyncTimeout = setInterval(closeDesyncedTip, 500);
        }
        element.trigger("powerTipOpen");
      }, "fadeInCallback"));
    }
    __name(showTip, "showTip");
    function hideTip(element) {
      session.isClosing = true;
      session.isTipOpen = false;
      session.desyncTimeout = clearInterval(session.desyncTimeout);
      element.data(DATA_HASACTIVEHOVER, false);
      element.data(DATA_FORCEDOPEN, false);
      $document.off("click" + EVENT_NAMESPACE);
      tipElement.off(EVENT_NAMESPACE);
      tipElement.fadeOut(options.fadeOutTime, /* @__PURE__ */ __name(function fadeOutCallback() {
        var coords = new CSSCoordinates();
        session.activeHover = null;
        session.isClosing = false;
        session.isFixedTipOpen = false;
        tipElement.removeClass();
        coords.set("top", session.currentY + options.offset);
        coords.set("left", session.currentX + options.offset);
        tipElement.css(coords);
        element.trigger("powerTipClose");
      }, "fadeOutCallback"));
    }
    __name(hideTip, "hideTip");
    function positionTipOnCursor() {
      var tipWidth, tipHeight, coords, collisions, collisionCount;
      if (!session.isFixedTipOpen && (session.isTipOpen || session.tipOpenImminent && tipElement.data(DATA_HASMOUSEMOVE))) {
        tipWidth = tipElement.outerWidth();
        tipHeight = tipElement.outerHeight();
        coords = new CSSCoordinates();
        coords.set("top", session.currentY + options.offset);
        coords.set("left", session.currentX + options.offset);
        collisions = getViewportCollisions(coords, tipWidth, tipHeight);
        if (collisions !== Collision.none) {
          collisionCount = countFlags(collisions);
          if (collisionCount === 1) {
            if (collisions === Collision.right) {
              coords.set("left", session.scrollLeft + session.windowWidth - tipWidth);
            } else if (collisions === Collision.bottom) {
              coords.set("top", session.scrollTop + session.windowHeight - tipHeight);
            }
          } else {
            coords.set("left", session.currentX - tipWidth - options.offset);
            coords.set("top", session.currentY - tipHeight - options.offset);
          }
        }
        tipElement.css(coords);
      }
    }
    __name(positionTipOnCursor, "positionTipOnCursor");
    function positionTipOnElement(element) {
      var priorityList, finalPlacement;
      if (options.smartPlacement || options.followMouse && element.data(DATA_FORCEDOPEN)) {
        priorityList = $2.fn.powerTip.smartPlacementLists[options.placement];
        $2.each(priorityList, function(idx, pos) {
          var collisions = getViewportCollisions(
            placeTooltip(element, pos),
            tipElement.outerWidth(),
            tipElement.outerHeight()
          );
          finalPlacement = pos;
          return collisions !== Collision.none;
        });
      } else {
        placeTooltip(element, options.placement);
        finalPlacement = options.placement;
      }
      tipElement.removeClass("w nw sw e ne se n s w se-alt sw-alt ne-alt nw-alt");
      tipElement.addClass(finalPlacement);
    }
    __name(positionTipOnElement, "positionTipOnElement");
    function placeTooltip(element, placement) {
      var iterationCount = 0, tipWidth, tipHeight, coords = new CSSCoordinates();
      coords.set("top", 0);
      coords.set("left", 0);
      tipElement.css(coords);
      do {
        tipWidth = tipElement.outerWidth();
        tipHeight = tipElement.outerHeight();
        coords = placementCalculator.compute(element, placement, tipWidth, tipHeight, options.offset);
        tipElement.css(coords);
      } while (
        // sanity check: limit to 5 iterations, and...
        ++iterationCount <= 5 && // try again if the dimensions changed after placement
        (tipWidth !== tipElement.outerWidth() || tipHeight !== tipElement.outerHeight())
      );
      return coords;
    }
    __name(placeTooltip, "placeTooltip");
    function closeDesyncedTip() {
      var isDesynced = false, hasDesyncableCloseEvent = $2.grep(["mouseleave", "mouseout", "blur", "focusout"], function(eventType) {
        return $2.inArray(eventType, options.closeEvents) !== -1;
      }).length > 0;
      if (session.isTipOpen && !session.isClosing && !session.delayInProgress && hasDesyncableCloseEvent) {
        if (session.activeHover.data(DATA_HASACTIVEHOVER) === false || session.activeHover.is(":disabled")) {
          isDesynced = true;
        } else if (!isMouseOver(session.activeHover) && !session.activeHover.is(":focus") && !session.activeHover.data(DATA_FORCEDOPEN)) {
          if (tipElement.data(DATA_MOUSEONTOTIP)) {
            if (!isMouseOver(tipElement)) {
              isDesynced = true;
            }
          } else {
            isDesynced = true;
          }
        }
        if (isDesynced) {
          hideTip(session.activeHover);
        }
      }
    }
    __name(closeDesyncedTip, "closeDesyncedTip");
    this.showTip = beginShowTip;
    this.hideTip = hideTip;
    this.resetPosition = positionTipOnElement;
  }
  __name(TooltipController, "TooltipController");
  function isSvgElement(element) {
    return Boolean(window.SVGElement && element[0] instanceof SVGElement);
  }
  __name(isSvgElement, "isSvgElement");
  function isMouseEvent(event) {
    return Boolean(event && $2.inArray(event.type, MOUSE_EVENTS) > -1 && typeof event.pageX === "number");
  }
  __name(isMouseEvent, "isMouseEvent");
  function initTracking() {
    if (!session.mouseTrackingActive) {
      session.mouseTrackingActive = true;
      getViewportDimensions();
      $2(getViewportDimensions);
      $document.on("mousemove" + EVENT_NAMESPACE, trackMouse);
      $window.on("resize" + EVENT_NAMESPACE, trackResize);
      $window.on("scroll" + EVENT_NAMESPACE, trackScroll);
    }
  }
  __name(initTracking, "initTracking");
  function getViewportDimensions() {
    session.scrollLeft = $window.scrollLeft();
    session.scrollTop = $window.scrollTop();
    session.windowWidth = $window.width();
    session.windowHeight = $window.height();
  }
  __name(getViewportDimensions, "getViewportDimensions");
  function trackResize() {
    session.windowWidth = $window.width();
    session.windowHeight = $window.height();
  }
  __name(trackResize, "trackResize");
  function trackScroll() {
    var x = $window.scrollLeft(), y = $window.scrollTop();
    if (x !== session.scrollLeft) {
      session.currentX += x - session.scrollLeft;
      session.scrollLeft = x;
    }
    if (y !== session.scrollTop) {
      session.currentY += y - session.scrollTop;
      session.scrollTop = y;
    }
  }
  __name(trackScroll, "trackScroll");
  function trackMouse(event) {
    session.currentX = event.pageX;
    session.currentY = event.pageY;
  }
  __name(trackMouse, "trackMouse");
  function isMouseOver(element) {
    var elementPosition = element.offset(), elementBox = element[0].getBoundingClientRect(), elementWidth = elementBox.right - elementBox.left, elementHeight = elementBox.bottom - elementBox.top;
    return session.currentX >= elementPosition.left && session.currentX <= elementPosition.left + elementWidth && session.currentY >= elementPosition.top && session.currentY <= elementPosition.top + elementHeight;
  }
  __name(isMouseOver, "isMouseOver");
  function getTooltipContent(element) {
    var tipText = element.data(DATA_POWERTIP), tipObject = element.data(DATA_POWERTIPJQ), tipTarget = element.data(DATA_POWERTIPTARGET), targetElement, content;
    if (tipText) {
      if ($2.isFunction(tipText)) {
        tipText = tipText.call(element[0]);
      }
      content = tipText;
    } else if (tipObject) {
      if ($2.isFunction(tipObject)) {
        tipObject = tipObject.call(element[0]);
      }
      if (tipObject.length > 0) {
        content = tipObject.clone(true, true);
      }
    } else if (tipTarget) {
      targetElement = $2("#" + tipTarget);
      if (targetElement.length > 0) {
        content = targetElement.html();
      }
    }
    return content;
  }
  __name(getTooltipContent, "getTooltipContent");
  function getViewportCollisions(coords, elementWidth, elementHeight) {
    var viewportTop = session.scrollTop, viewportLeft = session.scrollLeft, viewportBottom = viewportTop + session.windowHeight, viewportRight = viewportLeft + session.windowWidth, collisions = Collision.none;
    if (coords.top < viewportTop || Math.abs(coords.bottom - session.windowHeight) - elementHeight < viewportTop) {
      collisions |= Collision.top;
    }
    if (coords.top + elementHeight > viewportBottom || Math.abs(coords.bottom - session.windowHeight) > viewportBottom) {
      collisions |= Collision.bottom;
    }
    if (coords.left < viewportLeft || coords.right + elementWidth > viewportRight) {
      collisions |= Collision.left;
    }
    if (coords.left + elementWidth > viewportRight || coords.right < viewportLeft) {
      collisions |= Collision.right;
    }
    return collisions;
  }
  __name(getViewportCollisions, "getViewportCollisions");
  function countFlags(value) {
    var count = 0;
    while (value) {
      value &= value - 1;
      count++;
    }
    return count;
  }
  __name(countFlags, "countFlags");
  return $2.powerTip;
});
const CONSTANTS = {
  MODULE_ID: "pin-cushion",
  PATH: `modules/pin-cushion/`,
  MODULE_TITLE: "Pin Cushion",
  PATH_TRANSPARENT: `modules/pin-cushion/assets/transparent.png`,
  PATH_PDF_THUMBNAIL: `modules/pin-cushion/assets/file-pdf-solid.svg`,
  FLAGS: {
    USE_PIN_REVEALED: "usePinIsRevealed",
    PIN_IS_REVEALED: "pinIsRevealed",
    PIN_GM_TEXT: "gmNote",
    HAS_BACKGROUND: "hasBackground",
    RATIO_WIDTH: "ratio",
    TEXT_ALWAYS_VISIBLE: "textAlwaysVisible",
    PLAYER_ICON_STATE: "PlayerIconState",
    PLAYER_ICON_PATH: "PlayerIconPath",
    CUSHION_ICON: "cushionIcon",
    SHOW_IMAGE: "showImage",
    SHOW_IMAGE_EXPLICIT_SOURCE: "showImageExplicitSource",
    HIDE_LABEL: "hideLabel",
    DO_NOT_SHOW_JOURNAL_PREVIEW: "doNotShowJournalPreview",
    TOOLTIP_PLACEMENT: "tooltipPlacement",
    TOOLTIP_COLOR: "tooltipColor",
    TOOLTIP_FORCE_REMOVE: "tooltipForceRemove",
    TOOLTIP_SMART_PLACEMENT: "tooltipSmartPlacement",
    TOOLTIP_FOLLOW_MOUSE: "tooltipFollowMouse",
    PREVIEW_AS_TEXT_SNIPPET: "previewAsTextSnippet",
    ABOVE_FOG: "aboveFog",
    SHOW_ONLY_TO_GM: "showOnlyToGM",
    PIN_IS_TRANSPARENT: "pinIsTransparent",
    JAL_ANCHOR: "anchor",
    NUMBER_WS_SUFFIX_ON_NAMEPLATE: "numberWsSuffixOnNameplate",
    TOOLTIP_CUSTOM_DESCRIPTION: "tooltipCustomDescription",
    TOOLTIP_SHOW_DESCRIPTION: "tooltipShowDescription",
    TOOLTIP_SHOW_TITLE: "tooltipShowTitle"
  }
};
CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;
CONSTANTS.PATH_TRANSPARENT = `modules/${CONSTANTS.MODULE_ID}/assets/transparent.png`;
function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}
__name(isRealNumber, "isRealNumber");
function debug(msg, args = "") {
  console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, args);
  return msg;
}
__name(debug, "debug");
function log(message) {
  message = `${CONSTANTS.MODULE_ID} | ${message}`;
  console.log(message.replace("<br>", "\n"));
  return message;
}
__name(log, "log");
function info(info2, notify = false) {
  info2 = `${CONSTANTS.MODULE_ID} | ${info2}`;
  if (notify)
    ui.notifications?.info(info2);
  console.log(info2.replace("<br>", "\n"));
  return info2;
}
__name(info, "info");
function warn$1(warning, notify = false) {
  warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
  if (notify)
    ui.notifications?.warn(warning);
  console.warn(warning.replace("<br>", "\n"));
  return warning;
}
__name(warn$1, "warn$1");
function error(error2, notify = true) {
  error2 = `${CONSTANTS.MODULE_ID} | ${error2}`;
  if (notify)
    ui.notifications?.error(error2);
  return new Error(error2.replace("<br>", "\n"));
}
__name(error, "error");
const i18n = /* @__PURE__ */ __name((key) => {
  return game.i18n.localize(key)?.trim();
}, "i18n");
function stripQueryStringAndHashFromPath(url) {
  let myUrl = url;
  if (!myUrl) {
    return myUrl;
  }
  if (myUrl.includes("?")) {
    myUrl = myUrl.split("?")[0];
  }
  if (myUrl.includes("#")) {
    myUrl = myUrl.split("#")[0];
  }
  return myUrl;
}
__name(stripQueryStringAndHashFromPath, "stripQueryStringAndHashFromPath");
function isAlt() {
  const alts = /* @__PURE__ */ new Set(["Alt", "AltLeft"]);
  return game.keyboard?.downKeys.size === 1 && game.keyboard.downKeys.intersects(alts);
}
__name(isAlt, "isAlt");
function retrieveFirstImageFromJournalId(id, pageId, noDefault) {
  const journalEntry = game.journal.get(id);
  let firstImage = void 0;
  if (!journalEntry) {
    return firstImage;
  }
  if (journalEntry?.pages.size > 0) {
    const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
    if (pageId) {
      const pageSelected = sortedArray.find((page) => page.id === pageId);
      if (pageSelected) {
        if (pageSelected.type === "image" && pageSelected.src) {
          firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
        } else if (pageSelected.src) {
          firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
        }
      }
    }
    if (!noDefault && !firstImage) {
      for (const pageEntry of sortedArray) {
        if (pageEntry.type === "image" && pageEntry.src) {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        } else if (pageEntry.src && pageEntry.type === "pdf") {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        } else if (pageEntry.src) {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        }
      }
    }
  }
  return firstImage;
}
__name(retrieveFirstImageFromJournalId, "retrieveFirstImageFromJournalId");
function retrieveFirstTextFromJournalId(id, pageId, noDefault) {
  const journalEntry = game.journal.get(id);
  let firstText = void 0;
  if (!journalEntry) {
    return firstText;
  }
  if (journalEntry?.pages.size > 0) {
    const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
    if (pageId) {
      const pageSelected = sortedArray.find((page) => page.id === pageId);
      if (pageSelected) {
        if (pageSelected.type === "text" && pageSelected.text?.content) {
          firstText = pageSelected.text?.content;
        } else if (pageSelected.text?.content) {
          firstText = pageSelected.text?.content;
        }
      }
    }
    if (!noDefault && !firstText) {
      for (const journalEntry2 of sortedArray) {
        if (journalEntry2.type === "text" && journalEntry2.text?.content) {
          firstText = journalEntry2.text?.content;
          break;
        } else if (journalEntry2.text?.content) {
          firstText = journalEntry2.text?.content;
          break;
        }
      }
    }
  }
  return firstText;
}
__name(retrieveFirstTextFromJournalId, "retrieveFirstTextFromJournalId");
const registerSettings = /* @__PURE__ */ __name(function() {
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "resetAllSettings", {
    name: `pin-cushion.SETTINGS.reset.name`,
    hint: `pin-cushion.SETTINGS.reset.hint`,
    icon: "fas fa-coins",
    type: ResetSettingsDialog,
    restricted: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "forceToShowNotes", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.forceToShowNotesN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.forceToShowNotesH`),
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "previewMaxLength", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.PreviewMaxLengthN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.PreviewMaxLengthH`),
    scope: "world",
    type: Number,
    default: 500,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "previewDelay", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.PreviewDelayN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.PreviewDelayH`),
    scope: "world",
    type: Number,
    default: 500,
    config: true,
    onChange: (s) => {
    },
    //@ts-ignore
    range: { min: 100, max: 3e3, step: 100 }
    // bug https://github.com/p4535992/foundryvtt-pin-cushion/issues/18
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultJournalPermission", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.DefaultJournalPermissionN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.DefaultJournalPermissionH`),
    scope: "world",
    type: Number,
    choices: Object.entries(CONST.DOCUMENT_PERMISSION_LEVELS).reduce((acc, [perm, key]) => {
      acc[key] = game.i18n.localize(`pin-cushion.SETTINGS.DefaultJournalPermission.PERMISSION.${perm}`);
      return acc;
    }, {}),
    default: 0,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultJournalFolder", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.DefaultJournalFolderN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.DefaultJournalFolderH`),
    scope: "world",
    type: String,
    choices: {
      none: game.i18n.localize(`pin-cushion.None`),
      perUser: game.i18n.localize(`pin-cushion.PerUser`),
      specificFolder: game.i18n.localize(`pin-cushion.PerSpecificFolder`)
    },
    default: "none",
    config: true,
    onChange: (s) => {
      if (s === "perUser" && game.user === game.users.find((u) => u.isGM && u.active)) {
        PinCushion._createFolders();
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultNoteImageOnCreate", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.defaultNoteImageOnCreateN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.defaultNoteImageOnCreateH`),
    scope: "world",
    type: String,
    default: "",
    config: true,
    filePicker: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "specificFolder", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.SpecificFolderN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.SpecificFolderH`),
    scope: "world",
    type: String,
    choices: () => {
      const folders = game.journal.directory.folders.sort((a, b) => a.name.localeCompare(b.name));
      const arrObj = {};
      arrObj[""] = "Select a journal folder";
      Object.entries(folders).reduce((folder, [k, v]) => {
        folder[v.id] = v.name;
        arrObj[v.id] = v.name;
        return folder;
      }, {});
      return arrObj;
    },
    default: 0,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableBackgroundlessPins", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.EnableBackgroundlessPinsN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.EnableBackgroundlessPinsH`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "showJournalImageByDefault", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.ShowJournalImageByDefaultN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.ShowJournalImageByDefaultH`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableTooltipByDefault", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableTooltipByDefaultN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableTooltipByDefaultH`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableAutoScaleNamePlatesNoteN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableAutoScaleNamePlatesNoteH`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableDragNoteOnTokenLayerIfGM", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableDragNoteOnTokenLayerIfGMN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableDragNoteOnTokenLayerIfGMH`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerIconAutoOverride", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.PlayerIconAutoOverrideN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.PlayerIconAutoOverrideH`),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerIconPathDefault", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.PlayerIconPathDefaultN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.PlayerIconPathDefaultH`),
    scope: "world",
    config: true,
    default: "icons/svg/book.svg",
    type: String,
    filePicker: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "noteGM", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.noteGMN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.noteGMH`),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotes", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesH`),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorLink", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorLinkN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorLinkH`),
    scope: "world",
    type: String,
    default: "#7CFC00",
    config: true,
    onChange: () => {
      if (canvas?.ready) {
        canvas.notes.placeables.forEach((note) => note.draw());
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotLink", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorNotLinkN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorNotLinkH`),
    scope: "world",
    type: String,
    default: "#c000c0",
    config: true,
    onChange: () => {
      if (canvas?.ready) {
        canvas.notes.placeables.forEach((note) => note.draw());
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorRevealed", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorRevealedN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorRevealedH`),
    scope: "world",
    type: String,
    default: "#ffff00",
    config: true,
    onChange: () => refresh()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotRevealed", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorNotRevealedN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.revealedNotesTintColorNotRevealedH`),
    scope: "world",
    type: String,
    default: "#ff0000",
    config: true,
    onChange: () => refresh()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalThumbnailForGMs", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalThumbnailForGMsN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalThumbnailForGMsH`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onchange: () => window.location.reload()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalThumbnailForPlayers", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalThumbnailForPlayersN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalThumbnailForPlayersH`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onchange: () => window.location.reload()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "journalThumbnailPosition", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.journalThumbnailPositionN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.journalThumbnailPositionH`),
    scope: "world",
    config: true,
    default: "right",
    type: String,
    choices: {
      right: "Right",
      left: "Left"
    },
    onChange: () => game.journal.render()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "fontSize", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.fontSizeN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.fontSizeH`),
    scope: "client",
    type: String,
    default: "",
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "maxWidth", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.maxWidthN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.maxWidthH`),
    scope: "client",
    type: Number,
    default: 800,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "tooltipUseMousePositionForCoordinates", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.tooltipUseMousePositionForCoordinatesN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.tooltipUseMousePositionForCoordinatesH`),
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalAnchorLink", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalAnchorLinkN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalAnchorLinkH`),
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages", {
    name: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalDirectoryPagesN`),
    hint: game.i18n.localize(`pin-cushion.SETTINGS.enableJournalDirectoryPagesH`),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
}, "registerSettings");
const _ResetSettingsDialog = class _ResetSettingsDialog extends FormApplication {
  constructor(...args) {
    super(...args);
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
      content: '<p style="margin-bottom:1rem;">' + game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) + "</p>",
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
          callback: async () => {
            const worldSettings = game.settings.storage?.get("world")?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
            for (let setting of worldSettings) {
              console.log(`Reset setting '${setting.key}'`);
              await setting.delete();
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`)
        }
      },
      default: "cancel"
    });
  }
  async _updateObject(event, formData) {
  }
};
__name(_ResetSettingsDialog, "ResetSettingsDialog");
let ResetSettingsDialog = _ResetSettingsDialog;
const _BackgroundlessControlIcon = class _BackgroundlessControlIcon extends ControlIcon {
  /**
   * Override ControlIcon#draw to remove drawing of the background.
   */
  async draw() {
    if (!this.iconSrc) {
      this.texture = PIXI.Texture.EMPTY;
    } else {
      try {
        this.texture = this.texture ?? await loadTexture(this.iconSrc);
      } catch (e) {
        error(e);
        this.texture = PIXI.Texture.EMPTY;
      }
    }
    if (this.destroyed)
      return this;
    this.border.clear().lineStyle(2, this.borderColor, 1).drawRoundedRect(...this.rect, 5).endFill();
    this.border.visible = false;
    this.bg.visible = false;
    try {
      this.icon.texture = this.texture ?? (this.iconSrc ? await loadTexture(this.iconSrc) : "icons/svg/cancel.svg");
      this.icon.width = this.icon.height = this.size;
      this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 16777215;
    } catch (e) {
      warn$1(e.stack);
      this.icon.texture = "icons/svg/cancel.svg";
      this.icon.width = this.icon.height = this.size;
      this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 16777215;
    }
    return this;
  }
};
__name(_BackgroundlessControlIcon, "BackgroundlessControlIcon");
let BackgroundlessControlIcon = _BackgroundlessControlIcon;
const _PinCushionHUD = class _PinCushionHUD extends BasePlaceableHUD {
  constructor(note, options) {
    super(note, options);
    this.data = note;
  }
  /**
   * Retrieve and override default options for this application
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "pin-cushion-hud",
      classes: [...super.defaultOptions.classes, "pin-cushion-hud"],
      // width: 400,
      // height: 200,
      minimizable: false,
      resizable: false,
      template: "modules/pin-cushion/templates/journal-preview.html"
    });
  }
  /**
   * Get data for template
   */
  async getData() {
    const data = super.getData();
    const entry = this.object.entry;
    let entryName = data.text;
    let entryIsOwner = true;
    let entryId = void 0;
    let entryIcon = data.texture?.src;
    let entryContent = data.text;
    if (entry) {
      entryName = entry.name;
      entryId = entry.id;
      entryIsOwner = entry.isOwner ?? true;
      entryIcon = retrieveFirstImageFromJournalId(entryId, this.object.page?.id, false);
      if (!entryIcon && data.icon) {
        entryIcon = data.icon;
      }
      entryContent = retrieveFirstTextFromJournalId(entryId, this.object.page?.id, false);
      if (!entryContent && data.text) {
        entryContent = data.text;
      }
    }
    const showImage = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.SHOW_IMAGE);
    const showImageExplicitSource = getProperty(
      this.object.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE
    );
    const tooltipCustomDescription = getProperty(
      this.object.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION
    );
    let content;
    if (showImage) {
      const imgToShow = showImageExplicitSource ? showImageExplicitSource : entryIcon;
      if (imgToShow && imgToShow.length > 0) {
        content = await TextEditor.enrichHTML(`<img class='image' src='${imgToShow}' alt=''></img>`, {
          secrets: entryIsOwner,
          documents: true,
          async: true
        });
      } else {
        content = await TextEditor.enrichHTML(`<img class='image' src='${CONSTANTS.PATH_TRANSPARENT}' alt=''></img>`, {
          secrets: entryIsOwner,
          documents: true,
          async: true
        });
      }
    } else {
      if (!entry && tooltipCustomDescription) {
        const previewMaxLength = game.settings.get(CONSTANTS.MODULE_ID, "previewMaxLength");
        const textContent = tooltipCustomDescription;
        content = textContent.length > previewMaxLength ? `${textContent.substr(0, previewMaxLength)} ...` : textContent;
      } else {
        const previewTypeAsText = getProperty(
          this.object.document.flags[CONSTANTS.MODULE_ID],
          CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET
        );
        let firstContent = entryContent ?? "";
        if (this.object.document.entryId) {
          firstContent = firstContent.replaceAll(
            "@UUID[.",
            "@UUID[JournalEntry." + this.object.document.entryId + ".JournalEntryPage."
          );
          firstContent = firstContent.replaceAll(`data-uuid=".`, `data-uuid="JournalEntry."`);
        }
        if (!previewTypeAsText) {
          content = await TextEditor.enrichHTML(firstContent, {
            secrets: entryIsOwner,
            documents: true,
            async: true
          });
        } else {
          const previewMaxLength = game.settings.get(CONSTANTS.MODULE_ID, "previewMaxLength");
          const textContent = $(firstContent).text();
          content = textContent.length > previewMaxLength ? `${textContent.substr(0, previewMaxLength)} ...` : textContent;
        }
      }
    }
    if (this.object.document.entryId) {
      content = content.replaceAll(
        "@UUID[.",
        "@UUID[JournalEntry." + this.object.document.entryId + ".JournalEntryPage."
      );
    }
    let titleTooltip = entryName;
    const newtextGM = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.PIN_GM_TEXT);
    if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "noteGM") && newtextGM) {
      titleTooltip = newtextGM;
    } else if (data.text && data.text !== titleTooltip) {
      titleTooltip = data.text;
    }
    let bodyPlaceHolder = `<img class='image' src='${CONSTANTS.PATH_TRANSPARENT}' alt=''></img>`;
    data.tooltipId = this.object.id;
    data.title = titleTooltip;
    data.body = bodyPlaceHolder;
    const fontSize = game.settings.get(CONSTANTS.MODULE_ID, "fontSize") || canvas.grid.size / 5;
    const maxWidth = game.settings.get(CONSTANTS.MODULE_ID, "maxWidth") || 400;
    data.titleTooltip = titleTooltip;
    data.content = content;
    data.fontSize = fontSize;
    data.maxWidth = maxWidth;
    const isTooltipShowTitleS = getProperty(
      this.object.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE
    );
    const isTooltipShowDescriptionS = getProperty(
      this.object.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION
    );
    const isTooltipShowTitle = String(isTooltipShowTitleS) === "true" ? true : false;
    const isTooltipShowDescription = String(isTooltipShowDescriptionS) === "true" ? true : false;
    this.contentTooltip = await TextEditor.enrichHTML(`
          <div id="container" class="pin-cushion-hud-container" style="font-size:${fontSize}px; max-width:${maxWidth}px">
              ${isTooltipShowTitle ? `<div id="header"><h3>${titleTooltip}</h3></div><hr/>` : ``}
              ${isTooltipShowDescription ? `<div id="content">${content} </div>` : ``}
          </div>

      `);
    return data;
  }
  /**
   * Set app position
   */
  setPosition() {
    if (!this.object) {
      return;
    }
    const fontSize = game.settings.get(CONSTANTS.MODULE_ID, "fontSize") || canvas.grid.size / 5;
    const maxWidth = game.settings.get(CONSTANTS.MODULE_ID, "maxWidth");
    const tooltipPlacement = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_PLACEMENT) ?? "e";
    getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT) ?? false;
    getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE) ?? false;
    if (tooltipPlacement.includes("e"))
      ;
    let x = 0;
    let y = 0;
    if (game.settings.get(CONSTANTS.MODULE_ID, "tooltipUseMousePositionForCoordinates")) {
      const positionMouse = canvas.mousePosition;
      x = positionMouse.x;
      y = positionMouse.y;
    } else {
      x = this.object.center ? this.object.center.x : this.object.x;
      y = this.object.center ? this.object.center.y : this.object.y;
    }
    const ratio = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.RATIO_WIDTH) ?? 1;
    const ratio_width = isRealNumber(ratio) ? ratio : 1;
    const width = this.object.controlIcon.width;
    const height = this.object.controlIcon.height;
    let left = x - width / 2;
    if (ratio_width != 1) {
      left = x + ratio_width * (width / 2) - width * ratio_width / 2;
    }
    const top = y - height / 2;
    const position = {
      height: height + "px",
      width: width + "px",
      left: left + "px",
      top: top + "px",
      "font-size": fontSize + "px",
      "max-width": maxWidth + "px"
    };
    this.element.css(position);
  }
  activateListeners(html) {
    super.activateListeners(html);
    let elementToTooltip = this.element;
    if (!elementToTooltip.document) {
      elementToTooltip = $(elementToTooltip);
    }
    game.settings.get(CONSTANTS.MODULE_ID, "fontSize") || canvas.grid.size / 5;
    game.settings.get(CONSTANTS.MODULE_ID, "maxWidth");
    const tooltipPlacement = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_PLACEMENT) ?? "e";
    const tooltipSmartPlacement = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT) ?? false;
    getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE) ?? false;
    const tooltipColor = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.TOOLTIP_COLOR) ?? "";
    if (tooltipPlacement.includes("e"))
      ;
    let x = 0;
    let y = 0;
    if (game.settings.get(CONSTANTS.MODULE_ID, "tooltipUseMousePositionForCoordinates")) {
      const positionMouse = canvas.mousePosition;
      x = positionMouse.x;
      y = positionMouse.y;
    } else {
      x = this.object.center ? this.object.center.x : this.object.x;
      y = this.object.center ? this.object.center.y : this.object.y;
    }
    const ratio = getProperty(this.object.document.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.RATIO_WIDTH) ?? 1;
    const ratio_width = isRealNumber(ratio) ? ratio : 1;
    const width = this.object.controlIcon.width;
    const height = this.object.controlIcon.height;
    let left = x - width / 2;
    if (ratio_width != 1) {
      left = x + ratio_width * (width / 2) - width * ratio_width / 2;
    }
    const top = y - height / 2;
    const position = {
      height: height + "px",
      width: width + "px",
      left: left + "px",
      top: top + "px"
    };
    elementToTooltip.css(position);
    const tooltipPopupClass = tooltipColor ? "pin-cushion-hud-tooltip-" + tooltipColor : "pin-cushion-hud-tooltip-default";
    const tooltipTipContent = $(this.contentTooltip);
    elementToTooltip.data("powertipjq", tooltipTipContent);
    elementToTooltip.powerTip({
      // 	(default: 'powerTip') HTML id attribute for the tooltip div.
      // popupId: popupId, // e.g. default 'powerTip'
      // (default: 'n') Placement location of the tooltip relative to the element it is open for.
      // Values can be n, e, s, w, nw, ne, sw, se, nw-alt, ne-alt, sw-alt,
      // or se-alt (as in north, east, south, and west).
      // This only matters if followMouse is set to false.
      placement: tooltipPlacement,
      // (default: false) When enabled the plugin will try to keep tips inside the browser viewport.
      // If a tooltip would extend outside of the viewport then its placement will be changed to an
      // orientation that would be entirely within the current viewport.
      // Only applies if followMouse is set to false.
      smartPlacement: tooltipSmartPlacement,
      // (default: false) Allow the mouse to hover on the tooltip.
      // This lets users interact with the content in the tooltip.
      // Only applies if followMouse is set to false and manual is set to false.
      mouseOnToPopup: true,
      // (default: false) If set to true the tooltip will follow the user’s mouse cursor.
      // Note that if a tooltip with followMouse enabled is opened by an event without
      // mouse data (like “focus” via keyboard navigation) then it will revert to static
      // placement with smart positioning enabled. So you may wish to set placement as well.
      followMouse: false,
      // (default: '') Space separated custom HTML classes for the tooltip div.
      // Since this plugs directly into jQuery’s addClass() method it will
      // also accept a function that returns a string.
      popupClass: tooltipPopupClass,
      // (default: 10) Pixel offset of the tooltip.
      // This will be the offset from the element the tooltip is open for, or
      // from the mouse cursor if followMouse is true.
      offset: 10,
      // (default: 100) Time in milliseconds to wait after mouse cursor leaves
      // the element before closing the tooltip. This serves two purposes: first,
      // it is the mechanism that lets the mouse cursor reach the tooltip
      // (cross the gap between the element and the tooltip div) for mouseOnToPopup tooltips.
      // And, second, it lets the cursor briefly leave the element and return without causing
      // the whole fade-out, intent test, and fade-in cycle to happen.
      closeDelay: 0,
      // (default: 100) Hover intent polling interval in milliseconds.
      intentPollInterval: 0
    });
    $.powerTip.show(elementToTooltip);
  }
  // clear(){
  //   let mouseOnDiv = this.element; // this.element.parent()[0];
  //   if(!mouseOnDiv.data){
  //     mouseOnDiv = $(mouseOnDiv);
  //   }
  //   $.powerTip.hide(mouseOnDiv);
  // }
};
__name(_PinCushionHUD, "PinCushionHUD");
let PinCushionHUD = _PinCushionHUD;
const _PinCushion = class _PinCushion {
  constructor() {
    this._requests = {};
  }
  /* -------------------------------- Constants ------------------------------- */
  static get DIALOG() {
    const defaultPermission = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalPermission");
    const defaultFolder = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalFolder");
    const specificFolder = game.settings.get(CONSTANTS.MODULE_ID, "specificFolder");
    const specificFolderObj = game.journal.directory.folders.find((f) => f.name === specificFolder || f.id === specificFolder) ?? game.journal.directory.folders[Number(specificFolder)] ?? void 0;
    const specificFolderName = specificFolderObj ? specificFolderObj.name : "";
    const folders = game.journal.directory.folders.sort((a, b) => a.name.localeCompare(b.name)).filter((folder) => folder.displayed).map((folder) => `<option value="${folder.id}">${folder.name}</option>`).join("\n");
    return {
      content: `
            <div class="form-group">
              <label>
                <p class="notes">${i18n("pin-cushion.Name")}</p>
              </label>
              <input name="name" type="text"/>
              <label>
                <p class="notes">${i18n("pin-cushion.DefaultPermission")}</p>
              </label>
              <select id="cushion-permission" style="width: 100%;">
                <option value="0"
                  ${String(defaultPermission) === "0" ? "selected" : ""}>
                  ${i18n("PERMISSION.NONE")}${String(defaultPermission) === "0" ? " <i>(default)</i>" : ""}
                </option>
                <option value="1"
                  ${String(defaultPermission) === "1" ? "selected" : ""}>
                  ${i18n("PERMISSION.LIMITED")}${String(defaultPermission) === "1" ? " <i>(default)</i>" : ""}
                </option>
                <option value="2"
                  ${String(defaultPermission) === "2" ? "selected" : ""}>
                  ${i18n("PERMISSION.OBSERVER")}${String(defaultPermission) === "2" ? " <i>(default)</i>" : ""}
                </option>
                <option value="3"
                  ${String(defaultPermission) === "3" ? "selected" : ""}>
                  ${i18n("PERMISSION.OWNER")}${String(defaultPermission) === "3" ? " <i>(default)</i>" : ""}
                </option>
              </select>
              <label>
                <p class="notes">${i18n("pin-cushion.Folder")}</p>
              </label>
              <select id="cushion-folder" style="width: 100%;">
                <option
                  value="none"
                  ${defaultFolder === "none" ? "selected" : ""}>
                    ${i18n("pin-cushion.None")}
                </option>
                <option value="perUser" ${defaultFolder === "perUser" ? "selected" : ""}>
                  ${i18n("pin-cushion.PerUser")} <i>(${game.user.name})</i>
                </option>
                <option
                  value="specificFolder"
                  ${defaultFolder === "specificFolder" ? "selected" : ""}>
                    ${i18n("pin-cushion.PerSpecificFolder")} <i>(${specificFolderName})</i>
                </option>
                <option disabled>──${i18n("pin-cushion.ExistingFolders")}──</option>
                ${folders}
              </select>
            </div>
            </br>
            `,
      title: "Create a Map Pin"
    };
  }
  static get NOTESLAYER() {
    return "NotesLayer";
  }
  static get FONT_SIZE() {
    return 16;
  }
  static autoScaleNotes(canvas2) {
    const enableAutoScaleNamePlatesNote = game.settings.get(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote");
    if (enableAutoScaleNamePlatesNote) {
      if (canvas2.notes) {
        for (let note of canvas2.notes.placeables) {
          note.tooltip.scale.set(_PinCushion._calculateAutoScale(canvas2.scene.dimensions.size, canvas2.stage.scale.x));
        }
      }
    }
  }
  static _calculateAutoScale(sceneDimensionSize, zoomStage) {
    const gs = sceneDimensionSize / 100;
    const zs = 1 / zoomStage;
    return Math.max(gs * zs, 0.8);
  }
  /**
   * Render a file-picker button linked to an <input> field
   * @param {object} options              Helper options
   * @param {string} [options.type]       The type of FilePicker instance to display
   * @param {string} [options.target]     The field name in the target data
   * @param {string} [options.customClass] The field name in the custom class
   * @return {Handlebars.SafeString|string}
   */
  static filePicker(type, target, customClass = "file-picker") {
    if (!target)
      throw new Error("You must define the name of the target field.");
    if (game.world && !game.user.can("FILES_BROWSE"))
      return "";
    const tooltip = game.i18n.localize("FILES.BrowseTooltip");
    return new Handlebars.SafeString(`
    <button type="button" name="${customClass}" class="${customClass}" data-type="${type}" data-target="${target}" title="${tooltip}" tabindex="-1">
        <i class="fas fa-file-import fa-fw"></i>
    </button>`);
  }
  /* --------------------------------- Methods -------------------------------- */
  /**
   * Creates and renders a dialog for name entry
   * @param {*} data
   * break callbacks out into separate methods
   */
  _createDialog(data) {
    new Dialog({
      title: _PinCushion.DIALOG.title,
      content: _PinCushion.DIALOG.content,
      buttons: {
        save: {
          label: "Save",
          icon: `<i class="fas fa-check"></i>`,
          callback: (html) => {
            return this.createNoteFromCanvas(html, data);
          }
        },
        cancel: {
          label: "Cancel",
          icon: `<i class="fas fa-times"></i>`,
          callback: (e) => {
          }
        }
      },
      default: "save"
    }).render(true);
  }
  /**
   * Creates a Note from the Pin Cushion dialog
   * @param {*} html
   * @param {*} data
   */
  async createNoteFromCanvas(html, eventData) {
    const input = html.find("input[name='name']");
    if (!input[0].value) {
      ui.notifications.warn(i18n("pin-cushion.MissingPinName"));
      return;
    }
    const permission = {
      [game.userId]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER,
      default: parseInt($("#cushion-permission").val()) ?? 0
    };
    const defaultJournalPermission = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalPermission");
    if (isRealNumber(defaultJournalPermission) && (!isRealNumber(permission.default) || permission.default === 0) && defaultJournalPermission >= 0) {
      permission.default = defaultJournalPermission;
    }
    let folder;
    const selectedFolder = $("#cushion-folder").val();
    if (selectedFolder === "none") {
      folder = void 0;
    } else if (selectedFolder === "perUser") {
      folder = _PinCushion.getFolder(game.user.name, selectedFolder);
      if (!game.user.isGM && folder === void 0)
        ;
    } else if (selectedFolder === "specificFolder") {
      const settingSpecificFolder = game.settings.get(CONSTANTS.MODULE_ID, "specificFolder");
      folder = _PinCushion.getFolder(game.user.name, selectedFolder, settingSpecificFolder);
    } else {
      folder = selectedFolder;
    }
    const entry = await JournalEntry.create({
      name: `${input[0].value}`,
      ownership: permission,
      ...folder && { folder }
    });
    if (!entry) {
      return;
    }
    const entryData = entry.toJSON();
    entryData.id = entry.id;
    entryData.uuid = "JournalEntry." + entry.id;
    entryData.type = "JournalEntry";
    if (canvas.activeLayer.name !== _PinCushion.NOTESLAYER) {
      await canvas.notes.activate();
    }
    await canvas.activeLayer._onDropData(eventData, entryData);
  }
  /**
   * Gets the JournalEntry Folder ID to be used for JournalEntry creations, if any.
   *
   * @static
   * @param {string} name - The player name to check folders against, defaults to current user's name
   * @param {string} setting - The module setting set for journal default
   * @param {string} folderName - The explicit name of the folder
   * @returns {string|undefined} The folder's ID, or undefined if there is no target folder
   */
  static getFolder(name, setting, folderName) {
    name = name ?? game.user.name;
    switch (setting) {
      case "none":
        return void 0;
      case "perUser":
        return game.journal.directory.folders.find((f) => f.name === name)?.id ?? void 0;
      case "specificFolder":
        return game.journal.directory.folders.find((f) => f.name === folderName || f.id === folderName)?.id ?? game.journal.directory.folders[Number(folderName)]?.id ?? void 0;
      default:
        return name;
    }
  }
  /**
   * Checks for missing Journal Entry folders and creates them
   *
   * @static
   * @private
   * @returns {void}
   */
  static async _createFolders() {
    const setting = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalFolder");
    const missingFolders = game.users.filter((u) => !u.isGM && _PinCushion.getFolder(u.name, setting) === void 0).map((user) => ({
      name: user.name,
      type: "JournalEntry",
      parent: null,
      sorting: "a"
    }));
    if (missingFolders.length) {
      const createFolders = await new Promise((resolve, reject) => {
        new Dialog({
          title: i18n("pin-cushion.CreateMissingFoldersT"),
          content: i18n("pin-cushion.CreateMissingFoldersC"),
          buttons: {
            yes: {
              label: `<i class="fas fa-check"></i> ${i18n("Yes")}`,
              callback: () => resolve(true)
            },
            no: {
              label: `<i class="fas fa-times"></i> ${i18n("No")}`,
              callback: () => reject()
            }
          },
          default: "yes",
          close: () => reject()
        }).render(true);
      }).catch((_) => {
      });
      if (createFolders)
        await Folder.create(missingFolders);
    }
  }
  /**
   * Replaces icon selector in Notes Config form with filepicker
   * @param {*} app
   * @param {*} html
   * @param {*} noteData
   */
  static _replaceIconSelector(app, html, noteData, explicitImageValue) {
    const currentIconSelector = stripQueryStringAndHashFromPath(explicitImageValue);
    const hasPermissionsToUploadFile = game.user.can("FILES_BROWSE");
    if (hasPermissionsToUploadFile) {
      const iconCustomSelector = html.find("input[name='icon.custom']");
      if (iconCustomSelector?.length > 0) {
        iconCustomSelector.val(currentIconSelector);
        iconCustomSelector.on("change", function() {
          const p = iconCustomSelector.parent().find(".pin-cushion-journal-icon");
          const valueIconSelector = html.find("select[name='icon.selected']")?.val();
          if (valueIconSelector) {
            p[0].src = valueIconSelector;
          } else {
            p[0].src = this.value;
          }
        });
        const iconSelector = html.find("select[name='icon.selected']");
        if (iconSelector?.val() === "icons/svg/book.svg" && currentIconSelector) {
          iconSelector?.val("").change();
        }
        if (iconSelector?.length > 0) {
          iconSelector.on("change", function() {
            const p = iconCustomSelector.parent().find(".pin-cushion-journal-icon");
            const valueIconSelector2 = html.find("select[name='icon.selected']")?.val();
            if (valueIconSelector2) {
              p[0].src = valueIconSelector2;
            } else {
              p[0].src = currentIconSelector;
            }
          });
          const valueIconSelector = html.find("select[name='icon.selected']")?.val();
          if (valueIconSelector) {
            iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${valueIconSelector}" />`);
          } else {
            iconCustomSelector.prop("disabled", false);
            iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${currentIconSelector}" />`);
          }
        } else {
          iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${currentIconSelector}" />`);
        }
      }
      const currentpageSelector = "";
      const pageCustomSelector = html.find("select[name='pageId']");
      const valuejournalSelector = html.find("select[name='entryId']")?.val();
      if (pageCustomSelector && valuejournalSelector) {
        const pageSelector = html.find("select[name='pageId']");
        if (pageSelector?.length > 0) {
          pageSelector.on("change", function() {
            const p = pageCustomSelector.parent().find(".pin-cushion-page-icon");
            const valuepageSelector2 = html.find("select[name='pageId']")?.val();
            if (valuepageSelector2) {
              const pageiimage2 = retrieveFirstImageFromJournalId(valuejournalSelector, valuepageSelector2, true);
              if (pageiimage2) {
                p[0].src = pageiimage2;
              } else {
                p[0].src = currentpageSelector;
              }
            } else {
              p[0].src = currentpageSelector;
            }
          });
          const valuepageSelector = html.find("select[name='pageId']")?.val();
          const pageiimage = retrieveFirstImageFromJournalId(valuejournalSelector, valuepageSelector, true);
          if (pageiimage) {
            pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${pageiimage}" />`);
          } else {
            pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${currentpageSelector}" />`);
          }
        } else {
          pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${currentpageSelector}" />`);
        }
      }
    }
  }
  static _addNoteGM(app, html, noteData) {
    let gmNoteFlagRef = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_GM_TEXT}`;
    let gmtext = noteData.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
    if (!gmtext)
      gmtext = "";
    let gm_text_h = $(
      `<div class="form-group">
        <label for="${gmNoteFlagRef}">${i18n("pin-cushion.GMLabel")}</label>
        <div class="form-fields">
          <textarea
            name="${gmNoteFlagRef}">${gmtext.trim() ?? ""}</textarea>
        </div>
      </div>`
    );
    let initial_text = noteData.document.text ?? noteData.entry?.name;
    if (!initial_text)
      initial_text = "";
    let initial_text_h = $(
      `<div class="form-group">
        <label for="text">${i18n("pin-cushion.PlayerLabel")}</label>
        <div class="form-fields">
          <textarea name="text"
            placeholder="${noteData.entry?.name ?? ""}">${initial_text.trim() ?? ""}</textarea>
        </div>
      </div>`
    );
    html.find("input[name='text']").parent().parent().after(initial_text_h);
    html.find("input[name='text']").parent().parent().remove();
    html.find("textarea[name='text']").parent().parent().before(gm_text_h);
  }
  /**
   * If the Note has a GM-NOTE on it, then display that as the tooltip instead of the normal text
   * @param {function} [wrapped] The wrapped function provided by libWrapper
   * @param {object}   [args]    The normal arguments to Note#drawTooltip
   * @returns {PIXI.Text}
   */
  static _addDrawTooltipWithNoteGM(wrapped, ...args) {
    const hideLabel = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
    const numberWsSuffixOnNameplate = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
    const ratio_width = isRealNumber(this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : 1;
    if (game.user.isGM) {
      const newtextGM = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
      if (newtextGM && newtextGM.length > 0) {
        let result2 = wrapped(...args);
        if (hideLabel) {
          result2.text = "";
        } else {
          if (numberWsSuffixOnNameplate > 0) {
            result2.text = newtextGM + " ".repeat(numberWsSuffixOnNameplate);
          } else if (numberWsSuffixOnNameplate < 0) {
            result2.text = " ".repeat(numberWsSuffixOnNameplate * -1) + newtextGM;
          } else {
            result2.text = newtextGM;
          }
        }
        if (ratio_width != 1) {
          let x = result2.x;
          let left = x + ratio_width * (this.size / 2) - 16;
          result2.x = left;
        }
        return result2;
      }
    }
    let result = wrapped(...args);
    if (hideLabel) {
      result.text = "";
    } else {
      if (numberWsSuffixOnNameplate > 0) {
        result.text = result.text + " ".repeat(numberWsSuffixOnNameplate);
      } else if (numberWsSuffixOnNameplate < 0) {
        result.text = " ".repeat(numberWsSuffixOnNameplate * -1) + result.text;
      }
    }
    if (ratio_width != 1) {
      let x = result.x;
      let left = x + ratio_width * (this.size / 2) - 16;
      result.x = left;
    }
    return result;
  }
  /**
   * Draw the map note Tooltip as a Text object
   * @returns {PIXI.Text}
   */
  static _addDrawTooltip2(wrapped, ...args) {
    const hideLabel = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
    const numberWsSuffixOnNameplate = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
    const ratio_width = isRealNumber(this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : 1;
    let result = wrapped(...args);
    if (hideLabel) {
      result.text = "";
    } else {
      if (numberWsSuffixOnNameplate > 0) {
        result.text = result.text + " ".repeat(numberWsSuffixOnNameplate);
      } else if (numberWsSuffixOnNameplate < 0) {
        result.text = " ".repeat(numberWsSuffixOnNameplate * -1) + result.text;
      }
    }
    if (ratio_width != 1) {
      let x = result.x;
      let left = x + ratio_width * (this.size / 2) - 16;
      result.x = left;
    }
    return result;
  }
  /**
   * Wraps the default Note#isVisible to allow the visibility of scene Notes to be controlled by the reveal
   * state stored in the Note (overriding the default visibility which is based on link accessibility).
   * @param {function} [wrapped] The wrapper function provided by libWrapper
   * @param {Object}   [args]    The arguments for Note#refresh
   * @return [Note]    This Note
   */
  static _isVisible(wrapped, ...args) {
    wrapped(...args);
    const showOnlyToGM = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_ONLY_TO_GM) ?? false;
    if (String(showOnlyToGM) === "true") {
      if (!game.user.isGM) {
        return false;
      }
    }
    if (!this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED)) {
      return wrapped(...args);
    }
    const access = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_REVEALED);
    if (access === false || !canvas.effects.visibility.tokenVision || this.document.global) {
      return access;
    }
    const point = { x: this.document.x, y: this.document.y };
    const tolerance = this.document.iconSize / 4;
    return canvas.effects.visibility.testVisibility(point, { tolerance, object: this });
  }
  /**
   * Ensure player notes are updated immediately
   * @param {*} wrapped
   * @param  {...any} args
   * @returns
   */
  static _noteUpdate(wrapped, ...args) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    const [data, options, userId] = args;
    if (revealedNotes) {
      let result = wrapped(data, options, userId);
      if (this.renderFlags && /*getProperty(data, NOTE_FLAG)*/
      data?.flags && data?.flags[CONSTANTS.MODULE_ID]) {
        this.renderFlags.set({ redraw: true });
      }
      return result;
    } else {
      if (this.renderFlags && /*getProperty(data, NOTE_FLAG)*/
      data?.flags && data?.flags[CONSTANTS.MODULE_ID]) {
        this.renderFlags.set({ redraw: true });
      }
      return wrapped(...args);
    }
  }
  static _applyRenderFlags(wrapped, ...args) {
    let result = wrapped(...args);
    const hideLabel = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) ?? false;
    this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) ?? 0;
    if (hideLabel) {
      this.tooltip.visible = false;
    } else {
      let textAlwaysVisible = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) ?? false;
      if (textAlwaysVisible === true) {
        this.tooltip.visible = true;
      }
    }
    return result;
  }
  /**
   * Wraps the default Note#refresh to allow the visibility of scene Notes to be controlled by the reveal
   * state stored in the Note (overriding the default visibility which is based on link accessibility).
   * @param {function} [wrapped] The wrapper function provided by libWrapper
   * @param {Object}   [args]    The arguments for Note#refresh
   * @return [Note]    This Note
   */
  static _noteRefresh(wrapped, ...args) {
    let result = wrapped(...args);
    let textAlwaysVisible = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) ?? false;
    if (textAlwaysVisible === true) {
      this.tooltip.visible = true;
    }
    let text = this.children[1];
    let ratio = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH);
    if (ratio && text?.x) {
      text.x = this.size * (ratio - 1) / 2;
    }
    if (!isAlt() && this.hover) {
      const fromIndex = canvas.notes.placeables.findIndex((note) => note.id === this.id) || 0;
      canvas.notes.placeables.push(canvas.notes.placeables.splice(fromIndex, 1)[0]);
    }
    return result;
  }
  /* -------------------------------- Listeners ------------------------------- */
  /**
   * Handles doubleclicks
   * @param {*} event
   */
  static _onDoubleClick(event) {
    if (canvas.activeLayer._hover) {
      return;
    }
    if (!game.user.can("NOTE_CREATE"))
      return;
    if (!game.user.can("JOURNAL_CREATE")) {
      ui.notifications.warn(
        game.i18n.format("PinCushion.AllowPlayerNotes", {
          permission: i18n("PERMISSION.JournalCreate")
        })
      );
      return;
    }
    const data = {
      clientX: event.data.global.x,
      clientY: event.data.global.y
    };
    API$1.pinCushion._createDialog(data);
  }
  //   static async _onSingleClick(event) {
  //     log(
  //       `Note_onClickLeft: ${event.data.origin.x} ${event.data.origin.y} == ${event.data.global.x} ${event.data.global.y}`
  //     );
  //     // Create a new Note at the cursor position and open the Note configuration window for it.
  //     const noteData = { x: event.data.origin.x, y: event.data.origin.y };
  //     this._createPreview(noteData, { top: event.data.global.y - 20, left: event.data.global.x + 40 });
  //   }
  static _drawControlIconInternal(noteInternal) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    if (revealedNotes) {
      if (game.user.isGM) {
        const is_revealed = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_REVEALED);
        if (is_revealed != void 0) {
          const colour = game.settings.get(
            CONSTANTS.MODULE_ID,
            is_revealed ? "revealedNotesTintColorRevealed" : "revealedNotesTintColorNotRevealed"
          );
          if (colour?.length > 0) {
            const saved = noteInternal.document.texture.tint;
            noteInternal.document.texture.tint = colour;
            noteInternal.document.texture.tint = saved;
          }
        }
      } else {
        const use_reveal = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED);
        if (use_reveal === void 0 || !use_reveal)
          ;
        else {
          const value = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED);
          if (value !== void 0) {
            const is_linked = noteInternal.entry?.testUserPermission(
              game.user,
              CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED
            );
            const colour = game.settings.get(
              CONSTANTS.MODULE_ID,
              is_linked ? "revealedNotesTintColorLink" : "revealedNotesTintColorNotLink"
            );
            if (colour?.length > 0) {
              const saved = noteInternal.document.texture.tint;
              noteInternal.document.texture.tint = colour;
              noteInternal.document.texture.tint = saved;
            }
          }
        }
      }
    }
    let tint = noteInternal.document.texture.tint ? Color.from(noteInternal.document.texture.tint) : null;
    let currentIcon = noteInternal.document.texture.src;
    const pinIsTransparent = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_TRANSPARENT);
    if (String(pinIsTransparent) === "true") {
      currentIcon = CONSTANTS.PATH_TRANSPARENT;
    }
    let iconData = {
      texture: stripQueryStringAndHashFromPath(currentIcon),
      size: noteInternal.size,
      tint
    };
    let icon;
    if (noteInternal.document && noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND)) {
      icon = new ControlIcon(iconData);
      icon.x -= noteInternal.size / 2;
      icon.y -= noteInternal.size / 2;
    } else {
      const enableBackgroundlessPins = game.settings.get(CONSTANTS.MODULE_ID, "enableBackgroundlessPins");
      if (enableBackgroundlessPins) {
        icon = new BackgroundlessControlIcon(iconData);
        icon.x -= noteInternal.size / 2;
        icon.y -= noteInternal.size / 2;
      } else {
        icon = new ControlIcon(iconData);
        icon.x -= noteInternal.size / 2;
        icon.y -= noteInternal.size / 2;
      }
    }
    const ratio_width = isRealNumber(noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ? noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : 1;
    if (ratio_width != 1) {
      if (noteInternal.document) {
        icon.width = icon.width * ratio_width;
      }
    }
    if (noteInternal.document?.flags?.autoIconFlags) {
      const flagsAutomaticJournalIconNumbers = {
        autoIcon: noteInternal.document?.flags.autoIconFlags.autoIcon,
        iconType: noteInternal.document?.flags.autoIconFlags.iconType,
        iconText: noteInternal.document?.flags.autoIconFlags.iconText,
        foreColor: noteInternal.document?.flags.autoIconFlags.foreColor,
        backColor: noteInternal.document?.flags.autoIconFlags.backColor,
        fontFamily: noteInternal.document?.flags.autoIconFlags.fontFamily
      };
      if (flagsAutomaticJournalIconNumbers.fontFamily) {
        noteInternal.document.fontFamily = flagsAutomaticJournalIconNumbers.fontFamily;
      }
    }
    return icon;
  }
  /**
   * Handles draw control icon
   * @param {*} event
   */
  static _drawControlIcon(...args) {
    const res = _PinCushion._drawControlIconInternal(this);
    if (res === void 0)
      ;
    else {
      return res;
    }
  }
  /**
   * Defines the icon to be drawn for players if enabled.
   */
  static _onPrepareNoteData(wrapped) {
    wrapped();
    if (!game.user.isGM) {
      if (this?.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PLAYER_ICON_STATE)) {
        this.texture.src = stripQueryStringAndHashFromPath(
          this.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PLAYER_ICON_PATH)
        );
      }
    }
  }
  static _renderJournalThumbnail(app, html) {
    game.journal.render();
  }
  static _addJournalThumbnail(app, html, data) {
    if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "enableJournalThumbnailForGMs") || !game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "enableJournalThumbnailForPlayers")) {
      app.documents.forEach((j) => {
        const htmlEntry = html.find(`.directory-item.document[data-document-id="${j.id}"]`);
        if (htmlEntry.length !== 1) {
          return;
        }
        const journalEntryImage = retrieveFirstImageFromJournalId(j.id, void 0, false);
        if (!journalEntryImage) {
          return;
        }
        let thumbnail = null;
        if (journalEntryImage.endsWith(".pdf")) {
          thumbnail = $(
            `<img class="pin-cushion-thumbnail sidebar-image journal-entry-image" src="${CONSTANTS.PATH_PDF_THUMBNAIL}" title="${j.name}" alt='Journal Entry Thumbnail'>`
          );
        } else {
          thumbnail = $(
            `<img class="pin-cushion-thumbnail sidebar-image journal-entry-image" src="${journalEntryImage}" title="${j.name}" alt='Journal Entry Thumbnail'>`
          );
        }
        switch (game.settings.get(CONSTANTS.MODULE_ID, "journalThumbnailPosition")) {
          case "right": {
            htmlEntry.append(thumbnail);
            break;
          }
          case "left": {
            htmlEntry.prepend(thumbnail);
            break;
          }
          default: {
            warn(`Must set 'right' or 'left' for sidebar thumbnail image`);
          }
        }
      });
    }
  }
  static _deleteJournalDirectoryPagesEntry() {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      ui.sidebar.tabs.journal.render(true);
      for (let window2 of [...Object.values(ui.windows)].filter((w) => w.title == "Journal Directory")) {
        window2.render(true);
      }
    }
  }
  static _createJournalDirectoryPagesEntry() {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      ui.sidebar.tabs.journal.render(true);
      for (let window2 of [...Object.values(ui.windows)].filter((w) => w.title == "Journal Directory")) {
        window2.render(true);
      }
    }
  }
  static _addJournalDirectoryPages(app, html, options) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      for (let j of app.documents) {
        if (!j.pages.size)
          continue;
        let $li = html.find(`li[data-document-id="${j.id}"]`);
        $li.css({ flex: "unset", display: "block" });
        let $button = $(
          `<a class="toggle" style="width:50px; float: right; text-align: right; padding-right: .5em;"><i class="fa-solid fa-caret-down"></i></a>`
        ).click(function(e) {
          e.stopPropagation();
          $(this).parent().parent().find("ol").toggle();
          $(this).parent().parent().find("ol").is(":hidden") ? $(this).html('<i class="fa-solid fa-caret-down"></i>') : $(this).html('<i class="fa-solid fa-caret-up"></i>');
        });
        $li.find("h4").append($button).css({ "flex-basis": "100%", overflow: "ellipsis" });
        let $ol = $(`<ol class="journal-pages" style="width:100%; margin-left: 1em;" start="0"></ol>`);
        $ol.hide();
        for (let p of j.pages.contents.sort((a, b) => {
          return a.sort - b.sort;
        }))
          $ol.append($(`<li class="journal-page" data-page-uuid="${p.uuid}"><a>${p.name}</a></li>`));
        $li.append($ol);
      }
      $(html).find("li.journal-page > a").click(function(e) {
        e.stopPropagation();
        let page = fromUuidSync($(this).parent().data().pageUuid);
        if (!page)
          return;
        page.parent.sheet.render(true, { pageId: page.id, focus: true });
      }).contextmenu(function(e) {
        e.stopPropagation();
        e.preventDefault();
        let page = fromUuidSync($(this).parent().data().pageUuid);
        if (!page)
          return;
        page.sheet.render(true);
      });
    }
  }
  /**
   * Sets whether this Note is revealed (visible) to players; overriding the default FoundryVTT rules.
   * The iconTint/texture.tint will also be set on the Note based on whether there is a link that the player can access.
   * If this function is never called then the default FoundryVTT visibility rules will apply
   * @param [NoteData] [notedata] The NoteData whose visibility is to be set (can be used before the Note has been created)
   * @param {Boolean}  [visible]  pass in true if the Note should be revealed to players
   */
  static setNoteRevealed(notedata, visible) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    if (revealedNotes) {
      visible = getProperty(notedata, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`);
      if (visible) {
        const FLAG_IS_REVEALED = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`;
        const FLAG_USE_REVEALED = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.USE_PIN_REVEALED}`;
        setProperty(notedata, FLAG_USE_REVEALED, true);
        setProperty(notedata, FLAG_IS_REVEALED, visible);
      }
    }
  }
  static renderHeadsUpDisplayV1(hud, html, data) {
    canvas.hud.PinCushion = new PinCushionHUD();
    const hudTemp = document.createElement("template");
    hudTemp.id = "pin-cushion-hud";
    html.append(hudTemp);
  }
  /**
   * Note.prototype._onClickLeft and Note.prototype._onClickRight seem to work only on the NoteLayer
   * @href https://github.com/foundryvtt/foundryvtt/issues/8770
   * @param {*} wrapped
   * @param  {...any} args
   * @returns
   */
  static _canControl(wrapped, ...args) {
    if (canvas.activeLayer instanceof TokenLayer) {
      info(`Applied can control override`);
      if (this.isPreview) {
        return false;
      }
      const enableDragNoteOnTokenLayerIfGM = game.settings.get(CONSTANTS.MODULE_ID, "enableDragNoteOnTokenLayerIfGM");
      if (enableDragNoteOnTokenLayerIfGM && game.user.isGM) {
        return true;
      }
    }
    let result = wrapped(...args);
    return result;
  }
};
__name(_PinCushion, "PinCushion");
let PinCushion = _PinCushion;
const API = {
  pinCushion: new PinCushion(),
  // pinCushionContainers: {},
  /**
   * Request an action to be executed with GM privileges.
   *
   * @static
   * @param {object} message - The object that will get emitted via socket
   * @param {string} message.action - The specific action to execute
   * @returns {Promise} The promise of the action which will be resolved after execution by the GM
   */
  async requestEventArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("requestEventArr | inAttributes must be of type array");
    }
    const [message] = inAttributes;
    if (!Object.keys(message)?.includes("action")) {
      warn$1(`Message doesn't contain the 'action'`);
      return;
    }
    const id = `${game.user.id}_${Date.now()}_${randomID()}`;
    message.id = id;
    let baseFolder = game.journal.directory.folders.find(
      (f) => f.name?.toLowerCase() === game.user.name?.toLowerCase()
    );
    if (!baseFolder) {
      baseFolder = await Folder.create({
        id: message.id,
        name: game.user.name,
        type: "Journal",
        parent: null
      });
    }
    return baseFolder;
  },
  async setNoteRevealedArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("requestEventArr | inAttributes must be of type array");
    }
    const [notedata, visible] = inAttributes;
    this.setNoteRevealed(notedata, visible);
  },
  async setNoteRevealed(notedata, visible) {
    PinCushion.setNoteRevealed(notedata, visible);
  }
};
const API$1 = API;
let pinCushionSocket;
function registerSocket() {
  debug("Registered pinCushionSocket");
  if (pinCushionSocket) {
    return pinCushionSocket;
  }
  pinCushionSocket = socketlib.registerModule(CONSTANTS.MODULE_ID);
  pinCushionSocket.register("requestEvent", (...args) => API$1.requestEventArr(...args));
  pinCushionSocket.register("setNoteRevealed", (...args) => API$1.setNoteRevealedArr(...args));
  setSocket(pinCushionSocket);
  return pinCushionSocket;
}
__name(registerSocket, "registerSocket");
function setApi(api) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.api = api;
}
__name(setApi, "setApi");
function getApi() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.api;
}
__name(getApi, "getApi");
function setSocket(socket) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.socket = socket;
}
__name(setSocket, "setSocket");
function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.socket;
}
__name(getSocket, "getSocket");
Hooks.once("init", function() {
  log(" init " + CONSTANTS.MODULE_ID);
  globalThis.PinCushion = PinCushion;
  registerSettings();
  Hooks.once("socketlib.ready", registerSocket);
  libWrapper.register(CONSTANTS.MODULE_ID, "NotesLayer.prototype._onClickLeft2", PinCushion._onDoubleClick, "OVERRIDE");
  const enablePlayerIconAutoOverride = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride");
  if (enablePlayerIconAutoOverride) {
    libWrapper.register(
      CONSTANTS.MODULE_ID,
      "NoteDocument.prototype.prepareData",
      PinCushion._onPrepareNoteData,
      "WRAPPER"
    );
  }
});
Hooks.once("setup", function() {
  setApi(API$1);
  const forceToShowNotes = game.settings.get(CONSTANTS.MODULE_ID, "forceToShowNotes");
  if (forceToShowNotes) {
    game.settings.set("core", "notesDisplayToggle", true);
  }
  const enableAutoScaleNamePlatesNote = game.settings.get(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote");
  if (enableAutoScaleNamePlatesNote) {
    Hooks.once("canvasReady", () => {
      Hooks.on("canvasPan", (c) => {
        if (game.scenes.get(c.scene.id).isView) {
          PinCushion.autoScaleNotes(c);
        }
      });
    });
  }
});
Hooks.once("ready", function() {
  if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("lib-wrapper"))
      word = "activate";
    throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
  }
  if (!game.modules.get("socketlib")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("socketlib"))
      word = "activate";
    throw error(`Requires the 'socketlib' module. Please ${word} it.`);
  }
});
Hooks.on("renderNoteConfig", async (app, html, noteData) => {
  if (!app.object.flags[CONSTANTS.MODULE_ID]) {
    app.object.flags[CONSTANTS.MODULE_ID] = {};
  }
  app.object.flags[CONSTANTS.MODULE_ID] || {};
  const showJournalImageByDefault = game.settings.get(CONSTANTS.MODULE_ID, "showJournalImageByDefault");
  if (showJournalImageByDefault && noteData.document.entryId && !app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.CUSHION_ICON)) {
    const journal = game.journal.get(noteData.document.entryId);
    if (journal) {
      const journalEntryImage = retrieveFirstImageFromJournalId(journal.id, app.object?.pageId, false);
      if (journalEntryImage) {
        setProperty(noteData.document.texture, "src", stripQueryStringAndHashFromPath(journalEntryImage));
      }
    } else {
      warn$1(`The journal with id '${noteData.document.entryId}' do not exists anymore`);
    }
  }
  const defaultNoteImageOnCreate = game.settings.get(CONSTANTS.MODULE_ID, "defaultNoteImageOnCreate");
  let tmp = void 0;
  if (noteData.icon.custom) {
    tmp = stripQueryStringAndHashFromPath(noteData.icon.custom);
  } else if (app.object.texture.src) {
    tmp = stripQueryStringAndHashFromPath(app.object.texture.src);
  } else if (noteData.document.texture.src) {
    tmp = stripQueryStringAndHashFromPath(noteData.document.texture.src);
  }
  if (tmp === "icons/svg/book.svg" && noteData.icon.custom) {
    tmp = stripQueryStringAndHashFromPath(noteData.icon.custom);
  }
  if (tmp === "icons/svg/book.svg" && defaultNoteImageOnCreate) {
    tmp = stripQueryStringAndHashFromPath(defaultNoteImageOnCreate);
  }
  if (tmp === "icons/svg/book.svg" && noteData.document.texture.src) {
    tmp = stripQueryStringAndHashFromPath(noteData.document.texture.src);
  }
  const pinCushionIcon = getProperty(app.object.flags, `${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.CUSHION_ICON}`);
  if (pinCushionIcon) {
    tmp = stripQueryStringAndHashFromPath(pinCushionIcon);
  }
  PinCushion._replaceIconSelector(app, html, noteData, tmp);
  setProperty(app.object.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.CUSHION_ICON, tmp);
  const enableNoteGM = game.settings.get(CONSTANTS.MODULE_ID, "noteGM");
  if (enableNoteGM) {
    PinCushion._addNoteGM(app, html, noteData);
  }
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    let getOptions = function(page, current) {
      let options = "<option></option>";
      for (const key in page?.toc) {
        const section = page.toc[key];
        options += `<option value="${section.slug}"${section.slug === current ? " selected" : ""}>${section.text}</option>`;
      }
      return options;
    }, _updateSectionList = function() {
      const newjournalid = app.form.elements.entryId?.value;
      const newpageid = app.form.elements.pageId?.value;
      const journal = game.journal.get(newjournalid);
      const newpage = journal?.pages.get(newpageid);
      log(`selected page changed to ${newpageid}`);
      log("new options =" + getOptions(newpage, anchorData?.slug));
      app.form.elements[`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}.slug`].innerHTML = getOptions(
        newpage,
        anchorData?.slug
      );
      log(
        "new innerHtml" + app.form.elements[`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}.slug`].innerHTML
      );
    };
    __name(getOptions, "getOptions");
    __name(_updateSectionList, "_updateSectionList");
    let anchorData = getProperty(noteData.document.flags, `${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}`);
    let pageData = noteData.document.page;
    let select = $(`
		<div class='form-group'>
			<label>${i18n(`${CONSTANTS.MODULE_ID}.PageSection`)}</label>
			<div class='form-fields'>
				<select name="flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}.slug">
					${getOptions(pageData, anchorData?.slug)}
				</select>
			</div>
		</div>`);
    const pageid = html.find("select[name='pageId']");
    pageid.parent().parent().after(select);
    html.find("select[name='entryId']").change(_updateSectionList);
    pageid.change(_updateSectionList);
  }
  if (!app._minimized) {
    let pos = app.position;
    pos.height = "auto";
    app.setPosition(pos);
  }
  if (!game.user.isGM) {
    return;
  }
  const showImageExplicitSource = stripQueryStringAndHashFromPath(
    app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE) ?? ""
  );
  const showImage = app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_IMAGE) ?? false;
  const pinIsTransparent = app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_TRANSPARENT) ?? false;
  const showOnlyToGM = app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_ONLY_TO_GM) ?? false;
  const hasBackground = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND)) ?? 0;
  const ratio = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ?? 1;
  const textAlwaysVisible = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE)) ?? false;
  const hideLabel = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
  const numberWsSuffixOnNameplate = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
  const enablePlayerIcon = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride");
  const defaultState = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride") ?? ``;
  const defaultPath = game.settings.get(CONSTANTS.MODULE_ID, "playerIconPathDefault") ?? ``;
  const playerIconState = getProperty(noteData, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_STATE}`) ?? defaultState;
  const playerIconPath = stripQueryStringAndHashFromPath(
    getProperty(noteData, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_PATH}`) ?? defaultPath
  );
  const enableNoteTintColorLink = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
  let pinIsRevealed = getProperty(noteData, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`) ?? true;
  let usePinIsRevealed = getProperty(noteData, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.USE_PIN_REVEALED}`) ?? false;
  let doNotShowJournalPreviewS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW)
  );
  if (doNotShowJournalPreviewS !== "true" && doNotShowJournalPreviewS !== "false") {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableTooltipByDefault")) {
      doNotShowJournalPreviewS = "false";
    } else {
      doNotShowJournalPreviewS = "true";
    }
  }
  const doNotShowJournalPreview = String(doNotShowJournalPreviewS) === "true" ? true : false;
  const previewAsTextSnippet = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET)) ?? false;
  const tooltipPlacement = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_PLACEMENT) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_PLACEMENT)) ?? "e";
  const tooltipColor = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_COLOR) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_COLOR)) ?? "";
  const tooltipForceRemove = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE)) ?? false;
  const tooltipSmartPlacement = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT)) ?? false;
  const tooltipFollowMouse = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE)) ?? false;
  const tooltipPlacementHtml = `
		<select
		id="pin-cushion-tooltip-placement"
		style="width: 100%;"
		name="flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_PLACEMENT}">
		<option
			value="nw-alt"
			${tooltipPlacement === "nw-alt" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.north-west-alt")}
		</option>
		<option
			value="nw"
			${tooltipPlacement === "nw" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.north-west")}
		</option>
		<option
			value="n"
			${tooltipPlacement === "n" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.north")}
			</option>
		<option
			value="ne"
			${tooltipPlacement === "ne" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.north-east")}
			</option>
		<option
			value="ne-alt"
			${tooltipPlacement === "ne-alt" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.north-east-alt")}
			</option>
		<option
			value="w"
			${tooltipPlacement === "w" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.west")}
			</option>
		<option
			value="e"
			${tooltipPlacement === "e" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.east")}
			</option>
		<option
			value="sw-alt"
			${tooltipPlacement === "sw-alt" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.south-west-alt")}
			</option>
		<option
			value="sw"
			${tooltipPlacement === "sw" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.south-west")}
		</option>
		<option
			value="s"
			${tooltipPlacement === "s" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.south")}
		</option>
		<option
			value="se"
			${tooltipPlacement === "se" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.south-east")}
		</option>
		<option
			value="se-alt"
			${tooltipPlacement === "se-alt" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Placement.choices.south-east-alt")}
		</option>
		</select>
	`;
  const tooltipColorHtml = `
	<select
		id="pin-cushion-tooltip-color"
		style="width: 100%;"
		name="flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_COLOR}">
		<option
		value="" ${tooltipColor === "" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.default")}
		</option>
		<option
		value="blue"
		${tooltipColor === "blue" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.blue")}
		</option>
		<option
		value="dark"
		${tooltipColor === "dark" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.dark")}
		</option>
		<option
		value="green"
		${tooltipColor === "green" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.green")}
		</option>
		<option
		value="light"
		${tooltipColor === "light" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.light")}
		</option>
		<option
		value="orange"
		${tooltipColor === "orange" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.orange")}
		</option>
		<option value="purple"
		${tooltipColor === "purple" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.purple")}
		</option>
		<option
		value="red"
		${tooltipColor === "red" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.red")}
		</option>
		<option
		value="yellow"
		${tooltipColor === "yellow" ? "selected" : ""}>
			${i18n("pin-cushion.Tooltip.Color.choices.yellow")}
		</option>
	</select>
	`;
  const tooltipCustomDescription = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION)) ?? "";
  let tooltipShowDescriptionS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION)
  );
  if (tooltipShowDescriptionS !== "true" && tooltipShowDescriptionS !== "false") {
    tooltipShowDescriptionS = "true";
  }
  const tooltipShowDescription = String(tooltipShowDescriptionS) === "true" ? true : false;
  let tooltipShowTitleS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE)
  );
  if (tooltipShowTitleS !== "true" && tooltipShowTitleS !== "false") {
    tooltipShowTitleS = "true";
  }
  const tooltipShowTitle = String(tooltipShowTitleS) === "true" ? true : false;
  const enableBackgroundlessPins = game.settings.get(CONSTANTS.MODULE_ID, "enableBackgroundlessPins");
  let pinCushionData = mergeObject(
    {
      yesUploadFile: game.user.can("FILES_BROWSE"),
      noUploadFile: !game.user.can("FILES_BROWSE"),
      showImageExplicitSource,
      showImage,
      pinIsTransparent,
      showOnlyToGM,
      hasBackground,
      ratio,
      textAlwaysVisible,
      hideLabel,
      numberWsSuffixOnNameplate,
      enablePlayerIcon,
      playerIconState,
      playerIconPath,
      enableNoteTintColorLink,
      pinIsRevealed,
      usePinIsRevealed,
      previewAsTextSnippet,
      doNotShowJournalPreview,
      tooltipPlacement,
      tooltipColor,
      tooltipForceRemove,
      tooltipSmartPlacement,
      tooltipFollowMouse,
      enableBackgroundlessPins,
      enableNoteGM,
      tooltipColorHtml,
      tooltipPlacementHtml,
      tooltipCustomDescription,
      tooltipShowDescription,
      tooltipShowTitle
    },
    app.object.flags[CONSTANTS.MODULE_ID] || {}
  );
  let noteHtml = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/note-config.html`, pinCushionData);
  if ($(".sheet-tabs", html).length) {
    $(".sheet-tabs", html).append(
      $("<a>").addClass("item").attr("data-tab", "pincushion").html('<i class="fas fa-map-marker-plus"></i> Pin Cushion (GM Only)')
    );
    $("<div>").addClass("tab action-sheet").attr("data-tab", "pincushion").html(noteHtml).insertAfter($(".tab:last", html));
  } else {
    let root = $("form", html);
    if (root.length == 0)
      root = html;
    let basictab = $("<div>").addClass("tab").attr("data-tab", "basic");
    $("> *:not(button):not(footer)", root).each(function() {
      basictab.append(this);
    });
    $(root).prepend($("<div>").addClass("tab action-sheet").attr("data-tab", "pincushion").html(noteHtml)).prepend(basictab).prepend(
      $("<nav>").addClass("sheet-tabs tabs").append(
        $("<a>").addClass("item active").attr("data-tab", "basic").html('<i class="fas fa-university"></i> Basic')
      ).append(
        $("<a>").addClass("item").attr("data-tab", "pincushion").html('<i class="fas fa-map-marker-plus"></i> Pin Cushion (GM Only)')
      )
    );
  }
  $('button[data-target="flags.pin-cushion.showImageExplicitSource"]', html).on(
    "click",
    app._activateFilePicker.bind(app)
  );
  $('button[data-target="flags.pin-cushion.PlayerIconPath"]', html).on("click", app._activateFilePicker.bind(app));
  const iconCustomSelectorExplicit = html.find(
    `input[name='flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE}']`
  );
  if (iconCustomSelectorExplicit?.length > 0) {
    iconCustomSelectorExplicit.on("change", function() {
      const p = iconCustomSelectorExplicit.parent().find(".pin-cushion-explicit-icon");
      p[0].src = this.value;
    });
  }
  const iconCustomPlayerIconPath = html.find(
    `input[name='flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_PATH}']`
  );
  if (iconCustomPlayerIconPath?.length > 0) {
    iconCustomPlayerIconPath.on("change", function() {
      const p = iconCustomPlayerIconPath.parent().find(".pin-cushion-journal-icon");
      p[0].src = this.value;
    });
  }
  const iconCustomPageIcon = html.find(`select[name='pageId']`);
  if (iconCustomPageIcon?.length > 0) {
    iconCustomPageIcon.on("change", function() {
      const p = iconCustomPageIcon.parent().find(".pin-cushion-page-icon");
      const pageId = this.value;
      if (html.find(`select[name='entryId']`).length > 0) {
        const entryId = html.find(`select[name='entryId']`)[0].value;
        const firstImageFromPage = retrieveFirstImageFromJournalId(entryId, pageId, true);
        if (firstImageFromPage) {
          p[0].src = firstImageFromPage;
        }
      }
    });
  }
  app.options.tabs = [{ navSelector: ".tabs", contentSelector: "form", initial: "basic" }];
  app.options.height = "auto";
  app._tabs = app._createTabHandlers();
  const el = html[0];
  app._tabs.forEach((t) => t.bind(el));
  app.setPosition();
});
Hooks.on("renderHeadsUpDisplay", (app, html, data) => {
  html.append(`<template id="pin-cushion-hud"></template>`);
  canvas.hud.pinCushion = new PinCushionHUD();
});
Hooks.on("hoverNote", (note, hovered) => {
  const previewDelay = game.settings.get(CONSTANTS.MODULE_ID, "previewDelay");
  let doNotShowJournalPreviewS = String(
    getProperty(note, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW}`)
  );
  if (doNotShowJournalPreviewS !== "true" && doNotShowJournalPreviewS !== "false") {
    doNotShowJournalPreviewS = "true";
  }
  const doNotShowJournalPreview = String(doNotShowJournalPreviewS) === "true" ? true : false;
  if (doNotShowJournalPreview) {
    return;
  }
  let tooltipForceRemoveS = String(
    getProperty(note, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE}`)
  );
  if (tooltipForceRemoveS !== "true" && tooltipForceRemoveS !== "false") {
    tooltipForceRemoveS = "false";
  }
  const tooltipForceRemove = String(tooltipForceRemoveS) === "true" ? true : false;
  if (!hovered) {
    clearTimeout(API$1.pinCushion.hoverTimer);
    if (tooltipForceRemove) {
      $("#powerTip").remove();
    }
    return canvas.hud.pinCushion.clear();
  }
  if (hovered) {
    API$1.pinCushion.hoverTimer = setTimeout(function() {
      canvas.hud.pinCushion.bind(note);
    }, previewDelay);
    return;
  } else {
    if (!hovered) {
      clearTimeout(API$1.pinCushion.hoverTimer);
      return canvas.hud.pinCushion.clear();
    }
  }
});
Hooks.on("renderJournalDirectory", (app, html, data) => {
  PinCushion._addJournalThumbnail(app, html, data);
  PinCushion._addJournalDirectoryPages(app, html, data);
});
Hooks.on("deleteJournalEntryPage", () => {
  PinCushion._deleteJournalDirectoryPagesEntry();
});
Hooks.on("createJournalEntryPage", () => {
  PinCushion._createJournalDirectoryPagesEntry();
});
Hooks.on("renderJournalSheet", (app, html, data) => {
  PinCushion._renderJournalThumbnail(app, html);
});
Hooks.once("canvasInit", () => {
  if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "noteGM")) {
    libWrapper.register(
      CONSTANTS.MODULE_ID,
      "Note.prototype._drawTooltip",
      PinCushion._addDrawTooltipWithNoteGM,
      "WRAPPER"
    );
  } else {
    libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._drawTooltip", PinCushion._addDrawTooltip2, "MIXED");
  }
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._applyRenderFlags", PinCushion._applyRenderFlags, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype.refresh", PinCushion._noteRefresh, "WRAPPER");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._onUpdate", PinCushion._noteUpdate, "WRAPPER");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype.isVisible", PinCushion._isVisible, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._drawControlIcon", PinCushion._drawControlIcon, "OVERRIDE");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._canControl", PinCushion._canControl, "MIXED");
});
Hooks.on("renderSettingsConfig", (app, html, data) => {
  let name, colour;
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorLink`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorLink");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorNotLink`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotLink");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorRevealed`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorRevealed");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorNotRevealed`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotRevealed");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, html).addClass("color"));
});
Hooks.on("dropCanvasData", (canvas2, data) => {
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    if (!(data.type === "JournalEntryPage" && data.anchor)) {
      return;
    }
    const { anchor } = data;
    Hooks.once("renderNoteConfig", (_, html, { label }) => {
      html.find("input[name='text']").val(`${label}: ${anchor.name}`);
      html.find(`option[value=${anchor.slug}]`).attr("selected", true);
    });
  }
});
Hooks.on("activateNote", (note, options) => {
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    let anchorData = getProperty(note, `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}`);
    options.anchor = anchorData?.slug;
  }
});
export {
  getApi,
  getSocket,
  setApi,
  setSocket
};
//# sourceMappingURL=module.js.map
