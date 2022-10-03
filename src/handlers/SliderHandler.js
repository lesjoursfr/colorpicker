import { is, offset, on, off } from "../core/index.js";

/**
 * Class that handles all configured sliders on mouse or touch events.
 * @ignore
 */
export class SliderHandler {
  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker, root) {
    this.pressed = this.pressed.bind(this);
    this.moved = this.moved.bind(this);
    this.released = this.released.bind(this);

    /**
     * @type {Window}
     */
    this.root = root;
    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {*|String}
     * @private
     */
    this.currentSlider = null;
    /**
     * @type {{left: number, top: number}}
     * @private
     */
    this.mousePointer = {
      left: 0,
      top: 0,
    };
  }

  /**
   * This function is called every time a slider guide is moved
   * The scope of "this" is the SliderHandler object.
   *
   * @param {int} top
   * @param {int} left
   */
  defaultOnMove(top, left) {
    if (!this.currentSlider) {
      return;
    }

    const slider = this.currentSlider;
    const cp = this.colorpicker;
    const ch = cp.colorHandler;

    // Create a color object
    const color = !ch.hasColor() ? ch.getFallbackColor() : ch.color.getClone();

    // Adjust the guide position
    slider.guideStyle.left = left + "px";
    slider.guideStyle.top = top + "px";

    // Adjust the color
    if (slider.callLeft) {
      color[slider.callLeft](left / slider.maxLeft);
    }
    if (slider.callTop) {
      color[slider.callTop](top / slider.maxTop);
    }

    // Set the new color
    cp.setValue(color);
  }

  /**
   * Binds the colorpicker sliders to the mouse/touch events
   */
  bind() {
    const sliders = this.colorpicker.options.horizontal
      ? this.colorpicker.options.slidersHorz
      : this.colorpicker.options.sliders;

    const sliderClasses = [];

    for (const sliderName in sliders) {
      if (!Object.hasOwn(sliders, sliderName)) {
        continue;
      }

      sliderClasses.push(sliders[sliderName].selector);
    }

    on(
      this.colorpicker.picker.querySelectorAll(sliderClasses.join(", ")),
      "mousedown.colorpicker touchstart.colorpicker",
      this.pressed
    );
  }

  /**
   * Unbinds any event bound by this handler
   */
  unbind() {
    off(this.colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker");
    off(this.colorpicker.picker, "mouseup.colorpicker touchend.colorpicker");
  }

  /**
   * Function triggered when clicking in one of the color adjustment bars
   *
   * @private
   * @fires Colorpicker#mousemove
   * @param {Event} e
   */
  pressed(e) {
    if (this.colorpicker.isDisabled()) {
      return;
    }
    this.colorpicker.lastEvent.alias = "pressed";
    this.colorpicker.lastEvent.e = e;

    if (!e.pageX && !e.pageY && e.touches) {
      e.pageX = e.touches[0].pageX;
      e.pageY = e.touches[0].pageY;
    }
    // e.stopPropagation();
    // e.preventDefault();

    const target = e.target;

    // detect the slider and set the limits and callbacks
    let zone = target.closest("div");

    const sliders = this.colorpicker.options.horizontal
      ? this.colorpicker.options.slidersHorz
      : this.colorpicker.options.sliders;

    if (is(zone, ".colorpicker")) {
      return;
    }

    this.currentSlider = null;

    for (const sliderName in sliders) {
      if (!Object.hasOwn(sliders, sliderName)) {
        continue;
      }

      const slider = sliders[sliderName];

      if (is(zone, slider.selector)) {
        this.currentSlider = Object.assign({}, structuredClone(slider), { name: sliderName });
        break;
      } else if (slider.childSelector !== undefined && is(zone, slider.childSelector)) {
        this.currentSlider = Object.assign({}, structuredClone(slider), { name: sliderName });
        zone = zone.parentNode; // zone.parents(slider.selector).first() ?
        break;
      }
    }

    const guide = zone.querySelector(".colorpicker-guide");

    if (this.currentSlider === null || guide === null) {
      return;
    }

    const zoneOffset = offset(zone);

    // reference to guide's style
    this.currentSlider.guideStyle = guide.style;
    this.currentSlider.left = e.pageX - zoneOffset.left;
    this.currentSlider.top = e.pageY - zoneOffset.top;
    this.mousePointer = {
      left: e.pageX,
      top: e.pageY,
    };

    // TODO: fix moving outside the picker makes the guides to keep moving. The event needs to be bound to the window.
    /**
     * (window.document) Triggered on mousedown for the document object,
     * so the color adjustment guide is moved to the clicked position.
     *
     * @event Colorpicker#mousemove
     */
    on(this.colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker", this.moved);
    on(this.root.document, "mouseup.colorpicker touchend.colorpicker", this.released);

    this.colorpicker.picker.dispatchEvent(new MouseEvent("mousemove"));
  }

  /**
   * Function triggered when dragging a guide inside one of the color adjustment bars.
   *
   * @private
   * @param {Event} e
   */
  moved(e) {
    this.colorpicker.lastEvent.alias = "moved";
    this.colorpicker.lastEvent.e = e;

    if (!e.pageX && !e.pageY && e.touches) {
      e.pageX = e.touches[0].pageX;
      e.pageY = e.touches[0].pageY;
    }

    // e.stopPropagation();
    e.preventDefault(); // prevents scrolling on mobile

    const left = Math.max(
      0,
      Math.min(
        this.currentSlider.maxLeft,
        this.currentSlider.left + ((e.pageX || this.mousePointer.left) - this.mousePointer.left)
      )
    );

    const top = Math.max(
      0,
      Math.min(
        this.currentSlider.maxTop,
        this.currentSlider.top + ((e.pageY || this.mousePointer.top) - this.mousePointer.top)
      )
    );

    this.defaultOnMove(top, left);
  }

  /**
   * Function triggered when releasing the click in one of the color adjustment bars.
   *
   * @private
   * @param {Event} e
   */
  released(e) {
    this.colorpicker.lastEvent.alias = "released";
    this.colorpicker.lastEvent.e = e;

    // e.stopPropagation();
    // e.preventDefault();

    off(this.colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker");
    off(this.root.document, "mouseup.colorpicker touchend.colorpicker", this.released);
  }
}
