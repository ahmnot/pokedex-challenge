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

  let nbrePokemons = 12;

  /** Les données des cartes formatées pour l'affichage.*/
  let pokemonCardsShown = [];

  /** Les données des cartes formatées pour l'enregistrement dans Hubspot. */
  let pokemonsDataSent = { pokemons: [] };

  let loading = false;
  let dataLoaded = false;

  let isButtonHovered = false;

  /** Sert pour le build public (pour éviter de me faire spammer) */
  let notAllowed = false;

  const typeToColorMap = {
    Plante: "#19CC20", // Vert
    Feu: "#EE942A", // Rouge orangé
    Eau: "#A5E0E0", // Bleu
    Insecte: "#CAE03F", // Vert olive
  };

  /**
   * Sert à récupérer des données de traduction ou autres, et à remplir les données affichées et envoyées.
   * @param pokemon
   */
  async function fetchPokemonDetails(pokemon) {
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    const abilityResponse = await fetch(pokemon.abilities[0].ability.url);
    const abilityData = await abilityResponse.json();
    const typeResponse = await fetch(pokemon.types[0].type.url);
    const typeData = await typeResponse.json();

    const name = speciesData.names.find((n) => n.language.name === "fr").name;
    const description = speciesData.flavor_text_entries.find(
      (e) => e.language.name === "fr",
    ).flavor_text;
    const category = speciesData.genera
      .find((g) => g.language.name === "fr")
      .genus.replace("Pokémon ", "");
    const talent = abilityData.names.find((n) => n.language.name === "fr").name;
    const pokemonType = typeData.names.find(
      (n) => n.language.name === "fr",
    ).name;

    const pokemonDataForSending = {
      name: name,
      description: description,
      size: pokemon.height / 10,
      category: category,
      weight: pokemon.weight / 10,
      talent: talent,
      type: {
        label: pokemonType,
      },
    };

    pokemonsDataSent.pokemons.push(pokemonDataForSending);

    const pokemonDataShown = {
      name: name,
      image: pokemon.sprites.other.dream_world.front_default,
      description: description,
      size: `${(pokemon.height / 10).toString().replace(".", ",")} m`,
      category: category,
      weight: `${(pokemon.weight / 10).toString().replace(".", ",")} kg`,
      talent: talent,
      type: {
        label: pokemonType,
        color: typeToColorMap[pokemonType] || "#FFFFFF",
        icon: `./pokemon-icons/${pokemonType.toLowerCase()}-icon.png`,
      },
    };

    pokemonCardsShown = [...pokemonCardsShown, pokemonDataShown];
  }

  onMount(async () => {
    loading = true;
    try {
      const pokemonPromises = Array.from({ length: nbrePokemons }, (_, index) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${index + 1}`).then(
          (response) => response.json(),
        ),
      );

      const pokemons = await Promise.all(pokemonPromises);

      pokemons.forEach((pokemon) => {
        fetchPokemonDetails(pokemon);
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données des Pokémon:",
        error,
      );
    } finally {
      loading = false;
    }
  });

  async function sendToHubSpot() {
    loading = true;
    try {
      // ICI est le lien d'appel à la Google Cloud Function.
      const response = await fetch(
        "https://europe-west9-pokedex-challenge-413609.cloudfunctions.net/function-send-pokedata-to-hubspot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pokemonsDataSent),
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Succès :", result);
        dataLoaded = true;
      } else {
        console.error("Erreur lors de l'envoi à HubSpot");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
    } finally {
      loading = false;
    }
  }
</script>

<main class="main-container">
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
      <button
        class="send-button"
        disabled={dataLoaded}
        class:button-disabled={dataLoaded}
        on:click={sendToHubSpot}
        on:mouseover={() => (isButtonHovered = true)}
        on:mouseout={() => (isButtonHovered = false)}
        on:focus={() => (isButtonHovered = true)}
        on:blur={() => (isButtonHovered = false)}
      >
        {#if loading}
          <div class="loader"></div>
        {:else}
          {#if dataLoaded}
            Data sent. ✔️
          {:else if notAllowed}
            Not allowed! ❌
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
      {#each pokemonCardsShown as pokemon}
        <PokemonCard {pokemon} />
      {/each}
    </div>
  </div>
</main>

<style>
  /* Conteneur de la banner. */
  .banner {
    position: absolute;
    width: 1440px;
    background: #cb575d;
    box-shadow: 4px 8px 25px rgba(52, 7, 11, 0.3);
    top: 0;
    left: 50%;
    transform: translateX(-46.5%);
  }

  /* Rectangle principal de la banner. */
  .base-rectangle {
    position: absolute;
    width: 100%;
    height: 66px;
    top: 0;
    background: #cb575d;
    border-radius: 18px;
    z-index: 4;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Rectangle de gauche. */
  .rectangle-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 430px;
    left: 45px;
  }

  /* Rectangle de droite. */
  .rectangle-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 315px;
    left: 1080px;
  }

  .rectangle-2,
  .rectangle-3 {
    position: absolute;
    height: 114px;
    background: #cb575d;
    border-radius: 45px;
    z-index: 4;
  }

  /* Les petits coins de la fusion des rectangles. */
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

  .pokedex-logo {
    transition: transform 0.1s ease;
  }

  .pokedex-logo:hover {
    transform: scale(1.3);
  }

  /* Le gros titre. */
  .pokedex-title {
    font-family: "Rowdies", sans-serif;
    font-weight: 400;
    font-size: 42px;
    color: white;
    text-align: center;
    margin-left: 15px;
  }

  /* Bouton d'envoi. */
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

  .button-disabled {
    background-color: grey;
  }

  .button-disabled:active {
    background-color: grey;
    transform: translateY(0px);
  }

  /* Le loader-spinner. */
  .loader {
    border: 4px solid #f3f3f3;
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

  /* Conteneur des cartes. */
  .body-content {
    padding-top: 120px;
    left: 50%;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Grille de 4 colonnes. */
  }

  /** PARTIE RESPONSIVENESS */

  /* Taille moyenne-grande */
  @media (max-width: 1570px) {
    .grid-container {
      grid-template-columns: repeat(3, 1fr);
    }

    /* Styles pour la bannière */
    .banner {
      width: 1100px;
      transform: translateX(-50%);
    }

    .rectangle-3 {
      left: 740px;
    }

    .rectangle-3-patch-1 {
      left: 730px;
    }

    .rectangle-3-patch-2 {
      left: 1054px;
    }
  }

  /* Taille moyenne */
  @media (max-width: 1120px) {
    .grid-container {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Styles pour la bannière */
    .banner {
      width: 800px;
      transform: translateX(-50%);
    }

    .rectangle-2 {
      left: 15px;
    }

    .rectangle-3 {
      left: 470px;
    }

    .rectangle-3-patch-1 {
      left: 480px;
    }

    .rectangle-3-patch-2 {
      left: 784px;
    }

    .rectangle-2-patch-1,
    .rectangle-2-patch-2,
    .rectangle-3-patch-1,
    .rectangle-3-patch-2 {
      display: none;
    }
  }

  /* Taille petite */
  @media (max-width: 820px) {
    .grid-container {
      top: 150px;
      grid-template-columns: 1fr;
    }

    /* Styles pour la bannière */
    .banner {
      width: 0;
    }

    .body-content {
      padding-top: 180px;
      left: 50%;
    }

    .rectangle-2 {
      left: 50%;
      transform: translateX(-50%);
    }

    .rectangle-3 {
      top: 85px;
      left: 50%;
      transform: translateX(-50%);
    }

    .rectangle-2-patch-1,
    .rectangle-2-patch-2,
    .rectangle-3-patch-1,
    .rectangle-3-patch-2 {
      display: none;
    }
  }
</style>
