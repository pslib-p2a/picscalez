let testData = "resize 480px:tb/560px:pv/1820px:full\ncompress 40%\nexport avif/jpeg/tiff"
    //let testData = "resize 480px:tb\nresize 560px:pv\nresize 1820px:full\ncompress 50%\ncompress 75%\nexport avif\nexport jpeg\nexport tiff"

function filterInt(input) {
    let rtn = "";
    for (const chr of input) {
        if ("0123456789".includes(chr)) {
            rtn += chr;
        }
    }
    return rtn;
}

function parseCode(input) {
    let availableCommands = {
        "scale": [{ "value": "100%", "name": "" }],
        "compress": [{ "value": "0", "name": "" }],
        "export": null
    };

    let commands = JSON.parse(JSON.stringify(availableCommands)); // Deep copy

    let lines = input.split('\n');

    for (let line of lines) {
        let [command, valueNames] = line.split(' ');

        if (!availableCommands.hasOwnProperty(command)) {
            continue;
        }

        if (command === "export" && !valueNames) {
            throw new Error("Value required for 'export' command");
        }

        let pairs = valueNames ? valueNames.split('/') : [];

        if (pairs.length > 0) {
            commands[command] = []; // Reset the command array if there are pairs
        }

        for (let pair of pairs) {
            let [value, name = command != "export" ? value : ""] = pair.split(':');
            commands[command].push({ value, name });
        }
    }

    return commands;
}

/*function parseCode(input) {
    let code = input.split('\n');
    let scaleSizes = [];
    let compressRatios = [];
    let exportTypes = [];
    for (const line of code) {
        let keys = line.split(" ");
        if (kyes[0] == "scale" || keys[0] == "compress" || keys[0] == "export") {
            for (const params of keys[1].split("/")) {
                let paramsSplit = params.split(":");
                // edit each command here
                switch (keys[0]) {
                    case "scale":
                        scaleSizes.push({ "scale": paramsSplit[0], name: paramsSplit[1] });
                        break;
                    case "compress":
                        compressRatios.push(filterInt(paramsSplit[0]));
                        break;
                    case "export":
                        exportTypes.push(paramsSplit[0]);
                        break;
                }
            }
        }
    }
    if (scaleSizes.length == 0) {
        scaleSizes.push({ "scale": "100%", "name": "100%" });
    }
    if (compressRatios.length == 0) {
        compressRatios.push("0");
    }
    return { "scale": scaleSizes, "compress": compressRatios, "export": exportTypes };
}*/

function makeCombinations(data) {
    let rtn = [];
    for (const scale of data["scale"]) {
        for (const compress of data["compress"]) {
            for (const exprt of data["export"]) {
                rtn.push({ "scale": scale, "compress": compress, "export": exprt });
            }
        }
    }
    console.log(rtn);
    return rtn;
}

function getCombinationAmount(data) {
    return data["scale"].length * data["compress"].length * data["export"].length;
}

//let data = parseCode(testData);
//console.log(makeCombinations(data));
//console.log(getCombinationAmount(data));