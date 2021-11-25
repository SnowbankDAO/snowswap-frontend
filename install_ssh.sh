#! /bin/bash

cp package.json package.old.json

sed "s/<github_personal_access_token>/${GHTOKEN}/g" package.ci.json > package.json

yarn vercel

mv package.old.json package.json
