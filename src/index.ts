import { DefaultOptions, ColorpickerOptions } from "./colorpicker-options.js";
import * as coreExtensions from "./extensions/index.js";
import {
  SliderHandler,
  PopupHandler,
  InputHandler,
  ColorHandler,
  PickerHandler,
  AddonHandler,
} from "./handlers/index.js";
import {
  ColorItem,
  Extension,
  setAttribute,
  getData,
  setData,
  addClass,
  removeClass,
  off,
  trigger,
} from "./core/index.js";

declare global {
  interface HTMLElement {
    colorpicker?: Colorpicker;
  }
}

let colorPickerIdCounter = 0;

const root = (typeof self !== "undefined" ? self : this) as Window; // window

export type ColorpickerLastEvent = {
  alias: string | null;
  e: Event | null;
};

/**
 * Colorpicker widget class
 */
export class Colorpicker {
  public id: number;
  public lastEvent: ColorpickerLastEvent;
  public element: HTMLElement;
  public options: ColorpickerOptions;
  public extensions: Extension<object>[];
  public container: HTMLElement | false;
  public inputHandler: InputHandler;
  public colorHandler: ColorHandler;
  public sliderHandler: SliderHandler;
  public popupHandler: PopupHandler;
  public pickerHandler: PickerHandler;
  public addonHandler: AddonHandler;
  private disabled: boolean;

  /**
   * Colorpicker extension classes, indexed by extension name
   * @type {Object} a map between the extension name and its class
   */
  public static extensions: { [key: string]: typeof Extension<object> } = {
    debugger: coreExtensions.Debugger,
    palette: coreExtensions.Palette,
    preview: coreExtensions.Preview,
    swatches: coreExtensions.Swatches,
  };

  /**
   * Color class
   * @type {ColorItem}
   */
  public static get Color(): typeof ColorItem {
    return ColorItem;
  }

  /**
   * Extension class
   * @type {Extension}
   */
  public static get Extension(): typeof Extension {
    return Extension;
  }

  /**
   * Internal color object
   * @type {ColorItem | null}
   */
  public get color(): ColorItem | null {
    return this.colorHandler.color;
  }

  /**
   * Internal color format
   * @type {string|null}
   */
  public get format(): string | null {
    return this.colorHandler.format;
  }

  /**
   * Getter of the picker element
   * @returns {HTMLElement}
   */
  public get picker(): HTMLElement {
    return this.pickerHandler.picker;
  }

  /**
   * @fires Colorpicker#colorpickerCreate
   * @param {HTMLElement} element
   * @param {ColorpickerOptions} options
   * @constructor
   */
  constructor(element: HTMLElement, options: Partial<ColorpickerOptions>) {
    colorPickerIdCounter += 1;
    /**
     * The colorpicker instance number
     * @type {number}
     */
    this.id = colorPickerIdCounter;

    /**
     * Latest colorpicker event
     * @type {{name: string, e: *}}
     */
    this.lastEvent = {
      alias: null,
      e: null,
    };

    /**
     * The element that the colorpicker is bound to
     * @type {HTMLElement}
     */
    this.element = element;
    addClass(this.element, "colorpicker-element");
    setAttribute(this.element, "data-colorpicker-id", this.id.toString());

    /**
     * @type {defaults}
     */
    this.options = Object.assign(
      {},
      structuredClone(DefaultOptions),
      structuredClone(options),
      structuredClone(getData(this.element) as unknown)
    );

    /**
     * @type {boolean}
     */
    this.disabled = false;

    /**
     * Extensions added to this instance
     * @type {Extension[]}
     */
    this.extensions = [];

    /**
     * The element where the
     * @type {HTMLElement|false}
     */
    this.container =
      this.options.container === true || this.options.inline === true
        ? this.element
        : this.options.container !== false
          ? root.document.querySelector<HTMLElement>(this.options.container)!
          : false;

    /**
     * @type {InputHandler}
     */
    this.inputHandler = new InputHandler(this);
    /**
     * @type {ColorHandler}
     */
    this.colorHandler = new ColorHandler(this);
    /**
     * @type {SliderHandler}
     */
    this.sliderHandler = new SliderHandler(this, root);
    /**
     * @type {PopupHandler}
     */
    this.popupHandler = new PopupHandler(this, root);
    /**
     * @type {PickerHandler}
     */
    this.pickerHandler = new PickerHandler(this);
    /**
     * @type {AddonHandler}
     */
    this.addonHandler = new AddonHandler(this);

    this.init();

    // Emit a create event
    window.addEventListener(
      "load",
      () => {
        /**
         * (Colorpicker) When the Colorpicker instance has been created and the DOM is ready.
         * @event Colorpicker#colorpickerCreate
         */
        this.trigger("colorpickerCreate");
      },
      { once: true }
    );

    // Add the Colorpicker instance to the DOM
    this.element.colorpicker = this;
  }

  /**
   * Initializes the plugin
   */
  private init(): void {
    // Init addon
    this.addonHandler.bind();

    // Init input
    this.inputHandler.bind();

    // Init extensions (before initializing the color)
    this.initExtensions();

    // Init color
    this.colorHandler.bind();

    // Init picker
    this.pickerHandler.bind();

    // Init sliders and popup
    this.sliderHandler.bind();
    this.popupHandler.bind();

    // Inject into the DOM (this may make it visible)
    this.pickerHandler.attach();

    // Update all components
    this.update();

    if (this.inputHandler.isDisabled()) {
      this.disable();
    }
  }

