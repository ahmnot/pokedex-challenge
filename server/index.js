// Ce code est le code de la fonction Google Cloud. 
// Il n'est pas destiné à être exécuté ailleurs que sur un serveur. 
// Ne pas oublier d'ajouter les dépendances.

const functions = require('@google-cloud/functions-framework');
const { Client } = require('@hubspot/api-client');
const cors = require('cors');

// cors permet toutes les origines.
const corsHandler = cors({ origin: true });

functions.http('sendToHubSpot', (req, res) => {

    corsHandler(req, res, () => {
        // Vérifie si la requête est une requête pré-vol OPTIONS.
        if (req.method === 'OPTIONS') {
            // Pré-vol terminé, pas besoin de traiter davantage.
            res.status(204).send('');
            return;
        }

        // Configuration du client HubSpot avec le token d'authentification de l'app privée. À REMPLACER QUAND DEPLOYE.
        const hubspotClient = new Client({ accessToken: '***' });

        // La requête POST doit contenir un tableau de Pokémons.
        const pokemons = req.body.pokemons;

        if (!pokemons) {
            res.status(400).send('Aucun Pokémon fourni dans la requête.');
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

        // Promise.allSettled() sert pour traiter toutes les promesses en parallèle. 
        // C'est seulement après qu'il vérifie si des erreurs se sont produites 
        // pendant les opérations asynchrones 
        // et qu'il gère les erreurs en conséquence
        Promise.allSettled(contacts.map(contact =>
            hubspotClient.crm.contacts.basicApi.create(contact)
        )).then(results => {
            const errors = results.filter(result => result.status === 'rejected');
            if (errors.length > 0) {
                console.error("Erreurs lors de l'envoi à HubSpot :", errors);
                res.status(500).send('Erreur lors de la communication avec HubSpot.');
            } else {
                console.log('Tous les Pokémons ont été envoyés à HubSpot avec succès.');
                res.status(200).send(JSON.stringify({ message: 'Tous les Pokémons ont été envoyés à HubSpot avec succès.' }));
            }
        });
    });

});