# Extend the system

You can extend the system by adding your own component types to it, from a module. To do so, you must create a class inheriting the `Component` class. Two additional abstract classes are present in the base system : `InputComponent`, designed to represent Components which can receive user inputs and `Container`, designed to represent Components holding other Components.

Once your class is developed, you can add it to the system by calling `componentFactory.addComponentType('<componentTechnicalName>', <Class>);` in the Hook `customSystemBuilderInit`.

Example :

```javascript
Hooks.once('customSystemBuilderInit', () => {
  componentFactory.addComponentType('myAwesomeComponent', AwesomeComponent);
});
```

Please refer to [the API for Component implementation](https://custom-system-builder.gitlab.io/custom-system-builder/classes/sheets_components_Component.Component.html).

You can find a guide here : [Create a Custom Input Component](Guides/Create-a-Custom-Input-Component)

Please let me know by an issue if you implement a Component you think should be available to all ! Link your implementation, and I'll most likely add it to the system !

## Hooks defined and triggered by CSB

These are the hooks CSB triggers:

- `customSystemBuilderInit`: Called at the end of the system initialization, during the global `init` hook. Calling this hook ensures that Actor and Item classes are set, CSB settings are defined and the Component Factory is ready to be used.
- `customSystemBuilderReady`: Called at the end of the `ready` hook for Custom System Builder. Calling this hook ensures that Foundry is ready, the custom CSS is loaded (see [Use your own CSS](./Tips-&-Tricks/Use-your-own-CSS)) and all needed CSB migrations have been triggered.
