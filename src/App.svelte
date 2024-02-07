<script>
  import { onMount } from "svelte";
  import PokemonCard from "./lib/PokemonCard.svelte";

  // Exemple d'objet Pokémon
  // const pokemon = {
  //   name: "Bulbizarre",
  //   image: "./pokemon-images/1.png",
  //   description:
  //     "Il y a une graine sur son dos depuis sa naissance. Elle grossit un peu chaque jour.",
  //   size: "0,7 m",
  //   category: "Graine",
  //   weight: "6,9 kg",
  //   talent: "Engrais",
  //   type: {
  //     label: "Plante",
  //     color: "#19CC20",
  //     icon: "./pokemon-icons/plante-icon.png",
  //   },
  // };

  let pokemons = [];

  const typeToColorMap = {
    Plante: "#19CC20", // Vert
    Feu: "#EE942A", // Rouge orangé
    Eau: "#A5E0E0", // Bleu
    Insecte: "#CAE03F", // Vert olive
  };

  onMount(async () => {
    for (let pokemonId = 1; pokemonId <= 12; pokemonId++) {
      // Charge les 12 premiers Pokémon
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
      );

      if (response.ok) {
        const data = await response.json();
        let newPokemon = {
          name: data.name,
          image: data.sprites.other.dream_world.front_default,
          description: "?", // Rempli plus bas
          size: `${(data.height / 10).toString().replace(".", ",")} m`, // Convertit de décimètres en mètres
          category: "?", // Rempli plus bas
          weight: `${(data.weight / 10).toString().replace(".", ",")} kg`, // Convertit de hectogrammes en kilogrammes
          talent: data.abilities[0].ability.name, // Traduit plus bas
          type: {
            label: data.types[0].type.name,
            color: "#FFFFFF", // Couleur remplie plus bas
            icon: "?", // Rempli plus bas
          },
        };

        const responseSpecies = await fetch(data.species.url);

        if (responseSpecies.ok) {
          const speciesData = await responseSpecies.json();

          const nameTranslated = speciesData.names.find(
            (entry) => entry.language.name === "fr",
          ).name;
          newPokemon.name = nameTranslated;

          const flavorTextEntry = speciesData.flavor_text_entries.find(
            (entry) => entry.language.name === "fr",
          );
          newPokemon.description = flavorTextEntry
            ? flavorTextEntry.flavor_text
            : "Aucune description disponible.";

          const genera = speciesData.genera
            .find((entry) => entry.language.name === "fr")
            .genus.replace("Pokémon ", "");
          newPokemon.category = genera;
        }

        const responseAbility = await fetch(data.abilities[0].ability.url);
        if (responseAbility.ok) {
          const abilityData = await responseAbility.json();

          const abilityTranslated = abilityData.names.find(
            (entry) => entry.language.name === "fr",
          ).name;
          newPokemon.talent = abilityTranslated;
        }

        const responsePokemonType = await fetch(data.types[0].type.url);
        if (responsePokemonType.ok) {
          const pokemonTypeData = await responsePokemonType.json();

          const pokemonTypeTranslated = pokemonTypeData.names.find(
            (entry) => entry.language.name === "fr",
          ).name;
          newPokemon.type.label = pokemonTypeTranslated;
          newPokemon.type.icon =
            "./pokemon-icons/" +
            pokemonTypeTranslated.toLowerCase() +
            "-icon.png";
          newPokemon.type.color = typeToColorMap[newPokemon.type.label];
        }

        pokemons = [...pokemons, newPokemon];
      } else {
        console.error("Erreur lors de la récupération des données du Pokémon");
      }
    }
  });

  async function sendToHubSpot() {
    const pokemonsData = {}; // Récupérez les données des Pokémon que vous souhaitez envoyer

    try {
      const response = await fetch("URL_DE_VOTRE_FONCTION_CLOUD", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pokemonsData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Succès :", result);
        // Gérer le succès (peut-être afficher un message à l'utilisateur)
      } else {
        console.error("Erreur lors de l'envoi à HubSpot");
        // Gérer l'erreur
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      // Gérer l'exception
    }
  }
</script>

<main>
  <button on:click={sendToHubSpot}>Send to HubSpot</button>

  <div class="grid-container">
    {#each pokemons as pokemon}
      <PokemonCard {pokemon} />
    {/each}
  </div>
</main>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Crée une grille avec 4 colonnes */
  }
</style>
