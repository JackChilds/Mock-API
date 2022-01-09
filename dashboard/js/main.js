/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

let configuration = {
    // the id property is used to identify the API version
    id: randomID(),
    api: {}
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

function openServerConfig() {
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

    if (urlConfig.endpoint === 'api/') {
        $('#alert-newurl-endpoint-error').style.display = 'block';
        $('#alert-newurl-endpoint-error').innerHTML = '<b>Error:</b> you must specify an API URL.';
        btn.blur();
        return;
    }

    // verify that the endpoint is different to other endpoints, if it is the same then query data should be different
    let endpointIsValid = true;
    Object.keys(configuration['api']).forEach((key) => {
        if (configuration['api'][key].endpoint == urlConfig.endpoint) {
            if (JSON.stringify(configuration.api[key].queryData) == JSON.stringify(urlConfig.queryData)) {
                if (configuration['api'][key].method == urlConfig.method) {
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
    if ($$('#api-endpoint-editor-query-data tr').length == 1) {
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

function editURL(endpoint) {
    newURL($('#new-url-editor-btn'));
    idBeingEdited = endpointToID(endpoint);
    const urlConfig = configuration['api'][endpointToID(endpoint)];
    $('#api-endpoint-editor-input').value = endpoint.slice(4);
    $('#api-endpoint-editor-method').value = urlConfig.method;
    // populate query data table with query data
    resetNewURLQueryData();

    if (Object.keys(urlConfig.queryData).length == 0) 
        addNewURLQueryDataRow();

    Object.keys(urlConfig.queryData).forEach(function(key) {
        $('#api-endpoint-editor-query-data').innerHTML += '<tr><td><button class=btn onclick=removeNewURLQueryDataRow(this)><i class="bi bi-trash"></i></button><td contenteditable="true" data-placeholder="Name">' + key + '<td contenteditable="true" data-placeholder="Value">' + urlConfig.queryData[key];
    });

    $('#api-endpoint-editor-response-status').value = urlConfig.response.status;
    $('#api-endpoint-editor-response-type').value = urlConfig.response.type;
    newURLEditor.setValue(urlConfig.response.data);
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
        table.innerHTML += `<tr><td>${e.endpoint}</td><td>${e.method}</td><td>${shorternQueryData(JSON.stringify(e.queryData))}</td><td><button class="btn me-2" onclick="editURL('${e.endpoint}')"><i class="bi bi-pencil"></i></button><button class="btn" onclick="deleteURL('${e.endpoint}')"><i class="bi bi-trash"></i></button></td></tr>`;
    })
}

updateURLTable()

function changeAPIEndpointResponseLanguage(select) {
    newURLEditor.session.setMode('ace/mode/' + select.value);
}


// generate JSON file from configuration and parse json files to configuration compatible object

// why do this?
// the JSON file is generated like this to try to improve the speed at which the data can be gathered from the configuration, instead of having to go through the entire configuration every time because the ids are non descript you can just straight away find the endpoint. also, it makes the file more human readable


function generateJSONFile() {
    if (Object.keys(configuration.api).length === 0) {
        Swal.fire({
            title: 'You have no URLs!',
            text: 'You need to add at least one URL before you can generate a JSON file.',
            icon: 'error'
        })
        return
    }

    // make a deep copy of the configuration so it doesn't modify the existing configuration
    let configCopy = JSON.parse(JSON.stringify(configuration));

    // remove ids and use endpoints as keys
    Object.keys(configCopy.api).forEach((id) => {
        if (configCopy.api[configCopy.api[id].endpoint.slice(4)] === undefined) {
            configCopy.api[configCopy.api[id].endpoint.slice(4)] = new Array();
        }
        configCopy.api[configCopy.api[id].endpoint.slice(4)].push(configCopy.api[id]);

        // delete endpoint because it is not needed
        delete configCopy.api[configCopy.api[id].endpoint.slice(4)][configCopy.api[configCopy.api[id].endpoint.slice(4)].length -1].endpoint;

        delete configCopy.api[id];
    })

    // now download the JSON
    const json = JSON.stringify(configCopy);
    Swal.fire ({
        text: 'The JSON file has been generated. You can now download it to your computer.',
        icon: 'success',
        confirmButtonText: 'Download'
    }).then((r) => {
        if (r.isConfirmed) {
            var blob = new Blob ([json], { type: "text/json;charset=utf-8" })
            saveAs(blob, "config.json")
        }
    })
}

function readConfigFile(config) {
    configObj = JSON.parse(config)

    let conf = { id: randomID(), api: {} };

    Object.keys(configObj.api).forEach((ep) => {
        for (let i = 0; i < configObj.api[ep].length; i++) {
            let id = randomID();
            conf['api'][id] = configObj.api[ep][i];
            conf['api'][id].endpoint = "api/" + ep;
        }
    })
    return conf;
}