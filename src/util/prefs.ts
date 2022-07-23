import {singleton} from "tsyringe";
import {Storage} from "@ionic/storage";

/**
 * Einfacher Wrapper für Key-Value storage.
 *
 * Verwendet Ionic's {@link Storage} API.
 *
 * Enthält Konstanten für bestimmte Keys.
 */
@singleton()
export default class Prefs {
    public static readonly KEY_TOKEN = "api-token";

    private storage: Storage | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        this.storage = await new Storage().create();
    }

    public async get(key: string, fallback: any): Promise<any> {
        return (await this.storage?.get(key)) || fallback;
    }

    public async set(key: string, value: any) {
        await this.storage?.set(key, value);
    }
}
