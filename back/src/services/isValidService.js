export function isInvalid(...args) {
	return args.some(arg => arg === undefined || arg === null);
}
