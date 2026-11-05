/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const chromiumArgs = [
    '--disable-web-security',
    '--ignore-certificate-errors',
    '--disable-infobars',
    '--allow-insecure-localhost',
    '--disable-device-discovery-notifications',
    '--window-size=1600,900'
];

exports.config = {
    output: './output/',
    helpers: {
        Puppeteer: {
            url: 'http://localhost:30000',
            show: true,
            windowSize: '1600x900',
            waitForNavigation: 'networkidle0',
            chrome: {
                executablePath: '/etc/profiles/per-user/linkedfluuuush/bin/chromium',
                args: chromiumArgs
            }
        },
        ResembleHelper: {
            require: 'codeceptjs-resemblehelper',
            screenshotFolder: './screenshots/',
            baseFolder: './expected_data/screenshots/base/',
            diffFolder: './expected_data/screenshots/diff/'
        }
    },
    include: {
        I: './steps_file.js'
    },
    mocha: {
        reporterOptions: {
            reportDir: 'mochaReport'
        }
    },
    bootstrap: null,
    timeout: null,
    teardown: null,
    hooks: [],
    gherkin: {
        features: ['./features/*.feature', './features/**/*.feature'],
        steps: ['./step_definitions/steps.js']
    },
    plugins: {
        screenshotOnFail: {
            enabled: true
        },
        tryTo: {
            enabled: true
        },
        retryFailedStep: {
            enabled: false
        },
        retryTo: {
            enabled: true
        },
        eachElement: {
            enabled: true
        },
        pauseOnFail: {}
    },
    stepTimeout: 0,
    stepTimeoutOverride: [
        {
            pattern: 'wait.*',
            timeout: 0
        },
        {
            pattern: 'amOnPage',
            timeout: 0
        }
    ],
    tests: './*.test.js',
    name: 'custom-system-builder'
};
