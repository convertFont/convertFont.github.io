onmessage = async (data) => {
    const size = 512;
    const div = size / 16;

    const xOffset = 0, yOffset = 0, fontSize = 0;

    let canvas = new OffscreenCanvas(size, size), dom_canvas = new OffscreenCanvas(size, size);
    let ctx = canvas.getContext('2d'), dom_ctx = dom_canvas.getContext('2d');
    let name = data.data.name;

    canvas.width = size;
    canvas.height = size;

    let char = data.data.char, key = data.data.key;

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
            if (char[num] !== undefined) {
                while (!ctx.getImageData(x * div + 1 + xOffset, y * div + 1 + yOffset, (x + 1) * div + xOffset, (y + 1) * div + yOffset).data.some(channel => channel !== 0) && list.length) {
                    ctx.font = (div - 1 + fontSize) + 'px ' + list.join(",");
                    list.shift();
                    ctx.fillText(char[num], x * div + div / 2 + xOffset, y * div + div / 2 + yOffset, size);
                    dom_ctx.fillText(char[num], x * div + div / 2 + xOffset, y * div + div / 2 + yOffset, size);
                }
            }

            num++;
        }

    //let img = document.createElement("img");
    // img.src = canvas.toDataURL("base64");
    //res.appendChild(img);
    let fileReader = new FileReaderSync(), fs = new FileReaderSync();

    console.log(`Generated glyph_${key}.png`);
    postMessage({key: data.data.key, img: fileReader.readAsDataURL(await canvas.convertToBlob()), dom_img: fs.readAsDataURL(await dom_canvas.convertToBlob()), msg: `Generated glyph_${key}.png`});
};