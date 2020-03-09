onmessage = data => {
    importScripts("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js");
    generate(data.data);
}

function hex(demical) {
    let str = demical.toString(16);
    if (str.length < 4) {
        str = "0000".substr(0, 4 - str.length);
        str += demical.toString(16);
    }

    return str.toUpperCase();
}

async function generate(data) {
    //let canvas = document.getElementById("canvas"), status = document.getElementById("status"), res = document.getElementById("res");
    let unicode = [];
    let completed = 0, cnt = 0;

    for (let font of data.fonts) {
        for (let code in font.glyphs.glyphs) {
            code = parseInt(code);
            let hex_str = hex(code);
            let k = hex_str.substr(0, 2), id = parseInt(hex_str.substr(2, 2), 16);
            //if (k !== "AC") continue;
            if (unicode[k] === undefined) {
                unicode[k] = [];
                cnt++;
            }
            unicode[k][id] = String.fromCharCode(code);
        }
    }

    const size = 512;
    const div = size / 16;

    const xOffset = 0, yOffset = 0, fontSize = 0;

    let canvas = new OffscreenCanvas(size, size), dom_canvas = new OffscreenCanvas(size, size);
    let ctx = canvas.getContext('2d'), dom_ctx = dom_canvas.getContext('2d');
    let name = data.name;

    canvas.width = size;
    canvas.height = size;

    let zip = new JSZip();

    for (let key in unicode) {
        if (key === "E0" || key === "E1") {
            console.log(`Ignored glyph_${key}.png (${++completed}/${cnt})`);
            continue;
        }

        let data = unicode[key];

        ctx.clearRect(0, 0, size, size);
        dom_ctx.clearRect(0, 0, size, size);

        dom_ctx.font = ctx.font = (div - 1 + fontSize) + 'px ' + name.join(",");
        dom_ctx.textAlign = ctx.textAlign = "center";
        dom_ctx.antialias = ctx.antialias = "subpixel";
        dom_ctx.textBaseline = ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        dom_ctx.fillStyle = "black";

        let num = 0;
        for (let y = 0; y < 16; y++)
            for (let x = 0; x < 16; x++) {
                let list = Object.values(JSON.parse(JSON.stringify(name)));
                if (data[num] !== undefined) {
                    while (!ctx.getImageData(x * div + 1 + xOffset, y * div + 1 + yOffset, (x + 1) * div + xOffset, (y + 1) * div + yOffset).data.some(channel => channel !== 0) && list.length) {
                        ctx.font = (div - 1 + fontSize) + 'px ' + list.join(",");
                        list.shift();
                        ctx.fillText(data[num], x * div + div / 2 + xOffset, y * div + div / 2 + yOffset, size);
                        dom_ctx.fillText(data[num], x * div + div / 2 + xOffset, y * div + div / 2 + yOffset, size);
                    }
                }

                num++;
            }

        //let img = document.createElement("img");
        // img.src = canvas.toDataURL("base64");
        //res.appendChild(img);
        let fileReader = new FileReaderSync(), img;
        zip.file(`glyph_${key}.png`, fileReader.readAsDataURL(await canvas.convertToBlob()).replace("data:image/png;base64,", ""), {base64: true});

        console.log(`Generated glyph_${key}.png (${++completed}/${cnt})`);
        postMessage({status: 0, msg: `Generated glyph_${key}.png (${completed}/${cnt})`, img: fileReader.readAsDataURL(await dom_canvas.convertToBlob())});
    }

    zip.generateAsync({type: "blob"}).then(content => {
        postMessage({msg: "The download will start soon...", buffer: content, status: 1});
    });

}