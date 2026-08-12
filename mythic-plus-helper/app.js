console.log("MYTHIC+ HELPER");

let contents = [];
let currentDungeon = null;
let currentPage = 0;



async function loadData() {

    try {

        const response =
            await fetch("data/contents.json");
        
        const contentsIndex =
            await response.json();
        
        contents = [];
        
        for (const entry of contentsIndex.contents) {
        
            const response =
                await fetch("data/" + entry.file);
        
            const content =
                await response.json();
        
            contents.push(content);
        }


        console.log(
            "Loaded dungeons:",
            contents.map(
                content => content.name
            )
        );


        displayDungeonSelector();


    } catch(error) {

        console.error(
            "Erreur chargement données:",
            error
        );

    }

}



function displayDungeonSelector() {

    const select =
        document.getElementById(
            "dungeonSelect"
        );


    select.innerHTML = "";


    contents.forEach(
        (content, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value = index;

            option.textContent =
                content.name;


            select.appendChild(option);

        }
    );


    select.addEventListener(
        "change",
        () => {

            displayDungeon(
                select.value
            );

        }
    );


    if (contents.length > 0) {

        displayDungeon(0);

    }

}



function displayDungeon(index) {

    currentDungeon =
        contents[index];


    if (!currentDungeon) {

        return;

    }


    currentPage = 0;


    displayCurrentPage();

}



function getDungeonPages() {

    if (!currentDungeon) {
        return [];
    }

    let trashNumber = 0;
    let bossNumber = 0;

    const pages = [
        {
            type: "lore",
            label: "LORE",
            name: currentDungeon.name,
            lore: currentDungeon.lore || "Lore ... Lore"
        }
    ];

    (currentDungeon.sections || []).forEach(section => {

        let label = "";

        if (section.type === "trash") {

            trashNumber++;

            label = `TRASH ${trashNumber}`;

        }

        else if (section.type === "boss") {

            bossNumber++;

            label = `BOSS ${bossNumber}`;

        }

        else {

            label = section.type.toUpperCase();

        }

        pages.push({
            ...section,
            label: label
        });

    });

    return pages;
}



