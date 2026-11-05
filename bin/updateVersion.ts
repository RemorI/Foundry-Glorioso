import fs from 'fs';

type BasicManifest = {
    version: string;
    download: string;
};

type BasicPackage = {
    version: string;
};

const systemJson = JSON.parse(fs.readFileSync('./system.json', { encoding: 'utf-8' })) as BasicManifest;
const packageJson = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' })) as BasicPackage;

if (process.argv.length !== 3) {
    console.error('This script needs one argument : the new version');
    process.exit(1);
}

const newVersion = process.argv[2];

packageJson.version = newVersion;
systemJson.version = newVersion;
systemJson.download = `https://gitlab.com/custom-system-builder/custom-system-builder/-/releases/${newVersion}/downloads/custom-system-builder.zip`;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));
fs.writeFileSync('./system.json', JSON.stringify(systemJson, null, 4));

let changelogContents = fs.readFileSync('./CHANGELOG.md', 'utf-8');
changelogContents = changelogContents.replace(new RegExp(`## ${newVersion} - UNRELEASED`), `## ${newVersion}`);
fs.writeFileSync('./CHANGELOG.md', changelogContents);
