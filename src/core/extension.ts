import { off, on } from "@lesjoursfr/browser-tools";
import { Colorpicker } from "../index.js";
import { ColorpickerEvent } from "./events.js";

/**
 * Colorpicker extension class.
 */
export class Extension<ExtensionOptions = never> {
  /**
   * The colorpicker instance
   * @type {Colorpicker}
   */
  protected _colorpicker: Colorpicker;
  /**
   * Extension options
   * @type {ExtensionOptions}
   */
  protected _options: ExtensionOptions;

  /**
   * @param {Colorpicker} colorpicker
   * @param {ExtensionOptions} options
   */
  constructor(colorpicker: Colorpicker, options: unknown) {
    this.onCreate = this.onCreate.bind(this);
    this.onDestroy = this.onDestroy.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onInvalid = this.onInvalid.bind(this);
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onEnable = this.onEnable.bind(this);
    this.onDisable = this.onDisable.bind(this);

    this._colorpicker = colorpicker;
    this._options = options as ExtensionOptions;

    if (!this._colorpicker.element) {
      throw new Error("Extension: this._colorpicker.element is not valid");
    }

    on(this._colorpicker.element, "colorpickerCreate.colorpicker-ext", this.onCreate as EventListener);
    on(this._colorpicker.element, "colorpickerDestroy.colorpicker-ext", this.onDestroy as EventListener);
    on(this._colorpicker.element, "colorpickerUpdate.colorpicker-ext", this.onUpdate as EventListener);
    on(this._colorpicker.element, "colorpickerChange.colorpicker-ext", this.onChange as EventListener);
    on(this._colorpicker.element, "colorpickerInvalid.colorpicker-ext", this.onInvalid as EventListener);
    on(this._colorpicker.element, "colorpickerShow.colorpicker-ext", this.onShow as EventListener);
    on(this._colorpicker.element, "colorpickerHide.colorpicker-ext", this.onHide as EventListener);
    on(this._colorpicker.element, "colorpickerEnable.colorpicker-ext", this.onEnable as EventListener);
    on(this._colorpicker.element, "colorpickerDisable.colorpicker-ext", this.onDisable as EventListener);
  }

  /**
   * Function called every time a new color needs to be created.
   * Return false to skip this resolver and continue with other extensions' ones
   * or return anything else to consider the color resolved.
   * @param {string} color
   * @param {boolean} realColor if true, the color should resolve into a real (not named) color code
   * @return {string|false}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public resolveColor(color: string, realColor: boolean = true): string | false {
    return false;
  }

  /**
   * Method called after the colorpicker is created
   * @listens Colorpicker#colorpickerCreate
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onCreate(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker is destroyed
   * @listens Colorpicker#colorpickerDestroy
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onDestroy(event: ColorpickerEvent): void {
    off(this._colorpicker.element, "*.colorpicker-ext");
  }

  /**
   * Method called after the colorpicker is updated
   * @listens Colorpicker#colorpickerUpdate
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdate(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker color is changed
   * @listens Colorpicker#colorpickerChange
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChange(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called when the colorpicker color is invalid
   * @listens Colorpicker#colorpickerInvalid
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInvalid(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker is hidden
   * @listens Colorpicker#colorpickerHide
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onHide(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker is shown
   * @listens Colorpicker#colorpickerShow
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onShow(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker is disabled
   * @listens Colorpicker#colorpickerDisable
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onDisable(event: ColorpickerEvent): void {
    // to be extended
  }

  /**
   * Method called after the colorpicker is enabled
   * @listens Colorpicker#colorpickerEnable
   * @param {ColorpickerEvent} event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onEnable(event: ColorpickerEvent): void {
    // to be extended
  }
}
