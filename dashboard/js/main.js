/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

let configuration = {
    // the id property is used to identify the deployed version
    id: randomID(),
    api: {},
    notFound: {
        status: 404,
        message: "Not found",
    }
}

// shorthand for query selector (and all)
function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}

function randomID() {
    return Date.now().toString(16) + Math.random().toString(16).substring(2,18);
}

function endpointToID(endpoint) {
    let k;
    Object.keys(configuration['api']).forEach(function(key) {
        if (configuration['api'][key].endpoint == endpoint) {
            k = key;
            return;
        }
    })
    return k
}

function validateAPIUrl(url) {
    let urlIsValid = true;
    if (url.includes('?')) {
        urlIsValid = false;
        return [false];
    }
    let urlParts = url.split('/');
    urlParts = urlParts.filter(function(el) {
        return el != '';
    })
    // check for any dissallowed characters
    urlParts.forEach(function(part) {
        if (part.match(/[^a-zA-Z0-9_]/)) {
            urlIsValid = false;
            return;
        }
    })
    if (urlIsValid) {
        // if leading or trailing slash return false as URL was invalid but it should be fixed
        if (url.startsWith('/') || url.endsWith('/')) {
            return [false, urlParts.join('/')];
        }
        return [true, urlParts.join('/')];
    }
    return [urlIsValid];
}


const startButtonRow = $('#start-button-row');
const dashboardConfigValues = $('#dashboard-config-values');

async function openServerConfig() {
    const response = await fetch('/config.json');
    if (response.ok) {
        const json = await response.json();
        configuration = readConfigFile(JSON.stringify(json));

        updateURLTable()
    } else {
        console.error('Unable to fetch config.json file from the server, starting a blank project instead')
    }

    startButtonRow.style.display = 'none';
    dashboardConfigValues.style.display = 'block';
}

function createEmptyConfiguration() {
    startButtonRow.style.display = 'none';
    dashboardConfigValues.style.display = 'block';
}

function uploadConfig() {
    Swal.fire({
        title: 'Upload Config File',
        html: '<input id="config_file_upload" type="file" accept="application/json" class="form-control">',
    }).then ((r) => {
        if (r.isConfirmed && $('#config_file_upload').files.length > 0) {
            // read file as text with file reader API
            const file = $('#config_file_upload').files[0];

            const reader = new FileReader();
            reader.onload = (e) => {
                // parse the JSON
                configuration = readConfigFile(e.target.result);

                startButtonRow.style.display = 'none';
                dashboardConfigValues.style.display = 'block';

                updateURLTable()

            }
            reader.readAsText(file);
        }
    })
}

function dashboardBack() {
    Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'Unsaved changes will be lost',
        showCancelButton: true,
        confirmButtonText: 'Cancel',
        cancelButtonText: 'Continue',
    }).then (r => {
        if (!r.isConfirmed) {
            window.location.reload()
        }
    })

}

const apiEndPointEditor = $('#api-endpoint-editor');

let newURLEditor = undefined;

let idBeingEdited = "new";

