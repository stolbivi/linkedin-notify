import {createAction, createRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {LinkedInAPI} from "./services/LinkedInAPI";
import {Badges, Features, Invitation, LINKEDIN_DOMAIN, Note, NoteExtended, SHARE_URN} from "./global";
import {BackendAPI} from "./services/BackendAPI";
import {MapsAPI} from "./services/MapsAPI";
import {Response} from "./services/BaseAPI";
import {StageEnum} from "./injectables/notes/StageSwitch";
import {getThemeCookie, setThemeCookie} from "./themes/ThemeUtils";
import {LastViewed} from "./store/LastViewedReducer";
import {Stage} from "./store/StageReducer";
import Cookie = chrome.cookies.Cookie;

const api = new LinkedInAPI();
const backEndAPI = new BackendAPI();
const mapsAPI = new MapsAPI();

/**
 * Returns all cookies of the store for particular domain, requires host permissions in manifest
 * @param domain
 */
export const getCookies = async (domain: string) => chrome.cookies.getAll({domain});

export const openUrl = createAction<string, chrome.tabs.Tab>("openUrlAction",
    (url) => chrome.tabs.create({url}));

export interface LoggedPayload {
    isLogged: boolean
}

export const getIsLogged = createAction<{}, LoggedPayload>("getIsLogged",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.isLogged(cookies))
        .then(isLogged => ({isLogged})));

export const getBadges = createAction<{}, Badges>("getBadges",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const badgesResponse = await api.getTabBadges(token);
            return api.extractBadges(badgesResponse);
        }));

export const getConversations = createAction<{}, any>("getConversations",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const meResponse = await api.getMe(token);
            const profileUrn = api.extractProfileUrn(meResponse);
            const conversationResponse = await api.getConversations(token, profileUrn);
            return api.extractConversations(conversationResponse);
        }));

export interface UnlockedPayload {
    isUnlocked: boolean
}

export const getIsUnlocked = createAction<{}, UnlockedPayload>("getIsUnlocked",
    () => new Promise<UnlockedPayload>((res) => {
        chrome.storage.local.get(["unlocked"], (result) => {
            res({isUnlocked: result["unlocked"] === true})
        });
    }));

export const unlock = createAction<{}, UnlockedPayload>("unlock",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(token => api.repost(token, SHARE_URN))
        .then(r => new Promise((res) => chrome.storage.local.set({unlocked: true}, () => res({isUnlocked: r})))));

export const getConversationDetails = createAction<string, Array<any>>("getConversationDetails",
    (entityUrn) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const detailsResponse = await api.getConversationDetails(token, entityUrn);
            return api.extractConversationDetails(detailsResponse);
        }));

export const conversationAck = createAction<string, void>("conversationAck",
    (entityUrn) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            await api.markConversationRead(token, entityUrn);
            await api.markAllMessageAsSeen(token, entityUrn)
        }));

export const getNotifications = createAction<{}, any>("getNotifications",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const notificationsResponse = await api.getNotifications(token);
            return api.extractNotifications(notificationsResponse);
        }));

export const markNotificationsSeen = createAction<{}, any>("markNotificationsSeen",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(token => api.markAllNotificationsAsSeen(token)));

export const markNotificationRead = createAction<string, any>("markNotificationRead",
    (entityUrn) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(token => api.markNotificationRead(token, entityUrn)));

export const getInvitations = createAction<{}, any[]>("getInvitations",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const invitationsResponse = await api.getInvitations(token);
            return api.extractInvitations(invitationsResponse);
        }));

export const handleInvitation = createAction<Invitation, any>("handleInvitation",
    (invitation) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(token => api.handleInvitation(token, invitation)));

export const completion = createAction<string, any>("completion",
    (text) => backEndAPI.getCompletion(text));

export const getFeatures = createAction<{}, Response<Features>>("getFeatures",
    () => backEndAPI.getFeatures());

export const setFeatures = createAction<SetFeaturePayload, Response<Features>>("setFeatures",
    (payload) => backEndAPI.setFeatures(payload));

export const getSubscription = createAction<{}, any>("getSubscription",
    () => backEndAPI.getSubscription());

export const getSalary = createAction<string, any>("getSalary",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const locationResponse = await api.getLocation(token, id);
            const location = api.extractLocation(locationResponse);
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            const titleResponse = await api.getTitle(token, experience.urn);
            const title = api.extractTitle(titleResponse);
            let request = {...title, ...experience, location};
            if (experience.company?.universalName) {
                const organizationResponse = await api.getOrganization(token, experience.company?.universalName);
                const organization = api.extractOrganization(organizationResponse);
                request = {...request, organization}
            }
            const response = await backEndAPI.getSalary(request);
            return {...response, ...request};
        }));

export interface GeoTz {
    geo: {
        lat: any
        lng: any
        city: any
    }
    tz: any
}

export const getTz = createAction<string, GeoTz>("getTz",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const locationResponse = await api.getLocation(token, id);
            return api.extractLocation(locationResponse);
        })
        .then(async location => {
            const {city, state, country} = location;
            const address = [city, state, country].filter(a => !!a && a !== "")
            const geo = await mapsAPI.getGeocode(address.join(", "));
            const {lat, lng} = geo.results[0].geometry.location;
            return {lat, lng, city};
        })
        .then(async geo => {
            const tz = await backEndAPI.getTz(geo.lat, geo.lng);
            return {tz, geo};
        }));

