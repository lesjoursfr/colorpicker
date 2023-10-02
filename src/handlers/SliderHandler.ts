import { is, offset, on, off, ColorItem, isTouchEvent } from "../core/index";
import { Colorpicker } from "../colorpicker";
import { SlidersAlphaOption, SlidersHueOption, SlidersOptions, SlidersSaturationOption } from "../colorpicker-options";

type Slider = (SlidersSaturationOption | SlidersHueOption | SlidersAlphaOption) & {
  guideStyle: CSSStyleDeclaration;
  left: number;
  top: number;
};

type MousePointer = { left: number; top: number };

function isAlphaSlider(
  slider: SlidersSaturationOption | SlidersHueOption | SlidersAlphaOption
): slider is SlidersAlphaOption {
  return (slider as SlidersAlphaOption).childSelector !== undefined;
}

/**
 * Class that handles all configured sliders on mouse or touch events.
 */
export class SliderHandler {
  /**
   * @type {Window}
   */
  private _root: Window;
  /**
   * @type {Colorpicker}
   */
  private _colorpicker: Colorpicker;
  private _currentSlider: Slider | null;
  private _mousePointer: MousePointer;

  /**
   * @param {Colorpicker} colorpicker
   */
  constructor(colorpicker: Colorpicker, root: Window) {
    this.pressed = this.pressed.bind(this);
    this.moved = this.moved.bind(this);
    this.released = this.released.bind(this);

    this._root = root;
    this._colorpicker = colorpicker;
    this._currentSlider = null;
    this._mousePointer = {
      left: 0,
      top: 0,
    };
  }

  /**
   * This function is called every time a slider guide is moved
   * The scope of "this" is the SliderHandler object.
   * @param {int} top
   * @param {int} left
   */
  public defaultOnMove(top: number, left: number): void {
    if (!this._currentSlider) {
      return;
    }

    const slider = this._currentSlider;
    const cp = this._colorpicker;
    const ch = cp.colorHandler;

    // Create a color object
    const color = !ch.hasColor() ? ch.getFallbackColor() : (ch.color as ColorItem).getClone();

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
  public bind(): void {
    const sliders = this._colorpicker.options.horizontal
      ? this._colorpicker.options.slidersHorz
      : this._colorpicker.options.sliders;

    const sliderClasses = [];

    for (const sliderName in sliders) {
      if (!Object.hasOwn(sliders, sliderName)) {
        continue;
      }

      sliderClasses.push(sliders[sliderName as keyof SlidersOptions].selector);
    }

    on(
      this._colorpicker.picker.querySelectorAll(sliderClasses.join(", ")),
      "mousedown.colorpicker touchstart.colorpicker",
      this.pressed as EventListener
    );
  }

  /**
   * Unbinds any event bound by this handler
   */
  public unbind(): void {
    off(this._colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker");
    off(this._colorpicker.picker, "mouseup.colorpicker touchend.colorpicker");
  }

  /**
   * Function triggered when clicking in one of the color adjustment bars
   * @fires Colorpicker#mousemove
   * @param {MouseEvent|TouchEvent} e
   */
  public pressed(e: MouseEvent | TouchEvent): void {
    if (this._colorpicker.isDisabled()) {
      return;
    }
    this._colorpicker.lastEvent.alias = "pressed";
    this._colorpicker.lastEvent.e = e;

    const pageX = isTouchEvent(e) ? e.touches[0].pageX : e.pageX;
    const pageY = isTouchEvent(e) ? e.touches[0].pageY : e.pageY;

    // e.stopPropagation();
    // e.preventDefault();

    const target = e.target as HTMLElement;

    // detect the slider and set the limits and callbacks
    let zone = target.closest<HTMLElement>("div");
    if (zone === null) {
      return;
    }

    const sliders = this._colorpicker.options.horizontal
      ? this._colorpicker.options.slidersHorz
      : this._colorpicker.options.sliders;

    if (is(zone, ".colorpicker")) {
      return;
    }

    this._currentSlider = null;

    let foundSlider: Omit<Slider, "guideStyle" | "left" | "top"> | null = null;
    for (const sliderName in sliders) {
      if (!Object.hasOwn(sliders, sliderName)) {
        continue;
      }

      const slider = sliders[sliderName as keyof SlidersOptions];

      if (is(zone, slider.selector)) {
        foundSlider = Object.assign({}, structuredClone(slider), { name: sliderName });
        break;
      } else if (isAlphaSlider(slider) && is(zone, slider.childSelector)) {
        foundSlider = Object.assign({}, structuredClone(slider), { name: sliderName });
        zone = zone.parentNode as HTMLElement; // zone.parents(slider.selector).first() ?
        break;
      }
    }

    const guide = zone.querySelector<HTMLElement>(".colorpicker-guide");

    if (foundSlider === null || guide === null) {
      return;
    }

    const zoneOffset = offset(zone);

    // reference to guide's style
    this._currentSlider = {
      ...foundSlider,
      guideStyle: guide.style,
      left: pageX - zoneOffset.left,
      top: pageY - zoneOffset.top,
    };
    this._mousePointer = {
      left: pageX,
      top: pageY,
    };

    // TODO: fix moving outside the picker makes the guides to keep moving. The event needs to be bound to the window.
    /**
     * (window.document) Triggered on mousedown for the document object,
     * so the color adjustment guide is moved to the clicked position.
     * @event Colorpicker#mousemove
     */
    on(this._colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker", this.moved as EventListener);
    on(this._root.document, "mouseup.colorpicker touchend.colorpicker", this.released as EventListener);

    this._colorpicker.picker.dispatchEvent(new MouseEvent("mousemove"));
  }

  /**
   * Function triggered when dragging a guide inside one of the color adjustment bars.
   * @param {MouseEvent|TouchEvent} e
   */
  public moved(e: MouseEvent | TouchEvent): void {
    this._colorpicker.lastEvent.alias = "moved";
    this._colorpicker.lastEvent.e = e;

    if (this._currentSlider === null) {
      return;
    }

    const pageX = isTouchEvent(e) ? e.touches[0].pageX : e.pageX;
    const pageY = isTouchEvent(e) ? e.touches[0].pageY : e.pageY;

    // e.stopPropagation();
    e.preventDefault(); // prevents scrolling on mobile

    const left = Math.max(
      0,
      Math.min(
        this._currentSlider.maxLeft,
        this._currentSlider.left + ((pageX || this._mousePointer.left) - this._mousePointer.left)
      )
    );

    const top = Math.max(
      0,
      Math.min(
        this._currentSlider.maxTop,
        this._currentSlider.top + ((pageY || this._mousePointer.top) - this._mousePointer.top)
      )
    );

    this.defaultOnMove(top, left);
  }

  /**
   * Function triggered when releasing the click in one of the color adjustment bars.
   * @param {MouseEvent|TouchEvent} e
   */
  public released(e: MouseEvent | TouchEvent): void {
    this._colorpicker.lastEvent.alias = "released";
    this._colorpicker.lastEvent.e = e;

    // e.stopPropagation();
    // e.preventDefault();

    off(this._colorpicker.picker, "mousemove.colorpicker touchmove.colorpicker");
    off(this._root.document, "mouseup.colorpicker touchend.colorpicker", this.released as EventListener);
  }
}
