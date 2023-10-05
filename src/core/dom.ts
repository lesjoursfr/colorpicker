import { ColorItem } from "./color-item.js";

const dataNamespace = "colorpickerData";

type ColorPickerData = {
  [key: string]: string | ColorItem | null;
};

declare global {
  interface Document {
    colorpickerData: ColorPickerData;
  }
  interface HTMLElement {
    colorpickerData: ColorPickerData;
  }
}

/**
 * Convert a dashed string to camelCase
 */
function dashedToCamel(string: string): string {
  return string.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * Create an HTMLElement from the HTML template.
 * @param {string} template the HTML template
 * @returns {HTMLElement} the created HTMLElement
 */
export function createFromTemplate(template: string): HTMLElement {
  const range = document.createRange();
  range.selectNode(document.body);
  return range.createContextualFragment(template).children[0] as HTMLElement;
}

/**
 * Update the given CSS property.
 * If the value is `null` the property will be removed.
 * @param {HTMLElement} node the node to update
 * @param {string|{ [key: string]: string|null }} property multi-word property names are hyphenated (kebab-case) and not camel-cased.
 * @param {string|null} value (default to `null`)
 * @returns {HTMLElement} the element
 */

export function updateCSS(
  node: HTMLElement,
  property: string | { [key: string]: string | null },
  value: string | null = null
): HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node;
  }

  if (typeof property !== "string") {
    for (const [key, val] of Object.entries(property)) {
      val !== null ? node.style.setProperty(key, val) : node.style.removeProperty(key);
    }
  } else {
    value !== null ? node.style.setProperty(property, value) : node.style.removeProperty(property);
  }

  return node;
}

/**
 * Check if the node has the given attribute.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @returns {boolean} true or false
 */
export function hasAttribute(node: HTMLElement, attribute: string): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return node.hasAttribute(attribute);
}

/**
 * Get the given attribute.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @returns {string|null} the value
 */
export function getAttribute(node: HTMLElement, attribute: string): string | null {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  return node.getAttribute(attribute);
}

/**
 * Set the given attribute.
 * If the value is `null` the attribute will be removed.
 * @param {HTMLElement} node
 * @param {string} attribute
 * @param {string|null} value
 * @returns {HTMLElement} the element
 */
export function setAttribute(node: HTMLElement, attribute: string, value: string | null): HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node;
  }

  if (value === null) {
    node.removeAttribute(attribute);
  } else {
    node.setAttribute(attribute, value);
  }

  return node;
}

/**
 * Get the given data.
 * This function does not change the DOM.
 * If there is no key this function return all data
 * @param {HTMLElement} node
 * @param {string|undefined} key
 * @returns {ColorPickerData|string|ColorItem|null} the value
 */
export function getData(node: HTMLElement, key?: string): ColorPickerData | string | ColorItem | null {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  if (node[dataNamespace] === undefined) {
    node[dataNamespace] = {};
    for (const [k, v] of Object.entries(node.dataset)) {
      if (v === undefined) {
        continue;
      }
      node[dataNamespace][dashedToCamel(k)] = v;
    }
  }

  return key === undefined ? node[dataNamespace] : node[dataNamespace][dashedToCamel(key)] ?? null;
}

/**
 * Set the given data.
 * If the value is `null` the data will be removed.
 * This function does not change the DOM.
 * @param {HTMLElement} node
 * @param {string} key
 * @param {string|ColorItem|null} value
 * @returns {HTMLElement} the element
 */
export function setData(node: HTMLElement, key: string, value: string | ColorItem | null): HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node;
  }

  if (node[dataNamespace] === undefined) {
    node[dataNamespace] = {};
  }

  if (value === null) {
    delete node[dataNamespace][dashedToCamel(key)];
  } else {
    node[dataNamespace][dashedToCamel(key)] = value;
  }

  return node;
}

/**
 * Check if the node has the given tag name, or if its tag name is in the given list.
 * @param {HTMLElement} node the element to check
 * @param {string|Array<string>} tags a tag name or a list of tag name
 * @returns {boolean} true if the node has the given tag name
 */
export function hasTagName(node: HTMLElement, tags: string | Array<string>): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (typeof tags === "string") {
    return node.tagName === tags.toUpperCase();
  }

  return tags.some((tag) => node.tagName === tag.toUpperCase());
}

/**
 * Check if the node has the given class name.
 * @param {HTMLElement} node the element to check
 * @param {string} className a class name
 * @returns {boolean} true if the node has the given class name
 */
export function hasClass(node: HTMLElement, className: string): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return node.classList.contains(className);
}

/**
 * Add the class to the node's class attribute.
 * @param {HTMLElement} node
 * @param {string|Array<string>} className
 * @returns {HTMLElement} the element
 */
export function addClass(node: HTMLElement, className: string | Array<string>): HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node;
  }

  if (typeof className === "string") {
    node.classList.add(className);
  } else {
    node.classList.add(...className);
  }

  return node;
}

/**
 * Remove the class from the node's class attribute.
 * @param {HTMLElement} node
 * @param {string|Array<string>} className
 * @returns {HTMLElement} the element
 */
export function removeClass(node: HTMLElement, className: string | Array<string>): HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node;
  }

  if (typeof className === "string") {
    node.classList.remove(className);
  } else {
    node.classList.remove(...className);
  }

  return node;
}

/**
 * Test if the node match the given selector.
 * @param {HTMLElement} node
 * @param {string} selector
 * @returns {boolean} true or false
 */
export function is(node: HTMLElement, selector: string): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return node.matches(selector);
}

/**
 * Get the node's offset.
 * @param {HTMLElement} node
 * @returns {{ top: number, left: number }} The node's offset
 */
export function offset(node: HTMLElement): { top: number; left: number } {
  const rect = node.getBoundingClientRect();
  const win = node.ownerDocument.defaultView!;

  return {
    top: rect.top + win.scrollY,
    left: rect.left + win.scrollX,
  };
}
