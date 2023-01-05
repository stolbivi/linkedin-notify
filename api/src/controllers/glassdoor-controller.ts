import {Controller, Get, Query, Route} from "tsoa";
import {Cache} from "../data/cache";
import * as cheerio from 'cheerio';
import * as States from "../data/states.json"
import {Dictionary} from "../data/dictionary";


@Route("/salary")
export class GlassDoorController extends Controller {

    private readonly BASE = 'https://www.glassdoor.com/Salaries';

    constructor() {
        super();
    }

    private getCountryURL(role: string, countryCode: number) {
        return `${this.BASE}/${role}-salary-SRCH_IN${countryCode}_KO0,${role.length}.htm`;
    }

    private getCityURL(role: string, cityCode: number) {
        return `${this.BASE}/${role}-salary-SRCH_IM${cityCode}_KO0,${role.length}.htm`;
    }

    private extractSalary(text: string, countryCode: number, cityCode: number) {
        const $ = cheerio.load(text);
        const formattedPay = $('span[data-test=formatted-pay]').text();
        const payPeriodAnnual = $('span[data-test=pay-period-ANNUAL]')
            .map((_, e) => $(e).text()).toArray();
        const allSpansM0 = $('span.m-0')
            .map((_, e) => $(e).text()).toArray();
        const payDistribution = [allSpansM0[3], allSpansM0[1], allSpansM0[2], allSpansM0[4]];
        const note = $('span .m-0').text();
        const result = {
            formattedPay,
            payPeriodAnnual,
            payDistribution,
            note
        }
        return {
            result,
            countryCode,
            cityCode
        };
    }

    private extractUrl(role: string, state: string, country: string, city: string, countryCode: number) {
        const roleNormalized = role.toLowerCase().split(" ").join("-");
        // trying to resolve city and state
        let cityCode: number;
        if (state) {
            // @ts-ignore
            const stateCode = States[state];
            const cityBucket = Dictionary.cities[stateCode ? stateCode : country];
            if (cityBucket) {
                cityCode = cityBucket[city];
            }
        }
        const url = cityCode ? this.getCityURL(roleNormalized, cityCode)
            : this.getCountryURL(roleNormalized, countryCode);
        return {cityCode, url};
    }

    @Get("get")
    public async getSalary(@Query() role: string,
                           @Query() country: string,
                           @Query() state?: string,
                           @Query() city?: string): Promise<any> {
        console.log('Getting salary for:', role, country, state, city);
        const countryCode = Dictionary.countries[country];
        if (!countryCode) {
            this.setStatus(422);
            return Promise.resolve(`Country not found: ${country}`);
        }
        let {cityCode, url} = this.extractUrl(role, state, country, city, countryCode);
        if (Cache.instance.has(url)) {
            console.log("Returning cached value for:", url);
            return Promise.resolve(Cache.instance.get(url));
        } else {
            console.log("No cached value for:", url);
            return fetch(url, this.getRequest())
                .then(response => response.text())
                .then(text => {
                    const result = this.extractSalary(text, countryCode, cityCode)
                    Cache.instance.set(url, result);
                    return result;
                });
        }
    }

    @Get("evoke")
    public async evokeCache(@Query() role: string,
                            @Query() country: string,
                            @Query() state?: string,
                            @Query() city?: string): Promise<any> {
        const countryCode = Dictionary.countries[country];
        if (!countryCode) {
            this.setStatus(422);
            return Promise.resolve(`Country not found: ${country}`);
        }
        let {url} = this.extractUrl(role, state, country, city, countryCode);
        if (Cache.instance.has(url)) {
            console.log("Evoking cached value for:", url);
            Cache.instance.del(url);
        }
    }

    private getRequest(): any {
        return {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9,ru;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        }
    }

}