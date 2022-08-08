import TarifT from "@/model/tarif";
import Fahrrad from "@/model/fahrrad";

/**
 * Repräsentiert /benutzer/ausliehen
 */
export default class Ausleihe {
    constructor(public id: string,
                public fahrrad: Fahrrad,
                public tarif: TarifT,
                public von: Date,
                public bis: Date) {}

    /**
     * Ermittelt, ob diese Ausleihe noch aktiv ist, also zurückgegeben werden
     * kann/muss, oder nicht.
     */
    public get aktiv(): boolean {
        return new Date().getTime() < this.bis.getTime();
    }
}
