#! /bin/bash

sed "s/<github_personal_access_token>/${GHTOKEN}/g" package.ci.json > package.json

yarn vercel
