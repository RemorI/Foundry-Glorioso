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

When(/^I type '(.*)' as radio button label$/, (contents) => {
    I.fillField('#radioButtonLabel', contents);
});

When(/^I type '(.*)' as radio button group$/, (contents) => {
    I.fillField('#radioButtonGroup', contents);
});

When(/^I type '(.*)' as radio button value$/, (contents) => {
    I.fillField('#radioButtonValue', contents);
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/

When(/^I click on the '(.*)' radio button in the '(.*)' character$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="radio"]`);
});

Then(
    /^The '(.*)' radio button is '(checked|not checked)' in the '(.*)' character$/,
    (fieldKey, action, characterName) => {
        let characterId = getActorId(characterName);

        switch (action) {
            case 'checked':
                I.seeCheckboxIsChecked(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="radio"]`);
                break;
            case 'not checked':
                I.dontSeeCheckboxIsChecked(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="radio"]`);
                break;
        }
    }
);
