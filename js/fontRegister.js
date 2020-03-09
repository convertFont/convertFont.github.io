window = 1; //opentype sival..

const mimeType = {
    svg: "image/svg+xml",
    ttf: "application/x-font-ttf",
    otf: "application/x-font-opentype",
    woff: "application/font-woff",
    woff2: "application/font-woff2"
}

onmessage = async (data) => {
    let fonts = [], name = [], fontface = [], p = [];

    importScripts("https://cdn.jsdelivr.net/npm/opentype.js@latest/dist/opentype.js");

    for (let file of data.data) {
        let url = URL.createObjectURL(file), font;
        try {
            await new Promise((resolve, reject) => opentype.load(url, function (err, f) {
                if (err) reject(err);
                else resolve(f);
            })).then(f => font = f);
        } catch (e) {
            console.log("Cannot load " + file.name + ".");
            console.log(e);

            URL.revokeObjectURL(url);
            continue;
        }

        if (font !== null) {
            fonts.push(font);
            name.push(font.names.fullName.en);

            let xhr = new XMLHttpRequest();
            xhr.responseType = "blob";

            xhr.open('GET', url, false);
            xhr.send();

            let reader = new FileReaderSync();
            let ff = new FontFace(font.names.fullName.en, url = `url(data:application/${mimeType[file.name.split(".").pop()]};charset=utf-8;base64,${btoa(reader.readAsBinaryString(xhr.response))}`);
            p.push(ff.load().then(f => {
                fontface.push([font.names.fullName.en, url]);
            }).catch(e => {
                console.log(e);
            }));
        }
    }

    Promise.all(p).then(d => postMessage({face: fontface, fonts: fonts, name: name}));
}