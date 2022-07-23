import GeopositionT from "@/model/geoposition";
import FahrradTyp from "@/model/fahrradtyp";
import TarifT from "@/model/tarif";

/**
 * Repräsentiert /benutzer/ausliehen
 */
export default class Ausleihe {
    constructor(public id: string,
                public position: GeopositionT,
                public typ: FahrradTyp,
                public tarif: TarifT,
                public von: Date,
                public bis: Date) {}

    /**
     * Ermittelt, ob diese Ausleihe noch aktiv ist, also zurückgegeben werden
     * kann/muss, oder nicht.
     */
    public get aktiv(): boolean {
        return new Date() < this.bis;
    }
}
