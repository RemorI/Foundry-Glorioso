import fs from 'node:fs/promises';
import path from 'node:path';

type WikiFile = {
    name: string;
    url: string;
};

type WikiFolder = {
    name: string;
    url?: string;
    files: Array<WikiFile>;
    folders: Array<WikiFolder>;
};

const constants: { WIKI_FOLDER_ROOT?: string } = {
    WIKI_FOLDER_ROOT: undefined
};

function isWikiFolder(a: unknown): a is WikiFolder {
    return a && Array.isArray((a as WikiFolder).files);
}

async function generateStructure(): Promise<WikiFolder> {
    const folder: WikiFolder = {
        name: 'Custom System Builder Wiki',
        url: '/stable/Home',
        files: [],
        folders: []
    };

    const wikiRoots = await fs.readdir(constants.WIKI_FOLDER_ROOT, { withFileTypes: true });

    for (const root of wikiRoots) {
        if (root.isDirectory() && !root.name.startsWith('.')) {
            folder.folders.push(await parseWikiTree('', root.name, path.join(root.name, 'Home')));
        }
    }

    return folder;
}

async function parseWikiTree(basePath: string, folderPath: string, rootWikiUrl?: string): Promise<WikiFolder> {
    const folderName = folderPath.split('.md')[0].split('-').join(' ');

    const treeRoot: WikiFolder = {
        name: folderName,
        url: rootWikiUrl ? '/' + rootWikiUrl : undefined,
        files: [],
        folders: []
    };

    const dirContent = await fs.readdir(path.join(constants.WIKI_FOLDER_ROOT, basePath, folderPath), {
        withFileTypes: true
    });

    for (const file of dirContent) {
        if (file.isDirectory() && !file.name.startsWith('.')) {
            const wikiDir = await parseWikiTree(path.join(basePath, folderPath), file.name);

            if (wikiDir.files.length > 0 || wikiDir.url) {
                treeRoot.folders.push(wikiDir);
            }
        } else if (file.name.endsWith('.md')) {
            const strippedFileName = file.name.split('.md')[0];
            const formattedFileName = strippedFileName.split('-').join(' ');

            treeRoot.files.push({
                name: formattedFileName,
                url: path.join('/', basePath, folderPath, strippedFileName)
            });
        }
    }

    for (const folder of treeRoot.folders) {
        const folderRootFile = treeRoot.files.find((file) => file.name === folder.name);
        if (folderRootFile) {
            folder.url = folderRootFile.url;
            treeRoot.files = treeRoot.files.filter((file) => file.name !== folder.name);
        }
    }

    const homeFile = treeRoot.files.find((file) => file.name === 'Home');
    if (homeFile) {
        treeRoot.url = homeFile.url;
        treeRoot.files = treeRoot.files.filter((file) => file.name !== 'Home');
    }

    return treeRoot;
}

function generateHTML(rootFolder: WikiFolder): string {
    const filesAndFolders: Array<WikiFile | WikiFolder> = [
        ...rootFolder.files.sort((a, b) => a.name.localeCompare(b.name)),
        ...rootFolder.folders.sort((a, b) => {
            if (a.name === 'stable') {
                return -1;
            }

            if (b.name === 'stable') {
                return 1;
            }

            if (a.name === 'beta') {
                return -1;
            }

            if (b.name === 'beta') {
                return 1;
            }

            return a.name.localeCompare(b.name);
        })
    ];

    let list = `<h1><a href="${rootFolder.url}">${rootFolder.name}</a></h1>\n\n`;

    list += `<ul>\n`;
    for (const file of filesAndFolders) {
        const innerSpacing = '  ';
        if (isWikiFolder(file)) {
            list += `${innerSpacing}<li><details${file.name === 'stable' ? ' open' : ''}>\n`;
            list += `${innerSpacing}<summary>${generateLink(file)}</summary>\n`;
            list += generateFolderHTML(file, innerSpacing, file.name === 'stable');

            list += `${innerSpacing}</details></li>\n`;
        } else {
            list += `<li>${generateLink(file)}</li>\n`;
        }
    }

    list += `</ul>\n`;
    return list;
}

function generateFolderHTML(folder: WikiFolder, spacing: string = '', isOpen: boolean = false): string {
    const filesAndFolders: Array<WikiFile | WikiFolder> = [...folder.files, ...folder.folders].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    let list = `${spacing}<ul>\n`;

    for (const file of filesAndFolders) {
        const innerSpacing = `${spacing}  `;
        if (isWikiFolder(file)) {
            list += `${innerSpacing}<li><details${isOpen ? ' open' : ''}>\n`;
            list += `${innerSpacing}<summary>${generateLink(file)}</summary>\n`;
            list += generateFolderHTML(file, innerSpacing, isOpen);

            list += `${innerSpacing}</details></li>\n`;
        } else {
            list += `${innerSpacing}<li>${generateLink(file)}</li>\n`;
        }
    }

    list += `${spacing}</ul>\n`;
    return list;
}

function generateLink(file: WikiFile | WikiFolder): string {
    if (!file.url) {
        return file.name;
    }

    return `<a href="${file.url}"><strong>${file.name}</strong></a>`;
}

constants.WIKI_FOLDER_ROOT = process.argv[2];

if (!constants.WIKI_FOLDER_ROOT) {
    console.error('No root folder specified, exiting');
    process.exit(1);
}

generateStructure()
    .then((wikiRoot) => {
        console.log(generateHTML(wikiRoot));
    })
    .catch((err) => {
        console.error(err);
    });
