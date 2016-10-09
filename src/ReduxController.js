import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import _ from 'lodash';
import {ReduxControllerComponent} from './ReduxControllerComponent';
import {ReduxControllerRouter} from './ReduxControllerRouter';
import {Utils} from './Utils';

const THROW_METHOD_PREFIX = 'throw';
const HANDLE_METHOD_PREFIX = 'handle';
const REDUCE_METHOD_PREFIX = 'reduceOn';

export default class ReduxController {
	constructor() {
		//super();
		/**
		if (new.target === ReduxController) {
			throw new TypeError("You must not construct ReduxController instances directly.");
		}
		*/
		if (this.getStateInitialData === undefined) {
			Utils.fatalError('ReduxController', "You must override method getStateInitialData() in a child of ReduxController.");
		}
		if (this.render === undefined) {
			Utils.fatalError('ReduxController', "You must implement method render() in a child of ReduxController.");
		}

		this.store = {};
		this.router = undefined;
		this.router_routes = undefined;
		this._action_types = [];

		this.initProperties();

		this._joinControllerComponent = this._joinControllerComponent.bind(this);
		this._joinComponents = this._joinComponents.bind(this);

		this.init();

		this.render = this.render.bind(this);
		this.init = this.init.bind(this);
		this.getActionTypes = this.getActionTypes.bind(this);
		this.getControllerComponents = this.getControllerComponents.bind(this);
		this.getControllerComponent = this.getControllerComponent.bind(this);
		this._getRootReducer = this._getRootReducer.bind(this);
		this._createThrowActionMethod = this._createThrowActionMethod.bind(this);
		this._processThrowActionMethod = this._processThrowActionMethod.bind(this);
		this._initMethods = this._initMethods.bind(this);
		this._initStore = this._initStore.bind(this);
		this._initRouter = this._initRouter.bind(this);
		this.getStore = this.getStore.bind(this);
		this._setStore = this._setStore.bind(this);
		this.getState = this.getState.bind(this);
		this.getRouter = this.getRouter.bind(this);
		this.createRouter = this.createRouter.bind(this);
		this.getRouterRoutes = this.getRouterRoutes.bind(this);
		this.createRouterRoutes = this.createRouterRoutes.bind(this);
		this.createEmptyState = this.createEmptyState.bind(this);
		this.cloneState = this.cloneState.bind(this);
		this.run = this.run.bind(this);

		this.afterInit();
	}

	/**
	 * PUBLIC METHODS
	 */

	/**
	 * Controller initialization.
	 */
	init() {
		this._joinComponents();
		this._initStore();
		this._initRouter();
	}

	/**
	 * Properties initialization.
	 */
	initProperties() {
	}

	/**
	 * After initialization operations.
	 */
	afterInit() {
		this._initMethods();
	}

	/**
	 * Returns the initial app state.
	 * @returns Object
	 */
	// getStateInitialData() {}

	/**
	 * Full list of app actions, i.e. actions handled by the main controller.
	 * @returns {Array}
	 */
	getActionTypes() {
		return this._action_types;
	}

	/**
	 * Returns the controller components.
	 * Structure of the return value:
	 * {
	 *     component_one_key: new SomeControllerComponentOne(),
	 *     component_two_key: new SomeControllerComponentTwo()
	 * }
	 * @returns Object[]
	 */
	getControllerComponents() {
		return [];
	}

	/**
	 * Returns the controller component by its key indicated in getControllerComponents() method.
	 * @returns {ReduxControllerComponent}
	 */
	getControllerComponent(key) {
		return this.getControllerComponents()[key];
	}

	/**
	 * Returns the app router. If null is returned, it means that routing is disabled in this app.
	 * @returns ReduxControllerRouter
	 */
	getRouter() {
		if (this.router===undefined) {
			this.router = this.createRouter();
		}
		return this.router;
	}
	/**
	 * Создаёт и возвращет router приложения. Чтобы инициализировать routing в приложении, надо переопределить и вернуть потомка ReduxControllerRouter.
	 * @returns Object
	 */
	createRouter() {
		return null;
	}

	/**
	 * Returns the app routes structure.
	 * @returns Object
	 */
	getRouterRoutes() {
		if (this.router_routes===undefined) {
			this.router_routes = this.createRouterRoutes();
		}
		return this.router_routes;
	}
	/**
	 * Creates the app routes structure.
	 * @returns Object
	 */
	createRouterRoutes() {
		return null;
	}

	/**
	 * Returns the app store.
	 * @returns Object
	 */
	getStore() {
		return this.store || {};
	}

	/**
	 * Returns the app state.
	 * @returns Object
	 */
	getState() {
		return this.getStore().getState();
	}

