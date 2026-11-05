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

When(/^I type '(.*)' as label text$/, (contents) => {
    I.fillField('#labelText', contents);
});

When(/^I select '(.*)' as label style$/, (contents) => {
    I.selectOption('#labelStyle', contents);
});

When(/^I select '(.*)' as label size$/, (contents) => {
    I.selectOption('#labelSize', contents);
});

When(/^I type '(.*)' as label prefix$/, (contents) => {
    I.fillField('#labelPrefix', contents);
});

When(/^I type '(.*)' as label suffix$/, (contents) => {
    I.fillField('#labelSuffix', contents);
});

When(/^I type '(.*)' as label icon$/, (contents) => {
    I.fillField('#labelIcon', contents);
});

When(/^I type '(.*)' as label roll message$/, (contents) => {
    I.fillField('#labelRollMessage', contents);
});

When(/^I type '(.*)' as label alternate roll message$/, (contents) => {
    I.fillField('#labelAltRollMessage', contents);
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/

When(/^I trigger the roll message '(.*)' in the '(.*)' character$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} a`);
});

When(/^I trigger the alt roll message '(.*)' in the '(.*)' character$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.pressKeyDown('Shift');
    I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} a`);
    I.pressKeyUp('Shift');
});
