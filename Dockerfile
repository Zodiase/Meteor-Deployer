FROM ubuntu:14.04
MAINTAINER Xingchen Hong <hello@xc-h.net>

USER root
RUN apt-get update && \
    apt-get upgrade -y -q
RUN apt-get install -y -q build-essential \
                          libssl-dev curl \
                          python-dev

RUN useradd -m -s /bin/bash meteor

#USER meteor
ENV HOME="/home/meteor"
WORKDIR "${HOME}"

##
# Install NodeJS with NVM
##
ARG nvm_version="0.31.6"
ARG node_version="4.4.7"
RUN curl -o- "https://raw.githubusercontent.com/creationix/nvm/v${nvm_version}/install.sh" | bash && \
    export NVM_DIR="${HOME}/.nvm" && \
    [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" && \
    nvm install ${node_version} && \
    nvm alias default ${node_version} && \
    nvm use default
ENV NVM_DIR="${HOME}/.nvm"
ENV PATH="${NVM_DIR}/versions/node/v${node_version}/bin:${PATH}" \
    NODE_PATH="${NVM_DIR}/versions/node/v${node_version}/lib/node_modules:${NODE_PATH}"

##
# Copy bundle and extract it
##
ENV APP_DIR="${HOME}/app"
# Option 1. Copy a folder.
COPY .build/bundle "${APP_DIR}"
# Option 2. Copy a tar ball.
#COPY .build/meteor-test.tar.gz ./bundle.tar.gz
#RUN mkdir -p "${APP_DIR}" && \
#    tar -xf bundle.tar.gz -C "${APP_DIR}" --strip-components 1 && \
#    rm bundle.tar.gz

# Setup app.
RUN cd "${APP_DIR}" && \
    (cd programs/server && npm install)
RUN printf '#!/bin/bash\nnode "%s/main.js"\n' "${APP_DIR}" >> start.sh

# Meteor Port Config
ENV ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000

USER meteor
ENTRYPOINT bash start.sh
