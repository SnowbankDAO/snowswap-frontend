#! /bin/bash

mkdir -p ~/.ssh

echo "$SSH_KEY" > /tmp/pk
chmod 600 /tmp/pk
ssh-agent bash -c 'ssh-add /tmp/pk; yarn vercel'
