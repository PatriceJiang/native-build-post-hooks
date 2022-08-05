/// <reference types="../../../@types/cc" />
import { AssetManager, JsonAsset } from 'cc';
import { ResourceBundle, ResourceList } from './l10n-options';
export default class ResourceDataManager {
    static instance: ResourceDataManager;
    resourceList?: ResourceList;
    resourceBundle: ResourceBundle;
    readResourceList(): Promise<void>;
    readResourceBundle(tags?: Intl.BCP47LanguageTag[]): Promise<ResourceBundle>;
    editorLoad(locales: Intl.BCP47LanguageTag[]): Promise<ResourceBundle | undefined>;
    runtimeLoad<T>(fileName: string): Promise<T | undefined>;
    previewLoad<T>(urlPath: string): Promise<T | undefined>;
    checkBundle(bundleName: string): Promise<boolean>;
    getBundle(bundleName: string): Promise<AssetManager.Bundle | undefined>;
    getResource(bundle: AssetManager.Bundle, resourceName: string): Promise<JsonAsset | undefined>;
}
