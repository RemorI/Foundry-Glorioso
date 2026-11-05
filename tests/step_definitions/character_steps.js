/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const assert = require('assert');
const { getActorId, setActorId, setActorTemplateId, getActorTemplateId } = require('./utils.js');
const assertHTMLEqual = require('assert-equal-html').assertEqual;

const { I } = inject();

Given(/^I create a character named '(.*)'$/, async (characterName) => {
    I.click('//a[@data-tab="actors"]');
    I.click('.actors-sidebar button.create-document');

    I.fillField('//*[@id="document-create"]//input[@name="name"]', characterName);
    I.selectOption('//*[@id="document-create"]//select[@name="type"]', 'character');

    I.click('//*[@id="document-create"]/../..//button[@data-button="ok"]');

    let characterId = setActorId(
        characterName,
        await I.executeScript((characterName) => {
            return game.actors.filter((a) => a.name === characterName)[0].id;
        }, characterName)
    );

    I.waitForElement(`#CharacterSheet-Actor-${characterId}`);
});

When(/^I assign the '(.*)' template to the '(.*)' character$/, (templateName, characterName) => {
    let characterId = getActorId(characterName);
    let templateId = getActorId(templateName);

    setActorTemplateId(characterName, templateId);

    I.selectOption(`#CharacterSheet-Actor-${characterId} #template-${characterId}`, templateName);
    I.click(`#CharacterSheet-Actor-${characterId} .custom-system-reload-template`);
    I.click(`#CharacterSheet-Actor-${characterId} .custom-system-reload-template`);
    I.wait(0.5);
    I.click(`#logo`);
});

When(/^I type '(.*)' in '(.*)' in the '(.*)' character$/, async (contents, fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    let inputLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} input[type=text]`;

    I.click(inputLocator);
    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.type(contents);
    I.wait(0.5);
    I.pressKey('Tab');
});

When(/^I hover over '(.*)' in the character '(.*)'$/, async (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.moveCursorTo(`#CharacterSheet-Actor-${characterId} .${fieldKey}`, 5, 5);
});

Then(
    /^the character '(.*)' looks like '(.*)'( with '(.*)' fidelity)?$/,
    async (characterName, screenName, fidelityPhrase, fidelityPercent) => {
        let characterId = getActorId(characterName);

        await I.executeScript((actorId) => {
            let actorDivLocator = `#CharacterSheet-Actor-${actorId}`;
            $(actorDivLocator).css({ position: 'unset' });
        }, characterId);

        I.moveCursorTo('#logo');
        I.click('#logo');
        I.screenshotElement(`#CharacterSheet-Actor-${characterId} section`, 'actor/character/' + screenName);
        I.seeVisualDiff('actor/character/' + screenName + '.png', {
            tolerance: fidelityPercent ?? 0.01,
            prepareBaseImage: false
        });

        await I.executeScript((actorId) => {
            let actorDivLocator = `#CharacterSheet-Actor-${actorId}`;
            $(actorDivLocator).css({ position: '' });
        }, characterId);
    }
);

Then(/^the character '(.*)' HTML is '(.*)'$/, async (characterName, characterHTMLCode) => {
    let characterId = getActorId(characterName);
    let templateId = getActorTemplateId(characterName);

    let actualHTML = await I.grabHTMLFrom(`#CharacterSheet-Actor-${characterId} section`);
    let expectedHTML = fs.readFileSync('tests/expected_data/characters_html/' + characterHTMLCode + '.html', 'utf8');
    expectedHTML = expectedHTML.replaceAll(/{TPL_ID}/g, templateId);
    expectedHTML = expectedHTML.replaceAll(/{ACTOR_ID}/g, characterId);

    assertHTMLEqual(actualHTML, expectedHTML);
});

Then(/^the character '(.*)' is defined as '(.*)'$/, async (characterName, characterJSONCode) => {
    let characterId = getActorId(characterName);
    let templateId = getActorTemplateId(characterName);

    let actualJSON = await I.executeScript((actorId) => {
        return game.actors.get(actorId).system;
    }, characterId);

    delete actualJSON.templateSystemUniqueVersion;

    let expectedJSON = require('./../expected_data/characters_json/' + characterJSONCode + '.json');
    expectedJSON.template = templateId;

    assert.deepStrictEqual(actualJSON, expectedJSON);
});

Then(/^the field '(.*)' of the character '(.*)' has text '(.*)'$/, (componentKey, characterName, expectedValue) => {
    let characterId = getActorId(characterName);

    I.seeTextEquals(expectedValue, `#CharacterSheet-Actor-${characterId} section .${componentKey}`);
});

Then(/^the field '(.*)' of the character '(.*)' has value '(.*)'$/, (componentKey, characterName, expectedValue) => {
    let characterId = getActorId(characterName);

    I.waitForValue(`#CharacterSheet-Actor-${characterId} section .${componentKey} input`, expectedValue);
});

Then(
    /^the component '(.*)' of the character '(.*)' has HTML '(.*)'$/,
    async (componentKey, characterName, characterHTMLCode) => {
        let characterId = getActorId(characterName);

        const actualHTML = await I.executeScript((elementLocator) => {
            return $(elementLocator).prop('outerHTML');
        }, `#CharacterSheet-Actor-${characterId} section .${componentKey}.custom-system-component-root`);

        let expectedHTML = fs.readFileSync('expected_data/characters_html/' + characterHTMLCode + '.html', 'utf8');
        expectedHTML = expectedHTML.replaceAll(/{TPL_ID}/g, characterId);

        assertHTMLEqual(actualHTML, expectedHTML);
    }
);
