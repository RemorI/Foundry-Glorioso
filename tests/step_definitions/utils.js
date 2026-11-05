/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

let actorIds = {};

const resetActorIds = () => {
    actorIds = {};
};

const setActorId = (key, id) => {
    actorIds[key] = {
        ...actorIds[key],
        id: id
    };

    return id;
};

const setActorTemplateId = (key, id) => {
    actorIds[key] = {
        ...actorIds[key],
        templateId: id
    };

    return id;
};

const getActorId = (key) => {
    return actorIds[key]?.id;
};

const getActorTemplateId = (key) => {
    return actorIds[key]?.templateId;
};

module.exports = {
    resetActorIds,
    setActorId,
    setActorTemplateId,
    getActorId,
    getActorTemplateId
};
