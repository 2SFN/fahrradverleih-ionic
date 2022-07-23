import GeopositionT from "@/model/geoposition";

export default class Station {
    constructor(public id: string,
                public bezeichnung: string,
                public position: GeopositionT,
                public verfuegbar: number) {}
}
