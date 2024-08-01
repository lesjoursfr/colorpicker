import { createFromTemplate, getAttribute, on, setAttribute, updateCSS } from "@lesjoursfr/browser-tools";
import { ColorpickerEvent } from "../core/index.js";
import { Colorpicker } from "../index.js";
import { Palette, PaletteOptions } from "./palette.js";

export type SwatchesOptions = PaletteOptions & { barTemplate: string; swatchTemplate: string };

const defaults = {
  barTemplate: `<div class="colorpicker-bar colorpicker-swatches">
                    <div class="colorpicker-swatches-inner"></div>
                </div>`,
  swatchTemplate: '<i class="colorpicker-swatch"><i class="colorpicker-swatch-inner"></i></i>',
};

/**
 * Color swatches extension
 */
export class Swatches extends Palette<SwatchesOptions> {
  private _element: HTMLElement | null;

  constructor(colorpicker: Colorpicker, options: Partial<SwatchesOptions> = {}) {
    super(colorpicker, Object.assign({}, structuredClone(defaults), structuredClone(options)));
    this._element = null;
  }

  public isEnabled(): boolean {
    return this.getLength() > 0;
  }

  public onCreate(event: ColorpickerEvent): void {
    super.onCreate(event);

    if (!this.isEnabled()) {
      return;
    }

    this._element = createFromTemplate(this._options.barTemplate);

    const swatchContainer = this._element.querySelector<HTMLElement>(".colorpicker-swatches-inner");
    const isAliased = this._options.namesAsValues === true && !Array.isArray(this.colors);

    if (swatchContainer === null) {
      throw new Error("Missing .colorpicker-swatches-inner element !");
    }

    swatchContainer.replaceChildren();

    for (const [name, value] of Object.entries(this.colors ?? {})) {
      const swatch = createFromTemplate(this._options.swatchTemplate);
      setAttribute(swatch, "data-name", name);
      setAttribute(swatch, "data-value", value);
      setAttribute(swatch, "title", isAliased ? `${name}: ${value}` : value);
      on(swatch, "mousedown.colorpicker touchstart.colorpicker", ((e: MouseEvent | TouchEvent) => {
        this._colorpicker.setValue(
          getAttribute(e.currentTarget as HTMLElement, isAliased ? "data-name" : "data-value")!
        );
      }) as EventListener);

      for (const swatchInner of swatch.querySelectorAll<HTMLElement>(".colorpicker-swatch-inner")) {
        updateCSS(swatchInner, "background-color", value);
      }

      swatchContainer.append(swatch);
    }

    swatchContainer.append(createFromTemplate('<i class="colorpicker-clear"></i>'));

    this._colorpicker.picker.append(this._element);
  }
}
