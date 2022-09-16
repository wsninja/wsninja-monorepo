#!/bin/bash

set -xe

. .env

METADATA_PATH="/tmp/meta"
mkdir -p ${METADATA_PATH}

REPOSITORY="quay.io/wallstreetninja"
FRONTENT_IMAGE=""
BACKEND_IMAGE_NAME="backend"
BACKEND_IMAGE_TAG="latest"
BACKEND_CONTAINER_NAME="backend"

BACKEND_IMAGE=${REPOSITORY}/${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_TAG}

BACKEND_DB_PATH="/tmp/db"

mkdir -p ${BACKEND_DB_PATH}


function check_new() {
    local name=$1
    local image=$2

    docker pull ${image}
    digest=$(docker inspect ${image} | jq -r .[0].Digest)
    last_digest=$(cat ${METADATA_PATH}/${name})
    if [ "$(docker ps -a | grep ${name})" == "" ] || [ "${digest}" != "${last_digest}" ]; then
        echo "new"
        echo ${digest} > ${METADATA_PATH}/${name}
    fi

}

function run_backend() {
    echo "Starting backend"
    docker stop -i ${BACKEND_CONTAINER_NAME}
    docker run -d --rm -p 8000:8000 --name ${BACKEND_CONTAINER_NAME} -v ${BACKEND_DB_PATH}:/node/db:z \
        -e ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH} \
        -e ADMIN_PASSWORD_SALT=${ADMIN_PASSWORD_SALT} \
        -e BSC_RPC_URL_1=${BSC_RPC_URL_1} \
        -e ETHEREUM_RPC_URL_1=${ETHEREUM_RPC_URL_1} \
        -e POLYGON_RPC_URL_1=${POLYGON_RPC_URL_1} \
        -e BSC_RPC_URL_2=${BSC_RPC_URL_2} \
        -e ETHEREUM_RPC_URL_2=${ETHEREUM_RPC_URL_2} \
        -e POLYGON_RPC_URL_2=${POLYGON_RPC_URL_2} \
        -e DB_PATH=${DB_PATH} \
        -e COVALENT_API_KEY=${COVALENT_API_KEY} \
        -e HOST=${HOST} \
        -e PORT=${PORT} \
        -e REFERRER_ADDRESS=${REFERRER_ADDRESS} \
        -e REFERRER_FEE=${REFERRER_FEE} \
        -e SIGNING_PASSWORD=${SIGNING_PASSWORD} \
        -e DEBANK_API_KEY=${DEBANK_API_KEY} \
        ${BACKEND_IMAGE}
}

function run_frontend() {
    docker run --rm -p 8000:80 ...
}

IS_BACKEND_NEW=$(check_new ${BACKEND_CONTAINER_NAME} ${BACKEND_IMAGE})
#docker pull ${FRONTENT_IMAGE}

if [ "${IS_BACKEND_NEW}" == "new" ]; then
    run_backend;
fi

#docker run -d --rm --name frontend \
#    -e REACT_APP_BACKEND_URL="http://${SERVER_DNS}:8000" \
#    -e REACT_APP_TESTING=1 \
#    ${FRONTENT_IMAGE}

