import * as Countries from "./countries.json";
import * as Cities from "./cities.json";
import * as Synonyms from "./synonyms.json";

export class Dictionary {

    private static _countries = {} as { [index: string]: number };
    private static _cities = {} as { [index: string]: { [index: string]: number } };

    static get countries(): { [p: string]: number } {
        return this._countries;
    }

    static get cities(): { [p: string]: { [p: string]: number } } {
        return this._cities;
    }

    public static loadDictionary() {
        console.log('Loading dictionaries started');
        // countries
        for (let i = 0; i < Object.keys(Countries).length; i++) {
            Dictionary._countries[Countries[i]] = i + 1
        }
        console.log('Loaded countries:', Object.keys(Dictionary._countries).length);
        // cities
        for (let i = 0; i < Object.keys(Cities).length; i++) {
            const entry = Cities[i];
            if (!entry) {
                continue;
            }
            const country = Object.keys(entry)[0].toString();
            if (!Dictionary._cities[country]) {
                Dictionary._cities[country] = {}
            }
            // @ts-ignore
            const record = entry[country];
            Dictionary._cities[country][record.city] = record.code;
            // @ts-ignore
            const countrySyn = Synonyms[country];
            if (countrySyn) {
                if (!Dictionary._cities[countrySyn]) {
                    Dictionary._cities[countrySyn] = {}
                }
                Dictionary._cities[countrySyn][record.city] = record.code;
            }
        }
        console.debug('Loaded city root levels:', Object.keys(Dictionary._cities).length);
    }
}