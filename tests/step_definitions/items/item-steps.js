/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { getActorId, setActorId, setActorTemplateId, getActorTemplateId } = require('../utils.js');

const { I } = inject();

Given(/^I create an item named '(.*)'$/, async (itemName) => {
    I.click('//a[@data-tab="items"]');
    I.click('.items-sidebar button.create-document');

    I.fillField('//*[@id="document-create"]//input[@name="name"]', itemName);
    I.selectOption('//*[@id="document-create"]//select[@name="type"]', 'equippableItem');

    I.click('//*[@id="document-create"]/../..//button[@data-button="ok"]');

    let itemId = setActorId(
        itemName,
        await I.executeScript((characterName) => {
            return game.items.filter((i) => i.name === characterName)[0].id;
        }, itemName)
    );

    I.waitForElement(`#EquippableItemSheet-Item-${itemId}`);
});

When(/^I assign the '(.*)' item template to the '(.*)' item$/, (templateName, characterName) => {
    let itemId = getActorId(characterName);
    let templateId = getActorId(templateName);

    setActorTemplateId(characterName, templateId);

    I.selectOption(`#EquippableItemSheet-Item-${itemId} #template-${itemId}`, templateName);
    I.click(`#EquippableItemSheet-Item-${itemId} .custom-system-reload-template`);
    I.click(`#EquippableItemSheet-Item-${itemId} .custom-system-reload-template`);
    I.wait(0.5);
    I.click(`#logo`);
});

When(/^I type '(.*)' in '(.*)' in the '(.*)' item$/, async (contents, fieldKey, characterName) => {
    let itemId = getActorId(characterName);

    let inputLocator = `#EquippableItemSheet-Item-${itemId} .${fieldKey} input[type=text]`;

    I.click(inputLocator);

    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.type(contents);
    I.wait(0.5);
    I.pressKey('Tab');
});

When(/^I hover over '(.*)' in the item '(.*)'$/, async (fieldKey, characterName) => {
    let itemId = getActorId(characterName);

    I.moveCursorTo(`#EquippableItemSheet-Item-${itemId} .${fieldKey}`);
});

Then(
    /^the item '(.*)' looks like '(.*)'( with '(.*)' fidelity)?$/,
    async (characterName, screenName, fidelityPhrase, fidelityPercent) => {
        let itemId = getActorId(characterName);

        await I.executeScript((actorId) => {
            let actorDivLocator = `#EquippableItemSheet-Item-${actorId}`;
            $(actorDivLocator).css({ position: 'unset' });
        }, itemId);

        I.moveCursorTo('#logo');
        I.screenshotElement(`#EquippableItemSheet-Item-${itemId} section`, 'item/' + screenName);
        I.seeVisualDiff('item/' + screenName + '.png', {
            tolerance: fidelityPercent ?? 0,
            prepareBaseImage: false
        });

        await I.executeScript((actorId) => {
            let actorDivLocator = `#EquippableItemSheet-Item-${actorId}`;
            $(actorDivLocator).css({ position: '' });
        }, itemId);
    }
);

Then(/^the field '(.*)' of the item '(.*)' has text '(.*)'$/, (componentKey, characterName, expectedValue) => {
    let itemId = getActorId(characterName);

    I.seeTextEquals(expectedValue, `#EquippableItemSheet-Item-${itemId} section .${componentKey}`);
});

Then(/^the field '(.*)' of the item '(.*)' has value '(.*)'$/, (componentKey, characterName, expectedValue) => {
    let itemId = getActorId(characterName);

    I.waitForValue(`#EquippableItemSheet-Item-${itemId} section .${componentKey} input`, expectedValue);
});
