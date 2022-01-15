import { getResponseFromConfig } from "../src/api";

export default function createResponse(req, res) {
    getResponseFromConfig(req, res);
}
