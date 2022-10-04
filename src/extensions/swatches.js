import { createFromTemplate, getAttribute, setAttribute, updateCSS, on } from "../core/index.js";
import { Palette } from "./palette.js";

const defaults = {
  barTemplate: `<div class="colorpicker-bar colorpicker-swatches">
                    <div class="colorpicker-swatches--inner"></div>
                </div>`,
  swatchTemplate: '<i class="colorpicker-swatch"><i class="colorpicker-swatch--inner"></i></i>',
};

/**
 * Color swatches extension
 * @ignore
 */
export class Swatches extends Palette {
  constructor(colorpicker, options = {}) {
    super(colorpicker, Object.assign({}, structuredClone(defaults), structuredClone(options)));
    this.element = null;
  }

  isEnabled() {
    return this.getLength() > 0;
  }

  onCreate(event) {
    super.onCreate(event);

    if (!this.isEnabled()) {
      return;
    }

    this.element = createFromTemplate(this.options.barTemplate);
    this.load();
    this.colorpicker.picker.append(this.element);
  }

  load() {
    const colorpicker = this.colorpicker;
    const swatchContainer = this.element.querySelector(".colorpicker-swatches--inner");
    const isAliased = this.options.namesAsValues === true && !Array.isArray(this.colors);

    swatchContainer.replaceChildren();

    for (const [name, value] of Object.entries(this.colors)) {
      const swatch = createFromTemplate(this.options.swatchTemplate);
      setAttribute(swatch, "data-name", name);
      setAttribute(swatch, "data-value", value);
      setAttribute(swatch, "title", isAliased ? `${name}: ${value}` : value);
      on(swatch, "mousedown.colorpicker touchstart.colorpicker", (e) => {
        colorpicker.setValue(getAttribute(e.currentTarget, isAliased ? "data-name" : "data-value"));
      });

      for (const swatchInner of swatch.querySelectorAll(".colorpicker-swatch--inner")) {
        updateCSS(swatchInner, "background-color", value);
      }

      swatchContainer.append(swatch);
    }

    swatchContainer.append(createFromTemplate('<i class="colorpicker-clear"></i>'));
  }
}
