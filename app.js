const pokedex = document.getElementById('pokedex');
let offset = 0;
const limit = 20; // Number of Pokemon to load each time

const fetchPokemon = async (offset, limit) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const pokemon = data.results.map((result, index) => ({
            name: result.name,
            apiUrl: result.url,
            id: offset + index + 1,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${offset + index + 1}.png`
        }));
        displayPokemon(pokemon);
    } catch (error) {
        console.error('Failed to fetch Pokemon:', error);
    }
};

const displayPokemon = (pokemon) => {
    const pokemonList = pokemon.map(pokeman => {
        const listItem = document.createElement('li');
        listItem.classList.add('card');
        listItem.setAttribute('data-id', pokeman.id);
        if (isCaught(pokeman.id)) {
            listItem.classList.add('caught');
        }
        listItem.addEventListener('click', () => selectPokemon(pokeman.id));
        listItem.innerHTML = `
            <img class="card-image" src="${pokeman.image}"/>
            ${isCaught(pokeman.id) ? '<div class="caught-overlay">CAUGHT</div>' : ''}
            <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
        `;
        return listItem;
    });
    pokemonList.forEach(item => pokedex.appendChild(item));
};

const isCaught = (id) => {
    return localStorage.getItem(`caught-${id}`) === 'true';
};

const selectPokemon = async (id) => {
    if (document.querySelector('.popup')) {
        return; // If a popup exists, don't create a new one
    }
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    try {
        const res = await fetch(url);
        const pokeman = await res.json();
        displayPopup(pokeman);
    } catch (error) {
        console.error('Failed to fetch Pokemon details:', error);
    }
};

const displayPopup = (pokeman) => {
    const type = pokeman.types.map((type) => type.type.name).join(', ');
    const isCaughtPokemon = isCaught(pokeman.id);
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <button id="closeBtn">Close</button>
        <div class="card">
            <img class="card-image" src="${pokeman.sprites.front_default}"/>
            <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
            <p><small>Height: </small>${pokeman.height} | <small>Type: </small>${type}</p>
            <button class="catch-release-btn">${isCaughtPokemon ? 'Release' : 'Catch'}</button>
        </div>
    `;
    const closeButton = popup.querySelector('#closeBtn');
    closeButton.addEventListener('click', closePopup);
    const catchReleaseButton = popup.querySelector('.catch-release-btn');
    catchReleaseButton.addEventListener('click', () => handleCatchRelease(pokeman.id));
    pokedex.insertBefore(popup, pokedex.firstChild);
};

const handleCatchRelease = async (id) => {
    const wasCaught = isCaught(id);
    if (wasCaught) {
        releasePokemon(id);
    } else {
        await catchPokemon(id);
    }
    updateCardStatus(id, !wasCaught);
    updatePopupButton(id, !wasCaught);
};

const catchPokemon = (id) => {
    localStorage.setItem(`caught-${id}`, 'true');
    updateCardStatus(id, true);
};

const releasePokemon = (id) => {
    localStorage.removeItem(`caught-${id}`);
    updateCardStatus(id, false);
};

const updateCardStatus = (id, caught) => {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
        if (caught) {
            card.classList.add('caught');
            if (!card.querySelector('.caught-overlay')) {
                const caughtOverlay = document.createElement('div');
                caughtOverlay.className = 'caught-overlay';
                caughtOverlay.textContent = 'CAUGHT';
                card.appendChild(caughtOverlay);
            }
        } else {
            card.classList.remove('caught');
            const caughtOverlay = card.querySelector('.caught-overlay');
            if (caughtOverlay) {
                caughtOverlay.remove();
            }
        }
    }
};

const updatePopupButton = (id, caught) => {
    const popup = document.querySelector('.popup');
    if (popup) {
        const catchButton = popup.querySelector('.catch-release-btn');
        if (catchButton) {
            catchButton.textContent = caught ? 'Release' : 'Catch';
            catchButton.className = 'catch-release-btn'; // Reset class to default
            if (caught) {
                catchButton.classList.add('release-button');
            } else {
                catchButton.classList.add('catch-button');
            }
        }
    }
};


const closePopup = () => {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
};

const loadMorePokemon = () => {
    offset += limit;
    fetchPokemon(offset, limit);
};

// Initial call to load the first set of Pokemon
fetchPokemon(offset, limit);
