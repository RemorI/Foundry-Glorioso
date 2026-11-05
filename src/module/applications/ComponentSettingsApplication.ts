/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * @ignore
 * @module
 */

import { EmptyObject } from 'fvtt-types/utils';

import { JSONObject } from '../definitions.js';
import { BuilderTemplateSystem } from '../documents/TemplateSystem.js';
import { mathjsBlacklist } from '../formulas/Formula.js';
import Logger from '../Logger.js';
import Component, { ComponentConfigFormData, ComponentJson } from '../sheets/components/Component.js';
import Container, { ComponentOptions } from '../sheets/components/Container.js';
import { getLocalizedAlignmentList, getLocalizedPermissionList, getLocalizedRoleList } from '../utils.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type ComponentSettingsApplicationContext = {
    appId?: string;
    component: (ComponentJson & JSONObject) | EmptyObject;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
    PERMISSION_LIST: object;
    ROLE_LIST: object;
    ALIGNMENT_LIST: object;

    additionalSections: Array<HTMLElement>;
    componentSections: Record<string, HTMLDivElement>;
    componentList: Array<{ key: string; label: string }>;
};

type ComponentSettingsApplicationProps = {
    component?: Component;
    allowedComponents?: Array<string>;
    options?: ComponentOptions;
    additionalConfigElements?: HTMLElement[];
    additionalAttributes?: JSONObject;
};

/**
 * @ignore
 * @module
 */
