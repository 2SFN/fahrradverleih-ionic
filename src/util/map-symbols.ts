/**
 * Utility-Klasse, die statische Icons für Google Maps hält.
 *
 * @see https://developers.google.com/maps/documentation/javascript/reference/marker#Symbol
 */
export default class MapSymbols {
    private static readonly FILL_COLOR_PRIMARY = "#0297DC";

    public static readonly ICON_MARKER_FULL = {
        path: "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z",
        anchor: {x: 12, y: 17},
        fillColor: MapSymbols.FILL_COLOR_PRIMARY,
        fillOpacity: 1,
        labelOrigin: {x: 12, y: 9},
        strokeColor: "white",
        strokeWeight: 2,
        scale: 2
    };

    public static readonly ICON_MARKER_ACCOUNT = {
        path: "M12 2C8.14 2 5 5.14 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.14 15.86 2 12 2M12 4C13.1 4 14 4.9 14 6C14 7.11 13.1 8 12 8S10 7.11 10 6C10 4.9 10.9 4 12 4M12 14C10.33 14 8.86 13.15 8 11.85C8 10.53 10.67 9.8 12 9.8S16 10.53 16 11.85C15.14 13.15 13.67 14 12 14Z",
        anchor: {x: 12, y: 22},
        fillColor: MapSymbols.FILL_COLOR_PRIMARY,
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
        scale: 1.5
    }

    public static readonly ICON_CIRCLE = {
        path: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
        anchor: {x: 12, y: 12},
        fillColor: MapSymbols.FILL_COLOR_PRIMARY,
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
        scale: 1
    }
}