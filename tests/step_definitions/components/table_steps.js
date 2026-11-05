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

When(/^I type '(.*)' as table row count$/, (value) => {
    I.fillField('#tableRows', value);
});

When(/^I type '(.*)' as table column count/, (value) => {
    I.fillField('#tableCols', value);
});

When(/^I type '(.*)' as table layout/, (value) => {
    I.fillField('#tableLayout', value);
});

When(
    /^I add a component to the '(.*)' table in template '(.*)' in row '(.*)', column '(.*)'$/,
    (componentKey, templateName, rowNum, colNum) => {
        let templateId = getActorId(templateName);
        I.click(
            `#TemplateSheet-Actor-${templateId} div.${componentKey} tr:nth-child(${rowNum}) td:nth-child(${colNum}) a.custom-system-template-tab-controls-add-element`
        );
    }
);
