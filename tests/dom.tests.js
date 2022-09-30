import test from "ava";
import { JSDOM } from "jsdom";
import {
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

test("core.dom.hasAttribute", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');

  t.true(hasAttribute(dom.window.document.querySelector("p"), "foo"));
});

test("core.dom.getAttribute", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');

  t.is(getAttribute(dom.window.document.querySelector("p"), "foo"), "bar");
});

test("core.dom.setAttribute", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" foo="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p");

  setAttribute(node, "foo", null);
  setAttribute(node, "bar", "foo");

  t.is(node.getAttribute("foo"), null);
  t.is(node.getAttribute("bar"), "foo");
});

test("core.dom.getData", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" data-key="value" data-dashed-key="dashed">Hello world</p>');
  const node = dom.window.document.querySelector("p");
  const data = getData(node);
  const dashed = getData(node, "dashedKey");

  t.is(data.key, "value");
  t.is(data.dashedKey, "dashed");
  t.is(dashed, "dashed");
});

test("core.dom.setData", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar" data-key="value">Hello world</p>');
  const node = dom.window.document.querySelector("p");
  setData(node, "key", "bar");
  setData(node, "foo", "bar");

  t.is(getData(node, "key"), "bar");
  t.is(getData(node, "foo"), "bar");
});

test("core.dom.hasTagName", (t) => {
  const dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");
  const node = dom.window.document.querySelector("p");

  t.false(hasTagName(node, "i"));
  t.false(hasTagName(node, ["i", "u"]));
  t.true(hasTagName(node, "p"));
  t.true(hasTagName(node, ["i", "u", "p"]));
});

test("core.dom.hasClass", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p");

  t.false(hasClass(node, "foo"));
  t.true(hasClass(node, "bar"));
});

test("core.dom.addClass", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');
  const node = dom.window.document.querySelector("p");
  addClass(node, "foo");
  addClass(node, ["abc", "def"]);

  const classList = node.classList;
  t.true(["bar", "foo", "abc", "def"].every((className) => classList.contains(className)));
});

test("core.dom.removeClass", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar foo abc def">Hello world</p>');
  const node = dom.window.document.querySelector("p");
  removeClass(node, "foo");
  removeClass(node, ["abc", "def"]);

  const classList = node.classList;
  t.false(["foo", "abc", "def"].some((className) => classList.contains(className)));
});

test("core.dom.is", (t) => {
  const dom = new JSDOM('<!DOCTYPE html><p class="bar">Hello world</p>');

  t.true(is(dom.window.document.querySelector("p"), "p.bar"));
});
