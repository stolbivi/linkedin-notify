export class BackendAPI {

    private static readonly BASE = 'https://linkedin-manager-api.herokuapp.com/api/';

    public getCompletion(prompt: string): Promise<any> {
        return fetch(`${BackendAPI.BASE}completion?prompt=${encodeURIComponent(prompt)}`, {
            "headers": {
                "accept": "application/json",
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        }).then(response => response.json());
    }

}