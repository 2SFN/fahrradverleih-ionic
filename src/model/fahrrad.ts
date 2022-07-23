import GeopositionT from "@/model/geoposition";
import FahrradTyp from "@/model/fahrradtyp";

export default class Fahrrad {
    constructor(public id: string,
                public position: GeopositionT,
                public typ: FahrradTyp) {}
}