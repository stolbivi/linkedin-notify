import {Body, Controller, Post, Route} from "tsoa";
import {Cache} from "../data/cache";
import * as cheerio from 'cheerio';
import * as States from "../data/states.json"
import {Dictionary} from "../data/dictionary";
import * as Synonyms from "../data/synonyms.json";
import moment from 'moment';
import axios from "axios";

const url = require("url");

interface SalaryRequestBase {
    title: string
    country: string
    state: string
    city: string
}

interface SalaryRequest extends SalaryRequestBase {
    urn: string
    name: string
    universalName: string
    entityUrn: string
    url: string
    startMonth: number
    startYear: number
    endMonth?: number
    endYear?: number
}

interface TestGetRequest {
    url: string
    headers?: any
}

const GROWTH_FACTOR = 1.05;

@Route("/api")
export class GlassDoorController extends Controller {

    private readonly BASE = 'https://www.glassdoor.com/Salaries';
    private readonly proxyUrl: any;
    private readonly proxyAuth: string;

    constructor() {
        super();
        this.proxyUrl = url.parse(process.env.FIXIE_URL);
        this.proxyAuth = this.proxyUrl.auth.split(':');
        console.log('Using proxy URL:', this.proxyUrl);
    }

    private getCountryURL(role: string, countryCode: number) {
        return `${this.BASE}/${role}-salary-SRCH_IN${countryCode}_KO0,${role.length}.htm`;
    }

    private getCityURL(role: string, cityCode: number) {
        return `${this.BASE}/${role}-salary-SRCH_IM${cityCode}_KO0,${role.length}.htm`;
    }

    private extractSalary(title: string, text: string) {
        const $ = cheerio.load(text);
        const formattedPay = $('span[data-test=formatted-pay]').text();
        if (formattedPay === "") {
            console.log('No data found for current request');
            return {
                notFound: true,
                result: {
                    formattedPay: "Not found",
                    note: `There's no salary data found for ${title} at employer's location. The title might be uncommon`
                }
            };
        }
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
        return {result};
    }

    private extractUrls(body: SalaryRequestBase) {
        function getCityCode(state: string, city: string) {
            let cityBucket = Dictionary.cities[state];
            if (cityBucket) {
                return cityBucket[city];
            }
        }

        let country = body.country;
        let countryCode = Dictionary.countries[country];
        if (!countryCode) {
            // @ts-ignore
            if (Synonyms[country]) {
                // @ts-ignore
                country = Synonyms[country];
                countryCode = Dictionary.countries[country];
            }
            if (!countryCode) {
                throw Error(`Country not found: ${body.country}`);
            }
        }
        const roleNormalized = body.title.toLowerCase().split(" ").join("-");
        const countryUrl = this.getCountryURL(roleNormalized, countryCode);
        // trying to resolve city and state
        let cityCode: number;
        const state = body.state ? body.state : body.city;
        if (state) {
            cityCode = getCityCode(state, body.city);
            if (!cityCode) {
                // @ts-ignore
                cityCode = getCityCode(States[state], body.city);
            }
            if (!cityCode) {
                // @ts-ignore
                cityCode = getCityCode(country, body.city);
            }
        }
        const cityUrl = cityCode ? this.getCityURL(roleNormalized, cityCode) : null;
        return {cityUrl: cityUrl, countryUrl: countryUrl};
    }

    private async verify(title: string, url: string) {
        if (Cache.instance.has(url)) {
            console.log("Returning cached value for:", url);
            return Cache.instance.get(url);
        } else {
            console.log("No cached value for:", url);
            try {
                return axios.get(url, {
                    headers: this.getRequestHeaders(),
                    proxy: {
                        protocol: 'http',
                        host: this.proxyUrl.hostname,
                        port: this.proxyUrl.port,
                        auth: {username: this.proxyAuth[0], password: this.proxyAuth[1]}
                    }
                })
                    .then(response => {
                        return response.data;
                    }).then(text => {
                        const result = this.extractSalary(title, text)
                        Cache.instance.set(url, result);
                        return result;
                    }).catch(error => {
                        console.error(error);
                        return {error: error.message};
                    })
            } catch (error) {
                console.error(error);
                return Promise.resolve({error: error.message});
            }
        }
    }

    @Post("salary")
    public async getSalary(@Body() body: SalaryRequest): Promise<any> {
        function extractValue(original: string) {
            // @ts-ignore
            let {value, symbol} = isNaN(original[0])
                ? {value: original.slice(1), symbol: original[0]}
                : {value: original, symbol: undefined};
            value = value.replace(",", "").replace("K", "000");
            return {value: Number(value), symbol};
        }

        console.log('Getting salary for:', body);
        try {
            let {cityUrl, countryUrl} = this.extractUrls(body);
            let result = await this.verify(body.title, cityUrl) as any;
            if (result.notFound) {
                result = await this.verify(body.title, countryUrl);
            }
            if (!result.notFound) {
                // adding projections based on experience
                const {value: original, symbol} = extractValue(result.result.formattedPay);
                let startingMoment = moment([body.startYear, body.startMonth - 1, 1]);
                const experienceYears = moment().diff(startingMoment, 'years');
                if (experienceYears > 0) {
                    const newPay = Number((original * Math.pow(GROWTH_FACTOR, experienceYears)).toFixed(0));
                    const {value: max} = extractValue([...result.result.payDistribution].pop());
                    const progressivePay = Math.min(newPay, max);
                    result.result.progressivePay = symbol
                        ? `${symbol}${progressivePay.toLocaleString()}`
                        : progressivePay.toLocaleString();
                }
            }
            return Promise.resolve(result);
        } catch (error) {
            this.setStatus(500);
            return Promise.resolve(error.message);
        }
    }

    @Post("evoke")
    public async evokeCache(@Body() body: SalaryRequest): Promise<any> {
        function evoke(url: string) {
            if (Cache.instance.has(url)) {
                console.log("Evoking cached value for:", url);
                Cache.instance.del(url);
            }
        }

        let {cityUrl, countryUrl} = this.extractUrls(body);
        evoke(cityUrl);
        evoke(countryUrl);
    }

    @Post("test-get")
    public async testGet(@Body() body: TestGetRequest): Promise<any> {
        console.log("Testing get for:", body);
        try {
            return axios.get(body.url, {
                headers: body.headers ? body.headers : this.getRequestHeaders(),
                proxy: {
                    protocol: 'http',
                    host: this.proxyUrl.hostname,
                    port: this.proxyUrl.port,
                    auth: {username: this.proxyAuth[0], password: this.proxyAuth[1]}
                }
            })
                .then(response => {
                    return response.data;
                }).then(text => {
                    return text;
                }).catch(error => {
                    console.error(error);
                    return {error: error.message};
                })
        } catch (error) {
            console.error(error);
            return Promise.resolve({error: error.message});
        }
    }

    private getRequestHeaders(): any {
        return {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip,deflate,compress",
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
        };
    }

}