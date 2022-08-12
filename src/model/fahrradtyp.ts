import TarifT from "./tarif";

export default class FahrradTyp {
    constructor(
        public bezeichnung: string = "",
        public tarif: TarifT) {}

    public toString() {
        return `${this.bezeichnung} (${this.tarif.toString()})`;
    }

    public asObject() {
        return {
            bezeichnung: this.bezeichnung,
            tarif: this.tarif
        };
    }
}