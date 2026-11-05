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

When(/^I '(check|uncheck)' dynamic table use$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#dynamicTableOptions');
            break;
        case 'uncheck':
            I.uncheckOption('#dynamicTableOptions');
            break;
    }
});

When(/^I add an option with key '(.*)' and label '(.*)'$/, (key, label) => {
    I.click('#addOption');

    let lastOptionLocator =
        '(//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-dropdown-option ")])[last()]';

    I.fillField(
        lastOptionLocator +
            '//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-dropdown-option-key ")]',
        key
    );
    I.fillField(
        lastOptionLocator +
            '//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-dropdown-option-value ")]',
        label
    );
});

When(/^I type '(.*)' as select label$/, (label) => {
    I.fillField('#selectLabel', label);
});

When(/^I type '(.*)' as select default value$/, (value) => {
    I.fillField('#selectDefaultValue', value);
});

When(/^I remove the option with key '(.*)'$/, (key) => {
    I.click(
        `//*[@class="custom-system-custom-options"]//input[@value="${key}"]/../..//a[@class="custom-system-delete-option"]`
    );
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/
When(/^I select option '(.*)' in select '(.*)' in the '(.*)' character$/, (value, fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    let inputLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} select`;

    I.selectOption(inputLocator, value);
});

Then(/^option '(.*)' is selected in select '(.*)' in the '(.*)' character$/, (value, fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    let inputLocator = `#CharacterSheet-Actor-${characterId} .${fieldKey} select`;

    I.waitForValue(inputLocator, value);
});

Then(/^select '(.*)' in the '(.*)' character has options '(.*)'$/, function (fieldKey, characterName, optionList) {
    let characterId = getActorId(characterName);
    let inputLocator = `//*[@id="CharacterSheet-Actor-${characterId}"]//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//select`;

    // I.click(inputLocator);

    let splittedOptions = optionList.split('_');
    I.seeNumberOfElements(inputLocator + '/option', splittedOptions.length);

    for (let option of splittedOptions) {
        let [key, value] = option.split(';', 2);

        let optionLocator = `/option[@value="${key}"]` + (value === '' ? `[not(text())]` : `[text() = "${value}"]`);

        I.seeElementInDOM(inputLocator + optionLocator);
    }
});
