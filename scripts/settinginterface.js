const program = document.querySelector(".program")
const blocks = document.querySelectorAll(".block")
const textarea = document.querySelector("#content-settings textarea")
const progressText = document.querySelector("#progress")
const progressBar = document.querySelector("#progressbar")
blocks.forEach(block => {
    block.onclick = (e) => {
        const clone = e.target.outerHTML
        program.insertAdjacentHTML('beforeend', clone)
        asignInputChange()
        program.querySelectorAll(".program .block").forEach(block => {
            block.oncontextmenu = (e) => {
                e.preventDefault();
                block.remove()
                asignInputChange()
                showResultCount(parseBlocks())
            }
        })
    }
})

function parseBlocks() {
    let output = ""
    if (cli.classList.contains("active")) {
        output = textarea.value
    } else {
        const blocks = program.querySelectorAll(".program .block")
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

const gui = document.querySelector(".gui")
const cli = document.querySelector(".cli")
document.querySelector("#guicli").onclick = () => {
    gui.classList.toggle("active")
    cli.classList.toggle("active")
}

function asignInputChange() {
    const inputs = document.querySelectorAll("#content-settings input, #content-settings textarea")
    inputs.forEach(input => {
        input.oninput = () => {
            showResultCount(parseBlocks())

        }
    })
}

var combinations

function showResultCount(code) {
    const parsed = parseCode(code)
    combinations = makeCombinations(parsed)
    const outputs = document.querySelector(".stats .outputs")
    outputs.innerHTML = ""
    combinations.forEach(com => {
        console.log(com);
        outputs.insertAdjacentHTML('beforeend', `<li>S ${com.scale.scale} (N ${com.scale.name}) | C ${com.compress} | E ${com.export}</li>`)
    })
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
        rtn.push(await makeImage(rawData, filename, combination["scale"], combination["compress"], combination["export"]));
        handler.addProgressAction(1);
    }
    return rtn;
}

handler.on('progress', (progress) => {
    let progressPercent = Math.min((progress.general.current / progress.general.total + progress.action.current / progress.action.total / progress.general.total) * 100, 100)
    progressBar.style.width = progressPercent + "%"
    progressText.innerHTML = Math.round(progressPercent) + "%"
})