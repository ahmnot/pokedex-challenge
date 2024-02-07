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

  let pokemonCards = [];

  let pokemonsData = { pokemons: [] };

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

          newPokemon.name = speciesData.names.find(
            (entry) => entry.language.name === "fr",
          ).name;

          newPokemon.description = speciesData.flavor_text_entries.find(
            (entry) => entry.language.name === "fr",
          ).flavor_text;

          newPokemon.category = speciesData.genera
            .find((entry) => entry.language.name === "fr")
            .genus.replace("Pokémon ", "");
        }

        const responseAbility = await fetch(data.abilities[0].ability.url);
        if (responseAbility.ok) {
          newPokemon.talent = (await responseAbility.json()).names.find(
            (entry) => entry.language.name === "fr",
          ).name;
        } else {
          console.error(
            "Erreur lors de la récupération des talents du Pokémon.",
          );
        }

        const responsePokemonType = await fetch(data.types[0].type.url);
        if (responsePokemonType.ok) {
          const pokemonTypeTranslated = (
            await responsePokemonType.json()
          ).names.find((entry) => entry.language.name === "fr").name;
          newPokemon.type.label = pokemonTypeTranslated;
          newPokemon.type.icon =
            "./pokemon-icons/" +
            pokemonTypeTranslated.toLowerCase() +
            "-icon.png";
          newPokemon.type.color = typeToColorMap[newPokemon.type.label];
        } else {
          console.error("Erreur lors de la récupération des types du Pokémon.");
        }

        pokemonCards = [...pokemonCards, newPokemon];
        const pokemonDataFormatted = {
          name: newPokemon.name,
          description: newPokemon.description,
          size: data.height / 10,
          category: newPokemon.category,
          weight: data.weight / 10,
          talent: newPokemon.talent,
          type: {
            label: newPokemon.type.label,
          },
        };

        pokemonsData.pokemons = [
          ...pokemonsData.pokemons,
          pokemonDataFormatted,
        ];
      } else {
        console.error("Erreur lors de la récupération des données du Pokémon.");
      }
    }
  });

  let loading = false;
  let dataLoaded = false;

  async function sendToHubSpot() {
    loading = true;
    try {
      console.log(pokemonsData);
      // L'url est celle de ma fonction cloud
      const response = await fetch(
        "https://europe-west9-pokedex-challenge-413609.cloudfunctions.net/function-send-pokedata-to-hubspot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pokemonsData),
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Succès :", result);
        // Gérer le succès (peut-être afficher un message à l'utilisateur)
        dataLoaded = true;
      } else {
        console.error("Erreur lors de l'envoi à HubSpot");
        // Gérer l'erreur
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      // Gérer l'exception
    } finally {
      loading = false;
    }
  }

  let isHovered = false;
</script>

<main>
  <div class="banner">
    <div class="base-rectangle"></div>
    <div class="rectangle-2-patch-1"></div>
    <div class="rectangle-2">
      <img
        class="pokedex-logo"
        src="pokedex-logo.svg"
        alt="The pokedex logo."
        height="50"
        width="50"
      />
      <h1 class="pokedex-title">POKEDEX</h1>
    </div>
    <div class="rectangle-2-patch-2"></div>
    <div class="rectangle-3-patch-1"></div>
    <div class="rectangle-3">
      <button class="send-button" on:click={sendToHubSpot}
      on:mouseover={() => isHovered = true}
      on:mouseout={() => isHovered = false}
      on:focus={() => isHovered = true}
      on:blur={() => isHovered = false}>
        {#if loading}
          <div class="loader"></div>
        {:else}
          {#if dataLoaded}
            {#if isHovered}
              Send again ?
            {:else}
              Data loaded ✔️
            {/if}
          {:else}
            Send to Hubspot
          {/if}
        {/if}</button
      >
    </div>
    <div class="rectangle-3-patch-2"></div>
  </div>

  <div class="body-content">
    <div class="grid-container">
      {#each pokemonCards as pokemon}
        <PokemonCard {pokemon} />
      {/each}
    </div>
  </div>
</main>

<style>
  .loader {
    border: 4px solid #f3f3f3; /* Couleur de fond */
    border-top: 4px solid #3a84d1; /* Couleur de la bordure */
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .pokedex-title {
    font-family: "Rowdies", sans-serif;
    font-weight: 400;
    font-size: 42px;
    color: white;
    text-align: center;
    margin-left: 15px;
    transition: transform 0.1s ease;
  }

  .pokedex-logo {
    transition: transform 0.1s ease;
  }

  .pokedex-logo:hover {
    transform: scale(1.3);
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Crée une grille avec 4 colonnes */
  }

  /* Styles pour la bannière */
  .banner {
    position: absolute;
    width: 1440px;
    background: #cb575d;
    box-shadow: 4px 8px 25px rgba(52, 7, 11, 0.3);
    top: 0;
    left: 50%;
    transform: translateX(-46.5%);
  }

  .send-button {
    background-color: #ec767d;
    position: sticky;
    font-family: "Rowdies", sans-serif;
    font-weight: 400;
    font-size: 25px;
    color: white;
    border-radius: 45px;
    border: 3px solid white;
    padding: 15px 32px;
    transition: transform 0.1s ease;
  }

  .send-button:hover {
    cursor: pointer;
    transform: scale(1.05);
  }

  .send-button:active {
    background-color: #cb575d;
    transform: translateY(4px);
  }

  .body-content {
    padding-top: 120px; /* Ajustez selon la hauteur de votre bannière */
    left: 50%;
  }

  /* Styles pour le rectangle de base */
  .base-rectangle {
    position: absolute;
    width: 100%;
    height: 66px;
    top: 0;
    background: #cb575d;
    border-radius: 18px;
    z-index: 4;
  }

  /* Styles pour les rectangles supplémentaires */
  .rectangle-2,
  .rectangle-3 {
    position: absolute;
    height: 114px;
    background: #cb575d;
    border-radius: 45px;
    z-index: 4;
  }

  .rectangle-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 430px;
    left: 45px;
  }

  .rectangle-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 315px;
    left: 1080px;
  }

  /* Sert pour la fusion des rectangles */
  .rectangle-2-patch-1 {
    position: absolute;
    height: 10px;
    width: 10px;
    background: #c2424a;
    border-radius: 0;
    left: 35.5px;
    top: 66px;
    background-image: radial-gradient(
      at 0px 10px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 10px,
      #cb575d 10px
    );
    z-index: 0;
  }

  .rectangle-2-patch-2 {
    position: absolute;
    height: 10px;
    width: 10px;
    background: #c2424a;
    border-radius: 0;
    left: 475px;
    top: 66px;
    background-image: radial-gradient(
      at 10px 10px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 10px,
      #cb575d 10px
    );
    z-index: 0;
  }

  .rectangle-3-patch-1 {
    position: absolute;
    height: 10px;
    width: 10px;
    background: #c2424a;
    border-radius: 0;
    left: 1070px;
    top: 66px;
    background-image: radial-gradient(
      at 0px 10px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 10px,
      #cb575d 10px
    );
    z-index: 0;
  }

  /* Sert pour la fusion des rectangles */
  .rectangle-3-patch-2 {
    position: absolute;
    height: 10px;
    width: 10px;
    background: #c2424a;
    border-radius: 0;
    left: 1394px;
    top: 66px;
    background-image: radial-gradient(
      at 10px 10px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 10px,
      #cb575d 10px
    );
    z-index: 0;
  }
</style>
