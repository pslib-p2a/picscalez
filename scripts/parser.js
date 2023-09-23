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
	let code = input.split('\n');
	let scaleSizes = [];
	let compressRatios = [];
	let exportTypes = [];
	for (const line of code) {
		let keys = line.split(" ");
		if (keys[0] == "scale") {
			for (const scaleSize of keys[1].split("/")) {
				if (scaleSize.includes(":")) {
					let splitScaleSize = scaleSize.split(":");	
					scaleSizes.push({"scale": splitScaleSize[0], "name": splitScaleSize[1]});
				} else {
					scaleSizes.push({"scale": scaleSize, "name": scaleSize});
				}
			}
		}
		if (keys[0] == "compress") {
			for (const ratio of keys[1].split("/")) {
				compressRatios.push(filterInt(ratio));
			}
		}
		if (keys[0] == "export") {
			for (const exportType of keys[1].split("/")) {
				exportTypes.push(exportType);
			}
		}
	}
	if (scaleSizes.length == 0) {
		scaleSizes.push({"scale": "100%", "name": "100%"});
	}
	if (compressRatios.length == 0) {
		compressRatios.push("0");
	}
	return {"scale": scaleSizes, "compress": compressRatios, "export": exportTypes};
}

function makeCombinations(data) {
	let rtn = [];
	for (const scale of data["scale"]) {
		for (const compress of data["compress"]) {
			for (const exprt of data["export"]) {
				rtn.push({"scale": scale, "compress": compress, "export": exprt});
			}
		}
	}
	return rtn;
}

function getCombinationAmount(data) {
	return data["scale"].length * data["compress"].length * data["export"].length; 
}

//let data = parseCode(testData);
//console.log(makeCombinations(data));
//console.log(getCombinationAmount(data));
