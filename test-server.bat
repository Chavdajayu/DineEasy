@echo off
echo Testing server startup...
set NODE_ENV=development
npx tsx server/index.ts
pause