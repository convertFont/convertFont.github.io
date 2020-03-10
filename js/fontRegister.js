window = 1; //opentype sival..

const mimeType = {
    svg: "image/svg+xml",
    ttf: "application/x-font-ttf",
    otf: "application/x-font-opentype",
    woff: "application/font-woff",
    woff2: "application/font-woff2"
}

function hex(demical) {
    let str = demical.toString(16);
    if (str.length < 4) {
        str = "0000".substr(0, 4 - str.length);
        str += demical.toString(16);
    }

    return str.toUpperCase();
}


onmessage = async (data) => {
    let fonts = [], fontface = [], p = [];

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

    let unicode = [];
    let cnt = 0;

    for (let font of fonts) {
        for (let code in font.glyphs.glyphs) {
            code = parseInt(code);
            let hex_str = hex(code);
            let k = hex_str.substr(0, 2), id = parseInt(hex_str.substr(2, 2), 16);
            //if (k !== "AC") continue;
            if (k === "E0" || k === "E1") {
                continue;
            }
            if (unicode[k] === undefined) {
                unicode[k] = [];
                cnt++;
            }
            if (unicode[k][id] === undefined && font.getPath(String.fromCharCode(code)).commands.length) {
                unicode[k][id] = [String.fromCharCode(code), font.names.fullName.en];
            }
        }
    }

    Promise.all(p).then(d => postMessage({face: fontface, fonts: fonts, unicode: unicode, cnt: cnt}));
}