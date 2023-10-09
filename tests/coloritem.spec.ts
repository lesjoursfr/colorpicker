import assert from "assert";
import { ColorItem } from "../src/core/color-item.js";

describe("string()", function () {
  const tests = [
    // hex
    { value: "#5367ce", expectedValue: "#5367CE", format: "hex" },
    { value: "#5367ce55", expectedValue: "#5367CE", format: "hex" },
    { value: "invalid", expectedValue: "#000000", format: "hex" },
    { value: "rgb(83, 103, 206)", expectedValue: "#5367CE", format: "hex" },
    // rgb
    { value: "#5367ce", expectedValue: "rgb(83, 103, 206)", format: "rgb" },
    { value: "#5367ce55", expectedValue: "rgba(83, 103, 206, 0.3333333333333333)", format: "rgb" },
    { value: "invalid", expectedValue: "rgb(0, 0, 0)", format: "rgb" },
    { value: "rgb(83, 103, 206)", expectedValue: "rgb(83, 103, 206)", format: "rgb" },
  ];

  tests.forEach(({ value, expectedValue, format }) => {
    it(`ColorItem("${value}").string("${format}") expects "${expectedValue}"`, function () {
      assert.strictEqual(new ColorItem(value).string(format), expectedValue);
    });
  });
});
