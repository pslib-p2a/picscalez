const archiver = require('archiver')
const { ipcRenderer } = require("electron")
const fs = require("node:fs")

let exportOptions = {
    path: "", // Path to export
    option: "" // Export option (zip or folder)
}

async function zipimages(filelist, exportOptions) {
    handler.setProgressAction(0, filelist.length * filelist[0].length);
    if (exportOptions.option == "export-zip") {
        const output = fs.createWriteStream(exportOptions.path);

        handler.log(`Generating ZIP file...`)

        const archive = archiver('zip', {
            zlib: { level: 4 } // Sets the compression level.
        });

        archive.on('warning', function(err) {
            handler.error(err);
        });

        archive.on('error', function(err) {
            handler.error(err);
        });

        archive.on("progress", (data) => {
            handler.addProgressAction(1);
        });

        archive.pipe(output)

        for (const files of filelist) {
            for (const file of files) {
                console.log(JSON.stringify(file));
                archive.append(file.data, { name: file.name })
                console.log(file.name);
            }
        }

        archive.finalize().then(() => {
            handler.success(`Successfully exported all images.`)
            handler.addProgressGeneral(1);
        })

        handler.log(`Exporting ${filelist.length} images with ${filelist[0].length} variations to ${exportOptions.path}...`)
    } else if (exportOptions.option == "export-folder") {
        handler.log(`Writing to folder...`)
        for (const files of filelist) {
            for (const file of files) {
                fs.writeFile(exportOptions.path + "/" + file.name, file.data, (err) => {
                    if (err) {
                        handler.error(err);
                    }
                })
                handler.addProgressAction(1)
            }
        }
        handler.addProgressGeneral(1);
    }
}

function generateImgTags(images) {
    return images.map(image => {
        const srcset = image.size.map((size, index) => `${image.filename}-${index}.${image.format} ${size}w`).join(', ');
        return `<img src="${image.filename}.${image.format}" srcset="${srcset}" alt="">`;
    }).join('\n');

}

async function getSavePath(e) {
    handler.log(`Getting save path...`)
    const option = e.target.id;
    let options
    let res
    if (option == "export-zip") {
        options = {
            title: 'Vyberte místo uložení pro výsledný ZIP archiv',
            buttonLabel: 'Exportovat zde',
            filters: [
                { name: 'ZIP Archiv', extensions: ['zip'] }
            ]
        };
        res = await ipcRenderer.invoke('showSaveDialog', options);
    } else if (option == "export-folder") {
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
    console.log(res);
    if (res.canceled) return false;
    const path = res.filePath ? res.filePath : res.filePaths[0]
    e.target.parentElement.parentElement.querySelector("span").innerText = path
    exportOptions = { path, option };
    handler.success(`Successfully set export path to "${path}" with option "${option}"`)
    return true;
}

document.querySelectorAll(".export-btn").forEach(exportButton => {
    exportButton.onclick = getSavePath;
})

const data = [{ "name": "img-small.avif", "format": "avif", "size": "480w" }, { "name": "img-medium.avif", "format": "avif", "size": "840w" }, { "name": "img-medium.avif", "format": "avif", "size": "840w" },
    { "name": "img-small.jpg", "format": "jpeg", "size": "480w" }, { "name": "img-medium.jpg", "format": "jpeg", "size": "840w" }, { "name": "img-medium.jpg", "format": "jpeg", "size": "840w" },
    { "name": "img-small.webp", "format": "webp", "size": "480w" }, { "name": "img-medium.webp", "format": "webp", "size": "840w" }, { "name": "img-medium.webp", "format": "webp", "size": "840w" }
]

function makeHTML(data) {
    let rtn = []
    rtn.push("<picture>\n")

    let formats = []
    for (img of data) {
        if (!formats.includes(img["format"])) {
            formats.push(img["format"])
        }
    }

    for (formt of formats) {
        let currentString = '<source srcset="'
        for (img in data) {
            if (img["format"] == formt) {
                currentString += img["name"] + " " + img["size"] + ", "
            }
        }
        currentString = currentString.rstrip(", ")
        currentString += '" type="image/' + formt + '" />'
        rtn.push(currentString)
        currentString = ""
    }

    rtn.push("</picture>\n")
    let rtnString = ""
    for (x of rtn) {
        rtnString += x
    }
    return rtnString
}

makeHTML(data)