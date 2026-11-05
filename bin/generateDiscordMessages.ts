import fs from 'fs';

const rawChangelogContents = fs.readFileSync('./CHANGELOG.md', 'utf-8');
const changelogContents = rawChangelogContents
    .split(/\n## /)[1]
    .split('\n')
    .slice(1)
    .filter((line) => line !== '')
    .map((line) => {
        if (line.startsWith('#')) {
            return `**${line.replace(/#/g, '').trim()}**\n`;
        }

        return line;
    })
    .join('\n');

const versionNumber = rawChangelogContents.split('##')[1].split('\n').shift().trim();

const discordEnMessage = `**Version ${versionNumber} is now generally available, with the following changes : **

${changelogContents}

Full documentation : https://gitlab.com/custom-system-builder/custom-system-builder/-/wikis/stable/en/Home

If you encounter any issue with this new version, please post an issue on Gitlab : https://gitlab.com/custom-system-builder/custom-system-builder/-/issues/new

Enjoy !`;

const discordFrMessage = `**La version ${versionNumber} est maintenant disponible, avec les changements suivants : **

${changelogContents}

Documentation complète (en anglais, désolé) : https://gitlab.com/custom-system-builder/custom-system-builder/-/wikis/stable/en/Home

Si vous rencontrez des problèmes avec cette version, n'hésitez pas à ouvrir un ticket sur Gitlab : https://gitlab.com/custom-system-builder/custom-system-builder/-/issues/new

Enjoy !`;

console.log(discordEnMessage);

console.log(`
==================================
`);

console.log(discordFrMessage);