  /**
   * Initializes the plugin extensions
   */
  private initExtensions(): void {
    if (!Array.isArray(this.options.extensions)) {
      this.options.extensions = [];
    }

    if (this.options.debug) {
      this.options.extensions.push({ name: "debugger" });
    }

    // Register and instantiate extensions
    this.options.extensions.forEach((ext) => {
      this.registerExtension(Colorpicker.extensions[ext.name.toLowerCase()], ext.options || {});
    });
  }

  /**
   * Creates and registers the given extension
   * @param {Extension} ExtensionClass The extension class to instantiate
   * @param {Object} [config] Extension configuration
   * @returns {Extension}
   */
  public registerExtension(ExtensionClass: typeof Extension<object>, config: unknown = {}): Extension<object> {
    const ext = new ExtensionClass(this, config);

    this.extensions.push(ext);
    return ext;
  }

  /**
   * Destroys the current instance
   * @fires Colorpicker#colorpickerDestroy
   */
  public destroy(): void {
    const color = this.color;

    this.sliderHandler.unbind();
    this.inputHandler.unbind();
    this.popupHandler.unbind();
    this.colorHandler.unbind();
    this.addonHandler.unbind();
    this.pickerHandler.unbind();

    removeClass(this.element, "colorpicker-element");
    setData(this.element, "colorpicker", null);
    setData(this.element, "color", null);
    off(this.element, "*.colorpicker");

    /**
     * (Colorpicker) When the instance is destroyed with all events unbound.
     * @event Colorpicker#colorpickerDestroy
     */
    this.trigger("colorpickerDestroy", color);
  }

  /**
   * Shows the colorpicker widget if hidden.
   * If the colorpicker is disabled this call will be ignored.
   * @fires Colorpicker#colorpickerShow
   * @param {Event} [e]
   */
  public show(e: Event): void {
    this.popupHandler.show(e);
  }

  /**
   * Hides the colorpicker widget.
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  public hide(e: Event): void {
    this.popupHandler.hide(e);
  }

  /**
   * Toggles the colorpicker between visible and hidden.
   * @fires Colorpicker#colorpickerShow
   * @fires Colorpicker#colorpickerHide
   * @param {Event} [e]
   */
  public toggle(e: Event): void {
    this.popupHandler.toggle(e);
  }

  /**
   * Returns the current color value as string
   * @param {string|ColorItem|null} [defaultValue]
   * @returns {string}
   */
  public getValue(defaultValue: string | ColorItem | null = null): string | null {
    let val: string | ColorItem | null = this.colorHandler.color;

    val = val instanceof ColorItem ? val : defaultValue;

    if (val instanceof ColorItem) {
      return val.string(this.format);
    }

    return val;
  }

  /**
   * Sets the color manually
   * @fires Colorpicker#colorpickerChange
   * @param {string|ColorItem} val
   */
  public setValue(val: string | ColorItem): void {
    if (this.isDisabled()) {
      return;
    }
    const ch = this.colorHandler;

    if ((ch.hasColor() && ch.color!.equals(val)) || (!ch.hasColor() && !val)) {
      // same color or still empty
      return;
    }

    ch.color = val ? ch.createColor(val, this.options.autoInputFallback, this.options.autoHexInputFallback) : null;

    /**
     * (Colorpicker) When the color is set programmatically with setValue().
     * @event Colorpicker#colorpickerChange
     */
    this.trigger("colorpickerChange", ch.color, val instanceof ColorItem ? val.string() : val);

    // force update if color has changed to empty
    this.update();
  }

  /**
   * Updates the UI and the input color according to the internal color.
   * @fires Colorpicker#colorpickerUpdate
   */
  public update(): void {
    if (this.colorHandler.hasColor()) {
      this.inputHandler.update();
    } else {
      this.colorHandler.assureColor();
    }

    this.addonHandler.update();
    this.pickerHandler.update();

    /**
     * (Colorpicker) Fired when the widget is updated.
     * @event Colorpicker#colorpickerUpdate
     */
    this.trigger("colorpickerUpdate");
  }

  /**
   * Enables the widget and the input if any
   * @fires Colorpicker#colorpickerEnable
   * @returns {boolean}
   */
  public enable(): boolean {
    this.inputHandler.enable();
    this.disabled = false;
    removeClass(this.picker, "colorpicker-disabled");

    /**
     * (Colorpicker) When the widget has been enabled.
     * @event Colorpicker#colorpickerEnable
     */
    this.trigger("colorpickerEnable");
    return true;
  }

  /**
   * Disables the widget and the input if any
   * @fires Colorpicker#colorpickerDisable
   * @returns {boolean}
   */
  public disable(): boolean {
    this.inputHandler.disable();
    this.disabled = true;
    addClass(this.picker, "colorpicker-disabled");

    /**
     * (Colorpicker) When the widget has been disabled.
     * @event Colorpicker#colorpickerDisable
     */
    this.trigger("colorpickerDisable");
    return true;
  }

  /**
   * Returns true if this instance is enabled
   * @returns {boolean}
   */
  public isEnabled(): boolean {
    return !this.isDisabled();
  }

  /**
   * Returns true if this instance is disabled
   * @returns {boolean}
   */
  public isDisabled(): boolean {
    return this.disabled === true;
  }

  /**
   * Triggers a Colorpicker event.
   * @param {string}eventName
   * @param  {ColorItem|null} color
   * @param  {string|null} value
   */
  public trigger(eventName: string, color: ColorItem | null = null, value: string | null = null): void {
    trigger(this.element, eventName, this, color || this.color, value || this.getValue());
  }
}
