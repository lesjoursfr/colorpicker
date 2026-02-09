import { addClass, createFromTemplate, updateCSS } from "@lesjoursfr/browser-tools";
import { ColorpickerOptions } from "../colorpicker-options.js";
import { ColorItem } from "../core/index.js";
import { Colorpicker } from "../index.js";

/**
 * Handles everything related to the colorpicker UI
 */
export class PickerHandler {
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;
  /**
   * @type {HTMLElement}
   */
  private _picker!: HTMLElement;

  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker: Colorpicker) {
    this._colorpicker = colorpicker;
  }

  public get picker(): HTMLElement {
    return this._picker;
  }

  private get _options(): ColorpickerOptions {
    return this._colorpicker.options;
  }

  private get _color(): ColorItem {
    if (this._colorpicker.colorHandler.color === null) {
      throw new Error("This ColorHandler doesn't have a Color !");
    }
    return this._colorpicker.colorHandler.color;
  }

  private _hasColor(): boolean {
    return this._colorpicker.colorHandler.hasColor();
  }

  public bind(): void {
    this._picker = createFromTemplate(this._options.template);

    if (this._options.customClass) {
      addClass(this._picker, this._options.customClass.split(/\s+/));
    }

    if (this._options.horizontal) {
      addClass(this._picker, "colorpicker-horizontal");
    }

    if (this._supportsAlphaBar()) {
      this._options.useAlpha = true;
      addClass(this._picker, "colorpicker-with-alpha");
    } else {
      this._options.useAlpha = false;
    }
  }

  public attach(): void {
    // Inject the colorpicker element into the DOM
    const pickerParent = this._colorpicker.container ? this._colorpicker.container : null;

    if (pickerParent) {
      pickerParent.append(this._picker);
    }
  }

  public unbind(): void {
    this._picker.remove();
  }

  private _supportsAlphaBar(): boolean {
    return (
      (this._options.useAlpha || (this._hasColor() && this._color.hasTransparency())) &&
      this._options.useAlpha !== false &&
      (!this._options.format || (this._options.format && !this._options.format.match(/^hex([36])?$/i)))
    );
  }

  /**
   * Changes the color adjustment bars using the current color object information.
   */
  public update(): void {
    if (!this._hasColor()) {
      return;
    }

    const vertical = this._options.horizontal !== true;
    const slider = vertical ? this._options.sliders : this._options.slidersHorz;

    const saturationGuide = this._picker.querySelector<HTMLElement>(".colorpicker-saturation .colorpicker-guide")!;
    const hueGuide = this._picker.querySelector<HTMLElement>(".colorpicker-hue .colorpicker-guide")!;
    const alphaGuide = this._picker.querySelector<HTMLElement>(".colorpicker-alpha .colorpicker-guide")!;

    const hsva = this._color.toHsvaRatio();

    // Set guides position
    if (hueGuide !== null) {
      updateCSS(
        hueGuide,
        vertical ? "top" : "left",
        ((vertical ? slider.hue.maxTop : slider.hue.maxLeft) * (1 - hsva.h)).toString()
      );
    }
    if (alphaGuide !== null) {
      updateCSS(
        alphaGuide,
        vertical ? "top" : "left",
        ((vertical ? slider.alpha.maxTop : slider.alpha.maxLeft) * (1 - hsva.a)).toString()
      );
    }
    if (saturationGuide !== null) {
      updateCSS(saturationGuide, {
        top: (slider.saturation.maxTop - hsva.v * slider.saturation.maxTop).toString(),
        left: (hsva.s * slider.saturation.maxLeft).toString(),
      });
    }

    // Set saturation hue background
    updateCSS(
      this._picker.querySelector<HTMLElement>(".colorpicker-saturation")!,
      "background-color",
      this._color.getCloneHueOnly().toHexString() // we only need hue
    );

    // Set alpha color gradient
    const hexColor = this._color.toHexString();

    let alphaBg: string;
    if (this._options.horizontal) {
      alphaBg = `linear-gradient(to right, ${hexColor} 0%, transparent 100%)`;
    } else {
      alphaBg = `linear-gradient(to bottom, ${hexColor} 0%, transparent 100%)`;
    }

    updateCSS(this._picker.querySelector<HTMLElement>(".colorpicker-alpha-color")!, "background", alphaBg);
  }
}
