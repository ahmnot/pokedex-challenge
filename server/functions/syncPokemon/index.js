// Ce code est le code de la fonction Google Cloud.

const functions = require('@google-cloud/functions-framework');
const { Client } = require('@hubspot/api-client');
const cors = require('cors');

// Utilisez cors pour permettre toutes les origines ou configurez selon vos besoins
const corsHandler = cors({ origin: true });

functions.http('sendToHubSpot', (req, res) => {

    corsHandler(req, res, () => {
        // Vérifiez si la requête est une requête pré-vol OPTIONS
        if (req.method === 'OPTIONS') {
            // Pré-vol terminé, pas besoin de traiter davantage
            res.status(204).send('');
            return;
        }

        // Configuration du client HubSpot avec le token d'authentification de l'app privée. À remplacer.
        const hubspotClient = new Client({ accessToken: '***' });

        // La requête POST doit contenir un tableau de Pokémons
        const pokemons = req.body.pokemons;

        if (!pokemons) {
            res.status(400).send('Aucun Pokémon fourni dans la requête.');
            return;
        }

        // Les données Pokémon mappées à celles des propriétés personnalisées des contacts Hubspot
        const contacts = pokemons.map(pokemon => {
            return {
                properties: {
                    firstname: pokemon.name,
                    description_du_pokemon: pokemon.description,
                    taille_du_pokemon: pokemon.size,
                    categorie_du_pokemon: pokemon.category,
                    poids: pokemon.weight,
                    talent_du_pokemon: pokemon.talent,
                    type_du_pokemon: pokemon.type.label
                }
            };
        });

        // Envoi de chaque "contact" à HubSpot
        try {
            for (const contact of contacts) {
                const createContactResponse = hubspotClient.crm.contacts.basicApi.create(contact).then((results) => {
                    console.log(results)
                })
                    .catch((err) => {
                        console.error(err);
                    });
                console.log(createContactResponse);
            }
            res.status(200).send('Tous les Pokémons ont été envoyés à HubSpot avec succès.');
        } catch (error) {
            console.error("Erreur lors de l'envoi à HubSpot :", error.message);
            res.status(500).send('Erreur lors de la communication avec HubSpot.');
        }
    });

});