import {
  ColorItem,
  getAttribute,
  setAttribute,
  getData,
  hasTagName,
  on,
  off,
  trigger,
  ColorpickerEvent,
} from "../core/index";
import { Colorpicker } from "../colorpicker";

/**
 * Handles everything related to the colorpicker input
 */
export class InputHandler {
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;
  /**
   * @type {HTMLElement|null}
   */
  private _input: HTMLInputElement | null;

  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker: Colorpicker) {
    this.onkeyup = this.onkeyup.bind(this);
    this.onchange = this.onchange.bind(this);

    this._colorpicker = colorpicker;
    this._input = hasTagName(this._colorpicker.element, "input")
      ? (this._colorpicker.element as HTMLInputElement)
      : this._colorpicker.options.input
      ? this._colorpicker.element.querySelector<HTMLInputElement>(this._colorpicker.options.input)
      : null;

    this._initValue();
  }

  public get input(): HTMLInputElement {
    if (this._input === null) {
      throw new Error("This InputHandler doesn't have an input !");
    }
    return this._input;
  }

  public bind(): void {
    if (this._input === null) {
      return;
    }
    on(this._input, "keyup.colorpicker", this.onkeyup as EventListener);
    on(this._input, "change.colorpicker", this.onchange as EventListener);
  }

  public unbind(): void {
    if (this._input === null) {
      return;
    }
    off(this._input, "*.colorpicker");
  }

  private _initValue(): void {
    if (this._input === null) {
      return;
    }

    let val: unknown = "";

    [
      // candidates:
      this._input.value,
      getData(this._input, "color") as string | ColorItem | null,
      getAttribute(this._input, "data-color"),
    ].forEach((item) => {
      if (item && val === "") {
        val = item;
      }
    });

    if (val instanceof ColorItem) {
      val = this.getFormattedColor(val.string(this._colorpicker.format));
    } else if (typeof val !== "string") {
      val = "";
    }

    setAttribute(this._input, "value", val as string);
  }

  /**
   * Returns the color string from the input value.
   * If there is no input the return value is false.
   * @returns {string|false}
   */
  public getValue(): string | false {
    if (this._input === null) {
      return false;
    }

    return this._input.value;
  }

  /**
   * If the input element is present, it updates the value with the current color object color string.
   * If the value is changed, this method fires a "change" event on the input element.
   * @param {string} val
   * @fires Colorpicker#change
   */
  public setValue(val: string): void {
    if (this._input === null) {
      return;
    }

    const inputVal = getAttribute(this._input, "value");

    val = val || "";

    if (val === (inputVal || "")) {
      // No need to set value or trigger any event if nothing changed
      return;
    }

    setAttribute(this._input, "value", val);

    /**
     * (Input) Triggered on the input element when a new color is selected.
     * @event Colorpicker#change
     */
    trigger(this._input, "change", this._colorpicker, this._colorpicker.color, val);
  }

  /**
   * Returns the formatted color string, with the formatting options applied
   * (e.g. useHashPrefix)
   * @param {string|null} val
   * @returns {string}
   */
  public getFormattedColor(val: string | null = null): string {
    val = val || this._colorpicker.colorHandler.getColorString();

    if (val === null || val === "") {
      return "";
    }

    val = this._colorpicker.colorHandler.resolveColorDelegate(val, false);

    if (this._colorpicker.options.useHashPrefix === false) {
      val = val.replace(/^#/g, "");
    }

    return val;
  }

  /**
   * Returns true if the widget has an associated input element, false otherwise
   * @returns {boolean}
   */
  public hasInput(): boolean {
    return this._input !== null;
  }

  /**
   * Returns true if the input exists and is disabled
   * @returns {boolean}
   */
  public isEnabled(): boolean {
    return this._input !== null && !this.isDisabled();
  }

  /**
   * Returns true if the input exists and is disabled
   * @returns {boolean}
   */
  public isDisabled(): boolean {
    return this._input !== null && getAttribute(this._input, "disabled") === "true";
  }

  /**
   * Disables the input if any
   * @fires Colorpicker#colorpickerDisable
   */
  public disable(): void {
    if (this._input !== null) {
      setAttribute(this._input, "disabled", "true");
    }
  }

  /**
   * Enables the input if any
   * @fires Colorpicker#colorpickerEnable
   */
  public enable(): void {
    if (this._input !== null) {
      setAttribute(this._input, "disabled", "false");
    }
  }

  /**
   * Calls setValue with the current internal color value
   * @fires Colorpicker#change
   */
  public update(): void {
    if (this._input === null) {
      return;
    }

    if (this._colorpicker.options.autoInputFallback === false && this._colorpicker.colorHandler.isInvalidColor()) {
      // prevent update if color is invalid, autoInputFallback is disabled and the last event is keyup.
      return;
    }

    this.setValue(this.getFormattedColor());
  }

  /**
   * Function triggered when the input has changed, so the colorpicker gets updated.
   * @param {ColorpickerEvent} e
   * @returns {boolean}
   */
  public onchange(e: ColorpickerEvent): void {
    this._colorpicker.lastEvent.alias = "input.change";
    this._colorpicker.lastEvent.e = e;

    const val = this.getValue();

    if (val !== false && val !== e.value) {
      this._colorpicker.setValue(val);
    }
  }

  /**
   * Function triggered after a keyboard key has been released.
   * @param {ColorpickerEvent} e
   */
  public onkeyup(e: ColorpickerEvent): void {
    this._colorpicker.lastEvent.alias = "input.keyup";
    this._colorpicker.lastEvent.e = e;

    const val = this.getValue();

    if (val !== false && val !== e.value) {
      this._colorpicker.setValue(val);
    }
  }
}
