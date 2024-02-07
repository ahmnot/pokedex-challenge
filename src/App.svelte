<script>
  import { onMount } from "svelte";
  import { blur, fade, fly, slide } from "svelte/transition";
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
  let loading = false;
  let dataLoaded = false;
  let isHovered = false;

  const typeToColorMap = {
    Plante: "#19CC20", // Vert
    Feu: "#EE942A", // Rouge orangé
    Eau: "#A5E0E0", // Bleu
    Insecte: "#CAE03F", // Vert olive
  };

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

    const pokemonDataFormatted = {
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

    pokemonsData.pokemons.push(pokemonDataFormatted);

    return {
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
  }

  onMount(async () => {
    loading = true;
    try {
      const pokemonPromises = Array.from({ length: 12 }, (_, index) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${index + 1}`).then((res) =>
          res.json(),
        ),
      );
      const pokemons = await Promise.all(pokemonPromises);
      const detailedPokemonPromises = pokemons.map((pokemon) =>
        fetchPokemonDetails(pokemon),
      );
      pokemonCards = await Promise.all(detailedPokemonPromises);
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
        on:click={sendToHubSpot}
        on:mouseover={() => (isHovered = true)}
        on:mouseout={() => (isHovered = false)}
        on:focus={() => (isHovered = true)}
        on:blur={() => (isHovered = false)}
        
      >
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
