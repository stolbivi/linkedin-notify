export class BackendAPI {

    // private static readonly BASE = 'https://linkedin-manager-api.herokuapp.com/api/';
    private static readonly BASE = 'http://localhost:8080/api/';

    public getCompletion(prompt: string): Promise<any> {
        try {
            return fetch(`${BackendAPI.BASE}completion?prompt=${encodeURIComponent(prompt)}`, this.getRequest("GET"))
                .then(response => response.json())
                .catch(error => {
                    console.error(error);
                    return {error};
                })
        } catch (error) {
            console.error(error);
            return Promise.resolve({error});
        }
    }

    public getSalary(request: any): Promise<any> {
        try {
            return fetch(`${BackendAPI.BASE}salary`, this.getRequest("POST", request))
                .then(response => response.json())
                .catch(error => {
                    console.error(error);
                    return {error};
                })
        } catch (error) {
            console.error(error);
            return Promise.resolve({error});
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