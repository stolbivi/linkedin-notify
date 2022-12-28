import {Controller, Get, Query, Route} from "tsoa";

@Route("/api")
export class RecordsController extends Controller {

    constructor() {
        super();
    }

    @Get("ai")
    public async check(@Query() request: string): Promise<any> {
        console.log(`${new Date().toLocaleTimeString()} Running query`);
        // console.error(error);
        // this.setStatus(422);
        // return {message: error};
        return {response: "OK"};
    }

}