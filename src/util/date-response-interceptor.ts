import {AxiosResponse} from "axios";

/**
 * Axios Response-Interceptor, welcher die Felder des verarbeiteten Antwort-Objekts
 * prüft, und Werte die im serialisierten Datumsformat vorliegen zu 'echten'
 * Date-Instanzen umwandelt.
 *
 * Externe Links:
 * https://stackoverflow.com/a/66238542/3516434
 * https://dev.to/charlintosh/setting-up-axios-interceptors-react-js-typescript-12k5
 *
 * @param res Axios Antwort-Objekt.
 */
export default function dateResponseInterceptor(res: AxiosResponse): AxiosResponse {
    parseDates(res.data);
    return res;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

function parseDates(body: any) {
    if(body === null || body === undefined || typeof body !== "object") return body;
    Object.keys(body).forEach(key => {
        const value = body[key];
        if(isIsoDateString(value)) body[key] = new Date(value);
        else if(typeof value === "object") parseDates(value);
    });
}

function isIsoDateString(val: any): boolean {
    return val && typeof val === "string" && ISO_DATE_PATTERN.test(val);
}
