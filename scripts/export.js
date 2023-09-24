const archiver = require('archiver')
const { ipcRenderer } = require("electron")
const fs = require("node:fs")
async function zipimages(filelist) {
    const output = fs.createWriteStream(__dirname + '/example.zip');
    console.log(filelist);
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
    // tak treba se jdi zabit

    archive.on('error', function(err) {
        throw err;
    });

    archive.on("progress", (data) => {
        console.log(data);
    })

    console.log(output);
    archive.pipe(output)

    console.log(filelist);
    for (const files of filelist) {
        for (const file of files) {
            console.log(JSON.stringify(file));
            archive.append(file.data, { name: file.name })
            console.log(file.name);
            setTimeout(() => { archive.finalize() }, 3000);
        }
    }
}

function generateImgTags(images) {
    return images.map(image => {
        const srcset = image.size.map((size, index) => `${image.filename}-${index}.${image.format} ${size}w`).join(', ');
        return `<img src="${image.filename}.${image.format}" srcset="${srcset}" alt="">`;
    }).join('\n');

}


async function getSavePath(option) {
    let options
    let res
    if (option == "zip") {
        options = {
            title: 'Vyberte místo uložení pro výsledný ZIP archiv',
            buttonLabel: 'Exportovat zde',
            filters: [
                { name: 'ZIP Archiv', extensions: ['zip'] }
            ]
        };
        res = await ipcRenderer.invoke('showSaveDialog', options);
    } else if (option == "folder") {
        options = {
            title: 'Vyberte složku pro výstup',
            buttonLabel: 'Exportovat sem',
            filters: [
                { name: 'Složka', extensions: ['zip'] }
            ],
            properties: [
                "openDirectory"
            ]
        };
        res = await ipcRenderer.invoke('showOpenDialog', options);
    }

    return res;
}