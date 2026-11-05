/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { AnyObject, EmptyObject } from 'fvtt-types/utils';

import CustomDialogV2 from './applications/CustomDialogV2.js';
import type CustomActiveEffect from './documents/CustomActiveEffect.js';
import type CustomActor from './documents/CustomActor.js';
import CustomCombat from './documents/CustomCombat.js';
import CustomCombatant from './documents/CustomCombatant.js';
import type CustomItem from './documents/CustomItem.js';
import { CustomActiveEffectDataModel } from './documents/model/activeEffectModel.js';
import type { CharacterActorDataModel, TemplateActorDataModel } from './documents/model/actorModel.js';
import type { BaseItemDataModel, EquippableItemDataModel, TemplateItemDataModel } from './documents/model/itemModel.js';
import TemplateSystem from './documents/TemplateSystem.js';
import {
    AlphanumericPatternError,
    ComponentValidationError,
    NotGreaterThanZeroError,
    NotUniqueError,
    RequiredFieldError
} from './errors/ComponentValidationError.js';
import { UncomputableError } from './errors/UncomputableError.js';
import type ComputablePhraseClass from './formulas/ComputablePhrase.js';
import Formula from './formulas/Formula.js';
import { FormulaFunctionImporter } from './formulas/FormulaFunctionImporter.js';
import { isAttributeBarElement } from './interfaces/AttributeBarElement.js';
import { isChatSenderElement } from './interfaces/ChatSenderElement.js';
import { isComputableElement } from './interfaces/ComputableElement.js';
import { CharacterSheetV2 } from './sheets/actors/v2/CharacterSheetV2.js';
import { CustomActorSheetV2 } from './sheets/actors/v2/CustomActorSheetV2.js';
import { TemplateSheetV2 } from './sheets/actors/v2/TemplateSheetV2.js';
import type Component from './sheets/components/Component.js';
import type { ComponentJson } from './sheets/components/Component.js';
import type { ComponentFactory } from './sheets/components/ComponentFactory.js';
import type { ContainerJson } from './sheets/components/Container.js';
import Container from './sheets/components/Container.js';
import ExtensibleTable from './sheets/components/ExtensibleTable.js';
import InputComponent from './sheets/components/InputComponent.js';
import CustomActiveEffectConfig from './sheets/CustomActiveEffectConfig.js';
import { EquippableItemSheet } from './sheets/items/equippable-item-sheet.js';
import ActiveEffectContainerItemSheetV2 from './sheets/items/v2/ActiveEffectContainerItemSheetV2.js';
import { CustomItemSheetV2 } from './sheets/items/v2/CustomItemSheetV2.js';
import { EquippableItemSheetV2 } from './sheets/items/v2/EquippableItemSheetV2.js';
import { EquippableItemTemplateSheetV2 } from './sheets/items/v2/EquippableItemTemplateSheetV2.js';
import { SubTemplateItemSheetV2 } from './sheets/items/v2/SubTemplateItemSheetV2.js';
import { UserInputTemplateItemSheetV2 } from './sheets/items/v2/UserInputTemplateItemSheetV2.js';

declare global {
    var ComputablePhrase: typeof ComputablePhraseClass;
    type ComputablePhrase = InstanceType<typeof ComputablePhrase>;

    var componentFactory: ComponentFactory;

    var copiedComponent: { sourceId: string; component: Component } | null;

    var DeepDiff: {
        diff: (d1: JSONObject, d2: JSONObject) => Array<JSONObject>;
        applyChange: (target: JSONObject, source: JSONObject, change: JSONObject) => void;
        revertChange: (target: JSONObject, source: JSONObject, change: JSONObject) => void;
    };

    interface Game {
        CustomSystemBuilder: {
            API: {
                Components: {
                    Component: typeof Component;
                    InputComponent: typeof InputComponent;
                    Container: typeof Container;
                    ExtensibleTable: typeof ExtensibleTable;
                    componentFactory: ComponentFactory;
                    isChatSenderElement: typeof isChatSenderElement;
                    isAttributeBarElement: typeof isAttributeBarElement;
                    isComputableElement: typeof isComputableElement;
                };
                TemplateSystem: typeof TemplateSystem;
                Errors: {
                    AlphanumericPatternError: typeof AlphanumericPatternError;
                    ComponentValidationError: typeof ComponentValidationError;
                    NotGreaterThanZeroError: typeof NotGreaterThanZeroError;
                    NotUniqueError: typeof NotUniqueError;
                    RequiredFieldError: typeof RequiredFieldError;
                    UncomputableError: typeof UncomputableError;
                };
                Formulas: {
                    ComputablePhrase: typeof ComputablePhrase;
                    Formula: typeof Formula;
                    FormulaFunctionImporter: typeof FormulaFunctionImporter;
                };
            };
        };
    }

    var focusedApp: string;
}

