/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DeepNestedObject } from '../definitions.js';
import { AppliedTemplateSystem } from '../documents/TemplateSystem.js';
import { ComputablePhraseOptions } from '../formulas/ComputablePhrase.js';

/**
 * Function which sends a message to the chat
 * @param postMessage Whether to actually post the message or just execute a computation
 * @param options Options to compute the message
 * @returns The Computable Phrase sent in the chat message
 */
export type SendToChatFunction = (
    postMessage?: boolean,
    options?: ComputablePhraseOptions
) => Promise<ComputablePhrase>;

/**
 * Represents all the functions triggering the chat messages, in an object organizing them by keys
 */
export type ChatSenderMap = DeepNestedObject<SendToChatFunction>;

/**
 * ChatSenderElement Interface
 * Implement this to have your component add a key to the rollable components
 */
export default interface ChatSenderElement {
    /**
     * Get all chat sending functions defined by this component
     * @param entity The entity sending the chat message
     * @param options Options to compute the message
     * @returns All the functions triggering the chat messages, in an object organizing them by keys
     */
    getSendToChatFunctions: (
        entity: AppliedTemplateSystem,
        options?: ComputablePhraseOptions
    ) => ChatSenderMap | undefined;
}

/**
 * ChatSenderElement tester
 * @param element The element to test
 * @returns If the element implements ChatSenderElement
 */
export function isChatSenderElement(element: unknown): element is ChatSenderElement {
    return (element as ChatSenderElement).getSendToChatFunctions !== undefined;
}
