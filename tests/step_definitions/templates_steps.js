/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const assert = require('assert');
const { setActorId, getActorId } = require('./utils.js');
const assertHTMLEqual = require('assert-equal-html').assertEqual;

const { I } = inject();

Given(/^I create a (.*) template named '(.*)'$/, async (templateType, templateName) => {
    let tabName;
    let templateTypeName;
    let templateIdPrefix;

    switch (templateType) {
        case 'actor':
            tabName = 'actors';
            templateTypeName = '_template';
            templateIdPrefix = 'TemplateSheet-Actor';
            break;
        case 'user input':
            tabName = 'items';
            templateTypeName = 'userInputTemplate';
            templateIdPrefix = 'UserInputTemplateItemSheet-Item';
            break;
        case 'item':
            tabName = 'items';
            templateTypeName = '_equippableItemTemplate';
            templateIdPrefix = 'EquippableItemTemplateSheet-Item';
            break;
        default:
            throw new Error('No case defined for ' + templateType);
    }

    I.click(`//a[@data-tab="${tabName}"]`);
    I.click(`.${tabName}-sidebar button.create-document`);

    I.waitForElement('//*[@id="document-create"]//input[@name="name"]');
    I.fillField('//*[@id="document-create"]//input[@name="name"]', templateName);
    I.selectOption('//*[@id="document-create"]//select[@name="type"]', templateTypeName);

    I.click('//*[@id="document-create"]/../..//button[@data-button="ok"]');

    let actorId = setActorId(
        templateName,
        await I.executeScript(
            (templateName, tabName) => {
                return game[tabName].filter((a) => a.name === templateName)[0].id;
            },
            templateName,
            tabName
        )
    );

    I.waitForElement(`#${templateIdPrefix}-${actorId}`);
});

When(
    /^I add a component to the '([a-zA-Z0-9_]+)' component in (.*) template '(.*)'$/,
    (componentKey, templateType, templateName) => {
        I.wait(0.1);
        let templateId = getActorId(templateName);

        let templateIdPrefix;

        switch (templateType) {
            case 'actor':
                templateIdPrefix = 'TemplateSheet-Actor';
                break;
            case 'user input':
                templateIdPrefix = 'UserInputTemplateItemSheet-Item';
                break;
            case 'item':
                templateIdPrefix = 'EquippableItemTemplateSheet-Item';
                break;
        }

        let selector = `(//*[@id='${templateIdPrefix}-${templateId}']//div[contains(concat(" ", normalize-space(@class), " "), " ${componentKey} ")]//a[contains(concat(" ", normalize-space(@class), " "), " custom-system-template-tab-controls-add-element ")])[last()]`;

        I.click(selector);
        I.waitForElement('#compType');
    }
);

When(/^I edit the component '(.*)' in (.*) template '(.*)'$/, async (componentKey, templateType, templateName) => {
    let templateId = getActorId(templateName);

    let templateIdPrefix;

    switch (templateType) {
        case 'actor':
            templateIdPrefix = 'TemplateSheet-Actor';
            break;
        case 'user input':
            templateIdPrefix = 'UserInputTemplateItemSheet-Item';
            break;
        case 'item':
            templateIdPrefix = 'EquippableItemTemplateSheet-Item';
            break;
    }

    let baseLocator = `#${templateIdPrefix}-${templateId} div.${componentKey}`;

    if (await I.grabNumberOfVisibleElements(baseLocator + '.custom-system-editable-component')) {
        // If editable is on the same element as the key
        I.click(baseLocator + '.custom-system-editable-component');
    } else {
        // If editable is on a sub-element of the key (note the space)
        I.click(baseLocator + ' .custom-system-editable-component');
    }

    I.waitForElement('#compType');
    I.wait(0.5);
});

When(/^I edit the container '(.*)' in (.*) template '(.*)'$/, async (componentKey, templateType, templateName) => {
    let templateId = getActorId(templateName);

    let templateIdPrefix;

    switch (templateType) {
        case 'actor':
            templateIdPrefix = 'TemplateSheet-Actor';
            break;
        case 'user input':
            templateIdPrefix = 'UserInputTemplateItemSheet-Item';
            break;
        case 'item':
            templateIdPrefix = 'EquippableItemTemplateSheet-Item';
            break;
    }

    let baseLocator = `#${templateIdPrefix}-${templateId} div.custom-system-edit-${componentKey}.custom-system-editable-component`;

    I.click(baseLocator);

    I.wait(0.5);
});

When(/^I choose '([a-zA-Z- ]+)' as component type$/, (compType) => {
    I.selectOption('#compType', compType);
});

When(/^I type '(.*)' as component key$/, (componentKey) => {
    I.fillField('#compKey', componentKey);
});

When(/^I type '(.*)' as component tooltip$/, (componentTooltip) => {
    I.fillField('#compTooltip', componentTooltip);
});

