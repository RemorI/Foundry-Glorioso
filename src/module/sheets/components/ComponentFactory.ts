/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Logger from '../../Logger.js';
import Component, { ComponentJson } from './Component.js';
import Container from './Container.js';
import UnknownComponent from './UnknownComponent.js';

/**
 * Component factory. Used to create components from JSON.
 * This is a singleton object exported globally
 */
export class ComponentFactory {
    /**
     * Record of the available component types
     */
    private _componentTypes: Record<string, typeof Component> = {};

    /**
     * Returns currently registered component types
     * @returns All available component types
     */
    get componentTypes(): Array<string> {
        return Object.keys(this._componentTypes);
    }

    /**
     * Creates an array of components from an array of JSON-described components
     * @param json The JSON description of the components.
     * @param templateAddress The base address of the components. The array index is appended to the address if json is an array.
     * @param parent The component's parent
     * @returns An array of components or one component if json is not an Array
     */
    public createMultipleComponents(
        json: Array<ComponentJson> = [],
        templateAddress: string = '',
        parent?: Container
    ): Array<Component> {
        const contents = [];

        for (const [index, component] of json.entries()) {
            contents.push(this.createOneComponent(component, templateAddress + '-' + index, parent));
        }

        return contents;
    }

    /**
     * Creates one component from a JSON description
     * @param json The JSON description of the component.
     * @param templateAddress The base address of the component. The array index is appended to the address if json is an array.
     * @param parent The component's parent
     * @returns The new Component
     * @private
     */
    public createOneComponent(json: ComponentJson, templateAddress: string = '', parent?: Container): Component {
        let component;

        if (this._componentTypes[json.type]) {
            component = this._componentTypes[json.type].fromJSON(json, templateAddress, parent);
        } else {
            Logger.error('Unrecognized component type ' + json.type);
            component = UnknownComponent.fromJSON({ type: json.type }, templateAddress, parent);
        }

        return component;
    }

    /**
     * Adds a component type from a name and an ES6 Class
     * @param name Component name
     * @param cls The component's class, inheriting Component
     */
    public addComponentType(cls: typeof Component): void;
    public addComponentType(name: string, cls: typeof Component): void;
    public addComponentType(arg0: string | typeof Component, arg1?: typeof Component) {
        if (typeof arg0 === 'string') {
            this._componentTypes[arg0] = arg1!;
        } else {
            this._componentTypes[arg0.getTechnicalName()] = arg0;
        }
    }

    /**
     * Returns a registered component's class
     * @param name The component class name
     * @return The component class
     * @throws {Error} If the name does not match a registered Component Class
     */
    public getComponentClass(name: string): typeof Component {
        if (this._componentTypes[name]) {
            return this._componentTypes[name];
        } else {
            throw new Error('Unrecognized component class name ' + name);
        }
    }
}

globalThis.componentFactory = new ComponentFactory();
