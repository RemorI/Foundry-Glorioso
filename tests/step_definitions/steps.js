/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const { I } = inject();

const locators = require('./locators.js');

require('./templates_steps.js');
require('./character_steps.js');
require('./user_input_steps.js');
require('./items/item-steps.js');
require('./components/label_steps.js');
require('./components/textField_steps.js');
require('./components/numberField_steps.js');
require('./components/radio_steps.js');
require('./components/checkbox_steps.js');
require('./components/textArea_steps.js');
require('./components/select_steps.js');
require('./components/panel_steps.js');
require('./components/table_steps.js');
require('./components/tab_steps.js');
require('./components/dynamicTable_steps.js');

const { resetActorIds, getActorId, setActorId } = require('./utils.js');

Given(/^I setup the Foundry Instance$/, async () => {
    resetActorIds();

    I.amOnPage('/');

    let url = await I.grabCurrentUrl();

    if (url.endsWith('/license')) {
        I.click('#eula-agree');
        I.click('#sign');
        I.waitForNavigation();
        url = await I.grabCurrentUrl();
    }

    if (url.endsWith('/setup')) {
        I.wait(1);
        if (
            (await I.grabNumberOfVisibleElements(
                '//button[@data-world="autotestworld"][@data-action="launchWorld"]'
            )) === 0
        ) {
            I.click('button[data-action="worldCreate"]');

            I.fillField('//input[@name="title"]', 'AutoTestWorld');

            I.selectOption('//select[@name="system"]', 'custom-system-builder');
            I.click('//div[@id="world-config"]//button[@type="submit"]');
        }

        I.click('//button[@data-world="autotestworld"][@data-action="launchWorld"]');
        I.waitForNavigation();
    }

    I.selectOption('//select[@name="userid"]', 'AutoTestUser');
    I.click('//select[@name="userid"]');
    I.click('join');
    I.waitForNavigation();
    I.waitForElement('//a[@data-tab="actors"]', 10);

    I.executeScript(() => {
        game.actors.forEach((actor) => {
            actor.delete();
        });

        game.items.forEach((item) => {
            item.delete();
        });

        game.messages.forEach((messages) => {
            messages.delete();
        });
    });
});

Given(/^I am on the Actors tab$/, () => {
    I.click('//a[@data-tab="actors"]');
});

When(/^I wait (\d+) seconds$/, (waitTime) => {
    I.wait(waitTime);
});

When(/^I pause$/, (waitTime) => {
    pause();
});

When(/^I click '([a-zA-Z0-9- ]+)'$/, (clickLocator) => {
    I.scrollTo(locators[clickLocator]);
    I.click(locators[clickLocator]);
});

When(/^I type '(.*)' in '([a-zA-Z0-9- ]+)'$/, (text, inputLocator) => {
    I.fillField(locators[inputLocator], text);
});

When(/^I select '(.*)' in '([a-zA-Z0-9- ]+)'$/, (option, selectLocator) => {
    I.selectOption(locators[selectLocator], option);
});

When(/^I open the actor '(.*)'$/, (actorName) => {
    let actorId = getActorId(actorName);

    I.click('//a[@data-tab="actors"]');
    I.click(`//*[@id="actors"]//*[@data-document-id="${actorId}"]`);
    I.wait(0.5);
});

When(/^I open the item '(.*)'$/, (itemName) => {
    let itemId = getActorId(itemName);

    I.click('//a[@data-tab="items"]');
    I.click(`//*[@id="items"]//*[@data-document-id="${itemId}"]`);
    I.wait(0.5);
});

When(/^I close the template '(.*)'$/, (actorName) => {
    let actorId = getActorId(actorName);

    I.click(`#TemplateSheet-Actor-${actorId} a.close`);
    I.wait(0.5);
});

When(/^I close the character '(.*)'$/, (actorName) => {
    let actorId = getActorId(actorName);

    I.click(`#CharacterSheet-Actor-${actorId} a.close`);
    I.wait(0.5);
});

When(/^I unfocus everything$/, () => {
    I.click('#logo');
});

When(/^I '(accept|cancel)' the '(.*)' dialog$/, (action, dialogName) => {
    let dialogId = getActorId(dialogName);

    let inputLocator = `#${dialogId} button.dialog-button.`;

    switch (action) {
        case 'accept':
            inputLocator += 'yes';
            break;
        case 'cancel':
            inputLocator += 'no';
            break;
    }

    I.click(inputLocator);
    I.wait(0.5);
});

Then(/^The component edition dialog is opened$/, () => {
    I.seeTextEquals(
        'Edit component',
        '(//div[contains(concat(" ", normalize-space(@class), " "), " dialog ")])[last()]/header/h4'
    );
});

Then(/^The last chat message says '(.*)'$/, (message) => {
    message = message.replaceAll('\\n', '\n');

    I.click('//a[@data-tab="chat"]');
    I.seeTextEquals(message, '#chat-log .chat-message:nth-last-child(1) .message-content');
});

Then(/^a '(.*)' notification is displayed with text '(.*)'$/, (notificationStyle, text) => {
    I.seeTextEquals(text, `#notifications li.notification.${notificationStyle}`);
});

Then(/^the '(.*)' dialog is opened$/, async (dialogName) => {
    let dialogId = await I.grabAttributeFrom(
        '(//div[contains(concat(" ", normalize-space(@class), " "), " dialog ")])[last()]',
        'id'
    );

    setActorId(dialogName, dialogId);
});
