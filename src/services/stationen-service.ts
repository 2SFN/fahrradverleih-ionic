import RadApi from "@/services/rad-api";
import {singleton} from "tsyringe";
import Station from "@/model/station";
import Fahrrad from "@/model/fahrrad";

@singleton()
export default class StationenService extends RadApi {

    public async getStationen(): Promise<Station[]> {
        const res = this.get<Station[]>("/stationen");
        if (res === undefined) {
            throw new Error("Stationen: API-Fehler.");
        } else {
            return res;
        }
    }

    public async getRaeder(stationId: string): Promise<Fahrrad[]> {
        const res = this.get<Fahrrad[]>(`/stationen/${stationId}/raeder`);
        if (res === undefined) {
            throw new Error("Fahrräder: API-Fehler.");
        } else {
            return res;
        }
    }

}