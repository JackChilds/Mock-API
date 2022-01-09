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
            allowOutsideClick: false,
            allowEscapeKey: false,
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
    document.querySelector('#back-btn').outerHTML = '<buton class="btn btn-light mb-4" onclick="window.location.reload()"><i class="bi bi-caret-left-fill"></i> Back</button>';

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
                private: repo.private,
                description: repo.description,
                url: repo.html_url,
            }
        }).values())

        repoList = []

        if (repoList.length === 0) {
            document.querySelector('#repo-list').innerHTML += '<li class="list-group-item">You have no repositories</li>';

            document.querySelector('#repo-list-search-input').setAttribute('disabled', 'disabled');

            document.querySelector('#repo-list').parentElement.innerHTML += '<button class="btn btn-primary w-100" onclick="createRepository()"><i class="bi bi-plus-lg"></i> Create repository</button>';
        }

        repoList.forEach((repo, index) => {
            document.querySelector('#repo-list').innerHTML += `
            <li class="list-group-item repo-list-item" data-repo-name="${repo.name}" style="display: ${ index > 9 ? "none" : "block" };">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${repo.name}</div>
                        ${ repo.description === null ? "<i>No description</i>" : repo.description }
                    </div>
                    <div class="me-2">
                        <a href="${repo.url}" target="_blank" class="btn btn-lg"><i class="bi bi-box-arrow-up-right"></i></a>

                        <i class="bi bi-${ repo.private ? "lock-fill" : "unlock-fill" }"></i>
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

function createRepository() {
    Swal.fire({
        title: 'Create repository'
    })
}

function handleError(e) {
    console.log(e);
    Swal.fire({
        icon: "error",
        title: "An unexpected error occured",
        text: "Your personal access token may be invalid, expired or there may be a network issue. Please try again.",
        footer: "Consult the console for more information.",
        showConfirmButton: false
    });
}