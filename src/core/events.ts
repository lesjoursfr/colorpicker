import { Colorpicker } from "../index.js";
import { ColorItem } from "./color-item.js";

const eventsNamespace = "colorpickerEvents";
let eventsGuid = 0;

type ColorPickerEventExtra = { [key: string]: unknown };

type ColorPickerEvent = { type: string; ns: Array<string> | null; handler: EventListenerOrEventListenerObject };

type ColorPickerEvents = {
  [key: string]: ColorPickerEvent;
};

declare global {
  interface Window {
    colorpickerEvents: ColorPickerEvents;
  }
  interface Document {
    colorpickerEvents: ColorPickerEvents;
  }
  interface HTMLElement {
    colorpickerEvents: ColorPickerEvents;
  }
}

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

/**
 * Parse an event type to separate the type & the namespace
 * @param {string} string
 */
function parseEventType(string: string): Omit<ColorPickerEvent, "handler"> {
  const [type, ...nsArray] = string.split(".");
  return {
    type,
    ns: nsArray ?? null,
  };
}

/**
 * Set an event listener on the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} events
 * @param {Function} handler
 */
function addEventListener(
  node: Window | Document | HTMLElement,
  events: string,
  handler: EventListenerOrEventListenerObject
): void {
  if (!(node instanceof EventTarget)) {
    return;
  }

  if (node[eventsNamespace] === undefined) {
    node[eventsNamespace] = {};
  }

  for (const event of events.split(" ")) {
    const { type, ns } = parseEventType(event);
    const handlerGuid = (++eventsGuid).toString(10);
    node.addEventListener(type, handler);
    node[eventsNamespace][handlerGuid] = { type, ns, handler };
  }
}

/**
 * Remove event listeners from the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
function removeEventListener(
  node: Window | Document | HTMLElement,
  events: string,
  handler?: EventListenerOrEventListenerObject
): void {
  if (!(node instanceof EventTarget)) {
    return;
  }

  if (node[eventsNamespace] === undefined) {
    node[eventsNamespace] = {};
  }

  for (const event of events.split(" ")) {
    const { type, ns } = parseEventType(event);

    for (const [guid, handlerObj] of Object.entries(node[eventsNamespace])) {
      if (handlerObj.type !== type && type !== "*") {
        continue;
      }

      if (
        (ns === null || handlerObj.ns?.includes(ns[0])) &&
        (handler === undefined || (typeof handler === "function" && handler === handlerObj.handler))
      ) {
        delete node[eventsNamespace][guid];
        node.removeEventListener(handlerObj.type, handlerObj.handler);
      }
    }
  }
}

/**
 * Set an event listener on every node.
 * @param {Window|Document|HTMLElement|NodeList} nodes
 * @param {string} events
 * @param {Function} handler
 */
export function on(
  nodes: Window | Document | HTMLElement | NodeListOf<HTMLElement>,
  events: string,
  handler: EventListenerOrEventListenerObject
): void {
  if (nodes instanceof NodeList) {
    for (const node of nodes) {
      addEventListener(node, events, handler);
    }
  } else {
    addEventListener(nodes, events, handler);
  }
}

/**
 * Remove event listeners from the node.
 * @param {Window|Document|HTMLElement|NodeList} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
export function off(
  nodes: Window | Document | HTMLElement | NodeListOf<HTMLElement>,
  events: string,
  handler?: EventListenerOrEventListenerObject
): void {
  if (nodes instanceof NodeList) {
    for (const node of nodes) {
      removeEventListener(node, events, handler);
    }
  } else {
    removeEventListener(nodes, events, handler);
  }
}

/**
 * Trigger the ColorpickerEvent on the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} event
 * @param {Colorpicker} colorpicker
 * @param {ColorItem|null} color
 * @param {string|null} value
 * @param {ColorPickerEventExtra|undefined} extras
 */
export function trigger(
  node: Window | Document | HTMLElement,
  event: string,
  colorpicker: Colorpicker,
  color: ColorItem | null,
  value: string | null,
  extras?: ColorPickerEventExtra
): void {
  if (!(node instanceof EventTarget)) {
    return;
  }

  node.dispatchEvent(new ColorpickerEvent(event, colorpicker, color, value, extras));
}

export function isTouchEvent(e: Event): e is TouchEvent {
  return window.TouchEvent && e instanceof TouchEvent;
}
