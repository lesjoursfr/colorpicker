/**
 * Color manipulation class, specific for Bootstrap Colorpicker
 */
import QixColor from "color";

type QixColorFormat = Parameters<typeof QixColor>[1];

type InputColor = ColorItem | HSVAColor | QixColor | Array<number> | string;

type SupportedColorFormat = "rgb" | "hsl" | "hex";

/**
 * HSVA color data class, containing the hue, saturation, value and alpha
 * information.
 */
export class HSVAColor {
  public h: number;
  public s: number;
  public v: number;
  public a: number;

  /**
   * @param {number} h
   * @param {number} s
   * @param {number} v
   * @param {number} a
   */
  constructor(h: number, s: number, v: number, a: number) {
    this.h = isNaN(h) ? 0 : h;
    this.s = isNaN(s) ? 0 : s;
    this.v = isNaN(v) ? 0 : v;
    this.a = isNaN(h) ? 1 : a;
  }

  toString() {
    return `${this.h}, ${this.s}%, ${this.v}%, ${this.a}`;
  }
}

/**
 * HSVA color manipulation
 */
export class ColorItem {
  /**
   * Returns the HSVAColor class
   * @example let colorData = new ColorItem.HSVAColor(360, 100, 100, 1);
   * @returns {HSVAColor}
   */
  static get HSVAColor(): typeof HSVAColor {
    return HSVAColor;
  }

  /**
   * List of hue-based color formulas used by ColorItem.prototype.generate()
   * @type {{complementary: number[], triad: number[], tetrad: number[], splitcomplement: number[]}}
   */
  public static colorFormulas: {
    complementary: number[];
    triad: number[];
    tetrad: number[];
    splitcomplement: number[];
  } = {
    complementary: [180],
    triad: [0, 120, 240],
    tetrad: [0, 90, 180, 270],
    splitcomplement: [0, 72, 216],
  };

