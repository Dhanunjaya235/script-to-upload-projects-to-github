const simpleGit = require('simple-git');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const githubToken = process.env.GITHUB_TOKEN; // Replace with your GitHub token
if(!githubToken){
    console.error('Please set the GITHUB_TOKEN environment variable.');
    process.exit(1);
}
const octokit = new Octokit({ auth: githubToken });

async function createGitHubRepo(repoName) {
    try {
        const response = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
        });
        return response.data.clone_url;
    } catch (error) {
        console.error('Error creating repository:', error);
    }
}

async function pushToGitHub(repoPath, repoName) {
    const git = simpleGit(repoPath);
    try {
        await git.init();
        await git.add('./*');
        await git.commit('Initial commit');
        const githubUrl = await createGitHubRepo(repoName);
        await git.addRemote('origin', githubUrl);
        await git.push('origin', 'master');
        console.log(`Pushed to GitHub: ${repoName}`);
    } catch (error) {
        console.error('Error pushing to GitHub:', error);
    }
}

function getPocProjects(dirPath) {
    return fs.readdirSync(dirPath).filter(file => {
        return fs.statSync(path.join(dirPath, file)).isDirectory();
    });
}

const pocDir = process.env.DIRECTORY; // Replace with your POCs folder path
if(!pocDir){
    console.error('Please set the DIRECTORY environment variable.');
    process.exit(1);
}
const pocs = getPocProjects(pocDir);

pocs.forEach(poc => {
    const repoPath = path.join(pocDir, poc);
    pushToGitHub(repoPath, poc);
});
