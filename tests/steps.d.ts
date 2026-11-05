/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file.cjs');
type ResembleHelper = import('codeceptjs-resemblehelper');

declare namespace CodeceptJS {
    interface SupportObject {
        I: I;
        current: unknown;
    }
    interface Methods extends Puppeteer, ResembleHelper {}
    interface I extends ReturnType<steps_file>, WithTranslation<ResembleHelper> {}
    namespace Translation {
        // oxlint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Actions {}
    }
}
