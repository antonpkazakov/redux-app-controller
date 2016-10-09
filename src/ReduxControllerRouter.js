import React from 'react';
import { Router as ParentRouter, Route, Link, IndexRoute, Redirect, IndexRedirect, browserHistory, hashHistory, withRouter } from 'react-router';
import {Utils} from './Utils';

// Exporting all react-router components to avoid the need to import all these components separately from react-router.
export { Route, Link, IndexRoute, Redirect, IndexRedirect, browserHistory, hashHistory };

/**
 * This class serves only one purpose — pass the controller object to all its descendant components.
 */
export class Router extends ParentRouter {
	render() {
		let controller = this.props.controller,
			createElement = function (Component, props) {
				return <Component {...props} controller={controller}/>;
			};
		return (
			<ParentRouter {...this.props} createElement={createElement}>
				{this.props.children}
			</ParentRouter>
		);
	}	
}

export default class ReduxControllerRouter {
	constructor() {
		//super();

		this.history_type = hashHistory;
		this.history = null;

		this.init = this.init.bind(this);
		this.setHistoryType = this.setHistoryType.bind(this);
		this.getHistory = this.getHistory.bind(this);
	}

	/**
	 * Router initialization.
	 */
	init() {
		this.history = this.history_type;
	}

	/**
	 * Sets the router's history type.
	 * @param history_type History object — browserHistory|hashHistory
	 * @returns {ReduxControllerRouter}
	 */
	setHistoryType(history_type) {
		this.history_type = history_type;
		return this;
	}

	/**
	 * Returns the router's history object.
	 * @returns {browserHistory|hashHistory}
	 */
	getHistory() {
		return this.history;
	}

	/**
	 * Moves to the indicated route url.
	 * @param url Route url.
	 */
	location(url) {
		this.getHistory().push(url);
	}
}