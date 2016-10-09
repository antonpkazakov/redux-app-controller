export default class ReduxAppControllerComponent {
	constructor() {
		this.controller = null;

		this.init = this.init.bind(this);

		this.init();
	}
	/**
	 * Controller component initialization.
	 */
	init() {
	}
	/**
	 * Sets the parent controller into this controller component.
	 * @param {ReduxAppController} controller
	 * @returns {ReduxAppControllerComponent}
	 */
	setController(controller) {
		this.controller = controller;
		return this;
	}
	/**
	 * Returns the parent controller.
	 * @returns {ReduxAppController}
	 */
	getController() {
		return this.controller;
	}
	/**
	 * Returns the list of app actions handled by this controller component.
	 * During the controller compilation these actions will be added into the parent controller.
	 * @returns {string[]}
	 */
	getActionTypes() {
		return [];
	}
	/**
	 * Returns the list of actions required to be handled by one of the parent controller components
	 * or by the parent controller itself to make this controller component work. In case any of these actions
	 * isn't available to be handled the parent controller will throw an error.
	 * @returns {string[]}
	 */
	getRequiredActionTypes() {
		return [];
	}
	
	/**
	 * Returns the app's store.
	 * @returns Object
	 */
	getStore() {
		return this.getController().getStore();
	}

	/**
	 * Returns the app's state.
	 * @returns Object
	 */
	getState() {
		return this.getController().getState();
	}
	/**
	 * Returns the cloned state object.
	 * @param state State object to be cloned.
	 * @returns Object
	 */
	cloneState(state) {
		return this.getController().cloneState(state);
	}

	/**
	 * Returns the app's router.
	 * @returns Object
	 */
	getRouter() {
		return this.getController().getRouter();
	}
}