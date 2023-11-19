const archiver = require('archiver')
const { ipcRenderer } = require("electron")
const fs = require("node:fs")

const outputSelect = document.querySelector("#output-image-select")

let exportOptions = {
    zippath: "", // Path to ZIP file
    folderpath: "", // Path to folder
    option: "export-folder" // Export option (zip or folder)
}

document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', () => {
        exportOptions.option = radio.value
        console.log(exportOptions);
    })
})

async function zipimages(filelist, exportOptions) {
    handler.setProgressAction(0, filelist.length * filelist[0].length);
    if (exportOptions.option == "export-zip") {
        const output = fs.createWriteStream(exportOptions.zippath);

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

        handler.log(`Exporting ${filelist.length} images with ${filelist[0].length} variations to ${exportOptions.zippath}...`)
    } else if (exportOptions.option == "export-folder") {
        handler.log(`Writing to folder...`)
        for (const files of filelist) {
            for (const file of files) {
                fs.writeFile(exportOptions.folderpath + "/" + file.name, file.data, (err) => {
                    if (err) {
                        handler.error(err);
                    }
                })
                handler.addProgressAction(1)
            }
        }
        handler.addProgressGeneral(1);
        handler.log(`Exporting ${filelist.length} images with ${filelist[0].length} variations to ${exportOptions.folderpath}...`)
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
    if (option == "export-zip") {
        exportOptions.zippath = path
    } else if (option == "export-folder") {
        exportOptions.folderpath = path
    }
    handler.success(`Successfully set export path to "${path}" with option "${option}"`)
    return true;
}

document.querySelectorAll(".export-btn").forEach(exportButton => {
        exportButton.onclick = getSavePath;
    })
    // data = {images: array of images (image) and file names, combinations (array)}
const data = [{ "name": "img-small.avif", "format": "avif", "size": "480w" }, { "name": "img-medium.avif", "format": "avif", "size": "840w" }, { "name": "img-medium.avif", "format": "avif", "size": "840w" },
    { "name": "img-small.jpg", "format": "jpeg", "size": "480w" }, { "name": "img-medium.jpg", "format": "jpeg", "size": "840w" }, { "name": "img-medium.jpg", "format": "jpeg", "size": "840w" },
    { "name": "img-small.webp", "format": "webp", "size": "480w" }, { "name": "img-medium.webp", "format": "webp", "size": "840w" }, { "name": "img-medium.webp", "format": "webp", "size": "840w" }
]

let HTMLOutput = document.querySelector("#output-content")

outputSelect.onchange = updateOutputHTML


function updateOutputHTML() {
    uploadedImages.forEach(image => {
        if (image.path == outputSelect.value) {
            let data = []

            combinations.forEach(com => {
                console.log(com);
                let size
                if (com.scale.value.includes("%")) {
                    size = image.width * parseFloat(filterFloat(com.scale.value)) / 100;
                } else {
                    size = parseFloat(filterFloat(com.scale.value));
                }

                let [namesString, suffix] = image.name.split(".");
                Object.keys(com).forEach(command => {
                    if (com[command].name) {
                        namesString += "_" + command.charAt(0) + com[command].name;
                    }
                });
                namesString += "." + com.export.value;

                data.push({ format: com.export.value, size: size + "w", name: namesString })
            })
            console.log(data);
            imageHTML = makeHTML(data)
            HTMLOutput.innerText = imageHTML
        }
    })

    //uploadedImages.push({ width: this.width, height: this.height, path: file.path, name: file.name, format: file.type.split("/")[1] })


}

function makeHTML(data) {
    let rtn = []
    rtn.push("<picture>\n")

    let formats = []
    for (img of data) {
        if (!formats.includes(img.format)) {
            formats.push(img.format)
        }
    }

    for (formt of formats) {
        let currentString = '<source srcset="'
        for (img of data) {
            console.log(img);
            console.log(formt);
            if (img.format == formt) {
                currentString += img.name + " " + img.size + ", "
            }
        }
        currentString += '" type="image/' + formt + '" />'
        console.log(currentString);
        rtn.push(currentString)
        currentString = ""
    }

    rtn.push("</picture>\n")
    let rtnString = ""
    for (x of rtn) {
        rtnString += x
    }
    console.log(rtnString);
    return rtnString
}