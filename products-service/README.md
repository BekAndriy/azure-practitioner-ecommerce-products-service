# Azure Products Service - Serverless API (Azure Practitioner course)

### Useful links:

FE URL: https://azurecloudfrontfe0016.z16.web.core.windows.net/

### Commands:

Launch Function App locally

```
npm start
```

Deploy Function App to the server.

```
npm run deploy:dev
```

Insert ENV variables into the app functions configuration from the `.env` file

```powershell
# set new keys only
npm run update:env

# set and update keys
npm run update:env -- -f
```
