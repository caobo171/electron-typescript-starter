#!/usr/bin/env bash

yarn client/build || echo  'you need to install yarn'
cross-env NODE_ENV=production electron-builder .

echo 'Done !!'
read
