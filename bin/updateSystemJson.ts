/*global process*/
import fs from 'fs';

type BasicManifest = {
    version: string;
    id: string;
    title: string;
    manifest: string;
    download: string;
};

if (process.argv.length < 3) {
    console.error('This script needs one argument : the new version');
    process.exit(1);
}
const newVersion = process.argv[2];

const system = JSON.parse(fs.readFileSync('./system.json', { encoding: 'utf-8' })) as BasicManifest;

const envData: Record<string, { id: string; title: string; manifest: string; download: string }> = {
    beta: {
        id: 'custom-system-builder-beta',
        title: 'Custom System Builder - Beta Version',
        manifest: 'https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/beta/raw/out/system.json?job=build-beta',
        download:
            'https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/beta/raw/out/custom-system-builder.zip?job=build-beta'
    },
    unstable: {
        id: 'custom-system-builder-unstable',
        title: 'Custom System Builder - Unstable Version',
        manifest:
            'https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/develop/raw/out/system.json?job=build-unstable',
        download:
            'https://gitlab.com/api/v4/projects/31995966/jobs/artifacts/develop/raw/out/custom-system-builder.zip?job=build-unstable'
    }
};

system.version = newVersion;
system.download = `https://gitlab.com/custom-system-builder/custom-system-builder/-/releases/${newVersion}/downloads/custom-system-builder.zip`;

if (process.argv.length === 4) {
    const suffix = process.argv[3];

    if (!Object.keys(envData).includes(suffix)) {
        console.error(`Provided suffix "${suffix}" is not valid`);
        process.exit(1);
    }

    system.id = envData[suffix].id;
    system.title = envData[suffix].title;
    system.manifest = envData[suffix].manifest;
    system.download = envData[suffix].download;
}

fs.writeFileSync('./system.json', JSON.stringify(system, null, 4));
