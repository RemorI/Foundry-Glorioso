# Create a custom Input Component

[[_TOC_]]

## 1. Create your new component class

Create a Class extending the `Component` class, implementing all required functions.

You must extend the `Component` class, but you can also extend one of its subclasses:

- `InputComponent` for a component handling data input
- `Container` for a component containing other components
- `ExtensibleTable` for a component dynamically extensible, like Dynamic Tables

```javascript
/* Create class when CSB is ready and all helper classes have been created and made available */
Hooks.once('customSystemBuilderInit', () => {
  // All component classes are in the game.CustomSystemBuilder.API.Components object
  const InputComponent = game.CustomSystemBuilder.API.Components.InputComponent;

  /**
   * Radio Button component
   */
  class Checkbox extends InputComponent {}
});
```

The `customSystemBuilderInit` hook fires once Custom System Builder has been initialized and is ready to run.

## 2. Create its configuration data

You need to define your component:

1. Create a constructor with your component's special data
2. Create the `getTechnicalName` and `getPrettyName` functions, which sets the technical name and translated name of your component
3. Create the `toJSON` and `static fromJSON` functions which serialize and deserialize your component

```javascript
class Checkbox extends InputComponent {
    /**
     * The value type of this component. This is used to display an input field in the Dynamic Table's templates
     * This should be 'none' | 'string' | 'number' | 'boolean'
     * Default is 'none' for a Component, or 'string' an InputComponent
     * Here we set it as a boolean to display a checkbox in the Dynamic Table
     */
    static valueType = 'boolean';

    /**
     * Checkbox constructor
     * @param {Object} data Component data
     *
     * Params needed by the "Component" class
     * @param {string} data.key Component key
     * @param {string?} [data.tooltip] Component tooltip
     * @param {string} data.templateAddress Component address in template, i.e. component path from actor.system object. This is autofilled by the system
     * @param {string?} [data.cssClass] Additional CSS class to apply at render
     * @param {number?} [data.role] Component minimum role
     * @param {number?} [data.permission] Component minimum permission
     * @param {string?} [data.visibilityFormula] Component visibility formula
     * @param {Container?} [data.parent] Component's container. This is autofilled by the system
     *
     * Params needed by the "InputComponent" class
     * @param {string?} [data.label] Field label
     * @param {string?} [data.size] Field size. Can be full-size, x-small, small, m-small, medium, m-large, large, x-large or custom.
     * @param {number?} [data.customSize] The size of the field, in pixels. Is only used if size is custom
     *
     * Params for this component
     * @param {boolean?} [data.defaultChecked] Is the checkbox checked by default ?
     */
    constructor({
                    key,
                    tooltip,
                    templateAddress,
                    cssClass,
                    role,
                    permission,
                    visibilityFormula,
                    parent,

                    label,
                    size,
                    customSize,

                    defaultChecked
                }) {
        super({
            key: key,
            tooltip: tooltip,
            templateAddress: templateAddress,
            cssClass: cssClass,
            role: role,
            permission: permission,
            visibilityFormula: visibilityFormula,
            parent: parent,

            label: label,
            size: size,
            customSize: size,
        });

        // Setting defaultChecked with false by default
        this._defaultChecked = defaultChecked ?? false;
    }

    /**
     * Gets technical name for this component's type
     * @return {string} The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'checkbox';
    }

    /**
     * Gets pretty name for this component's type
     * @returns {string} The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Checkbox');
    }

    /**
     * Returns serialized component
     * @returns {object}
     */
    toJson() {
        // Calling super.toJSON() to get the serialized data for the classes above this one
        // This super call handles the typing of the component, by calling "getTechnicalName"
        const jsonObj = super.toJSON();

        // Only add the specific field for this component
        return {
            ...jsonObj,
            defaultChecked: this._defaultChecked
        };
    }

    /**
     * Creates checkbox from JSON description
     * @param {object} json The serialized data
     * @param {string} templateAddress The component's address in the template
     * @param {Container?} parent The component's parent container
     * @returns {Checkbox}
     */
    static fromJSON(json, templateAddress, parent) {
        return new Checkbox({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            cssClass: json.cssClass,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            parent: parent,

            label: json.label,
            size: json.size,
            customSize: json.customSize,

            defaultChecked: json.defaultChecked,
        });
    }
}
```

