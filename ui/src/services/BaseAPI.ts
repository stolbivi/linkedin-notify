export interface Response<T> {
    response?: T
    error?: string
}

export class BaseAPI {

    protected fetchRequest<T>(input: string, request: any): Promise<Response<T>> {
        try {
            return fetch(input, request)
                .then(async response => {
                    if (!response.ok) {
                        const error = await response.text();
                        return {error, status: response.status}
                    }
                    return response.json();
                })
                .then(response => ({response}))
                .catch(error => {
                    console.error(error);
                    return {error: error.message};
                })
        } catch (error) {
            console.error(error);
            return Promise.resolve({error: error.message});
        }
    }

    protected getRequest(method: "GET" | "POST" | "PUT", body?: any): any {
        return {
            "headers": {
                "accept": "application/json",
                "content-type": "application/json"
            },
            "body": body ? JSON.stringify(body) : null,
            "method": method,
            "mode": "cors",
            "credentials": "include"
        }
    }

}