import {MAPS_KEY} from "../global";

export class MapsAPI {

    private static readonly BASE = 'https://maps.googleapis.com/maps/api/';

    public getGeocode(location: string): Promise<any> {
        try {
            return fetch(`${MapsAPI.BASE}geocode/json?address=${encodeURIComponent(location)}&key=${MAPS_KEY}`, this.getRequest("GET"))
                .then(async response => {
                    if (!response.ok) {
                        throw new Error(await response.text());
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(error);
                    return {error: error.message};
                })
        } catch (error) {
            console.error(error);
            return Promise.resolve({error: error.message});
        }
    }

    private getRequest(method: "GET" | "POST", body?: any): any {
        return {
            "headers": {
                "accept": "application/json",
                "content-type": "application/json"
            },
            "body": body ? JSON.stringify(body) : null,
            "method": method,
            "mode": "cors",
            "credentials": "omit"
        }
    }

}