const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FUNCTION_APP_NAME = 'fa-msgs016-dev';
const RESOURCE_GROUP_NAME = 'arg-productservice016-dev';

const getEnvironmentVariables = () => {
  try {
    const response = execSync(`az functionapp config appsettings list --name ${FUNCTION_APP_NAME} \
      --resource-group ${RESOURCE_GROUP_NAME}`, { cwd: process.cwd() });
    const variablesList = JSON.parse(response);
    return variablesList.reduce((obj, item) => ({
      ...obj,
      [item.name]: item,
    }), {});
  } catch (error) {
    console.error(error);
    return {};
  }
}

const isForceExecution = () => process.argv.includes('-f') || process.argv.includes('--force');

/**
 * Script inject env variables to the app functions thrown Azure CLI
 */
((envFileName) => {
  const isForce = isForceExecution();
  const variables = getEnvironmentVariables();
  const filePath = path.join(process.cwd(), envFileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} was not found.`)
  }
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const rows = content.split('\n');

  for (const row of rows) {
    const [key, ...value] = row.trim().split('=');
    const parsedValue = value.join('=');

    if (!isForce && variables[key]) {
      console.log(`Setting ${key} skipped.`)
      continue;
    }
    if (!parsedValue) continue;

    execSync(`az functionapp config appsettings set --name ${FUNCTION_APP_NAME} \
      --resource-group ${RESOURCE_GROUP_NAME} \
      --settings ${key}=${parsedValue}`, { cwd: process.cwd() });

    console.log(`Setting ${key} ${variables[key] ? 'updated' : 'created'}.`)
  }

})('.env')