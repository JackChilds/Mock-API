let configuration = {
    test: {
        endpoint: 'api/_test_status',
        method: 'GET',
        queryData: {},
        response: {
            status: 200,
            type: 'JSON',
            data: JSON.stringify ({
                status: 'OK',
                // the id property is used to identify the version of the API configuration that is running on Vercel, in order to be able to tell when the updated API project has been deployed by Vercel
                id: Date.now() + Math.floor((Math.random() * 10000))
            })
        }
    },
    api: {}
}

// shorthand for query selector (and all)
function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}


const startButtonRow = $('#start-button-row');
const dashboardConfigValues = $('#dashboard-config-values');

function newProject() {
    startButtonRow.style.display = 'none';
    dashboardConfigValues.style.display = 'block';
}

const apiEndPointEditor = $('#api-endpoint-editor');

let newURLEditor = undefined;

function newURL(btn) {
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
}
function closeNewURL(btn) {
    btn.style.display = 'block';
    apiEndPointEditor.style.display = 'none';
}
function addNewURL(btn) {
    closeNewURL(btn);

    function getQueryData() {
        let table = $('#api-endpoint-editor-query-data');
        // convert table to object
        let queryData = {};
        for (let i = 0; i < table.rows.length; i++) {
            let row = table.rows[i];
            let key = row.cells[1].innerText;
            let value = row.cells[2].innerText;
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

    configuration['api'][$('#api-endpoint-editor-input').value] = urlConfig;

    updateURLTable();
}

function removeNewURLQueryDataRow(btn) {
    // only remove if there is at least 1 row in table
    if ($$('#api-endpoint-editor-query-data tr').length > 1) {
        btn.parentNode.parentNode.remove();

        updateNewURLQueryDataRow();
    }
}
function addNewURLQueryDataRow() {
    $('#api-endpoint-editor-query-data').innerHTML += '<tr><td><button class=btn onclick=removeNewURLQueryDataRow(this)><i class="bi bi-x"></i></button><td contenteditable=true data-placeholder=Name><td contenteditable=true data-placeholder=Value>';
    updateNewURLQueryDataRow();
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

function updateURLTable() {
    const table = $('#api-endpoint-editor-list tbody');

    table.innerHTML = '';

    // test status API endpoint
    table.innerHTML += '<tr><td>' + configuration.test.endpoint + '</td><td>' + configuration.test.method + '</td><td><button data-bs-toggle="popover" title="Test URL" data-bs-content="This URL is used when you update the API configuration to check when the project has finished being deployed by Vercel." data-bs-placement="top" class="btn"><i class="bi bi-info-circle"></i></button></td></tr>';

    Object.keys(configuration['api']).forEach(function (x) {
        let e = configuration['api'][x]
        table.innerHTML += `<tr><td>${e.endpoint}</td><td>${e.method}</td><td>Edit</td></tr>`;
    })
}

updateURLTable()

function changeAPIEndpointResponseLanguage(select) {
    newURLEditor.session.setMode('ace/mode/' + select.value);
}