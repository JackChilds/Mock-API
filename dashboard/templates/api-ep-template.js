import { getResponseFromConfig } from "{{ srcLocation }}src/getResponseFromConfig";

export default function createResponse(req, res) {
    getResponseFromConfig(req, res);
}