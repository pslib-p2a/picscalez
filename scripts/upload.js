const path = require('path');

var imageData = []
let files = []
let currentFilePage = 0
let pageCount = 0

const updateFiles = (e) => {
    fileInputs.forEach(input => {

        //check if file is already in array
        let inArr = false
        for (let file of files) {
            for (let inputfile of input.files) {
                if (file.path == inputfile.path) {
                    inArr = true
                }
            }
        }
        console.log(input.files);
        if (!inArr) files.push(...input.files)

        for (let file of input.files) {
            console.log(file);
            let reader = new FileReader()
            reader.onload = () => {
                console.log(reader);
                imageData.push({ data: file.path, name: file.name })
                let img = new Image();
                let objectUrl = window.URL.createObjectURL(file);
                img.onload = function() {
                    fileSlider.insertAdjacentHTML("beforeend",
                        `<div class="file-container">
                        <button class="file-remove" onclick="removeFile(event)" data-path="${file.path}"><svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 80" x="0px" y="0px"><path data-name="Path" d="M39.1,10.8a4,4,0,0,0,0,8H60.9a4,4,0,1,0,0-8Z"></path><path data-name="Compound Path" d="M83.4,22.4H16.6a4,4,0,0,0,0,8h4l4.3,47.8a12,12,0,0,0,12,11H63.1a12,12,0,0,0,12-11l4.3-47.8h4a4,4,0,0,0,0-8ZM67.1,77.5a4,4,0,0,1-4,3.7H36.9a4,4,0,0,1-4-3.7L28.7,30.4H71.3Z"></path></svg></button>
                        ${img.outerHTML}
                        <div class="file-info">
                            <h3 class="file-name">${file.name.split(".").slice(0,-1).join(".").slice(0,18)}</h3>
                            <h4 class="file-path">${path.dirname(file.path).slice(0,36)}</h4>
                            <div class="file-stats">
                                <span class="file-size">${humanFileSize(file.size)}</span>
                                <span class="file-res">${this.width + "×" + this.height}</span>
                                <span class="file-type">${file.type.split("/")[1]}</span>
                            </div>
                        </div>
                    </div>`
                    )
                }
                img.src = objectUrl;
                img.classList.add("file-image")
            }
            reader.readAsDataURL(file)
        }
    })
    imageData = []
    console.log(files);

    updateFileView()

}
const fileSlider = document.querySelector("#files-slider")
const fileArrowLeft = document.querySelector("#files-arrow-left")
const fileArrowRight = document.querySelector("#files-arrow-right")
const fileSliderPages = document.querySelector(".files-slider-pages")
const fileCount = document.querySelector("#files-counter")
const fileInputs = document.querySelectorAll(".file-input")
fileInputs.forEach(input => {
    input.addEventListener('change', updateFiles)
})

// remove file from array and dom
const removeFile = (e) => {
    const path = e.target.dataset.path
    console.log(path);
    for (let i = 0; i < files.length; i++) {
        if (files[i].path == path) {
            files.splice(i, 1)
            break
        }
    }
    e.target.parentElement.remove()
    updateFileView()
}


// convert bytes to human readable file size
const humanFileSize = (bytes, si = false, dp = 1) => {
    const thresh = 1000;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        u++;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );
    return bytes.toFixed(dp) + ' ' + units[u];
}

const updateFileView = () => {
    //update file count, slider, arrows and file array
    fileCount.innerText = files.length
    pageCount = Math.ceil((files.length + 1) / 4)

    //update arrows
    if (currentFilePage >= pageCount) currentFilePage = pageCount - 1
    updateArrows()

    fileSliderPages.innerHTML = ""
        //update slider dots
    for (let i = 0; i < pageCount; i++) {
        fileSliderPages.insertAdjacentHTML("beforeend", `<div class="files-slider-page" onclick="changePage(event)"></div>`)
    }
    fileSliderPages.children[currentFilePage].classList.add("active")

}

const updateArrows = () => {
    if (currentFilePage < pageCount - 1) {
        fileArrowRight.classList.remove("disabled")
    } else {
        fileArrowRight.classList.add("disabled")
    }
    if (currentFilePage >= 1) {
        fileArrowLeft.classList.remove("disabled")
    } else {
        fileArrowLeft.classList.add("disabled")
    }
}

const changePage = (e) => {
    currentFilePage = [...fileSliderPages.children].indexOf(e.target)
    fileSlider.scrollLeft = (fileSlider.clientWidth + 16) * currentFilePage
    updateArrows()
        //update slider dots
    fileSliderPages.querySelector(".active").classList.remove("active")
    fileSliderPages.children[currentFilePage].classList.add("active")
}

fileArrowLeft.addEventListener("click", () => {
    if (currentFilePage >= 1) {
        currentFilePage--
        fileSlider.scrollLeft = (fileSlider.clientWidth + 16) * currentFilePage
        updateArrows()
            //update slider dots
        fileSliderPages.children[currentFilePage].classList.add("active")
        fileSliderPages.children[currentFilePage + 1].classList.remove("active")
    }
})

fileArrowRight.addEventListener("click", () => {
    if (currentFilePage < pageCount - 1) {
        currentFilePage++
        fileSlider.scrollLeft = (fileSlider.clientWidth + 16) * currentFilePage
        updateArrows()
            //update slider dots
        fileSliderPages.children[currentFilePage].classList.add("active")
        fileSliderPages.children[currentFilePage - 1].classList.remove("active")
    }
})