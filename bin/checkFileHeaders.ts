import fs from 'node:fs';

const excludeDirs = ['lib'];
const fileTypes = ['ts', 'js', 'hbs', 'css'];

const headerJS = `/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
`;

const headerHBS = `{{! Author: Jean-Baptiste Louvet-Daniel
   -
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. }}`;

const headerByType: Record<string, string> = {
    js: headerJS,
    ts: headerJS,
    css: headerJS,
    hbs: headerHBS
};

function checkFile(filePath: string) {
    const fileType = filePath.split('.').pop();

    if (fileTypes.includes(fileType)) {
        const header = headerByType[fileType];

        if (!header) {
            throw new Error(`File type not handled : ${fileType} (${filePath})`);
        }

        const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });

        if (fileContents.startsWith(header)) {
            return;
        }

        fs.writeFileSync(filePath, header + '\n' + fileContents, { encoding: 'utf-8' });
        console.log('Written header to ' + filePath);
    } else {
        console.log(`Skipped file ${filePath}`);
    }
}

function scanDir(dirPath: string) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach((file) => {
        const path = file.parentPath + '/' + file.name;
        if (file.isDirectory()) {
            if (!excludeDirs.includes(file.name)) {
                scanDir(path);
            } else {
                console.log(`Skipped directory ${path}`);
            }
        } else {
            checkFile(path);
        }
    });
}

scanDir('./src');
