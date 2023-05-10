import {createAction, createRequest} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {LinkedInAPI} from "./services/LinkedInAPI";
import {
    AssignedJob,
    Badges, CustomSalary,
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
import {LastViewed} from "./store/LastViewedReducer";
import Cookie = chrome.cookies.Cookie;
import {Salary} from "./store/SalaryReducer";

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
            return await api.getConversationProfile(token, convId);
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
            delete experience.conversationUrn;
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
    existingChildStageId?: string
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
                stageText: payload.stageText || undefined,
                parentStage: payload.parentStage
            });
            const noteExtended = await extendNote(token, [note.response], author);
            const experienceResponse = await api.getExperience(token, payload.id);
            const experience = api.extractExperience(experienceResponse);
            let profile= await api.getProfileDetails(token,payload.id);
            let rcpntPrfl = {name: "", designation: "", profileImg: "", profileId: "", userId: ""};
            if(profile && profile.included[0]) {
                profile = profile.included[0];
                rcpntPrfl = {name: profile.firstName + ' ' + profile.lastName,
                            designation: profile.occupation,
                            profileImg: profile?.picture?.rootUrl + profile?.picture?.artifacts[0]?.fileIdentifyingUrlPathSegment,
                            profileId: payload.id, userId: profile.publicIdentifier}
            }
            const prflImg = rcpntPrfl.profileImg ? rcpntPrfl.profileImg : 'https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q';
            const stage = await backEndAPI.setStage(note?.response?.id, payload?.stage, author, payload?.parentStage, rcpntPrfl?.name,
                rcpntPrfl?.designation, prflImg, payload?.stageText || "", rcpntPrfl?.profileId, experience?.company?.name, experience?.conversationUrn, rcpntPrfl?.userId);
            return {note: {response: noteExtended[0]}, stage: stage};
        }));

export const setStageFromKanban = createAction<SetStagePayload, any>("setStageFromKanban",
    (payload) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const me = await api.getMe(token);
            const author = api.extractProfileUrn(me);
            return  await backEndAPI.setStageFromKanban(payload.id, payload.stage, payload.stageText, author);
        }));

export interface ShowNotesAndChartsPayload {
    id?: string
    showSalary: boolean
    showNotes: boolean
    showStages?: boolean
    setSalary?:any
    userId?: string
    profileId?: string
}

const showNotesAndChartsRequest = createRequest<ShowNotesAndChartsPayload, void>("showNotesAndCharts");

export const showNotesAndCharts = createAction<ShowNotesAndChartsPayload, any>("showNotesAndChartsProxy",
    (payload, sender) => tabs.withCurrentTab()
        .then(tab => messagesV2.requestTab(tab?.id || sender?.tab?.id, showNotesAndChartsRequest(payload).toAction())));

export const getNotesAll = createAction<{}, Response<NoteExtended[]>>("getNotesAll",
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
                return notes as Response<NoteExtended[]>;
            }
        }));

export const sortAsc = (notes: NoteExtended[]) => notes.sort((a, b) => {
    //@ts-ignore
    return a?.timestamp - b?.timestamp;
});

export const sortDesc = (notes: NoteExtended[]) => notes.sort((a, b) => {
    //@ts-ignore
    return b?.timestamp - a?.timestamp;
});

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
                    .then(response => {
                        // @ts-ignore
                        response.sort((a, b) => a.timestamp - b.timestamp);
                        return {response};
                    })
            } else {
                return notes as Response<NoteExtended[]>;
            }
        }));

export interface PostNotePayload {
    id: string
    stageFrom?: StageEnum
    stageTo: StageEnum
    text?: string
    stateText?: string
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
                return backEndAPI.getLastViewed(profile, as)
                    .then(response => ({
                        ...response,
                        response: response.response.map(item => ({ ...item, hide: false })),
                    }));
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
const findTimeValue = (text: string) => {
    const regex = /"text":"[^"]+•\s(\d+(yr|mo|w|d|h|m|s))/;
    const match = text.match(regex);
    if (!match || match.length < 2) {
        return null;
    }
    return match[1];
};
const calculatePostedTime = (timeValue: string) => {
    const currentTime = new Date();
    const value = parseInt(timeValue.match(/\d+/g)[0]);
    const unit = timeValue.match(/[a-zA-Z]+/g)[0];
    switch (unit) {
        case 's':
            currentTime.setSeconds(currentTime.getSeconds() - value);
            break;
        case 'm':
            currentTime.setMinutes(currentTime.getMinutes() - value);
            break;
        case 'h':
            currentTime.setHours(currentTime.getHours() - value);
            break;
        case 'd':
            currentTime.setDate(currentTime.getDate() - value);
            break;
        case 'w':
            currentTime.setDate(currentTime.getDate() - value * 7);
            break;
        case 'mo':
            currentTime.setMonth(currentTime.getMonth() - value);
            break;
        case 'yr':
            currentTime.setFullYear(currentTime.getFullYear() - value);
            break;
        default:
            return null;
    }

    return currentTime;
};
export const getLastSeen = createAction<string, any>("getLastSeen",
    (id) => getCookies(LINKEDIN_DOMAIN)
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
                const profileActivityResp = await api.getMsgLastSeen(token, profile);
                const timeValue = findTimeValue(profileActivityResp);
                let profileActivityTime;
                if (timeValue) {
                    const postedTime = calculatePostedTime(timeValue);
                    if (postedTime) {
                        console.log(`The post was created at: ${postedTime.toISOString()}`);
                        profileActivityTime = postedTime.getTime();
                    } else {
                        console.log("Unable to calculate the posted time.");
                    }
                } else {
                    console.log("Unable to find the time value in the text.");
                }
                const presenceLastSeenResp = await api.getPresenceLastSeen(token, profile);
                let presenceTime;
                if(presenceLastSeenResp.results && Object.keys(presenceLastSeenResp.results).length > 0) {
                    presenceTime = presenceLastSeenResp.results[`urn:li:fsd_profile:${profile}`]['lastActiveAt'];
                }
                if (typeof profileActivityTime !== 'number') {
                    profileActivityTime = 0;
                }
                if (typeof presenceTime !== 'number') {
                    presenceTime = 0;
                }
                const earliestTimestamp = Math.max(profileActivityTime, presenceTime);
                return {response: {lastActiveAt: earliestTimestamp}}
            }
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

