# K12 Attendance Report
An Electron and pupppeteer based app to run K12 attendance reports nightly for users.  The current version will run nightly at 11:55pm Monday - Friday.  

## To get started
1. Create a copy creds.json.default named creds.json and replace the relevant values in <> with your details.
2. From a command window 
  * npm install
  * npm install -g electron-packager
  * npm build
3. Open the build output for your system and run the executable file.  This will start the Electron app headlessly and schedule the job to run at 11:55pm Monday - Friday.
