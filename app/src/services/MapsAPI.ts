import {MAPS_KEY} from "../global";
import {BaseAPI} from "./BaseAPI";

export class MapsAPI extends BaseAPI {

    private static readonly BASE = 'https://maps.googleapis.com/maps/api/';

    public getGeocode(location: string): Promise<any> {
        return this.fetchRequest(
            `${MapsAPI.BASE}geocode/json?address=${encodeURIComponent(location)}&key=${MAPS_KEY}`,
            this.getRequest("GET")
        );
    }

}