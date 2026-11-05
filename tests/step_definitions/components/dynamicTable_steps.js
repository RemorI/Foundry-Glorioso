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

When(/^I '(check|uncheck)' make column name bold$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#tableHead');
            break;
        case 'uncheck':
            I.uncheckOption('#tableHead');
            break;
    }
});

When(/^I '(check|uncheck)' show confirmation dialog on row delete$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#tableDeleteWarning');
            break;
        case 'uncheck':
            I.uncheckOption('#tableDeleteWarning');
            break;
    }
});

When(
    /^I edit the column '(.*)' in the dynamic table '(.*)' in template '(.*)'$/,
    (columnKey, dynamicTableKey, templateName) => {
        let templateId = getActorId(templateName);

        I.click(
            `#TemplateSheet-Actor-${templateId} div.${dynamicTableKey} span.custom-system-editable-component.${columnKey}`
        );
    }
);

When(
    /^I move the column '(.*)' in the dynamic table '(.*)' in template '(.*)' to the '(.*)'$/,
    (columnKey, dynamicTableKey, templateName, direction) => {
        let templateId = getActorId(templateName);

        let selector =
            `//*[@id="TemplateSheet-Actor-${templateId}"]` +
            `//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]` +
            `//span[contains(concat(" ", normalize-space(@class), " "), " ${columnKey} ")][contains(concat(" ", normalize-space(@class), " "), " custom-system-editable-component ")]` +
            `/../a[contains(concat(" ", normalize-space(@class), " "), " custom-system-sort-${direction} ")]`;

        I.click(selector);
    }
);

When(/^I type '(.*)' as component column name$/, (value) => {
    I.fillField('#compColName', value);
});

When(/^I select '(.*)' as column alignment$/, (value) => {
    I.selectOption('#compAlign', value);
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/

When(
    /^I add a row to the '(.*)' dynamic table in the '(.*)' (character|template)$/,
    (dynamicTableKey, actorName, actorType) => {
        let actorId = getActorId(actorName);

        const addButton = `#${actorType.charAt(0).toUpperCase()}${actorType.substring(
            1
        )}Sheet-Actor-${actorId} div.${dynamicTableKey} a.custom-system-addDynamicLine`;

        I.moveCursorTo(addButton);
        I.moveCursorTo('#logo');
        I.click(addButton);
    }
);

When(
    /^I type '(.*)' in '(.*)' in the row '(.*)' of the '(.*)' dynamic table in the '(.*)' (character|template)$/,
    async (contents, fieldKey, rowNum, dynamicTableKey, actorName, actorType) => {
        let actorId = getActorId(actorName);

        // Adding 1 to account for header line
        rowNum++;

        let inputLocator = `//*[@id="${actorType.charAt(0).toUpperCase()}${actorType.substring(
            1
        )}Sheet-Actor-${actorId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]//tr[${rowNum}]//*[contains(@class, ".${fieldKey}")]//input`;

        let previousValue = await I.grabValueFrom(inputLocator);

        I.click(inputLocator);

        I.pressKey(['Control', 'A']);
        I.pressKey('Backspace');

        I.type(contents);
        I.wait(0.5);
        I.pressKey('Tab');
    }
);

When(
    /^I click on the '(.*)' checkbox in the row '(.*)' of the '(.*)' dynamic table in the '(.*)' (character|template)$/,
    (fieldKey, rowNum, dynamicTableKey, actorName, actorType) => {
        let actorId = getActorId(actorName);

        // Adding 1 to account for header line
        rowNum++;

        let inputLocator = `//*[@id="${actorType.charAt(0).toUpperCase()}${actorType.substring(
            1
        )}Sheet-Actor-${actorId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]//tr[${rowNum}]//*[contains(@class, ".${fieldKey}")]//input[@type="checkbox"]`;

        I.click(inputLocator);
    }
);

When(
    /^I sort '(.*)' the row '(.*)' of the '(.*)' dynamic table in the '(.*)' (character|template)$/,
    (direction, rowNum, dynamicTableKey, actorName, actorType) => {
        let actorId = getActorId(actorName);
        // Adding 1 for the header row
        rowNum++;

        let locator = `#${actorType.charAt(0).toUpperCase()}${actorType.substring(
            1
        )}Sheet-Actor-${actorId} .${dynamicTableKey} tr:nth-child(${rowNum}) a.custom-system-sort${
            direction.charAt(0).toUpperCase() + direction.slice(1)
        }DynamicLine`;

        // Force click to work after screenshots. Dunno why click does not work...
        I.forceClick(locator);
    }
);

When(
    /^I delete the row '(.*)' of the '(.*)' dynamic table in the '(.*)' (character|template)$/,
    (rowNum, dynamicTableKey, actorName, actorType) => {
        let actorId = getActorId(actorName);
        // Adding 1 for the header row
        rowNum++;

        I.click(
            `#${actorType.charAt(0).toUpperCase()}${actorType.substring(
                1
            )}Sheet-Actor-${actorId} .${dynamicTableKey} tr:nth-child(${rowNum}) .custom-system-deleteDynamicLine`
        );

        I.wait(0.1);
    }
);

Then(
    /^the field '(.*)' in the row '(.*)' of the '(.*)' dynamic table in the '(.*)' character has text '(.*)'$/,
    (fieldKey, rowNum, dynamicTableKey, characterName, expectedValue) => {
        let characterId = getActorId(characterName);

        // Adding 1 to account for header line
        rowNum++;

        let inputLocator = `//*[@id="CharacterSheet-Actor-${characterId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]//tr[${rowNum}]//*[contains(@class, ".${fieldKey}")]`;

        I.seeTextEquals(expectedValue, inputLocator);
    }
);

Then(
    /^the field '(.*)' in the row '(.*)' of the '(.*)' dynamic table in the '(.*)' character has value '(.*)'$/,
    (fieldKey, rowNum, dynamicTableKey, characterName, expectedValue) => {
        let characterId = getActorId(characterName);

        // Adding 1 to account for header line
        rowNum++;

        let inputLocator = `//*[@id="CharacterSheet-Actor-${characterId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]//tr[${rowNum}]//*[contains(@class, ".${fieldKey}")]//input`;

        I.waitForValue(inputLocator, expectedValue);
    }
);

Then(
    /^The '(.*)' checkbox in the row '(.*)' of the '(.*)' dynamic table in the '(.*)' character is '(checked|not checked)'$/,
    (fieldKey, rowNum, dynamicTableKey, characterName, action) => {
        let characterId = getActorId(characterName);

        // Adding 1 to account for header line
        rowNum++;

        let inputLocator = `//*[@id="CharacterSheet-Actor-${characterId}"]//div[contains(concat(" ", normalize-space(@class), " "), " ${dynamicTableKey} ")]//tr[${rowNum}]//*[contains(@class, ".${fieldKey}")]//input[@type="checkbox"]`;

        switch (action) {
            case 'checked':
                I.seeCheckboxIsChecked(inputLocator);
                break;
            case 'not checked':
                I.dontSeeCheckboxIsChecked(inputLocator);
                break;
        }
    }
);
