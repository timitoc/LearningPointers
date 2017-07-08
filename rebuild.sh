#!/bin/bash
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker image rm learning-pointers
docker build -t "learning-pointers" ./LearningPointersContainer
