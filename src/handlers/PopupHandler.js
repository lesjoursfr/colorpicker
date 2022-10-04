import { createPopper } from "@popperjs/core";
import { getAttribute, hasClass, addClass, removeClass, on, off, createFromTemplate } from "../core/index.js";
import _defaults from "../options.js";

const defaults = {
  popoverTemplate: `<div class="colorpicker-popover"><div class="colorpicker-popover-arrow"></div><div class="colorpicker-popover-body"></div></div>`,
};

/**
 * Handles everything related to the UI of the colorpicker popup: show, hide, position,...
 * @ignore
 */
export class PopupHandler {
  /**
   * @param {Colorpicker} colorpicker
   * @param {Window} root
   */
  constructor(colorpicker, root) {
    this.toggle = this.toggle.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.reposition = this.reposition.bind(this);

    /**
     * @type {Window}
     */
    this.root = root;
    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {HTMLElement}
     */
    this.popoverTarget = null;
    /**
     * @type {HTMLElement}
     */
    this.popoverTip = null;
    /**
     * @type {popper.Instance}
     */
    this.popperInstance = null;

    /**
     * If true, the latest click was inside the popover
     * @type {boolean}
     */
    this.clicking = false;
    /**
     * @type {boolean}
     */
    this.hidding = false;
    /**
     * @type {boolean}
     */
    this.showing = false;
  }

  /**
   * @private
   * @returns {HTMLElement|false}
   */
  get input() {
    return this.colorpicker.inputHandler.input;
  }

  /**
   * @private
   * @returns {boolean}
   */
  get hasInput() {
    return this.colorpicker.inputHandler.hasInput();
  }

  /**
   * @private
   * @returns {HTMLElement|false}
   */
  get addon() {
    return this.colorpicker.addonHandler.addon;
  }

  /**
   * @private
   * @returns {boolean}
   */
  get hasAddon() {
    return this.colorpicker.addonHandler.hasAddon();
  }

  /**
   * @private
   * @returns {boolean}
   */
  get isPopover() {
    return !this.colorpicker.options.inline && !!this.popoverTip;
  }

  /**
   * Binds the different colorpicker elements to the mouse/touch events so it reacts in order to show or
   * hide the colorpicker popup accordingly. It also adds the proper classes.
   */
  bind() {
    const cp = this.colorpicker;

    if (cp.options.inline) {
      addClass(cp.picker, ["colorpicker-inline", "colorpicker-visible"]);
      return; // no need to bind show/hide events for inline elements
    }

    addClass(cp.picker, ["colorpicker-popup", "colorpicker-hidden"]);

    // there is no input or addon
    if (!this.hasInput && !this.hasAddon) {
      return;
    }

    // create Bootstrap 4 popover
    if (cp.options.popover) {
      this.createPopover();
    }

    // bind addon show/hide events
    if (this.hasAddon) {
      on(this.addon, "mousedown.colorpicker touchstart.colorpicker", this.toggle);
    }

    // bind input show/hide events
    if (this.hasInput && !this.hasAddon) {
      on(this.input, "mousedown.colorpicker touchstart.colorpicker", this.show);
    }

    // reposition popup on window resize
    on(this.root, "resize.colorpicker", this.reposition);
  }

  /**
   * Unbinds any event bound by this handler
   */
  unbind() {
    if (this.hasInput) {
      off(this.input, "mousedown.colorpicker touchstart.colorpicker");
    }

    if (this.hasAddon) {
      off(this.addon, "mousedown.colorpicker touchstart.colorpicker");
    }

    if (this.popperInstance) {
      removeClass(this.popoverTip, "colorpicker-popover-visible");
      this.popperInstance.destroy();
      this.popperInstance = undefined;
    }

    off(this.root, "resize.colorpicker", this.reposition);
    off(this.root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);
  }

  isClickingInside(e) {
    if (!e) {
      return false;
    }

    return (
      this.isOrIsInside(this.popoverTip, e.currentTarget) ||
      this.isOrIsInside(this.popoverTip, e.target) ||
      this.isOrIsInside(this.colorpicker.picker, e.currentTarget) ||
      this.isOrIsInside(this.colorpicker.picker, e.target)
    );
  }

  isOrIsInside(container, element) {
    if (!container || !element) {
      return false;
    }

    return container.contains(element);
  }

  createPopover() {
    const cp = this.colorpicker;

    this.popoverTarget = this.hasAddon ? this.addon : this.input;

    addClass(cp.picker, "colorpicker-popover-content");

    this.popoverTip = createFromTemplate(defaults.popoverTemplate);
    this.popoverTip.querySelector(".colorpicker-popover-body").append(cp.picker);
    this.colorpicker.element.appendChild(this.popoverTip);
  }

