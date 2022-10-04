import { createFromTemplate, addClass, updateCSS } from "../core/index.js";

/**
 * Handles everything related to the colorpicker UI
 * @ignore
 */
export class PickerHandler {
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
    this.picker = null;
  }

  get options() {
    return this.colorpicker.options;
  }

  get color() {
    return this.colorpicker.colorHandler.color;
  }

  bind() {
    /**
     * @type {HTMLElement}
     */
    const picker = (this.picker = createFromTemplate(this.options.template));

    if (this.options.customClass) {
      addClass(picker, this.options.customClass.split(/\s+/));
    }

    if (this.options.horizontal) {
      addClass(picker, "colorpicker-horizontal");
    }

    if (this._supportsAlphaBar()) {
      this.options.useAlpha = true;
      addClass(picker, "colorpicker-with-alpha");
    } else {
      this.options.useAlpha = false;
    }
  }

  attach() {
    // Inject the colorpicker element into the DOM
    const pickerParent = this.colorpicker.container ? this.colorpicker.container : null;

    if (pickerParent) {
      pickerParent.append(this.picker);
    }
  }

  unbind() {
    this.picker.remove();
  }

  _supportsAlphaBar() {
    return (
      (this.options.useAlpha || (this.colorpicker.colorHandler.hasColor() && this.color.hasTransparency())) &&
      this.options.useAlpha !== false &&
      (!this.options.format || (this.options.format && !this.options.format.match(/^hex([36])?$/i)))
    );
  }

  /**
   * Changes the color adjustment bars using the current color object information.
   */
  update() {
    if (!this.colorpicker.colorHandler.hasColor()) {
      return;
    }

    const vertical = this.options.horizontal !== true;
    const slider = vertical ? this.options.sliders : this.options.slidersHorz;

    const saturationGuide = this.picker.querySelector(".colorpicker-saturation .colorpicker-guide");
    const hueGuide = this.picker.querySelector(".colorpicker-hue .colorpicker-guide");
    const alphaGuide = this.picker.querySelector(".colorpicker-alpha .colorpicker-guide");

    const hsva = this.color.toHsvaRatio();

    // Set guides position
    if (hueGuide !== null) {
      updateCSS(
        hueGuide,
        vertical ? "top" : "left",
        (vertical ? slider.hue.maxTop : slider.hue.maxLeft) * (1 - hsva.h)
      );
    }
    if (alphaGuide !== null) {
      updateCSS(
        alphaGuide,
        vertical ? "top" : "left",
        (vertical ? slider.alpha.maxTop : slider.alpha.maxLeft) * (1 - hsva.a)
      );
    }
    if (saturationGuide !== null) {
      updateCSS(saturationGuide, {
        top: slider.saturation.maxTop - hsva.v * slider.saturation.maxTop,
        left: hsva.s * slider.saturation.maxLeft,
      });
    }

    // Set saturation hue background
    updateCSS(
      this.picker.querySelector(".colorpicker-saturation"),
      "backgroundColor",
      this.color.getCloneHueOnly().toHexString() // we only need hue
    );

    // Set alpha color gradient
    const hexColor = this.color.toHexString();

    let alphaBg = "";

    if (this.options.horizontal) {
      alphaBg = `linear-gradient(to right, ${hexColor} 0%, transparent 100%)`;
    } else {
      alphaBg = `linear-gradient(to bottom, ${hexColor} 0%, transparent 100%)`;
    }

    updateCSS(this.picker.querySelector(".colorpicker-alpha-color"), "background", alphaBg);
  }
}
