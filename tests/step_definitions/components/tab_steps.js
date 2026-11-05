/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { I } = inject();
const { getActorId } = require('../utils.js');

/**********************************************/
/*            TEMPLATE STEPS                  */
/**********************************************/

When(/^I add a new tab to the '(.*)' Tabbed Panel in template '(.*)'$/, (tabbedPanelKey, templateName) => {
    I.wait(0.5);
    let templateId = getActorId(templateName);

    I.click(`#TemplateSheet-Actor-${templateId} div.${tabbedPanelKey} a.custom-system-builder-add-tab`);
});

When(/^I edit current tab in Tabbed Panel '(.*)' in template '(.*)'$/, (tabbedPanelKey, templateName) => {
    I.wait(0.5);
    let templateId = getActorId(templateName);

    I.click(`#TemplateSheet-Actor-${templateId} div.${tabbedPanelKey} a.custom-system-builder-edit-tab`);
});

When(/^I delete current tab in Tabbed Panel '(.*)' in template '(.*)'$/, (tabbedPanelKey, templateName) => {
    I.wait(0.5);
    let templateId = getActorId(templateName);

    I.click(`#TemplateSheet-Actor-${templateId} div.${tabbedPanelKey} a.custom-system-builder-delete-tab`);
});

When(/^I type '(.*)' as tab name$/, (value) => {
    I.fillField('#tab-name', value);
});

When(/^I type '(.*)' as tab key$/, (value) => {
    I.fillField('#tab-key', value);
});

When(/^I type '(.*)' as tab tooltip$/, (value) => {
    I.fillField('#tab-tooltip', value);
});

When(/^I select tab '(.*)' in Tabbed Panel '(.*)' in template '(.*)'$/, (tabKey, tabbedPanelKey, templateName) => {
    I.wait(0.1);
    let templateId = getActorId(templateName);

    I.click(`#TemplateSheet-Actor-${templateId} div.${tabbedPanelKey} a.${tabKey}`);
});

When(
    /^I switch tab '(.*)' in Tabbed Panel '(.*)' in template '(.*)' to the '(.*)'$/,
    (tabKey, tabbedPanelKey, templateName, direction) => {
        I.wait(0.1);
        let templateId = getActorId(templateName);

        let selector =
            `//*[@id="TemplateSheet-Actor-${templateId}"]` +
            `//div[contains(concat(" ", normalize-space(@class), " "), " ${tabbedPanelKey} ")]` +
            `//a[contains(concat(" ", normalize-space(@class), " "), " ${tabKey} ")]` +
            `/../a[contains(concat(" ", normalize-space(@class), " "), " custom-system-sort-${direction} ")]`;

        I.click(selector);
    }
);

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/

When(/^I select tab '(.*)' in Tabbed Panel '(.*)' in character '(.*)'$/, (tabKey, tabbedPanelKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} div.${tabbedPanelKey} a.${tabKey}`);
});
