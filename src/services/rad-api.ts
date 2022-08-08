import axios, {AxiosInstance} from "axios";
import Prefs from "@/util/prefs";
import {container, singleton} from "tsyringe";
import dateResponseInterceptor from "@/util/date-response-interceptor";

/**
 * Basisklasse für API-Aufrufe an das Fahrradverleih-Backend.
 *
 * Liefert bei Anfragen unter anderem standardmäßig den 'Token'-Header mit.
 *
 * @see Prefs.KEY_TOKEN
 */
@singleton()
export default class RadApi {
    private static readonly BASE_URL = "http://localhost:3000/api";

    private axios: AxiosInstance;
    private prefs: Prefs = container.resolve(Prefs);

    constructor() {
        this.axios = axios.create({
            baseURL: RadApi.BASE_URL
        });

        // Response-Interceptor, um Date-Strings zu Date-Objekten umzuwandeln
        this.axios.interceptors.response.use(dateResponseInterceptor);

        this.init();
    }

    public async init() {
        const t = await this.prefs.get(Prefs.KEY_TOKEN, "");
        if (t.length > 1)
            this.axios.defaults.headers.common["Token"] = t;
        return this;
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