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
                await fetch(entry.file);

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


    return [

        {
            type: "lore",
            name: currentDungeon.name,
            lore: currentDungeon.lore || "Lore ... Lore"
        },

        ...(currentDungeon.sections || [])

    ];

}



function displayCurrentPage() {

    const container =
        document.getElementById(
            "dungeon"
        );


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

                <h2>
                    ${currentDungeon.name}
                </h2>

                <div class="page-counter">
                    ${currentPage + 1} / ${pages.length}
                </div>

            </div>

    `;


    // =========================
    // LORE
    // =========================

    if (page.type === "lore") {

        html += `

            <div class="lore">

                <h3>
                    📖 ${page.name}
                </h3>

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

        html += `

            <div class="section">

                <h3>
                    ${page.name}
                </h3>

        `;


        if (page.info) {

            html += `

                <div class="section-info">
                    ${page.info}
                </div>

            `;

        }


        if (page.note) {

            html += `

                <div class="section-note">
                    ${page.note}
                </div>

            `;

        }


        // Affichage temporaire des mobs

        if (page.mobs) {

            page.mobs.forEach(
                mob => {

                    html += `

                        <div class="mob">

                            <h4>
                                ${mob.priority ? "/!\\ " : ""}
                                ${mob.name}
                            </h4>

                    `;


                    if (mob.info) {

                        html += `

                            <div class="mob-info">
                                ${mob.info}
                            </div>

                        `;

                    }


                    if (mob.abilities) {

                        html += `

                            <ul>

                        `;


                        mob.abilities.forEach(
                            ability => {

                                html += `

                                    <li>

                                        <strong>
                                            ${ability.name}
                                        </strong>

                                        ${
                                            ability.action
                                            ? ` → ${ability.action}`
                                            : ""
                                        }

                                        ${
                                            ability.info
                                            ? `<br>
                                               <small>
                                                   ${ability.info}
                                               </small>`
                                            : ""
                                        }

                                    </li>

                                `;

                            }
                        );


                        html += `

                            </ul>

                        `;

                    }


                    html += `

                        </div>

                    `;

                }
            );

        }


        html += `

            </div>

        `;

    }


    // =========================
    // NAVIGATION
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


    if (currentPage < pages.length - 1) {

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

    `;


    container.innerHTML = html;


    // =========================
    // EVENTS
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

}



loadData();
