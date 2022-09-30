import { updateCSS, off } from "../core/index.js";

/**
 * Handles everything related to the colorpicker addon
 * @ignore
 */
export class AddonHandler {
  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker) {
    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {HTMLElement}
     */
    this.addon = null;
  }

  hasAddon() {
    return !!this.addon;
  }

  bind() {
    this.addon = this.colorpicker.options.addon
      ? this.colorpicker.element.querySelector(this.colorpicker.options.addon)
      : null;
  }

  unbind() {
    if (this.hasAddon()) {
      off(this.addon, "*.colorpicker");
    }
  }

  /**
   * If the addon element is present, its background color is updated
   */
  update() {
    if (!this.colorpicker.colorHandler.hasColor() || !this.hasAddon()) {
      return;
    }

    const colorStr = this.colorpicker.colorHandler.getColorString();

    const styles = { background: colorStr };

    const icn = this.addon.querySelector("i");

    if (icn !== null) {
      updateCSS(icn, styles);
    } else {
      updateCSS(this.addon, styles);
    }
  }
}
