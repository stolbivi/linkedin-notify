import {createAction, createRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {LinkedInAPI} from "./services/LinkedInAPI";
import {
    Badges,
    Features,
    Invitation,
    Job,
    LINKEDIN_DOMAIN,
    Message,
    Note,
    NoteExtended,
    SHARE_URN,
    VERBOSE
} from "./global";
import {BackendAPI} from "./services/BackendAPI";
import {MapsAPI} from "./services/MapsAPI";
import {Response} from "./services/BaseAPI";
import {StageEnum} from "./injectables/notes/StageSwitch";
import {MessagesV2, Tabs} from "@stolbivi/pirojok";
import {getThemeCookie, setThemeCookie} from "./themes/ThemeUtils";
import {store} from "./store/Store";
import {setLastViewed as setLastViewedAction} from "./store/LastViewedReducers";
import Cookie = chrome.cookies.Cookie;

const messagesV2 = new MessagesV2(VERBOSE);
const api = new LinkedInAPI();
const backEndAPI = new BackendAPI();
const mapsAPI = new MapsAPI();
const tabs = new Tabs();

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

export const getConversationProfile = createAction<string, Array<any>>("getConversationProfile",
    (convId) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const detailsResponse = await api.getConversationProfile(token, convId);
            return detailsResponse;
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

export const handleNewsLetterInvitation = createAction<Invitation, any>("handleNewsLetterInvitation",
    (invitation) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(token => api.handleNewsLetterInvitation(token, invitation)));

export const completion = createAction<string, any>("completion",
    (text) => backEndAPI.getCompletion(text));

export const getFeatures = createAction<{}, Response<Features>>("getFeatures",
    () => backEndAPI.getFeatures());

export const setFeatures = createAction<SetFeaturePayload, Response<Features>>("setFeatures",
    (payload) => backEndAPI.setFeatures(payload));

export const getSubscription = createAction<{}, any>("getSubscription",
    () => backEndAPI.getSubscription());

// TODO add to store
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

// TODO add to store
export const getTz = createAction<string, any>("getTz",
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

// TODO add to store
export const getStages = createAction<GetStagesPayload, Response<any>>("getStages",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
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
        timestamp: new Date(n.updatedAt)
    }));
}

export const getProfileByUrn = createAction<string, any>("getProfileByUrn",
    (urn) => getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const profile= await api.getProfile(token,urn);
            return api.extractProfile(urn, profile);
        }));
export const getCompanyByUrn = createAction<string, any>("getCompanyByUrn",
    (urn) => getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const resp = await api.getCompanyDetails(token,urn);
            return api.extractCompany(urn, resp);
        }));

export interface SetStagePayload {
    id: string
    stage: StageEnum
    stageFrom: StageEnum
    stageText?: string;
    parentStage?: number
}

export const setStage = createAction<SetStagePayload, any>("setStage",
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
                stageText: payload.stageText || undefined
            });
            const noteExtended = await extendNote(token, [note.response], author);
            let profile= await api.getProfileDetails(token,payload.id);
            let rcpntPrfl = {name: "", designation: "", profileImg: ""};
            if(profile && profile.included[0]) {
                profile = profile.included[0];
                rcpntPrfl = {name: profile.firstName + ' ' + profile.lastName,
                    designation: profile.occupation, profileImg: profile?.picture?.rootUrl + profile?.picture?.artifacts[0]?.fileIdentifyingUrlPathSegment }
            }
            const stage = await backEndAPI.setStage(payload.id, payload.stage, author, payload.parentStage, rcpntPrfl.name, rcpntPrfl.designation, rcpntPrfl.profileImg);
            return {note: {response: noteExtended[0]}, stage: stage};;
        }));

export const setStageFromKanban = createAction<SetStagePayload, any>("setStageFromKanban",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            return  await backEndAPI.setStageFromKanban(payload.id, payload.stage, author);
        }));

export interface ShowNotesAndChartsPayload {
    id?: string
    showSalary: boolean
    showNotes: boolean
    setSalary?:any
}

// TODO add to store
const showNotesAndChartsRequest = createRequest<ShowNotesAndChartsPayload, void>("showNotesAndCharts");

export const showNotesAndCharts = createAction<ShowNotesAndChartsPayload, any>("showNotesAndChartsProxy",
    (payload) => tabs.withCurrentTab()
        .then(tab => messagesV2.requestTab(tab?.id, showNotesAndChartsRequest(payload).toAction())));

