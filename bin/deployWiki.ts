import { execSync } from 'child_process';
import fs, { cpSync, readFileSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { chdir } from 'process';

function copyDir(src: string, dest: string, ignoreList: string[] = []) {
    const entries = fs
        .readdirSync(src, {
            recursive: true,
            withFileTypes: true
        })
        .filter((entry) => {
            return !ignoreList.some((ignorePath) => {
                const filePath = path.join(entry.parentPath, entry.name);
                return filePath.includes(ignorePath);
            });
        });

    for (const entry of entries) {
        const srcPath = path.join(entry.parentPath, entry.name);
        const destPath = srcPath.replace(src, dest);
        const destDir = path.dirname(destPath);

        if (entry.isFile()) {
            console.log('Copying ' + srcPath + ' to ' + destPath);

            fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const languages: Record<string, { name: string; flag: string; label: string; languageTitle: string }> = {
    en: {
        name: 'English',
        flag: 'uk.png',
        label: 'English version',
        languageTitle: 'Languages'
    },
    fr: {
        name: 'Français',
        flag: 'fr.png',
        label: 'Version française',
        languageTitle: 'Langues'
    }
    // de: {
    //     name: 'Deutsch',
    //     flag: 'de.png',
    //     label: 'Deutsche Version',
    //     languageTitle: 'Sprache',
    // },
};

function getLanguageLinksHTML(baseLanguage: string, filePath: string, subDirectory: string) {
    if (!Object.keys(languages).includes(baseLanguage)) {
        baseLanguage = 'en';
    }

    const linksArray = [];

    for (const langKey of Object.keys(languages).sort()) {
        const languageData = languages[langKey];

        const link = (subDirectory ? `/${subDirectory}` : '') + `/${langKey}/${filePath}`;

        linksArray.push(
            `<a href="${link}"><img src="${subDirectory ? `/${subDirectory}` : ''}/flags/${languageData.flag}" title="${
                languageData.label
            }" alt="${languageData.name}"></img></a>`
        );
    }

    return `<details><summary>${languages[baseLanguage].languageTitle}</summary>${linksArray.join('')}</details>`;
}

/**
 *
 * @param {string} baseDir
 * @param {string} currentDir
 * @param {string} subDirectory Root subdirectory
 */
function addLanguageLinks(baseDir: string, currentDir: string, subDirectory: string) {
    for (const file of fs.readdirSync(currentDir, { encoding: 'utf-8' })) {
        const filePath = path.join(currentDir, file);

        if (file.endsWith('.md')) {
            const relativeFilePath = filePath.split(path.sep).slice(1).join('/').slice(0, -3);

            console.log('Generating links for ' + filePath + ' ; ' + relativeFilePath);

            const fileData =
                getLanguageLinksHTML(baseDir, relativeFilePath, subDirectory) +
                '\n\n' +
                fs.readFileSync(filePath, { encoding: 'utf-8' });

            fs.writeFileSync(filePath, fileData);
        } else if (fs.lstatSync(filePath).isDirectory()) {
            addLanguageLinks(baseDir, filePath, subDirectory);
        }
    }
}

function getAllMajorVersion() {
    return execSync('git tag -l --sort -creatordate', { encoding: 'utf-8' })
        .split('\n')
        .filter((tag) => !tag.includes('-rc'))
        .map((tag) => tag.split('.').slice(0, 2).join('.'));
}

function getVersionTag() {
    return getAllMajorVersion()[0];
}

function copyWikiVersionIfNeeded() {
    const currentVersion = getVersionTag();

    try {
        const existingWikiVersion = readFileSync('wikiOutput/stable/version', { encoding: 'utf-8' });

        if (currentVersion !== existingWikiVersion) {
            console.log(`New tag ${currentVersion} detected, moving current wiki to version ${existingWikiVersion}`);
            copyDir('wikiOutput/stable', path.join('wikiOutput', existingWikiVersion));
        } else {
            console.log('No new tag, deploying in place');
        }
    } catch (err) {
        console.error('An error occured when trying to move the existing wiki version', err);
    }
}

async function main() {
    const wikiVersion = process.argv[2] ?? 'stable';

    if (wikiVersion === 'stable') {
        copyWikiVersionIfNeeded();
    }

    const targetDir = path.join('wikiOutput', wikiVersion);

    const currentDir = process.cwd();

    rmSync(targetDir, { recursive: true, force: true });
    copyDir('docs', targetDir, ['.gitlab']);
    chdir(targetDir);

    for (const languageKey of Object.keys(languages)) {
        addLanguageLinks(languageKey, languageKey, wikiVersion);
    }

    chdir(currentDir);

    if (wikiVersion === 'stable') {
        console.log('Copying main Home.md file');
        cpSync(`${targetDir}/Home.md`, 'wikiOutput/Home.md');

        const mainHomeContents = fs.readFileSync('wikiOutput/Home.md', { encoding: 'utf-8' });
        const mainHomeWithStableLinks = mainHomeContents.replace(/\.\//g, './stable/');
        fs.writeFileSync('wikiOutput/Home.md', mainHomeWithStableLinks);

        const currentVersion = getVersionTag();

        console.log(`Writing version ${currentVersion} in stable/version`);
        writeFileSync(`${targetDir}/version`, currentVersion);
    }
}

main()
    .then(() => {
        console.log('Done');
    })
    .catch((err) => {
        console.error(err);
    });
