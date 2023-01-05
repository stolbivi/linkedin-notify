import {Controller, Get, Query, Route} from "tsoa";
import * as cheerio from 'cheerio';
import * as Countries from "../data/countries.json"
import * as Cities from "../data/cities.json"
import * as States from "../data/states.json"


@Route("/salary")
export class GlassDoorController extends Controller {

    private readonly BASE = 'https://www.glassdoor.com/Salaries';
    private countries = {} as { [index: string]: number };
    private cities = {} as { [index: string]: { [index: string]: number } };

    constructor() {
        super();
        this.loadDictionary();
    }

    private loadDictionary() {
        console.log('Loading dictionaries started');
        // countries
        for (let i = 0; i < Object.keys(Countries).length; i++) {
            this.countries[Countries[i]] = i + 1
        }
        console.log('Loaded countries:', Object.keys(this.countries).length);
        // cities
        for (let i = 0; i < Object.keys(Cities).length; i++) {
            const entry = Cities[i];
            if (!entry) {
                continue;
            }
            const country = Object.keys(entry)[0].toString();
            if (!this.cities[country]) {
                this.cities[country] = {}
            }
            // @ts-ignore
            const record = entry[country];
            this.cities[country][record.city] = record.code;
        }
        console.debug('Loaded city root levels:', Object.keys(this.cities).length);
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

    @Get("country")
    public async getSalary(@Query() role: string,
                           @Query() country: string,
                           @Query() state?: string,
                           @Query() city?: string): Promise<any> {
        console.log('Getting salary for:', role, country, state, city);
        const countryCode = this.countries[country];
        if (!countryCode) {
            this.setStatus(422);
            return Promise.resolve(`Country nod found: ${country}`);
        }
        const roleNormalized = role.toLowerCase().split(" ").join("-");
        // trying to resolve city and state
        let cityCode: number;
        if (state) {
            // @ts-ignore
            const stateCode = States[state];
            const cityBucket = this.cities[stateCode ? stateCode : country];
            if (cityBucket) {
                cityCode = cityBucket[city];
            }
        }
        const url = cityCode ? this.getCityURL(roleNormalized, cityCode)
            : this.getCountryURL(roleNormalized, countryCode);
        return fetch(url, this.getRequest())
            .then(response => response.text())
            .then(text => this.extractSalary(text, countryCode, cityCode))
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