function newURL(btn) {
    idBeingEdited = "new";
    btn.style.display = 'none';
    apiEndPointEditor.style.display = 'block';
    if (newURLEditor === undefined) {
        newURLEditor = ace.edit('api-endpoint-editor-response');
        newURLEditor.setTheme('ace/theme/github');
        newURLEditor.session.setMode('ace/mode/json');
        newURLEditor.setOptions({
            maxLines: Infinity,
            wrap: true
        });
    }

    // reset editor
    $('#alert-newurl-endpoint-error').style.display = 'none';
    $('#api-endpoint-editor-input').style.borderColor = 'initial';

    $('#api-endpoint-editor-input').value = '';
    $('#api-endpoint-editor-method').value = 'GET';
    $('#api-endpoint-editor-response-status').value = 200;
    $('#api-endpoint-editor-response-type').value = 'json';
    changeAPIEndpointResponseLanguage($('#api-endpoint-editor-response-type'))
    resetNewURLQueryData();
    addNewURLQueryDataRow();
    newURLEditor.setValue('{ "status": "success" }');
}
function closeNewURL(btn) {
    btn.style.display = 'block';
    apiEndPointEditor.style.display = 'none';
}
function addNewURL(btn) {
    newURLEndpointValidate($('#api-endpoint-editor-input'));

    function getQueryData() {
        let table = $('#api-endpoint-editor-query-data');
        // convert table to object
        let queryData = {};
        for (let i = 0; i < table.rows.length; i++) {
            let row = table.rows[i];
            let key = row.cells[1].innerText;
            let value = row.cells[2].innerText;
            if (key !== "" && value !== "") 
                queryData[key] = value;
        }
        return queryData;
    }

    const urlConfig = {
        endpoint: 'api/' + $('#api-endpoint-editor-input').value,
        method: $('#api-endpoint-editor-method').value,
        queryData: getQueryData(),
        response: {
            status: $('#api-endpoint-editor-response-status').value,
            type: $('#api-endpoint-editor-response-type').value,
            data: newURLEditor.getValue()
        }
    }

    if (urlConfig.response.type === 'redirect') {
        urlConfig.response.data = $('#api-endpoint-editor-res-input').value
    }

    if (urlConfig.endpoint === 'api/') {
        $('#alert-newurl-endpoint-error').style.display = 'block';
        $('#alert-newurl-endpoint-error').innerHTML = '<b>Error:</b> you must specify an API URL.';
        btn.blur();
        return;
    }

    // verify that the endpoint is different to other endpoints, if it is the same then query data or method should be different
    let endpointIsValid = true;
    Object.keys(configuration['api']).forEach((key) => {
        if (configuration['api'][key].endpoint == urlConfig.endpoint) {
            if (JSON.stringify(configuration.api[key].queryData) == JSON.stringify(urlConfig.queryData)) {
                if (configuration['api'][key].method == urlConfig.method && idBeingEdited === "new") {
                    $('#alert-newurl-endpoint-error').style.display = 'block';
                    $('#alert-newurl-endpoint-error').innerHTML = '<b>Error:</b> URL already exists with the same query data and method';
                    btn.blur();
                    endpointIsValid = false;
                }
            }
        }
    })

    if (endpointIsValid)
        endpointIsValid = validateAPIUrl($('#api-endpoint-editor-input').value).includes(false) ? false : true;

    if (!endpointIsValid) {return}

    if (idBeingEdited === "new") {
        configuration['api'][randomID()] = urlConfig;
    } else {
        configuration['api'][idBeingEdited] = urlConfig;
    }

    updateURLTable();

    closeNewURL(btn);
}

function newURLEndpointValidate(inpt) {
    const valid = validateAPIUrl(inpt.value);
    if (valid.includes(false)) {
        inpt.style.borderColor = '#ff0000';
        $('#alert-newurl-endpoint-error').style.display = 'block';
        if (valid[1] !== undefined) {
            // there is a quick fix available for the URL
            $('#alert-newurl-endpoint-error').innerHTML = `<b>Error:</b> the URL is invalid. <button class="btn btn-sm btn-danger" onclick="document.querySelector('#api-endpoint-editor-input').value='${valid[1]}';newURLEndpointValidate(document.querySelector('#api-endpoint-editor-input'))">Fix</button>`;
        } else {
            $('#alert-newurl-endpoint-error').innerHTML = '<b>Error:</b> please enter a valid URL.';
        }
    } else {
        inpt.style.borderColor = 'initial';
        $('#alert-newurl-endpoint-error').style.display = 'none';
    }
}

function removeNewURLQueryDataRow(btn) {
    // only remove if there is at least 1 row in table
    if ($$('#api-endpoint-editor-query-data tr').length > 1) {
        btn.parentNode.parentNode.remove();
        updateNewURLQueryDataRow();
    } else if ($$('#api-endpoint-editor-query-data tr td')[1].innerHTML != '' || $$('#api-endpoint-editor-query-data tr td')[2].innerHTML != '') {
        btn.parentNode.parentNode.remove();
        addNewURLQueryDataRow();
    }
}
function addNewURLQueryDataRow() {
    $('#api-endpoint-editor-query-data').innerHTML += '<tr><td><button class=btn onclick=removeNewURLQueryDataRow(this)><i class="bi bi-trash"></i></button><td contenteditable=true data-placeholder=Name><td contenteditable=true data-placeholder=Value>';
    updateNewURLQueryDataRow();
}
function resetNewURLQueryData() {
    $('#api-endpoint-editor-query-data').innerHTML = '';
}

