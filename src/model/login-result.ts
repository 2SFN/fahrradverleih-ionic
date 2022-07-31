/**
 * Klasse, die das Ergebnis einer Login-Anfrage (/benutzer/auth) repräsentiert.
 */
export default class LoginResult {
    constructor(public ok = false,
                public token: string = "") { }
}
