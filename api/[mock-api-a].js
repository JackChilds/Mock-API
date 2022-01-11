import { getResponseFromConfig } from "../core/api";

export default function createResponse(req, res) {
    getResponseFromConfig(req, res);
}