<script>
  import PokemonCard from './lib/PokemonCard.svelte';

  // Exemple d'objet Pokémon
  const pokemon = {
    name: "Bulbizarre",
    image: "./pokemon-images/1-bulbizarre.png", 
    description:
      "Il y a une graine sur son dos depuis sa naissance. Elle grossit un peu chaque jour.",
    size: "0,7 m",
    category: "Graine",
    weight: "6,9 kg",
    talent: "Engrais",
    type: {
      label: "Plante",
      color: "#19CC20",
      icon: "./pokemon-icons/plante-icon.png",
    },
  };
</script>

<main>
  <PokemonCard {pokemon} />
</main>

<style>

</style>
