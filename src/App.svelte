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

  let limit = 12; // Nombre de Pokémon à charger à chaque fois
  let offset = 0; // Offset pour le chargement des Pokémon
  let maxPokemons = 151;
  let loadingMore = false;

  let sentinel;

  /** Les données des cartes formatées pour l'affichage.*/
  let pokemonCardsShown = [];
  let pokemonsLoaded = Array(maxPokemons).fill(false);

  /** Les données des cartes formatées pour l'enregistrement dans Hubspot. */
  let pokemonsDataSent = { pokemons: [] };

  let loading = false;
  let dataLoaded = false;
  let isFetchingError = false;
  let isHubspotError = false;

  let isButtonHovered = false;

  /** Sert pour le build public (pour éviter de me faire spammer) */
  let notAllowed = true;

  const typeToColorMap = {
    normal: "#a8a979",
    fire: "#EE942A", // Rouge orangé
    fighting: "#c13029",
    water: "#A5E0E0", // Bleu
    flying: "#a891f1",
    grass: "#19CC20", // Vert
    poison: "#a041a1",
    electric: "#F9D031",
    ground: "#e0c068",
    psychic: "#f95889",
    rock: "#b9a138",
    ice: "#99d9d8",
    bug: "#a8b820", // Vert olive
    dragon: "#7138f9",
    ghost: "#705999",
    dark: "#705848",
    steel: "#b9b9d0",
    fairy: "#ef99ad",
    stellar: "#7cc6b3",
    unknown: "#5B5A5B",
  };

  /**
   * Sert à récupérer des données de traduction ou autres, et à remplir les données affichées et envoyées.
   * @param pokemon
   */
  async function fetchPokemonDetails(pokemon) {
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    const ability1Response = await fetch(pokemon.abilities[0].ability.url);
    const ability1Data = await ability1Response.json();
    const type1Response = await fetch(pokemon.types[0].type.url);
    const type1Data = await type1Response.json();

    console.log(speciesData.genera);

    // Formattage, différent entre données affichées et envoyées
    const name = speciesData.names.find((n) => n.language.name === "fr").name;
    const description = speciesData.flavor_text_entries.find(
      (e) => e.language.name === "fr",
    ).flavor_text;
    const category = speciesData.genera
      .find((g) => g.language.name === "fr")
      .genus.replace("Pokémon ", "");
    const talent1 = ability1Data.names.find(
      (n) => n.language.name === "fr",
    ).name;
    const pokemonType1 = type1Data.names.find(
      (n) => n.language.name === "fr",
    ).name;

    const pokemonDataForSending = {
      name: name,
      description: description,
      size: pokemon.height / 10,
      category: category,
      weight: pokemon.weight / 10,
      talent: talent1,
      type: {
        label: pokemonType1,
      },
    };

    pokemonsDataSent.pokemons.push(pokemonDataForSending);

    const pokemonDataShown = {
      id: pokemon.id,
      name: name,
      image: pokemon.sprites.other.dream_world.front_default,
      description: description,
      size: `${(pokemon.height / 10).toString().replace(".", ",")} m`,
      category: category,
      weight: `${(pokemon.weight / 10).toString().replace(".", ",")} kg`,
      talent1: talent1,
      type1: {
        label: pokemonType1,
        color: typeToColorMap[type1Data.name] || "#FFFFFF",
        icon: `./pokemon-icons/${type1Data.name}.png`,
      },
    };

    if (pokemon.types[1]) {
      const type2Response = await fetch(pokemon.types[1].type.url);
      const type2Data = await type2Response.json();
      const pokemonType2 = type2Data.names.find(
        (n) => n.language.name === "fr",
      ).name;
      pokemonDataShown.type2 = {
        label: pokemonType2,
        color: typeToColorMap[type2Data.name] || "#FFFFFF",
        icon: `./pokemon-icons/${type2Data.name}.png`,
      };
    }

    if (pokemon.abilities[1]) {
      const ability2Response = await fetch(pokemon.abilities[1].ability.url);
      const ability2Data = await ability2Response.json();
      pokemonDataShown.talent2 = ability2Data.names.find(
        (n) => n.language.name === "fr",
      ).name;
    }

    pokemonsLoaded[pokemon.id - 1] = pokemonDataShown;

    // Affichage des pokémons dans l'ordre
    for (let i = 0; i < pokemonsLoaded.length; i++) {
      if (pokemonsLoaded[i] === false) {
        // Si un Pokémon dans la séquence (dans l'ordre donc) n'est pas encore chargé, arrêt de la vérification
        break;
      }
      if (
        pokemonsLoaded[i] &&
        !pokemonCardsShown.some((p) => p.id === pokemonsLoaded[i].id)
      ) {
        // Si le Pokémon est chargé mais pas encore affiché, ajout à l'affichage
        pokemonCardsShown = [...pokemonCardsShown, pokemonsLoaded[i]];
      }
    }
  }

  async function loadPokemons(limit, startOffset) {
    // Calcul du nombre restant de Pokémon à charger
    const remaining = maxPokemons - startOffset;

    // Si aucun Pokémon restant à charger arrêter
    if (remaining <= 0) return;

    // Ajuste la limite si le nombre restant est inférieur à la limite de chargement
    const effectiveLimit = Math.min(limit, remaining);

    if (loadingMore || remaining === 0) return;
    loadingMore = true;
    // On boucle sur les Pokémons par Promise, ce qui permet de les charger en parallèle
    const pokemonPromises = Array.from({ length: effectiveLimit }, (_, index) =>
      fetch(
        `https://pokeapi.co/api/v2/pokemon/${startOffset + index + 1}`,
      ).then((response) => response.json()),
    );

    const pokemons = await Promise.all(pokemonPromises);

    await Promise.all(pokemons.map((pokemon) => fetchPokemonDetails(pokemon)));

    offset += effectiveLimit; // Màj de l'offset pour le prochain chargement

    loadingMore = false;
  }

  onMount(async () => {
    loading = true;
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loadingMore) {
            loadPokemons(limit, offset);
          }
        },
        {
          rootMargin: "200px",
        },
      );

      observer.observe(sentinel);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données des Pokémon:",
        error,
      );
      isFetchingError = true;
    } finally {
      loading = false;
    }
  });

  async function sendToHubSpot() {
    if(notAllowed) {
      return;
    }
    loading = true;
    isHubspotError = false;
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
        console.log("Succès :", result.message);
        dataLoaded = true;
      } else {
        isHubspotError = true;
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
          {#if dataLoaded && !isButtonHovered}
            Data sent. ✔️
          {:else if notAllowed}
            Coming soon! 💎
          {:else if isHubspotError && !isButtonHovered}
            No Hubspot link! ❌
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
      {#each pokemonCardsShown as pokemon (pokemon.id)}
        <PokemonCard {pokemon} />
      {/each}
    </div>
    <div bind:this={sentinel}></div>
  </div>
  {#if loadingMore}
    <div class="loader-bottom"></div>
  {/if}
</main>

<style>
  /* Conteneur de la banner. */
  .banner {
    position: absolute;
    width: 1440px;
    background: #cb575d;
    top: 0;
    left: 50%;
      transform: translateX(-50%);
    filter: drop-shadow(0 0 2rem rgba(52, 7, 11, 0.3));
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

  /* Rectangle de gauche, qui contient le titre. */
  .rectangle-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 430px;
    left: 45px;
  }

  /* Rectangle de droite, qui contient le bouton. */
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

  /* Les petits coins qui font la fusion des rectangles. */
  .rectangle-2-patch-1 {
    position: absolute;
    height: 20px;
    width: 20px;
    background: rgba(0, 0, 0, 0);
    border-radius: 0;
    left: 27.5px;
    top: 66px;
    background-image: radial-gradient(
      at 0px 20px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 20px,
      #cb575d 20px
    );
    z-index: 0;
  }

  .rectangle-2-patch-2 {
    position: absolute;
    height: 20px;
    width: 20px;
    background: rgba(0, 0, 0, 0);
    border-radius: 0;
    left: 473px;
    top: 66px;
    background-image: radial-gradient(
      at 20px 20px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 20px,
      #cb575d 20px
    );
    z-index: 0;
  }

  .rectangle-3-patch-1 {
    position: absolute;
    height: 20px;
    width: 20px;
    background: rgba(0, 0, 0, 0);
    border-radius: 0;
    left: 1062px;
    top: 66px;
    background-image: radial-gradient(
      at 0px 20px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 20px,
      #cb575d 20px
    );
    z-index: 0;
  }

  .rectangle-3-patch-2 {
    position: absolute;
    height: 20px;
    width: 20px;
    background: rgba(0, 0, 0, 0);
    border-radius: 0;
    left: 1393px;
    top: 66px;
    background-image: radial-gradient(
      at 20px 20px,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 20px,
      #cb575d 20px
    );
    z-index: 0;
  }

  .pokedex-logo {
    transition: transform 0.1s ease;
    will-change: transform;
  }

  .pokedex-logo:hover {
    transform: scale(1.13);
  }

  /* Le gros titre. */
  .pokedex-title {
    font-family: "Rowdies", sans-serif;
    font-weight: 400;
    font-size: 42px;
    color: white;
    text-align: center;
    margin-left: 15px;
    transition: transform 0.1s;
    will-change: transform;
  }

  .pokedex-title:hover {
    transform: scale(1.05);
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
    will-change: transform;
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

  .loader-bottom {
    position: fixed;
    bottom: 15px;
    left: 95%;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3a84d1; /* Couleur de la bordure */
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 2s linear infinite;
    z-index: 10;
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
    position: relative;
    display: grid;
    left: 50%;
    grid-template-columns: repeat(4, 1fr);
    transform: translateX(-54%);
  }

  /** PARTIE RESPONSIVENESS */

  /* Taille moyenne-grande */
  @media (max-width: 1570px) {
    .grid-container {
    position: static;
    transform: translateX(0);
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
      left: 723px;
    }

    .rectangle-3-patch-2 {
      left: 1053px;
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

    .rectangle-2-patch-1 {
      left: 1px;
      top: 59px;
      background-image: radial-gradient(
        at 0px 30px,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0) 20px,
        #cb575d 20px
      );
    }

    .rectangle-2-patch-2 {
      left: 442px;
      top: 59px;
      background-image: radial-gradient(
        at 20px 30px,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0) 20px,
        #cb575d 20px
      );
    }

    .rectangle-3-patch-1 {
      left: 452px;
    }

    .rectangle-3-patch-2 {
      left: 779px;
      top: 60px;
      background-image: radial-gradient(
        at 20px 30px,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0) 20px,
        #cb575d 20px
      );
    }
  }

  /* Taille petite */
  @media (max-width: 820px) {
    .grid-container {
      top: 150px;
      grid-template-columns: 1fr;
    }

    .banner {
      width: 355px;
    }

    .body-content {
      padding-top: 180px;
      left: 50%;
    }

    .rectangle-2 {
      margin: 0;
      padding: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 355px;
    }

    .rectangle-3 {
      top: 85px;
      width: 300px;
      left: 50%;
      transform: translateX(-50%);
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .rectangle-3-patch-1 {
      position: absolute;
      left: 10.5px;
      top: 100px;
      background-image: radial-gradient(
        at 0px 30px,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0) 20px,
        #cb575d 20px
      );
    }

    .rectangle-3-patch-2 {
      position: absolute;
      border-radius: 0;
      left: 326px;
      top: 100px;
      background-image: radial-gradient(
        at 20px 30px,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0) 20px,
        #cb575d 20px
      );
      z-index: 0;
    }

    .rectangle-2-patch-1,
    .rectangle-2-patch-2 {
      display: none;
    }

    .loader-bottom {
      left: 85%;
    }
  }
</style>
