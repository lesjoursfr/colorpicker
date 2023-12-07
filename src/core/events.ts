import { Colorpicker } from "../index.js";
import { ColorItem } from "./color-item.js";

type ColorPickerEventExtra = { [key: string]: unknown };

export class ColorpickerEvent extends Event {
  public colorpicker: Colorpicker;
  public color: ColorItem | null;
  public value: string | null;
  public extras: ColorPickerEventExtra;

  constructor(
    event: string,
    colorpicker: Colorpicker,
    color: ColorItem | null,
    value: string | null,
    extras?: ColorPickerEventExtra
  ) {
    super(event);
    this.colorpicker = colorpicker;
    this.color = color;
    this.value = value;

    this.extras = {};
    if (extras !== undefined) {
      for (const [k, v] of Object.entries(extras)) {
        if (!["type", "type", "type", "type"].includes(k)) {
          this.extras[k] = v;
        }
      }
    }
  }
}
