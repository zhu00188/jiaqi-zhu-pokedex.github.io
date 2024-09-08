document.addEventListener("DOMContentLoaded", async function(e) {
    e.preventDefault(); // Prevent default action

    const pokemonGallery = document.getElementById("pokemon-gallery");
    let caughtPokemon = [];

    // Function to fetch and display Pokémon
    async function fetchAndDisplayPokemon(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const pokemonList = data.results;

            // Fetch and display Pokémon data sequentially by ID
            for (const pokemon of pokemonList) {
                const pokemonData = await fetchPokemonData(pokemon.url);
                if (pokemonData) {
                    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonData.id}.svg`;
                    const pokemonId = pokemonData.id;
                    const isCaught = caughtPokemon.includes(pokemonId);

                    const cardHtml = `
                        <div class="col mb-4" id="pokemon-${pokemonId}">
                            <div class="card shadow bg-white rounded ${isCaught ? 'caught-pokemon' : ''}" id="poke${pokemonId}">
                                <div class="square-container">
                                    <img class="card-img-top" src="${imageUrl}" alt="image of pokemon id: ${pokemonId}">
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title text-center h3">${pokemonData.name.toUpperCase()}</h5>
                                </div>
                            </div>
                        </div>
                    `;
                    pokemonGallery.insertAdjacentHTML('beforeend', cardHtml);

                    // Add click event listener to each Pokémon card
                    const pokemonCard = document.getElementById(`poke${pokemonId}`);

                    pokemonCard.addEventListener("click", async function(e) {
                        e.preventDefault(); // Prevent default action

                        const modal = createModal(pokemonData, pokemonId);
                        document.body.append(modal);
                        const cardPopupModal = new bootstrap.Modal(modal);
                        cardPopupModal.show();
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
        }
    }

    // Load caught Pokémon from local storage
    function loadCaughtPokemon() {
        const caughtPokemonJSON = localStorage.getItem('caughtPokemon');
        if (caughtPokemonJSON) {
            caughtPokemon = JSON.parse(caughtPokemonJSON);
            // Add 'caught-pokemon' class to the corresponding Pokemon cards
            caughtPokemon.forEach(pokemonId => {
                const pokemonCard = document.getElementById(`poke${pokemonId}`);
                if (pokemonCard) {
                    pokemonCard.classList.add('caught-pokemon');
                }
            });
        }
    }

    // Save caught Pokémon to local storage
    function saveCaughtPokemon() {
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    }

    // Mark Pokémon as caught
    function markPokemonAsCaught(pokemonId) {
        if (!caughtPokemon.includes(pokemonId)) {
            caughtPokemon.push(pokemonId);
            saveCaughtPokemon();

            // Add 'caught-pokemon' class to the Pokemon card
            const pokemonCard = document.getElementById(`poke${pokemonId}`);
            if (pokemonCard) {
                pokemonCard.classList.add('caught-pokemon');
            }
        }
    }
    
    // Mark Pokémon as released
    function markPokemonAsReleased(pokemonId) {
        const index = caughtPokemon.indexOf(pokemonId);
        if (index !== -1) {
            caughtPokemon.splice(index, 1);
            saveCaughtPokemon();
            
            // Remove 'caught-pokemon' class from the Pokemon card
            const pokemonCard = document.getElementById(`poke${pokemonId}`);
            if (pokemonCard) {
                pokemonCard.classList.remove('caught-pokemon');
            }
        }
    }


    // Create modal content
    function createModal(pokemonData, pokemonId) {
        const modalContent = `
            <div class="modal-content bg-light p-3">
                <div class="modal-header">
                    <h2 class="modal-title" id="cardPopupLabel">${pokemonData.name.toUpperCase()}</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-0">
                        <div class="col-md-7">
                            <img class="img-fluid rounded-start mx-auto" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png" alt="image of pokemon id: ${pokemonId}">
                        </div>
                        <div class="col-md-5 p-5">
                            <div class="card-body">
                                <h5 class="card-text">TYPES:</h5>
                                <p class="card-text text-muted">${pokemonData.types.map(type => type.type.name).join(', ')}</p>
                                <h5 class="card-text">ABILITIES:</h5>
                                <p class="card-text text-muted">${pokemonData.abilities.map(ability => ability.ability.name).join(', ')}</p>
                                <h5 class="card-text">HEIGHT:</h5>
                                <p class="card-text text-muted">${pokemonData.height}</p>
                                <h5 class="card-text">WEIGHT:</h5>
                                <p class="card-text text-muted">${pokemonData.weight}</p><br>
                                <button type="button" class="btn btn-success catch-btn w-100 ${caughtPokemon.includes(pokemonId) ? 'd-none' : ''}">CATCH</button>
                                <button type="button" class="btn btn-danger release-btn w-100 ${!caughtPokemon.includes(pokemonId) ? 'd-none' : ''}">RELEASE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create modal dialog
        const modalDialog = document.createElement('div');
        modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
        modalDialog.innerHTML = modalContent;

        // Create modal
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'cardPopup';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'cardPopupLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.append(modalDialog);

        // Add event listener to catch button
        modal.querySelector('.catch-btn').addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default action
            markPokemonAsCaught(pokemonId);
            const cardPopupModal = bootstrap.Modal.getInstance(modal);
            cardPopupModal.hide();
        });
        
        // Add event listener to release button
        modal.querySelector('.release-btn').addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default action
            markPokemonAsReleased(pokemonId);
            const cardPopupModal = bootstrap.Modal.getInstance(modal);
            cardPopupModal.hide();
        });


        return modal;
    }

    // Initial fetch and display of Pokémon (IDs 1-20)
    await fetchAndDisplayPokemon("https://pokeapi.co/api/v2/pokemon?limit=20");

    // Load More button functionality
    const loadMoreButtonContainer = document.createElement('div');
    loadMoreButtonContainer.classList.add('text-center'); // Center the button horizontally
    const loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Load More';
    loadMoreButton.classList.add('btn', 'btn-primary', 'mt-3');
    loadMoreButtonContainer.appendChild(loadMoreButton);
    pokemonGallery.after(loadMoreButtonContainer);

    let offset = 20; // Initial offset for pagination

    loadMoreButton.addEventListener('click', async function(e) {
        e.preventDefault(); // Prevent default action
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`;
        await fetchAndDisplayPokemon(url);
        offset += 20; // Increment offset for next pagination
    });

    // Load caught Pokémon from local storage
    loadCaughtPokemon();
});


// Fetch Pokémon data
async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        return null;
    }
}

// parseURL
// Will return the Pokemon's id from the provided url
function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 1).lastIndexOf('/') + 1, url.length - 1)
}
