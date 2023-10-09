import assert from "assert";
import { JSDOM } from "jsdom";
import {
  createFromTemplate,
  updateCSS,
  hasAttribute,
  getAttribute,
  setAttribute,
  getData,
  setData,
  hasTagName,
  hasClass,
  addClass,
  removeClass,
  is,
} from "../src/core/dom.js";

it("core.dom.createFromTemplate", () => {
  const template = '<p class="bar" foo="bar">Hello world</p>';
  const node = createFromTemplate(template);

  assert.strictEqual(node.outerHTML, template);
});

it("core.dom.updateCSS", () => {
  const dom = new JSDOM("<!DOCTYPE html><div></div>");
  const node = dom.window.document.querySelector("div")!;

  updateCSS(node, "color", "red");
  updateCSS(node, "font-size", "20px");
  updateCSS(node, { top: "10px", "background-color": "blue", "text-align": "center" });

  assert.strictEqual(node.style.color, "red");
  assert.strictEqual(node.style.fontSize, "20px");
  assert.strictEqual(node.style.top, "10px");
  assert.strictEqual(node.style.backgroundColor, "blue");
  assert.strictEqual(node.style.textAlign, "center");

  updateCSS(node, "color", "blue");
  updateCSS(node, "font-size", "30px");
  updateCSS(node, { top: "20px", "background-color": "red", "text-align": "left" });

  assert.strictEqual(node.style.color, "blue");
  assert.strictEqual(node.style.fontSize, "30px");
  assert.strictEqual(node.style.top, "20px");
  assert.strictEqual(node.style.backgroundColor, "red");
  assert.strictEqual(node.style.textAlign, "left");

  updateCSS(node, "color", null);
  updateCSS(node, "font-size", null);
  updateCSS(node, { top: null, "background-color": null, "text-align": null });

  assert.strictEqual(node.style.color, "");
  assert.strictEqual(node.style.fontSize, "");
  assert.strictEqual(node.style.top, "");
  assert.strictEqual(node.style.backgroundColor, "");
  assert.strictEqual(node.style.textAlign, "");
});

it("core.dom.hasAttribute", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;

  assert.strictEqual(hasAttribute(node, "foo"), true);
});

it("core.dom.getAttribute", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;

  assert.strictEqual(getAttribute(node, "foo"), "bar");
});

it("core.dom.setAttribute", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;

  setAttribute(node, "foo", null);
  setAttribute(node, "bar", "foo");

  assert.strictEqual(node.getAttribute("foo"), null);
  assert.strictEqual(node.getAttribute("bar"), "foo");
});

it("core.dom.getData", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" data-key="value" data-dashed-key="dashed">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = getData(node) as any;
  const dashed = getData(node, "dashedKey");

  assert.strictEqual(data.key, "value");
  assert.strictEqual(data.dashedKey, "dashed");
  assert.strictEqual(dashed, "dashed");
});

it("core.dom.setData", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" data-key="value">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;
  setData(node, "key", "bar");
  setData(node, "foo", "bar");

  assert.strictEqual(getData(node, "key"), "bar");
  assert.strictEqual(getData(node, "foo"), "bar");
});

it("core.dom.hasTagName", () => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");
  const node = dom.window.document.querySelector("p")!;

  assert.strictEqual(hasTagName(node, "i"), false);
  assert.strictEqual(hasTagName(node, ["i", "u"]), false);
  assert.strictEqual(hasTagName(node, "p"), true);
  assert.strictEqual(hasTagName(node, ["i", "u", "p"]), true);
});

it("core.dom.hasClass", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;

  assert.strictEqual(hasClass(node, "foo"), false);
  assert.strictEqual(hasClass(node, "bar"), true);
});

it("core.dom.addClass", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;
  addClass(node, "foo");
  addClass(node, ["abc", "def"]);

  const classList = node.classList;
  assert.strictEqual(
    ["bar", "foo", "abc", "def"].every((className) => classList.contains(className)),
    true
  );
});

it("core.dom.removeClass", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar foo abc def">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;
  removeClass(node, "foo");
  removeClass(node, ["abc", "def"]);

  const classList = node.classList;
  assert.strictEqual(
    ["foo", "abc", "def"].some((className) => classList.contains(className)),
    false
  );
});

it("core.dom.is", () => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p")!;

  assert.strictEqual(is(node, "p.bar"), true);
});
