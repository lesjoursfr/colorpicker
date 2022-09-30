import { on, off } from "./index.js";

/**
 * Colorpicker extension class.
 */
export class Extension {
  /**
   * @param {Colorpicker} colorpicker
   * @param {Object} options
   */
  constructor(colorpicker, options = {}) {
    this.onCreate = this.onCreate.bind(this);
    this.onDestroy = this.onDestroy.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onInvalid = this.onInvalid.bind(this);
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onEnable = this.onEnable.bind(this);
    this.onDisable = this.onDisable.bind(this);

    /**
     * The colorpicker instance
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * Extension options
     *
     * @type {Object}
     */
    this.options = options;

    if (!this.colorpicker.element) {
      throw new Error("Extension: this.colorpicker.element is not valid");
    }

    on(this.colorpicker.element, "colorpickerCreate.colorpicker-ext", this.onCreate);
    on(this.colorpicker.element, "colorpickerDestroy.colorpicker-ext", this.onDestroy);
    on(this.colorpicker.element, "colorpickerUpdate.colorpicker-ext", this.onUpdate);
    on(this.colorpicker.element, "colorpickerChange.colorpicker-ext", this.onChange);
    on(this.colorpicker.element, "colorpickerInvalid.colorpicker-ext", this.onInvalid);
    on(this.colorpicker.element, "colorpickerShow.colorpicker-ext", this.onShow);
    on(this.colorpicker.element, "colorpickerHide.colorpicker-ext", this.onHide);
    on(this.colorpicker.element, "colorpickerEnable.colorpicker-ext", this.onEnable);
    on(this.colorpicker.element, "colorpickerDisable.colorpicker-ext", this.onDisable);
  }

  /**
   * Function called every time a new color needs to be created.
   * Return false to skip this resolver and continue with other extensions' ones
   * or return anything else to consider the color resolved.
   *
   * @param {ColorItem|String|*} color
   * @param {boolean} realColor if true, the color should resolve into a real (not named) color code
   * @return {ColorItem|String|*}
   */
  resolveColor(color, realColor = true) {
    return false;
  }

  /**
   * Method called after the colorpicker is created
   *
   * @listens Colorpicker#colorpickerCreate
   * @param {Event} event
   */
  onCreate(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker is destroyed
   *
   * @listens Colorpicker#colorpickerDestroy
   * @param {Event} event
   */
  onDestroy(event) {
    off(this.colorpicker.element, "*.colorpicker-ext");
  }

  /**
   * Method called after the colorpicker is updated
   *
   * @listens Colorpicker#colorpickerUpdate
   * @param {Event} event
   */
  onUpdate(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker color is changed
   *
   * @listens Colorpicker#colorpickerChange
   * @param {Event} event
   */
  onChange(event) {
    // to be extended
  }

  /**
   * Method called when the colorpicker color is invalid
   *
   * @listens Colorpicker#colorpickerInvalid
   * @param {Event} event
   */
  onInvalid(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker is hidden
   *
   * @listens Colorpicker#colorpickerHide
   * @param {Event} event
   */
  onHide(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker is shown
   *
   * @listens Colorpicker#colorpickerShow
   * @param {Event} event
   */
  onShow(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker is disabled
   *
   * @listens Colorpicker#colorpickerDisable
   * @param {Event} event
   */
  onDisable(event) {
    // to be extended
  }

  /**
   * Method called after the colorpicker is enabled
   *
   * @listens Colorpicker#colorpickerEnable
   * @param {Event} event
   */
  onEnable(event) {
    // to be extended
  }
}