// TODO add to store
export const getNotesAll = createAction<{}, any>("getNotesAll",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            const notes = await backEndAPI.getNotes(as);
            if (notes.response) {
                return extendNote(token, notes.response, as)
                    .then(response => {
                        // @ts-ignore
                        response.sort((a, b) => b.timestamp - a.timestamp);
                        return {response};
                    })
            } else {
                return notes;
            }
        }));

// TODO add to store
export const getNotesByProfile = createAction<string, any>("getNotesByProfile",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            const notes = await backEndAPI.getNotesByProfile(id, as);
            if (notes.response) {
                return extendNote(token, notes.response, as)
                    .then(response => {
                        // @ts-ignore
                        response.sort((a, b) => a.timestamp - b.timestamp);
                        return {response};
                    })
            } else {
                return notes;
            }
        }));

export interface PostNotePayload {
    id: string
    stageFrom?: StageEnum
    stageTo: StageEnum
    text?: string
    stateText?: string
}

export const postNote = createAction<PostNotePayload, any>("postNote",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            const note = await backEndAPI.postNote({
                profile: payload.id,
                author,
                stageFrom: payload.stageFrom,
                stageTo: payload.stageTo,
                text: payload.text,
                stageText: payload.stateText
            });
            const noteExtended = await extendNote(token, [note.response], author);
            return {note: {response: noteExtended[0]}};
        }));

export interface CreateCustomStagePayload  {
    text: string
}

export const createCustomStage = createAction("createCustomStage",
    (payload: { text: string }) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            const { response } = await backEndAPI.postCustomStage({...payload, author})
            return response
        }));

export const getCustomStages = createAction("getCustomStages",
        () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            console.log('in action creator get custom stages')
            const { response } = await backEndAPI.getCustomStages()
            return response
        })
)

// TODO add to store
export const getLastViewed = createAction<string, any>("getLastViewed",
    (id, sender) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            const profile = experience.urn;
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            if (profile === as) {
                return {response: {profile: me, author: as, hide: true}}
            } else {
                return backEndAPI.getLastViewed(profile, as);
            }
        })
        .then(response => {
            if (sender.tab) {
                store.dispatch(setLastViewedAction({tabId: sender.tab.id, payload: response.response}));
            }
            return response;
        }));

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

export const getLastSeen = createAction<string, any>("getLastSeen",
    (id, sender) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            const profile = experience.urn;
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            if (profile === as) {
                return {response: {profile: me, author: as, hide: true}}
            } else {
                const msgLastSeenResp = await api.getMsgLastSeen(token, profile);
                console.log(msgLastSeenResp);
                const responseData = msgLastSeenResp.data;
                const profileCard = responseData.identityDashProfileCardsByDeferredCards.elements[0];
                const fixedListComponent = profileCard.topComponents[1].components.fixedListComponent;
                const miniUpdate = fixedListComponent.components.miniUpdateUrn;
                const contextualDescription = miniUpdate.contextualDescription;
                const text = contextualDescription.text.text;
                const daysAfterBullet = text.split('•')[1].trim();

                console.log(daysAfterBullet);

                /*const presenceLastSeenResp = await api.getPresenceLastSeen(token, as);
                console.log(msgLastSeenResp,presenceLastSeenResp)*/

                return new Date();
            }
        })
        .then(response => {
            return response;
        }));

export interface SwitchThemePayload {
    theme: string
}

export const switchThemeRequest = createRequest<SwitchThemePayload, void>("switchTheme");

export const getTheme = createAction<{}, string>("getTheme",
    (_) => getThemeCookie().then(cookie => cookie?.value) as Promise<string>);

export const setTheme = createAction<string, Cookie>("setTheme",
    (theme) => setThemeCookie(theme));

export const postReply = createAction<Message, void>("postReply",
    (message) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            await api.postReply(token, message.conversationId,message.messageBody,message.recipientId);
        }));

export const deleteNote = createAction<string, any>("deleteNote",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            const { response } = await backEndAPI.deleteNote(id)
            return response
        })
)

export const postJob = createAction<Job, any>("postJob",
    (job) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            const { response } = await backEndAPI.postJob(job)
            return response
        })
)

export const getJobs = createAction<{}, any>("getJobs",
    () => backEndAPI.getJobs());

export const updateJob = createAction<Job, any>("updateJob",
    (job) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            const { response } = await backEndAPI.updateJob(job)
            return response
        })
)

export const deleteJob = createAction<string, any>("deleteJob",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            const { response } = await backEndAPI.deleteJob(id)
            return response
        })
)

export const getAuthorStages = createAction("getAuthorStages",
    () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            return await backEndAPI.getAuthorStages(author)
        }));