# ReduxAppController

ReduxAppController is a library based on React+Redux combination used for making React-powered SPA based on controllers rather than separate action-creators, reducers and action handlers.

So what it's basically for is making your SPA be more readable and solid although it may as well be a little bit bigger than it would have been with traditional approach.

Also ReduxAppController encourages making your app state a separate class entity with getter/setter access to its data, which is very good for future reorganizing of the state structure without changing anything but the State class.

With ReduxAppController you can both easily start building your SPA and easily scale it when it starts becoming bulky being in one piece.

## Contents

[The Basics](#the-basics)

[Action Handling](#action-handling)

[Scaling. When your SPA gets bigger](#scaling-when-your-spa-gets-bigger)

1. [Dealing with lots of actions \(controller components\)](#dealing-with-lots-of-actions-\(controller-components\))
2. [Dealing with a complex state structure \(State object\)](#dealing-with-a-complex-state-structure-\(state-object\))

[App routing](#app-routing)

[Making UI components](#making-ui-components)

[Discussion and troubleshooting](#discussion-and-troubleshooting)

## The Basics

ReduxAppController approach is a MainController-approach which means that what you start with is a single MainController, that does all the Redux magic for you inside and you just plan the list of actions it will handle and make React components for your UI.

It looks like this:

```javascript
// MainController.js
import React from 'react';
import ReactDOM from 'react-dom';
import { ReduxAppController } from 'redux-app-controller';

export default class MainController extends ReduxAppController {
	init() {
		super.init();
		// This is the initialization method for the controller. It's the analogue of a constructor,
		// but it doesn't let you change the params of a constructor because you don't need to.
		// This is the method to override to define the controller properties and to bind 'this' object to its methods.
		// You must call the super.init() method here otherwise the store of your app won't be initialized.
	}
	 
	/**
	 * @returns {Object}
	 */
	getStateInitialData() {
		return {
			// The initial state object.
		};
	}
	 
	/**
	 * @returns {String[]}
	 */
	getActionTypes() {
		return [
			// The list of actions your SPA will handle.
		];
	}
 
	/**
	 * The methods of actions handling. Can be autogenerated. Further details — down below.
	 * Here is given the example of a full set of methods for the action with the name SOME_ACTION.
	 */
	 
	/**
	 * Throws the action with the name SOME_ACTION into the pipeline of action handling.
	 * @param {Object} action_data
	 * @returns {Object}
	 */
	throwSomeAction(action_data) {
		return {
			// Returns the object, that contains action data, which is built based on the data passed in the action_data parameter.
			// Can be used for purposes of defining default values for action data fields and, in general, for making sure we pass
			// all the necessary data down the pipeline of action handling methods.
		};
	}
	 
	/**
	 * Reduces the state object while dispatching the SOME_ACTION action after is has been thrown.
	 * @param {Object} state
	 * @param {Object} action_data
	 * @returns {Object}
	 */
	reduceOnSomeAction(state, action_data) {
		let new_state = this.cloneState(state);
		
		// This method is basically a reducer for the corresponding action. So what it does is getting the state object, cloning it properly
		// using the cloneState() method, then changing it according to the action and the action_data passed to it, and returning the new state object.
		// It has to be a pure function and it must not to anything except for making a new state object of an old one and the action_data.
		return new_state;
	}
	 
	/**
	 * Performs all the necessary further operations needed to complete handling the SOME_ACTION action.
	 * @param {Object} action_data
	 */
	handleSomeAction(action_data) {
		// This is the last method to define for an action. It's not necessary to define it, but if you want to do any stuff 
		// like throwing other actions, making AJAX requests, changing the current route of your SPA — this is the method to do all those in.
	}
	 
	 
	/**
	 * Render method.
	 */
	 
	render() {
		// This method basically renders your SPA into some root DOM node. This method is automatically subscribed to the changes of the state of your SPA,
		// so you only need to define it, everything else will be taken care of by the ReduxAppController when you call the method run().
		
		ReactDom.render(
			<div id="im_the_simplest_spa_youve_ever_seen" />
			document.getElementById('app-root')
		);
	}
}

// main.js
import MainController from './MainController.js';

(new MainController()).run();
```
	
This is basically what is required to set up an application that handles `SOME_ACTION` action and renders itself into a given node.

## Action handling

With ReduxAppController actions are handled in 3 simple stages:

1. Throwing an action with a corresponding `throw...` method.
2. Reducing on this action while dispatching it by the app store with a corresponding `reduceOn...` method.
3. Doing other action handling operations with a corresponding `handle...` method.

The order of operations in this pipeline is always like it's describe above, **throw → reduceOn → handle**.

It's recommended that nothing but the action data object compilation is done by the `throw...` methods, nothing but the state modification is done in the `reduceOn...` methods and everything else is done in the `handle...` methods.

Sure you all remember that any changes to the app state are done by dispatching the actions, so with ReduxAppController you should call a corresponding `throw...` method for an action to make it dispatch and be handled.

### Auto-generation of the action handling methods

Using ReduxAppController *you don't need to declare all the action handling methods*. ReduxAppController will do that for you for every action that is mentioned in the `getActionTypes()` method and doesn't have one or more necessary action handling methods.

For example, if we have action `SOME_ACTION` and only the `reduceOnSomeAction()` method declared, the action-thrower, `throwSomeAction()` method, will be declared automatically during the initialization of the controller and will be available to be called after.

Or, if `SOME_ACTION` doesn't do any changes to the app state (for example, it only changes the current route of your app), you can declare only `handleSomeAction()` method, and then you'll still have a corresponding action-thrower `throwSomeAction()` available.

## Scaling. When your SPA gets bigger

Keeping all you SPA code except for the visualization may not always seem a good idea. And when the app gets complex enough we eventually start thinking about the scaling.

ReduxAppController offers you 2 ways of doing that.

### 1. Dealing with lots of actions (controller components)

First of all, your big application will handle a big number of actions. Most likely they will consist of different groups of actions each related to the particular block of the functionality. These groups can be moved from your `MainController` to the separate entities called **controller components**.

These controller components represent global components of your app (e.g. — big UI blocks with separate logics, entire pages or groups of pages). They look like this:

```javascript
// MainController.js
import React from 'react';
import ReactDOM from 'react-dom';
import { ReduxAppController } from 'redux-app-controller';
import FirstControllerComponent from './FirstControllerComponent.js';
import SecondControllerComponent from './SecondControllerComponent.js';

export default class MainController extends ReduxAppController {
	/**
	 * @returns {Object}
	 */
	getStateInitialData() {
		return {
			// The initial state object.
		};
	}
	 
	/**
	 * @returns {String[]}
	 */
	getActionTypes() {
		return super.getActionTypes().concat([
			// We concat the parent action types list with the list of actions your MainController still handle.
			// The list of action types derived from the parent will contain the action types from the controller components.
		];
	}
	
	getControllerComponents() {
		// Here we provide the controller components instances for our MainController to include them in the SPA.
		// These instances will be available to be reached with this.getControllerComponent(<component_key>) in case
		// you need to call any of their methods or get any of their properties.
		return {
			first: new FirstControllerComponent(),
			second: new SecondControllerComponent()
		};
	}
 
	// ...
	// throwers, reducers an handlers
	// ...
	
	render() {
		// ...
	}
}

// FirstControllerComponent.js
import { ReduxAppControllerComponent } from 'redux-app-controller';

export default class FirstControllerComponent extends ReduxAppControllerComponent {
	init() {
		super.init();
		// This is the initialization method for the controller component. It's also the analogue of a constructor.
		// You must call the super.init() method here otherwise your component won't be properly initialized.
		
		// These properties are isolated from the MainController.
		this.property_one = 1;
		this.property_two = 1;
	}
	 
	/**
	 * @returns {String[]}
	 */
	getActionTypes() {
		return [
			// The list of action this controller component handles.
		];
	}
	/**
	 * @returns {String[]}
	 */
	getRequiredActionTypes() {
		return [
			// The list of actions this controller component require the controller and its components to handle,
			// but doesn't handle on its own. If the MainController none of its components handles any of these actions,
			// the error will be thrown.
		];
	}
 
	// ...
	// throwers, reducers an handlers of this controller component actions
	// ...
	handleSomeAction(action_data) {
		// ...
		
		// Inside the controller component all actions (even those which are defined in this very component) are thrown by getting 
		// the instance if the MainController and calling a corresponding thrower-method.
		this.getController().throwSomeOtherAction();
		
		// ...
	}
}

// SecondControllerComponent.js
import { ReduxAppControllerComponent } from 'redux-app-controller';

export default class SecondControllerComponent extends ReduxAppControllerComponent {
	/**
	 * @returns {String[]}
	 */
	getActionTypes() {
		return [
			// The list of action this controller component handles.
		];
	}
	/**
	 * @returns {String[]}
	 */
	getRequiredActionTypes() {
		return [
			// ...
		];
	}
 
	// ...
	// throwers, reducers an handlers of this controller component actions
	// ...
}

// main.js
import MainController from './MainController.js';

(new MainController()).run();
```
	
What happens here when the `MainController` is initialized is the compilation of all of its components still into one `MainController` but automatically, without any further operations needed. All the actions of the controller components (i.e. their corresponding throw-, reduceOn- and handle- methods) will be available in the MainController after its initialization.

### 2. Dealing with a complex state structure (State object)

The second challenge that a complex SPA can face in the course of time is the growing complexity of its state structure. Assuming that in really complex apps it's often much more convenient to keep most of the state fields available for all the actions (as many of them depend on the data handled by others), ReduxAppController offers moving the app state to a separate State class (with optional but strongly recommended hiding the data behind the access methods, i.e. getters/setters). Here's a simple example:

```javascript
// State.js
export default class State {
	constructor() {
		this.block_one = {
			data: [],
			is_loading: true
		};
		this.block_two = {
			subblock_one: {
				data: [],
				is_loading: true
			},
			subblock_two: [
				this._getStateInitialSubblockTwoData()
			]
		};
		this.server_data = {
			is_saved: false,
			is_loading: false
		};
		 
		// This binding is necessary for the cloned State object methods to work properly
		this.addBlockTwoSubblockTwoElement = this.addBlockTwoSubblockTwoElement.bind(this);
		this.setBlockOneLoading = this.setBlockOneLoading.bind(this);
		this.isBlockOneLoading = this.isBlockOneLoading.bind(this);
		 
		this.setServerDataSaved = this.setServerDataSaved.bind(this);
		this.setServerDataLoading = this.setServerDataLoading.bind(this);
		this.getDataToSave = this.getDataToSave.bind(this);
		this.setStateRestorableData = this.setStateRestorableData.bind(this);
	}
	 
	/** PUBLIC METHODS */
	 
	addBlockTwoSubblockTwoElement() {
		let new_index = this.block_two.subblock_two.length;
		this.block_two.subblock_two[new_index] = this._getStateInitialSubblockTwoData();
		
		// Thanks to the principal of accessing the state properties only with methods, we can implement
		// this unsaved data flag inside the State class only, without any need to copy and paste
		// identical lines of code all across our SPA.
		this.setServerDataSaved(false);
 
		return this;
	}
	/**
	 * @param {bool} loading_state
	 * @returns {State}
	 */
	setBlockOneLoading(loading_state) {
		if (loading_state===undefined) {
			loading_state = true;
		}
		this.block_one.is_loading = !!loading_state;
		this.setServerDataSaved(false);
		return this;
	}
	
	isBlockOneLoading() {
		return this.block_one.is_loading;
	}
	getBlockOne() {
		return this.block_one.data;
	}
	getBlockTwoSubblockOne() {
		return this.block_two.subblock_one.data;
	}
	 
	setServerDataSaved(loading_state) { /* ... */ }
	setServerDataLoading(loading_state) { /* ... */ }
	
	/**
	 * Return the data to send to server.
	 * @returns {Object}
	 */
	getDataToSave() {
		return {
			block_one: this.block_one.data,
			block_two: {
				subblock_one: this.block_two.subblock_one
			}
		};
	}
	
	/**
	 * Fills state structure with values fetched from server.
	 * @param {Object} data Data to fill the properties of this State object with values from.
	 * @returns {State}
	 */
	setStateRestorableData(data) {
		/* ... */
	}
	 
	/** PRIVATE METHODS */
	 
	// We can implement the storage and initialization of the app state any way we want, because our State is a separate class,
	// where we can declare methods to avoid copypaste, for example.
	/**
	 * @returns {Object}
	 */
	_getStateInitialSubblockTwoData() {
		return {
			data: [],
			is_loading: true
		};
	}
}

// MainController.js
// ...
export default class MainController extends ReduxAppController {
	// ...

	// As out app state is now in a separate class, we need to provide the instance of this class as the initial state
	// and the instance of this class as a basis for state cloning (method createEmptyState()).
	/**
	 * @returns {State}
	 */
	getStateInitialData() {
		return new State();
	}
	/**
	 * @returns {State}
	 */
	createEmptyState() {
		return new State();
	}
	
	reduceOnServerDataSaveSuccess(state, action) {
		let new_state = this.cloneState(state);
 
		// Now we access state data only via the methods we have for that purpose.
		// It helps the interface of the state remain intact while the structure of the data stored in it changes any way we need.
		new_state.setServerDataLoading(false);
		new_state.setServerDataSaved();
 
		return new_state;
	}
	
	// ...
}
```
	
Here we make our app state a pure data model where the app data handling and storage is incapsulated and barriered off from the outer world with the interface that makes changing the structure of this data much easier.

## App routing

ReduxAppController supports the usage of [ReactRouter](https://github.com/ReactTraining/react-router). All you should do to use it in your app with ReduxAppController is the following:

```javascript
// MainController.js
// ...

// Import the ReduxAppControllerRouter
// Note, that you can import all the necessary ReactRouter components directly from the 'redux-app-controller'.
import {
	ReduxAppControllerRouter,
	Router, Route, Link, IndexRoute, Redirect, IndexRedirect, browserHistory, hashHistory
} from 'redux-app-controller';

import PageOneViewComponent from './PageOneViewComponent.js';
import PageTwoViewComponent from './PageTwoViewComponent.js';
import PageThreeViewComponent from './PageThreeViewComponent.js';

export class MainController extends ReduxAppController {
	// ...
	 
	// Override the createRouter() method to make it return the instance of the ReduxAppControllerRouter.
	// Here you can set the type of the history object that your ReactRouter will work with by passing browserHistory or hashHistory to the setHistoryType method.
	// The default is hashHistory.
	createRouter() {
		return (new ReduxAppControllerRouter()).setHistoryType(hashHistory);
	}
	 
	// Define the router routes like you usually do with ReactRouter in the createRouterRoutes() method.
	// It's done separately from the Router to avoid rerendering routes every time the render() method is called when state changes.
	createRouterRoutes() {
		return (
			<Route path="/">
				<IndexRoute component={PageOneViewComponent} />
				<Route path="page_two" component={PageTwoViewComponent} />
				<Route path="page_three" component={PageThreeViewComponent} />
			</Route>
		);
	}
	 
	// Render a Router component with two props defined — the history object from your ReduxAppControllerRouter in the "history" property
	// and your MainController as "this" in the "controller" property. The controller property will then be automatically defined in any component
	// that is used to render a route page.
	// Pass the routes created by createRouterRoutes() method as Router children.
	render() {
		ReactDOM.render(
			<Router history={this.getRouter().getHistory()} controller={this}>
				{this.getRouterRoutes()}
			</Router>,
			document.getElementById('app-root')
		);
	}
}
```
	
That's it, now you have a three pages application with routing based on hashHistory.

## Making UI components

With ReduxAppController you may have a need to access your MainController in your components in order to throw actions on the UI events. To make it a little bit easier ReduxAppController package includes the `AbstractComponent` class that defines the way you pass your MainController to your components and the access it.

```javascript
// MainController.js
export class MainController extends ReduxAppController {
	// ...
	render() {
		// To access the MainController in the BigButtonInTheCenterOfTheScreenComponent you must pass its instance in the "controller" property. 
		ReactDOM.render(
			<BigButtonInTheCenterOfTheScreenComponent controller={this} />,
			document.getElementById('app-root')
		);
	}
}

// BigButtonInTheCenterOfTheScreenComponent.js
import { AbstractComponent } from 'redux-app-controller';
export default class BigButtonInTheCenterOfTheScreenComponent extends AbstractComponent {
	// AbstractComponent provides the init() method, the same as in the 
	init() {
		this.onButtonClick = this.onButtonClick.bind(this);
	}
	onButtonClick(e) {
		// In the descendants of the AbstractComponent you can access the MainController via the getController() method.
		this.getController().throwBigButtonClick({ message: 'RED ALERT! ABANDON THE SHIP!' })
	}
	render() {
		return <button onClick={this.onButtonClick}>PRESS ME</button>;
	}
}
```

## Discussion and troubleshooting

Any discussion, ideas and feedback about ReduxAppController are highly appreciated :) If you're having any troubles trying ReduxAppController in your app — feel free to write me, we'll see what we can do.