import React from 'react';
import ReduxAppController from './ReduxAppController';
import {Utils} from './Utils';

export default class AbstractComponent extends React.Component {
	constructor() {
		super();

		this._element = null;

		this.init = this.init.bind(this);
		this.getDomElement = this.getDomElement.bind(this);
		this.saveRefToDomElement = this.saveRefToDomElement.bind(this);
		this.getController = this.getController.bind(this);

		this.init();
	}

	init() {
	}

	/**
	 * Returns the element bound to this component by ref with a saveRefToDomElement() method.
	 * @returns {HtmlElement}
	 */
	getDomElement() {
		return this._element;
	}

	/**
	 * The callback to bind the rendered DOM element to this component.
	 * Usage: <MyComponent ref={this.saveRefToDomElement} />.
	 * @param {HtmlElement}
	 */
	saveRefToDomElement(element) {
		this._element = element;
	}

	/**
	 * Returns the controller passed to this component in the "controller" property.
	 * @returns {ReduxAppController}
	 */
	getController() {
		if (this.props.controller instanceof ReduxAppController) {
			return this.props.controller;
		}

		Utils.fatalError('AbstractComponent', 'No controller passed to this component!');

		return undefined;
	}
}