import { createPopper } from "@popperjs/core";
import { getAttribute, hasClass, addClass, removeClass, on, off, createFromTemplate } from "../core/index";
import { DefaultOptions } from "../colorpicker-options";
import { Colorpicker } from "../colorpicker";

const defaults = {
  popoverTemplate: `<div class="colorpicker-popover"><div class="colorpicker-popover-arrow"></div><div class="colorpicker-popover-body"></div></div>`,
};

/**
 * Handles everything related to the UI of the colorpicker popup: show, hide, position,...
 */
export class PopupHandler {
  /**
   * @type {Window}
   */
  private _root: Window;
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;
  /**
   * @type {HTMLElement|null}
   */
  private _popoverTarget: HTMLElement | null;
  /**
   * @type {HTMLElement|null}
   */
  private _popoverTip: HTMLElement | null;
  /**
   * @type {popper.Instance|null}
   */
  private _popperInstance: ReturnType<typeof createPopper> | null;

  /**
   * If true, the latest click was inside the popover
   * @type {boolean}
   */
  private _clicking: boolean;
  /**
   * @type {boolean}
   */
  private _hidding: boolean;
  /**
   * @type {boolean}
   */
  private _showing: boolean;

  /**
   * @param {Colorpicker} colorpicker
   * @param {Window} root
   */
  constructor(colorpicker: Colorpicker, root: Window) {
    this.toggle = this.toggle.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.reposition = this.reposition.bind(this);

    this._root = root;
    this._colorpicker = colorpicker;
    this._popoverTarget = null;
    this._popoverTip = null;
    this._popperInstance = null;

    this._clicking = false;
    this._hidding = false;
    this._showing = false;
  }

  private get _input(): HTMLElement {
    return this._colorpicker.inputHandler.input;
  }

  private get _hasInput(): boolean {
    return this._colorpicker.inputHandler.hasInput();
  }

  private get _addon(): HTMLElement {
    return this._colorpicker.addonHandler.addon;
  }

  private get _hasAddon(): boolean {
    return this._colorpicker.addonHandler.hasAddon();
  }

  private get _isPopover(): boolean {
    return !this._colorpicker.options.inline && !!this._popoverTip;
  }

  /**
   * Binds the different colorpicker elements to the mouse/touch events so it reacts in order to show or
   * hide the colorpicker popup accordingly. It also adds the proper classes.
   */
  public bind(): void {
    const cp = this._colorpicker;

    if (cp.options.inline) {
      addClass(cp.picker, ["colorpicker-inline", "colorpicker-visible"]);
      return; // no need to bind show/hide events for inline elements
    }

    addClass(cp.picker, ["colorpicker-popup", "colorpicker-hidden"]);

    // there is no input or addon
    if (!this._hasInput && !this._hasAddon) {
      return;
    }

    // create the popover
    if (cp.options.popover) {
      this.createPopover();
    }

    // bind addon show/hide events
    if (this._hasAddon) {
      on(this._addon, "mousedown.colorpicker touchstart.colorpicker", this.toggle);
    }

    // bind input show/hide events
    if (this._hasInput && !this._hasAddon) {
      on(this._input, "mousedown.colorpicker touchstart.colorpicker", this.show);
    }

    // reposition popup on window resize
    on(this._root, "resize.colorpicker", this.reposition);
  }

  /**
   * Unbinds any event bound by this handler
   */
  public unbind(): void {
    if (this._hasInput) {
      off(this._input, "mousedown.colorpicker touchstart.colorpicker");
    }

    if (this._hasAddon) {
      off(this._addon, "mousedown.colorpicker touchstart.colorpicker");
    }

    if (this._popperInstance !== null) {
      if (this._popoverTip !== null) {
        removeClass(this._popoverTip, "colorpicker-popover-visible");
      }
      this._popperInstance.destroy();
      this._popperInstance = null;
    }

    off(this._root, "resize.colorpicker", this.reposition);
    off(this._root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);
  }

  public isClickingInside(e: Event): boolean {
    if (!e) {
      return false;
    }

    return (
      this.isOrIsInside(this._popoverTip, e.currentTarget as HTMLElement) ||
      this.isOrIsInside(this._popoverTip, e.target as HTMLElement) ||
      this.isOrIsInside(this._colorpicker.picker, e.currentTarget as HTMLElement) ||
      this.isOrIsInside(this._colorpicker.picker, e.target as HTMLElement)
    );
  }

  public isOrIsInside(container: HTMLElement | null, element: HTMLElement | null): boolean {
    if (container === null || element === null) {
      return false;
    }

    return container.contains(element);
  }

  public createPopover(): void {
    const cp = this._colorpicker;

    this._popoverTarget = this._hasAddon ? this._addon : this._input;

    addClass(cp.picker, "colorpicker-popover-content");

    const popoverTip = createFromTemplate(defaults.popoverTemplate);
    popoverTip.querySelector<HTMLElement>(".colorpicker-popover-body")?.append(cp.picker);
    this._colorpicker.element.appendChild(popoverTip);
    this._popoverTip = popoverTip;
  }

