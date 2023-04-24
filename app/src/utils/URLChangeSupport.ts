import detectUrlChange from 'detect-url-change';
import {useEffect, useState} from "react";

export function useUrlChangeSupport(initUrl: string): [string] {

    const [url, setUrl] = useState<string>(initUrl);

    useEffect(() => {
        detectUrlChange.on('change', (newUrl) => {
            if (newUrl?.length > 0) {
                setUrl(newUrl);
            }
        });
    }, []);

    return [url];
}