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

async function scaleImage(image, targetHeight) {
    const metadata = await getMetadata(image);
    let aspectRatio = metadata.width / metadata.height;
    let targetWidth = targetHeight * aspectRatio;
    if (metadata.height < targetHeight) {
        let imageScaled = await image.resize(targetWidth, targetHeight);
        return await imageScaled;
    } else {
        return await image;
    }
}

async function processImage(image, fileType, compressionScale) {
    if (fileType == "avif" || fileType == "webp" || fileType == "jpeg" || fileType == "png" || fileType == "tiff") {
        return await image.toFormat(fileType, { quality: 100 - compressionScale });
    } else {
        return await image;
    }
    /*if (fileType == "avif") {
        return image.avif({ quality: 100 - compressionScale })
    } else if (fileType == "webp") {
        return image.webp({ quality: 100 - compressionScale })
    } else {
        return image.jpeg({ quality: 100 - compressionScale });
    }*/
}

async function makeImage(rawData, filename, scale, compress, exprt) {
    return await new Promise(async(resolve, reject) => {
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
        console.log(targetHeight);
        let scaledImage = await scaleImage(image, targetHeight);
        let processedImage = await processImage(scaledImage, exprt, parseInt(compress))
        let exportName = filename + "-" + scale["name"] + "-" + compress + "%." + exprt;
        resolve({ "data": (await (processedImage).toBuffer()), "name": exportName });
    })
}