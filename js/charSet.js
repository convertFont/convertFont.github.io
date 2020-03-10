function hex(demical) {
    let str = demical.toString(16);
    if (str.length < 4) {
        str = "0000".substr(0, 4 - str.length);
        str += demical.toString(16);
    }

    return str.toUpperCase();
}

onmessage = data => {
    let unicode = [];
    let cnt = 0;

    for (let font of data.data.fonts) {
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
            unicode[k][id] = String.fromCharCode(code);
        }
    }

    postMessage({unicode: unicode, cnt: cnt, name: data.data.name});
}