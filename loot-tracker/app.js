console.log("APP VERSION 2026-08-07");

let currentPage = "tracking";
let trackingMode = "content";

let currentContentType = "dungeon";
let currentContentIndex = null;

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

    const container =
        document.getElementById("characters");


    const activeCharacters =
        characters.filter(
            character => character.active
        );


    const activeNames =
        activeCharacters
        .map(character => character.name)
        .join(", ");


    container.innerHTML = `

        <div class="characters-selector">

            <div
                class="characters-selector-header"
                id="charactersSelectorToggle"
            >

                <strong>
                    👥 Joueurs suivis
                </strong>

                ${
                    activeNames
                    ? `
                        <span class="characters-selected">
                            ${activeNames}
                        </span>
                    `
                    : ""
                }

                <span
                    class="characters-selector-arrow"
                    id="charactersSelectorArrow"
                >
                    ▼
                </span>

            </div>


            <div
                class="characters-selector-content hidden"
                id="charactersSelectorContent"
            >

                ${characters.map(character => `

                    <div class="character">

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

                    </div>

                `).join("")}

            </div>

        </div>

    `;


    // =========================
    // Ouvrir / fermer
    // =========================

    const toggle =
        document.getElementById(
            "charactersSelectorToggle"
        );


    const content =
        document.getElementById(
            "charactersSelectorContent"
        );


    const arrow =
        document.getElementById(
            "charactersSelectorArrow"
        );


    toggle.addEventListener(
        "click",
        () => {

            const hidden =
                content.classList.toggle(
                    "hidden"
                );


            arrow.textContent =
                hidden
                ? "▼"
                : "▲";

        }
    );


    // =========================
    // Sélection des personnages
    // =========================

    document
    .querySelectorAll(
        "#characters input"
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            event => {

                const character =
                    characters.find(
                        c =>
                            c.id ===
                            event.target.dataset.id
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


    // -------------------------
    // Restaure le type courant
    // -------------------------

    typeSelect.value =
        currentContentType;


    function updateContents() {

        currentContentType =
            typeSelect.value;


        contentSelect.innerHTML = "";


        const filtered =
            contents.filter(content =>
                content.type ===
                currentContentType
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

            // -------------------------
            // Restaure le contenu
            // précédemment sélectionné
            // -------------------------

            const previousContent =
                filtered.some(
                    content =>
                        contents.indexOf(content) ===
                        currentContentIndex
                );


            if (previousContent) {

                contentSelect.value =
                    currentContentIndex;

            }
            else {

                currentContentIndex =
                    Number(
                        contentSelect.value
                    );

            }


            displayLoot(
                currentContentIndex
            );

        }
        else {

            currentContentIndex = null;


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
        () => {

            currentContentIndex =
                Number(
                    contentSelect.value
                );


            displayLoot(
                currentContentIndex
            );

        }
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

        <hr></hr>

    `;

html += `

    <div
        class="upgrade-legend"
        id="upgradeLegend"
    >

        <div
            class="upgrade-legend-header"
            id="upgradeLegendToggle"
        >

            <strong>
                ⭐ Améliorations
            </strong>

            <span id="upgradeLegendArrow">
                ▲
            </span>

        </div>


        <div
            class="upgrade-legend-content"
        >

            <span class="legend-item upgrade-catalyst">
                🟨 Catalyseur
            </span>

            <span class="legend-item upgrade-enchant">
                🟪 Enchantement
            </span>

            <span class="legend-item upgrade-gem">
                🟩 Gemme
            </span>

        </div>

    </div>
    
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

const upgradeLegendToggle =
    document.getElementById(
        "upgradeLegendToggle"
    );

const upgradeLegendArrow =
    document.getElementById(
        "upgradeLegendArrow"
    );


if (upgradeLegendToggle) {

    upgradeLegendToggle.addEventListener(
        "click",
        () => {

            const upgrades =
                document.querySelectorAll(
                    ".upgrades"
                );


            const currentlyVisible =
                upgrades.length > 0 &&
                !upgrades[0]
                    .classList
                    .contains("hidden");


            upgrades.forEach(
                upgrade => {

                    upgrade.classList.toggle(
                        "hidden",
                        currentlyVisible
                    );

                }
            );


            upgradeLegendArrow.textContent =
                currentlyVisible
                ? "▼"
                : "▲";

        }
    );

}

    // =========================
    // CHECKBOX LOOT
    // =========================

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


                // =========================
                // OBTENU
                // =========================

                if (event.target.checked) {

                    if (
                        !hiddenItems[characterId]
                        .includes(itemName)
                    ) {

                        hiddenItems[characterId].push(
                            itemName
                        );

                    }

                }


                // =========================
                // À OBTENIR
                // =========================

                else {

                    hiddenItems[characterId] =
                        hiddenItems[characterId].filter(
                            name =>
                                name !== itemName
                        );

                }


                saveHiddenItems();

                displayPlayer();

            }
        );

    });


    // =========================
    // RESET JOUEUR
    // =========================

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


    // =========================
    // Objets correspondant à la classe
    // =========================

    const possible =
        allLoot.filter(item =>
            item.classes.includes(character.class)
        );


    if (possible.length === 0) {

        html += `

            <div class="empty-loot">
                Aucun objet trouvé
            </div>

        `;

    }


    const hidden =
        hiddenItems[character.id] || [];


    const toGet =
        possible.filter(
            item => !hidden.includes(item.name)
        );


    const obtained =
        possible.filter(
            item => hidden.includes(item.name)
        );


    // =========================
    // Fonction d'affichage d'un objet
    // =========================

function renderItem(item) {

    // -------------------------
    // Upgrades applicables
    // -------------------------

    const applicableUpgrades =
        (item.upgrade || []).filter(
            upgrade =>
                !upgrade.class ||
                upgrade.class === character.class
        );


    // -------------------------
    // Objet
    // -------------------------

    let itemHtml = `

        <div class="item">

            <label>

                <input
                    type="checkbox"
                    class="loot-check"
                    data-character="${character.id}"
                    data-item="${item.name}"
                >

                <strong>
                    ${item.name}
                </strong>

            </label>


            <div class="item-details">

                <div class="slot">
                    🛡 ${item.slot}
                </div>


                ${
                    item.note
                    ? `
                        <div class="note">
                            💡 ${item.note}
                        </div>
                      `
                    : ""
                }


                ${
                    applicableUpgrades.length > 0
                    ? `
                        <div class="upgrades">

                            ${applicableUpgrades.map(
                                upgrade => `

                                    <div
                                        class="upgrade upgrade-${upgrade.type}"
                                    >

                                        ⭐ ${upgrade.text}

                                    </div>

                                `
                            ).join("")}

                        </div>
                      `
                    : ""
                }


                <small class="item-source">

                    📍 ${item.source}

                    ${
                        item.boss &&
                        item.boss !== item.source
                        ? " - " + item.boss
                        : ""
                    }

                </small>

            </div>

        </div>

    `;


    return itemHtml;

}


    // =========================
    // À OBTENIR
    // =========================

    html += `

        <div class="player-loot-section">

            <h4>
                À obtenir
            </h4>

    `;


    if (toGet.length === 0) {

        html += `

            <div class="empty-loot">
                Aucun objet restant
            </div>

        `;

    }


    toGet.forEach(item => {

        html += renderItem(item);

    });


    html += `

        </div>

    `;


    // =========================
    // OBTENU
    // =========================

    html += `

        <div class="player-loot-section obtained">

            <h4>
                Obtenu
            </h4>

    `;


    if (obtained.length === 0) {

        html += `

            <div class="empty-loot">
                Aucun objet obtenu
            </div>

        `;

    }


    obtained.forEach(item => {

        html += renderItem(item);

    });


    html += `

        </div>

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


    // Total général par joueur
    const totals = {};

    activeCharacters.forEach(character => {

        totals[character.id] = 0;

    });


    // Total général tous joueurs
    let grandTotal = 0;


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


    // Colonne Total

    html += `

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    // ==================================================
    // DONJONS
    // ==================================================

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

            let contentTotal = 0;


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

                contentTotal += count;


                html += `

                    <td>
                        ${count}
                    </td>

                `;

            });


            grandTotal += contentTotal;


            html += `

                    <td>
                        ${contentTotal}
                    </td>

                </tr>

            `;

        });


    // ==================================================
    // RAIDS
    // ==================================================

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

                let bossTotal = 0;


                html += `

                    <tr>

                        <td>
                            ${boss.name}
                        </td>

                `;


                activeCharacters.forEach(character => {

                    const count =
                        boss.loot.filter(item =>
                            item.classes.includes(character.class) &&
                            !isLootHidden(character, item)
                        ).length;


                    totals[character.id] += count;

                    bossTotal += count;


                    html += `

                        <td>
                            ${count}
                        </td>

                    `;

                });


                grandTotal += bossTotal;


                html += `

                        <td>
                            ${bossTotal}
                        </td>

                    </tr>

                `;

            });

        });


    // ==================================================
    // AUTRES
    // ==================================================

    html += `

        <tr class="section">

            <td colspan="${activeCharacters.length + 2}">
                Autres
            </td>

        </tr>

    `;


    contents
        .filter(content => content.type === "other")
        .forEach(content => {

            html += `

                <tr class="raid-title">

                    <td colspan="${activeCharacters.length + 2}">
                        ${content.name}
                    </td>

                </tr>

            `;


            content.bosses.forEach(boss => {

                let bossTotal = 0;


                html += `

                    <tr>

                        <td>
                            ${boss.name}
                        </td>

                `;


                activeCharacters.forEach(character => {

                    const count =
                        boss.loot.filter(item =>
                            item.classes.includes(character.class) &&
                            !isLootHidden(character, item)
                        ).length;


                    totals[character.id] += count;

                    bossTotal += count;


                    html += `

                        <td>
                            ${count}
                        </td>

                    `;

                });


                grandTotal += bossTotal;


                html += `

                        <td>
                            ${bossTotal}
                        </td>

                    </tr>

                `;

            });

        });


    // ==================================================
    // TOTAL FINAL
    // ==================================================

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

            <td>
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
