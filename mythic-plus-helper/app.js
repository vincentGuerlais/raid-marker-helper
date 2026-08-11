const contentsIndexResponse =
    await fetch("contents.json");

const contentsIndex =
    await contentsIndexResponse.json();

contents = [];

for (const entry of contentsIndex.contents) {

    const response =
        await fetch(entry.file);

    const content =
        await response.json();

    contents.push(content);

}