When(/^I click '(undo|redo)' in template '(.*)'$/, (action, templateName) => {
    let templateId = getActorId(templateName);

    I.click(`#TemplateSheet-Actor-${templateId} input.custom-system-${action}`);
});

When(
    /^I move the '(.*)' (component|container) to the last position of container '(.*)' in template '(.*)'$/,
    async (componentKey, draggedType, containerKey, templateName) => {
        let templateId = getActorId(templateName);

        let componentLocator;
        switch (draggedType) {
            case 'component':
                componentLocator = `#TemplateSheet-Actor-${templateId} div.${componentKey}`;

                if (await I.grabNumberOfVisibleElements(componentLocator + '.custom-system-editable-component')) {
                    // If editable is on the same element as the key
                    componentLocator += '.custom-system-editable-component';
                } else {
                    // If editable is on a sub-element of the key (note the space)
                    componentLocator += ' .custom-system-editable-component';
                }
                break;
            case 'container':
                componentLocator = `//*[@id="TemplateSheet-Actor-${templateId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${componentKey} ")]/../*[contains(concat(" ", normalize-space(@class), " "), " custom-system-editable-component ")]`;
                break;
        }

        let newPositionLocator = `#TemplateSheet-Actor-${templateId} div.${containerKey} a.custom-system-template-tab-controls-add-element`;

        I.dragAndDrop(componentLocator, newPositionLocator);
    }
);

Then(/^A (.*) template sheet is opened for '(.*)'$/, async (templateType, templateName) => {
    let templateId = getActorId(templateName);

    let templateIdPrefix;
    let templateTypeName;

    switch (templateType) {
        case 'actor':
            templateTypeName = '_template';
            templateIdPrefix = 'TemplateSheet-Actor';
            break;
        case 'user input':
            templateTypeName = 'userInputTemplate';
            templateIdPrefix = 'UserInputTemplateItemSheet-Item';
            break;
        case 'item':
            templateTypeName = '_equippableItemTemplate';
            templateIdPrefix = 'EquippableItemTemplateSheet-Item';
            break;
        default:
            throw new Error('No case defined for ' + templateType);
    }

    I.seeElement(`.${templateTypeName}.custom-system-actor`);

    let currentName = await I.grabValueFrom(`#${templateIdPrefix}-${templateId} input[name="name"]`);
    assert.equal(currentName, templateName);
});

Then(
    /^the (.*) template '(.*)' looks like '(.*)'( with '(.*)' fidelity)?$/,
    async (templateType, templateName, screenName, fidelityPhrase, fidelityPercent) => {
        let templateId = getActorId(templateName);

        let templateIdPrefix;

        switch (templateType) {
            case 'actor':
                templateIdPrefix = 'TemplateSheet-Actor';
                break;
            case 'user input':
                templateIdPrefix = 'UserInputTemplateItemSheet-Item';
                break;
            case 'item':
                templateIdPrefix = 'EquippableItemTemplateSheet-Item';
                break;
        }

        await I.executeScript(
            (actorId, templateIdPrefix) => {
                let actorDivLocator = `#${templateIdPrefix}-${actorId}`;
                $(actorDivLocator).css({ position: 'unset' }).off('drag');
            },
            templateId,
            templateIdPrefix
        );

        I.moveCursorTo('#logo');
        I.screenshotElement(`#${templateIdPrefix}-${templateId} section`, `${templateType}/${screenName}`);
        I.seeVisualDiff(`${templateType}/${screenName}.png`, {
            tolerance: fidelityPercent ?? 0.01,
            prepareBaseImage: false
        });

        await I.executeScript(
            (actorId, templateIdPrefix) => {
                let actorDivLocator = `#${templateIdPrefix}-${actorId}`;
                $(actorDivLocator).css({ position: '' });
            },
            templateId,
            templateIdPrefix
        );
    }
);

Then(/^the template '(.*)' HTML is '(.*)'$/, async (templateName, templateHTMLCode) => {
    let templateId = getActorId(templateName);

    let actualHTML = await I.grabHTMLFrom(`#TemplateSheet-Actor-${templateId} section`);
    let expectedHTML = fs.readFileSync('tests/expected_data/templates_html/' + templateHTMLCode + '.html', 'utf8');

    assertHTMLEqual(actualHTML, expectedHTML);
});

Then(/^the template '(.*)' is defined as '(.*)'$/, async (templateName, templateJSONCode) => {
    let templateId = getActorId(templateName);
    let actualJSON = await I.executeScript((actorId) => {
        return game.actors.get(actorId).system;
    }, templateId);

    delete actualJSON.templateSystemUniqueVersion;

    let expectedJSON = require('./../expected_data/templates_json/' + templateJSONCode + '.json');

    assert.deepStrictEqual(actualJSON, expectedJSON);
});