export default class ComponentSettingsApplication extends HandlebarsApplicationMixin(
    ApplicationV2<ComponentSettingsApplicationContext>
) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: ComponentSettingsApplication.saveHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: ComponentSettingsApplication.cancel,
            delete: ComponentSettingsApplication.delete
        },
        window: {
            title: 'CSB.ComponentProperties.ComponentDialog.Edit.Title',
            icon: 'fas fa-puzzle',
            resizable: true,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 560,
            height: 'auto' as const
        },
        classes: ['custom-system-componentSettings']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/_template/dialogs/componentSettings.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    static async saveHandler(
        this: ComponentSettingsApplication,
        _event: Event,
        form: HTMLFormElement,
        formData: foundry.applications.ux.FormDataExtended
    ) {
        const configData = foundry.utils.expandObject(formData.object) as ComponentConfigFormData;

        const newCompType = configData.type as string;

        if (newCompType) {
            const componentClass = componentFactory.getComponentClass(newCompType);

            const fieldData = componentClass.extractConfig(configData, form) as ComponentJson;

            try {
                componentClass.validateConfig(fieldData);

                this.parentComponent.validateComponent(fieldData, this.entity, this.component);

                if (this.component) {
                    await this.component.update(this.entity, fieldData);
                } else {
                    await this.parentComponent.addNewComponent(this.entity, fieldData, this.componentOptions);
                }

                await this.close();
            } catch (err) {
                Logger.error((err as Error).message, err);
                ui.notifications.error((err as Error).message);
            }
        }
    }

    static async cancel(this: ComponentSettingsApplication, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    static async delete(this: ComponentSettingsApplication, _event: PointerEvent, _target: HTMLElement) {
        const shouldDelete = (await foundry.applications.api.DialogV2.confirm({
            content: `<p>${game.i18n.localize('CSB.ComponentProperties.ComponentDialog.Delete.Content')}</p>`,
            rejectClose: false,
            modal: true
        })) as boolean;

        if (shouldDelete) {
            await this.component?.delete(this.entity, true);
        }

        await this.close();
    }

    private readonly component?: Component;
    private readonly allowedComponents: Array<string>;
    private readonly componentOptions?: ComponentOptions;
    private readonly additionalConfigElements: HTMLElement[];
    private readonly additionalAttributes: JSONObject;

    constructor(
        private readonly entity: BuilderTemplateSystem,
        private readonly parentComponent: Container,
        props?: ComponentSettingsApplicationProps
    ) {
        super();

        this.component = props?.component;
        this.allowedComponents = props?.allowedComponents ?? [];
        this.componentOptions = props?.options;
        this.additionalConfigElements = props?.additionalConfigElements ?? [];
        this.additionalAttributes = props?.additionalAttributes ?? {};
    }

    public addAdditionalConfigElement(element: HTMLElement) {
        this.additionalConfigElements.push(element);
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.appId = this.id;

        const componentData = this.component
            ? (foundry.utils.mergeObject(this.component?.toJSON(), this.additionalAttributes) as ComponentJson &
                  JSONObject)
            : undefined;

        context.component = componentData ?? {};
        context.PERMISSION_LIST = getLocalizedPermissionList('number');
        context.ROLE_LIST = getLocalizedRoleList('number');
        context.ALIGNMENT_LIST = getLocalizedAlignmentList();

        context.additionalSections = this.additionalConfigElements ?? [];

        context.componentSections = {};
        context.componentList = [];
        // Component settings
        for (const componentType of componentFactory.componentTypes) {
            if (this.allowedComponents.length === 0 || this.allowedComponents.includes(componentType)) {
                const componentClass = componentFactory.getComponentClass(componentType);

                if (
                    componentClass.publicComponent ||
                    (this.allowedComponents.length > 0 && this.allowedComponents.includes(componentType))
                ) {
                    const componentDiv = document.createElement('div');
                    componentDiv.classList = `custom-system-component-editor custom-system-${componentType}-editor`;
                    componentDiv.append(await componentClass.getConfigForm(this.entity, this.id, componentData));

                    context.componentSections[componentType] = componentDiv;
                    context.componentList.push({ key: componentType, label: componentClass.getPrettyName() });
                }
            }
        }

        // Buttons
        context.buttons = [{ type: 'submit', icon: 'fa-solid fa-save', label: 'Save' }];
        if (this.component) {
            context.buttons.push({
                type: 'button',
                action: 'delete',
                icon: 'fa-solid fa-trash',
                label: 'Delete'
            });
        }
        context.buttons.push({
            type: 'button',
            action: 'cancel',
            icon: 'fa-solid fa-xmark',
            label: 'Cancel'
        });

        return context;
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    protected async _onRender(context: never, options: never) {
        await super._onRender(context, options);

        const typedContext = context as ComponentSettingsApplicationContext;

        const mainDiv = this.element.querySelector('.custom-system-component-editor-dialog') as HTMLDivElement;

        typedContext.additionalSections.forEach((section) => {
            mainDiv?.append(section);
        });

        let currentType = typedContext.component.type ?? typedContext.componentList[0].key;
        const initialSection = typedContext.componentSections[currentType];
        mainDiv?.appendChild(initialSection);
        initialSection.style.display = 'block';

        const typeSelect = mainDiv.querySelector<HTMLSelectElement>('select.compType');
        const keyInput = mainDiv.querySelector<HTMLInputElement>('input.compKey');

        // Change displayed fields based on previous and new types
        function changeDisplayedControls(ev: Event) {
            const target = ev.currentTarget as HTMLSelectElement;
            const newType = target.value;

            // Hide previous type's fields
            $(typedContext.componentSections[currentType]).slideUp(200, () => {
                typedContext.componentSections[currentType].remove();
                currentType = newType;
            });

            const newSection = typedContext.componentSections[newType];

            // Show new type's fields
            mainDiv.append(newSection);
            $(newSection).slideDown(200);
        }

        typeSelect?.addEventListener('change', changeDisplayedControls);

        function checkComponentKey() {
            const val = keyInput?.value;

            if (val && val.match(/^[a-zA-Z0-9_]+$/)) {
                if (mathjsBlacklist.has(val)) {
                    $(mainDiv).find('.custom-system-key-warning').show();
                } else {
                    try {
                        // @ts-expect-error Global var
                        math.parse(val);
                        // @ts-expect-error Global var
                        math.evaluate(val);
                        $(mainDiv).find('.custom-system-key-warning').show();
                    } catch (_err) {
                        $(mainDiv).find('.custom-system-key-warning').hide();
                    }
                }
            } else {
                $(mainDiv).find('.custom-system-key-warning').hide();
            }
        }

        keyInput?.addEventListener('change', checkComponentKey);
        checkComponentKey();

        this.element.addEventListener('keyup', (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.key === 'Enter') {
                void this.submit();
            }
        });

        this.setPosition({ top: 0 });
    }
}
