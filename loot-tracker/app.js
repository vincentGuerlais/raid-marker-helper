console.log("APP VERSION 2026-08-07");

let currentPage = "tracking";
let trackingMode = "content";

let characters = [];
let contents = [];
let allLoot = [];
let hiddenItems = {};

async function loadData() {

    try {

        console.log("Chargement characters.json");

        const charactersResponse =
            await fetch("data/characters.json");

        const charactersData =
            await charactersResponse.json();


        characters = charactersData.characters;


        console.log("Chargement contents.json");

        const contentsIndexResponse =
            await fetch("data/contents.json");

        const contentsIndex =
            await contentsIndexResponse.json();


        console.log(
            "Index contenu:",
            contentsIndex
        );


        contents = [];


        for (const entry of contentsIndex.contents) {

            console.log(
                "Chargement:",
                entry.file
            );


            const response =
                await fetch("data/" + entry.file);


            let content;

            try {

                content =
                    await response.json();

            }
            catch(error) {

                console.error(
                    "JSON invalide dans :",
                    entry.file
                );

                throw error;

            }


            contents.push(content);

        }


        allLoot = getAllLoot();


        const savedHidden =
            localStorage.getItem("hiddenItems");


        if (savedHidden) {

            hiddenItems = JSON.parse(savedHidden);

        }


        displayCharacters();

        displayTracking();


        console.log(
            "Loaded contents:",
            contents.map(c => c.name)
        );


    } catch(error) {

        console.error(
            "Erreur chargement données:",
            error
        );

    }

}

function saveHiddenItems() {

    Object.keys(hiddenItems)
    .forEach(id => {

        if (hiddenItems[id].length === 0) {

            delete hiddenItems[id];

        }

    });


    localStorage.setItem(
        "hiddenItems",
        JSON.stringify(hiddenItems)
    );

}

function isLootHidden(character, item) {

    return hiddenItems[character.id]?.includes(item.name);

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


                if (currentPage === "tracking") {
                
                    displayTracking();
                
                }
                
                if (currentPage === "stats") {
                
                    displayStats();
                
                }

            }
        );


    });

}



function displayContent() {

    const container =
        document.getElementById("contents");


    container.innerHTML = `

        <h2>Contenu</h2>

        <select id="contentTypeSelect">

            <option value="dungeon">
                Donjons
            </option>

            <option value="raid">
                Raids
            </option>

            <option value="other">
                Autres
            </option>

        </select>


        <select id="contentSelect"></select>

    `;


    const typeSelect =
        document.getElementById(
            "contentTypeSelect"
        );


    const contentSelect =
        document.getElementById(
            "contentSelect"
        );


    function updateContents() {


        contentSelect.innerHTML = "";


        const filtered =
            contents.filter(content =>
                content.type === typeSelect.value
            );


        filtered.forEach(content => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                contents.indexOf(content);


            option.textContent =
                content.name;


            contentSelect.appendChild(
                option
            );


        });


        if (filtered.length > 0) {

            displayLoot(
                contentSelect.value
            );

        }
        else {

            document
            .getElementById("loot")
            .innerHTML =
                "Aucun contenu disponible";

        }

    }


    typeSelect.addEventListener(
        "change",
        updateContents
    );


    contentSelect.addEventListener(
        "change",
        () =>
            displayLoot(
                contentSelect.value
            )
    );


    updateContents();

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

    const container =
        document.getElementById("loot");


    const activeClasses =
        characters
        .filter(c => c.active)
        .map(c => c.class);


    let html = "<h2>Loot</h2>";


    content.bosses.forEach(boss => {

        html += `<h3>${boss.name}</h3>`;


        boss.loot.forEach(item => {


            const interested =
                item.classes.some(
                    c => activeClasses.includes(c)
                );


            if (!interested) {
                return;
            }


            html += `

                <div class="item">

                    <strong>
                        ${item.name}
                    </strong>

                    <div class="slot">
                        🛡 ${item.slot}
                    </div>

                    ${
                        item.note
                            ? `<div class="note">
                                💡 ${item.note}
                               </div>`
                            : ""
                    }

                    <div>

            `;


            characters
            .filter(character =>
                character.active &&
                item.classes.includes(character.class) &&
                !isLootHidden(character, item)
            )
            .forEach(character => {

                html += `

                    <div>

                        <label>

                            <input
                                type="checkbox"
                                class="loot-check"
                                data-character="${character.id}"
                                data-item="${item.name}"
                            >

                            ${character.name}

                        </label>

                    </div>

                `;

            });


            html += `

                    </div>

                </div>

            `;

        });

    });


    container.innerHTML = html;


    document
    .querySelectorAll(".loot-check")
    .forEach(check => {

        check.addEventListener(
            "change",
            event => {

                const characterId =
                    event.currentTarget.dataset.character;


                const itemName =
                    event.currentTarget.dataset.item;


                if (!hiddenItems[characterId]) {

                    hiddenItems[characterId] = [];

                }


                hiddenItems[characterId].push(itemName);


                saveHiddenItems();


                displayLoot(index);

            }
        );

    });

}

