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
        return;
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