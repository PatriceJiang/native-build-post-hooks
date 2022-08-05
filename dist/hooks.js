"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const os_1 = __importDefault(require("os"));
const PACKAGE_NAME = 'cocos-build-template';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
function runScriptFile(path, pwd, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const p = child_process_1.default.spawn(path, [dest], {
                shell: true,
                cwd: pwd
            });
            p.stdout.on('data', (data) => {
                console.log(`${path}: [log] ${data}`);
            });
            p.stderr.on('data', (data) => {
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
        });
    });
}
function getNativeDir(platform) {
    return path_1.default.join(Editor.Project.path, 'native/engine', platform === 'windows' ? 'win64' : platform);
}
function checkScriptFile(hookName, nativeDir) {
    const fileWithoutExt = path_1.default.join(nativeDir, 'hooks', hookName);
    if (os_1.default.platform() === 'win32') {
        const file = fileWithoutExt + '.bat';
        if (!fs_1.default.existsSync(file)) {
            return { error: `file ${file} not found!`, file };
        }
        return { file };
    }
    if (fs_1.default.existsSync(fileWithoutExt)) {
        return { file: fileWithoutExt };
    }
    const file = fileWithoutExt + ".sh";
    if (fs_1.default.existsSync(file)) {
        return { file };
    }
    return { error: `hook ${hookName} not found`, file: fileWithoutExt };
}
function createEmptyHook(hookName, nativeDir) {
    const fileWithoutExt = path_1.default.join(nativeDir, 'hooks', hookName);
    const ext = os_1.default.platform() === 'win32' ? '.bat' : '.sh';
    if (!fs_1.default.existsSync(path_1.default.join(nativeDir, 'hooks'))) {
        fs_1.default.mkdirSync(path_1.default.join(nativeDir, 'hooks'));
    }
    const full = fileWithoutExt + ext + '.sample';
    if (!fs_1.default.existsSync(full)) {
        if (os_1.default.platform() !== 'win32') {
            const lines = [
                "#!/bin/bash", "",
                `# ${hookName}`,
                `# arg1: build path`,
                `echo $PWD`,
                `echo $1`
            ];
            fs_1.default.writeFileSync(full, lines.join('\n'));
        }
        else {
            const lines = [
                `:: ${hookName}`,
                `:: arg1: build path`,
                `echo %cd%`,
                `echo %1`
            ];
            fs_1.default.writeFileSync(full, lines.join('\n'));
        }
    }
}
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const HOOK_NAME = 'after-build';
        const nativeDir = getNativeDir(options.platform);
        if (!fs_1.default.existsSync(nativeDir)) {
            console.error(`dir ${nativeDir} does not exist`);
            return;
        }
        const scriptResult = checkScriptFile(HOOK_NAME, nativeDir);
        // copy or overwrite Podsfile
        if (!scriptResult.error) {
            yield runScriptFile(scriptResult.file, nativeDir, result.dest);
        }
        else {
            console.warn(`failed to execute hook: ${HOOK_NAME}. ${scriptResult.error}`);
            createEmptyHook(HOOK_NAME, nativeDir);
            return;
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Unload cocos plugin bash hooks in builder.`);
    });
};
exports.unload = unload;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.warn(`${PACKAGE_NAME} run onError`);
    });
};
exports.onError = onError;
//# sourceMappingURL=hooks.js.map