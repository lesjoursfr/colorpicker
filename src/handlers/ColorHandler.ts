import { ColorItem, getData, setData } from "../core/index.js";
import { Colorpicker } from "../index.js";

/**
 * Handles everything related to the colorpicker color
 */
export class ColorHandler {
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;

  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker: Colorpicker) {
    /**
     * @type {Colorpicker}
     */
    this._colorpicker = colorpicker;
  }

  /**
   * @returns {string|ColorItem|null}
   */
  public get fallback(): string | ColorItem | null {
    return this._colorpicker.options.fallbackColor
      ? this._colorpicker.options.fallbackColor
      : this.color instanceof ColorItem
      ? this.color
      : null;
  }

  /**
   * @returns {string|null}
   */
  public get format(): string | null {
    if (this._colorpicker.options.format) {
      return this._colorpicker.options.format;
    }

    if (this.color instanceof ColorItem && this.color.hasTransparency() && this.color.format?.match(/^hex/)) {
      return this.isAlphaEnabled() ? "rgba" : "hex";
    }

    if (this.color instanceof ColorItem) {
      return this.color.format;
    }

    return "rgb";
  }

  /**
   * Internal color getter
   * @type {ColorItem|null}
   */
  public get color(): ColorItem | null {
    return getData(this._colorpicker.element, "color") as ColorItem | null;
  }

  /**
   * Internal color setter
   * @param {ColorItem|null} value
   */
  public set color(value: ColorItem | null) {
    setData(this._colorpicker.element, "color", value);

    if (value instanceof ColorItem && this._colorpicker.options.format === "auto") {
      // If format is 'auto', use the first parsed one from now on
      this._colorpicker.options.format = value.format;
    }
  }

  public bind(): void {
    // if the color option is set
    if (this._colorpicker.options.color) {
      this.color = this.createColor(this._colorpicker.options.color);
      return;
    }

    // if element[color] is empty and the input has a value
    if (!this.color && !!this._colorpicker.inputHandler.getValue()) {
      this.color = this.createColor(
        this._colorpicker.inputHandler.getValue() as string,
        this._colorpicker.options.autoInputFallback
      );
    }
  }

  public unbind(): void {
    setData(this._colorpicker.element, "color", null);
  }

  /**
   * Returns the color string from the input value or the 'data-color' attribute of the input or element.
   * If empty, it returns the defaultValue parameter.
   * @returns {string}
   */
  public getColorString(): string {
    if (!(this.color instanceof ColorItem)) {
      return "";
    }

    return this.color.string(this.format);
  }

  /**
   * Sets the color value
   * @param {string|ColorItem} val
   */
  public setColorString(val: string | ColorItem): void {
    const color = val ? this.createColor(val) : null;

    this.color = color || null;
  }

  /**
   * Creates a new color using the widget instance options (fallbackColor, format).
   * @fires Colorpicker#colorpickerInvalid
   * @param {string|ColorItem} val
   * @param {boolean} fallbackOnInvalid
   * @param {boolean} autoHexInputFallback
   * @returns {ColorItem}
   */
  public createColor(
    val: string | ColorItem,
    fallbackOnInvalid: boolean = true,
    autoHexInputFallback: boolean = false
  ): ColorItem {
    const disableHexInputFallback = !fallbackOnInvalid && !autoHexInputFallback;

    let color = new ColorItem(this.resolveColorDelegate(val), this.format, disableHexInputFallback);

    if (!color.isValid()) {
      if (fallbackOnInvalid) {
        color = this.getFallbackColor();
      }

      /**
       * (Colorpicker) Fired when the color is invalid and the fallback color is going to be used.
       * @event Colorpicker#colorpickerInvalid
       */
      this._colorpicker.trigger("colorpickerInvalid", color, val instanceof ColorItem ? val.string(this.format) : val);
    }

    if (!this.isAlphaEnabled()) {
      // Alpha is disabled
      color.alpha = 1;
    }

    return color;
  }

  public getFallbackColor(): ColorItem {
    if (this.fallback && this.fallback === this.color) {
      return this.color;
    }

    const fallback = this.fallback !== null ? this.resolveColorDelegate(this.fallback) : null;

    const color = new ColorItem(fallback, this.format);

    if (!color.isValid()) {
      console.warn("The fallback color is invalid. Falling back to the previous color or black if any.");
      return this.color ? this.color : new ColorItem("#000000", this.format);
    }

    return color;
  }

  /**
   * @returns {ColorItem}
   */
  public assureColor(): ColorItem {
    if (!(this.color instanceof ColorItem)) {
      this.color = this.getFallbackColor();
    }

    return this.color;
  }

  /**
   * Delegates the color resolution to the colorpicker extensions.
   * @param {string|ColorItem} color
   * @param {boolean} realColor if true, the color should resolve into a real (not named) color code
   * @returns {string}
   */
  public resolveColorDelegate(color: string | ColorItem, realColor: boolean = true): string {
    color = color instanceof ColorItem ? color.string(this.format) : color;
    let extResolvedColor: ColorItem | string | false = false;

    for (const ext of this._colorpicker.extensions) {
      extResolvedColor = ext.resolveColor(color, realColor);
      if (extResolvedColor !== false) {
        // skip if resolved
        break;
      }
    }

    return extResolvedColor || color;
  }

  /**
   * Checks if there is a color object, that it is valid and it is not a fallback
   * @returns {boolean}
   */
  public isInvalidColor(): boolean {
    return !(this.color instanceof ColorItem) || !this.color.isValid();
  }

  /**
   * Returns true if the useAlpha option is exactly true, false otherwise
   * @returns {boolean}
   */
  public isAlphaEnabled(): boolean {
    return this._colorpicker.options.useAlpha !== false;
  }

  /**
   * Returns true if the current color object is an instance of Color, false otherwise.
   * @returns {boolean}
   */
  public hasColor(): boolean {
    return this.color instanceof ColorItem;
  }
}
