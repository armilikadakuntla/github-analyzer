let repositories = [];

let languageChart;
let repoChart;


// ANALYZE USER

async function analyzeUser() {

    const username =
        document.getElementById("username").value.trim();

    const error =
        document.getElementById("error");

    const loading =
        document.getElementById("loading");

    const dashboard =
        document.getElementById("dashboard");


    if (username === "") {

        error.textContent =
            "Please enter a GitHub username.";

        return;
    }


    error.textContent = "";

    loading.style.display = "block";

    dashboard.style.display = "none";


    try {

        // Fetch profile

        const profileResponse =
            await fetch(
                `https://api.github.com/users/${username}`
            );


        if (!profileResponse.ok) {

            throw new Error(
                "GitHub user not found."
            );

        }


        const profile =
            await profileResponse.json();


        // Fetch repositories

        const repoResponse =
            await fetch(
                `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
            );


        repositories =
            await repoResponse.json();


        displayProfile(profile);

        displayRepositories();

        createLanguageChart();

        createRepositoryChart();

        calculateScore(profile, repositories);


        dashboard.style.display = "block";


    } catch (err) {

        error.textContent =
            err.message;

    }


    loading.style.display = "none";
}



// DISPLAY PROFILE

function displayProfile(profile) {

    document.getElementById("avatar").src =
        profile.avatar_url;


    document.getElementById("name").textContent =
        profile.name || profile.login;


    document.getElementById("bio").textContent =
        profile.bio || "No bio available";


    document.getElementById("repos").textContent =
        profile.public_repos;


    document.getElementById("followers").textContent =
        profile.followers;


    document.getElementById("following").textContent =
        profile.following;


    document.getElementById("githubLink").href =
        profile.html_url;


    const created =
        new Date(profile.created_at);


    const today =
        new Date();


    const years =
        today.getFullYear() -
        created.getFullYear();


    document.getElementById("age").textContent =
        years + " yrs";
}



// DISPLAY REPOSITORIES

function displayRepositories() {

    const container =
        document.getElementById("repoList");


    container.innerHTML = "";


    repositories
        .slice(0, 10)
        .forEach(repo => {

            const div =
                document.createElement("div");


            div.className = "repo";


            div.innerHTML = `

                <div>

                    <h3>
                        ${repo.name}
                    </h3>

                    <p>
                        ${repo.description || "No description"}
                    </p>

                    <p>
                        ${repo.language || "Unknown"}
                    </p>

                </div>


                <div class="repo-stats">

                    <span>
                        ⭐ ${repo.stargazers_count}
                    </span>

                    <span>
                        🍴 ${repo.forks_count}
                    </span>

                </div>

            `;


            container.appendChild(div);

        });
}



// LANGUAGE ANALYSIS

function createLanguageChart() {

    const languages = {};


    repositories.forEach(repo => {

        if (repo.language) {

            languages[repo.language] =
                (languages[repo.language] || 0) + 1;

        }

    });


    const labels =
        Object.keys(languages);


    const values =
        Object.values(languages);


    if (languageChart) {

        languageChart.destroy();

    }


    languageChart =
        new Chart(

            document.getElementById(
                "languageChart"
            ),

            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values

                    }]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }

        );

}



// REPOSITORY CHART

function createRepositoryChart() {

    const topRepos =
        [...repositories]

        .sort(
            (a, b) =>
                b.stargazers_count -
                a.stargazers_count
        )

        .slice(0, 5);


    const labels =
        topRepos.map(repo => repo.name);


    const stars =
        topRepos.map(
            repo => repo.stargazers_count
        );


    if (repoChart) {

        repoChart.destroy();

    }


    repoChart =
        new Chart(

            document.getElementById(
                "repoChart"
            ),

            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [{

                        label: "Stars",

                        data: stars

                    }]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}



// SCORE

function calculateScore(profile, repos) {

    let score = 0;


    // Activity

    score +=
        Math.min(
            profile.public_repos * 1.5,
            30
        );


    // Followers

    score +=
        Math.min(
            profile.followers / 10,
            20
        );


    // Stars

    const totalStars =
        repos.reduce(
            (sum, repo) =>
                sum + repo.stargazers_count,
            0
        );


    score +=
        Math.min(
            totalStars / 5,
            25
        );


    // Documentation

    const documented =
        repos.filter(
            repo => repo.has_pages ||
                    repo.description
        ).length;


    score +=
        Math.min(
            documented,
            25
        );


    score =
        Math.min(
            Math.round(score),
            100
        );


    document.getElementById("score")
        .textContent =
        score + "/100";


    document.getElementById("scoreCircle")
        .textContent =
        score;


    document.getElementById("scoreText")
        .textContent =
        getScoreMessage(score);

}



// SCORE MESSAGE

function getScoreMessage(score) {

    if (score >= 80)
        return "Excellent GitHub activity";

    if (score >= 60)
        return "Strong GitHub presence";

    if (score >= 40)
        return "Good foundation";

    return "Room for improvement";
}



// SORT REPOSITORIES

function sortRepositories() {

    const value =
        document.getElementById(
            "repoFilter"
        ).value;


    if (value === "stars") {

        repositories.sort(
            (a, b) =>
                b.stargazers_count -
                a.stargazers_count
        );

    }


    if (value === "forks") {

        repositories.sort(
            (a, b) =>
                b.forks_count -
                a.forks_count
        );

    }


    if (value === "updated") {

        repositories.sort(
            (a, b) =>
                new Date(b.updated_at) -
                new Date(a.updated_at)
        );

    }


    displayRepositories();

}



// DARK MODE BUTTON

document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light"
            );

        }
    );



// ENTER KEY SEARCH

document
    .getElementById("username")
    .addEventListener(
        "keypress",
        function(event) {

            if (event.key === "Enter") {

                analyzeUser();

            }

        }
    );

    function calculateRepositoryHealth(repo) {

    let score = 0;

    if (repo.description) {
        score += 20;
    }

    if (repo.has_wiki) {
        score += 10;
    }

    score += Math.min(repo.stargazers_count * 2, 20);

    score += Math.min(repo.forks_count * 2, 15);

    const updated = new Date(repo.updated_at);
    const now = new Date();

    const days =
        (now - updated) /
        (1000 * 60 * 60 * 24);

    if (days <= 30) {
        score += 20;
    } else if (days <= 90) {
        score += 15;
    } else {
        score += 5;
    }

    return Math.min(score, 100);
}
function calculateQualityScore(repo) {

    let documentation = 0;
    let maintenance = 0;
    let community = 0;
    let popularity = 0;


    // -----------------------
    // DOCUMENTATION
    // -----------------------

    if (repo.description) {
        documentation += 20;
    }

    if (repo.has_wiki) {
        documentation += 10;
    }

    // GitHub doesn't directly give us
    // README existence in the repository
    // list endpoint, so don't pretend it does.

    documentation =
        Math.min(documentation, 30);


    // -----------------------
    // MAINTENANCE
    // -----------------------

    const updated =
        new Date(repo.updated_at);

    const today =
        new Date();

    const days =
        (today - updated) /
        (1000 * 60 * 60 * 24);


    if (days <= 30) {

        maintenance = 30;

    } else if (days <= 90) {

        maintenance = 25;

    } else if (days <= 180) {

        maintenance = 18;

    } else if (days <= 365) {

        maintenance = 10;

    } else {

        maintenance = 5;

    }


    // -----------------------
    // COMMUNITY
    // -----------------------

    community += Math.min(
        repo.forks_count * 2,
        15
    );

    community += Math.min(
        repo.open_issues_count,
        10
    );


    // -----------------------
    // POPULARITY
    // -----------------------

    popularity += Math.min(
        repo.stargazers_count * 2,
        20
    );


    // -----------------------
    // TOTAL
    // -----------------------

    const total =
        documentation +
        maintenance +
        community +
        popularity;


    return {
        documentation,
        maintenance,
        community,
        popularity,
        total: Math.min(total, 100)
    };
}