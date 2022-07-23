import RadApi from "@/services/rad-api";
import {singleton} from "tsyringe";
import LoginResult from "@/model/login-result";
import Benutzer from "@/model/benutzer";
import Ausleihe from "@/model/ausleihe";

@singleton()
export default class BenutzerService extends RadApi {

    public async auth(email: string, password: string): Promise<LoginResult> {
        const response = this.post<LoginResult>("/benutzer/auth", {
            email: email,
            secret: password
        });

        if (response === undefined) {
            throw new Error("Authentifizierung: API-Fehler.");
        } else {
            return response;
        }
    }

    public async getBenutzer(): Promise<Benutzer> {
        const res = this.get<Benutzer>("/benutzer/details");
        if (res === undefined) {
            throw new Error("Benutzer: API-Fehler.");
        } else {
            return res;
        }
    }

    public async getAusleihen(): Promise<Ausleihe[]> {
        const res = this.get<Ausleihe[]>("/benutzer/ausleihen");
        if (res === undefined) {
            throw new Error("Benutzer: API-Fehler.");
        } else {
            return res;
        }
    }

}