function displayCurrentPage() {

    const container =
        document.getElementById("dungeon");


    const pages =
        getDungeonPages();


    if (
        !pages.length ||
        currentPage < 0 ||
        currentPage >= pages.length
    ) {

        return;

    }


    const page =
        pages[currentPage];


    let html = `

        <div class="dungeon-page">

            <div class="page-header">

                <div class="section-navigation">

                    <div class="section-title">

                        <div class="section-counter">
                            ${currentPage + 1}
                            / ${pages.length}
                            -
                            ${page.label}
                        </div>

                        <div class="section-name">
                            ${page.name}
                        </div>

                    </div>


                    ${
                        currentPage < pages.length - 1
                        ? `
                            <button
                                id="nextPageTop"
                                class="next-page-top"
                            >
                                →
                            </button>
                        `
                        : ""
                    }

                </div>

            </div>

    `;


    // =========================
    // LORE
    // =========================

    if (page.type === "lore") {

        html += `

            <div class="lore">

                <p>
                    ${page.lore}
                </p>

            </div>

        `;

    }


    // =========================
    // SECTION
    // =========================

    else {

        // -------------------------
        // Information de la section
        // -------------------------

        if (page.info) {

            html += `

                <div class="section-info">

                    ${page.info}

                </div>

            `;

        }


        // -------------------------
        // Mobs
        // -------------------------

        if (page.mobs) {

            page.mobs.forEach(
                mob => {

                    // =========================
                    // Carte du mob
                    // =========================

                    html += `

                        <div class="mob-card">

                            <h4 class="${
                                mob.priority
                                ? "mob-priority"
                                : ""
                            }">

                                ${
                                    mob.priority
                                    ? '<span class="priority-warning">⚠</span>'
                                    : ""
                                }

                                ${mob.name}

                            </h4>

                    `;


                    // -------------------------
                    // Info du mob
                    // -------------------------

                    if (mob.info) {

                        html += `

                            <div class="mob-info">

                                ${mob.info}

                            </div>

                        `;

                    }


                    // -------------------------
                    // Capacités
                    // -------------------------

                    if (
                        mob.abilities &&
                        mob.abilities.length > 0
                    ) {

                        html += `

                            <div class="abilities">

                        `;


                        mob.abilities.forEach(
                            ability => {

                                // =========================
                                // Icône
                                // =========================

                                let iconHtml = "";


                                if (ability.icon) {

                                    iconHtml = `

                                        <div class="ability-icon">

                                            <img
                                                src="assets/abilities/${ability.icon}.png"
                                                alt=""
                                            >

                                        </div>

                                    `;

                                }


                                // =========================
                                // Compétence
                                // =========================

                                html += `

                                    <div class="ability">

                                        ${iconHtml}

                                        <div class="ability-content">

                                            <div class="ability-name">

                                                ${
                                                    ability.type
                                                    ? `
                                                        <span
                                                            class="ability-type type-${ability.type.toLowerCase()}"
                                                        >
                                                            ${ability.type}
                                                        </span>
                                                    `
                                                    : ""
                                                }

                                                <strong>
                                                    ${ability.name}
                                                </strong>

                                            </div>


                                            ${
                                                ability.action
                                                ? `
                                                    <div class="ability-action">

                                                        <span
                                                            class="ability-action-badge ${
                                                                ability.priority
                                                                ? "priority"
                                                                : ""
                                                            }"
                                                        >

                                                            ${
                                                                ability.priority
                                                                ? "⚠ "
                                                                : "→ "
                                                            }

                                                            ${ability.action}

                                                        </span>

                                                    </div>
                                                `
                                                : ""
                                            }


                                            ${
                                                ability.info
                                                ? `
                                                    <div class="ability-info">

                                                        ${ability.info}

                                                    </div>
                                                `
                                                : ""
                                            }

                                        </div>

                                    </div>

                                `;

                            }
                        );


                        // Fermeture de .abilities

                        html += `

                            </div>

                        `;

                    }


                    // =========================
                    // Fermeture carte du mob
                    // =========================

                    html += `

                        </div>

                    `;

                }
            );

        }


        // -------------------------
        // Note de fin de section
        // -------------------------

        if (page.note) {

            html += `

                <div class="section-note">

                    ${page.note}

                </div>

            `;

        }

    }


    // =========================
    // NAVIGATION BAS
    // =========================

    html += `

        <div class="page-navigation">

    `;


    if (currentPage > 0) {

        html += `

            <button
                id="previousPage"
            >
                ← Précédent
            </button>

        `;

    }


    if (
        currentPage <
        pages.length - 1
    ) {

        html += `

            <button
                id="nextPage"
            >
                Suivant →
            </button>

        `;

    }


    html += `

        </div>

    </div>

    `;


    container.innerHTML =
        html;


    // =========================
    // BOUTON PRECEDENT
    // =========================

    const previousButton =
        document.getElementById(
            "previousPage"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                currentPage--;

                displayCurrentPage();

                window.scrollTo(
                    0,
                    0
                );

            }
        );

    }


    // =========================
    // BOUTON SUIVANT
    // =========================

    const nextButton =
        document.getElementById(
            "nextPage"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                currentPage++;

                displayCurrentPage();

                window.scrollTo(
                    0,
                    0
                );

            }
        );

    }


    // =========================
    // BOUTON SUIVANT EN HAUT
    // =========================

    const nextTopButton =
        document.getElementById(
            "nextPageTop"
        );


    if (nextTopButton) {

        nextTopButton.addEventListener(
            "click",
            () => {

                currentPage++;

                displayCurrentPage();

                window.scrollTo(
                    0,
                    0
                );

            }
        );

    }

}



loadData();
