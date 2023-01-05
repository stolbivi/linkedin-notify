import NodeCache from "node-cache";

export class Cache {

    private static readonly _cache = new NodeCache({stdTTL: Number(process.env.CACHE_TTL_SECONDS)});

    static get instance() {
        return this._cache;
    }
}