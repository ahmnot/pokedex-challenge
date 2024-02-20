// Ce code est le code de la fonction Google Cloud. 
// Il n'est pas destiné à être exécuté ailleurs que sur un serveur. 
// Ne pas oublier d'ajouter les dépendances.

const functions = require('@google-cloud/functions-framework');
const { Client } = require('@hubspot/api-client');
const cors = require('cors');

// cors permet toutes les origines là, mais à changer par le nom du site sur lequel je déploie ensuite.
const corsHandler = cors({ origin: true });
//{
//    origin: ['https://www.votre-site-web.com', 'https://staging.votre-site-web.com'],
//}

functions.http('sendToHubSpot', (req, res) => {

    corsHandler(req, res, async () => {
        // Vérifie si la requête est une requête pré-vol OPTIONS.
        if (req.method === 'OPTIONS') {
            // Pré-vol terminé, pas besoin de traiter davantage.
            res.status(204).send('');
            return;
        }

        // Configuration du client HubSpot avec le token d'authentification de l'app privée.
        // Ne pas oublier de configurer la variable d'environnement dans le cloud
        const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

        // La requête POST doit contenir un tableau de Pokémons.
        const pokemons = req.body.pokemons;

        if (!pokemons || !Array.isArray(pokemons)) {
            res.status(400).send('Données de Pokémon invalides ou absentes.');
            return;
        }

        // Les données Pokémon mappées à celles des propriétés personnalisées des contacts Hubspot.
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

        try {
            const apiResponse = await hubspotClient.crm.contacts.batchApi.create({ inputs: contacts });
            console.log('Réponse de l\'API HubSpot:', apiResponse);
            res.status(200).send(JSON.stringify({ 
                message: 'Les Pokémons ont été envoyés à HubSpot avec succès.',
                details: apiResponse
            }));
        } catch (error) {
            console.error("Erreurs lors de l'envoi à HubSpot :", error);
            res.status(500).send('Erreur lors de la communication avec HubSpot.');
        }
    });

});