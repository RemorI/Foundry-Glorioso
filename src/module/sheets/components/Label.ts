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

import { JSONValue } from 'fvtt-types/utils';

import CustomDialogV2 from '../../applications/CustomDialogV2.js';
import { JSONObject, Primitive } from '../../definitions.js';
import CustomItem from '../../documents/CustomItem.js';
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import AbortFormulaError from '../../errors/AbortFormulaError.js';
import { ComputablePhraseOptions } from '../../formulas/ComputablePhrase.js';
import ChatSenderElement, { ChatSenderMap, SendToChatFunction } from '../../interfaces/ChatSenderElement.js';
import ComputableElement, { ComputeParameters } from '../../interfaces/ComputableElement.js';
import Logger from '../../Logger.js';
import { getValueFromProseMirror, replaceValueInProseMirror, trimProseMirrorEmptyValue } from '../../utils.js';
import { ComponentConfigFormData, ComponentRenderOptions, ComponentValueType } from './Component.js';
import Container from './Container.js';
import SizedComponent, { COMPONENT_SIZES, SizedComponentJson, SizedComponentProps } from './SizedComponent.js';

export const LABEL_STYLES = {
    label: 'CSB.ComponentProperties.Label.LabelStyle.Default',
    title: 'CSB.ComponentProperties.Label.LabelStyle.Title',
    subtitle: 'CSB.ComponentProperties.Label.LabelStyle.Subtitle',
    bold: 'CSB.ComponentProperties.Label.LabelStyle.Boldtext',
    button: 'CSB.ComponentProperties.Label.LabelStyle.Button'
};

type LabelStyle = keyof typeof LABEL_STYLES;

const defaultLabelStyle: LabelStyle = 'label';

export type LabelProps = SizedComponentProps & {
    icon?: string;
    value?: string;
    prefix?: string;
    suffix?: string;
    rollMessage?: string;
    altRollMessage?: string;
    rollMessageToChat?: boolean;
    altRollMessageToChat?: boolean;
    style?: LabelStyle;
};

export type LabelJson = SizedComponentJson & {
    icon?: string;
    value?: string;
    prefix?: string;
    suffix?: string;
    rollMessage?: string;
    altRollMessage?: string;
    rollMessageToChat?: boolean;
    altRollMessageToChat?: boolean;
    style?: LabelStyle;
};

/**
 * Label component
 * @ignore
 */
class Label extends SizedComponent implements ComputableElement, ChatSenderElement {
    static valueType: ComponentValueType = 'none';

    /**
     * Label icon
     */
    protected _icon?: string;

    /**
     * Label formula to display
     */
    protected _value?: string;

    /**
     * Label prefix
     */
    protected _prefix?: string;

    /**
     * Label suffix
     */
    protected _suffix?: string;

    /**
     * Label roll message
     */
    public _rollMessage?: string;

    /**
     * Label roll message
     */
    public _altRollMessage?: string;

    /**
     * Should roll message be sent to chat
     */
    protected _rollMessageToChat: boolean;

    /**
     * Should alt roll message be sent to chat
     */
    protected _altRollMessageToChat: boolean;

    /**
     * Label style
     */
    protected _style: LabelStyle;

    /**
     * Label constructor
     */
    constructor(props: LabelProps) {
        super(props);

        this._icon = props.icon;
        this._value = props.value;
        this._prefix = props.prefix;
        this._suffix = props.suffix;
        this._rollMessage = props.rollMessage;
        this._altRollMessage = props.altRollMessage;
        this._rollMessageToChat = props.rollMessageToChat ?? true;
        this._altRollMessageToChat = props.altRollMessageToChat ?? true;
        this._style = props.style ?? defaultLabelStyle;
    }

    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    protected async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        const { customProps = {}, linkedEntity, reference } = options;

