/**
 * Debounce utility function for the neutrino oscillation visualization.
 * This helps prevent excessive recalculations when UI inputs change rapidly.
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after 'delay' milliseconds have elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the provided function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: number | undefined;

	return function (this: any, ...args: Parameters<T>): void {
		const context = this;

		clearTimeout(timeoutId);

		timeoutId = window.setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}
