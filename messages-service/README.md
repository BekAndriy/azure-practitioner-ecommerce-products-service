# Import products service on Azure (AZ)

### Deploy to the Azure

```powershell

# Init terraform project
terraform init

# Setup environment on AZ
terraform apply

# Create '.env' file in the root folder. Example is in '.env.example'.
# Fill all env variables with proper values from the Storage Account which contain 'uploaded' and 'parsed' containers.
# Setup Function App configuration (EVN variables).
npm run update:env
# or
npm run update:env -- -f

# Install/Build/Deploy App Functions
npm i
npm run build
npm run deploy:dev

```