function updateNewURLQueryDataRow() {
    if (
        $$('#api-endpoint-editor-query-data tr').length == 1 &&
        $$('#api-endpoint-editor-query-data tr td')[1].innerHTML == '' && 
        $$('#api-endpoint-editor-query-data tr td')[2].innerHTML == ''
        
    ) {
        $('#api-endpoint-editor-query-data tr td button').setAttribute('disabled', 'disabled');
        $('#api-endpoint-editor-query-data tr td button').style.opacity = '0.2';
    } else {
        $('#api-endpoint-editor-query-data tr td button').removeAttribute('disabled');
        $('#api-endpoint-editor-query-data tr td button').style.opacity = '1';
    }
}

updateNewURLQueryDataRow();

function deleteURL(endpoint) {
    endpoint = endpointToID(endpoint);
    delete configuration['api'][endpoint];
    updateURLTable();
} 

function editURL(endpoint, isDuplicated=false) {
    newURL($('#new-url-editor-btn'));

    idBeingEdited = isDuplicated ? "new" : endpointToID(endpoint)

    const urlConfig = configuration['api'][endpointToID(endpoint)];
    $('#api-endpoint-editor-input').value = endpoint.slice(4);
    $('#api-endpoint-editor-method').value = urlConfig.method;

    resetNewURLQueryData();

    if (Object.keys(urlConfig.queryData).length == 0) 
        addNewURLQueryDataRow();

    Object.keys(urlConfig.queryData).forEach(function(key) {
        $('#api-endpoint-editor-query-data').innerHTML += '<tr><td><button class=btn onclick=removeNewURLQueryDataRow(this)><i class="bi bi-trash"></i></button><td contenteditable="true" data-placeholder="Name">' + key + '<td contenteditable="true" data-placeholder="Value">' + urlConfig.queryData[key];
    });

    updateNewURLQueryDataRow();

    $('#api-endpoint-editor-response-status').value = urlConfig.response.status;
    $('#api-endpoint-editor-response-type').value = urlConfig.response.type;
    changeAPIEndpointResponseLanguage($('#api-endpoint-editor-response-type'))
    newURLEditor.setValue(urlConfig.response.data);
    if ($('#api-endpoint-editor-response-type').value === 'redirect') {
        $('#api-endpoint-editor-res-input').value = urlConfig.response.data;
    }
}

function updateURLTable() {
    const table = $('#api-endpoint-editor-list tbody');

    table.innerHTML = '';

    if (Object.keys(configuration['api']).length == 0) {
        table.innerHTML = '<tr><td colspan="4"><i>Click the \'New URL\' button above to get started.</i></td></tr>';
    }

    function shorternQueryData(queryData) {
        return queryData.slice(0, 150) + (queryData.length > 150 ? "..." : "");
    }

    Object.keys(configuration['api']).forEach(function (x) {
        const e = configuration['api'][x]
        table.innerHTML += `
        <tr>
            <td>${e.endpoint}</td>
            <td>${e.method}</td>
            <td>${shorternQueryData(JSON.stringify(e.queryData))}</td>
            <td>
                <button class="btn me-2" onclick="editURL('${e.endpoint}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn me-2" onclick="editURL('${e.endpoint}', true)"> 
                    <i class="bi bi-files"></i>
                </button>
                <button class="btn" onclick="deleteURL('${e.endpoint}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`;
    })
}

updateURLTable()

function changeAPIEndpointResponseLanguage(select) {
    if (select.value === 'redirect') {
        $('#api-endpoint-editor-ace-parent').style.display = 'none'
        $('#api-endpoint-editor-res-parent').style.display = 'block'

        $('#api-endpoint-editor-res-input').setAttribute('type', 'url')
        $('#api-endpoint-editor-res-input').setAttribute('placeholder', 'https://example.com')
        return
    }

    $('#api-endpoint-editor-ace-parent').style.display = 'block'
    $('#api-endpoint-editor-res-parent').style.display = 'none'
    newURLEditor.session.setMode('ace/mode/' + select.value);
}