export const deleteStage = createAction<string, any>("deleteStage",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async () => {
            const { response } = await backEndAPI.deleteStage(id)
            return response
        })
)

export const postJob = createAction<Job, any>("postJob",
    (job) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            job.author = api.extractProfileUrn(me);
            const { response } = await backEndAPI.postJob(job)
            return response
        })
)

export const getJobs = createAction<{}, any>("getJobs",
    () => backEndAPI.getJobs());

export const updateJob = createAction<Job, any>("updateJob",
    (job) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            job.author = api.extractProfileUrn(me);
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

export const getUserIdByUrn = createAction<string, any>("getUserIdByUrn",
    (id) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, id);
            const experience = api.extractExperience(experienceResponse);
            return experience.urn;
        }));

export const getLatestStage = createAction<string, any>("getLatestStage",
    (url) => getCookies(LINKEDIN_DOMAIN)
        .then(async cookies => api.getCsrfToken(cookies))
        .then(async token => {
            const experienceResponse = await api.getExperience(token, url);
            const experience = api.extractExperience(experienceResponse);
            const profile = experience.urn;
            const me = await api.getMe(token);
            const as = api.extractProfileUrn(me);
            return backEndAPI.getLatestStage(profile,as);
        }));

export const assignJob = createAction("assignJob",
    (payload: { jobId: string, urn: string}) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const experienceResponse = await api.getExperience(token, payload.urn);
            const experience = api.extractExperience(experienceResponse);
            let profile= await api.getProfileDetails(token,payload.urn);
            let rcpntPrfl = {name: "", designation: "", profileImg: "", profileId: "", userId: ""};
            if(profile && profile.included[0]) {
                profile = profile.included[0];
                rcpntPrfl = {name: profile.firstName + ' ' + profile.lastName,
                    designation: profile.occupation,
                    profileImg: profile?.picture?.rootUrl + profile?.picture?.artifacts[0]?.fileIdentifyingUrlPathSegment,
                    profileId: payload.urn, userId: profile.publicIdentifier}
            }
            const prflImg = rcpntPrfl.profileImg ? rcpntPrfl.profileImg : 'https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q';
            const job: AssignedJob = {jobId: payload?.jobId, author: api.extractProfileUrn(me), userId: rcpntPrfl?.userId, profileId: rcpntPrfl?.profileId,
            companyName: experience?.company?.name, conversationUrn: experience?.conversationUrn, profileImg: prflImg, designation: rcpntPrfl?.designation, name: rcpntPrfl?.name };
            const { response } = await backEndAPI.assignJob(job)
            return response
        })
)

export const getAssignedJob = createAction("getAssignedJob",
    (payload: {url: string}) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const { response } = await backEndAPI.getAssignedJob(payload.url,api.extractProfileUrn(me));
            return response
        })
)

export const getMe = createAction("getMe", () => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            return await api.getMe(token)
        })
)

export const getAssignedJobsById = createAction<string, any>("getAssignedJobsById",
    (jobId) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const { response } = await backEndAPI.getAssignedJobsById(jobId,api.extractProfileUrn(me));
            return response
        })
)

export const setCustomSalary = createAction<Salary,any>("setCustomSalary",
    (payload: Salary) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const salary: CustomSalary = {id: payload.urn, author:api.extractProfileUrn(me), leftPayDistribution: payload.payDistributionValues[0],
                rightPayDistribution: payload.payDistributionValues[payload.payDistributionValues.length - 1], progressivePay: payload.progressivePay}
            const { response } = await backEndAPI.setCustomSalary(salary)
            return response
        })
)

export const getCustomSalary = createAction<string, any>("getCustomSalary",
    (urn) => getCookies(LINKEDIN_DOMAIN)
        .then(cookies => api.getCsrfToken(cookies))
        .then(async (token) => {
            const me = await api.getMe(token);
            const { response } = await backEndAPI.getCustomSalary(urn,api.extractProfileUrn(me));
            return response
        })
)
