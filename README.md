See: https://pokedex-challenge-othman.tiiny.site/

This demo app was realized in 48 hours, to show my fullstack capacities in Svelte + Google Cloud Functions + Node.js.

It fetches data from the PokéAPI, displays it nicely and sends it to Hubspot using a call to a Google cloud function.

To run this app locally:
- open a terminal
- go to ../pokedex-challenge
- run "npm run dev".

To build the app/website, run "npm run build".

If you want to be able to send data to Hubspot, you have to set up the call to the Google Cloud Function in App.svelte.

Code for the node.js Google Cloud Functions is here: /server/index.js.
