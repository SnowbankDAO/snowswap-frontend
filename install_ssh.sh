#! /bin/bash

mkdir -p ~/.ssh

echo "$SSH_KEY_PUB" > ~/.ssh/id_rsa.pub
echo "$SSH_KEY" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa*

yarn vercel
