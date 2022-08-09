import RadApi from "@/services/rad-api";
import {singleton} from "tsyringe";
import LoginResult from "@/model/login-result";
import Benutzer from "@/model/benutzer";
import Ausleihe from "@/model/ausleihe";

@singleton()
export default class BenutzerService extends RadApi {

    public async login(email: string, password: string): Promise<LoginResult> {
        return this.post<LoginResult>("/benutzer/login", {
            email: email,
            secret: password
        });
    }

    public async auth(): Promise<LoginResult> {
        return this.get<LoginResult>("/benutzer/auth", {});
    }

    public async getBenutzer(): Promise<Benutzer> {
        return this.get<Benutzer>("/benutzer/details");
    }

    public async setBenutzer(benutzer: Benutzer): Promise<void> {
        return this.post("/benutzer/details", benutzer);
    }

    public async getAusleihen(): Promise<Ausleihe[]> {
        return this.get<Ausleihe[]>("/benutzer/ausleihen");
    }

    public async neueAusleihe(rad_id: string, von: Date, bis: Date): Promise<Ausleihe> {
        return this.post("/benutzer/ausleihen/neu", {
            fahrrad: {id: rad_id},
            von: von,
            bis: bis
        });
    }

    public endeAusleihe(ausleihe_id: string, station_id: string): Promise<Ausleihe> {
        return this.post("/benutzer/ausleihen/ende", {
            ausleihe: { id: ausleihe_id },
            station: { id: station_id }
        });
    }

}