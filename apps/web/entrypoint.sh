#!/bin/bash

pnpm -w install --filter '!@mailpilot/desktop'
pnpm prisma migrate dev
pnpm run dev