function displayPlayer() {

    const container =
        document.getElementById("loot");


    let html = `

        <h2>Joueurs</h2>

    `;


    const activeCharacters =
        characters.filter(
            character => character.active
        );


    if (activeCharacters.length === 0) {

        html += `
            Aucun joueur sélectionné
        `;

    }


    activeCharacters.forEach(character => {

        html += displayPlayerLoot(character);

    });


    container.innerHTML = html;


    document
    .querySelectorAll(".loot-check")
    .forEach(check => {


        check.addEventListener(
            "change",
            event => {


                const characterId =
                    event.target.dataset.character;


                const itemName =
                    event.target.dataset.item;



                if (!hiddenItems[characterId]) {

                    hiddenItems[characterId] = [];

                }


                hiddenItems[characterId].push(itemName);


                saveHiddenItems();


                displayPlayer();


            }
        );


    });

    document
.querySelectorAll(".reset-player-loot")
.forEach(button => {


    button.addEventListener(
        "click",
        event => {


            const characterId =
                event.target.dataset.character;


            hiddenItems[characterId] = [];


            saveHiddenItems();


            displayPlayer();


        }
    );


});
    
}

function displayPlayerLoot(character) {


    let html = `

        <div class="player-card">

            <h3>
                ${character.name}
                - ${character.class}
            </h3>
            
        <button
            class="reset-player-loot"
            data-character="${character.id}"
        >
            ↺ Réinitialiser
        </button>
        
    `;


    const possible =
        allLoot.filter(item =>
            item.classes.includes(character.class)
        );


    if (possible.length === 0) {

        html += `
            Aucun objet trouvé
        `;

    }


    possible.forEach(item => {
    
    
        const hidden =
            hiddenItems[character.id]?.includes(item.name);
    
    
        if (hidden) {
    
            return;
    
        }

        html += `

            <div class="item">

                <label>

                <input
                    type="checkbox"
                    class="loot-check"
                    data-character="${character.id}"
                    data-item="${item.name}"
                >
                
                ${item.name}
                
                </label>
                <div class="slot">
                    🛡 ${item.slot}
                </div>
                <br>
                ${
                    item.note
                        ? `
                            <div class="note">
                                💡 ${item.note}
                            </div>
                        `
                        : ""
                }
                <small>

                    📍 ${item.source}

                    ${
                        item.boss
                        ? " - " + item.boss
                        : ""
                    }

                </small>

            </div>

        `;


    });


    html += `

        </div>

    `;


    return html;

}

function displayTracking() {

    document
    .getElementById("trackingMode")
    .style.display = "flex";


    document
    .getElementById("loot")
    .style.display = "block";


    const contentsContainer =
        document.getElementById("contents");


    if (trackingMode === "content") {

        contentsContainer.style.display = "block";

        displayContent();

    }


    if (trackingMode === "player") {

        contentsContainer.style.display = "none";

        displayPlayer();

    }

}

