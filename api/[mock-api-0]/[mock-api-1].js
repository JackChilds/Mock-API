import { getResponseFromConfig } from "../../src/getResponseFromConfig";

export default function createResponse(req, res) {
    getResponseFromConfig(req, res);
}