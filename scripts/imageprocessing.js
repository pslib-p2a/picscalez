const sharp = require('sharp')

function filterInt(input) {
    let rtn = "";
    for (const chr of input) {
        if ("0123456789".includes(chr)) {
            rtn += chr;
        }
    }
    return rtn;
}

function filterFloat(input) {
    let rtn = "";
    for (const chr of input) {
        if ("0123456789,.".includes(chr)) {
            rtn += chr;
        }
    }
    return rtn;
}

async function getMetadata(image) {
    return await image.metadata();
}

function scaleImage(image, targetHeight) {
    const metadata = getMetadata(image);
    let aspectRatio = metadata.width / metadata.height;
    let targetWidth = targetHeight * aspectRatio;
    if (metadata.height < targetHeight) {
        let imageScaled = image.resize(targetWidth, targetHeight);
        return imageScaled.toBuffer();
    } else {
        return image.toBuffer();
    }
}

async function processImage(image, fileType, compressionScale) {
    console.log(image);
    if (fileType == "avif") {
        return sharp(await image).avif({ quality: 100 - compressionScale });
    } else if (fileType == "webp") {
        return sharp(await image).webp({ quality: 100 - compressionScale });
    } else {
        return sharp(await image).jpeg({ quality: 100 - compressionScale });
    }
}

async function makeImage(rawData, filename, scale, compress, exprt) {
    console.log(rawData);
    let image = sharp(await rawData);
    console.log(image);
    let metadata = getMetadata(image);
    console.log(metadata);
    let targetHeight;
    if (scale["scale"].includes("%")) {
        targetHeight = metadata.height * parseFloat(filterFloat(scale["scale"])) / 100;
    } else {
        targetHeight = parseFloat(filterFloat(scale["scale"]));
    }
    let scaledImage = scaleImage(image, targetHeight);
    let processedImage = processImage(scaledImage, exprt, parseInt(compress))
    let exportName = filename + "-" + scale["name"] + "-" + compress + "%c." + exprt;
    return { "data": (await processedImage), "name": exportName };
}