export type DefinedPrimitive = boolean | number | string;
export type Primitive = boolean | null | number | string | undefined;

export type JSONValue = Primitive | JSONObject | JSONArray;

export interface JSONObject {
    [key: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export interface DeepNestedObject<T> {
    [key: string]: T | DeepNestedObject<T>;
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/* CSB SPECIFIC TYPES */

export type HiddenProp = {
    name: string;
    value: string;
};

export type AttributeBar = {
    max: string;
    value: string;
    editable: boolean;
};

export type RollOptions = {
    postMessage?: boolean;
    alternative?: boolean;
};

export type TableJson = Omit<ContainerJson, 'contents'> & {
    contents: Array<Array<ComponentJson | null>>;
    cols: number;
    rows: number;
    layout?: string;
};

export type CustomSystemExport = {
    isCustomSystemExport: boolean;
    actors: CustomActorExport[];
    items: CustomItemExport[];
};

export type CustomActorExport = {
    id?: string;
    type: '_template';
    name: string;
    data: TemplateActorDataModel;
    flags: JSONObject;
};

export type CustomItemExport = {
    id?: string;
    type: 'subTemplate' | '_equippableItemTemplate' | 'userInputTemplate';
    name: string;
    data: TemplateItemDataModel;
    flags: JSONObject;
};

/*********************************/
/* Modules API                   */
/*********************************/
export type ChatCommandsAPI = {
    register: (data: {
        name: string;
        module: string;
        aliases?: Array<string>;
        description?: string;
        icon?: string;
        requiredRole?: CONST.USER_ROLE_NAMES;
        callback?: (
            chat: foundry.applications.sidebar.tabs.ChatLog,
            parameters: string,
            messageData: ChatMessage.CreateData
        ) => ChatMessage.CreateData | EmptyObject | undefined;
        autocompleteCallback?: (
            menu: AnyObject,
            alias: string,
            parameters: string
        ) => Array<string> | Promise<Array<HTMLElement>>;
        closeOnComplete?: boolean;
    }) => void;
};

export type CustomStatusEffect = CONFIG.StatusEffect & {
    linkedEffectId?: string;
    linkedEffect?: CustomActiveEffect;
};

declare module 'fvtt-types/configuration' {
    interface ConfiguredActor<SubType extends Actor.SubType> {
        document: CustomActor<SubType>;
    }

    interface ConfiguredItem<SubType extends Item.SubType> {
        document: CustomItem<SubType>;
    }

    interface ConfiguredActiveEffect<SubType extends ActiveEffect.SubType> {
        document: CustomActiveEffect<SubType>;
    }

    interface ConfiguredCombat<SubType extends Combat.SubType> {
        document: CustomCombat<SubType>;
    }

    interface ConfiguredCombatant<SubType extends Combatant.SubType> {
        document: CustomCombatant<SubType>;
    }

    interface DataModelConfig {
        Item: {
            equippableItem: typeof EquippableItemDataModel;
            _equippableItemTemplate: typeof TemplateItemDataModel;
            subTemplate: typeof BaseItemDataModel;
            userInputTemplate: typeof BaseItemDataModel;
            activeEffectContainer: typeof BaseItemDataModel;
        };
        Actor: {
            character: typeof CharacterActorDataModel;
            _template: typeof TemplateActorDataModel;
            base: typeof CharacterActorDataModel;
        };
        ActiveEffect: {
            base: typeof CustomActiveEffectDataModel;
        };
    }

    interface AssumeHookRan {
        setup: never; // the type doesn't matter
        ready: never; // the type doesn't matter
    }

    //TODO strongly type flags
    interface FlagConfig {
        Actor: JSONObject;
        Item: JSONObject;
        ActiveEffect: JSONObject;
        User: JSONObject;
    }

    //TODO strongly type settings
    interface SettingConfig {
        [K: `${string}.${string}`]: string | object | boolean | number | undefined | null;
    }

    // oxlint-disable-next-line @typescript-eslint/no-namespace
    namespace Hooks {
        interface ApplicationV2Config {
            CustomActorSheetV2: CustomActorSheetV2;
            CharacterSheetV2: CharacterSheetV2;
            TemplateSheetV2: TemplateSheetV2;
            CustomActiveEffectConfig: CustomActiveEffectConfig;
            EquippableItemSheetV2: EquippableItemSheetV2;
            EquippableItemTemplateSheetV2: EquippableItemTemplateSheetV2;
            ActiveEffectContainerItemSheetV2: ActiveEffectContainerItemSheetV2;
            CustomItemSheetV2: CustomItemSheetV2;
            SubTemplateItemSheetV2: SubTemplateItemSheetV2;
            UserInputTemplateItemSheetV2: UserInputTemplateItemSheetV2;
            CustomDialogV2: CustomDialogV2;
        }

        interface ApplicationConfig {
            EquippableItemSheet: EquippableItemSheet;
        }

        //@ts-expect-error Outdated types
        interface HookConfig {
            customSystemBuilderInit: () => void;
            customSystemBuilderReady: () => void;

            chatCommandsReady: (chatCommands: ChatCommandsAPI) => void;

            getActorContextOptions: (
                _application: unknown,
                controls: foundry.applications.ux.ContextMenu.Entry<HTMLElement | JQuery>[]
            ) => void;
            getItemContextOptions: (
                _application: unknown,
                controls: foundry.applications.ux.ContextMenu.Entry<HTMLElement | JQuery>[]
            ) => void;
        }
    }
}

export type AppliedTemplateEntity = CustomActor<'character'> | CustomItem<'equippableItem'>;
export type BuilderTemplateEntity =
    | CustomActor<'_template'>
    | CustomItem<'_equippableItemTemplate'>
    | CustomItem<'subTemplate'>
    | CustomItem<'userInputTemplate'>;
export type FullBuilderTemplateEntity = CustomActor<'_template'> | CustomItem<'_equippableItemTemplate'>;
export type FullTemplateEntity = AppliedTemplateEntity | FullBuilderTemplateEntity;

export function isAppliedTemplateEntity(entity: unknown): entity is AppliedTemplateEntity {
    return !!entity && ['character', 'equippableItem'].includes((entity as AnyObject).type as string);
}

export function isBuilderTemplateEntity(entity: unknown): entity is FullBuilderTemplateEntity {
    return (
        !!entity &&
        ['_template', '_equippableItemTemplate', 'subTemplate', 'userInputTemplate'].includes(
            (entity as AnyObject).type as string
        )
    );
}

export function isFullBuilderTemplateEntity(entity: unknown): entity is FullBuilderTemplateEntity {
    return !!entity && ['_template', '_equippableItemTemplate'].includes((entity as AnyObject).type as string);
}

export function isFullTemplateEntity(entity: unknown): entity is FullTemplateEntity {
    return isAppliedTemplateEntity(entity) || isFullBuilderTemplateEntity(entity);
}

export function isBaseSheetTemplateEntity(
    entity: unknown
): entity is
    | CustomActor<'character'>
    | CustomActor<'_template'>
    | CustomItem<'equippableItem'>
    | CustomItem<'_equippableItemTemplate'> {
    return (
        !!entity &&
        ['character', '_template', 'equippableItem', '_equippableItemTemplate'].includes(
            (entity as AnyObject).type as string
        )
    );
}

export function isBaseTemplateEntity(
    entity: unknown
): entity is
    | CustomActor<'character'>
    | CustomActor<'_template'>
    | CustomItem<'equippableItem'>
    | CustomItem<'_equippableItemTemplate'>
    | CustomItem<'subTemplate'>
    | CustomItem<'userInputTemplate'>
    | CustomItem<'activeEffectContainer'> {
    return (
        !!entity &&
        [
            'character',
            '_template',
            'equippableItem',
            '_equippableItemTemplate',
            'subTemplate',
            'userInputTemplate',
            'activeEffectContainer'
        ].includes((entity as AnyObject).type as string)
    );
}
