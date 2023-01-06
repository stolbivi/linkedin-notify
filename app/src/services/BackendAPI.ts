export class BackendAPI {

    // private static readonly BASE = 'https://linkedin-manager-api.herokuapp.com/api/';
    private static readonly BASE = 'http://localhost:8080/api/';

    public getCompletion(prompt: string): Promise<any> {
        return fetch(`${BackendAPI.BASE}completion?prompt=${encodeURIComponent(prompt)}`, this.getRequest("GET"))
            .then(response => response.json());
    }

    public getSalary(request: any): Promise<any> {
        console.log("Getting salary for:", request);
        return fetch(`${BackendAPI.BASE}salary`, this.getRequest("POST", request))
            .then(response => response.json());
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