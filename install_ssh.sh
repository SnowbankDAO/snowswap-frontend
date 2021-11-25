#! /bin/bash

mkdir -p ~/.ssh

echo "Listing"
ls ~/.ssh
echo "Listing done"

echo "$SSH_KEY_PUB" > ~/.ssh/id_rsa.pub
echo "$SSH_KEY" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa*

yarn vercel
