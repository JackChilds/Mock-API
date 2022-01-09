/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

import { Octokit, App } from "https://cdn.skypack.dev/octokit";

// make the imports accessible from window
window.Octokit = Octokit;
window.App = App;