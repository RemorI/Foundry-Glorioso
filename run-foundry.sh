#!/usr/bin/env bash

# Copyright 2024 Jean-Baptiste Louvet-Daniel
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

run() {
    if [ -z "${FOUNDRY_VERSION}" ]; then
        FOUNDRY_VERSION=latest
    fi

    CONTAINER_NAME="FoundryVTT_${FOUNDRY_VERSION}${DATA_SUFFIX}"
    CURRENT_CONTAINER_VERSION_EXISTS=$(docker ps -qa -f name="^${CONTAINER_NAME}$")

    DATA_PATH="$HOME/Documents/FoundryData_${FOUNDRY_VERSION}${DATA_SUFFIX}"
    DIST_PATH="$(pwd)/dist"

    if [[ "$OS" == "Windows_NT" ]]; then
        DATA_PATH="/${DATA_PATH}"
        DIST_PATH="/${DIST_PATH}"
    fi

    if [ -z "${CURRENT_CONTAINER_VERSION_EXISTS}" ]; then
        stop

        docker pull felddy/foundryvtt:${FOUNDRY_VERSION}

        docker run \
            -d \
            --env FOUNDRY_USERNAME="${FOUNDRY_USERNAME}" \
            --env FOUNDRY_PASSWORD="${FOUNDRY_PASSWORD}" \
            --env CONTAINER_PRESERVE_CONFIG="true" \
            --env CONTAINER_PRESERVE_OWNER=".*" \
            --user 1000:100 \
            --publish 30000:30000/tcp \
            --volume "${DATA_PATH}":/data \
            --volume "${DIST_PATH}":/data/Data/systems/custom-system-builder:ro \
            --name "${CONTAINER_NAME}" \
            --hostname "${CONTAINER_NAME}" \
            felddy/foundryvtt:${FOUNDRY_VERSION}

        if [ -n "${WAIT_FOR_START}" ]; then
            docker logs -f "${CONTAINER_NAME}" 2>&1 | grep -m 1 "Server started and listening on port 30000"
        fi
    else
        docker start "${CONTAINER_NAME}"
    fi

    if [ -n "${SHOW_LOGS}" ]; then
        log
    else
        echo "Running at http://localhost:30000"
    fi

}

stop() {
    docker ps -aq -f name="FoundryVTT" | xargs -n1 docker stop
}

log() {
    LAST_CONTAINER_ID=$(docker ps -aq -f name="FoundryVTT" -l)
    if [ -n "${LAST_CONTAINER_ID}" ]; then
        LAST_CONTAINER_NAME=$(docker ps -a -f id="${LAST_CONTAINER_ID}" -l --format "{{.Names}}")

        echo -e "Showing logs for ${LAST_CONTAINER_NAME}\n---\n"
        docker logs -f "${LAST_CONTAINER_ID}"
    fi
}

COMMAND=$1
shift

if [ -f .env ]; then
    source .env
fi

while [[ $# -gt 0 ]]; do
    case $1 in
    -l | --login)
        FOUNDRY_USERNAME="$2"
        shift # past argument
        shift # past value
        ;;
    -p | --password)
        FOUNDRY_PASSWORD="$2"
        shift # past argument
        shift # past value
        ;;
    -v | --foundry-version)
        FOUNDRY_VERSION="$2"
        shift # past argument
        shift # past value
        ;;
    -s | --data-suffix)
        DATA_SUFFIX="$2"
        shift # past argument
        shift # past value
        ;;
    --logs)
        SHOW_LOGS="true"
        shift # past argument
        shift # past value
        ;;
    --wait-for-start)
        WAIT_FOR_START="true"
        shift # past argument
        shift # past value
        ;;
    *)
        echo "Unknown option $1"
        exit 1
        ;;
    esac
done

case "${COMMAND}" in
run)
    run
    ;;
stop)
    stop
    ;;
log)
    log
    ;;
*)
    echo "Unknown command $COMMAND"
    exit 1
    ;;
esac
