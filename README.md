In order to run this app locally, open a terminal, go to ../pokedex-challenge, and run "npm run dev".
To build the app/website, run "npm run build".
If you want to be able to send data to Hubspot, you have to set up the call to the Google Cloud Function in App.svelte.
The code for the node.js Google Cloud Function is available in /server/index.js (without the access token of course, you will have to get one for yourself).