  /**
   * Applies a method of the QixColor API and returns a new Color object or
   * the return value of the method call.   * If no argument is provided, the internal QixColor object is returned.
   * @param {string} fn QixColor function name
   * @param args QixColor function arguments
   * @example let darkerColor = color.api('darken', 0.25);
   * @example let luminosity = color.api('luminosity');
   * @example color = color.api('negate');
   * @example let qColor = color.api().negate();
   * @returns {ColorItem|QixColor|unknown}
   */
  public api(fn: string, ...args: unknown[]): ColorItem | QixColor | unknown {
    if (arguments.length === 0) {
      return this._color;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const result = (this._color as unknown as { [key: string]: Function })[fn](...args);

    if (!(result instanceof QixColor)) {
      // return result of the method call
      return result;
    }

    return new ColorItem(result, this.format);
  }

  /**
   * Returns the original ColorItem constructor data,
   * plus a 'valid' flag to know if it's valid or not.
   * @returns {{color: InputColor|null, format: SupportedColorFormat|null, valid: boolean}}
   */
  get original() {
    return this._original;
  }

  /**
   * @type {{color: InputColor|null, format: SupportedColorFormat|null, valid: boolean}}
   */
  private _original!: { color: InputColor | null; format: SupportedColorFormat | null; valid: boolean };

  /**
   * @type {QixColor}
   */
  private _color!: QixColor;

  /**
   * @type {SupportedColorFormat|null}
   */
  private _format: SupportedColorFormat | null = null;

  /**
   * @param {InputColor|null} color Color data
   * @param {string|null} format Color model to convert to by default. Supported: 'rgb', 'hsl', 'hex'.
   * @param {boolean} disableHexInputFallback Disable fixing hex3 format
   */
  constructor(color: InputColor | null = null, format: string | null = null, disableHexInputFallback: boolean = false) {
    this.replace(color, format, disableHexInputFallback);
  }

  /**
   * Replaces the internal QixColor object with a new one.
   * This also replaces the internal original color data.
   * @param {InputColor|null} color Color data to be parsed (if needed)
   * @param {string|null} format Color model to convert to by default. Supported: 'rgb', 'hsl', 'hex'.
   * @param {boolean} disableHexInputFallback Disable fixing hex3 format
   * @example color.replace('rgb(255,0,0)', 'hsl');
   * @example color.replace(hsvaColorData);
   */
  public replace(
    color: InputColor | null = null,
    format: string | null = null,
    disableHexInputFallback: boolean = false
  ): void {
    format = ColorItem.sanitizeFormat(format);

    this._original = {
      color: color,
      format: format as SupportedColorFormat | null,
      valid: true,
    };

    color = ColorItem.parse(color, disableHexInputFallback);
    if (color === null) {
      this._color = QixColor();
      this._original.valid = false;
      return;
    }
    this._color = color;

    this._format =
      (format as ReturnType<typeof ColorItem.sanitizeFormat>) ||
      (ColorItem.isHex(color) ? "hex" : (this._color as QixColor & { model: SupportedColorFormat }).model);
  }

  /**
   * Parses the color returning a Qix Color object or null if cannot be
   * parsed.
   * @param {InputColor|null} color Color data
   * @param {boolean} disableHexInputFallback Disable fixing hex3 format
   * @example let qColor = ColorItem.parse('rgb(255,0,0)');
   * @returns {QixColor|null}
   */
  public static parse(color: InputColor | null, disableHexInputFallback: boolean = false): QixColor | null {
    if (color instanceof QixColor) {
      return color;
    }

    if (color instanceof ColorItem) {
      return color._color;
    }

    let format: QixColorFormat;

    if (color instanceof HSVAColor) {
      color = [color.h, color.s, color.v, isNaN(color.a) ? 1 : color.a];
    } else if (typeof color === "string") {
      color = ColorItem.sanitizeString(color);
    }

    if (color === null) {
      return null;
    }

    if (Array.isArray(color)) {
      format = "hsv";
    }

    if (ColorItem.isHex(color) && color.length !== 6 && color.length !== 7 && disableHexInputFallback) {
      return null;
    }

    try {
      return QixColor(color, format ?? undefined);
    } catch (_err) {
      return null;
    }
  }

  /**
   * Sanitizes a color string, adding missing hash to hexadecimal colors
   * and converting 'transparent' to a color code.
   * @param {string} str Color string
   * @example let colorStr = ColorItem.sanitizeString('ffaa00');
   * @returns {string}
   */
  public static sanitizeString(str: string): string {
    if (str.match(/^[0-9a-f]{2,}$/i)) {
      return `#${str}`;
    }

    if (str.toLowerCase() === "transparent") {
      return "#FFFFFF00";
    }

    return str;
  }

  /**
   * Detects if a value is a string and a color in hexadecimal format (in any variant).
   * @param {unknown} str
   * @example ColorItem.isHex('rgba(0,0,0)'); // false
   * @example ColorItem.isHex('ffaa00'); // true
   * @example ColorItem.isHex('#ffaa00'); // true
   * @returns {boolean}
   */
  public static isHex(str: unknown): boolean {
    if (!(typeof str === "string" || str instanceof String)) {
      return false;
    }

    return !!str.match(/^#?[0-9a-f]{2,}$/i);
  }

  /**
   * Sanitizes a color format to one supported by web browsers.
   * Returns an empty string of the format can't be recognised.
   * @param {unknown} format
   * @example ColorItem.sanitizeFormat('rgba'); // 'rgb'
   * @example ColorItem.isHex('hex8'); // 'hex'
   * @example ColorItem.isHex('invalid'); // ''
   * @returns {SupportedColorFormat|null}
   */
  public static sanitizeFormat(format: unknown): SupportedColorFormat | null {
    switch (format) {
      case "hex":
      case "hex3":
      case "hex4":
      case "hex6":
      case "hex8":
        return "hex";
      case "rgb":
      case "rgba":
      case "keyword":
      case "name":
        return "rgb";
      case "hsl":
      case "hsla":
      case "hsv":
      case "hsva":
      case "hwb": // HWB this is supported by Qix Color, but not by browsers
      case "hwba":
        return "hsl";
      default:
        return null;
    }
  }

  /**
   * Returns true if the color is valid, false if not.
   * @returns {boolean}
   */
  public isValid(): boolean {
    return this._original.valid === true;
  }

  /**
   * Hue value from 0 to 360
   * @returns {number}
   */
  public get hue(): number {
    return this._color.hue();
  }

  /**
   * Saturation value from 0 to 100
   * @returns {number}
   */
  public get saturation(): number {
    return this._color.saturationv();
  }

  /**
   * Value channel value from 0 to 100
   * @returns {number}
   */
  public get value(): number {
    return this._color.value();
  }

  /**
   * Alpha value from 0.0 to 1.0
   * @returns {number}
   */
  public get alpha(): number {
    const a = this._color.alpha();

    return isNaN(a) ? 1 : a;
  }

  /**
   * Default color format to convert to when calling toString() or string()
   * @returns {SupportedColorFormat|null}
   */
  public get format(): SupportedColorFormat | null {
    return this._format ? this._format : (this._color as QixColor & { model: SupportedColorFormat }).model;
  }

  /**
   * Sets the hue value
   * @param {number} value Integer from 0 to 360
   */
  public set hue(value: number) {
    this._color = this._color.hue(value);
  }

  /**
   * Sets the hue ratio, where 1.0 is 0, 0.5 is 180 and 0.0 is 360.
   * @param {number} h Ratio from 1.0 to 0.0
   */
  public setHueRatio(h: number): void {
    this.hue = (1 - h) * 360;
  }

  /**
   * Sets the saturation value
   * @param {number} value Integer from 0 to 100
   */
  public set saturation(value: number) {
    this._color = this._color.saturationv(value);
  }

  /**
   * Sets the saturation ratio, where 1.0 is 100 and 0.0 is 0.
   * @param {number} s Ratio from 0.0 to 1.0
   */
  public setSaturationRatio(s: number): void {
    this.saturation = s * 100;
  }

  /**
   * Sets the 'value' channel value
   * @param {number} value Integer from 0 to 100
   */
  public set value(value: number) {
    this._color = this._color.value(value);
  }

  /**
   * Sets the value ratio, where 1.0 is 0 and 0.0 is 100.
   * @param {number} v Ratio from 1.0 to 0.0
   */
  public setValueRatio(v: number): void {
    this.value = (1 - v) * 100;
  }

  /**
   * Sets the alpha value. It will be rounded to 2 decimals.
   * @param {number} value Float from 0.0 to 1.0
   */
  public set alpha(value: number) {
    // 2 decimals max
    this._color = this._color.alpha(Math.round(value * 100) / 100);
  }

  /**
   * Sets the alpha ratio, where 1.0 is 0.0 and 0.0 is 1.0.
   * @param {number} a Ratio from 1.0 to 0.0
   */
  public setAlphaRatio(a: number): void {
    this.alpha = 1 - a;
  }

  /**
   * Sets the default color format
   * @param {string} value Supported: 'rgb', 'hsl', 'hex'
   */
  public set format(value: string) {
    this._format = ColorItem.sanitizeFormat(value);
  }

  /**
   * Returns true if the saturation value is zero, false otherwise
   * @returns {boolean}
   */
  public isDesaturated(): boolean {
    return this.saturation === 0;
  }

  /**
   * Returns true if the alpha value is zero, false otherwise
   * @returns {boolean}
   */
  public isTransparent(): boolean {
    return this.alpha === 0;
  }

  /**
   * Returns true if the alpha value is numeric and less than 1, false otherwise
   * @returns {boolean}
   */
  public hasTransparency(): boolean {
    return this.hasAlpha() && this.alpha < 1;
  }

  /**
   * Returns true if the alpha value is numeric, false otherwise
   * @returns {boolean}
   */
  public hasAlpha(): boolean {
    return !isNaN(this.alpha);
  }

  /**
   * Returns a new HSVAColor object, based on the current color
   * @returns {HSVAColor}
   */
  public toObject(): HSVAColor {
    return new HSVAColor(this.hue, this.saturation, this.value, this.alpha);
  }

  /**
   * Alias of toObject()   * @returns {HSVAColor}
   */
  public toHsva(): HSVAColor {
    return this.toObject();
  }

  /**
   * Returns a new HSVAColor object with the ratio values (from 0.0 to 1.0),
   * based on the current color.
   * @returns {HSVAColor}
   */
  public toHsvaRatio(): HSVAColor {
    return new HSVAColor(this.hue / 360, this.saturation / 100, this.value / 100, this.alpha);
  }

  /**
   * Converts the current color to its string representation,
   * using the internal format of this instance.
   * @returns {string}
   */
  public toString(): string {
    return this.string();
  }

  /**
   * Converts the current color to its string representation,
   * using the given format.
   * @param {string|null} format Format to convert to. If empty or null, the internal format will be used.
   * @returns {string}
   */
  public string(format: string | null = null): string {
    format = ColorItem.sanitizeFormat(format || this.format);

    if (!format) {
      return this._color.round().string();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    if ((this._color as unknown as { [key: string]: Function })[format] === undefined) {
      throw new Error(`Unsupported color format: '${format}'`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const str = (this._color as unknown as { [key: string]: Function })[format]();

    return str.round ? str.round().string() : str;
  }

  /**
   * Returns true if the given color values equals this one, false otherwise.
   * The format is not compared.
   * If any of the colors is invalid, the result will be false.
   * @param {InputColor|null} color Color data
   * @returns {boolean}
   */
  public equals(color: InputColor | null): boolean {
    color = color instanceof ColorItem ? color : new ColorItem(color);

    if (!color.isValid() || !this.isValid()) {
      return false;
    }

    return (
      this.hue === color.hue &&
      this.saturation === color.saturation &&
      this.value === color.value &&
      this.alpha === color.alpha
    );
  }

  /**
   * Creates a copy of this instance
   * @returns {ColorItem}
   */
  public getClone(): ColorItem {
    return new ColorItem(this._color, this.format);
  }

  /**
   * Creates a copy of this instance, only copying the hue value,
   * and setting the others to its max value.
   * @returns {ColorItem}
   */
  public getCloneHueOnly(): ColorItem {
    return new ColorItem([this.hue, 100, 100, 1], this.format);
  }

  /**
   * Creates a copy of this instance setting the alpha to the max.
   * @returns {ColorItem}
   */
  public getCloneOpaque(): ColorItem {
    return new ColorItem(this._color.alpha(1), this.format);
  }

  /**
   * Converts the color to a RGB string
   * @returns {string}
   */
  public toRgbString(): string {
    return this.string("rgb");
  }

  /**
   * Converts the color to a Hexadecimal string
   * @returns {string}
   */
  public toHexString(): string {
    return this.string("hex");
  }

  /**
   * Converts the color to a HSL string
   * @returns {string}
   */
  public toHslString(): string {
    return this.string("hsl");
  }

  /**
   * Returns true if the color is dark, false otherwhise.
   * This is useful to decide a text color.
   * @returns {boolean}
   */
  public isDark(): boolean {
    return this._color.isDark();
  }

  /**
   * Returns true if the color is light, false otherwhise.
   * This is useful to decide a text color.
   * @returns {boolean}
   */
  public isLight(): boolean {
    return this._color.isLight();
  }

  /**
   * Generates a list of colors using the given hue-based formula or the given array of hue values.
   * Hue formulas can be extended using ColorItem.colorFormulas static property.
   * @param {"complementary"|"triad"|"tetrad"|"splitcomplement"|number[]} formula Examples: 'complementary', 'triad', 'tetrad', 'splitcomplement', [180, 270]
   * @example let colors = color.generate('triad');
   * @example let colors = color.generate([45, 80, 112, 200]);
   * @returns {ColorItem[]}
   */
  public generate(formula: "complementary" | "triad" | "tetrad" | "splitcomplement" | number[]): ColorItem[] {
    let hues: number[] = [];

    if (Array.isArray(formula)) {
      hues = formula;
    } else if (!Object.hasOwn(ColorItem.colorFormulas, formula)) {
      throw new Error(`No color formula found with the name '${formula}'.`);
    } else {
      hues = ColorItem.colorFormulas[formula];
    }

    const colors: ColorItem[] = [];
    const mainColor = this._color;
    const format = this.format;

    hues.forEach(function (hue) {
      const levels = [
        hue ? (mainColor.hue() + hue) % 360 : mainColor.hue(),
        mainColor.saturationv(),
        mainColor.value(),
        mainColor.alpha(),
      ];

      colors.push(new ColorItem(levels, format));
    });

    return colors;
  }
}