## 3. Create the configuration form functions

This is needed to allow users to create the component, and configure it as needed. You must define `getConfigForm`, which returns an `HTMLDivElement` containing the configuration form of you component, later inserted in the Component Edition Dialog; `extractConfig` which extracts the data from the Component Edition Dialog to return a serialized version of the Component, with a structure accepted by your `fromJSON` function; and `validateConfig` which should throw if any value is wrong in the extracted configuration.

```javascript
class Checkbox extends InputComponent {
  //...

  /**
   * Get configuration form for component creation / edition
   * @param {TemplateSystem} entity The entity currently editing this component
   * @param {string} appId The ID of the Dialog which will be rendered to display the configuration form. This can be used to generate id attributes for the elements.
   * @param {object?} existingComponent An optional param containing an existing component serialization, when editing an component. This is undefined if the function is called for a new Component.
   * @returns {Promise<HTMLElement>} The HTML element holding the component
   */
  static async getConfigForm(entity, appId, existingComponent) {
    // Create an HTMLElement to contain the fields
    const mainElt = document.createElement('div');

    // You can use handlebars to render your form, or generate it in plain JS.
    mainElt.innerHTML = await renderTemplate(`<YOUR_TEMPLATE_PATH.hbs>`, {
      ...existingComponent,
      COMPONENT_SIZES: {
        'full-size': 'CSB.ComponentProperties.Size.Auto',
        'x-small': 'CSB.ComponentProperties.Size.Tiny',
        small: 'CSB.ComponentProperties.Size.Smaller',
        'm-small': 'CSB.ComponentProperties.Size.Small',
        medium: 'CSB.ComponentProperties.Size.Medium',
        'm-large': 'CSB.ComponentProperties.Size.Large',
        large: 'CSB.ComponentProperties.Size.Larger',
        'x-large': 'CSB.ComponentProperties.Size.Gigantic',
        custom: 'CSB.ComponentProperties.Size.Custom'
      },
      appId
    });

    // You can add event listeners to your form to make it more dynamic
    mainElt.querySelector('[name="size"]')?.addEventListener('change', (event) => {
      const target = event.currentTarget;
      const customSizeBlock = $(mainElt.querySelector('.custom-system-size-custom'));
      const slideValue = 200;

      switch (target.value) {
        case 'custom':
          customSizeBlock.slideDown(slideValue);
          break;
        default:
          customSizeBlock.slideUp(slideValue);
          break;
      }
    });

    return mainElt;
  }

  /**
   * Extracts configuration from submitted HTML form
   * @param {object} configData An object containing the data from the form, keyed with the name attributes of the fields
   * @param {HTMLFormElement} html The full submitted form
   * @returns {object} The JSON representation of the component
   */
  static extractConfig(configData, html) {
    // Call the parent extractConfig for the data you don't directly handle
    const fieldData = {
      ...super.extractConfig(configData, html),
      label: configData.label?.toString(),
      size: configData.size ?? 'full-size',

      // Checkboxes are sent in the data as string with values "true" or "false"
      defaultChecked: configData.defaultChecked === 'true'
    };

    if (fieldData.size === 'custom') {
      fieldData.customSize = parseInt(configData.customSize ?? '50');
    }

    return fieldData;
  }

  /**
   * Validates the json to ensure it can be deserialized to the Component
   * @param {object} json The serialized data
   */
  static validateConfig(json) {
    // Calling the parent validator for the data not directly handled
    super.validateConfig(json);

    // This component needs a key
    if (!json.key) {
      throw new game.CustomSystemBuilder.API.Errors.RequiredFieldError(
        game.i18n.localize('CSB.ComponentProperties.ComponentKey'),
        json
      );
    }
  }
}
```

Here we create the form from a Handlebars template. Below is the template we used. We use the `appId` to generate unique ids for the fields, which can be referenced by labels, and we make sure to name every field to get their value back in the `extractConfig` function.

> &#x26a0;&#xfe0f; **Some names are reserved**
>
> Due to the inner workings of FoundryVTT ans Javascript, some names can not be used in your form configuration. Such names include `id`, `style`, `elements` and `name`. Please do not use these names as field names, and generally don't use usual HTML attributes as field names.

