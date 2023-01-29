import Cookie = chrome.cookies.Cookie;

export class LinkedInHelper {

    private readonly THE_COOKIE = 'li_at';
    private readonly CODE_REGEX = /(?:<code*.*>)([\s\S]*?)(<\/code>)/g;
    private readonly JSON_REGEX = /\{.+\}/g;

    public async getAllCodes(url: string, cookies: Cookie[]): Promise<Array<any>> {
        const liAt = await this.getLiAt(cookies);
        return fetch(url, {
            "headers": {
                "li_at": liAt,
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        })
            .then(response => response.text())
            .then(text => text
                .match(this.CODE_REGEX)
                .map(tag => tag.match(this.JSON_REGEX)).flat().filter(s => s && s.length > 0)
                .map(s => s.replace(/&quot;/g, "\""))
                .map(s => s.replace(/&#92;/g, "\\"))
                .map(s => {
                    return s
                })
                .map(decoded => JSON.parse(decoded))
            )

    }

    private getLiAt(cookies: Cookie[]): string {
        const token = cookies.find(c => c.name === this.THE_COOKIE);
        return token?.value;
    }

}