        let jQElement;
        switch (this._style) {
            case 'title':
                jQElement = $('<h3></h3>');
                break;
            case 'subtitle':
                jQElement = $('<h4></h4>');
                break;
            case 'bold':
                jQElement = $('<b></b>');
                break;
            case 'button':
                jQElement = $('<a></a>');
                jQElement.addClass('button');
                break;
            case 'label':
            default:
                jQElement = $('<span></span>');
                break;
        }

        let content = '';
        let labelValue = '';

        const contentDiv = $('<div></div>');

        contentDiv.addClass('custom-system-label');

        if (this._style) {
            contentDiv.addClass('custom-system-label-' + this._style);
        }

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            if (this._prefix) {
                content += this._prefix;
            }

            content += this._value === '' ? '&#9744;' : this._value;

            if (this._suffix) {
                content += this._suffix;
            }

            if (this.escapeHTML) {
                contentDiv.text(content);
            } else {
                contentDiv.append(content);
            }
        } else if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            const formulaProps = foundry.utils.mergeObject(entity.getRollData(), customProps, {
                inplace: false
            });

            if (this._prefix) {
                try {
                    content +=
                        (
                            await ComputablePhrase.computeMessage(this._prefix, formulaProps, {
                                source: `${this.key}.prefix`,
                                reference,
                                defaultValue: '',
                                triggerEntity: entity,
                                linkedEntity
                            })
                        ).result ?? game.i18n.localize('CSB.Formula.PREFIXERROR');
                } catch (err) {
                    Logger.error((err as Error).message, err);
                    content += game.i18n.localize('CSB.Formula.PREFIXERROR');
                }
            }

            // If Label has a key, it was computed with the derivedData of the entity, no need to recompute it
            if (
                this.key &&
                foundry.utils.getProperty(formulaProps, this.key) !== null &&
                foundry.utils.getProperty(formulaProps, this.key) !== undefined
            ) {
                labelValue = String(
                    foundry.utils.getProperty(formulaProps, this.key) ?? game.i18n.localize('CSB.Formula.ERROR')
                );
                Logger.debug('Using precomputed value for ' + this.key + ' : ' + labelValue);
            } else {
                try {
                    labelValue =
                        (
                            await ComputablePhrase.computeMessage(this._value ?? '', formulaProps, {
                                source: `${this.key}`,
                                reference,
                                defaultValue: '',
                                triggerEntity: entity,
                                linkedEntity
                            })
                        ).result ?? game.i18n.localize('CSB.Formula.ERROR');
                } catch (err) {
                    Logger.error((err as Error).message, err);
                    labelValue = game.i18n.localize('CSB.Formula.ERROR');
                }
            }

            content += labelValue;

            if (this._suffix) {
                try {
                    content +=
                        (
                            await ComputablePhrase.computeMessage(this._suffix, formulaProps, {
                                source: `${this.key}.suffix`,
                                reference,
                                defaultValue: '',
                                triggerEntity: entity,
                                linkedEntity
                            })
                        ).result ?? game.i18n.localize('CSB.Formula.SUFFIXERROR');
                } catch (err) {
                    Logger.error((err as Error).message, err);
                    content += game.i18n.localize('CSB.Formula.SUFFIXERROR');
                }
            }

            contentDiv.append(content);
        }

        const baseElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-label-root');

        const iconDiv = $('<div></div>');
        iconDiv.addClass('custom-system-label-icons');

        if (this._icon) {
            const iconElement = $('<i></i>');
            iconElement.addClass('custom-system-roll-icon fas fa-' + this._icon);

            iconDiv.append(iconElement);
        }

        jQElement.append(iconDiv);

        contentDiv.attr('data-value', labelValue);
        contentDiv.attr('data-name', this.key ?? '');
        jQElement.append(contentDiv);

        if (isEditable && this._rollMessage) {
            let rollElement = jQElement;

            if (this._style !== 'button') {
                rollElement = $('<a></a>');
                rollElement.append(jQElement);
                rollElement.addClass('custom-system-rollable');
            }

            const rollIcon = game.settings.get(game.system.id, 'rollIcon');
            if (rollIcon) {
                const rollIconElement = $('<i></i>');
                rollIconElement.addClass('custom-system-roll-icon fas fa-' + rollIcon);
                iconDiv.prepend(rollIconElement);
                iconDiv.prepend(rollIconElement);
            }

            if (TemplateSystem.isAppliedTemplateSystem(entity)) {
                rollElement.on('click', (ev) => {
                    let rollMessage, postMessage, source;
                    if (ev.shiftKey) {
                        rollMessage = this._altRollMessage;
                        postMessage = this._altRollMessageToChat;
                        source = 'alternativeLabelRollMessage';
                    } else {
                        rollMessage = this._rollMessage;
                        postMessage = this._rollMessageToChat;
                        source = 'labelRollMessage';
                    }

                    if (rollMessage) {
                        void this._generateChatFunction(rollMessage, entity, {
                            source: `${this.key}.${source}`,
                            reference,
                            customProps: options.customProps,
                            linkedEntity
                        })(postMessage);
                    }
                });

                if (this.key) {
                    rollElement.on('contextmenu', (ev) => {
                        const contextMenuElement = $('<nav></nav>');
                        contextMenuElement.attr('id', `context-menu`);
                        contextMenuElement.addClass('custom-system-roll-context');

                        const contextActionList = $('<ol></ol>');
                        contextActionList.addClass('context-items');

                        const contextActions = this.getContextMenu(entity, linkedEntity, contextMenuElement);

                        if (this._altRollMessage) {
                            contextActions.push(...this.getContextMenu(entity, linkedEntity, contextMenuElement, true));
                        }

                        for (const action of contextActions) {
                            const actionBullet = $('<li></li>');
                            actionBullet.addClass('context-item');
                            actionBullet.html(action.icon + action.name);
                            actionBullet.on('click', action.callback);

                            contextActionList.append(actionBullet);
                        }

                        contextMenuElement.append(contextActionList);
                        $('body').append(contextMenuElement);

                        // Set the position
                        const locationX = ev.pageX;
                        const locationY = ev.pageY;
                        contextMenuElement.css(
                            'left',
                            `${Math.min(locationX, window.innerWidth - ((contextMenuElement.width() ?? 0) + 3))}px`
                        );
                        contextMenuElement.css(
                            'top',
                            `${Math.min(
                                locationY + 3,
                                window.innerHeight - ((contextMenuElement.height() ?? 0) + 3)
                            )}px`
                        );
                        contextMenuElement.css('zIndex', ++foundry.applications.api.ApplicationV2._maxZ);

                        $('body').one('mousedown', (ev) => {
                            if (contextMenuElement.has($(ev.target)[0]).length === 0) {
                                contextMenuElement.slideUp(200, () => {
                                    contextMenuElement.remove();
                                });
                            }
                        });
                    });

                    rollElement.attr('draggable', 'true');
                    rollElement.on('dragstart', (ev) => {
                        const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);

                        if (!rollCode) {
                            return;
                        }

                        let chatCommand = '/sheetRoll ' + rollCode;
                        let macroPrefix = '';

                        if (ev.shiftKey && this._altRollMessage) {
                            chatCommand = '/sheetAltRoll ' + rollCode;
                            macroPrefix = '[ALT] ';
                        }

                        if (ev.originalEvent) {
                            if (ev.originalEvent.dataTransfer) {
                                const macroData: Partial<Macro.CreateData> = {
                                    name: `${macroPrefix}${this.key!}`,
                                    type: CONST.MACRO_TYPES.CHAT,
                                    author: game.user.id,
                                    command: chatCommand,
                                    folder: null
                                };

                                if (linkedEntity) {
                                    macroData.name = `${macroPrefix}${linkedEntity.name ?? this.key!}`;
                                    macroData.img = linkedEntity.img;
                                }

                                ev.originalEvent.dataTransfer.setData(
                                    'text/plain',
                                    JSON.stringify({
                                        type: 'Macro',
                                        data: macroData
                                    })
                                );
                            }
                        }
                    });
                }
            }

            jQElement = rollElement;
        }

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            jQElement.addClass('custom-system-editable-component');
            jQElement.on('click', () => {
                this.editComponent(entity);
            });
        }

        if (iconDiv.children().length === 0) {
            iconDiv.hide();
        }

        baseElement.append(jQElement);
        return baseElement;
    }

    getContextMenu(
        entity: AppliedTemplateSystem,
        linkedEntity: CustomItem | undefined,
        contextMenuElement: JQuery<HTMLElement>,
        isAlternative: boolean = false
    ): Array<{ name: string; icon: string; callback: () => void }> {
        return [
            {
                name: game.i18n.localize(
                    `CSB.ComponentProperties.Label.Actions.Add${isAlternative ? 'Alt' : ''}AsMacro`
                ),
                icon: '<i class="fas fa-scroll"></i>',
                callback: () => {
                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);

                    if (!rollCode) {
                        return;
                    }

                    const chatCommand = `/sheet${isAlternative ? 'Alt' : ''}Roll ` + rollCode;

                    void foundry.applications.handlebars
                        .renderTemplate(`systems/${game.system.id}/templates/_template/dialogs/addLabelMacro.hbs`, {
                            appId: foundry.utils.randomID()
                        })
                        .then((contents) => {
                            void new CustomDialogV2({
                                window: {
                                    title: game.i18n.localize('CSB.ComponentProperties.Label.AddMacroDialog.Title')
                                },
                                content: contents,
                                buttons: {
                                    save: {
                                        label: game.i18n.localize('Save'),
                                        callback: async (
                                            _event: PointerEvent | SubmitEvent,
                                            _button: HTMLButtonElement,
                                            dialog: HTMLDialogElement
                                        ) => {
                                            const macroName = $(dialog).find('.macroName').val()?.toString() ?? '';
                                            if (macroName === '') {
                                                throw new Error(
                                                    game.i18n.localize(
                                                        'CSB.ComponentProperties.Label.AddMacroDialog.MacroNameError'
                                                    )
                                                );
                                            }

                                            const pageNumber =
                                                parseInt($(dialog).find('.macroPage').val()?.toString() ?? '0') - 1;
                                            let slotNumber = parseInt(
                                                $(dialog).find('.macroSlot').val()?.toString() ?? '-1'
                                            );

                                            if (pageNumber < 0 || pageNumber > 4) {
                                                throw new Error(
                                                    game.i18n.localize(
                                                        'CSB.ComponentProperties.Label.AddMacroDialog.MacroPageError'
                                                    )
                                                );
                                            }

                                            if (slotNumber < 0 || slotNumber > 9) {
                                                throw new Error(
                                                    game.i18n.localize(
                                                        'CSB.ComponentProperties.Label.AddMacroDialog.MacroSlotError'
                                                    )
                                                );
                                            }

                                            if (slotNumber === 0) {
                                                slotNumber = 10;
                                            }

                                            const finalSlotNumber = String(pageNumber * 10 + slotNumber);

                                            const newMacro = await Macro.create({
                                                name: macroName,
                                                type: CONST.MACRO_TYPES.CHAT,
                                                author: game.user.id,
                                                command: chatCommand,
                                                folder: null
                                            });

                                            await game.user.assignHotbarMacro(newMacro!, parseInt(finalSlotNumber));
                                            // oxlint-disable-next-line @typescript-eslint/no-deprecated
                                            await newMacro!.sheet!.render(true);
                                        }
                                    },
                                    cancel: {
                                        label: game.i18n.localize('Cancel')
                                    }
                                },
                                position: {
                                    width: 'auto'
                                }
                            }).render({ force: true });
                        });

                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            },
            {
                name: game.i18n.localize(
                    `CSB.ComponentProperties.Label.Actions.Copy${isAlternative ? 'Alt' : ''}ChatCommand`
                ),
                icon: '<i class="fas fa-comment"></i>',
                callback: () => {
                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);

                    if (!rollCode) {
                        return;
                    }

                    const chatCommand = `/sheet${isAlternative ? 'Alt' : ''}Roll ` + rollCode;

                    navigator.clipboard
                        .writeText(chatCommand)
                        .then(() => {
                            ui.notifications.info(
                                game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyChatCommandSuccess')
                            );
                        })
                        .catch(() => {
                            void foundry.applications.api.DialogV2.prompt({
                                window: {
                                    title: game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyChatCommand')
                                },
                                content: `<p>${game.i18n.localize(
                                    'CSB.ComponentProperties.Label.Actions.CopyChatCommandFailure'
                                )}</p><input type="text" value="${chatCommand}" autofocus />`,
                                ok: {
                                    label: game.i18n.localize('Close')
                                }
                            });
                        });

                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            },
            {
                name: game.i18n.localize(
                    `CSB.ComponentProperties.Label.Actions.Copy${isAlternative ? 'Alt' : ''}MacroScript`
                ),
                icon: '<i class="fas fa-cogs"></i>',
                callback: () => {
                    Logger.log('Copying script for ' + this.key);

                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);

                    if (!rollCode) {
                        return;
                    }

                    const chatCommand =
                        'let rollMessage = await actor.roll(\n' +
                        "    '" +
                        rollCode +
                        "',\n" +
                        `    { postMessage: false${isAlternative ? ', alternative: true' : ''}}\n` +
                        ');\n\n' +
                        'let speakerData = ChatMessage.getSpeaker({\n' +
                        '    actor: actor,\n' +
                        '    token: actor.getActiveTokens()?.[0]?.document,\n' +
                        '    scene: game.scenes.current\n' +
                        '});\n\n' +
                        'rollMessage.postMessage({speaker: speakerData});';

                    navigator.clipboard
                        .writeText(chatCommand)
                        .then(() => {
                            ui.notifications.info(
                                game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyMacroScriptSuccess')
                            );
                        })
                        .catch(() => {
                            void foundry.applications.api.DialogV2.prompt({
                                window: {
                                    title: game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyMacroScript')
                                },
                                content: `<p>${game.i18n.localize(
                                    'CSB.ComponentProperties.Label.Actions.CopyMacroScriptFailure'
                                )}</p><input type="text" value="${chatCommand}" autofocus />`,
                                ok: {
                                    label: game.i18n.localize('Close')
                                }
                            });
                        });

                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            }
        ];
    }

    getRollCode(entity: AppliedTemplateSystem, itemId?: string) {
        let rollCode = this.key;

        if (this.key?.includes('.') && itemId) {
            const [dynamicTable, _rowNum, targetRoll] = this.key.split('.');
            rollCode = dynamicTable + `(@rowId=${itemId})` + '.' + targetRoll;
        } else if (this.key?.includes('.')) {
            const [dynamicTable, rowNum, targetRoll] = this.key.split('.');

            const propRowData = foundry.utils.getProperty(entity.getRollData(), dynamicTable + '.' + rowNum) as Record<
                string,
                JSONValue
            >;

            let rowFilter = null;
            for (const prop in propRowData) {
                if (typeof propRowData[prop] === 'string' && propRowData[prop].length > 0) {
                    rowFilter = `(${prop}=${propRowData[prop]})`;
                    break;
                }
            }

            if (rowFilter) {
                rollCode = dynamicTable + rowFilter + '.' + targetRoll;
            } else {
                ui.notifications.error(game.i18n.localize('CSB.UserMessages.Label.ChatCommandeCreationError'));
                rollCode = undefined;
            }
        }

        return rollCode;
    }

    getComputeFunctions(
        entity: TemplateSystem,
        options?: ComponentRenderOptions,
        keyOverride?: string
    ): Array<ComputeParameters> {
        const computationKey = keyOverride ?? this.key;

        if (!computationKey) {
            return [];
        }

        return [
            {
                key: computationKey,
                formula: this._value ?? '',
                context: entity,
                options
            }
        ];
    }

    resetComputeValue(valueKeys: Array<string>): Record<string, Primitive> {
        const resetValues: Record<string, null> = {};

        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, undefined);
        }

        return resetValues;
    }

    getSendToChatFunctions(entity: TemplateSystem, options: ComputablePhraseOptions = {}): ChatSenderMap | undefined {
        if (!this.key) {
            return undefined;
        }

        const res: ChatSenderMap = {};

        if (this._rollMessage) {
            res.main = this._generateChatFunction(this._rollMessage, entity, options, this._rollMessageToChat);
        }
        if (this._altRollMessage) {
            res.alternative = this._generateChatFunction(
                this._altRollMessage,
                entity,
                options,
                this._altRollMessageToChat
            );
        }

        if (Object.keys(res).length === 0) {
            return undefined;
        }

        return {
            [this.key]: res
        };
    }

    private _generateChatFunction(
        rollMessage: string,
        entity: TemplateSystem,
        options: ComponentRenderOptions = {},
        defaultPostMessage: boolean = true
    ): SendToChatFunction {
        return async (postMessage?: boolean, overrideOptions: ComputablePhraseOptions = {}) => {
            const phrase = new ComputablePhrase(rollMessage);

            try {
                await phrase.compute(
                    {
                        ...entity.getRollData(),
                        ...options.customProps
                    },
                    {
                        ...options,
                        ...overrideOptions,
                        computeExplanation: true,
                        triggerEntity: entity
                    }
                );

                if (postMessage ?? defaultPostMessage) {
                    let speakerEntity;
                    switch (entity.entityType) {
                        case 'actor':
                            speakerEntity = entity.entity as Actor.Stored;
                            break;
                        case 'item':
                            speakerEntity = entity.entity.parent as Actor.Stored;
                            break;
                        default:
                            speakerEntity = null;
                    }

                    const speakerData = ChatMessage.getSpeaker({
                        actor: speakerEntity,
                        token: (speakerEntity?.getActiveTokens()?.[0]?.document as TokenDocument.Stored) ?? null,
                        scene: game.scenes.current
                    });

                    phrase.postMessage({
                        style: CONST.CHAT_MESSAGE_STYLES.IC,
                        speaker: speakerData
                    });
                }
            } catch (err) {
                if (err instanceof AbortFormulaError) {
                    Logger.info(`Chat message aborted : ${err.message}`);
                } else {
                    throw err;
                }
            }

            return phrase;
        };
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): LabelJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            icon: this._icon,
            value: this._value ?? '',
            prefix: this._prefix ?? '',
            suffix: this._suffix ?? '',
            rollMessage: this._rollMessage,
            altRollMessage: this._altRollMessage,
            rollMessageToChat: this._rollMessageToChat,
            altRollMessageToChat: this._altRollMessageToChat,
            style: this._style
        };
    }

    /**
     * Creates label from JSON description
     * @override
     */
    static fromJSON(json: LabelJson, templateAddress: string, parent?: Container): Label {
        return new Label({
            ...json,

            parent: parent,
            templateAddress: templateAddress
        });
    }

    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName(): string {
        return 'label';
    }

    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Label');
    }

    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the component
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: LabelJson & JSONObject
    ): Promise<HTMLElement> {
        const mainElt = document.createElement('div');

        const predefinedValuesComponent = { ...existingComponent };

        if (predefinedValuesComponent.rollMessageToChat === undefined) {
            predefinedValuesComponent.rollMessageToChat = true;
        }

        if (predefinedValuesComponent.altRollMessageToChat === undefined) {
            predefinedValuesComponent.altRollMessageToChat = true;
        }

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/label.hbs`,
            {
                ...predefinedValuesComponent,
                COMPONENT_SIZES,
                LABEL_STYLES,
                appId
            }
        );

        mainElt.querySelectorAll("input[data-action='toggleEditor']").forEach((element) => {
            element.addEventListener('click', (event) => {
                const checkbox = event.currentTarget as HTMLInputElement;
                const checkboxEditor = checkbox.dataset.editor ?? '';

                const rawTextArea = mainElt.querySelector<HTMLTextAreaElement>(
                    `textarea[data-key="${checkboxEditor}"]`
                );
                const editor = mainElt.querySelector<foundry.applications.elements.HTMLProseMirrorElement>(
                    `prose-mirror[data-key="${checkboxEditor}"]`
                );

                if (!rawTextArea || !editor) {
                    throw new Error(`Failed to get TextArea or Prose-Mirror editor for "${checkboxEditor}"`);
                }

                if (checkbox.checked) {
                    replaceValueInProseMirror(editor, rawTextArea.value ?? '');
                    editor.style.display = 'flex';
                    rawTextArea.style.display = 'none';
                } else {
                    const editorValue = getValueFromProseMirror(editor);

                    rawTextArea.value = trimProseMirrorEmptyValue(editorValue);

                    rawTextArea.style.display = 'block';
                    editor.style.display = 'none';
                }
            });
        });

        mainElt.querySelector('[name="size"]')?.addEventListener('change', (event) => {
            const target = event.currentTarget as HTMLSelectElement;
            const customSizeBlock = $(mainElt.querySelector('.custom-system-size-custom')!);
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

        mainElt.querySelector('[name="icon"]')?.addEventListener('keyup', (event) => {
            const target = event.currentTarget as HTMLSelectElement;
            const iconCode = target.value;

            const previewBloc = mainElt.querySelector('.csb-icon-preview > i');

            if (previewBloc) {
                previewBloc.classList = `custom-system-roll-icon fas fa-${iconCode}`;
            }
        });

        return mainElt;
    }

    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): LabelJson {
        const configData = <
            {
                labelRichText: boolean;
                labelRichTextPrefix: boolean;
                labelRichTextSuffix: boolean;
                labelRichTextRollMessage: boolean;
                labelRichTextAltRollMessage: boolean;

                valueEditor?: string;
                value?: string;
                prefixEditor?: string;
                prefix?: string;
                suffixEditor?: string;
                suffix?: string;
                rollMessageEditor?: string;
                rollMessage?: string;
                altRollMessageEditor?: string;
                altRollMessage?: string;

                labelStyle?: LabelStyle;
                icon?: string;
                rollMessageToChat?: boolean;
                altRollMessageToChat?: boolean;
            }
        >rawConfigData;

        const value = configData.labelRichText ? configData.valueEditor : configData.value;
        const prefix = configData.labelRichTextPrefix ? configData.prefixEditor : configData.prefix;
        const suffix = configData.labelRichTextSuffix ? configData.suffixEditor : configData.suffix;
        const rollMessage = configData.labelRichTextRollMessage ? configData.rollMessageEditor : configData.rollMessage;
        const altRollMessage = configData.labelRichTextAltRollMessage
            ? configData.altRollMessageEditor
            : configData.altRollMessage;

        const fieldData: LabelJson = {
            ...super.extractConfig(configData, html),
            style: configData.labelStyle ?? 'label',
            value: value,
            prefix: prefix,
            suffix: suffix,
            icon: configData.icon,
            rollMessage: rollMessage,
            altRollMessage: altRollMessage,
            rollMessageToChat: configData.rollMessageToChat,
            altRollMessageToChat: configData.altRollMessageToChat
        };

        this.validateConfig(fieldData);

        return fieldData;
    }
}

/**
 * @ignore
 */
export default Label;
