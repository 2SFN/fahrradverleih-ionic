import axios, {AxiosInstance} from "axios";
import Prefs from "@/util/prefs";
import {container} from "tsyringe";

/**
 * Basisklasse für API-Aufrufe an das Fahrradverleih-Backend.
 *
 * Liefert bei Anfragen unter anderem standardmäßig den 'Token'-Header mit.
 *
 * @see Prefs.KEY_TOKEN
 */
export default class RadApi {
    private static readonly BASE_URL = "http://localhost:3000/api";

    private axios: AxiosInstance;
    private prefs: Prefs = container.resolve(Prefs);

    constructor() {
        this.axios = axios.create({
            baseURL: RadApi.BASE_URL
        });

        this.init();
    }

    private async init() {
        this.axios.defaults.headers.common["Token"] = await this.prefs.get(Prefs.KEY_TOKEN, "");
    }

    protected async get<T>(url: string, params?: any): Promise<T> {
        const response = await this.axios.get(url, params);
        return response.data;
    }

    protected async post<T>(url: string, params?: any): Promise<T> {
        const response = await this.axios.post(url, params);
        return response.data;
    }

    protected async put<T>(url: string, params?: any): Promise<T> {
        const response = await this.axios.put(url, params);
        return response.data;
    }

    protected async delete<T>(url: string, params?: any): Promise<T> {
        const response = await this.axios.delete(url, params);
        return response.data;
    }
}