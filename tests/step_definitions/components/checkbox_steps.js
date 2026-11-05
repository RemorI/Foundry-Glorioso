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

When(/^I type '(.*)' as checkbox label$/, (contents) => {
    I.fillField('#checkboxLabel', contents);
});

When(/^I '(check|uncheck)' checked by default$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#checkboxDefaultChecked');
            break;
        case 'uncheck':
            I.uncheckOption('#checkboxDefaultChecked');
            break;
    }
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/

When(/^I click on the '(.*)' checkbox in the '(.*)' character$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="checkbox"]`);
});

Then(/^The '(.*)' checkbox is '(checked|not checked)' in the '(.*)' character$/, (fieldKey, action, characterName) => {
    let characterId = getActorId(characterName);

    switch (action) {
        case 'checked':
            I.seeCheckboxIsChecked(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="checkbox"]`);
            break;
        case 'not checked':
            I.dontSeeCheckboxIsChecked(`#CharacterSheet-Actor-${characterId} .${fieldKey} input[type="checkbox"]`);
            break;
    }
});
