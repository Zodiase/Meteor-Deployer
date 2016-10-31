# Meteor-Deployer

## Example

```
# Create a meteor app.
meteor create helloworld
# Create a folder to contain deployment info in the app. The name of the folder should start with a '.' to be excluded from the meteor build process.
cd helloworld; mkdir -p .deploy
# Enter the deployment folder and initialize the config files.
cd .deploy; meteord init

# Modify the config files to suit your need.

# Deploy the app.
meteord deploy

# Get the logs from the app.
meteord logs
```
