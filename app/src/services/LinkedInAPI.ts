import Cookie = chrome.cookies.Cookie;
import {Badges} from "../global";
import * as JSONPath from "jsonpath";

function extractArtifacts(artifacts: Array<any>) {
    return artifacts ?
        artifacts.map((a: any) => ({
            width: a.width,
            height: a.height,
            path: a.fileIdentifyingUrlPathSegment
        }))
        : [];
}

export interface Experience {
    urn: string
    startMonth: number
    startYear: number
    endMonth?: number
    endYear?: number
    company?: {
        name: string
        universalName: string
        entityUrn: string
        url: string
    }
}

export class LinkedInAPI {

    public static readonly THE_COOKIE = 'li_at';
    private static readonly BASE = 'https://www.linkedin.com/voyager/api/';
    private static readonly CSRF = 'JSESSIONID';

    public isLogged(cookies: Cookie[]): boolean {
        const theCookie = cookies.find(c => c.name === LinkedInAPI.THE_COOKIE);
        return Number(theCookie?.expirationDate) * 1000 > new Date().getTime();
    }

    public getCsrfToken(cookies: Cookie[]): string {
        const token = cookies.find(c => c.name === LinkedInAPI.CSRF);
        return token?.value.replace(/['"]+/g, '');
    }

    public extractExperience(response: any): Experience {
        const urn = response.elements[0].entityUrn?.split(":").pop();
        const element = response.elements[0]?.profileTopPosition?.elements[0];
        const {month: startMonth, year: startYear} = element.dateRange?.start ?? {};
        const {month: endMonth, year: endYear} = element.dateRange?.end ?? {};
        let result = {urn, startMonth, startYear, endMonth, endYear} as Experience;
        if (element.company) {
            const {entityUrn, name, universalName, url} = element.company;
            result = {
                ...result,
                company: {name, universalName, entityUrn, url}
            };
        }
        return result;
    }

    public getExperience(token: string, id: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `identity/dash/profiles?q=memberIdentity&memberIdentity=${id}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.TopCardSupplementary-116`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractOrganization(response: any): Location {
        const allLocations = JSONPath.query(response, "$..locations").flatMap(l => l);
        const headquarters = allLocations.filter((l: any) => l.headquarter === true);
        if (headquarters.length > 0) {
            const location = headquarters[0];
            let {country, geographicArea: state, city} = location.address;
            if (!state) {
                state = city;
            }
            // @ts-ignore
            return {city, state, country};
        }
    }

    public getOrganization(token: string, universalName: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `graphql?includeWebMetadata=true&variables=(universalName:${universalName})&&queryId=voyagerOrganizationDashCompanies.b106540fe89e1f445200ecb8f7d907c4`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractTitle(response: any): any {
        const action = JSONPath.query(response, "$..pagedListComponent..components.entityComponent.textActionTarget").shift();
        const query = action ? "$..pagedListComponent..pagedListComponent..entityComponent.title.text" : "$..pagedListComponent..entityComponent.title.text";
        const titles = JSONPath.query(response, query);
        return {title: titles.shift().toString().trim()};
    }

    public getTitle(token: string, urn: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `graphql?includeWebMetadata=true&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A${urn},sectionType:experience)&&queryId=voyagerIdentityDashProfileComponents.f282c5d09ccfcf57303f170922b0c0fc`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractLocation(response: any): any {
        const {
            country: countryName,
            defaultLocalizedNameWithoutCountryName: locationName
        } = JSONPath.query(response, "$..geoLocation.geo").shift() as any;
        if (countryName) {
            const country = countryName.defaultLocalizedName;
            let location = locationName;
            if (location.indexOf(",") > 0) {
                location = locationName.split(",")
                    .map((t: string) => t.trim())
                    .filter((l: string) => l !== "");
            }
            if (Array.isArray(location)) {
                return {
                    city: location[0],
                    state: location.length > 1 ? location[1] : null,
                    country
                }
            } else {
                return {
                    city: location,
                    state: null,
                    country
                }
            }
        } else {
            return {
                city: null,
                state: null,
                country: locationName
            }
        }
    }

    public getLocation(token: string, id: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `identity/dash/profiles?decorationId=com.linkedin.voyager.dash.deco.identity.profile.WebTopCardCore-11&memberIdentity=${id}&q=memberIdentity`, this.getRequest(token))
            .then(response => response.json());
    }

    public getMe(token: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + "me", this.getRequest(token))
            .then(response => response.json());
    }

    public extractProfileUrn(response: any): string {
        return response.miniProfile?.entityUrn?.split(":").pop();
    }

    public getTabBadges(token: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + "voyagerCommunicationsTabBadges?q=tabBadges&countFrom=0", this.getRequest(token))
            .then(response => response.json());
    }

    public extractBadges(response: any): Badges {
        const badges = response.elements.map((e: { tab: any; count: any; }) => ({[e.tab]: e.count}))
        return Object.assign({}, ...badges);
    }

    public getConversations(token: string, profileUrn: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `voyagerMessagingGraphQL/graphql?queryId=messengerConversations.d5089df1b5a665ee527be74b9ab1859e&variables=(mailboxUrn:urn%3Ali%3Afsd_profile%3A${this.encode(profileUrn)})`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractConversations(response: any): Array<any> {

        function getParticipants(participants: Array<any>) {
            return participants.map(p => ({
                urn: p.entityUrn.split(":").pop(),
                profileUrl: p.participantType?.member?.profileUrl,
                firstName: p.participantType?.member?.firstName?.text,
                lastName: p.participantType?.member?.lastName?.text,
                profilePicture: {
                    rootUrl: p.participantType?.member?.profilePicture?.rootUrl,
                    artifacts: extractArtifacts(p.participantType?.member?.profilePicture?.artifacts)
                },
                distance: p.participantType?.member?.distance
            }))
        }

        function getMessages(messages: Array<any>) {
            return messages.map(m => ({
                deliveredAt: m.deliveredAt,
                urn: m.backendConversationUrn,
                body: m.body?.text
            }));
        }

        const conversations = response.data?.messengerConversationsBySyncToken;
        const elements = conversations?.elements as Array<any>;
        const result = elements.map(e => ({
            groupChat: e.groupChat,
            unreadCount: e.unreadCount,
            entityUrn: e.entityUrn,
            syncToken: conversations?.metadata?.newSyncToken,
            lastReadAt: e.lastReadAt,
            conversationParticipants: getParticipants(e.conversationParticipants),
            messages: getMessages(e.messages?.elements)
        }));
        return result;
    }

    public getConversationDetails(token: string, conversation: any): Promise<any> {
        return fetch(LinkedInAPI.BASE + `voyagerMessagingGraphQL/graphql?queryId=messengerMessages.08934c39ffb80ef0ba3206c05dd01362&variables=(conversationUrn:${this.encode(conversation.entityUrn)})`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractConversationDetails(response: any): Array<any> {
        function getSender(s: any) {
            const m = s?.participantType?.member;
            if (m) {
                return {
                    profileUrl: m.profileUrl,
                    firstName: m.firstName?.text,
                    lastName: m.lastName?.text,
                    distance: m.distance,
                    headline: m.headline?.text,
                    profilePicture: {
                        rootUrl: m.profilePicture?.rootUrl,
                        artifacts: extractArtifacts(m.profilePicture?.artifacts)
                    }
                }
            }
        }

        const elements = response.data?.messengerMessagesBySyncToken?.elements as Array<any>;
        const result = elements.map(e => ({
            text: e?.body?.text ? e?.body?.text : "This message contains media objects, please open original",
            openOriginal: !(e?.body?.text),
            showPicture: true,
            backendUrn: e.backendUrn,
            backendConversationUrn: e.backendConversationUrn,
            deliveredAt: e.deliveredAt,
            entityUrn: e.entityUrn,
            sender: getSender(e.sender),
            conversation: e.conversation?.entityUrn
        }));
        result.sort((a, b) => a.deliveredAt - b.deliveredAt);
        result.forEach((e, index, arr) => {
            if (index > 0 && arr[index - 1].sender?.profileUrl === e.sender?.profileUrl) {
                e.showPicture = false;
            }
        })
        return result;
    }

    public markConversationRead(token: string, entityUrn: string) {
        return fetch(LinkedInAPI.BASE + `voyagerMessagingDashMessengerConversations?ids=List(${this.encode(entityUrn)})`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"entities\":{\"${entityUrn}\":{\"patch\":{\"$set\":{\"read\":true}}}}}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public markAllMessageAsSeen(token: string, entityUrn: string) {
        return fetch(LinkedInAPI.BASE + `messaging/badge?action=markItemsAsSeen`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"items\":[\"${entityUrn}\"]}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public getNotifications(token: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + "voyagerIdentityDashNotificationCards?decorationId=com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-9&count=50&filterVanityName=all&q=filterVanityName", this.getRequest(token))
            .then(response => response.json());
    }

    public extractNotifications(response: any): Array<any> {
        function getHeaderImage(i: any) {
            // trying to get pictures
            const p1 = i?.attributes?.find((a: any) => a.detailData?.profilePicture);
            if (p1) {
                const picture = p1.detailData.profilePicture;
                const vectorImage = picture.profilePicture?.displayImageReference?.vectorImage;
                if (vectorImage?.artifacts) {
                    return {
                        rootUrl: vectorImage?.rootUrl,
                        artifacts: extractArtifacts(vectorImage?.artifacts)
                    };
                }
            }
            // getting images
            const p2 = i?.attributes?.find((a: any) => a.detailDataUnion?.imageUrl);
            if (p2) {
                return {url: p2.detailDataUnion?.imageUrl?.url};
            }
            // getting icons
            // TODO
        }

        function getActions(actions: Array<any>) {
            return actions.map((a: any) => ({
                displayText: a.displayText?.text,
                actionTarget: a.actionTarget
            }))
        }

        const elements = response.elements as Array<any>;
        const result = elements.map(e => ({
            read: e.read,
            publishedAt: e.publishedAt,
            entityUrn: e.entityUrn,
            headerImage: getHeaderImage(e.headerImage),
            headline: e.headline?.text,
            subHeadline: e.subHeadline?.text,
            cardAction: e.cardAction?.actionTarget,
            actions: getActions(e.actions)

        }));
        return result;
    }

    public getInvitations(token: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + "relationships/invitationViews?count=50&includeInsights=false&q=receivedInvitation&start=0", this.getRequest(token))
            .then(response => response.json());
    }

    public extractInvitations(response: any): Array<any> {

        function getFromMember(fromMember: any) {
            if (fromMember) {
                const picture = fromMember.picture;
                return {
                    firstName: fromMember.firstName,
                    lastName: fromMember.lastName,
                    occupation: fromMember.occupation,
                    publicIdentifier: fromMember.publicIdentifier,
                    picture: picture && picture["com.linkedin.common.VectorImage"] ? {
                        rootUrl: picture["com.linkedin.common.VectorImage"]?.rootUrl,
                        artifacts: extractArtifacts(picture["com.linkedin.common.VectorImage"]?.artifacts)
                    } : {}
                }
            }
        }

        const elements = response.elements as Array<any>;
        const result = elements.map(i => {
            const invitation = i.invitation;
            return {
                urn: i?.entityUrn,
                sharedSecret: invitation?.sharedSecret,
                invitationType: invitation?.invitationType,
                sentTime: invitation?.sentTime,
                customMessage: invitation?.customMessage,
                message: invitation?.message,
                unseen: invitation?.unseen,
                fromMember: getFromMember(invitation?.fromMember)
            }
        });
        return result;
    }

    public handleInvitation(token: string, invitation: any) {
        return fetch(LinkedInAPI.BASE + `relationships/invitations/${invitation.id}?action=${invitation.action}`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"invitationId\":\"${invitation.id}\",\"invitationSharedSecret\":\"${invitation.sharedSecret}\",\"isGenericInvitation\":false}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public markAllNotificationsAsSeen(token: string) {
        return fetch(LinkedInAPI.BASE + `voyagerNotificationsDashBadge?action=markAllItemsAsSeen`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"until\": ${new Date().getTime()}}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public markNotificationRead(token: string, entityUrn: string) {
        return fetch(LinkedInAPI.BASE + `voyagerNotificationsDashBadge?action=markItemAsRead`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"item\": \"${entityUrn}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public repost(token: string, shareUrn: string) {
        return fetch("https://www.linkedin.com/voyager/api/contentcreation/normShares", {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": `{\"visibleToConnectionsOnly\":false,\"externalAudienceProviders\":[],\"commentaryV2\":{\"text\":\"\",\"attributes\":[]},\"origin\":\"SHARE_AS_IS\",\"allowedCommentersScope\":\"NONE\",\"postState\":\"PUBLISHED\",\"parentUrn\":\"${shareUrn}\"}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => true);
    }

    public getUpdates(token: string, count: number): Promise<any> {
        return fetch(LinkedInAPI.BASE + `feed/updatesV2?commentsCount=0&count=${count}&likesCount=0&moduleKey=home-feed%3Adesktop&q=chronFeed`, this.getRequest(token))
            .then(response => response.json());
    }

    public extractUpdates(response: any): any {
        const paginationToken = response.metadata?.paginationToken;
        const paginationTokenExpiryTime = response.metadata?.paginationTokenExpiryTime;
        const queryAfterTime = response.metadata?.queryAfterTime;
        const threads = response.elements?.map((e: any) => {
            const [miniProfile] = JSONPath.query(e, "$.actor.name.attributes..miniProfile.entityUrn");
            const [miniCompany] = JSONPath.query(e, "$.actor.name.attributes..miniCompany.entityUrn");
            const urn = JSONPath.query(e, "$.socialDetail.urn")?.pop();
            const shareUrn = JSONPath.query(e, "$.updateMetadata.shareUrn")?.pop();
            return {author: {miniCompany, miniProfile}, urn, shareUrn};
        })
        return {paginationToken, paginationTokenExpiryTime, queryAfterTime, threads};
    }

    public like(token: string, urn: string) {
        return fetch(LinkedInAPI.BASE + `voyagerSocialDashReactions?threadUrn=${this.encode(urn)}`, {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "csrf-token": token,
            },
            "body": "{\"reactionType\":\"LIKE\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(_ => null);
    }

    public extractProfile(id: string, response: any): any {
        const actor = response.included.filter((i: any) => i.actor !== undefined);
        const name = actor?.length > 0 ? JSONPath.query(actor[0], "$.actor.name.text") : "Not found";
        let result: any = {name};
        const profile = response.included.filter((i: any) => i.entityUrn === `urn:li:fsd_profile:${id}`);
        const vectorImage = JSONPath.query(profile[0], "$..vectorImage");
        if (vectorImage?.length > 0) {
            const artifacts = extractArtifacts(vectorImage[0].artifacts);
            const rootUrl = vectorImage[0].rootUrl;
            result = {...result, profilePicture: {rootUrl, artifacts}}
        }
        return result;
    }

    public getProfile(token: string, id: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + `graphql?variables=(profileUrn:urn%3Ali%3Afsd_profile%3A${id})&&queryId=voyagerIdentityDashProfileCards.22e7cccbd773ceef5ed7c2c9d195473a`,
            this.getRequest(token, {"accept": "application/vnd.linkedin.normalized+json+2.1"}))
            .then(response => response.json());
    }

    private getRequest(token: string, headers?: any): any {
        let defaultHeaders = {
            "accept": "application/graphql",
            "csrf-token": token,
        };
        if (headers) {
            defaultHeaders = {...defaultHeaders, ...headers};
        }
        return {
            "headers": defaultHeaders,
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }
    }

    private encode(src: string): string {
        return encodeURIComponent(src)
            .replace("(", "%28")
            .replace(")", "%29");
    }

}