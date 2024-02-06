<script>
    import { onMount } from "svelte";
    import { FastAverageColor } from "fast-average-color";

    export let pokemon;

    let backgroundColor = "#98d6cb"; // Couleur de fond par défaut d'une image

    let selected = false; // État de sélection de la carte

    let imageElement;

    function toggleSelection() {
        selected = !selected; // Bascule l'état de sélection
    }

    function handleKeydown(event) {
        // Active la sélection avec la touche Enter ou Espace
        if (event.key === "Enter" || event.key === " ") {
            toggleSelection();
            event.preventDefault(); // Empêche le défilement pour la touche Espace
        }
    }

    onMount(() => {
        if (imageElement) {
            // Sert à remplir le fond de la couleur moyenne de l'image
            imageElement.onload = () => {
                const fac = new FastAverageColor();
                fac.getColorAsync(imageElement, {algorithm: 'simple'})
                    .then((color) => {
                        backgroundColor = color.rgba;
                    })
                    .catch((e) => {
                        console.error(
                            "Erreur lors du calcul de la couleur moyenne:",
                            e,
                        );
                    });
            };
        }
    });
</script>

<div
    class="pokemon-card"
    on:click={toggleSelection}
    on:keydown={handleKeydown}
    tabindex="0"
    role="button"
    aria-pressed={selected}
    class:selected
>
    <div
        class="pokemon-image-container"
        style="background-color: {backgroundColor};"
    >
    <img crossOrigin="anonymous" bind:this={imageElement} src={pokemon.image} alt={pokemon.name} class="pokemon-image" />

    </div>
    <div class="pokemon-info">
        <h2 class="pokemon-name">{pokemon.name}</h2>
        <p class="pokemon-description">{pokemon.description}</p>
        <hr class="pokemon-card-hr" />
        <div class="pokemon-stats">
            <div>
                <div class="pokemon-stat margin-stats">
                    Taille : <span class="grey-text">{pokemon.size}</span>
                </div>
                <div class="pokemon-stat">
                    Poids : <span class="grey-text">{pokemon.weight}</span>
                </div>
            </div>
            <div>
                <div class="pokemon-stat margin-stats">
                    Catégorie : <span class="grey-text">{pokemon.category}</span
                    >
                </div>
                <div class="pokemon-stat">
                    Talent : <span class="grey-text">{pokemon.talent}</span>
                </div>
            </div>
        </div>
        <hr class="pokemon-card-hr" />
        <div class="pokemon-types-container">
            <div
                class="pokemon-type"
                style="background-color: {pokemon.type.color};"
            >
                <img
                    src={pokemon.type.icon}
                    alt={pokemon.type.label}
                    class="pokemon-type-icon"
                />
                <span class="pokemon-type-label">{pokemon.type.label}</span>
            </div>
        </div>
    </div>
</div>

<style>

    .pokemon-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px;
        width: 315px;
        height: 465px;
        background: #ffffff;
        border: 1px solid rgba(25, 204, 32, 0.2);
        box-shadow: 4px 8px 25px rgba(52, 7, 11, 0.3);
        border-radius: 40px;
        margin: 15px; /* Ajouté pour éviter le chevauchement des cartes */
        transition: transform 0.2s ease, z-index 0s;
        cursor: pointer;
        z-index: 1; /* Valeur de base pour s'assurer que les cartes ont un z-index explicite */
    }

    .pokemon-card:hover {
        transform: scale(1.3); /* Agrandit la carte lors du survol */
        z-index: 10;
    }

    .pokemon-card.selected {
        box-shadow:
            0 0 0 6px rgb(195, 0, 255),
            4px 8px 25px rgba(52, 7, 11, 0.3); /* Simule une bordure externe */
    }

    .pokemon-image-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        /*padding: 10px 56px 10px 41px;*/
        gap: 10px;
        width: 255px;
        height: 138px;
        background: #98d6cb;
        border-radius: 20px;
    }

    .pokemon-image {
        width: 118px;
        height: 118px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    }
    
    .pokemon-card-hr {
        height: 1px;
        width: 100%;
        margin: 0px;
        border-width: 0;
        background-color: #efefef;
    }

    .grey-text {
        color: #616161;
    }

    .margin-stats {
        margin-bottom: 15px;
    }

    .pokemon-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        width: 100%; /* Utilisez la largeur complète de la carte */
        margin-top: 15px;
    }

    .pokemon-name {
        font-family: "Rowdies", sans-serif;
        font-weight: 300;
        font-size: 22px;
        line-height: 27px;
        color: #000000;
        text-align: left;
        margin: 0;
    }

    .pokemon-description {
        font-family: "Signika", sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: #616161;
        text-align: left;
        margin: 0;
    }

    .pokemon-stats {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0px;
        gap: 35px;
        width: 100%;
    }

    .pokemon-stat {
        font-family: "Signika", sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        text-align: left;
        color: #000000;
    }

    .pokemon-types-container {
        display: flex;
        flex-direction: column;
        justify-content: left;
        align-items: left;
        /*padding: 10px 56px 10px 41px;*/
        width: 255px;
    }

    .pokemon-type {
        display: flex;
        align-items: center;
        padding: 5px 20px 5px 25px;
        gap: 10px;
        width: 50%; /* Ajusté pour remplir la moitié en horizontal du conteneur */
        background: #19cc20;
        border-radius: 40px;
        font-family: "Signika", sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: rgba(0, 0, 0, 0.7);
        box-sizing: border-box; /* Assure que le padding et la bordure sont inclus dans la largeur */
    }

    .pokemon-type-icon {
        width: 18px;
        height: 18px;
    }
</style>
