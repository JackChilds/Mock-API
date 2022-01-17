/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

// function that checks personal access token and gets username
async function initialConnect() {
    const tokenInput = document.querySelector('#github-token-input');

    const octokit = new Octokit({
        auth : tokenInput.value
    })

    try {
        const {
            data: { login },
        } = await octokit.rest.users.getAuthenticated();

        Cookies.set('github-token', tokenInput.value, { expires: 60, path: '/' });
        Cookies.set('github-username', login, { expires: 60, path: '/' });

        Swal.fire({
            icon: "success",
            text: `Connected to GitHub as ${login}.`,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
        })

        tokenInput.style.borderColor = '#ced4da';

        console.log(`Connected to Github as ${login}`)

        selectRepository(octokit);
    } catch (e) {
        handleError(e);
        tokenInput.style.borderColor = '#ff0000';
    }
}

async function selectRepository(octokit) {
    document.querySelector('#back-btn').outerHTML = '<buton class="btn btn-light mb-4" id="back-btn" onclick="window.location.reload()"><i class="bi bi-caret-left-fill"></i> Back</button>';

    // get repositories from github
    try {
        const {
            data: repos,
        } = await octokit.rest.repos.listForAuthenticatedUser({
            type: 'owner',
            sort: 'updated',
            direction: 'desc',
        });

        let repoList = Array.from(repos.map(repo => {
            return {
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                description: repo.description,
                url: repo.html_url,
            }
        }).values())

        if (repoList.length === 0) {
            // if no repositories are found then display an error, they should have forked the project to their own account and then deployed their own instance on Vercel, so they have write privileges
            Swal.fire({
                icon: "error",
                text: `No repositories found. Please make sure you have forked the project to your own Github account.`,
                showConfirmButton: false,
            })

            return;
        }

        // default list content
        document.querySelector('#repo-list').innerHTML = `
        <li class="list-group-item no-results" style="display: none">
            <i>No results found</i>
        </li>
        `;

        repoList.forEach(async (repo, index) => {
            document.querySelector('#repo-list').innerHTML += `
            <li class="list-group-item repo-list-item" data-repo-name="${repo.name}" data-repo-full-name="${repo.full_name}" data-repo-private="${ repo.private ? "true" : "false" }" style="display: ${ index > 9 ? "none" : "block" };" onclick="repoSelect(this)">
                <div class="hstack gap-2">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${repo.name}</div>
                        ${ repo.description === null ? "<i>No description</i>" : repo.description }
                    </div>
                    <div class="mx-1 repo-list-item-btns align-middle">
                        <i class="bi bi-box-arrow-up-right fs-5" onclick="openNewTab('${repo.url}')"></i>

                        <i class="bi bi-${ repo.private ? "lock-fill" : "unlock-fill" } fs-5"></i>
                    </div>
                </div>
            </li>
            `;

        });

        document.querySelector('#page-2').style.display = 'block';
        document.querySelector('#page-1').style.display = 'none';

    } catch (e) {
        handleError(e);
    }
}

function eraseIntegration() {
    Cookies.remove('github-token', { path: '/' });
    Cookies.remove('github-username', { path: '/' });
    Cookies.remove('github-repo', { path: '/' });
    Cookies.remove('github-branch', { path: '/' });

    Swal.fire({
        icon: "success",
        text: "GitHub integration data removed.",
        showConfirmButton: false
    }).then((r) => {
        window.location.reload();
    })
}

function searchRepoList(input) {
    const filter = input.value.toUpperCase();
    const ul = input.parentNode.getElementsByTagName('ul')[0];
    const li = ul.getElementsByTagName('li');

    let displayed = 0;
    for (let i = 0; i < li.length; i++) {
        if (li[i].classList.contains('no-results'))     continue;
        if (li[i].getAttribute('data-repo-name').toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = 'block';
            displayed++;
        } else {
            li[i].style.display = 'none';
        }
    }

    ul.querySelector('li.no-results').style.display = displayed > 0 ? 'none' : 'block';
}

function openNewTab(url) {
    window.open(url, '_blank');
}

async function repoSelect(el) {
    try {
        const octokit = new Octokit({
            auth: Cookies.get('github-token')
        })

        const {
            data: branches,
        } = await octokit.rest.repos.listBranches({
            owner: el.getAttribute('data-repo-full-name').split('/')[0],
            repo: el.getAttribute('data-repo-full-name').split('/')[1]
        })

        el.parentNode.querySelectorAll('li').forEach(e => { e.classList.remove('active') })
        el.classList.add('active')

        const container = document.querySelector('#repo-selection-container');

        let selectHTML = '<select class="form-select" id="repo-select-branch">';
        branches.forEach(branch => {
            selectHTML += `
            <option value="${branch.name}">${branch.name}</option>
            `;
        })
        selectHTML += `</select>`;

        container.innerHTML = `
        <hr>
        <h2>${el.getAttribute('data-repo-full-name')}</h2>

        <div class="input-group mb-2">
            <label for="repo-select-branch" class="input-group-text">Branch</label>
            ${selectHTML}
        </div>

        <p>The selected branch should be the same as the branch that this deployment is running on</p>

        <button class="btn btn-primary btn-lg"
            onclick="toPage3('${el.getAttribute('data-repo-name')}')">Continue</button>
        `;

        container.classList.add('show')

        window.scrollTo({
            top: container.offsetTop,
            behavior: 'smooth'
        })
    } catch (e) {
        handleError(e)
    }
}

function toPage3(repoName) {
    document.querySelector('#back-btn').outerHTML = '<buton class="btn btn-light mb-4" id="back-btn" onclick="window.location.reload()"><i class="bi bi-caret-left-fill"></i> Back</button>';
    document.querySelector('#page-1').style.display = 'none';
    document.querySelector('#page-2').style.display = 'none';
    document.querySelector('#page-3').style.display = 'block';

    if (repoName !== false) {
        Cookies.set('github-repo', repoName, {
            expires: 60,
            path: '/'
        })

        Cookies.set('github-branch', document.querySelector('#repo-select-branch').value, {
            expires: 60,
            path: '/'
        })
    }

    if (Cookies.get('github-repo') === undefined) {
        // if github-repo cookie is not present then no stored data is available or the integration process was cancelled before completion
        document.querySelector('#page-3').innerHTML += `
            <p class="fs-5 text-secondary mt-2"><i>No stored data available</i></p>
        `;

        return;
    }

    document.querySelector('#page-3').innerHTML += `
    <table class="table mt-3">
        <tr>
            <td>Personal Access Token</td>
            <td>
            ${
                // only show last 6 characters
                "*".repeat(Cookies.get('github-token').length-6) + Cookies.get('github-token').slice(-6)
            }
            </td>
        </tr>
        <tr>
            <td>Username</td>
            <td>${Cookies.get('github-username')}</td>
        </tr>
        <tr>
            <td>Repository</td>
            <td>${Cookies.get('github-repo')}</td>
        </tr>
        <tr>
            <td>Branch</td>
            <td>${Cookies.get('github-branch')}</td>
        </tr>
    </table>
    `;
}

function handleError(e) {
    console.log(e);
    Swal.fire({
        icon: "error",
        title: "An unexpected error occured",
        text: "Your personal access token may be invalid, expired or there may be a network issue. Please try again.",
        footer: "Consult the console for more information.",
        showConfirmButton: false
    })
}