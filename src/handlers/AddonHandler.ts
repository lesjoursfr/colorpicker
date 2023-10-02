import { updateCSS, off } from "../core/index";
import { Colorpicker } from "../colorpicker";

/**
 * Handles everything related to the colorpicker addon
 */
export class AddonHandler {
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;
  /**
   * @type {HTMLElement|null}
   */
  private _addon: HTMLElement | null;

  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker: Colorpicker) {
    this._colorpicker = colorpicker;
    this._addon = null;
  }

  /**
   * @returns {HTMLElement}
   */
  public get addon(): HTMLElement {
    if (this._addon === null) {
      throw new Error("This AddonHandler doesn't have an addon !");
    }
    return this._addon;
  }

  public hasAddon(): boolean {
    return this._addon !== null;
  }

  public bind(): void {
    this._addon = this._colorpicker.options.addon
      ? this._colorpicker.element.querySelector(this._colorpicker.options.addon)
      : null;
  }

  public unbind(): void {
    if (this._addon !== null) {
      off(this._addon, "*.colorpicker");
    }
  }

  /**
   * If the addon element is present, its background color is updated
   */
  public update(): void {
    if (!this._colorpicker.colorHandler.hasColor() || this._addon === null) {
      return;
    }

    const colorStr = this._colorpicker.colorHandler.getColorString();

    const styles = { background: colorStr };

    const icn = this._addon.querySelector<HTMLElement>("i")!;

    if (icn !== null) {
      updateCSS(icn, styles);
    } else {
      updateCSS(this._addon, styles);
    }
  }
}
