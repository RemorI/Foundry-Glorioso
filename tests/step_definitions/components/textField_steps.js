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

When(/^I type '(.*)' as text field label$/, (contents) => {
    I.fillField('#textFieldLabel', contents);
});

When(/^I type '(.*)' as text field allowed character list$/, (contents) => {
    I.fillField('#textFieldCharList', contents);
});

When(/^I type '(.*)' as text field maximum length$/, (contents) => {
    I.fillField('#textFieldMaxLength', contents);
});

When(/^I type '(.*)' as text field default value$/, (contents) => {
    I.fillField('#textFieldValue', contents);
});

When(/^I type '(.*)' as text field autocomplete$/, (contents) => {
    I.fillField('#textFieldAutocomplete', contents);
});

Then(
    /^the field '(.*)' of the character '(.*)' has '(.*)' in its autocompletion values$/,
    (componentKey, characterName, expectedValue) => {
        let characterId = getActorId(characterName);

        I.waitForElement(
            `//*[@id="CharacterSheet-Actor-${characterId}"]//section//*[contains(concat(" ", normalize-space(@class), " "), " ${componentKey} ")]//datalist/option[@value="${expectedValue}"]`
        );
    }
);

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/
