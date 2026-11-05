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

When(/^I type '(.*)' as number field label$/, (contents) => {
    I.fillField('#numberFieldLabel', contents);
});

When(/^I type '(.*)' as number field minimum value$/, (contents) => {
    I.fillField('#numberFieldMinVal', contents);
});

When(/^I type '(.*)' as number field maximum value$/, (contents) => {
    I.fillField('#numberFieldMaxVal', contents);
});

When(/^I type '(.*)' as number field default value$/, (contents) => {
    I.fillField('#numberFieldValue', contents);
});

When(/^I '(check|uncheck)' allow decimal number$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#numberFieldAllowDecimal');
            break;
        case 'uncheck':
            I.uncheckOption('#numberFieldAllowDecimal');
            break;
    }
});

When(/^I '(check|uncheck)' allow relative modification$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#numberFieldAllowRelative');
            break;
        case 'uncheck':
            I.uncheckOption('#numberFieldAllowRelative');
            break;
    }
});

When(/^I '(check|uncheck)' show field controls$/, (action) => {
    switch (action) {
        case 'check':
            I.checkOption('#numberFieldShowControls');
            break;
        case 'uncheck':
            I.uncheckOption('#numberFieldShowControls');
            break;
    }
});

When(/^I select '(.*)' controls style$/, (style) => {
    I.selectOption('#numberFieldControlsStyle', style);
});

/**********************************************/
/*            CHARACTER STEPS                 */
/**********************************************/
When(
    /^I click on the '([+\-])(1?0?)' control button of number field '(.*)' in the character '(.*)'$/,
    (buttonAction, buttonAmount, fieldKey, characterName) => {
        let characterId = getActorId(characterName);

        let buttonLocator = '.custom-system-number-field-control';

        if (buttonAmount === '') {
            switch (buttonAction) {
                case '+':
                    buttonLocator += '-plus';
                    break;
                case '-':
                    buttonLocator += '-minus';
                    break;
            }

            I.click(`#CharacterSheet-Actor-${characterId} .${fieldKey} ${buttonLocator}`);
        } else {
            I.click(
                `//*[@id='CharacterSheet-Actor-${characterId}']//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-number-field-control ")][text() = '${buttonAction}${buttonAmount}']`
            );
        }
    }
);

Then(
    /^I '(see|don't see)' number field controls for '(.*)' in the character '(.*)'$/,
    (action, fieldKey, characterName) => {
        let characterId = getActorId(characterName);

        switch (action) {
            case 'see':
                I.seeElement(
                    `#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-number-field-control-plus`
                );
                I.seeElement(
                    `#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-number-field-control-minus`
                );
                break;
            case "don't see":
                I.dontSeeElement(
                    `#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-number-field-control-plus`
                );
                I.dontSeeElement(
                    `#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-number-field-control-minus`
                );

                break;
        }
    }
);

Then(/^I see full number field controls for '(.*)' in the character '(.*)'$/, (fieldKey, characterName) => {
    let characterId = getActorId(characterName);

    I.seeNumberOfElements(`#CharacterSheet-Actor-${characterId} .${fieldKey} .custom-system-number-field-control`, 4);
    I.seeElement(
        `//*[@id='CharacterSheet-Actor-${characterId}']//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-number-field-control ")][text() = '+10']`
    );
    I.seeElement(
        `//*[@id='CharacterSheet-Actor-${characterId}']//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-number-field-control ")][text() = '+1']`
    );
    I.seeElement(
        `//*[@id='CharacterSheet-Actor-${characterId}']//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-number-field-control ")][text() = '-1']`
    );
    I.seeElement(
        `//*[@id='CharacterSheet-Actor-${characterId}']//*[contains(concat(" ", normalize-space(@class), " "), " ${fieldKey} ")]//*[contains(concat(" ", normalize-space(@class), " "), " custom-system-number-field-control ")][text() = '-10']`
    );
});