```handlebars
<div class='custom-system-form-field'>
    <label for="checkboxLabel-{{appId}}">{{localize 'CSB.ComponentProperties.InputComponent.Label'}}</label>
    <input id="checkboxLabel-{{appId}}" type='text' data-key='label' name="label" value='{{label}}' />
</div>

<div class='custom-system-form-field'>
    <label for="checkboxSize-{{appId}}">{{localize 'CSB.ComponentProperties.Size.SectionTitle'}}*</label>
    <select id="checkboxSize-{{appId}}" data-key='size' name="size">
        {{selectOptions COMPONENT_SIZES selected=size localize=true}}
    </select>
</div>

<div class="custom-system-size-custom" style="{{#unless (eq size "custom")}}display:none{{/unless}}">
    <div class='custom-system-form-field'>
        <label for="checkboxCustomSize-{{appId}}">{{localize 'CSB.ComponentProperties.Size.CustomSizeTitle'}}*</label>
        <input id="checkboxCustomSize-{{appId}}" data-key='customSize' name="customSize" type="number" value="{{customSize}}" />
    </div>
</div>


<div class='custom-system-form-field'>
    <label for="checkboxDefaultChecked-{{appId}}">{{localize 'CSB.ComponentProperties.CheckedByDefault'}}</label>
    <input id="checkboxDefaultChecked-{{appId}}" type='checkbox' data-key='defaultChecked' name="defaultChecked" {{checked defaultChecked}} />
</div>
```

## 4. Render the component

Lastly, we need to render the component inside the sheet. This is done by creating the `_getElement` function, which returns a `Jquery<HTMLElement>`.

```javascript
class Checkbox extends InputComponent {
  //...

  /**
   * Renders component
   * @param {TemplateSystem} entity Rendered entity (actor or item)
   * @param {boolean} [isEditable=true] Is the component editable by the current user?
   * @param {} [options={}] Additional options usable by the final Component. @see https://custom-system-builder.gitlab.io/custom-system-builder/types/sheets_components_Component.ComponentRenderOptions.html
   * @returns {Promise<JQuery<HTMLElement>>} The jQuery element holding the component
   */
  async _getElement(entity, isEditable = true, options = {}) {
    // Consolidating the entity props and any additional props coming from the component's parent
    const props = { ...entity.system.props, ...options.customProps };

    // Calling the super _getElement to get the basic structure of the element
    const jQElement = await super._getElement(entity, isEditable, options);
    jQElement.addClass('custom-system-checkbox');

    // Creating the checkbox itself
    const inputElement = $('<input />');
    inputElement.attr('type', 'checkbox');
    inputElement.attr('id', `${entity.uuid}-${this.key}`);

    // Getting the status of the checkbox. It should be checked if its key is 'true' in the entity props, or if it should be defaultChecked
    const checkedStatus = foundry.utils.getProperty(props, this.key);
    const checked = checkedStatus || (checkedStatus === undefined && this._defaultChecked);

    if (checked) {
      inputElement.attr('checked', 'checked');
    }

    // Adding the checkbox to the main structure
    jQElement.append(inputElement);

    // If the entity is an AppliedTemplateSystem, meaning an Character or an EquippableItem, we add its name so that it can be saved
    if (game.CustomSystemBuilder.API.TemplateSystem.isAppliedTemplateSystem(entity)) {
      inputElement.attr('name', 'system.props.' + this.key);
      foundry.utils.setProperty(entity.system.props, this.key, checked);

      if (!isEditable) {
        inputElement.attr('disabled', 'disabled');
      }
    }

    // If the entity is a BuilderTemplateSystem, meaning an Template, we check it according to the defaultChecked value
    // And we allow component edition on click
    if (game.CustomSystemBuilder.API.TemplateSystem.isBuilderTemplateSystem(entity)) {
      if (this._defaultChecked) {
        inputElement.attr('checked', 'checked');
      }

      jQElement.addClass('custom-system-editable-component');
      inputElement.addClass('custom-system-editable-field');

      jQElement.on('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.editComponent(entity);
      });
    }

    return jQElement;
  }

  //...
}
```

## 5. Include it in the Component Factory

You will need to add your new Component to the Component Factory of the system for it to be available. To do so, you
will need to include this code in your module:

```javascript
/* Load Component when CSB is ready */
Hooks.once('customSystemBuilderInit', () => {
  game.CustomSystemBuilder.API.Components.componentFactory.addComponentType(Checkbox);
});
```
