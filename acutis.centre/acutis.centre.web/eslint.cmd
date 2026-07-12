@ECHO OFF
SETLOCAL

SET "NODE_EXE=C:\nvm4w\nodejs\node.exe"
SET "ESLINT_JS=.\node_modules\eslint\bin\eslint.js"

"%NODE_EXE%" "%ESLINT_JS%" %*
