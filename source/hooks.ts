import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import os from 'os';
import { IBuildTaskOption, BuildHook, IBuildResult } from '../@types';

// interface IOptions {
// remoteAddress: string;
// enterCocos: string;
// selectTest: string;
// objectTest: {
// number: number;
// string: string;
// boolean: boolean
// },
// arrayTest: [number, string, boolean];
// }
// 

interface IOptions {
    enableCocoaPods: boolean;
}


const PACKAGE_NAME = 'cocos-build-template';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

async function runScriptFile(path: string, pwd: string, dest: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const p = child_process.spawn(path, [dest], {
            shell: true,
            cwd: pwd
        });
        p.stdout.on('data', (data: string) => {
            console.log(`${path}: [log] ${data}`);
        });
        p.stderr.on('data', (data: string) => {
            console.error(`${path}: [error] ${data}`);
        });
        p.on('close', (code) => {
            if (code != 0) {
                return reject();
            }
            resolve();
        });
        p.on('exit', (code) => {
            if (code) {
                return reject();
            }
            return resolve();
        });
        p.on('error', (code, error) => {
            reject();
        });
    })
}


function getNativeDir(platform: string) {
    return path.join(Editor.Project.path, 'native/engine', platform === 'windows' ? 'win64' : platform);
}

function checkScriptFile(hookName: string, nativeDir: string): { error?: string, file: string } {
    const fileWithoutExt = path.join(nativeDir, 'hooks', hookName);
    if (os.platform() === 'win32') {
        const file = fileWithoutExt + '.bat';
        if (!fs.existsSync(file)) {
            return { error: `file ${file} not found!`, file };
        }
        return { file };
    }
    if (fs.existsSync(fileWithoutExt)) {
        return { file: fileWithoutExt };
    }
    const file = fileWithoutExt + ".sh";
    if (fs.existsSync(file)) {
        return { file };
    }
    return { error: `hook ${hookName} not found`, file: fileWithoutExt };
}

function createEmptyHook(hookName: string, nativeDir: string) {
    const fileWithoutExt = path.join(nativeDir, 'hooks', hookName);
    const ext = os.platform() === 'win32' ? '.bat' : '.sh';
    if (!fs.existsSync(path.join(nativeDir, 'hooks'))) {
        fs.mkdirSync(path.join(nativeDir, 'hooks'));
    }
    const full = fileWithoutExt + ext + '.sample';
    if (!fs.existsSync(full)) {
        if (os.platform() !== 'win32') {
            const lines = [
                "#!/bin/bash", "",
                `# ${hookName}`,
                `# arg1: build path`,
                `echo $PWD`,
                `echo $1`
            ];
            fs.writeFileSync(full, lines.join('\n'));
        } else {
            const lines = [
                `:: ${hookName}`,
                `:: arg1: build path`,
                `echo %cd%`,
                `echo %1`
            ];
            fs.writeFileSync(full, lines.join('\n'));
        }
    }
}

export const onBeforeBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
};


export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    const HOOK_NAME = 'after-build';
    const nativeDir = getNativeDir(options.platform);
    if (!fs.existsSync(nativeDir)) {
        console.error(`dir ${nativeDir} does not exist`);
        return;
    }
    const scriptResult = checkScriptFile(HOOK_NAME, nativeDir)
    // copy or overwrite Podsfile
    if (!scriptResult.error) {
        await runScriptFile(scriptResult.file, nativeDir, result.dest);
    } else {
        console.warn(`failed to execute hook: ${HOOK_NAME}. ${scriptResult.error}`);
        createEmptyHook(HOOK_NAME, nativeDir)
        return;
    }
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin bash hooks in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};
