#!/bin/bash
#    ------------------
#    | Using the file |
#    ------------------
#  Description:
#  Bash script to build, tag and push images.
#     The script accepts 4 arguments
#     - start
#     - debug
#     - build (with an extra argument for the environment)
#     - push
#  Examples:
#   $ ./buildImage.sh build dev
#     ^
#     start of script
#                     ^
#                     Arg1
#                     build
#                           ^
#                           Arg2 to build
#                           type: string
#                           will tag the image with "dev" (docker-image:dev)
set -e
cd ..

DOCKER_REPOSITORY=${DOCKER_REPOSITORY:-artifacts.microchip.com:7999/mcu8apps/github-views}
GIT_TAG=$(git tag)

# echo "Current version: ${DOCKER_VERSION_FILE}"

#APP_FOLDERS=("backend" "frontend")
APP_FOLDERS=($(find -maxdepth 1 -type d -not -path "./CI" -not -path "./.git" | cut -d/ -f2 | grep -v '\.'))

imageBuild() {
    IMAGE_STAGE=${1:-$IMAGE_STAGE}
    for item in ${APP_FOLDERS[@]}; do
        if [ -d ${item} ]; then
            DOCKER_VERSION_FILE=$(cat $item/VERSION)

            time docker build \
                -t ${DOCKER_REPOSITORY}/$item:${DOCKER_VERSION_FILE} \
                -t ${DOCKER_REPOSITORY}/$item:latest \
                $item
            else
                printf "\n\nERROR: Folder [${item}] does not exist\n"
                exit 1
        fi
    done
}

imagePush() {
    # docker push ${DOCKER_REPOSITORY}
    for item in ${APP_FOLDERS[@]}; do
        if [ -d ${item} ]; then
            time docker push \
                ${DOCKER_REPOSITORY}/$item
            else
                printf "\n\nERROR: Folder [${item}] does not exist\n"
                exit 1
        fi
    done
}
debug() {
    docker image ls
    docker ps -a
}

case "${1}" in
    start)
        imageBuild "${2}"
        imagePush
        ;;
    debug)
        debug
        ;;
    build)
        imageBuild "${2}"
        ;;
    push)
        imagePush
        ;;
    *)
        echo "Nothing has been inputed"
        echo "Defaults to debug"
        debug
        ;;
esac