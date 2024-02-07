import { Client } from '@hubspot/api-client';

export async function sendToHubSpot(req, res) {
    // Configurer le client HubSpot avec votre clé API ou votre token d'authentification
    const hubspotClient = new Client({ apiKey: 'votre-clé-api' });

    // Supposons que la requête POST contient un tableau de Pokémon
    const pokemons = req.body.pokemons;

    // Mapper les données Pokémon aux contacts HubSpot
    const contacts = pokemons.map(pokemon => {
        return {
            properties: {
                firstname: pokemon.name, // Le prénom est utilisé comme exemple
                // Ajoutez d'autres propriétés HubSpot personnalisées ici
            }
        };
    });

    // Envoyer chaque contact à HubSpot
    try {
        for (const contact of contacts) {
            const createContactResponse = await hubspotClient.crm.contacts.basicApi.create(contact);
            console.log(createContactResponse);
        }
        res.status(200).send('Tous les Pokémons ont été envoyés à HubSpot avec succès.');
    } catch (error) {
        console.error("Erreur lors de l'envoi à HubSpot :", error.message);
        res.status(500).send('Erreur lors de la communication avec HubSpot.');
    }
}