const program = document.querySelector(".program")
const blocks = document.querySelectorAll(".code-block")
const textarea = document.querySelector("#content-settings textarea")
const progressText = document.querySelector("#progress")
const progressBar = document.querySelector("#progressbar")
blocks.forEach(block => {
    block.onclick = (e) => {
        const clone = e.currentTarget.outerHTML
        program.insertAdjacentHTML('beforeend', clone)
        asignInputChange()
        program.querySelectorAll(".program .code-block").forEach(block => {
            block.oncontextmenu = (e) => {
                e.preventDefault();
                block.remove()
                asignInputChange()
                showResultCount(parseBlocks())
            }
        })
    }
})

const gui = document.querySelector(".code-gui")
const cli = document.querySelector(".code-cli")
const cliInput = document.querySelector(".code-cli textarea")

function parseBlocks() {
    let output = ""
    if (cli.classList.contains("active")) {
        output = cliInput.value
    } else {
        const blocks = program.querySelectorAll(".program .code-block")
        blocks.forEach(block => {
            output += block.getAttribute("data-name")
            block.querySelectorAll("input").forEach(input => {
                output += " " + input.value
            })
            output += "\n"
        })
    }
    return output
}

const guicliSelect = document.querySelector("#guicli-select")
guicliSelect.onchange = () => {
    if (guicliSelect.value == "gui") {
        gui.classList.add("active")
        cli.classList.remove("active")
    } else {
        gui.classList.remove("active")
        cli.classList.add("active")
    }
}

function asignInputChange() {
    const inputs = document.querySelectorAll(".code-gui .program input, .code-cli textarea")
    inputs.forEach(input => {
        input.oninput = () => {
            showResultCount(parseBlocks())
        }
    })
}

function generateHTML(com) {
    let valuesString = '';
    let namesString = '';


    Object.keys(com).forEach(command => {
        valuesString += `<span class="previewcmd ${command}">${com[command].value}</span> `;
        if (com[command].name) {
            namesString += "_" + command.charAt(0) + com[command].name;
        }
    });



    return { valuesString, namesString };
}
let counterElement = document.querySelector('#preview-counter');
var combinations

function editExportNumber() {
    let exportNumber = document.querySelector("#export-counter")
    exportNumber.innerText = parseInt(counterElement.innerText) * parseInt(fileCount.innerText)
}

function showResultCount(code) {
    const parsed = parseCode(code)

    combinations = makeCombinations(parsed)

    if (counterElement) {
        counterElement.textContent = combinations.length;
    }
    editExportNumber()

    const outputs = document.querySelector("#code-preview")
    outputs.innerHTML = ""

    combinations.forEach(com => {
        console.log(com);
        let genhtml = generateHTML(com);
        outputs.insertAdjacentHTML('beforeend', `<li>${genhtml.valuesString} as <span contenteditable="true" class="previewname" id="${genhtml.namesString}.${com.export.value}">img${genhtml.namesString}.${com.export.value}</span></li>`);
    })

    updateOutputHTML()
}

asignInputChange()

setTimeout(async() => {
    document.querySelector("#export").onclick = async() => {
        handler.log("Starting export")
        handler.setProgressGeneral(0, 2)
        handler.setProgressAction(0, imageData.length * combinations.length)
        let rtn = []
        for (const image of imageData) {
            rtn.push(await handleImageCombinations(image.data, image.name, combinations))
        }
        handler.addProgressGeneral(1);
        console.log(rtn);
        let zip = zipimages(rtn, exportOptions)
        console.log(zip);
    }
}, 1000)



async function handleImageCombinations(rawData, filename, combinations) {
    let rtn = [];
    handler.log(`Starting to process image "${filename}" into ${combinations.length} combinations.`)
    for (const combination of combinations) {
        rtn.push(await makeImage(rawData, filename, combination.scale, combination.compress, combination.export));
        handler.addProgressAction(1);
    }
    return rtn;
}

handler.on('progress', (progress) => {
    let progressPercent = Math.min((progress.general.current / progress.general.total + progress.action.current / progress.action.total / progress.general.total) * 100, 100)
    progressBar.style.width = progressPercent + "%"
    progressText.innerHTML = Math.round(progressPercent) + "%"

    if (progressPercent == 100) {
        progressText.innerHTML = "Done!"
        setTimeout(() => {
            progressText.innerHTML = "Waiting..."
            progressBar.style.width = "0%"
        }, 5000)
    }
})