  public getPopperConfig(): object {
    return Object.assign(
      {},
      structuredClone(DefaultOptions.popover || {}),
      structuredClone(this._colorpicker.options.popover || {})
    );
  }

  /**
   * If the widget is not inside a container or inline, rearranges its position relative to its element offset.
   */
  public reposition(): void {
    if (this._popoverTarget && this.isVisible()) {
      this._popperInstance!.update();
    }
  }

  /**
   * Toggles the colorpicker between visible or hidden   * @fires Colorpicker#colorpickerShow
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  public toggle(e: Event): void {
    if (this.isVisible()) {
      this.hide(e);
    } else {
      this.show(e);
    }
  }

  /**
   * Shows the colorpicker widget if hidden.
   * @fires Colorpicker#colorpickerShow
   * @param {Event} [e]
   */
  public show(e: Event): void {
    if (this.isVisible() || this._showing || this._hidding) {
      return;
    }

    this._showing = true;
    this._hidding = false;
    this._clicking = false;

    const cp = this._colorpicker;

    cp.lastEvent.alias = "show";
    cp.lastEvent.e = e;

    // Prevent showing browser native HTML5 colorpicker
    if ((!this._hasInput || getAttribute(this._input, "type") === "color") && e && e.preventDefault) {
      e.stopPropagation();
      e.preventDefault();
    }

    // If it's a popover, add event to the document to hide the picker when clicking outside of it
    if (this._isPopover) {
      on(this._root, "resize.colorpicker", this.reposition);
    }

    // add visible class before popover is shown
    addClass(cp.picker, "colorpicker-visible");
    removeClass(cp.picker, "colorpicker-hidden");

    if (this._popoverTarget !== null && this._popoverTip !== null) {
      this._popperInstance = createPopper(this._popoverTarget, this._popoverTip, this.getPopperConfig());
      addClass(this._popoverTip, "colorpicker-popover-visible");
      setTimeout(() => this.fireShow());
    } else {
      this.fireShow();
    }
  }

  public fireShow(): void {
    this._hidding = false;
    this._showing = false;

    if (this._isPopover) {
      // Add event to hide on outside click
      on(this._root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);
    }

    /**
     * (Colorpicker) When show() is called and the widget can be shown.
     * @event Colorpicker#colorpickerShow
     */
    this._colorpicker.trigger("colorpickerShow");
  }

  /**
   * Hides the colorpicker widget.
   * Hide is prevented when it is triggered by an event whose target element has been clicked/touched.
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  public hide(e: Event): void {
    if (this.isHidden() || this._showing || this._hidding) {
      return;
    }

    const cp = this._colorpicker;
    const clicking = this._clicking || this.isClickingInside(e);

    this._hidding = true;
    this._showing = false;
    this._clicking = false;

    cp.lastEvent.alias = "hide";
    cp.lastEvent.e = e;

    // Prevent hide if triggered by an event and an element inside the colorpicker has been clicked/touched
    if (clicking) {
      this._hidding = false;
      return;
    }

    if (this._popperInstance !== null) {
      if (this._popoverTip !== null) {
        removeClass(this._popoverTip, "colorpicker-popover-visible");
      }
      this._popperInstance.destroy();
      this._popperInstance = null;
    }

    this.fireHide();
  }

  public fireHide(): void {
    this._hidding = false;
    this._showing = false;

    const cp = this._colorpicker;

    // add hidden class after popover is hidden
    addClass(cp.picker, "colorpicker-hidden");
    removeClass(cp.picker, "colorpicker-visible");

    // Unbind window and document events, since there is no need to keep them while the popup is hidden
    off(this._root, "resize.colorpicker", this.reposition);
    off(this._root.document, "mousedown.colorpicker touchstart.colorpicker", this.hide);

    /**
     * (Colorpicker) When hide() is called and the widget can be hidden.     * @event Colorpicker#colorpickerHide
     */
    cp.trigger("colorpickerHide");
  }

  /**
   * Returns true if the colorpicker element has the colorpicker-visible class and not the colorpicker-hidden one.
   * False otherwise.
   * @returns {boolean}
   */
  public isVisible(): boolean {
    return (
      hasClass(this._colorpicker.picker, "colorpicker-visible") &&
      !hasClass(this._colorpicker.picker, "colorpicker-hidden")
    );
  }

  /**
   * Returns true if the colorpicker element has the colorpicker-hidden class and not the colorpicker-visible one.
   * False otherwise.
   * @returns {boolean}
   */
  public isHidden(): boolean {
    return (
      hasClass(this._colorpicker.picker, "colorpicker-hidden") &&
      !hasClass(this._colorpicker.picker, "colorpicker-visible")
    );
  }
}
