import { Extension, createFromTemplate, updateCSS } from "../core/index.js";

/**
 * Color preview extension
 * @ignore
 */
export class Preview extends Extension {
  constructor(colorpicker, options = {}) {
    super(
      colorpicker,
      Object.assign(
        {},
        structuredClone({
          template: '<div class="colorpicker-bar colorpicker-preview"><div /></div>',
          showText: true,
          format: colorpicker.format,
        }),
        structuredClone(options)
      )
    );

    this.element = createFromTemplate(this.options.template);
    this.elementInner = this.element.querySelector("div");
  }

  onCreate(event) {
    super.onCreate(event);
    this.colorpicker.picker.append(this.element);
  }

  onUpdate(event) {
    super.onUpdate(event);

    if (!event.color) {
      updateCSS(this.elementInner, "backgroundColor", null);
      updateCSS(this.elementInner, "color", null);
      this.elementInner.innerHTML = "";
      return;
    }

    updateCSS(this.elementInner, "backgroundColor", event.color.toRgbString());

    if (this.options.showText) {
      this.elementInner.innerHTML = event.color.string(this.options.format || this.colorpicker.format);

      if (event.color.isDark() && event.color.alpha > 0.5) {
        updateCSS(this.elementInner, "color", "white");
      } else {
        updateCSS(this.elementInner, "color", "black");
      }
    }
  }
}
