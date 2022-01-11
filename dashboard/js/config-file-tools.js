/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

// generate JSON file from configuration and parse json files to configuration compatible object

// why do this?
// the JSON file is generated like this to try to improve the speed at which the data can be gathered from the configuration, instead of having to go through the entire configuration every time because the ids are non descript you can just straight away find the endpoint. also, it improves readability of the file


function generateJSONFile(conf, justJSON=false, suppressErrors=false) {
    if (Object.keys(conf.api).length === 0) {
        if (!suppressErrors) {
            Swal.fire({
                title: 'You have no URLs!',
                text: 'You need to add at least one URL before you can generate a JSON file.',
                icon: 'error',
                showConfirmButton: false
            })
        }
        return "error"
    }

    console.log((conf))

    // make a deep copy of the configuration so it doesn't modify the existing configuration
    let configCopy = JSON.parse(JSON.stringify(conf));

    console.log(configCopy)

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

    const json = JSON.stringify(configCopy);

    if (!justJSON) {
        Swal.fire ({
            text: 'The JSON file has been generated. You can now download it to your computer.',
            icon: 'success',
            confirmButtonText: 'Download'
        }).then((r) => {
            if (r.isConfirmed) {
                // now download the JSON
                var blob = new Blob ([json], { type: "text/json;charset=utf-8" })
                saveAs(blob, "config.json")
            }
        })
    }

    return json;
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