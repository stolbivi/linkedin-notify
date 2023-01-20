import {Body, Post, Request, Route, Tags} from "tsoa";
import {Cache} from "../data/cache";
import * as cheerio from 'cheerio';
import * as States from "../data/states.json"
import {Dictionary} from "../data/dictionary";
import * as Synonyms from "../data/synonyms.json";
import * as RemovalsLocation from "../data/removals_location.json";
import * as DividersTitle from "../data/dividers_title.json";
import * as RemovalsTitle from "../data/removals_title.json";
import moment from 'moment';
import axios from "axios";
import {BaseController} from "./base-controller";
import express from "express";

const url = require("url");

type Nullable<T> = T | null;

export interface Location {
    city: Nullable<string>
    state: Nullable<string>
    country: Nullable<string>
}

export interface LocationExtended {
    city: string
    stateSynonyms: Array<string>
    countrySynonyms: Array<string>
    countryCode?: number
    cityCode?: number
}

interface SalaryRequestBase {
    title: string
    location: Location
    organization?: Location
}

interface SalaryRequest extends SalaryRequestBase {
    urn: string
    startMonth?: Nullable<number>
    startYear?: Nullable<number>
    endMonth?: Nullable<number>
    endYear?: Nullable<number>
    company?: {
        name: string
        universalName: string
        entityUrn: string
        url: string
    }
}

const GROWTH_FACTOR = 1.05;

@Route("/api")
export class GlassDoorController extends BaseController {

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

    private getNotFoundMessage(note: string): any {
        return {
            notFound: true,
            result: {
                formattedPay: "Not found",
                note
            }
        }
    }

    private extractSalary(title: string, text: string) {
        const $ = cheerio.load(text);
        const formattedPay = $('span[data-test=formatted-pay]').text();
        if (formattedPay === "") {
            console.log('No data found for current request');
            return this.getNotFoundMessage(`There's no salary data found for ${title} at employer's location. The title might be uncommon`);
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

    private removeTokens(name: string) {
        let result = name;
        if (result) {
            for (let i = 0; i < Object.keys(RemovalsLocation).length; i++) {
                result = result.replace(RemovalsLocation[i], "");
            }
            result = result.trim();
        }
        return result;

    }

    private extendLocation(location: Location): LocationExtended {
        const result = {
            city: this.removeTokens(location.city),
            stateSynonyms: [location.state],
            countrySynonyms: [location.country]
        }
        // @ts-ignore
        if (Synonyms[location.country]) {
            // @ts-ignore
            result.countrySynonyms.push(Synonyms[location.country]);
        }
        // @ts-ignore
        if (States[location.state]) {
            // @ts-ignore
            result.stateSynonyms.push(States[location.state]);
        }
        result.stateSynonyms.push(...result.countrySynonyms);
        return result;
    }

    private resolveCodes(pLocation: LocationExtended, oLocation?: LocationExtended): LocationExtended {
        function addCountryCode(l: LocationExtended) {
            let codes = l.countrySynonyms.map(c => Dictionary.countries[c]).filter(c => !!c);
            if (codes && codes.length > 0) {
                l.countryCode = codes.shift();
                return l;
            } else {
                throw Error(`Country not found`);
            }
        }

        function getCityCode(state: string, city: string) {
            let cityBucket = Dictionary.cities[state];
            if (cityBucket) {
                return cityBucket[city];
            }
        }

        function addCityCode(l: LocationExtended) {
            let codes = l.stateSynonyms.map(s => getCityCode(s, l.city)).filter(c => !!c);
            if (codes && codes.length > 0) {
                l.cityCode = codes.shift();
            }
            return l;
        }

        if (oLocation) {
            let intersection = pLocation.countrySynonyms.filter(x => oLocation.countrySynonyms.includes(x));
            // if HQ country matches persons country, using organization country
            if (Array.isArray(intersection) && intersection.length > 0) {
                let location = addCityCode(addCountryCode(oLocation));
                if (!location.cityCode) {
                    return addCityCode(addCountryCode(pLocation));
                } else {
                    return location;
                }
            }
        }
        return addCityCode(addCountryCode(pLocation));
    }

    private normalizeRole(title: string) {
        function trimBy(div: string, title: string) {
            if (title.indexOf(div) >= 0) {
                return result.split(div)
                    .filter(t => t !== "")
                    .shift()
                    .trim();
            }
            return title;
        }

        let result = title.toLowerCase();
        for (let i = 0; i < Object.keys(DividersTitle).length; i++) {
            const exp = DividersTitle[i];
            if (exp) {
                result = trimBy(exp, result);
            }
        }
        for (let i = 0; i < Object.keys(RemovalsTitle).length; i++) {
            const exp = RemovalsTitle[i];
            if (exp) {
                result = result.replace(new RegExp(exp, "g"), "").trim();
            }
        }
        result = result.split(" ").join("-");
        return result;
    }

    private extractParameters(body: SalaryRequestBase) {
        let personLocation = this.extendLocation(body.location)
        let organizationLocation = body.organization ? this.extendLocation(body.organization) : undefined;
        let resolvedLocation = this.resolveCodes(personLocation, organizationLocation);
        const roleNormalized = this.normalizeRole(body.title);
        return {
            cityCode: resolvedLocation.cityCode,
            countryCode: resolvedLocation.countryCode,
            title: roleNormalized
        };
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

    @Tags("Salary")
    @Post("salary")
    public async getSalary(@Body() body: SalaryRequest,
                           @Request() request?: express.Request
    ): Promise<any> {
        if (this.abruptOnNoSession(request)) {
            this.setStatus(403);
            return Promise.resolve("Unauthorized access. Try to sign in with LinkedIn first");
        }

        function extractValue(original: string) {
            let value = original.replace("K", "000");
            const match = value.match("([^0-9,])+");
            let symbol = "";
            if (match) {
                symbol = match[0];
                value = value.substring(match[0].length);
            }
            value = value.replace(",", "");
            return {value: Number(value), symbol}
        }

        const verifyWithCodes = async (cityCode: number, countryCode: number, title: string, result: any) => {
            const countryUrl = this.getCountryURL(title, countryCode);
            const cityUrl = cityCode ? this.getCityURL(title, cityCode) : null;
            if (cityUrl) {
                result = await this.verify(body.title, cityUrl);
            }
            if (countryUrl && result.notFound) {
                result = await this.verify(body.title, countryUrl);
            }
            return result;
        }

        console.log('Getting salary for:', body);
        try {
            let result = this.getNotFoundMessage('Something went wrong :(');
            let {cityCode, countryCode, title} = this.extractParameters(body);
            while (result.notFound && title.length > 0) {
                result = await verifyWithCodes(cityCode, countryCode, title, result);
                const titleTokens = title.split("-");
                titleTokens.pop();
                title = titleTokens.join("-");
            }
            if (!result.notFound) {
                // adding projections based on experience
                const {value: original, symbol} = extractValue(result.result.formattedPay);
                if (body.startYear) {
                    const startMonth = body.startMonth ? body.startMonth : 1;
                    let startingMoment = moment([body.startYear, startMonth - 1, 1]);
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
            }
            if (request?.user) {
                result = {...result, user: request.user};
            }
            return Promise.resolve(result);
        } catch (error) {
            return this.handleError(error, request);
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