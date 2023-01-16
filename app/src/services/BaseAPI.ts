export class BaseAPI {

    protected fetchRequest(input: string, request: any) {
        try {
            return fetch(input, request)
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

    protected getRequest(method: "GET" | "POST", body?: any): any {
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