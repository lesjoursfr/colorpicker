const eventsNamespace = "colorpickerEvents";
let eventsGuid = 0;

class ColorpickerEvent extends Event {
  constructor(event, colorpicker, color, value, extras) {
    super(event);
    this.colorpicker = colorpicker;
    this.color = color;
    this.value = value;

    if (typeof extras === "object") {
      for (const [k, v] of Object.entries(extras)) {
        if (!["type", "type", "type", "type"].includes(k)) {
          this[k] = v;
        }
      }
    }
  }
}

/**
 * Parse an event type to separate the type & the namespace
 * @param {string} string
 */
function parseEventType(string) {
  const [type, ...nsArray] = string.split(".");
  return {
    type,
    ns: nsArray ?? null,
  };
}

/**
 * Set an event listener on the node.
 * @param {HTMLElement} node
 * @param {string} events
 * @param {Function} handler
 */
function addEventListener(node, events, handler) {
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
 * @param {HTMLElement} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
function removeEventListener(node, events, handler) {
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
        (ns === null || handlerObj.ns.includes(ns[0])) &&
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
 * @param {HTMLElement|NodeList} nodes
 * @param {string} events
 * @param {Function} handler
 */
export function on(nodes, events, handler) {
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
 * @param {HTMLElement|NodeList} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
export function off(nodes, events, handler) {
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
 * @param {HTMLElement} node
 * @param {string} event
 * @param {Colorpicker} colorpicker
 * @param {Color|null} color
 * @param {string|null} value
 * @param extras
 */
export function trigger(node, event, colorpicker, color, value, extras) {
  if (!(node instanceof EventTarget)) {
    return;
  }

  node.dispatchEvent(new ColorpickerEvent(event, colorpicker, color, value, extras));
}
