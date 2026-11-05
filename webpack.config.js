import path from 'path';
import { fileURLToPath } from 'url';

import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    performance: {
        maxEntrypointSize: 500000,
        maxAssetSize: 500000
    },
    entry: './bin/mathjsBuild.js',
    devtool: 'source-map',
    output: {
        filename: 'math.js',
        path: path.resolve(__dirname, 'src/lib'),
        library: 'math',
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: 'this'
    },
    mode: 'production'
};
