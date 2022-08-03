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

    public async init() {
        this.storage = await new Storage().create();
    }

    public async get<T>(key: string, fallback: T): Promise<T> {
        return (await this.storage?.get(key)) || fallback;
    }

    public async set<T>(key: string, value: T) {
        await this.storage?.set(key, value);
    }

    public async remove(key: string) {
        await this.storage?.remove(key);
    }
}
