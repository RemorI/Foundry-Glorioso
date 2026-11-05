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

When(/^I select '(.*)' as panel layout$/, (layout) => {
    I.selectOption('#panelFlow', layout);
});

When(/^I select '(.*)' as panel alignment$/, (alignment) => {
    I.selectOption('#panelAlign', alignment);
});

When(/^I check '(.*)' on panel collapsible options$/, (option) => {
    I.checkOption(`#panelCollapsible${option}`);
});

When(/^I check '(.*)' on panel default collapsed state options$/, (option) => {
    let optionId = 'Extended';
    switch (option) {
        case 'Yes':
            optionId = 'Collapsed';
            break;
        case 'No':
            optionId = 'Expanded';
            break;
    }

    I.checkOption(`#panelDefault${optionId}`);
});

When(/^I type '(.*)' as panel title$/, (title) => {
    I.fillField('#panelTitle', title);
});

When(/^I select '(.*)' as panel title style$/, (option) => {
    I.selectOption('#panelTitleStyle', option);
});

When(/^I click on the title for '(.*)' in the '(.*)' template$/, (panelKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#TemplateSheet-Actor-${characterId} .custom-system-details-${panelKey} summary`);
});

When(/^I click on the title for '(.*)' in the '(.*)' character$/, (panelKey, characterName) => {
    let characterId = getActorId(characterName);

    I.click(`#CharacterSheet-Actor-${characterId} .custom-system-details-${panelKey} summary`);
});
