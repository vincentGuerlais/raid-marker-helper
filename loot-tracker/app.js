let currentPage = "tracking";
let trackingMode = "content";

let characters = [];
let contents = [];
let allLoot = [];


async function loadData() {

    try {

        const charactersResponse =
            await fetch("data/characters.json");

        const charactersData =
            await charactersResponse.json();


        const contentsResponse =
            await fetch("data/contents.json");

        const contentsData =
            await contentsResponse.json();


        characters = charactersData.characters;
        contents = contentsData.contents;


        allLoot = getAllLoot();


        displayTracking();


    } catch(error) {

        console.error(
            "Erreur chargement données:",
            error
        );

    }

}



function displayCharacters() {

    const container = document.getElementById("characters");

    container.innerHTML = "<h2>Personnages suivis</h2>";


    characters.forEach(character => {


        const div = document.createElement("div");


        div.className = "character";


        div.innerHTML = `

            <label>

                <input
                    type="checkbox"
                    ${character.active ? "checked" : ""}
                    data-id="${character.id}"
                >

                ${character.name}
                -
                ${character.class}

            </label>

        `;


        container.appendChild(div);


    });


    document
    .querySelectorAll("#characters input")
    .forEach(input => {


        input.addEventListener(
            "change",
            event => {


                const character =
                    characters.find(
                        c => c.id === event.target.dataset.id
                    );


                character.active =
                    event.target.checked;


                if (
                    currentPage === "tracking" &&
                    trackingMode === "content"
                ) {
                
                    displayContent();
                
                }

            }
        );


    });

}



function displayContent() {

    const container = document.getElementById("contents");

    container.innerHTML = `

        <h2>Contenu</h2>

        <select id="contentSelect"></select>

    `;


    const select = document.getElementById("contentSelect");


    contents.forEach((content, index) => {

        const option = document.createElement("option");

        option.value = index;

        option.textContent = content.name;

        select.appendChild(option);

    });


    select.addEventListener(
        "change",
        () => displayLoot(select.value)
    );


    displayLoot(0);

}



function displayLoot(index) {

    console.log("displayLoot index:", index);
    console.log("content:", contents[index]);
    
    const content = contents[index];

    if (!content) {

        console.error(
            "No content found for index",
            index
        );

        return;

    }
    
    const container = document.getElementById("loot");


    let html = "<h2>Loot</h2>";


    let items = [];


    if (content.type === "dungeon") {

        items = content.loot;

    }


    if (content.type === "raid") {

        content.bosses.forEach(boss => {

            html += `<h3>${boss.name}</h3>`;

            items.push(...boss.loot);

        });

    }



    const activeClasses =
        characters
        .filter(c => c.active)
        .map(c => c.class);



    items.forEach(item => {


        const interested =
            item.classes.some(
                c => activeClasses.includes(c)
            );


        if (!interested) {
            return;
        }


        html += `

            <div class="item">

                <strong>${item.name}</strong>

                <div>

        `;


        characters
        .filter(character =>
            character.active &&
            item.classes.includes(character.class)
        )
        .forEach(character => {


            html += `

                <div>
                    ${character.name} :
                    ❌
                </div>

            `;

        });


        html += `

                </div>

            </div>

        `;


    });


    container.innerHTML = html;

}

function displayPlayer() {

    const container =
        document.getElementById("loot");


    let html = `

        <h2>Joueur</h2>

        <select id="playerSelect"></select>

        <div id="playerLoot"></div>

    `;


    container.innerHTML = html;


    const select =
        document.getElementById("playerSelect");


    characters
    .filter(character => character.active)
    .forEach((character, index) => {


        const option =
            document.createElement("option");


        option.value = character.id;

        option.textContent =
            `${character.name} - ${character.class}`;


        select.appendChild(option);


    });



    select.addEventListener(
        "change",
        () => {

            displayPlayerLoot(
                select.value
            );

        }
    );


    // Affichage initial

    if (select.options.length > 0) {

        displayPlayerLoot(
            select.value
        );

    }

}

function displayPlayerLoot(characterId) {

    const container =
        document.getElementById("playerLoot");


    const character =
        characters.find(
            c => c.id === characterId
        );


    if (!character) {
        return;
    }


    const items = allLoot;

    console.log("Character:", character);
    console.log("Items:", items);

    let html = `

        <div class="item">

            <h3>
                ${character.name}
                - ${character.class}
            </h3>

    `;


    const possible =
        items.filter(item =>
            item.classes.includes(character.class)
        );

    console.log(
        "Possible loot for",
        character.class,
        possible
    );

    if (possible.length === 0) {

        html += `
            Aucun objet trouvé
        `;

    }



    possible.forEach(item => {


        html += `

            <div>

                ❌ ${item.name}

                <br>

                <small>
                    📍 ${item.source}

                    ${
                        item.boss
                        ? " - " + item.boss
                        : ""
                    }

                </small>

            </div>

            <br>

        `;


    });



    html += "</div>";


    container.innerHTML = html;

}

function displayTracking() {

    document
    .getElementById("trackingMode")
    .style.display = "flex";


    if (trackingMode === "content") {

        displayContent();

    }


    if (trackingMode === "player") {

        displayPlayer();

    }

}

function displayStats() {

    document
    .getElementById("trackingMode")
    .style.display = "none";


    document
    .getElementById("loot")
    .innerHTML = `

        <h2>Stats</h2>

        <p>
            Statistiques bientôt disponibles
        </p>

    `;

}

function getAllLoot() {

    const items = [];


    contents.forEach(content => {


        // Donjons : loot directement attaché au contenu

        if (content.type === "dungeon") {


            content.loot.forEach(item => {


                items.push({

                    ...item,

                    source: content.name,

                    boss: null

                });


            });


        }



        // Raids : loot attaché aux boss

        if (content.type === "raid") {


            content.bosses.forEach(boss => {


                boss.loot.forEach(item => {


                    items.push({

                        ...item,

                        source: content.name,

                        boss: boss.name

                    });


                });


            });


        }


    });


    return items;

}

document
.getElementById("trackingPage")
.addEventListener(
    "click",
    () => {

        currentPage = "tracking";

        displayTracking();

    }
);



document
.getElementById("statsPage")
.addEventListener(
    "click",
    () => {

        currentPage = "stats";

        displayStats();

    }
);



document
.getElementById("contentMode")
.addEventListener(
    "click",
    () => {

        trackingMode = "content";

        displayTracking();

    }
);



document
.getElementById("playerMode")
.addEventListener(
    "click",
    () => {

        trackingMode = "player";

        displayTracking();

    }
);

loadData();
