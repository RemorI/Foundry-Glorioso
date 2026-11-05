/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DeepPartial } from 'fvtt-types/utils';

/**
 * @ignore
 * @module
 */

const { ApplicationV2 } = foundry.applications.api;

type CustomDialogV2Context = {
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

type CustomDialogV2Configuration = foundry.applications.api.ApplicationV2.Configuration & {
    submitOnClose?: boolean;
    rejectClose?: boolean;
    modal?: boolean;
    buttons: Record<
        string,
        {
            icon: string;
            label: string;
            callback: (
                event: PointerEvent | SubmitEvent,
                button: HTMLButtonElement,
                dialog: HTMLDialogElement
            ) => Promise<void>;
            default: boolean;
            class: string;
        }
    >;
    content: string | HTMLDivElement;
    submit: (
        arg: unknown,
        event: PointerEvent | SubmitEvent,
        button: HTMLButtonElement,
        dialog: HTMLDialogElement
    ) => Promise<void>;
    onRender: (dialog: HTMLElement) => Promise<void>;
};

/**
 * @ignore
 * @module
 */
export default class CustomDialogV2 extends ApplicationV2<CustomDialogV2Context, CustomDialogV2Configuration> {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        id: 'dialog-{id}',
        classes: ['dialog', 'custom-dialog'],
        tag: 'dialog',
        form: {
            closeOnSubmit: true
        },
        window: {
            frame: true,
            positioned: true,
            minimizable: false
        }
    };

    private clickedButton?: string;

    /** @inheritDoc */
    _initializeApplicationOptions(options: never) {
        const typedOptions = super._initializeApplicationOptions(options);
        if (!Object.values(typedOptions.buttons).length)
            throw new Error('You must define at least one entry in options.buttons');

        Object.keys(typedOptions.buttons).forEach((action) => {
            typedOptions.actions[action] = CustomDialogV2._onClickButton;
        });
        return typedOptions;
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.buttons = Object.values(this.options.buttons).map((button) => {
            return {
                type: 'button',
                action: 'onClickButton',
                icon: button.icon,
                label: game.i18n.localize(button.label)
            };
        });

        return context;
    }

    /** @override */
    async _renderHTML(_context: never, _options: never) {
        const contentDiv = document.createElement('div');
        contentDiv.classList = 'dialog-content standard-form';

        if (typeof this.options.content === 'undefined') {
            contentDiv.innerHTML = 'Default dialog content';
        } else if (typeof this.options.content === 'string') {
            contentDiv.innerHTML = this.options.content;
        } else {
            contentDiv.append(this.options.content);
        }

        const footer = document.createElement('footer');
        footer.classList = 'form-footer';
        footer.innerHTML = this._renderButtons();

        const form = document.createElement('form');
        form.className = 'dialog-form standard-form';
        form.autocomplete = 'off';

        form.append(contentDiv);
        form.append(footer);

        form.addEventListener('submit', (event) => {
            void this._onSubmit(event.submitter! as HTMLButtonElement, event);
        });
        return form;
    }

    /** @override */
    async _onFirstRender(_context: never, _options: never): Promise<void> {
        if (this.options.modal) (this.element as HTMLDialogElement).showModal();
        else (this.element as HTMLDialogElement).show();
    }

    async _onRender(context: DeepPartial<CustomDialogV2Context>, options: never): Promise<void> {
        await super._onRender(context, options);

        if (this.options.onRender) {
            await this.options.onRender(this.element);
        }
    }

    /** @override */
    _replaceHTML(result: HTMLFormElement, content: HTMLElement, _options: never) {
        content.replaceChildren(result);
    }

    /**
     * Render configured buttons.
     * @returns {string}
     * @protected
     */
    _renderButtons() {
        return Object.entries(this.options.buttons)
            .map(([action, button]) => {
                const { label, icon, default: isDefault, class: cls = '' } = button;
                return `
        <button type="${isDefault ? 'submit' : 'button'}" data-action="${action}" class="${cls}"
                ${isDefault ? 'autofocus' : ''}>
          ${icon ? `<i class="${icon}"></i>` : ''}
          <span>${game.i18n.localize(label)}</span>
        </button>
      `;
            })
            .join('');
    }

    /* -------------------------------------------- */

    /**
     * Handle submitting the dialog.
     * @param {HTMLButtonElement} target        The button that was clicked or the default button.
     * @param {PointerEvent|SubmitEvent} event  The triggering event.
     * @returns {Promise<DialogV2>}
     * @protected
     */
    async _onSubmit(target: HTMLButtonElement, event: PointerEvent | SubmitEvent, preventClose?: boolean) {
        event.preventDefault();

        let result;

        if (target.dataset.action) {
            const button = this.options.buttons[target.dataset.action];
            result =
                (await button?.callback?.(event, target, this.element as HTMLDialogElement)) ?? target.dataset.action;
        }
        await this.options.submit?.(result, event, target, this.element as HTMLDialogElement);
        return !preventClose && this.options.form?.closeOnSubmit ? this.close() : this;
    }

    async _preClose(_options: never) {
        if (this.options.submitOnClose && !this.clickedButton) {
            let buttonAction = 'close';

            if (!this.options.rejectClose) {
                buttonAction =
                    Object.entries(this.options.buttons).find(([_action, button]) => button.default)?.[0] ??
                    buttonAction;
            }

            if (buttonAction) {
                await this._onSubmit(
                    this.element.querySelector(`[data-action=${buttonAction}]`) as HTMLButtonElement,
                    new SubmitEvent('click'),
                    true
                );
            }
        }
    }

    /**
     * @this {DialogV2}
     * @param {PointerEvent} event        The originating click event.
     * @param {HTMLButtonElement} target  The button element that was clicked.
     * @protected
     */
    static _onClickButton(this: CustomDialogV2, event: PointerEvent, target: HTMLElement) {
        this.clickedButton = target.dataset.action;
        void this._onSubmit(target as HTMLButtonElement, event);
    }
}