function displayStats() {

    document
        .getElementById("trackingMode")
        .style.display = "none";


    document
        .getElementById("contents")
        .style.display = "none";


    document
        .getElementById("loot")
        .style.display = "block";


    const container =
        document.getElementById("loot");


    const activeCharacters =
        characters.filter(
            character => character.active
        );


    const totals = {};


    activeCharacters.forEach(character => {

        totals[character.id] = 0;

    });


    let html = `

        <h2>📊 Statistiques</h2>

        <div class="stats-container">

            <table class="stats-table">

                <thead>

                    <tr>

                        <th>Contenu</th>

    `;


    activeCharacters.forEach(character => {

        html += `

                        <th>
                            ${character.name}
                        </th>

        `;

    });


    // Colonne total

    html += `

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    // =========================
    // DONJONS
    // =========================

    html += `

        <tr class="section">

            <td colspan="${activeCharacters.length + 2}">
                Donjons
            </td>

        </tr>

    `;


    contents
        .filter(content => content.type === "dungeon")
        .forEach(content => {

            let rowTotal = 0;


            html += `

                <tr>

                    <td>
                        ${content.name}
                    </td>

            `;


            activeCharacters.forEach(character => {

                const count =
                    getLootForContentAndCharacter(
                        content,
                        character
                    );


                totals[character.id] += count;

                rowTotal += count;


                html += `

                    <td>
                        ${count}
                    </td>

                `;

            });


            html += `

                    <td class="row-total">
                        ${rowTotal}
                    </td>

                </tr>

            `;

        });


    // =========================
    // RAIDS
    // =========================

    html += `

        <tr class="section">

            <td colspan="${activeCharacters.length + 2}">
                Raids
            </td>

        </tr>

    `;


    contents
        .filter(content => content.type === "raid")
        .forEach(raid => {

            html += `

                <tr class="raid-title">

                    <td colspan="${activeCharacters.length + 2}">
                        ${raid.name}
                    </td>

                </tr>

            `;


            raid.bosses.forEach(boss => {

                let rowTotal = 0;


                html += `

                    <tr>

                        <td>
                            ${boss.name}
                        </td>

                `;


                activeCharacters.forEach(character => {

                    const count =
                        boss.loot.filter(item =>
                            item.classes.includes(
                                character.class
                            )
                        ).length;


                    totals[character.id] += count;

                    rowTotal += count;


                    html += `

                        <td>
                            ${count}
                        </td>

                    `;

                });


                html += `

                        <td class="row-total">
                            ${rowTotal}
                        </td>

                    </tr>

                `;

            });

        });


    // =========================
    // TOTAL GENERAL
    // =========================

    let grandTotal = 0;

    Object.values(totals).forEach(total => {

        grandTotal += total;

    });


    html += `

        <tr class="total">

            <td>
                TOTAL
            </td>

    `;


    activeCharacters.forEach(character => {

        html += `

            <td>
                ${totals[character.id]}
            </td>

        `;

    });


    html += `

            <td class="row-total">
                ${grandTotal}
            </td>

        </tr>

    `;


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML = html;

}

function getAllLoot() {

    const items = [];

    contents.forEach(content => {

        content.bosses.forEach(boss => {

            boss.loot.forEach(item => {

                items.push({

                    ...item,

                    source: content.name,

                    boss: boss.name

                });

            });

        });

    });

    return items;

}

function getLootForContentAndCharacter(
    content,
    character
) {

    let items = [];


    content.bosses.forEach(boss => {

        items.push(
            ...boss.loot
        );

    });


    return items.filter(item =>
        item.classes.includes(character.class)
        &&
        !isLootHidden(character, item)
    ).length;

}function getLootForContentAndCharacter(
    content,
    character
) {

    return content.bosses
        .flatMap(boss => boss.loot)
        .filter(item =>
            item.classes.includes(character.class) &&
            !isLootHidden(character, item)
        )
        .length;

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
