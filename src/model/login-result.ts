/**
 * Klasse, die das Ergebnis einer Login-Anfrage (/benutzer/auth) repräsentiert.
 */
export default class LoginResult {
    constructor(private ok = false,
                public token: string = "") { }
}
