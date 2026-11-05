/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { I } = inject();
const { getActorId } = require('./utils.js');

When(/^I type '(.*)' in the '(.*)' field in '(.*)' input dialog$/, (value, fieldName, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} *[name="${fieldName}"]`;

    I.click(inputLocator);
    I.pressKey(['Control', 'A']);
    I.pressKey('Backspace');

    I.fillField(inputLocator, value);
});

When(/^I select '(.*)' in the '(.*)' field in '(.*)' input dialog$/, (value, fieldName, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} *[name="${fieldName}"]`;

    I.selectOption(inputLocator, value);
});

When(/^I check '(.*)' in the '(.*)' radio buttons in '(.*)' input dialog$/, (value, fieldName, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} input[name="${fieldName}"][value="${value}"]`;

    I.click(inputLocator);
});

When(/^I (check|uncheck) the '(.*)' checkbox in '(.*)' input dialog$/, (action, fieldName, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} *[name="${fieldName}"]`;

    switch (action) {
        case 'check':
            I.checkOption(inputLocator);
            break;
        case 'uncheck':
            I.uncheckOption(inputLocator);
            break;
    }
});

When(
    /^I (add|subtract) '(10?)' in the '(.*)' field in '(.*)' input dialog$/,
    (action, value, fieldName, dialogName) => {
        let dialogId = getActorId(dialogName);

        let locatorAction = '';
        switch (action) {
            case 'add':
                locatorAction = 'add';
                break;
            case 'subtract':
                locatorAction = 'sub';
                break;
        }

        locatorAction += '-' + value;

        let inputLocator = `#${dialogId} .custom-system-user-input-button[data-input-ref="${fieldName}"][data-action="${locatorAction}"]`;

        I.click(inputLocator);
    }
);

When(/^I validate the '(.*)' input dialog$/, (dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} .dialog-button.ok`;

    I.click(inputLocator);
});
