const archiver = require('archiver')

function zipimages(files) {
    const archive = archiver('zip', {
        zlib: { level: 4 } // Sets the compression level.
    });
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    archive.on("data", (data) => {
        console.log(data);
    })

    for (file of files) {
        archive.append(file.data, { name: file.name })
    }
    archive.finalize();
}

function generateImgTags(images) {
    return images.map(image => {
        const srcset = image.size.map((size, index) => `${image.filename}-${index}.${image.format} ${size}w`).join(', ');
        return `<img src="${image.filename}.${image.format}" srcset="${srcset}" alt="">`;
    }).join('\n');
}