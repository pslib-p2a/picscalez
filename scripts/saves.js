/*
save 
{"id", "name", "value": {"commands": {"gui":[{"command": "resize", "value": "100x100"}, {"command": "format", "value": "png"}], "cli":"", "guiactive":true}, "export": {"option": "export-zip", "value": "test.zip"}}}
*/
(async() => {
    let saves = await getSaves();
    if (!saves || saves == '[]' || saves == '{}') {
        saves = [];
        setSaves(saves)
    } else {
        saves = JSON.parse(saves);
    }
    console.log(saves);

    function addSave(save) {
        saves.push(save);
        console.log(saves);
        setSaves(saves)
    }

    function removeSave(saveId) {
        saves = saves.filter(s => s.id !== saveId);
        setSaves(saves)
    }

    function removeSaveByName(saveName) {
        saves = saves.filter(s => s.name !== saveName);
        setSaves(saves)
    }

    async function getSaves() {
        return await new Promise(async(resolve, reject) => {
            await ipcRenderer.invoke('getSaves').then(out => resolve(out));
        });
    }

    async function setSaves(saves) {
        await ipcRenderer.invoke('setSaves', JSON.stringify(saves));
    }

    function getSave(saveId) {
        return saves.find(s => s.id === saveId);
    }

    function getSaveByName(saveName) {
        return saves.find(s => s.name === saveName);
    }

    function loadSave(save) {
        loadBlocks(save.value.commands.gui);
        document.querySelector('#textinput').value = save.value.commands.cli;
        exportOptions = save.value.export;
        guicliSelect.value = save.value.commands.guiactive ? 'gui' : 'cli';
        updateOutputHTML();
        handler.log(`Loaded template "${save.name}"`);
    }

    const templateView = document.querySelector('#templateview');

    function createSaveList(saves) {
        templateView.innerHTML = '';
        console.log(typeof saves);
        saves.forEach(save => {
            const saveItem = document.createElement('div');
            saveItem.classList.add('template');
            let date = new Date(save.id)
            saveItem.innerHTML = `
                <input type="radio" value="${save.id}" id="${save.id}" name="loadtemplate" />
                <label for="${save.id}" class="templatelabel">
                    <div class="templatevalues">
                        <h3 class="templatename">${save.name}</h3>
                        <span class="templatedate">${date.toLocaleDateString()}</span>
                    </div>
                    <button class="templateremove" id="${save.id}"><svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 80" x="0px" y="0px" width="24" height="24"><path data-name="Path" d="M39.1,10.8a4,4,0,0,0,0,8H60.9a4,4,0,1,0,0-8Z"></path><path data-name="Compound Path" d="M83.4,22.4H16.6a4,4,0,0,0,0,8h4l4.3,47.8a12,12,0,0,0,12,11H63.1a12,12,0,0,0,12-11l4.3-47.8h4a4,4,0,0,0,0-8ZM67.1,77.5a4,4,0,0,1-4,3.7H36.9a4,4,0,0,1-4-3.7L28.7,30.4H71.3Z"></path></svg></button>
                </label>
            `;
            saveItem.querySelector('.templateremove').onclick = () => {
                removeSave(save.id);
                saveItem.remove();
            };
            templateView.appendChild(saveItem);
        });
    }

    createSaveList(saves)

    const templatesaveBtn = document.querySelector('#templatesave');
    templatesaveBtn.onclick = saveTemplate

    function saveTemplate() {
        const save = {
            id: Date.now(),
            name: document.querySelector('#templateName').value,
            value: {
                commands: {
                    gui: parseBlocks(),
                    cli: document.querySelector('#textinput').value,
                    guiactive: document.querySelector('#guicli-select').value === 'gui',
                },
                export: exportOptions,
            },
        };
        removeSaveByName(save.name);
        addSave(save);
        handler.log(`Saved template "${save.name}"`);
        saveModal.classList.remove('active');
        createSaveList(saves);
    }

    const loadModal = document.querySelector('#loadTemplate');
    const saveModal = document.querySelector('#saveTemplate');

    loadModal.onclick = (e) => {
        if (e.target !== e.currentTarget) return;
        e.currentTarget.classList.remove('active');

    }

    saveModal.onclick = loadModal.onclick

    document.onkeydown = (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveModal.classList.toggle('active');
        } else if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            loadModal.classList.toggle('active');
        } else if (e.key === 'Escape') {
            loadModal.classList.remove('active');
            saveModal.classList.remove('active');
        }
    }

    const loadBtn = document.querySelector('#loadBtn');
    loadBtn.onclick = () => {
        loadModal.classList.toggle('active');
    }
    const saveBtn = document.querySelector('#saveBtn');
    saveBtn.onclick = () => {
        saveModal.classList.toggle('active');
    }
})();