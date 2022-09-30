import { Extension, on, off, trigger } from "../core/index.js";

/**
 * Debugger extension class
 * @alias DebuggerExtension
 * @ignore
 */
export class Debugger extends Extension {
  constructor(colorpicker, options = {}) {
    super(colorpicker, options);
    this.onChangeInput = this.onChangeInput.bind(this);

    /**
     * @type {number}
     */
    this.eventCounter = 0;
    if (this.colorpicker.inputHandler.hasInput()) {
      on(this.colorpicker.inputHandler.input, "change.colorpicker-ext", this.onChangeInput);
    }
  }

  /**
   * @fires DebuggerExtension#colorpickerDebug
   * @param {string} eventName
   * @param {*} args
   */
  log(eventName, ...args) {
    this.eventCounter += 1;

    const logMessage = `#${this.eventCounter}: Colorpicker#${this.colorpicker.id} [${eventName}]`;

    console.debug(logMessage, ...args);

    /**
     * Whenever the debugger logs an event, this other event is emitted.
     *
     * @event DebuggerExtension#colorpickerDebug
     * @type {object} The event object
     * @property {Colorpicker} colorpicker The Colorpicker instance
     * @property {ColorItem} color The color instance
     * @property {{debugger: DebuggerExtension, eventName: String, logArgs: Array, logMessage: String}} debug
     *  The debug info
     */
    trigger(this.colorpicker.element, "colorpickerDebug", this.colorpicker, this.color, null, {
      debug: {
        debugger: this,
        eventName,
        logArgs: args,
        logMessage,
      },
    });
  }

  resolveColor(color, realColor = true) {
    this.log("resolveColor()", color, realColor);
    return false;
  }

  onCreate(event) {
    this.log("colorpickerCreate");
    return super.onCreate(event);
  }

  onDestroy(event) {
    this.log("colorpickerDestroy");
    this.eventCounter = 0;

    if (this.colorpicker.inputHandler.hasInput()) {
      off(this.colorpicker.inputHandler.input, "*.colorpicker-ext");
    }

    return super.onDestroy(event);
  }

  onUpdate(event) {
    this.log("colorpickerUpdate");
  }

  /**
   * @listens Colorpicker#change
   * @param {Event} event
   */
  onChangeInput(event) {
    this.log("input:change.colorpicker", event.value, event.color);
  }

  onChange(event) {
    this.log("colorpickerChange", event.value, event.color);
  }

  onInvalid(event) {
    this.log("colorpickerInvalid", event.value, event.color);
  }

  onHide(event) {
    this.log("colorpickerHide");
    this.eventCounter = 0;
  }

  onShow(event) {
    this.log("colorpickerShow");
  }

  onDisable(event) {
    this.log("colorpickerDisable");
  }

  onEnable(event) {
    this.log("colorpickerEnable");
  }
}
