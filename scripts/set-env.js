const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FUNCTION_APP_NAME = 'fa-productservice016-dev';
const RESOURCE_GROUP_NAME = 'arg-productservice016-dev';

/**
 * Script inject env variables to the app functions thrown Azure CLI
 */
((envFileName) => {
  const filePath = path.join(process.cwd(), envFileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} was not found.`)
  }
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const rows = content.split('\n');

  for (const row of rows) {
    const [key, ...value] = row.trim().split('=');
    const parsedValue = value.join('=');
    if (!parsedValue) continue;

    execSync(`az functionapp config appsettings set --name ${FUNCTION_APP_NAME} \
      --resource-group ${RESOURCE_GROUP_NAME} \
      --settings ${key}=${parsedValue}`, { cwd: process.cwd() });
  }

})('.env')