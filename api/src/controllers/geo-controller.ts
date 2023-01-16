import {Controller, Get, Query, Route} from "tsoa";
import {find, setCache} from "geo-tz";
import moment from "moment-timezone";

@Route("/api")
export class GeoController extends Controller {

    private store = new Map();
    private readonly FORMAT_TZ = "ZZ";

    constructor() {
        super();
        setCache({store: this.store, preload: false});
    }

    @Get("find")
    public async find(@Query() lat: number,
                      @Query() lng: number
    ): Promise<any> {
        console.log(`${new Date().toLocaleTimeString()} Finding timezone:`, lat, lng);
        try {
            const timezones = find(lat, lng);
            const timeZoned = moment.tz(timezones[0]);
            const utcOffset = timeZoned.utcOffset();
            const timeZoneFormatted = timeZoned.format(this.FORMAT_TZ);
            return Promise.resolve({
                timezones,
                timeZoneFormatted,
                utcOffset
            });
        } catch (error) {
            const message = error.response
                ? {data: error.response.data, status: error.response.status}
                : {message: error.message};
            this.setStatus(500);
            return Promise.resolve(message);
        }
    }

    @Get("cacheSize")
    public async cacheSize(): Promise<any> {
        try {
            return Promise.resolve({response: this.store.size});
        } catch (error) {
            const message = error.response
                ? {data: error.response.data, status: error.response.status}
                : {message: error.message};
            this.setStatus(500);
            return Promise.resolve(message);
        }
    }

}