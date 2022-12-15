import Cookie = chrome.cookies.Cookie;
import {Badges} from "../global";

function extractArtifacts(artifacts: Array<any>) {
    return artifacts ?
        artifacts.map((a: any) => ({
            width: a.width,
            height: a.height,
            path: a.fileIdentifyingUrlPathSegment
        }))
        : [];
}

export class LinkedInAPI {

    public static readonly THE_COOKIE = 'li_at';
    private static readonly BASE = 'https://www.linkedin.com/voyager/api/';
    private static readonly CSRF = 'JSESSIONID';
    private static readonly MAGIC_NUMBER = 'd5089df1b5a665ee527be74b9ab1859e';

    public isLogged(cookies: Cookie[]): boolean {
        const theCookie = cookies.find(c => c.name === LinkedInAPI.THE_COOKIE);
        return Number(theCookie?.expirationDate) * 1000 > new Date().getTime();
    }

    public getCsrfToken(cookies: Cookie[]): string {
        const token = cookies.find(c => c.name === LinkedInAPI.CSRF);
        return token?.value.replace(/['"]+/g, '');
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
        return fetch(LinkedInAPI.BASE + `voyagerMessagingGraphQL/graphql?queryId=messengerConversations.${LinkedInAPI.MAGIC_NUMBER}&variables=(mailboxUrn:urn%3Ali%3Afsd_profile%3A${profileUrn})`, this.getRequest(token))
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
                urn: m.entityUrn,
                body: m.body?.text
            }));
        }

        const elements = response.data?.messengerConversationsBySyncToken?.elements as Array<any>;
        const result = elements.map(e => ({
            groupChat: e.groupChat,
            unreadCount: e.unreadCount,
            lastReadAt: e.lastReadAt,
            conversationParticipants: getParticipants(e.conversationParticipants),
            messages: getMessages(e.messages?.elements)
        }));
        return result;
    }

    public getNotifications(token: string): Promise<any> {
        return fetch(LinkedInAPI.BASE + "voyagerIdentityDashNotificationCards?decorationId=com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-9&count=50&filterVanityName=all&q=filterVanityName", this.getRequest(token))
            .then(response => response.json());
    }

    public extractNotifications(response: any): Array<any> {
        function getHeaderImage(i: any) {
            const p = i?.attributes?.find((a: any) => a.detailData?.profilePicture)
            if (p) {
                const picture = p.detailData.profilePicture;
                const vectorImage = picture.profilePicture?.displayImageReference?.vectorImage;
                if (vectorImage?.artifacts) {
                    return {
                        rootUrl: vectorImage?.rootUrl,
                        artifacts: extractArtifacts(vectorImage?.artifacts)
                    };
                }
            }
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
                message: invitation?.message,
                invitationType: invitation?.invitationType,
                sentTime: invitation?.sentTime,
                customMessage: invitation?.customMessage,
                unseen: invitation?.unseen,
                fromMember: getFromMember(invitation?.fromMember)
            }
        });
        return result;
    }

    private getRequest(token: string): any {
        return {
            "headers": {
                "accept": "application/graphql",
                "csrf-token": token,
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }
    }

}