	/**
	 * Create the app empty state object.
	 * @returns Object
	 */
	createEmptyState() {
		return {};
	}
	/**
	 * Returns the clone of the state object passed as a parameter.
	 * @param state The state object to be cloned.
	 * @returns Object
	 */
	cloneState(state) {
		let cloned_state = this.createEmptyState();
		let _index = cloned_state.index;

		// To avoid cloning the methods of the state object.
		Object.defineProperties(cloned_state, Object.keys(state).reduce((descriptors, key) => {
			let new_value = Object.getOwnPropertyDescriptor(state, key);
			if (!$.isFunction(state[key])) {
				descriptors[key] = new_value;
			}
			return descriptors;
		}, {}));

		cloned_state.index = _index;
		return cloned_state;
	}

	/**
	 * Renders the root React component of the app.
	 */
	// render() {}

	/**
	 * Run the controller.
	 */
	run() {
		this.getStore().subscribe(this.render);
		this.render();
	}

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * Converts SOME_ACTION_NAME into SomeActionName.
	 * @param underscore_string String with underscore separators.
	 * @returns {string}
	 * @private
	 */
	_getCamelCaseFromUnderscore(underscore_string) {
		let parts = underscore_string.toLowerCase().split('_'),
			capitalized_parts = [];
		for (let part of parts) {
			capitalized_parts.push(part.slice(0, 1).toUpperCase() + part.slice(1));
		}
		return capitalized_parts.join('');
	}

	/**
	 * Returns the root reducer for the app store.
	 * @returns {function(this:ReduxController)}
	 * @private
	 */
	_getRootReducer() {
		let initial_state = this.getStateInitialData();
		return function (state = initial_state, action) {
			// Iterating action types to check if the given action matches any of them
			for (let action_type of this.getActionTypes()) {
				if (action_type==action.type) {
					// If we have a matching action type and we have a reducer method for it, then we should call it.
					let reduce_method_name = REDUCE_METHOD_PREFIX + this._getCamelCaseFromUnderscore(action_type);
					if ($.isFunction(this[reduce_method_name])) {
						// We isolate the "type" field of the action from the action data passed through the chain of the action handling methods
						// to avoid erasing its value on any of the stages.
						return this[reduce_method_name](state, action.data);
					}
				}
			}
			return state;
		}.bind(this);
	}

	/**
	 * Creates a dummy-method that will be used for firing the given action.
	 * Return the closure function (data_for_action) { // do things }
	 * @param action_type Action type.
	 * @param handle_method_name Correspondent action handler method name.
	 * @returns {function(this:ReduxController)}
	 * @private
	 */
	_createThrowActionMethod(action_type, handle_method_name) {
		let void_throw_method = function (data) { return data; };
		return this._processThrowActionMethod(
			void_throw_method,
			action_type,
			handle_method_name
		);
	}

	/**
	 * Processes given action firing method to wrap it into a correct sequence of operations:
	 * 1) generation of a correct action object with throwSomeActionName();
	 * 2) dispatching action by the store to change the state with reduceOnSomeActionName();
	 * 3) call of a corresponding logical action handler handleSomeActionName() if there is one.
	 * Returns a closure function (data_for_action) { // do things }
	 * @param method Method declared in a controller throwSomeActionName.
	 * @param action_type Action type.
	 * @param handle_method_name Action handler method name.
	 * @returns {function(this:ReduxController)}
	 * @private
	 */
	_processThrowActionMethod(method, action_type, handle_method_name) {
		return function (data_for_action) {
			// Getting the result of action thrower work with the data from the method declared in the controller.
			let action = this._createActionObject(action_type, method(data_for_action));
			// Dispatch the action object we now have.
			this.getStore().dispatch(action);
			// Handling the action if we have a handler.
			if ($.isFunction(this[handle_method_name])) {
				this[handle_method_name](action.data);
			}
		}.bind(this);
	}

	/**
	 * Creates the correct action object from the given data.
	 * @param action_type Action type.
	 * @param data_for_action Action data object.
	 * @returns Object
	 * @private
	 */
	_createActionObject(action_type, data_for_action) {
		return {
			type: action_type,
			data: data_for_action
		};
	}


