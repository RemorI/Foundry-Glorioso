/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { getActorId } = require('../utils.js');
const { I } = inject();

/**********************************************/
/*            TEMPLATE STEPS                  */
/**********************************************/

When(/^I type '(.*)' as rich text area label$/, (contents) => {
    I.fillField('#textAreaLabel', contents);
});

When(/^I type '(.*)' as rich text area default value$/, (contents) => {
    I.click('#textAreaValue');

    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.type(contents);
});

When(/^I select '(.*)' as rich text area style$/, (style) => {
    I.selectOption('#textAreaStyle', style);
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/
When(/^I hover over the '(.*)' text area in the character '(.*)'$/, async (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.moveCursorTo(`#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-rich-content`, 8, 8);
    I.moveCursorTo(`#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-rich-content`, 8, 8);
});

When(/^I open the '(.*)' text area in the '(.*)' character$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} .fa-edit`);
});

When(/^I type '(.*)' in the text area '(.*)' in the '(.*)' character$/, async (contents, fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    let inputLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} .editor-content`;

    I.click(inputLocator);

    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.type(contents);
    I.wait(0.5);
});

When(/^I save the text area '(.*)' in the '(.*)' character$/, async (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    let inputLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} .editor-menu button[data-action="save"]`;

    I.click(inputLocator);
});

When(/^I type '(.*)' in the text area in the '(.*)' dialog$/, (contents, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} .editor-content`;

    I.click(inputLocator);

    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.type(contents);
    I.wait(0.5);
});

When(/^I save the text area in the '(.*)' dialog$/, (dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} button.dialog-button.validate`;

    I.click(inputLocator);
});

Then(
    /^the edit button for the '(.*)' text area in the '(.*)' character is '(visible|not visible)'$/,
    (fieldKey, characterName, buttonState) => {
        let characterId = getActorId(characterName);

        let buttonLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} .fa-edit`;

        switch (buttonState) {
            case 'visible':
                I.waitForVisible(buttonLocator);
                break;
            case 'not visible':
                I.waitForInvisible(buttonLocator);
                break;
        }
    }
);

Then(/^the text area in the '(.*)' dialog has text '(.*)'$/, (dialogName, contents) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} .editor-content`;

    I.seeTextEquals(contents, inputLocator);

    I.switchTo();
});
