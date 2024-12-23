See: https://pokedex-challenge-othman.tiiny.site/

This demo app was first realized in 48 hours, to show my capacities in Svelte + Google Cloud Functions + Node.js, and then upgraded.

It fetches data from the PokéAPI, displays it nicely as cards, lazy loads the cards when scrolling, and sends it to Hubspot using a call to a Google cloud function.

To run this app locally:
- open a terminal
- go to ../pokedex-challenge
- run "npm run dev".

To build the app/website, run "npm run build".

If you want to be able to send data to Hubspot, you have to set up the call to the Google Cloud Function in App.svelte.

Code for the node.js Google Cloud Functions is here: /server/index.js.

![pokedex-challenge4](https://github.com/user-attachments/assets/928cff20-267d-46f8-8415-756df86459ee)
