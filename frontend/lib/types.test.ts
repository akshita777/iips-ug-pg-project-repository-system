import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "./types";

describe("apiErrorMessage", () => {
  it("uses server message when present", () => {
    const err = { response: { data: { message: "Only owning student can upload" } } };
    expect(apiErrorMessage(err, "fallback")).toBe("Only owning student can upload");
  });

  it("falls back when shape is unknown", () => {
    expect(apiErrorMessage(null, "fallback")).toBe("fallback");
    expect(apiErrorMessage({ message: "plain" }, "fallback")).toBe("plain");
  });
});