	/**
	 * Attempts to add methods corresponding to a given controller component actions into the controller. If fails, returns false, if succeeds — true.
	 * @param {ReduxControllerComponent} component
	 * @param {string[]} action_types Action types to add methods for.
	 * @returns {bool}
	 * @private
	 */
	_propagateComponentMethods(component, action_types) {
		let available_action_prefixes = [THROW_METHOD_PREFIX, HANDLE_METHOD_PREFIX, REDUCE_METHOD_PREFIX];

		// Trying to add all the possible action handling methods from a controller component to the controller.
		// Adding only those which are declared in a given component.
		for (let action_type of action_types) {
			let method_name_suffix = this._getCamelCaseFromUnderscore(action_type);

			for (let action_prefix of available_action_prefixes) {
				let method_name = action_prefix + method_name_suffix;

				if (!$.isFunction(component[method_name])) {
					continue;
				}

				// If a method to be defined is already defined, we should throw an error.
				if (this[method_name]!==undefined) {
					let error_message = 'Controller init error! A "'+method_name+'" propagated method has already been initialized!';
					Utils.error('ReduxController', error_message);
					return false;
				}

				// Passing to the parent controller an action handling method, which calls a corresponding controller component method inside.
				this[method_name] = function () {
					return component[method_name].apply(component, arguments);
				}
			}
		}

		return true;
	}

	/**
	 * Attempts to add a controller component into the controller. If fails, returns false, if succeeds, returns a list of action types required by a controller component.
	 * @param {ReduxControllerComponent} component
	 * @returns {bool|string[]}
	 * @private
	 */
	_joinControllerComponent(component) {
		let component_actions = component.getActionTypes(),
			component_required_actions = component.getRequiredActionTypes(),
			actions_intersection = _.intersection(component_actions, this.getActionTypes());

		// If we try to combine controller action types and see that there are duplicates,
		// we should throw an error and terminate.
		if (actions_intersection.length) {
			let error_message = 'Controller init error! A '+actions_intersection.toString()+' part of actions array '+component_actions.toString()+' intersects with existing actions!';
			Utils.error('ReduxController', error_message);
			return false;
		}

		// Adding controller component action types into the controller.
		this._action_types.push(...component_actions);

		// Propagating methods to be taken from a component to the controller.
		if (!this._propagateComponentMethods(
			component,
			component_actions
		)) {
			return false;
		}

		component.setController(this);

		return component_required_actions;
	}

	/**
	 * Joins controller components into the controller.
	 * @private
	 */
	_joinComponents() {
		let components = this.getControllerComponents(),
			required_actions = [];

		// Iterating controller components.
		for (let component_key in components) {
			let component = components[component_key];
			if (component instanceof ReduxControllerComponent) {
				let component_required_actions;
				if (component_required_actions = this._joinControllerComponent(component)) {
					// Gathering the list of all the action types required by the indicated controller components.
					required_actions.push(...component_required_actions);
				}
				else {
					return;
				}
			}
		}

		// If we don't have any of the required actions, we should throw an error.
		let missing_actions = _.difference(_.uniq(required_actions), this.getActionTypes());
		if (missing_actions.length) {
			let error_message = 'Controller init error! The following required actions have not been initialized: '+missing_actions.toString();
			Utils.error('ReduxController', error_message);
		}
	}

	/**
	 * Initializes controller methods.
	 * @private
	 */
	_initMethods() {
		for (let action_type of this.getActionTypes()) {
			let method_name_suffix = this._getCamelCaseFromUnderscore(action_type),
				throw_method_name = THROW_METHOD_PREFIX + method_name_suffix,
				handle_method_name = HANDLE_METHOD_PREFIX + method_name_suffix,
				reduce_method_name = REDUCE_METHOD_PREFIX + method_name_suffix;

			// Creting or processing the action firing methods.
			this[throw_method_name] = !$.isFunction(this[throw_method_name])
				? this._createThrowActionMethod(action_type, handle_method_name)
				: this._processThrowActionMethod(this[throw_method_name], action_type, handle_method_name);

			// Binding this object to the reducer methods.
			if ($.isFunction(this[reduce_method_name])) {
				this[reduce_method_name] = this[reduce_method_name].bind(this);
			}

			// Binding this object to the action handling methods.
			if ($.isFunction(this[handle_method_name])) {
				this[handle_method_name] = this[handle_method_name].bind(this);
			}
		}
	}

	/**
	 * Stores a given store into the controller.
	 * @param store_to_set
	 * @private
	 */
	_setStore(store_to_set) {
		this.store = store_to_set;
	}

	/**
	 * Initializes the controller store.
	 * @private
	 */
	_initStore() {
		this._setStore(createStore(
			this._getRootReducer(),
			applyMiddleware(
				thunkMiddleware
			)
		));
	}

	/**
	 * Initializes the controller router.
	 * @private
	 */
	_initRouter() {
		let router = this.getRouter();
		if (router instanceof ReduxControllerRouter) {
			router.init();
		}
	}
}