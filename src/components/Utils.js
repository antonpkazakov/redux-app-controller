export default class Utils {
	static error(class_name, error_message) {
		let display_message = 'ReduxAppController SPEAKING. ERROR IN '+class_name+': '+error_message;
		console.error(display_message);
	}
	static fatalError(class_name, error_message) {
		let display_message = 'ReduxAppController SPEAKING. ERROR IN '+class_name+': '+error_message;
		throw new TypeError(display_message);
	}
}