  getPopperConfig() {
    return Object.assign({}, structuredClone(_defaults.popover), structuredClone(this.colorpicker.options.popover));
  }

  /**
   * If the widget is not inside a container or inline, rearranges its position relative to its element offset.
   *
   * @param {Event} [e]
   * @private
   */
  reposition(e) {
    if (this.popoverTarget && this.isVisible()) {
      this.popperInstance.update();
    }
  }

  /**
   * Toggles the colorpicker between visible or hidden
   *
   * @fires Colorpicker#colorpickerShow
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  toggle(e) {
    if (this.isVisible()) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  /**
   * Shows the colorpicker widget if hidden.
   *
   * @fires Colorpicker#colorpickerShow
   * @param {Event} [e]
   */
  show(e) {
    if (this.isVisible() || this.showing || this.hidding) {
      return;
    }

    this.showing = true;
    this.hidding = false;
    this.clicking = false;

    const cp = this.colorpicker;

    cp.lastEvent.alias = "show";
    cp.lastEvent.e = e;

    // Prevent showing browser native HTML5 colorpicker
    if ((!this.hasInput || getAttribute(this.input, "type") === "color") && e && e.preventDefault) {
      e.stopPropagation();
      e.preventDefault();
    }

    // If it's a popover, add event to the document to hide the picker when clicking outside of it
    if (this.isPopover) {
      on(this.root, "resize.colorpicker", this.reposition);
    }

    // add visible class before popover is shown
    addClass(cp.picker, "colorpicker-visible");
    removeClass(cp.picker, "colorpicker-hidden");

    if (this.popoverTarget) {
      this.popperInstance = createPopper(this.popoverTarget, this.popoverTip, this.getPopperConfig());
      addClass(this.popoverTip, "colorpicker-popover-visible");
      setTimeout(() => this.fireShow());
    } else {
      this.fireShow();
    }
  }

  fireShow() {
    this.hidding = false;
    this.showing = false;

    if (this.isPopover) {
      // Add event to hide on outside click
      on(this.root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);
    }

    /**
     * (Colorpicker) When show() is called and the widget can be shown.
     *
     * @event Colorpicker#colorpickerShow
     */
    this.colorpicker.trigger("colorpickerShow");
  }

  /**
   * Hides the colorpicker widget.
   * Hide is prevented when it is triggered by an event whose target element has been clicked/touched.
   *
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  hide(e) {
    if (this.isHidden() || this.showing || this.hidding) {
      return;
    }

    const cp = this.colorpicker;
    const clicking = this.clicking || this.isClickingInside(e);

    this.hidding = true;
    this.showing = false;
    this.clicking = false;

    cp.lastEvent.alias = "hide";
    cp.lastEvent.e = e;

    // Prevent hide if triggered by an event and an element inside the colorpicker has been clicked/touched
    if (clicking) {
      this.hidding = false;
      return;
    }

    if (this.popperInstance) {
      removeClass(this.popoverTip, "colorpicker-popover-visible");
      this.popperInstance.destroy();
      this.popperInstance = undefined;
    }

    this.fireHide();
  }

  fireHide() {
    this.hidding = false;
    this.showing = false;

    const cp = this.colorpicker;

    // add hidden class after popover is hidden
    addClass(cp.picker, "colorpicker-hidden");
    removeClass(cp.picker, "colorpicker-visible");

    // Unbind window and document events, since there is no need to keep them while the popup is hidden
    off(this.root, "resize.colorpicker", this.reposition);
    off(this.root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);

    /**
     * (Colorpicker) When hide() is called and the widget can be hidden.
     *
     * @event Colorpicker#colorpickerHide
     */
    cp.trigger("colorpickerHide");
  }

  /**
   * Returns true if the colorpicker element has the colorpicker-visible class and not the colorpicker-hidden one.
   * False otherwise.
   *
   * @returns {boolean}
   */
  isVisible() {
    return (
      hasClass(this.colorpicker.picker, "colorpicker-visible") &&
      !hasClass(this.colorpicker.picker, "colorpicker-hidden")
    );
  }

  /**
   * Returns true if the colorpicker element has the colorpicker-hidden class and not the colorpicker-visible one.
   * False otherwise.
   *
   * @returns {boolean}
   */
  isHidden() {
    return (
      hasClass(this.colorpicker.picker, "colorpicker-hidden") &&
      !hasClass(this.colorpicker.picker, "colorpicker-visible")
    );
  }
}
