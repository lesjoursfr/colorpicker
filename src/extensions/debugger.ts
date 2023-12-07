import { off, on, trigger } from "@lesjoursfr/browser-tools";
import { ColorpickerEvent, Extension } from "../core/index.js";
import { Colorpicker } from "../index.js";

/**
 * Debugger extension class
 * @alias DebuggerExtension
 */
export class Debugger extends Extension {
  /**
   * @type {number}
   */
  private _eventCounter: number;

  constructor(colorpicker: Colorpicker) {
    super(colorpicker, undefined);
    this.onChangeInput = this.onChangeInput.bind(this);
    this._eventCounter = 0;

    if (this._colorpicker.inputHandler.hasInput()) {
      on(this._colorpicker.inputHandler.input, "change.colorpicker-ext", this.onChangeInput as EventListener);
    }
  }

  public get alpha(): number {
    return this._eventCounter;
  }

  /**
   * @fires DebuggerExtension#colorpickerDebug
   * @param {string} eventName
   * @param {unknown[]} args
   */
  public log(eventName: string, ...args: unknown[]) {
    this._eventCounter += 1;

    const logMessage = `#${this._eventCounter}: Colorpicker#${this._colorpicker.id} [${eventName}]`;

    console.debug(logMessage, ...args);

    /**
     * Whenever the debugger logs an event, this other event is emitted.
     * @event DebuggerExtension#colorpickerDebug
     * @type {object} The event object
     * @property {Colorpicker} colorpicker The Colorpicker instance
     * @property {ColorItem} color The color instance
     * @property {{debugger: DebuggerExtension, eventName: String, logArgs: Array, logMessage: String}} debug
     *  The debug info
     */
    trigger(
      this._colorpicker.element,
      new ColorpickerEvent("colorpickerDebug", this._colorpicker, null, null, {
        debug: {
          debugger: this,
          eventName: eventName,
          logArgs: args,
          logMessage: logMessage,
        },
      })
    );
  }

  public resolveColor(color: string, realColor: boolean = true): string | false {
    this.log("resolveColor()", color, realColor);
    return false;
  }

  public onCreate(event: ColorpickerEvent): void {
    this.log("colorpickerCreate");
    return super.onCreate(event);
  }

  public onDestroy(event: ColorpickerEvent): void {
    this.log("colorpickerDestroy");
    this._eventCounter = 0;

    if (this._colorpicker.inputHandler.hasInput()) {
      off(this._colorpicker.inputHandler.input, "*.colorpicker-ext");
    }

    return super.onDestroy(event);
  }

  public onUpdate(): void {
    this.log("colorpickerUpdate");
  }

  public onChangeInput(event: ColorpickerEvent): void {
    this.log("input:change.colorpicker", event.value, event.color);
  }

  public onChange(event: ColorpickerEvent): void {
    this.log("colorpickerChange", event.value, event.color);
  }

  public onInvalid(event: ColorpickerEvent): void {
    this.log("colorpickerInvalid", event.value, event.color);
  }

  public onHide(): void {
    this.log("colorpickerHide");
    this._eventCounter = 0;
  }

  public onShow(): void {
    this.log("colorpickerShow");
  }

  public onDisable(): void {
    this.log("colorpickerDisable");
  }

  public onEnable(): void {
    this.log("colorpickerEnable");
  }
}
