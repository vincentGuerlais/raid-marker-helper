let characters = [];
let contents = [];



async function loadData() {

    const charactersResponse = await fetch("data/characters.json");
    const charactersData = await charactersResponse.json();

    characters = charactersData.characters;


    const contentsResponse = await fetch("data/contents.json");
    const contentsData = await contentsResponse.json();

    contents = contentsData.contents;


    displayCharacters();

    displayContent();

}



function displayCharacters() {

    const container = document.getElementById("characters");

    container.innerHTML = "<h2>Personnages actifs</h2>";


    characters
    .filter(character => character.active)
    .forEach(character => {

        const div = document.createElement("div");

        div.className = "character";

        div.innerHTML =
            `✓ ${character.name}
             - ${character.class}
             (${character.spec})`;


        container.appendChild(div);

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

    const content = contents[index];

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



loadData();