export class BackendAPI {

    private static readonly BASE = 'https://api.lnmanager.com/api/';
    // private static readonly BASE = 'https://linkedin-manager-api.herokuapp.com/api/';
    // private static readonly BASE = 'http://localhost:8080/api/';

    public getCompletion(prompt: string): Promise<any> {
        try {
            return fetch(`${BackendAPI.BASE}completion?prompt=${encodeURIComponent(prompt)}`, this.getRequest("GET"))
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

    public getSalary(request: any): Promise<any> {
        try {
            return fetch(`${BackendAPI.BASE}salary`, this.getRequest("POST", request))
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

    public getTz(lat: number, lng: number): Promise<any> {
        try {
            return fetch(`${BackendAPI.BASE}find?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
                this.getRequest("GET"))
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