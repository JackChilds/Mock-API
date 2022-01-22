/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

import { getResponseFromConfig } from "{{ srcLocation }}src/getResponseFromConfig";

export default function createResponse(req, res) {
    getResponseFromConfig(req, res);
}