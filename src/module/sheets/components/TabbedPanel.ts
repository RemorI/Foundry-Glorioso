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

import TabEditorDialog from '../../applications/TabEditorDialog.js';
import { JSONObject } from '../../definitions.js';
import TemplateSystem from '../../documents/TemplateSystem.js';
import { ComponentConfigFormData, ComponentRenderOptions } from './Component.js';
import Container, { ContainerJson, ContainerProps } from './Container.js';
import Tab, { TabJson } from './Tab.js';

export type TabbedPanelProps = ContainerProps & {
    contents?: Tab[];
};

export type TabbedPanelJson = ContainerJson & {
    contents?: TabJson[];
};

/**
 * Tabbed Panel component
 * @ignore
 */
class TabbedPanel extends Container {
    /**
     * Can container accept dropped components ?
     */
    static readonly droppable: boolean = false;

    protected _contents: Tab[];

    constructor(props: TabbedPanelProps) {
        super(props);
        this._contents = props.contents ?? [];
    }

    get contents() {
        return this._contents;
    }

    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user?
     * @param {ComponentRenderOptions} [options={}]
     * @return {Promise<JQuery>} The jQuery element holding the component
     */
    async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        let activeKey: string | null = null;

        const renderableTabs: Tab[] = this.contents.filter((tab) => tab.canBeRendered(entity));

        try {
            activeKey = String(
                game.user.getFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.activeTab')
            );
        } catch (_e) {
            // Nothing should happen
        }

        if (renderableTabs.filter((tab) => tab.key === activeKey).length === 0) {
            activeKey = renderableTabs?.[0]?.key;
        }

        // Generating content
        const tabSection = $('<section></section>');
        const tabsContent: Record<string, JQuery> = {};

        // Generating nav
        const tabNav = $('<nav></nav>');
        const tabsLink: Record<string, JQuery> = {};

        tabNav.addClass('custom-tabs');

        for (const tab of renderableTabs) {
            tabsContent[tab.key] = await tab.render(entity, isEditable, options);
            tabSection.append(tabsContent[tab.key]);

            const tabSpan = $('<span></span>');
            if (tab.tooltip) {
                tabSpan.attr('title', tab.tooltip);
            }

            const tabLink = $('<a></a>');
            tabLink.addClass('item');
            tabLink.addClass(tab.key);
            tabLink.text(tab.name);

            tabLink.on('click', () => {
                tabsContent[activeKey!].removeClass('active');
                tabsContent[tab.key].addClass('active');

                tabsLink[activeKey!].removeClass('active');
                tabLink.addClass('active');

                void game.user.setFlag(
                    game.system.id,
                    entity.uuid + '.' + this.templateAddress + '.activeTab',
                    tab.key
                );
                activeKey = tab.key;
            });

            tabsLink[tab.key] = tabLink;
            tabSpan.append(tabLink);

            if (TemplateSystem.isBuilderTemplateSystem(entity)) {
                const sortLeftTabButton = $('<a><i class="fas fa-caret-left custom-system-clickable"></i></a>');
                sortLeftTabButton.addClass('item custom-system-sort-left');
                sortLeftTabButton.attr(
                    'title',
                    game.i18n.localize('CSB.ComponentProperties.TabbedPanel.SortTabToLeft')
                );

                sortLeftTabButton.on('click', () => {
                    void tab.sortBeforeInParent(entity);
                });

                tabLink.before(sortLeftTabButton);

                const sortRightTabButton = $('<a><i class="fas fa-caret-right custom-system-clickable"></i></a>');
                sortRightTabButton.addClass('item custom-system-sort-right');
                sortRightTabButton.attr(
                    'title',
                    game.i18n.localize('CSB.ComponentProperties.TabbedPanel.SortTabToRight')
                );

                sortRightTabButton.on('click', () => {
                    void tab.sortAfterInParent(entity);
                });

                tabLink.after(sortRightTabButton);
            }

            tabNav.append(tabSpan);
        }

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            const controlSpan = $('<span></span>');

            const addTabButton = $('<a><i class="fas fa-plus-circle custom-system-clickable"></i></a>');
            addTabButton.addClass('item');
            addTabButton.addClass('custom-system-builder-add-tab');
            addTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.AddTab'));

            addTabButton.on('click', () => {
                void new TabEditorDialog(this, entity).render({ force: true });
            });

            const editTabButton = $('<a><i class="fas fa-edit custom-system-clickable"></i></a>');
            editTabButton.addClass('item');
            editTabButton.addClass('custom-system-builder-edit-tab');
            editTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.EditTab'));

            editTabButton.on('click', () => {
                if (activeKey) {
                    const tab: Tab = this.contents.filter((tab) => tab.key === activeKey)[0];

                    void new TabEditorDialog(this, entity, tab).render({ force: true });
                }
            });

            const deleteTabButton = $('<a><i class="fas fa-trash custom-system-clickable"></i></a>');
            deleteTabButton.addClass('item');
            deleteTabButton.addClass('custom-system-builder-delete-tab');
            deleteTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.DeleteTab'));

            deleteTabButton.on('click', () => {
                if (activeKey) {
                    void this.contents.filter((tab) => tab.key === activeKey)[0].delete(entity);
                }
            });

            controlSpan.append(addTabButton);
            controlSpan.append(editTabButton);
            controlSpan.append(deleteTabButton);

            tabNav.append(controlSpan);
        }

        const jQElement = await super._getElement(entity, isEditable, options);

        const internalContents = jQElement.hasClass('custom-system-component-contents')
            ? jQElement
            : jQElement.find('.custom-system-component-contents');

        internalContents.append(tabNav);
        internalContents.append(tabSection);

        if (activeKey) {
            tabsContent[activeKey].addClass('active');
            tabsLink[activeKey].addClass('active');
        }

        return jQElement;
    }

    /**
     * Creates Tabbed Panel from JSON description
     * @override
     * @param {ContainerJson} json
     * @param {string} templateAddress
     * @param {Container|null} parent
     * @return {TabbedPanel}
     */
    static fromJSON(json: TabbedPanelJson, templateAddress: string, parent?: Container): TabbedPanel {
        const tabbedPanel = new TabbedPanel({
            ...json,
            contents: [],

            parent: parent,
            templateAddress: templateAddress
        });

        tabbedPanel._contents =
            json?.contents?.map((tab: TabJson, index: number) =>
                Tab.fromJSON(tab, templateAddress + '-contents-' + index, tabbedPanel)
            ) ?? [];

        return tabbedPanel;
    }

    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName(): string {
        return 'tabbedPanel';
    }

    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.TabbedPanel');
    }

    /** Get configuration form for component creation / edition */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: TabbedPanelJson & JSONObject
    ): Promise<HTMLElement> {
        const mainElt = document.createElement('div');

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/tabbed-panel.hbs`,
            {
                ...existingComponent,
                appId
            }
        );

        return mainElt;
    }

    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(configData: ComponentConfigFormData, html: HTMLFormElement): ContainerJson {
        return super.extractConfig(configData, html);
    }
}

/**
 * @ignore
 */
export default TabbedPanel;