const defaultNotFound = {
    "status": 404,
    "message": "Not Found"
}
let settingsNotFoundEditor = undefined;

const beautify = ace.require('ace/ext/beautify')


function openSettings(btn) {
    btn.style.display = 'none';
    $('#settings-panel').style.display = 'block'

    // if editor is undefined, create new editor instance
    if (settingsNotFoundEditor === undefined) {
        settingsNotFoundEditor = ace.edit('settings-not-found-response');
        settingsNotFoundEditor.setTheme('ace/theme/github');
        settingsNotFoundEditor.session.setMode('ace/mode/json')
        settingsNotFoundEditor.setOptions({
            maxLines: Infinity,
            wrap: true
        })
    }

    if (configuration.notFound === undefined) {
        settingsNotFoundEditor.setValue(JSON.stringify(defaultNotFound))
    } else {
        settingsNotFoundEditor.setValue(JSON.stringify(configuration.notFound))
    }
}
function closeSettings() {
    $('#settings-panel').style.display = 'none'
    $('#settings-open-btn').style.display = 'block'

    configuration.notFound = JSON.parse(settingsNotFoundEditor.getValue())
}





let octokit = undefined;

async function updateGithub() {
    $('#github-update-output').innerHTML = ''
    function quitEarly() {
        $('#dashboard-config-values').style.display = 'block';
        $('#dashboard-github-update-panel').style.display = 'none';
    }

    function outputText(t) {
        $('#github-update-output').innerHTML += `${t}<br>`;
        console.log(t)
    }

    const json = generateJSONFile(configuration, true, true);
    if (json === "error") {
        quitEarly();
        Swal.fire({
            icon: 'error',
            title: 'You have no URLs!',
            text: 'You need to add at least one URL before you can update the Github repository.',
            showConfirmButton: false
        })

        return;
    }

    $('#dashboard-config-values').style.display = 'none';
    $('#dashboard-github-update-panel').style.display = 'block';

    outputText('JSON config file generated');


    // use the github token and test connection by getting username
    if (Cookies.get('github-token') === undefined || Cookies.get('github-repo') === undefined) {
        Swal.fire({
            icon: 'error',
            text: 'You must complete the GitHub integration process first to be able to update your repository.',
            confirmButtonText: 'Go to GitHub integration'
        }).then ((r) => {
            if (r.isConfirmed) {
                window.open('github-auth/', '_blank');
            }
        })

        quitEarly();

        return;
    }

    try {
        octokit = new Octokit({
            auth: Cookies.get('github-token')
        });

        const {
            data: { login },
        } = await octokit.rest.users.getAuthenticated();

        outputText(`GitHub authentication successful. Identified as ${login}.`);

        outputText(`Checking if repository exists...`);

        const {
            data: allRepos,
        } = await octokit.rest.repos.listForAuthenticatedUser({
            type: 'owner',
            sort: 'updated',
            direction: 'desc',
        });

        let repoExists = false
        allRepos.forEach( repo => {
            if (repoExists) return
            if (repo.name == Cookies.get('github-repo')) {
                repoExists = true;
                outputText(`Repository exists.`);
            }
        })

        if (!repoExists) {
            quitEarly();
            Swal.fire({
                icon: 'error',
                title: 'Repository not found',
                text: 'Please re-complete the GitHub integration process.',
                confirmButtonText: 'Go to GitHub integration'
            }).then ((r) => {
                if (r.isConfirmed) {
                    window.open('github-auth/', '_blank');
                }
            })

            return;
        }

        outputText(`Checking if branch exists...`);

        const {
            data: branches,
        } = await octokit.rest.repos.listBranches({
            owner: login,
            repo: Cookies.get('github-repo')
        })

        let branchExists = false;
        branches.forEach(branch => {
            if (branchExists) return;
            if (branch.name == Cookies.get('github-branch')) {
                branchExists = true;
                outputText(`Branch exists.`);
            }
        })

        if (!branchExists) {
            quitEarly();
            Swal.fire({
                icon: 'error',
                title: 'Branch not found',
                text: 'Please re-complete the GitHub integration process.',
                confirmButtonText: 'Go to GitHub integration'
            }).then ((r) => {
                if (r.isConfirmed) {
                    window.open('github-auth/', '_blank');
                }
            })

            return;
        }

        // allow the user to confirm that they want to continue as the action will overwrite the existing repo branch
        const { value: confirmed } = await Swal.fire({
            title: 'Are you sure you wish to continue?',
            text: `By continuing, branch ${Cookies.get('github-branch')} in repository ${Cookies.get('github-repo')} will be overwritten.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continue', 
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                return true
            }
        })
        if (!confirmed) {
            quitEarly();
            return;
        }

        outputText(`Confirmed update of branch ${Cookies.get('github-branch')} in repository ${Cookies.get('github-repo')}.`);

        async function uploadFile(path, c, msg) {
            try {
                const {
                    data: contents
                } = await octokit.rest.repos.getContent({
                    owner: login,
                    repo: Cookies.get('github-repo'),
                    path: path,
                    ref: Cookies.get('github-branch')
                })


                if (atob(contents.content) == c) {
                    console.log(`No need to update file ${path}`)
                    return
                }

                const {
                    data: configFileStatus
                } = await octokit.rest.repos.createOrUpdateFileContents({
                    owner: login,
                    repo: Cookies.get('github-repo'),
                    path: path,
                    message: msg,
                    content: btoa(c),
                    branch: Cookies.get('github-branch'),
                    sha: contents.sha
                })

                outputText(`Updated file: ${path}`)

                return configFileStatus;
            } catch (e) {  
                // if error presume its 404 (file doesn't already exist and instead try again with creating file)
                const {
                    data: configFileStatus
                } = await octokit.rest.repos.createOrUpdateFileContents({
                    owner: login,
                    repo: Cookies.get('github-repo'),
                    path: path,
                    message: msg,
                    content: btoa(c),
                    branch: Cookies.get('github-branch'),
                })

                outputText(`Created file: ${path}`)

                return configFileStatus;
            }
        }

        await uploadFile('config.json', json, 'Updated config.json');

        // calculate number of folders to create
        let apiDepth = 0;
        Object.keys(JSON.parse(json).api).forEach(ep => {
            if (ep.split('/').length > apiDepth) 
                apiDepth = ep.split('/').length;
        })

        // get api endpoint template
        const epT = await fetch ('templates/api-ep-template.js');
        const epTemplate = await epT.text()

        // generate API file structure
        let currentPath = 'api'
        await uploadFile(
            currentPath + '/[mock-api-0].js', 
            epTemplate.replace(
                '{{ srcLocation }}', 
                '../'.repeat(1)
            ), 
            'Created Mock-API endpoint'
        )
        for (let i = 1; i < apiDepth; i++) {
            const path = currentPath + `/[mock-api-${i-1}]/[mock-api-${i}].js`;
            const template = epTemplate.replace('{{ srcLocation }}', '../'.repeat(i+1))

            await uploadFile(path, template, 'Created Mock-API endpoint')

            currentPath += `/[mock-api-${i-1}]`
        }

        outputText('Upload complete.')

        
        // now keep on fetching the config.json file checking the id each time to see if the update has been deployed yet

        outputText('Waiting for update to be deployed...')

        async function checkDeploymentStatus(id, i) {
            if (i > 10) {
                outputText('Deployment status check timed out after 10 attempts.')
                console.error('Check deployment status loop timeout.')
                return false
            }

            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            await delay(7000)

            // fetch config.json file
            const configFile = await fetch('/config.json');
            if (configFile.ok) {
                const j = await configFile.json();
                if (j.id == id) {
                    outputText('Update deployed.')
                    return;
                }
                checkDeploymentStatus(id, i+1)
            } else {
                console.error('Failed to fetch config.json file')
                checkDeploymentStatus(id, i+1)
            }
        }

        checkDeploymentStatus(JSON.parse(json).id, 1)



    } catch (e) {
        quitEarly();
        handleGitError(e);
    }
}


function handleGitError(e) {
    console.log(e);
    Swal.fire({
        icon: "error",
        title: "An unexpected error occured",
        text: "Your personal access token may be invalid, expired or there may be a network issue. Please try again.",
        footer: "Consult the console for more information.",
        showConfirmButton: false
    })
}