export interface SetFeaturePayload {
    author?: string
    theme?: string
    action: string
    type: string
}

export interface GetStagesPayload {
    id?: string
    url?: string
}

export interface StageResponse {
    id: string
    author: string
    stage: number
    updatedAt: string
}

export const getStages = createAction<GetStagesPayload, Response<StageResponse>>("getStages",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            console.log('Get stages payload:', payload);
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            if (payload.id) {
                return backEndAPI.getStage(payload.id, as)
            } else {
                const experienceResponse = await api.getExperience(token, payload.url);
                const experience = api.extractExperience(experienceResponse);
                return backEndAPI.getStage(experience.urn, as);
            }
        }));

async function extendNote(token: string, notes: Note[], as: string): Promise<NoteExtended[]> {
    function getPicture(profilePicture: any) {
        return profilePicture
            ? profilePicture.rootUrl + profilePicture.artifacts[0].path
            : "https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q"
    }

    const cache = {} as { [key: string]: any };
    notes.forEach(n => {
        cache[n.author] = {};
        cache[n.profile] = {};
    })
    const promises = Object.keys(cache)
        .map(k => api.getProfile(token, k)
            .then(p => api.extractProfile(k, p))
            .then(e => ({id: k, profile: e}))
        );
    const result = await Promise.all(promises);
    result.forEach(r => cache[r.id] = r.profile);
    return notes.map(n => ({
        ...n,
        authorName: as === n.author ? "You" : cache[n.author].name[0],
        authorPicture: getPicture(cache[n.author].profilePicture),
        profileName: cache[n.profile].name[0],
        profileLink: cache[n.profile].link?.length > 0 ? cache[n.profile].link[0] : undefined,
        profilePicture: getPicture(cache[n.profile].profilePicture),
        timestamp: new Date(n.updatedAt).getTime()
    }));
}

export interface SetStagePayload {
    id: string
    stage: StageEnum
    stageFrom: StageEnum
}

export interface SetStageResponse {
    note: NoteExtended
    stage: Stage
}

export const setStage = createAction<SetStagePayload, SetStageResponse>("setStage",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            const note = await backEndAPI.postNote({
                profile: payload.id,
                author,
                stageFrom: payload.stageFrom,
                stageTo: payload.stage,
            });
            const noteExtended = await extendNote(token, [note.response], author);
            const stage = await backEndAPI.setStage(payload.id, payload.stage, author);
            return {note: noteExtended[0], stage: stage.response};
        }));

export const getNotesAll = createAction<{}, Response<NoteExtended[]>>("getNotesAll",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            const notes = await backEndAPI.getNotes(as);
            if (notes.response) {
                return extendNote(token, notes.response, as)
                    .then(response => ({response} as Response<NoteExtended[]>));
            } else {
                return notes as Response<NoteExtended[]>;
            }
        }));

export const sortAsc = (notes: NoteExtended[]) => notes.sort((a, b) => a.timestamp - b.timestamp);
export const sortDesc = (notes: NoteExtended[]) => notes.sort((a, b) => b.timestamp - a.timestamp);

// @Deprecated: this API is deprecated and is not used since all notes are now shared via store
export const getNotesByProfile = createAction<string, Response<NoteExtended[]>>("getNotesByProfile",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            const notes = await backEndAPI.getNotesByProfile(id, as);
            if (notes.response) {
                return extendNote(token, notes.response, as)
                    .then(response => ({response} as Response<NoteExtended[]>));
            } else {
                return notes as Response<NoteExtended[]>;
            }
        }));

export interface PostNotePayload {
    id: string
    stageTo: StageEnum
    text: string
}

export interface PostNoteResponse {
    note: Response<NoteExtended>
}

export const postNote = createAction<PostNotePayload, PostNoteResponse>("postNote",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            const note = await backEndAPI.postNote({
                profile: payload.id,
                author,
                stageTo: payload.stageTo,
                text: payload.text,
            });
            const noteExtended = await extendNote(token, [note.response], author);
            return {note: {response: noteExtended[0]}};
        }));

export const getLastViewed = createAction<string, LastViewed[]>("getLastViewed",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            const profile = experience.urn;
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            if (profile === as) {
                return {response: [{profile: me, author: as, hide: true} as LastViewed]}
            } else {
                return backEndAPI.getLastViewed(profile, as);
            }
        })
        .then(response => response.response));

export const setLastViewed = createAction<string, any>("setLastViewed",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            const profile = experience.urn;
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            return backEndAPI.postLastViewed({
                profile,
                author,
            });
        }));

export interface SwitchThemePayload {
    theme: string
}

export const switchThemeRequest = createRequest<SwitchThemePayload, void>("switchTheme");

export const getTheme = createAction<{}, string>("getTheme",
    (_) => getThemeCookie().then(cookie => cookie?.value) as Promise<string>);

export const setTheme = createAction<string, Cookie>("setTheme",
    (theme) => setThemeCookie(theme));