import {Controller, Get, Query, Route} from "tsoa";
import {find, setCache} from "geo-tz";
import moment from "moment-timezone";

@Route("/api")
export class GeoController extends Controller {

    private store = new Map();
    private readonly FORMAT = "DD.MM.YYYY HH:mm:ss ZZ";
    private readonly FORMAT_TIME = "HH:mm ZZ";
    private readonly FORMAT_DDDD = "dddd";

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
            const timeFull = moment.tz(timezones[0]).format(this.FORMAT);
            const time = moment.tz(timezones[0]).format(this.FORMAT_TIME);
            const dayOfWeek = moment.tz(timezones[0]).format(this.FORMAT_DDDD);
            return Promise.resolve({
                timezones,
                timeFull,
                timeFormatted: `${dayOfWeek.substring(0, 3)}, ${time}`
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