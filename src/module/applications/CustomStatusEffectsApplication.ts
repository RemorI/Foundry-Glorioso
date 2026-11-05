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

// Similar syntax to importing, but note that
// this is object destructuring rather than an actual import

import { CustomStatusEffect } from '../definitions.js';
import CustomActiveEffect, { CustomActiveEffectTinyData } from '../documents/CustomActiveEffect.js';
import Logger from '../Logger.js';
import CustomActiveEffectConfig from '../sheets/CustomActiveEffectConfig.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type CustomStatusEffectsApplicationContext = {
    statusEffects: Array<CustomStatusEffect>;
    specialStatusEffects: Array<{ name: string; localizedName: string; statusEffectId: string }>;
    PREDEFINED_EFFECTS: Array<CustomActiveEffectTinyData>;
    DEFAULT_IMG: string;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

export default class CustomStatusEffectsApplication extends HandlebarsApplicationMixin(
    ApplicationV2<CustomStatusEffectsApplicationContext>
) {
    static DEFAULT_IMG = 'icons/svg/aura.svg';

    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: CustomStatusEffectsApplication.saveHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: CustomStatusEffectsApplication.cancel,
            addEffect: CustomStatusEffectsApplication.addEffect,
            removeEffect: CustomStatusEffectsApplication.removeEffect,
            editImage: CustomStatusEffectsApplication.editImage,
            removeLinkedEffect: CustomStatusEffectsApplication.removeLinkedEffect,
            openEffect: CustomStatusEffectsApplication.openEffect,
            resetEffects: CustomStatusEffectsApplication.resetEffects
        },
        window: {
            title: 'CSB.Settings.CustomStatusEffects.Name',
            icon: 'fas fa-fire',
            resizable: true,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 700,
            height: 'auto' as const
        },
        classes: ['custom-system-customStatusEffects']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/settings/configureStatusEffects.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    static async saveHandler(
        this: CustomStatusEffectsApplication,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormData
    ) {
        type formDataRawResult = {
            effects: Record<string, CustomStatusEffect>;
            specialStatusEffect: Record<string, string>;
        };

        const formDataObj = foundry.utils.expandObject(Object.fromEntries(formData.entries())) as formDataRawResult;
        const effectArray: Array<CustomStatusEffect> = Object.values(formDataObj.effects ?? {});

        if (
            effectArray.some((statusEffect, index) => {
                const isSet = (value: string | undefined | null) => {
                    return value !== undefined && value !== null && value !== '';
                };

                const isValid = isSet(statusEffect.id) && isSet(statusEffect.name) && isSet(statusEffect.img);

                if (!isValid) {
                    Logger.error(`Status effect ${index} is invalid`, statusEffect);
                }

                return !isValid;
            })
        ) {
            Logger.error(game.i18n.localize('CSB.Settings.CustomStatusEffects.StatusEffectInvalid'));
            ui.notifications.error(game.i18n.localize('CSB.Settings.CustomStatusEffects.StatusEffectInvalid'));
            return;
        }

        const finalSpecialEffects = CONFIG.specialStatusEffects as CONFIG.DefaultSpecialStatusEffects;
        for (const key of Object.keys(CONFIG.specialStatusEffects) as Array<keyof CONFIG.DefaultSpecialStatusEffects>) {
            if (
                !formDataObj.specialStatusEffect[key] ||
                !effectArray.some((effect) => effect.id === formDataObj.specialStatusEffect[key])
            ) {
                const localizedName = game.i18n.has(
                    `CSB.Settings.CustomStatusEffects.SpecialStatusEffects.${key}`,
                    true
                )
                    ? game.i18n.localize(`CSB.Settings.CustomStatusEffects.SpecialStatusEffects.${key}`)
                    : key;

                Logger.error(
                    game.i18n.format('CSB.Settings.CustomStatusEffects.SpecialStatusEffectInvalid', {
                        effect: localizedName
                    })
                );
                ui.notifications.error(
                    game.i18n.format('CSB.Settings.CustomStatusEffects.SpecialStatusEffectInvalid', {
                        effect: localizedName
                    })
                );
                return;
            }

            finalSpecialEffects[key] = formDataObj.specialStatusEffect[key];
        }

        CONFIG.statusEffects = effectArray;
        await game.settings.set(game.system.id, 'customStatusEffects', effectArray);
        CONFIG.specialStatusEffects = finalSpecialEffects;
        await game.settings.set(game.system.id, 'customSpecialStatusEffects', finalSpecialEffects);

        await this.close();
    }

    static async cancel(this: CustomStatusEffectsApplication, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    static async resetEffects(this: CustomStatusEffectsApplication, _event: PointerEvent, _target: HTMLElement) {
        const result = (await foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.localize('CSB.Settings.CustomStatusEffects.ResetDialog.Title'),
                icon: 'fas fa-undo'
            },
            content: `<p>${game.i18n.localize('CSB.Settings.CustomStatusEffects.ResetDialog.Content')}</p>`,
            defaultYes: false,
            modal: true,
            rejectClose: true
        })) as boolean;

        if (result) {
            await game.settings.set(game.system.id, 'customStatusEffects', null);
            await game.settings.set(game.system.id, 'customSpecialStatusEffects', null);
            window.location.reload();
        }
    }

    static async addEffect(this: CustomStatusEffectsApplication, _event: PointerEvent, target: HTMLElement) {
        const windowContent = target.closest('.window-content');
        const newStatusEffectRow: HTMLElement = (
            windowContent!.querySelector('.statusEffect-template') as HTMLTemplateElement
        ).content.cloneNode(true) as HTMLElement;

        const currentIndex = parseInt(
            (Array.from(windowContent!.querySelectorAll('.statusEffect'))?.pop() as HTMLInputElement)?.dataset?.index ??
                '-1'
        );

        const newIndex = currentIndex + 1;

        (newStatusEffectRow.querySelector('.statusEffect') as HTMLLIElement).dataset.index = String(newIndex);
        newStatusEffectRow.querySelector<HTMLInputElement>('.custom-system-effect-id')!.name = `effects.${newIndex}.id`;
        newStatusEffectRow.querySelector<HTMLInputElement>('.custom-system-effect-name')!.name =
            `effects.${newIndex}.name`;
        newStatusEffectRow.querySelector<HTMLInputElement>('.custom-system-effect-img')!.name =
            `effects.${newIndex}.img`;

        windowContent?.querySelector('.statusEffectList')?.append(newStatusEffectRow);
    }

    static async removeEffect(this: CustomStatusEffectsApplication, _event: PointerEvent, target: HTMLElement) {
        const effectId = target
            .closest('.statusEffect')
            ?.querySelector<HTMLInputElement>('.custom-system-effect-id')?.value;

        if (effectId) {
            target
                .closest('.custom-system-customStatusEffects')
                ?.querySelector('.specialStatusEffects')
                ?.querySelectorAll<HTMLSelectElement>('.custom-system-special-effect')
                .forEach((select) => {
                    select.querySelector(`option[value="${effectId}"]`)?.remove();
                });
        }

        target.closest('.statusEffect')?.remove();
    }

    /**
     * Handle changing an status effect image.
     */
    static async editImage(this: CustomStatusEffectsApplication, _event: PointerEvent, target: HTMLSpanElement) {
        const hiddenInput: HTMLInputElement = target.querySelector('.custom-system-effect-img')!;
        const img: HTMLImageElement = target.querySelector('img')!;
        const current = hiddenInput.value;

        const fp = new foundry.applications.apps.FilePicker({
            current,
            type: 'image',
            callback: (path) => {
                if (!path || path === '') {
                    path = CustomStatusEffectsApplication.DEFAULT_IMG;
                }

                img.src = path;
                hiddenInput.value = path;
            }
        });
        await fp.browse(current);
    }

    /**
     * Handle changing an status effect image.
     */
    static async removeLinkedEffect(this: CustomStatusEffectsApplication, _event: PointerEvent, target: HTMLElement) {
        const parent: HTMLSpanElement = target.parentElement!;

        const index = parseInt(parent.parentElement!.dataset.index!);

        const windowContent = target.closest('.window-content');
        const newLinkedEffectSelect: HTMLSelectElement = (
            windowContent!.querySelector('.statusEffect-linkedEffect-select-template') as HTMLTemplateElement
        ).content.cloneNode(true) as HTMLSelectElement;

        newLinkedEffectSelect.name = `effects.${index}.linkedEffect-select`;

        parent.innerHTML = '';
        parent.append(newLinkedEffectSelect);
    }

    /**
     * Handle changing an status effect image.
     */
    static async setLinkedEffect(this: CustomStatusEffectsApplication, _event: Event, target: HTMLSelectElement) {
        const statusEffectRow = target.closest('.statusEffect') as HTMLLIElement;
        const index = statusEffectRow.dataset.index;
        const effectId = target.value;

        const activeEffect = CustomActiveEffect.getPredefinedEffect(effectId);

        if (activeEffect) {
            const windowContent = target.closest('.window-content');
            const newLinkedEffect: HTMLElement = (
                windowContent!.querySelector('.statusEffect-linkedEffect-template') as HTMLTemplateElement
            ).content.cloneNode(true) as HTMLElement;

            const linkedEffectInput = newLinkedEffect.querySelector(
                '.custom-system-effect-linkedEffectId'
            ) as HTMLInputElement;
            const linkedEffectLink = newLinkedEffect.querySelector('.content-link') as HTMLAnchorElement;
            const linkedEffectImage = linkedEffectLink.querySelector('img') as HTMLImageElement;

            linkedEffectInput.value = effectId;
            linkedEffectInput.name = `effects.${index}.linkedEffectId`;

            linkedEffectLink.dataset.id = effectId;
            linkedEffectLink.dataset.uuid = activeEffect.uuid!;
            linkedEffectLink.dataset.tooltip = activeEffect.name!;
            linkedEffectLink.append(activeEffect.name);

            linkedEffectImage.src = activeEffect.img ?? '';
            linkedEffectImage.alt = `activeEffect.name image`;

            target.after(newLinkedEffect);
            target.remove();
        }
    }

    /**
     * Handle changing a status ID.
     */
    static async updateStatusId(this: CustomStatusEffectsApplication, _event: Event, target: HTMLInputElement) {
        const newEffectId = target.value;
        const oldEffectId = target.dataset.previousValue;

        target
            .closest('.custom-system-customStatusEffects')
            ?.querySelector('.specialStatusEffects')
            ?.querySelectorAll<HTMLSelectElement>('.custom-system-special-effect')
            .forEach((select) => {
                if (oldEffectId) {
                    const option = select.querySelector<HTMLOptionElement>(`option[value="${oldEffectId}"]`);

                    if (newEffectId) {
                        if (option) {
                            option.value = newEffectId;
                            option.innerHTML = newEffectId;
                        }
                    } else {
                        if (option) {
                            option.remove();
                        }
                    }
                } else {
                    if (newEffectId) {
                        const newOption = document.createElement('option');
                        newOption.value = newEffectId;
                        newOption.innerHTML = newEffectId;
                        select.append(newOption);
                    }
                }
            });

        target.dataset.previousValue = newEffectId;
    }

    /**
     * Handle opening ActiveEffect sheet on click.
     */
    static async openEffect(this: CustomStatusEffectsApplication, _event: PointerEvent, target: HTMLElement) {
        const uuid = target.dataset.uuid;

        if (uuid) {
            await (fromUuidSync<CustomActiveEffect>(uuid)!.sheet as CustomActiveEffectConfig).render({
                force: true
            });
        }
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.statusEffects = (CONFIG.statusEffects as Array<CustomStatusEffect>).map((effect) => {
            const newEffect: CustomStatusEffect = { ...effect };

            if (newEffect.name?.startsWith('EFFECT.')) {
                newEffect.name = game.i18n.localize(newEffect.name);
            }

            if (newEffect.linkedEffectId) {
                newEffect.linkedEffect = CustomActiveEffect.getPredefinedEffect(newEffect.linkedEffectId);
            }

            return newEffect;
        });

        context.specialStatusEffects = Object.entries(CONFIG.specialStatusEffects)
            .map(([name, statusEffectId]) => {
                return {
                    name,
                    localizedName: game.i18n.has(`CSB.Settings.CustomStatusEffects.SpecialStatusEffects.${name}`, true)
                        ? game.i18n.localize(`CSB.Settings.CustomStatusEffects.SpecialStatusEffects.${name}`)
                        : name,
                    statusEffectId: String(statusEffectId)
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-save', label: 'Save' },
            { type: 'button', action: 'cancel', icon: 'fa-solid fa-xmark', label: 'Cancel' },
            { type: 'button', action: 'resetEffects', icon: 'fa-solid fa-undo', label: 'Reset' }
        ];

        context.PREDEFINED_EFFECTS = [{ id: '', name: '', tags: [] }, ...CustomActiveEffect.getPredefinedEffectsData()];
        context.DEFAULT_IMG = CustomStatusEffectsApplication.DEFAULT_IMG;

        return context;
    }

    /**
     * Actions performed after any render of the Application.
     */
    protected async _onRender(context: never, options: never) {
        await super._onRender(context, options);

        const statusEffectList = this.element.querySelector('.statusEffectList') as HTMLElement;

        statusEffectList.addEventListener('change', (event: Event) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.classList.contains('custom-system-effect-linkedEffect-select')) {
                const selectElement = targetElement as HTMLSelectElement;

                void CustomStatusEffectsApplication.setLinkedEffect.call(this, event, selectElement);
            }
        });

        statusEffectList.addEventListener('change', (event: Event) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.classList.contains('custom-system-effect-id')) {
                const inputElement = targetElement as HTMLInputElement;

                void CustomStatusEffectsApplication.updateStatusId.call(this, event, inputElement);
            }
        });
    }
}
