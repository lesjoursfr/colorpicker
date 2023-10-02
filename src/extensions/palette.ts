import { Extension } from "../core/index";
import { Colorpicker } from "../colorpicker";

export type PaletteColorsOption = { [key: string]: string } | Array<string>;

export type PaletteOptions = {
  colors: PaletteColorsOption | null;
  namesAsValues: boolean;
};

const defaults: PaletteOptions = {
  /**
   * Key-value pairs defining a color alias and its CSS color representation.
   * They can also be just an array of values. In that case, no special names are used, only the real colors.
   * @type {Object|Array}
   * @default null
   * @example
   *  {
   *   'black': '#000000',
   *   'white': '#ffffff',
   *   'red': '#FF0000',
   *   'default': '#777777',
   *   'primary': '#337ab7',
   *   'success': '#5cb85c',
   *   'info': '#5bc0de',
   *   'warning': '#f0ad4e',
   *   'danger': '#d9534f'
   *  }
   * @example ['#f0ad4e', '#337ab7', '#5cb85c']
   */
  colors: null,
  /**
   * If true, when a color swatch is selected the name (alias) will be used as input value,
   * otherwise the swatch real color value will be used.
   * @type {boolean}
   * @default true
   */
  namesAsValues: true,
};

/**
 * Palette extension
 */
export class Palette<T extends PaletteOptions = PaletteOptions> extends Extension<T> {
  /**
   * @returns {PaletteColorsOption|null}
   */
  public get colors(): PaletteColorsOption | null {
    return this._options.colors;
  }

  constructor(colorpicker: Colorpicker, options: Partial<T> = {}) {
    super(colorpicker, Object.assign({}, structuredClone(defaults), structuredClone(options)));

    if (!Array.isArray(this._options.colors) && typeof this._options.colors !== "object") {
      this._options.colors = null;
    }
  }

  /**
   * @returns {number}
   */
  public getLength(): number {
    if (!this._options.colors) {
      return 0;
    }

    if (Array.isArray(this._options.colors)) {
      return this._options.colors.length;
    }

    if (typeof this._options.colors === "object") {
      return Object.keys(this._options.colors).length;
    }

    return 0;
  }

  public resolveColor(color: string, realColor: boolean = true): string | false {
    if (this.getLength() <= 0) {
      return false;
    }

    // Array of colors
    if (Array.isArray(this._options.colors)) {
      if (this._options.colors.indexOf(color) >= 0) {
        return color;
      }
      if (this._options.colors.indexOf(color.toUpperCase()) >= 0) {
        return color.toUpperCase();
      }
      if (this._options.colors.indexOf(color.toLowerCase()) >= 0) {
        return color.toLowerCase();
      }
      return false;
    }

    if (typeof this._options.colors !== "object") {
      return false;
    }

    // Map of objects
    if (!this._options.namesAsValues || realColor) {
      return this.getValue(color);
    }
    return this.getName(color);
  }

  /**
   * Given a color value, returns the corresponding color name or false.
   * @param {string} value
   * @returns {string|false}
   */
  public getName(value: string): string | false {
    if (typeof this._options.colors !== "object" || !this._options.colors) {
      return false;
    }
    for (const name in this._options.colors) {
      if (!Object.hasOwn(this._options.colors, name)) {
        continue;
      }
      if ((this._options.colors as { [key: string]: string })[name].toLowerCase() === value.toLowerCase()) {
        return name;
      }
    }
    return false;
  }

  /**
   * Given a color name, returns the corresponding color value or false.
   * @param {string} name
   * @returns {string|false}
   */
  public getValue(name: string): string | false {
    if (typeof this._options.colors !== "object" || !this._options.colors) {
      return false;
    }
    if (Object.hasOwn(this._options.colors, name)) {
      return (this._options.colors as { [key: string]: string })[name];
    }
    return false;
  }
}
