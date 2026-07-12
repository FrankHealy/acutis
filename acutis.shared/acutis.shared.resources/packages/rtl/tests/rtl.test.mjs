import test from "node:test";
import assert from "node:assert/strict";
const RTL = new Set(["ar", "fa", "he", "ur"]);
const direction = locale => RTL.has(locale.toLowerCase().split("-")[0]) ? "rtl" : "ltr";
test("representative product locales use the correct direction", () => { assert.equal(direction("ar-IE"), "rtl"); assert.equal(direction("en-IE"), "ltr"); });
