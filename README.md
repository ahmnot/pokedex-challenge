In order to run this app locally, open a terminal, go to ../pokedex-challenge, and run "npm run dev".
To build the app/website, run "npm run build".
If you want to be able to send data to Hubspot, you have to set up the call to the Google Cloud Function in App.svelte.
THE CODE FOR THE NODE.JS GOOGLE CLOUD FUNCTION IS HERE: /server/index.js (without the access token as intended).

IMPORTANT NOTE: There has been a sort of "reset" of my Hubspot account this night at midnight: there were no more contacts, nor contact properties, and the pokedex-challenge private app was gone. So I recreated everything on midnight, and I also had to get a new access token and to rewrite it on Google Cloud Functions. But then, on the morning, everything was back, so I had to rewrite the access token again.