import { parseArguments } from "./message-parser";

it("parses simple message", () => {
  expect(parseArguments("I like chicken")).toEqual(["I", "like", "chicken"]);
});

it("parses message with double quotes", () => {
  expect(parseArguments('I "like chicken"')).toEqual(["I", "like chicken"]);
});