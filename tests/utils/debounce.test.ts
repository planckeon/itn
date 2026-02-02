import { describe, expect, it, vi } from "vitest";
import { debounce } from "../../src/utils/debounce";

describe("debounce", () => {
	it("should delay function execution by specified time", async () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		expect(mockFn).not.toHaveBeenCalled();

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(mockFn).not.toHaveBeenCalled();

		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it("should only execute once for multiple rapid calls", async () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 100);

		debouncedFn();
		debouncedFn();
		debouncedFn();

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it("should preserve function context and arguments", async () => {
		const mockFn = vi.fn();
		const context = { value: 42 };
		const debouncedFn = debounce(mockFn, 50);

		debouncedFn.call(context, "arg1", "arg2");

		await new Promise((resolve) => setTimeout(resolve, 60));

		expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
		expect(mockFn.mock.instances[0]).toBe(context);
	});

	it("should handle different delay values", async () => {
		const mockFn = vi.fn();
		const debouncedFn = debounce(mockFn, 200);

		debouncedFn();
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(mockFn).not.toHaveBeenCalled();

		await new Promise((resolve) => setTimeout(resolve, 110));
		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});
