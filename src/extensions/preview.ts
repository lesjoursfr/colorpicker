import { ColorpickerEvent, Extension, createFromTemplate, updateCSS } from "../core/index";
import { Colorpicker } from "../colorpicker";

export type PreviewOptions = {
  template: string;
  showText: boolean;
  format: string;
};

/**
 * Color preview extension
 */
export class Preview extends Extension<PreviewOptions> {
  private _element: HTMLElement;
  private _elementInner: HTMLElement;

  constructor(colorpicker: Colorpicker, options: Partial<PreviewOptions> = {}) {
    super(
      colorpicker,
      Object.assign(
        {},
        structuredClone({
          template: '<div class="colorpicker-bar colorpicker-preview"><div></div></div>',
          showText: true,
          format: colorpicker.format,
        }),
        structuredClone(options)
      )
    );

    this._element = createFromTemplate(this._options.template);
    this._elementInner = this._element.querySelector("div")!;
  }

  public onCreate(event: ColorpickerEvent): void {
    super.onCreate(event);
    this._colorpicker.picker.append(this._element);
  }

  public onUpdate(event: ColorpickerEvent): void {
    super.onUpdate(event);

    if (!event.color) {
      updateCSS(this._elementInner, "background-color", null);
      updateCSS(this._elementInner, "color", null);
      this._elementInner.innerHTML = "";
      return;
    }

    updateCSS(this._elementInner, "background-color", event.color.toRgbString());

    if (this._options.showText) {
      this._elementInner.innerHTML = event.color.string(this._options.format || this._colorpicker.format);

      if (event.color.isDark() && event.color.alpha > 0.5) {
        updateCSS(this._elementInner, "color", "white");
      } else {
        updateCSS(this._elementInner, "color", "black");
      }
    }
  }
}
