import fs from 'fs';

const TRANSLATION_FOLDER = './src/lang';
const REFERENCE_FILE_PATH = TRANSLATION_FOLDER + '/en.json';

const REQUIRED_TRANSLATIONS = ['fr.json', 'de.json'];

const REFERENCE_FILE = JSON.parse(fs.readFileSync(REFERENCE_FILE_PATH, { encoding: 'utf-8' })) as object;

const fileList = fs.readdirSync(TRANSLATION_FOLDER);

let returnCode = 0;

for (const fileName of fileList) {
    const filePath = TRANSLATION_FOLDER + '/' + fileName;

    if (filePath === REFERENCE_FILE_PATH) {
        continue;
    }

    const translationFile = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' })) as object;
    const differences = compareJsonStructure(REFERENCE_FILE, translationFile);

    if (differences.length === 0) {
        console.log(`${fileName} is OK`);
    } else {
        console.log(`${fileName} structure is KO : \n\t${differences.join('\n\t')}\n`);

        const REFERENCE_FILE_CLONED = JSON.parse(JSON.stringify(REFERENCE_FILE)) as object;

        console.log(JSON.stringify(generateDiff(REFERENCE_FILE_CLONED, translationFile)));

        if (REQUIRED_TRANSLATIONS.includes(fileName)) {
            returnCode = 1;
        } else {
            console.log(`File ${fileName} not required to release, proceeding`);
        }
    }
}

process.exit(returnCode);

function compareJsonStructure(jsonRef: object, jsonActual: object, basePath = ''): Array<string> {
    const differences: Array<string> = [];
    const keysRef = Object.keys(jsonRef);
    const keysActual = Object.keys(jsonActual);

    const missingKeys = keysRef.filter((x) => !keysActual.includes(x));
    const addedKeys = keysActual.filter((x) => !keysRef.includes(x));

    differences.push(...missingKeys.map((key) => `Missing key ${basePath}${key}`));
    differences.push(...addedKeys.map((key) => `Added key ${basePath}${key}`));

    for (const key of keysRef) {
        if (keysActual.includes(key)) {
            if (typeof jsonRef[key] === 'object' && typeof jsonActual[key] === 'object') {
                differences.push(
                    ...compareJsonStructure(jsonRef[key] as object, jsonActual[key] as object, `${basePath}${key}.`)
                );
            } else {
                if (typeof jsonRef[key] !== typeof jsonActual[key]) {
                    differences.push(
                        `Type mismatch for key ${basePath}${key}, is ${typeof jsonRef[
                            key
                        ]} in reference and ${typeof jsonActual[key]} in actual`
                    );
                }
            }
        }
    }

    return differences;
}

function generateDiff(jsonRef: object, jsonActual: object) {
    const keysRef = Object.keys(jsonRef);
    const keysActual = Object.keys(jsonActual);

    const sameKeys = keysRef.filter((x) => keysActual.includes(x));

    for (const key of sameKeys) {
        if (typeof jsonRef[key] === 'object' && typeof jsonActual[key] === 'object') {
            jsonRef[key] = generateDiff(jsonRef[key] as object, jsonActual[key] as object);

            if (Object.keys(jsonRef[key] as object).length === 0) {
                delete jsonRef[key];
            }
        } else if (typeof jsonRef[key] === typeof jsonActual[key]) {
            delete jsonRef[key];
        }
    }

    return jsonRef;
}
