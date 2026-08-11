console.log("MYTHIC+ HELPER");


let contents = [];
let currentDungeon = null;



async function loadData() {

    try {

        const response =
            await fetch("contents.json");

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


    const container =
        document.getElementById(
            "dungeon"
        );


    container.innerHTML = `

        <h2>
            ${currentDungeon.name}
        </h2>

        <p>
            Donjon chargé.
        </p>

    `;

}



loadData();
