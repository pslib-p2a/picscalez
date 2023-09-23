let state = 0
var imageData = []

const updateFiles = (e) => {
    imageData = []
    const files = e.target.files
    console.log(files);

    if (files.length === 1) {
        var fileName = files[0].name.split('\\').pop();
        textContainer.innerHTML = fileName;
    } else {
        textContainer.innerHTML = files.length + ' souborů vybráno';
    }

    infobox.innerHTML = ""

    for (i in files) {
        let file = files[i]
        console.log(file);
        let reader = new FileReader()
        reader.onload = () => {
            console.log(reader);
            imageData.push({ data: file.path, name: file.name })
            infobox.innerHTML += `<div class="imageinfo">
      <img class="imagepreview" src="${reader.result}">
      <div class="imagestats">
      <span class="imagename">${file.name.slice(0,24)}</span>
      <span class="imagetype">${file.size} b</span>
      <span class="imagesize">${file.type}</span>
      </div>
    </div>`
        }
        reader.readAsDataURL(file)
    }

}
const fileInput = document.querySelector("#file-input")
const textContainer = document.querySelector(".file-msg");
const infobox = document.querySelector(".info");
console.log(fileInput);
fileInput.onchange = updateFiles

const content = {
    files: document.querySelector("#content-files"),
    settings: document.querySelector("#content-settings"),
    export: document.querySelector("#content-export"),
}


const nextBtn = document.querySelector("#next")
nextBtn.onclick = () => {
    state++
    setState()
}
const backBtn = document.querySelector("#back")
backBtn.onclick = () => {
    state--
    setState()
}

function setState() {
    if (state < 0) state = 0
    if (state > 2) state = 2
    if (state == 0) {
        backBtn.setAttribute("disabled", "")
        content.files.classList.add("visible")
        content.settings.classList.remove("visible")
        content.export.classList.remove("visible")
    }
    if (state == 1) {
        backBtn.removeAttribute("disabled")
        content.files.classList.remove("visible")
        content.settings.classList.add("visible")
        content.export.classList.remove("visible")
    }
    if (state == 2) {
        content.files.classList.remove("visible")
        content.settings.classList.remove("visible")
        content.export.classList.add("visible")
    }
}