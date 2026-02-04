import { DocumentNode } from "graphql/language/ast";
import * as L from "./_generated_documents";
/** The function for calling the graphql client */
export declare type LinearRequest = <Response, Variables extends Record<string, unknown>>(doc: DocumentNode, variables?: Variables) => Promise<Response>;
/**
 * Base class to provide a request function
 *
 * @param request - function to call the graphql client
 */
export declare class Request {
    protected _request: LinearRequest;
    constructor(request: LinearRequest);
    /**
     * Helper to paginate over all pages of a given connection query.
     * @param fn The query to paginate
     * @param args The arguments to pass to the query
     */
    paginate<T extends Node, U>(fn: (variables: U) => LinearFetch<Connection<T>>, args: U): Promise<T[]>;
}
/** Fetch return type wrapped in a promise */
export declare type LinearFetch<Response> = Promise<Response>;
/**
 * Variables required for pagination
 * Follows the Relay spec
 */
export declare type LinearConnectionVariables = {
    after?: string | null;
    before?: string | null;
    first?: number | null;
    last?: number | null;
};
/**
 * Connection models containing a list of nodes and pagination information
 * Follows the Relay spec
 */
export declare class LinearConnection<Node> extends Request {
    pageInfo: PageInfo;
    nodes: Node[];
    constructor(request: LinearRequest);
}
/**
 * The base connection class to provide pagination
 * Follows the Relay spec
 *
 * @param request - function to call the graphql client
 * @param fetch - Function to refetch the connection given different pagination variables
 * @param nodes - The list of models to initialize the connection
 * @param pageInfo - The pagination information to initialize the connection
 */
export declare class Connection<Node> extends LinearConnection<Node> {
    private _fetch;
    constructor(request: LinearRequest, fetch: (variables?: LinearConnectionVariables) => LinearFetch<LinearConnection<Node> | undefined>, nodes: Node[], pageInfo: PageInfo);
    /** Add nodes to the end of the existing nodes */
    private _appendNodes;
    /** Add nodes to the start of the existing nodes */
    private _prependNodes;
    /** Update the pagination end cursor */
    private _appendPageInfo;
    /** Update the pagination start cursor */
    private _prependPageInfo;
    /** Fetch the next page of results and append to nodes */
    fetchNext(): Promise<this>;
    /** Fetch the previous page of results and prepend to nodes */
    fetchPrevious(): Promise<this>;
}
/**
 * A bot actor is an actor that is not a user, but an application or integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.ActorBotFragment response data
 */
export declare class ActorBot extends Request {
    constructor(request: LinearRequest, data: L.ActorBotFragment);
    /** A url pointing to the avatar representing this bot. */
    avatarUrl?: string;
    id?: string;
    /** The display name of the bot. */
    name?: string;
    /** The sub type of the bot. */
    subType?: string;
    /** The type of bot. */
    type: string;
    /** The display name of the external user on behalf of which the bot acted. */
    userDisplayName?: string;
}
/**
 * An API key. Grants access to the user's resources.
 *
 * @param request - function to call the graphql client
 * @param data - L.ApiKeyFragment response data
 */
export declare class ApiKey extends Request {
    constructor(request: LinearRequest, data: L.ApiKeyFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The label of the API key. */
    label: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
}
/**
 * ApiKeyConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ApiKeyConnection model
 * @param data - ApiKeyConnection response data
 */
export declare class ApiKeyConnection extends Connection<ApiKey> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ApiKey> | undefined>, data: L.ApiKeyConnectionFragment);
}
/**
 * ApiKeyPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ApiKeyPayloadFragment response data
 */
export declare class ApiKeyPayload extends Request {
    constructor(request: LinearRequest, data: L.ApiKeyPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The API key that was created. */
    apiKey: ApiKey;
}
/**
 * Public information of the OAuth application.
 *
 * @param request - function to call the graphql client
 * @param data - L.ApplicationFragment response data
 */
export declare class Application extends Request {
    constructor(request: LinearRequest, data: L.ApplicationFragment);
    /** OAuth application's client ID. */
    clientId: string;
    /** Information about the application. */
    description?: string;
    /** Name of the developer. */
    developer: string;
    /** Url of the developer (homepage or docs). */
    developerUrl: string;
    /** OAuth application's ID. */
    id: string;
    /** Image of the application. */
    imageUrl?: string;
    /** Application name. */
    name: string;
}
/**
 * A generic payload return from entity archive or deletion mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.ArchivePayloadFragment response data
 */
export declare class ArchivePayload extends Request {
    constructor(request: LinearRequest, data: L.ArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Contains requested archived model objects.
 *
 * @param request - function to call the graphql client
 * @param data - L.ArchiveResponseFragment response data
 */
export declare class ArchiveResponse extends Request {
    constructor(request: LinearRequest, data: L.ArchiveResponseFragment);
    /** A JSON serialized collection of model objects loaded from the archive */
    archive: string;
    /** The version of the remote database. Incremented by 1 for each migration run on the database. */
    databaseVersion: number;
    /** Whether the dependencies for the model objects are included in the archive. */
    includesDependencies: boolean;
    /** The total number of entities in the archive. */
    totalCount: number;
}
/**
 * AsksChannelConnectPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AsksChannelConnectPayloadFragment response data
 */
export declare class AsksChannelConnectPayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.AsksChannelConnectPayloadFragment);
    /** Whether the bot needs to be manually added to the channel. */
    addBot: boolean;
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The new Asks Slack channel mapping for the connected channel. */
    mapping: SlackChannelNameMapping;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * Issue attachment (e.g. support ticket, pull request).
 *
 * @param request - function to call the graphql client
 * @param data - L.AttachmentFragment response data
 */
export declare class Attachment extends Request {
    private _creator?;
    private _externalUserCreator?;
    private _issue;
    constructor(request: LinearRequest, data: L.AttachmentFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Indicates if attachments for the same source application should be grouped in the Linear UI. */
    groupBySource: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** Custom metadata related to the attachment. */
    metadata: L.Scalars["JSONObject"];
    /** Information about the source which created the attachment. */
    source?: L.Scalars["JSONObject"];
    /** An accessor helper to source.type, defines the source type of the attachment. */
    sourceType?: string;
    /** Content for the subtitle line in the Linear attachment widget. */
    subtitle?: string;
    /** Content for the title line in the Linear attachment widget. */
    title: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Location of the attachment which is also used as an identifier. */
    url: string;
    /** The creator of the attachment. */
    get creator(): LinearFetch<User> | undefined;
    /** The non-Linear user who created the attachment. */
    get externalUserCreator(): LinearFetch<ExternalUser> | undefined;
    /** The issue this attachment belongs to. */
    get issue(): LinearFetch<Issue> | undefined;
    /** [DEPRECATED] Archives an issue attachment. */
    archive(): LinearFetch<AttachmentArchivePayload>;
    /** Creates a new attachment, or updates existing if the same `url` and `issueId` is used. */
    create(input: L.AttachmentCreateInput): LinearFetch<AttachmentPayload>;
    /** Deletes an issue attachment. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing issue attachment. */
    update(input: L.AttachmentUpdateInput): LinearFetch<AttachmentPayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.AttachmentArchivePayloadFragment response data
 */
export declare class AttachmentArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.AttachmentArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Attachment> | undefined;
}
/**
 * AttachmentConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this AttachmentConnection model
 * @param data - AttachmentConnection response data
 */
export declare class AttachmentConnection extends Connection<Attachment> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Attachment> | undefined>, data: L.AttachmentConnectionFragment);
}
/**
 * AttachmentPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AttachmentPayloadFragment response data
 */
export declare class AttachmentPayload extends Request {
    private _attachment;
    constructor(request: LinearRequest, data: L.AttachmentPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The issue attachment that was created. */
    get attachment(): LinearFetch<Attachment> | undefined;
}
/**
 * AttachmentSourcesPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AttachmentSourcesPayloadFragment response data
 */
export declare class AttachmentSourcesPayload extends Request {
    constructor(request: LinearRequest, data: L.AttachmentSourcesPayloadFragment);
    /** A unique list of all source types used in this workspace. */
    sources: L.Scalars["JSONObject"];
}
/**
 * Workspace audit log entry object.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuditEntryFragment response data
 */
export declare class AuditEntry extends Request {
    private _actor?;
    constructor(request: LinearRequest, data: L.AuditEntryFragment);
    /** The ID of the user that caused the audit entry to be created. */
    actorId?: string;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Country code of request resulting to audit entry. */
    countryCode?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** IP from actor when entry was recorded. */
    ip?: string;
    /** Additional metadata related to the audit entry. */
    metadata?: L.Scalars["JSONObject"];
    /** Additional information related to the request which performed the action. */
    requestInformation?: L.Scalars["JSONObject"];
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user that caused the audit entry to be created. */
    get actor(): LinearFetch<User> | undefined;
    /** The organization the audit log belongs to. */
    get organization(): LinearFetch<Organization>;
}
/**
 * AuditEntryConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this AuditEntryConnection model
 * @param data - AuditEntryConnection response data
 */
export declare class AuditEntryConnection extends Connection<AuditEntry> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<AuditEntry> | undefined>, data: L.AuditEntryConnectionFragment);
}
/**
 * AuditEntryType model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuditEntryTypeFragment response data
 */
export declare class AuditEntryType extends Request {
    constructor(request: LinearRequest, data: L.AuditEntryTypeFragment);
    /** Description of the audit entry type. */
    description: string;
    /** The audit entry type. */
    type: string;
}
/**
 * AuthApiKey model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthApiKeyFragment response data
 */
export declare class AuthApiKey extends Request {
    constructor(request: LinearRequest, data: L.AuthApiKeyFragment);
    /** The unique identifier of the entity. */
    id: string;
}
/**
 * AuthApiKeyPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthApiKeyPayloadFragment response data
 */
export declare class AuthApiKeyPayload extends Request {
    constructor(request: LinearRequest, data: L.AuthApiKeyPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
    /** The auth API key that was created. */
    authApiKey: AuthApiKey;
}
/**
 * An email address that can be used for submitting issues.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthEmailIntakeAddressFragment response data
 */
export declare class AuthEmailIntakeAddress extends Request {
    constructor(request: LinearRequest, data: L.AuthEmailIntakeAddressFragment);
    /** Unique email address user name (before @) used for incoming email. */
    address: string;
    /** Whether the email address is enabled. */
    enabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** The auth user who created the email intake address. */
    creator?: AuthUser;
    /** The auth organization that the email address is associated with. */
    organization: AuthOrganization;
}
/**
 * AuthIntegration model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthIntegrationFragment response data
 */
export declare class AuthIntegration extends Request {
    constructor(request: LinearRequest, data: L.AuthIntegrationFragment);
    /** The unique identifier of the entity. */
    id: string;
}
/**
 * AuthOauthClient model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOauthClientFragment response data
 */
export declare class AuthOauthClient extends Request {
    constructor(request: LinearRequest, data: L.AuthOauthClientFragment);
    archivedAt?: Date;
    /** OAuth application's client ID. */
    clientId: string;
    /** OAuth application's client secret. */
    clientSecret: string;
    /** The ID of the user who created the OAuth application. */
    creatorId: string;
    /** Information about the application. */
    description?: string;
    /** Name of the developer. */
    developer: string;
    /** Url of the developer. */
    developerUrl: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Image of the application. */
    imageUrl?: string;
    /** OAuth application's client name. */
    name: string;
    /** The ID of the workspace the OAuth application belongs to. */
    organizationId: string;
    /** Whether the OAuth application can be installed in other organizations. */
    publicEnabled: boolean;
    /** List of allowed redirect URIs for the application. */
    redirectUris: string[];
    /** The resource types to request when creating new webhooks. */
    webhookResourceTypes: string[];
    /** Webhook secret */
    webhookSecret?: string;
    /** Webhook URL */
    webhookUrl?: string;
}
/**
 * AuthOauthClient with token creator IDs and counts (memberships), for use in the GraphQL API.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOauthClientWithMembershipsFragment response data
 */
export declare class AuthOauthClientWithMemberships extends Request {
    constructor(request: LinearRequest, data: L.AuthOauthClientWithMembershipsFragment);
    /** OAuth application's ID. */
    appId: string;
    /** OAuth application's client ID. */
    clientId: string;
    /** Image of the application. */
    imageUrl?: string;
    /** Application name. */
    name: string;
    /** Scopes that are authorized for this application for a given user. */
    scope: string[];
    /** Total number of members that authorized the application. */
    totalMembers: number;
    /** The application's webhook URL. */
    webhookUrl?: string;
}
/**
 * AuthOauthClient with scope from OauthToken, for use in the GraphQL API.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOauthClientWithScopeFragment response data
 */
export declare class AuthOauthClientWithScope extends Request {
    constructor(request: LinearRequest, data: L.AuthOauthClientWithScopeFragment);
    /** OAuth application's ID. */
    appId: string;
    /** OAuth application's client ID. */
    clientId: string;
    /** Image of the application. */
    imageUrl?: string;
    /** Application name. */
    name: string;
    /** Scopes that are authorized for this application for a given user. */
    scope: string[];
    /** The application's webhook URL. */
    webhookUrl?: string;
}
/**
 * AuthOauthClientWithTokens model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOauthClientWithTokensFragment response data
 */
export declare class AuthOauthClientWithTokens extends Request {
    constructor(request: LinearRequest, data: L.AuthOauthClientWithTokensFragment);
    /** The token matching the app, scope, and actor. */
    tokens: OauthToken[];
    /** The auth OAuth client. */
    client: AuthOauthClient;
}
/**
 * An organization. Organizations are root-level objects that contain users and teams.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationFragment response data
 */
export declare class AuthOrganization extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationFragment);
    /** Allowed authentication providers, empty array means all are allowed */
    allowedAuthServices: string[];
    /** The time at which deletion of the organization was requested. */
    deletionRequestedAt?: Date;
    /** Whether the organization is enabled. Used as a superuser tool to lock down the org. */
    enabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** The organization's logo URL. */
    logoUrl?: string;
    /** The organization's name. */
    name: string;
    /** Previously used URL keys for the organization (last 3 are kept and redirected). */
    previousUrlKeys: string[];
    /** The region the organization is hosted in. */
    region: string;
    /** Whether SAML authentication is enabled for organization. */
    samlEnabled: boolean;
    /** Whether SCIM provisioning is enabled for organization. */
    scimEnabled: boolean;
    /** The email domain or URL key for the organization. */
    serviceId: string;
    /** The organization's unique URL key. */
    urlKey: string;
    userCount: number;
    /** The feature release channel the organization belongs to. */
    releaseChannel: L.ReleaseChannel;
}
/**
 * AuthOrganizationBucketNamePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationBucketNamePayloadFragment response data
 */
export declare class AuthOrganizationBucketNamePayload extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationBucketNamePayloadFragment);
    /** The imports bucket name for the organization. */
    importsBucketName: string;
    /** The region for the organization. */
    region: string;
    /** The uploads bucket name for the organization. */
    uploadsBucketName: string;
}
/**
 * AuthOrganizationDomain model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationDomainFragment response data
 */
export declare class AuthOrganizationDomain extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationDomainFragment);
    claimed?: boolean;
    /** Prevent users with this domain to create new workspaces. */
    disableOrganizationCreation?: boolean;
    /** The unique identifier of the entity. */
    id: string;
    name: string;
    organizationId: string;
    verified: boolean;
    authType: L.OrganizationDomainAuthType;
}
/**
 * AuthOrganizationExistsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationExistsPayloadFragment response data
 */
export declare class AuthOrganizationExistsPayload extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationExistsPayloadFragment);
    /** Whether the organization exists. */
    exists: boolean;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * An invitation to the organization that has been sent via email.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationInviteFragment response data
 */
export declare class AuthOrganizationInvite extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationInviteFragment);
    /** The time at which the invite will be expiring. Null, if the invite shouldn't expire. */
    expiresAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
}
/**
 * AuthOrganizationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthOrganizationPayloadFragment response data
 */
export declare class AuthOrganizationPayload extends Request {
    constructor(request: LinearRequest, data: L.AuthOrganizationPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
    /** The auth organization that was updated. */
    authOrganization: AuthOrganization;
}
/**
 * AuthResolverResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthResolverResponseFragment response data
 */
export declare class AuthResolverResponse extends Request {
    constructor(request: LinearRequest, data: L.AuthResolverResponseFragment);
    /** Should the signup flow allow access for the domain. */
    allowDomainAccess?: boolean;
    /** Email for the authenticated account. */
    email: string;
    /** User account ID. */
    id: string;
    /** ID of the organization last accessed by the user. */
    lastUsedOrganizationId?: string;
    /** Application token. */
    token?: string;
    /** List of organizations allowing this user account to join automatically. */
    availableOrganizations?: AuthOrganization[];
    /** List of organization available to this user account but locked due to the current auth method. */
    lockedOrganizations?: AuthOrganization[];
    /** List of locked users that are locked by login restrictions */
    lockedUsers: AuthUser[];
    /** List of active users that belong to the user account. */
    users: AuthUser[];
}
/**
 * AuthSuccessPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthSuccessPayloadFragment response data
 */
export declare class AuthSuccessPayload extends Request {
    constructor(request: LinearRequest, data: L.AuthSuccessPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * A user that has access to the the resources of an organization.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthUserFragment response data
 */
export declare class AuthUser extends Request {
    constructor(request: LinearRequest, data: L.AuthUserFragment);
    /** Whether the user is active. */
    active: boolean;
    /** An URL to the user's avatar image. */
    avatarUrl?: string;
    /** The user's display (nick) name. Unique within each organization. */
    displayName: string;
    /** The user's email address. */
    email: string;
    id: string;
    /** The user's full name. */
    name: string;
    /** User account ID the user belongs to. */
    userAccountId: string;
    /** Organization the user belongs to. */
    organization: AuthOrganization;
    /** Whether the user is an organization admin or guest on a database level. */
    role: L.UserRoleType;
}
/**
 * User authentication session.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthenticationSessionFragment response data
 */
export declare class AuthenticationSession extends Request {
    constructor(request: LinearRequest, data: L.AuthenticationSessionFragment);
    /** Used web browser. */
    browserType?: string;
    /** Client used for the session */
    client?: string;
    /** Country codes of all seen locations. */
    countryCodes: string[];
    /** Date when the session was created. */
    createdAt: Date;
    id: string;
    /** IP address. */
    ip?: string;
    /** When was the session last seen */
    lastActiveAt?: Date;
    /** Human readable location */
    location?: string;
    /** Location city name. */
    locationCity?: string;
    /** Location country name. */
    locationCountry?: string;
    /** Location country code. */
    locationCountryCode?: string;
    /** Location region code. */
    locationRegionCode?: string;
    /** Name of the session, derived from the client and operating system */
    name: string;
    /** Operating system used for the session */
    operatingSystem?: string;
    /** Date when the session was last updated. */
    updatedAt: Date;
    /** Session's user-agent. */
    userAgent?: string;
    /** Type of application used to authenticate. */
    type: L.AuthenticationSessionType;
}
/**
 * Authentication session information.
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthenticationSessionResponseFragment response data
 */
export declare class AuthenticationSessionResponse extends Request {
    constructor(request: LinearRequest, data: L.AuthenticationSessionResponseFragment);
    /** Used web browser. */
    browserType?: string;
    /** Client used for the session */
    client?: string;
    /** Country codes of all seen locations. */
    countryCodes: string[];
    /** Date when the session was created. */
    createdAt: Date;
    id: string;
    /** IP address. */
    ip?: string;
    /** Identifies the session used to make the request. */
    isCurrentSession: boolean;
    /** When was the session last seen */
    lastActiveAt?: Date;
    /** Human readable location */
    location?: string;
    /** Location city name. */
    locationCity?: string;
    /** Location country name. */
    locationCountry?: string;
    /** Location country code. */
    locationCountryCode?: string;
    /** Location region code. */
    locationRegionCode?: string;
    /** Name of the session, derived from the client and operating system */
    name: string;
    /** Operating system used for the session */
    operatingSystem?: string;
    /** Date when the session was last updated. */
    updatedAt: Date;
    /** Session's user-agent. */
    userAgent?: string;
    /** Type of application used to authenticate. */
    type: L.AuthenticationSessionType;
}
/**
 * AuthorizedApplicationBase model
 *
 * @param request - function to call the graphql client
 * @param data - L.AuthorizedApplicationBaseFragment response data
 */
export declare class AuthorizedApplicationBase extends Request {
    constructor(request: LinearRequest, data: L.AuthorizedApplicationBaseFragment);
    /** OAuth application's ID. */
    appId: string;
    /** OAuth application's client ID. */
    clientId: string;
    /** Image of the application. */
    imageUrl?: string;
    /** Application name. */
    name: string;
    /** Scopes that are authorized for this application for a given user. */
    scope: string[];
}
/**
 * A comment associated with an issue.
 *
 * @param request - function to call the graphql client
 * @param data - L.CommentFragment response data
 */
export declare class Comment extends Request {
    private _externalUser?;
    private _issue?;
    private _parent?;
    private _projectUpdate?;
    private _resolvingComment?;
    private _resolvingUser?;
    private _user?;
    constructor(request: LinearRequest, data: L.CommentFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The comment content in markdown format. */
    body: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The time user edited the comment. */
    editedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The text that this comment references. Only defined for inline comments. */
    quotedText?: string;
    /** Emoji reaction summary, grouped by emoji type. */
    reactionData: L.Scalars["JSONObject"];
    /** The time the resolvingUser resolved the thread. */
    resolvedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Comment's URL. */
    url: string;
    /** Reactions associated with the comment. */
    reactions: Reaction[];
    /** The bot that created the comment. */
    botActor?: ActorBot;
    /** The document content that the comment is associated with. */
    documentContent?: DocumentContent;
    /** The external user who wrote the comment. */
    get externalUser(): LinearFetch<ExternalUser> | undefined;
    /** The issue that the comment is associated with. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The parent comment under which the current comment is nested. */
    get parent(): LinearFetch<Comment> | undefined;
    /** The project update that the comment is associated with. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
    /** The comment that resolved the thread. */
    get resolvingComment(): LinearFetch<Comment> | undefined;
    /** The user that resolved the thread. */
    get resolvingUser(): LinearFetch<User> | undefined;
    /** The user who wrote the comment. */
    get user(): LinearFetch<User> | undefined;
    /** The children of the comment. */
    children(variables?: L.Comment_ChildrenQueryVariables): LinearFetch<CommentConnection>;
    /** Creates a new comment. */
    create(input: L.CommentCreateInput): LinearFetch<CommentPayload>;
    /** Deletes a comment. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a comment. */
    update(input: L.CommentUpdateInput): LinearFetch<CommentPayload>;
}
/**
 * CommentConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this CommentConnection model
 * @param data - CommentConnection response data
 */
export declare class CommentConnection extends Connection<Comment> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Comment> | undefined>, data: L.CommentConnectionFragment);
}
/**
 * A comment related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.CommentNotificationFragment response data
 */
export declare class CommentNotification extends Request {
    constructor(request: LinearRequest, data: L.CommentNotificationFragment);
    /** Related comment ID. Null if the notification is not related to a comment. */
    commentId?: string;
    /** Related parent comment ID. Null if the notification is not related to a comment. */
    parentCommentId?: string;
    /** Name of the reaction emoji related to the notification. */
    reactionEmoji?: string;
}
/**
 * CommentPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CommentPayloadFragment response data
 */
export declare class CommentPayload extends Request {
    private _comment;
    constructor(request: LinearRequest, data: L.CommentPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The comment that was created or updated. */
    get comment(): LinearFetch<Comment> | undefined;
}
/**
 * ContactPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ContactPayloadFragment response data
 */
export declare class ContactPayload extends Request {
    constructor(request: LinearRequest, data: L.ContactPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * CreateCsvExportReportPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CreateCsvExportReportPayloadFragment response data
 */
export declare class CreateCsvExportReportPayload extends Request {
    constructor(request: LinearRequest, data: L.CreateCsvExportReportPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * CreateOrJoinOrganizationResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.CreateOrJoinOrganizationResponseFragment response data
 */
export declare class CreateOrJoinOrganizationResponse extends Request {
    constructor(request: LinearRequest, data: L.CreateOrJoinOrganizationResponseFragment);
    organization: AuthOrganization;
    user: AuthUser;
}
/**
 * A custom view that has been saved by a user.
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomViewFragment response data
 */
export declare class CustomView extends Request {
    private _creator;
    private _owner;
    private _team?;
    private _updatedBy?;
    constructor(request: LinearRequest, data: L.CustomViewFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The color of the icon of the custom view. */
    color?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the custom view. */
    description?: string;
    /** The filter applied to issues in the custom view. */
    filterData: L.Scalars["JSONObject"];
    /** The filters applied to issues in the custom view. */
    filters: L.Scalars["JSONObject"];
    /** The icon of the custom view. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The model name of the custom view. */
    modelName: string;
    /** The name of the custom view. */
    name: string;
    /** The filter applied to projects in the custom view. */
    projectFilterData?: L.Scalars["JSONObject"];
    /** Whether the custom view is shared with everyone in the organization. */
    shared: boolean;
    /** The custom view's unique URL slug. */
    slugId?: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The organizations default view preferences for this custom view. */
    organizationViewPreferences?: ViewPreferences;
    /** The current users view preferences for this custom view. */
    userViewPreferences?: ViewPreferences;
    /** The calculated view preferences values for this custom view. */
    viewPreferencesValues?: ViewPreferencesValues;
    /** The user who created the custom view. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization of the custom view. */
    get organization(): LinearFetch<Organization>;
    /** The user who owns the custom view. */
    get owner(): LinearFetch<User> | undefined;
    /** The team associated with the custom view. */
    get team(): LinearFetch<Team> | undefined;
    /** The user who last updated the custom view. */
    get updatedBy(): LinearFetch<User> | undefined;
    /** Issues associated with the custom view. */
    issues(variables?: Omit<L.CustomView_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Projects associated with the custom view. */
    projects(variables?: Omit<L.CustomView_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
    /** Creates a new custom view. */
    create(input: L.CustomViewCreateInput): LinearFetch<CustomViewPayload>;
    /** Deletes a custom view. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a custom view. */
    update(input: L.CustomViewUpdateInput): LinearFetch<CustomViewPayload>;
}
/**
 * CustomViewConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this CustomViewConnection model
 * @param data - CustomViewConnection response data
 */
export declare class CustomViewConnection extends Connection<CustomView> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<CustomView> | undefined>, data: L.CustomViewConnectionFragment);
}
/**
 * CustomViewHasSubscribersPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomViewHasSubscribersPayloadFragment response data
 */
export declare class CustomViewHasSubscribersPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomViewHasSubscribersPayloadFragment);
    /** Whether the custom view has subscribers. */
    hasSubscribers: boolean;
}
/**
 * A custom view notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomViewNotificationSubscriptionFragment response data
 */
export declare class CustomViewNotificationSubscription extends Request {
    private _customView;
    private _cycle?;
    private _initiative?;
    private _label?;
    private _project?;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.CustomViewNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The custom view subscribed to. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * CustomViewPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomViewPayloadFragment response data
 */
export declare class CustomViewPayload extends Request {
    private _customView;
    constructor(request: LinearRequest, data: L.CustomViewPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The custom view that was created or updated. */
    get customView(): LinearFetch<CustomView> | undefined;
}
/**
 * CustomViewSuggestionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomViewSuggestionPayloadFragment response data
 */
export declare class CustomViewSuggestionPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomViewSuggestionPayloadFragment);
    /** The suggested view description. */
    description?: string;
    /** The suggested view icon. */
    icon?: string;
    /** The suggested view name. */
    name?: string;
}
/**
 * CustomerNeedPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomerNeedPayloadFragment response data
 */
export declare class CustomerNeedPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomerNeedPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * CustomerPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomerPayloadFragment response data
 */
export declare class CustomerPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomerPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * CustomerStatusPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomerStatusPayloadFragment response data
 */
export declare class CustomerStatusPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomerStatusPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * CustomerTierPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CustomerTierPayloadFragment response data
 */
export declare class CustomerTierPayload extends Request {
    constructor(request: LinearRequest, data: L.CustomerTierPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * A set of issues to be resolved in a specified amount of time.
 *
 * @param request - function to call the graphql client
 * @param data - L.CycleFragment response data
 */
export declare class Cycle extends Request {
    private _team;
    constructor(request: LinearRequest, data: L.CycleFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the cycle was automatically archived by the auto pruning process. */
    autoArchivedAt?: Date;
    /** The completion time of the cycle. If null, the cycle hasn't been completed. */
    completedAt?: Date;
    /** The number of completed issues in the cycle after each day. */
    completedIssueCountHistory: number[];
    /** The number of completed estimation points after each day. */
    completedScopeHistory: number[];
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The cycle's description. */
    description?: string;
    /** The end time of the cycle. */
    endsAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The number of in progress estimation points after each day. */
    inProgressScopeHistory: number[];
    /** The total number of issues in the cycle after each day. */
    issueCountHistory: number[];
    /** The custom name of the cycle. */
    name?: string;
    /** The number of the cycle. */
    number: number;
    /** The overall progress of the cycle. This is the (completed estimate points + 0.25 * in progress estimate points) / total estimate points. */
    progress: number;
    /** The total number of estimation points after each day. */
    scopeHistory: number[];
    /** The start time of the cycle. */
    startsAt: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The team that the cycle is associated with. */
    get team(): LinearFetch<Team> | undefined;
    /** Issues associated with the cycle. */
    issues(variables?: Omit<L.Cycle_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Issues that weren't completed when the cycle was closed. */
    uncompletedIssuesUponClose(variables?: Omit<L.Cycle_UncompletedIssuesUponCloseQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Archives a cycle. */
    archive(): LinearFetch<CycleArchivePayload>;
    /** Creates a new cycle. */
    create(input: L.CycleCreateInput): LinearFetch<CyclePayload>;
    /** Updates a cycle. */
    update(input: L.CycleUpdateInput): LinearFetch<CyclePayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.CycleArchivePayloadFragment response data
 */
export declare class CycleArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.CycleArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Cycle> | undefined;
}
/**
 * CycleConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this CycleConnection model
 * @param data - CycleConnection response data
 */
export declare class CycleConnection extends Connection<Cycle> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Cycle> | undefined>, data: L.CycleConnectionFragment);
}
/**
 * A cycle notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.CycleNotificationSubscriptionFragment response data
 */
export declare class CycleNotificationSubscription extends Request {
    private _customView?;
    private _cycle;
    private _initiative?;
    private _label?;
    private _project?;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.CycleNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The cycle subscribed to. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * CyclePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.CyclePayloadFragment response data
 */
export declare class CyclePayload extends Request {
    private _cycle?;
    constructor(request: LinearRequest, data: L.CyclePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The Cycle that was created or updated. */
    get cycle(): LinearFetch<Cycle> | undefined;
}
/**
 * A generic payload return from entity deletion mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.DeletePayloadFragment response data
 */
export declare class DeletePayload extends Request {
    constructor(request: LinearRequest, data: L.DeletePayloadFragment);
    /** The identifier of the deleted entity. */
    entityId: string;
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * A diary entry
 *
 * @param request - function to call the graphql client
 * @param data - L.DiaryEntryFragment response data
 */
export declare class DiaryEntry extends Request {
    private _user;
    constructor(request: LinearRequest, data: L.DiaryEntryFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The date for which the entry is created */
    date: L.Scalars["TimelessDate"];
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The canonical url for the DiaryEntry. */
    url: string;
    /** The user who the diary belongs to. */
    get user(): LinearFetch<User> | undefined;
    /** Creates a new diary entry. */
    create(input: L.DiaryEntryCreateInput): LinearFetch<DiaryEntryPayload>;
    /** Deletes a diaryEntry. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a diaryEntry. */
    update(input: L.DiaryEntryUpdateInput): LinearFetch<DiaryEntryPayload>;
}
/**
 * DiaryEntryConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this DiaryEntryConnection model
 * @param data - DiaryEntryConnection response data
 */
export declare class DiaryEntryConnection extends Connection<DiaryEntry> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<DiaryEntry> | undefined>, data: L.DiaryEntryConnectionFragment);
}
/**
 * DiaryEntryPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.DiaryEntryPayloadFragment response data
 */
export declare class DiaryEntryPayload extends Request {
    private _diaryEntry;
    constructor(request: LinearRequest, data: L.DiaryEntryPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The diary entry that was created or updated. */
    get diaryEntry(): LinearFetch<DiaryEntry> | undefined;
}
/**
 * A document that can be attached to different entities.
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentFragment response data
 */
export declare class Document extends Request {
    private _creator?;
    private _lastAppliedTemplate?;
    private _project?;
    private _updatedBy?;
    constructor(request: LinearRequest, data: L.DocumentFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The color of the icon. */
    color?: string;
    /** The documents content in markdown format. */
    content?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The ID of the document content associated with the document. */
    documentContentId?: string;
    /** The time at which the document was hidden. Null if the entity has not been hidden. */
    hiddenAt?: Date;
    /** The icon of the document. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The document's unique URL slug. */
    slugId: string;
    /** The order of the item in the resources list. */
    sortOrder: number;
    /** The document title. */
    title: string;
    /** A flag that indicates whether the document is in the trash bin. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The canonical url for the document. */
    url: string;
    /** The user who created the document. */
    get creator(): LinearFetch<User> | undefined;
    /** The last template that was applied to this document. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The project that the document is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The user who last updated the document. */
    get updatedBy(): LinearFetch<User> | undefined;
    /** Comments associated with the document. */
    comments(variables?: Omit<L.Document_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
    /** Creates a new document. */
    create(input: L.DocumentCreateInput): LinearFetch<DocumentPayload>;
    /** Deletes (trashes) a document. */
    delete(): LinearFetch<DocumentArchivePayload>;
    /** Restores a document. */
    unarchive(): LinearFetch<DocumentArchivePayload>;
    /** Updates a document. */
    update(input: L.DocumentUpdateInput): LinearFetch<DocumentPayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentArchivePayloadFragment response data
 */
export declare class DocumentArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.DocumentArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Document> | undefined;
}
/**
 * DocumentConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this DocumentConnection model
 * @param data - DocumentConnection response data
 */
export declare class DocumentConnection extends Connection<Document> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Document> | undefined>, data: L.DocumentConnectionFragment);
}
/**
 * A document content for a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentContentFragment response data
 */
export declare class DocumentContent extends Request {
    private _document?;
    private _initiative?;
    private _issue?;
    private _project?;
    private _projectMilestone?;
    constructor(request: LinearRequest, data: L.DocumentContentFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The document content in markdown format. */
    content?: string;
    /** The document content state as a base64 encoded string. */
    contentState?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The time at which the document content was restored from a previous version. */
    restoredAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The document that the content is associated with. */
    get document(): LinearFetch<Document> | undefined;
    /** The initiative that the content is associated with. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The issue that the content is associated with. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The project that the content is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The project milestone that the content is associated with. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
}
/**
 * A document content history for a document.
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentContentHistoryFragment response data
 */
export declare class DocumentContentHistory extends Request {
    constructor(request: LinearRequest, data: L.DocumentContentHistoryFragment);
    /** IDs of actors whose edits went into this history item. */
    actorIds: string[];
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The timestamp associated with the DocumentContent when it was originally saved. */
    contentDataSnapshotAt: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The document content that this history item is associated with. */
    documentContent: DocumentContent;
}
/**
 * DocumentContentHistoryPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentContentHistoryPayloadFragment response data
 */
export declare class DocumentContentHistoryPayload extends Request {
    constructor(request: LinearRequest, data: L.DocumentContentHistoryPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
    /** The document content history entries. */
    history: DocumentContentHistoryType[];
}
/**
 * DocumentContentHistoryType model
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentContentHistoryTypeFragment response data
 */
export declare class DocumentContentHistoryType extends Request {
    constructor(request: LinearRequest, data: L.DocumentContentHistoryTypeFragment);
    /** The ID of the author of the change. */
    actorIds?: string[];
    /** The date when the document content history snapshot was taken. This can be different than createdAt since the content is captured from its state at the previously known updatedAt timestamp in the case of an update. On document create, these timestamps can be the same. */
    contentDataSnapshotAt: Date;
    /** The date when the document content history entry was created. */
    createdAt: Date;
    /** The UUID of the document content history entry. */
    id: string;
}
/**
 * A document related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentNotificationFragment response data
 */
export declare class DocumentNotification extends Request {
    private _actor?;
    private _externalUserActor?;
    private _user;
    constructor(request: LinearRequest, data: L.DocumentNotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Related comment ID. Null if the notification is not related to a comment. */
    commentId?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Related document ID. */
    documentId: string;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Related parent comment ID. Null if the notification is not related to a comment. */
    parentCommentId?: string;
    /** Name of the reaction emoji related to the notification. */
    reactionEmoji?: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * DocumentPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentPayloadFragment response data
 */
export declare class DocumentPayload extends Request {
    private _document;
    constructor(request: LinearRequest, data: L.DocumentPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The document that was created or updated. */
    get document(): LinearFetch<Document> | undefined;
}
/**
 * DocumentSearchPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentSearchPayloadFragment response data
 */
export declare class DocumentSearchPayload extends Request {
    constructor(request: LinearRequest, data: L.DocumentSearchPayloadFragment);
    /** Total number of results for query without filters applied. */
    totalCount: number;
    nodes: DocumentSearchResult[];
    /** Archived entities matching the search term along with all their dependencies. */
    archivePayload: ArchiveResponse;
    pageInfo: PageInfo;
}
/**
 * DocumentSearchResult model
 *
 * @param request - function to call the graphql client
 * @param data - L.DocumentSearchResultFragment response data
 */
export declare class DocumentSearchResult extends Request {
    private _creator?;
    private _lastAppliedTemplate?;
    private _project?;
    private _updatedBy?;
    constructor(request: LinearRequest, data: L.DocumentSearchResultFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The color of the icon. */
    color?: string;
    /** The documents content in markdown format. */
    content?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The ID of the document content associated with the document. */
    documentContentId?: string;
    /** The time at which the document was hidden. Null if the entity has not been hidden. */
    hiddenAt?: Date;
    /** The icon of the document. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Metadata related to search result. */
    metadata: L.Scalars["JSONObject"];
    /** The document's unique URL slug. */
    slugId: string;
    /** The order of the item in the resources list. */
    sortOrder: number;
    /** The document title. */
    title: string;
    /** A flag that indicates whether the document is in the trash bin. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The canonical url for the document. */
    url: string;
    /** The user who created the document. */
    get creator(): LinearFetch<User> | undefined;
    /** The last template that was applied to this document. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The project that the document is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The user who last updated the document. */
    get updatedBy(): LinearFetch<User> | undefined;
}
/**
 * DocumentSearchResultConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this DocumentSearchResultConnection model
 * @param data - DocumentSearchResultConnection response data
 */
export declare class DocumentSearchResultConnection extends Connection<DocumentSearchResult> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<DocumentSearchResult> | undefined>, data: L.DocumentSearchResultConnectionFragment);
}
/**
 * A general purpose draft. Used for comments, project updates, etc.
 *
 * @param request - function to call the graphql client
 * @param data - L.DraftFragment response data
 */
export declare class Draft extends Request {
    private _issue?;
    private _parentComment?;
    private _project?;
    private _projectUpdate?;
    private _user;
    constructor(request: LinearRequest, data: L.DraftFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The text content as a Prosemirror document. */
    bodyData: Record<string, unknown>;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Additional properties for the draft. */
    data?: L.Scalars["JSONObject"];
    /** The unique identifier of the entity. */
    id: string;
    /** Whether the draft was autogenerated for the user. */
    isAutogenerated: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The issue for which this is a draft comment. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The comment for which this is a draft comment reply. */
    get parentComment(): LinearFetch<Comment> | undefined;
    /** The project for which this is a draft project update. */
    get project(): LinearFetch<Project> | undefined;
    /** The project update for which this is a draft comment. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
    /** The user who created the draft. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * An email address that can be used for submitting issues.
 *
 * @param request - function to call the graphql client
 * @param data - L.EmailIntakeAddressFragment response data
 */
export declare class EmailIntakeAddress extends Request {
    private _creator?;
    private _team?;
    private _template?;
    constructor(request: LinearRequest, data: L.EmailIntakeAddressFragment);
    /** Unique email address user name (before @) used for incoming email. */
    address: string;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Whether the email address is enabled. */
    enabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user who created the email intake address. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization that the email address is associated with. */
    get organization(): LinearFetch<Organization>;
    /** The team that the email address is associated with. */
    get team(): LinearFetch<Team> | undefined;
    /** The template that the email address is associated with. */
    get template(): LinearFetch<Template> | undefined;
    /** Creates a new email intake address. */
    create(input: L.EmailIntakeAddressCreateInput): LinearFetch<EmailIntakeAddressPayload>;
    /** Deletes an email intake address object. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing email intake address. */
    update(input: L.EmailIntakeAddressUpdateInput): LinearFetch<EmailIntakeAddressPayload>;
}
/**
 * EmailIntakeAddressPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.EmailIntakeAddressPayloadFragment response data
 */
export declare class EmailIntakeAddressPayload extends Request {
    constructor(request: LinearRequest, data: L.EmailIntakeAddressPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The email address that was created or updated. */
    emailIntakeAddress: EmailIntakeAddress;
}
/**
 * EmailUnsubscribePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.EmailUnsubscribePayloadFragment response data
 */
export declare class EmailUnsubscribePayload extends Request {
    constructor(request: LinearRequest, data: L.EmailUnsubscribePayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * EmailUserAccountAuthChallengeResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.EmailUserAccountAuthChallengeResponseFragment response data
 */
export declare class EmailUserAccountAuthChallengeResponse extends Request {
    constructor(request: LinearRequest, data: L.EmailUserAccountAuthChallengeResponseFragment);
    /** Supported challenge for this user account. Can be either verificationCode or password. */
    authType: string;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * A custom emoji.
 *
 * @param request - function to call the graphql client
 * @param data - L.EmojiFragment response data
 */
export declare class Emoji extends Request {
    private _creator?;
    constructor(request: LinearRequest, data: L.EmojiFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The emoji's name. */
    name: string;
    /** The source of the emoji. */
    source: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The emoji image URL. */
    url: string;
    /** The user who created the emoji. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization that the emoji belongs to. */
    get organization(): LinearFetch<Organization>;
    /** Creates a custom emoji. */
    create(input: L.EmojiCreateInput): LinearFetch<EmojiPayload>;
    /** Deletes an emoji. */
    delete(): LinearFetch<DeletePayload>;
}
/**
 * EmojiConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this EmojiConnection model
 * @param data - EmojiConnection response data
 */
export declare class EmojiConnection extends Connection<Emoji> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Emoji> | undefined>, data: L.EmojiConnectionFragment);
}
/**
 * EmojiPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.EmojiPayloadFragment response data
 */
export declare class EmojiPayload extends Request {
    private _emoji;
    constructor(request: LinearRequest, data: L.EmojiPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The emoji that was created. */
    get emoji(): LinearFetch<Emoji> | undefined;
}
/**
 * A basic entity.
 *
 * @param request - function to call the graphql client
 * @param data - L.EntityFragment response data
 */
export declare class Entity extends Request {
    constructor(request: LinearRequest, data: L.EntityFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
}
/**
 * Contains either the full serialized state of the application or delta packets that the requester can apply to the local data set in order to be up-to-date.
 *
 * @param request - function to call the graphql client
 * @param data - L.EntityCountResponseFragment response data
 */
export declare class EntityCountResponse extends Request {
    constructor(request: LinearRequest, data: L.EntityCountResponseFragment);
    /** Entity counts keyed by the entity name. */
    counts: L.Scalars["JSONObject"];
}
/**
 * An external link for an entity like initiative, etc...
 *
 * @param request - function to call the graphql client
 * @param data - L.EntityExternalLinkFragment response data
 */
export declare class EntityExternalLink extends Request {
    private _creator;
    private _initiative?;
    constructor(request: LinearRequest, data: L.EntityExternalLinkFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The link's label. */
    label: string;
    /** The order of the item in the resources list. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The link's URL. */
    url: string;
    /** The user who created the link. */
    get creator(): LinearFetch<User> | undefined;
    /** The initiative that the link is associated with. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** Creates a new entity link. */
    create(input: L.EntityExternalLinkCreateInput): LinearFetch<EntityExternalLinkPayload>;
    /** Deletes an entity link. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an entity link. */
    update(input: L.EntityExternalLinkUpdateInput): LinearFetch<EntityExternalLinkPayload>;
}
/**
 * EntityExternalLinkConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this EntityExternalLinkConnection model
 * @param data - EntityExternalLinkConnection response data
 */
export declare class EntityExternalLinkConnection extends Connection<EntityExternalLink> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<EntityExternalLink> | undefined>, data: L.EntityExternalLinkConnectionFragment);
}
/**
 * EntityExternalLinkPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.EntityExternalLinkPayloadFragment response data
 */
export declare class EntityExternalLinkPayload extends Request {
    private _entityExternalLink;
    constructor(request: LinearRequest, data: L.EntityExternalLinkPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The link that was created or updated. */
    get entityExternalLink(): LinearFetch<EntityExternalLink> | undefined;
}
/**
 * An external authenticated (e.g., through Slack) user which doesn't have a Linear account, but can create and update entities in Linear from the external system that authenticated them.
 *
 * @param request - function to call the graphql client
 * @param data - L.ExternalUserFragment response data
 */
export declare class ExternalUser extends Request {
    constructor(request: LinearRequest, data: L.ExternalUserFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** An URL to the external user's avatar image. */
    avatarUrl?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The external user's display name. Unique within each organization. Can match the display name of an actual user. */
    displayName: string;
    /** The external user's email address. */
    email?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The last time the external user was seen interacting with Linear. */
    lastSeen?: Date;
    /** The external user's full name. */
    name: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Organization the external user belongs to. */
    get organization(): LinearFetch<Organization>;
}
/**
 * ExternalUserConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ExternalUserConnection model
 * @param data - ExternalUserConnection response data
 */
export declare class ExternalUserConnection extends Connection<ExternalUser> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ExternalUser> | undefined>, data: L.ExternalUserConnectionFragment);
}
/**
 * A facet. Facets are joins between entities. A facet can tie a custom view to a project, or a a project to a roadmap for example.
 *
 * @param request - function to call the graphql client
 * @param data - L.FacetFragment response data
 */
export declare class Facet extends Request {
    private _sourceInitiative?;
    private _sourceProject?;
    private _sourceTeam?;
    private _targetCustomView?;
    constructor(request: LinearRequest, data: L.FacetFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The sort order of the facet. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The owning page. */
    sourcePage?: L.FacetPageSource;
    /** The owning initiative. */
    get sourceInitiative(): LinearFetch<Initiative> | undefined;
    /** The owning organization. */
    get sourceOrganization(): LinearFetch<Organization>;
    /** The owning project. */
    get sourceProject(): LinearFetch<Project> | undefined;
    /** The owning team. */
    get sourceTeam(): LinearFetch<Team> | undefined;
    /** The targeted custom view. */
    get targetCustomView(): LinearFetch<CustomView> | undefined;
}
/**
 * FacetConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this FacetConnection model
 * @param data - FacetConnection response data
 */
export declare class FacetConnection extends Connection<Facet> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Facet> | undefined>, data: L.FacetConnectionFragment);
}
/**
 * User favorites presented in the sidebar.
 *
 * @param request - function to call the graphql client
 * @param data - L.FavoriteFragment response data
 */
export declare class Favorite extends Request {
    private _customView?;
    private _cycle?;
    private _document?;
    private _initiative?;
    private _issue?;
    private _label?;
    private _owner;
    private _parent?;
    private _predefinedViewTeam?;
    private _project?;
    private _projectTeam?;
    private _roadmap?;
    private _user?;
    constructor(request: LinearRequest, data: L.FavoriteFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The name of the folder. Only applies to favorites of type folder. */
    folderName?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of favorited predefined view. */
    predefinedViewType?: string;
    /** The order of the item in the favorites list. */
    sortOrder: number;
    /** The type of the favorite. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** URL of the favorited entity. Folders return 'null' value. */
    url?: string;
    /** The targeted tab of the initiative. */
    initiativeTab?: L.InitiativeTab;
    /** The targeted tab of the project. */
    projectTab?: L.ProjectTab;
    /** The favorited custom view. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The favorited cycle. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The favorited document. */
    get document(): LinearFetch<Document> | undefined;
    /** The favorited initiative. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The favorited issue. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The favorited label. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The owner of the favorite. */
    get owner(): LinearFetch<User> | undefined;
    /** The parent folder of the favorite. */
    get parent(): LinearFetch<Favorite> | undefined;
    /** The team of the favorited predefined view. */
    get predefinedViewTeam(): LinearFetch<Team> | undefined;
    /** The favorited project. */
    get project(): LinearFetch<Project> | undefined;
    /** [DEPRECATED] The favorited team of the project. */
    get projectTeam(): LinearFetch<Team> | undefined;
    /** The favorited roadmap. */
    get roadmap(): LinearFetch<Roadmap> | undefined;
    /** The favorited user. */
    get user(): LinearFetch<User> | undefined;
    /** Children of the favorite. Only applies to favorites of type folder. */
    children(variables?: Omit<L.Favorite_ChildrenQueryVariables, "id">): LinearFetch<FavoriteConnection>;
    /** Creates a new favorite (project, cycle etc). */
    create(input: L.FavoriteCreateInput): LinearFetch<FavoritePayload>;
    /** Deletes a favorite reference. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a favorite. */
    update(input: L.FavoriteUpdateInput): LinearFetch<FavoritePayload>;
}
/**
 * FavoriteConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this FavoriteConnection model
 * @param data - FavoriteConnection response data
 */
export declare class FavoriteConnection extends Connection<Favorite> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Favorite> | undefined>, data: L.FavoriteConnectionFragment);
}
/**
 * FavoritePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.FavoritePayloadFragment response data
 */
export declare class FavoritePayload extends Request {
    private _favorite;
    constructor(request: LinearRequest, data: L.FavoritePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The object that was added as a favorite. */
    get favorite(): LinearFetch<Favorite> | undefined;
}
/**
 * A feature flag for a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.FeatureFlagFragment response data
 */
export declare class FeatureFlag extends Request {
    private _creator?;
    private _integration;
    private _lastStageUpdatedBy?;
    private _project;
    constructor(request: LinearRequest, data: L.FeatureFlagFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the feature flag. */
    description?: string;
    /** Url to the feature flag provider's page about the feature flag. */
    externalUrl: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether the feature flag is enabled. */
    isEnabled: boolean;
    /** The unique key as defined by the feature flag provider. */
    key: string;
    /** Date when the stage was last changed. */
    lastStageUpdatedAt?: Date;
    /** The status of the feature flag. */
    status: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The pending rollout stage for the feature flag. */
    pendingRolloutStage?: FeatureFlagRolloutStage;
    /** The rollout stage of the feature flag. */
    rolloutStage: FeatureFlagRolloutStage;
    /** The user who created the feature flag. */
    get creator(): LinearFetch<User> | undefined;
    /** The integration providing the feature flag. */
    get integration(): LinearFetch<Integration> | undefined;
    /** The user who last changed the stage of the feature flag. */
    get lastStageUpdatedBy(): LinearFetch<User> | undefined;
    /** The organization of the feature flag. */
    get organization(): LinearFetch<Organization>;
    /** The project the feature flag is associated with. */
    get project(): LinearFetch<Project> | undefined;
}
/**
 * FeatureFlagConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this FeatureFlagConnection model
 * @param data - FeatureFlagConnection response data
 */
export declare class FeatureFlagConnection extends Connection<FeatureFlag> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<FeatureFlag> | undefined>, data: L.FeatureFlagConnectionFragment);
}
/**
 * A rollout stage for a feature flag.
 *
 * @param request - function to call the graphql client
 * @param data - L.FeatureFlagRolloutStageFragment response data
 */
export declare class FeatureFlagRolloutStage extends Request {
    private _integration;
    constructor(request: LinearRequest, data: L.FeatureFlagRolloutStageFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the rollout stage. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the rollout stage. */
    name: string;
    /** Which feature flag provider segments this rollout stage is associated with. */
    segmentKeys: string[];
    /** The order of the rollout stages within an organization. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of the feature flag rollout stage. */
    type: L.FeatureFlagRolloutStageType;
    /** The integration providing the feature flag. */
    get integration(): LinearFetch<Integration> | undefined;
    /** The organization of the feature flag rollout stage. */
    get organization(): LinearFetch<Organization>;
}
/**
 * FeatureFlagRolloutStageConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this FeatureFlagRolloutStageConnection model
 * @param data - FeatureFlagRolloutStageConnection response data
 */
export declare class FeatureFlagRolloutStageConnection extends Connection<FeatureFlagRolloutStage> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<FeatureFlagRolloutStage> | undefined>, data: L.FeatureFlagRolloutStageConnectionFragment);
}
/**
 * FrontAttachmentPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.FrontAttachmentPayloadFragment response data
 */
export declare class FrontAttachmentPayload extends Request {
    constructor(request: LinearRequest, data: L.FrontAttachmentPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Front specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.FrontSettingsFragment response data
 */
export declare class FrontSettings extends Request {
    constructor(request: LinearRequest, data: L.FrontSettingsFragment);
    /** Whether a ticket should be automatically reopened when its linked Linear issue is cancelled. */
    automateTicketReopeningOnCancellation?: boolean;
    /** Whether a ticket should be automatically reopened when a comment is posted on its linked Linear issue */
    automateTicketReopeningOnComment?: boolean;
    /** Whether a ticket should be automatically reopened when its linked Linear issue is completed. */
    automateTicketReopeningOnCompletion?: boolean;
    /** Whether an internal message should be added when someone comments on an issue. */
    sendNoteOnComment?: boolean;
    /** Whether an internal message should be added when a Linear issue changes status (for status types except completed or canceled). */
    sendNoteOnStatusChange?: boolean;
}
/**
 * A trigger that updates the issue status according to Git automations.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitAutomationStateFragment response data
 */
export declare class GitAutomationState extends Request {
    private _state?;
    private _team;
    constructor(request: LinearRequest, data: L.GitAutomationStateFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** [DEPRECATED] The target branch, if null, the automation will be triggered on any branch. */
    branchPattern?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The target branch associated to this automation state. */
    targetBranch?: GitAutomationTargetBranch;
    /** The event that triggers the automation. */
    event: L.GitAutomationStates;
    /** The associated workflow state. */
    get state(): LinearFetch<WorkflowState> | undefined;
    /** The team to which this automation state belongs. */
    get team(): LinearFetch<Team> | undefined;
    /** Creates a new automation state. */
    create(input: L.GitAutomationStateCreateInput): LinearFetch<GitAutomationStatePayload>;
    /** Archives an automation state. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing state. */
    update(input: L.GitAutomationStateUpdateInput): LinearFetch<GitAutomationStatePayload>;
}
/**
 * GitAutomationStateConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this GitAutomationStateConnection model
 * @param data - GitAutomationStateConnection response data
 */
export declare class GitAutomationStateConnection extends Connection<GitAutomationState> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<GitAutomationState> | undefined>, data: L.GitAutomationStateConnectionFragment);
}
/**
 * GitAutomationStatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitAutomationStatePayloadFragment response data
 */
export declare class GitAutomationStatePayload extends Request {
    constructor(request: LinearRequest, data: L.GitAutomationStatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The automation state that was created or updated. */
    gitAutomationState: GitAutomationState;
}
/**
 * A Git target branch for which there are automations (GitAutomationState).
 *
 * @param request - function to call the graphql client
 * @param data - L.GitAutomationTargetBranchFragment response data
 */
export declare class GitAutomationTargetBranch extends Request {
    private _team;
    constructor(request: LinearRequest, data: L.GitAutomationTargetBranchFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The target branch pattern. */
    branchPattern: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether the branch pattern is a regular expression. */
    isRegex: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The team to which this Git target branch automation belongs. */
    get team(): LinearFetch<Team> | undefined;
    /** Creates a Git target branch automation. */
    create(input: L.GitAutomationTargetBranchCreateInput): LinearFetch<GitAutomationTargetBranchPayload>;
    /** Archives a Git target branch automation. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing Git target branch automation. */
    update(input: L.GitAutomationTargetBranchUpdateInput): LinearFetch<GitAutomationTargetBranchPayload>;
}
/**
 * GitAutomationTargetBranchPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitAutomationTargetBranchPayloadFragment response data
 */
export declare class GitAutomationTargetBranchPayload extends Request {
    constructor(request: LinearRequest, data: L.GitAutomationTargetBranchPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The Git target branch automation that was created or updated. */
    targetBranch: GitAutomationTargetBranch;
}
/**
 * GitHubCommitIntegrationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubCommitIntegrationPayloadFragment response data
 */
export declare class GitHubCommitIntegrationPayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.GitHubCommitIntegrationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The webhook secret to provide to GitHub. */
    webhookSecret: string;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * GitHubEnterpriseServerInstallVerificationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubEnterpriseServerInstallVerificationPayloadFragment response data
 */
export declare class GitHubEnterpriseServerInstallVerificationPayload extends Request {
    constructor(request: LinearRequest, data: L.GitHubEnterpriseServerInstallVerificationPayloadFragment);
    /** Has the install been successful. */
    success: boolean;
}
/**
 * GitHubEnterpriseServerPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubEnterpriseServerPayloadFragment response data
 */
export declare class GitHubEnterpriseServerPayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.GitHubEnterpriseServerPayloadFragment);
    /** The app install address. */
    installUrl: string;
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** The setup address. */
    setupUrl: string;
    /** Whether the operation was successful. */
    success: boolean;
    /** The webhook secret to provide to GitHub. */
    webhookSecret: string;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * Metadata and settings for a GitHub import integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubImportSettingsFragment response data
 */
export declare class GitHubImportSettings extends Request {
    constructor(request: LinearRequest, data: L.GitHubImportSettingsFragment);
    /** A map storing all available issue labels per repository */
    labels?: L.Scalars["JSONObject"];
    /** The avatar URL for the GitHub organization. */
    orgAvatarUrl: string;
    /** The GitHub organization's name. */
    orgLogin: string;
    /** The names of the repositories connected for the GitHub integration. */
    repositories: GitHubRepo[];
    /** The type of Github org */
    orgType: L.GithubOrgType;
}
/**
 * Metadata and settings for a GitHub Personal integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubPersonalSettingsFragment response data
 */
export declare class GitHubPersonalSettings extends Request {
    constructor(request: LinearRequest, data: L.GitHubPersonalSettingsFragment);
    /** The GitHub user's name. */
    login: string;
}
/**
 * GitHub repos available to sync.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubRepoFragment response data
 */
export declare class GitHubRepo extends Request {
    constructor(request: LinearRequest, data: L.GitHubRepoFragment);
    /** The full name of the repository. */
    fullName: string;
    /** The GitHub repo id. */
    id: number;
}
/**
 * Mapping of Linear teams to GitHub repos.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubRepoMappingFragment response data
 */
export declare class GitHubRepoMapping extends Request {
    constructor(request: LinearRequest, data: L.GitHubRepoMappingFragment);
    /** Whether the sync for this mapping is bidirectional. */
    bidirectional?: boolean;
    /** Whether this mapping is the default one for issue creation. */
    default?: boolean;
    /** Labels to filter incoming GitHub issue creation by. */
    gitHubLabels?: string[];
    /** The GitHub repo id. */
    gitHubRepoId: number;
    /** The Linear team id to map to the given project. */
    linearTeamId: string;
}
/**
 * Metadata and settings for a GitHub integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitHubSettingsFragment response data
 */
export declare class GitHubSettings extends Request {
    constructor(request: LinearRequest, data: L.GitHubSettingsFragment);
    /** The avatar URL for the GitHub organization. */
    orgAvatarUrl?: string;
    /** The GitHub organization's name. */
    orgLogin: string;
    /** The names of the repositories connected for the GitHub integration. */
    repositories?: GitHubRepo[];
    /** Mapping of team to repository for syncing. */
    repositoriesMapping?: GitHubRepoMapping[];
    /** The type of Github org */
    orgType?: L.GithubOrgType;
}
/**
 * GitLabIntegrationCreatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.GitLabIntegrationCreatePayloadFragment response data
 */
export declare class GitLabIntegrationCreatePayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.GitLabIntegrationCreatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The webhook secret to provide to GitLab. */
    webhookSecret: string;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * Metadata and settings for a GitLab integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.GitLabSettingsFragment response data
 */
export declare class GitLabSettings extends Request {
    constructor(request: LinearRequest, data: L.GitLabSettingsFragment);
    /** The ISO timestamp the GitLab access token expires. */
    expiresAt?: string;
    /** Whether the token is limited to a read-only scope. */
    readonly?: boolean;
    /** The self-hosted URL of the GitLab instance. */
    url?: string;
}
/**
 * Google Sheets specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.GoogleSheetsSettingsFragment response data
 */
export declare class GoogleSheetsSettings extends Request {
    constructor(request: LinearRequest, data: L.GoogleSheetsSettingsFragment);
    sheetId: number;
    spreadsheetId: string;
    spreadsheetUrl: string;
    updatedIssuesAt?: Date;
}
/**
 * ImageUploadFromUrlPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ImageUploadFromUrlPayloadFragment response data
 */
export declare class ImageUploadFromUrlPayload extends Request {
    constructor(request: LinearRequest, data: L.ImageUploadFromUrlPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The URL containing the image. */
    url?: string;
}
/**
 * An initiative to group projects.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeFragment response data
 */
export declare class Initiative extends Request {
    private _creator?;
    private _owner?;
    constructor(request: LinearRequest, data: L.InitiativeFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The initiative's color. */
    color?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the initiative. */
    description?: string;
    /** The icon of the initiative. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the initiative. */
    name: string;
    /** The initiative's unique URL slug. */
    slugId: string;
    /** The sort order of the initiative within the organization. */
    sortOrder: number;
    /** The estimated completion date of the initiative. */
    targetDate?: L.Scalars["TimelessDate"];
    /** A flag that indicates whether the initiative is in the trash bin. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The status of the initiative. One of Planned, Active, Completed */
    status: L.InitiativeStatus;
    /** The resolution of the initiative's estimated completion date. */
    targetDateResolution?: L.DateResolutionType;
    /** The user who created the initiative. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization of the initiative. */
    get organization(): LinearFetch<Organization>;
    /** The user who owns the initiative. */
    get owner(): LinearFetch<User> | undefined;
    /** Links associated with the initiative. */
    links(variables?: Omit<L.Initiative_LinksQueryVariables, "id">): LinearFetch<EntityExternalLinkConnection>;
    /** Projects associated with the initiative. */
    projects(variables?: Omit<L.Initiative_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
    /** Archives a initiative. */
    archive(): LinearFetch<InitiativeArchivePayload>;
    /** Creates a new initiative. */
    create(input: L.InitiativeCreateInput): LinearFetch<InitiativePayload>;
    /** Deletes (trashes) an initiative. */
    delete(): LinearFetch<DeletePayload>;
    /** Unarchives a initiative. */
    unarchive(): LinearFetch<InitiativeArchivePayload>;
    /** Updates a initiative. */
    update(input: L.InitiativeUpdateInput): LinearFetch<InitiativePayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeArchivePayloadFragment response data
 */
export declare class InitiativeArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.InitiativeArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Initiative> | undefined;
}
/**
 * InitiativeConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this InitiativeConnection model
 * @param data - InitiativeConnection response data
 */
export declare class InitiativeConnection extends Connection<Initiative> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Initiative> | undefined>, data: L.InitiativeConnectionFragment);
}
/**
 * An initiative related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeNotificationFragment response data
 */
export declare class InitiativeNotification extends Request {
    private _actor?;
    private _externalUserActor?;
    private _user;
    constructor(request: LinearRequest, data: L.InitiativeNotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Related comment ID. Null if the notification is not related to a comment. */
    commentId?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Related initiative ID. */
    initiativeId: string;
    /** Related parent comment ID. Null if the notification is not related to a comment. */
    parentCommentId?: string;
    /** Name of the reaction emoji related to the notification. */
    reactionEmoji?: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * An initiative notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeNotificationSubscriptionFragment response data
 */
export declare class InitiativeNotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative;
    private _label?;
    private _project?;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.InitiativeNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The initiative subscribed to. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * The payload returned by the initiative mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativePayloadFragment response data
 */
export declare class InitiativePayload extends Request {
    private _initiative;
    constructor(request: LinearRequest, data: L.InitiativePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The initiative that was created or updated. */
    get initiative(): LinearFetch<Initiative> | undefined;
}
/**
 * Join table between projects and initiatives.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeToProjectFragment response data
 */
export declare class InitiativeToProject extends Request {
    private _initiative;
    private _project;
    constructor(request: LinearRequest, data: L.InitiativeToProjectFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The sort order of the project within the initiative. */
    sortOrder: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The initiative that the project is associated with. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The project that the initiative is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** Creates a new initiativeToProject join. */
    create(input: L.InitiativeToProjectCreateInput): LinearFetch<InitiativeToProjectPayload>;
    /** Deletes a initiativeToProject. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a initiativeToProject. */
    update(input: L.InitiativeToProjectUpdateInput): LinearFetch<InitiativeToProjectPayload>;
}
/**
 * InitiativeToProjectConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this InitiativeToProjectConnection model
 * @param data - InitiativeToProjectConnection response data
 */
export declare class InitiativeToProjectConnection extends Connection<InitiativeToProject> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<InitiativeToProject> | undefined>, data: L.InitiativeToProjectConnectionFragment);
}
/**
 * The result of a initiativeToProject mutation.
 *
 * @param request - function to call the graphql client
 * @param data - L.InitiativeToProjectPayloadFragment response data
 */
export declare class InitiativeToProjectPayload extends Request {
    private _initiativeToProject;
    constructor(request: LinearRequest, data: L.InitiativeToProjectPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The initiativeToProject that was created or updated. */
    get initiativeToProject(): LinearFetch<InitiativeToProject> | undefined;
}
/**
 * An integration with an external service.
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationFragment response data
 */
export declare class Integration extends Request {
    private _creator;
    private _team?;
    constructor(request: LinearRequest, data: L.IntegrationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The integration's type. */
    service: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user that added the integration. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization that the integration is associated with. */
    get organization(): LinearFetch<Organization>;
    /** The team that the integration is associated with. */
    get team(): LinearFetch<Team> | undefined;
    /** Archives an integration. */
    archive(): LinearFetch<DeletePayload>;
    /** Deletes an integration. */
    delete(): LinearFetch<DeletePayload>;
}
/**
 * IntegrationConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IntegrationConnection model
 * @param data - IntegrationConnection response data
 */
export declare class IntegrationConnection extends Connection<Integration> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Integration> | undefined>, data: L.IntegrationConnectionFragment);
}
/**
 * IntegrationHasScopesPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationHasScopesPayloadFragment response data
 */
export declare class IntegrationHasScopesPayload extends Request {
    constructor(request: LinearRequest, data: L.IntegrationHasScopesPayloadFragment);
    /** Whether the integration has the required scopes. */
    hasAllScopes: boolean;
    /** The missing scopes. */
    missingScopes?: string[];
}
/**
 * IntegrationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationPayloadFragment response data
 */
export declare class IntegrationPayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.IntegrationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * IntegrationRequestPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationRequestPayloadFragment response data
 */
export declare class IntegrationRequestPayload extends Request {
    constructor(request: LinearRequest, data: L.IntegrationRequestPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * The integration resource's settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationSettingsFragment response data
 */
export declare class IntegrationSettings extends Request {
    constructor(request: LinearRequest, data: L.IntegrationSettingsFragment);
    front?: FrontSettings;
    gitHub?: GitHubSettings;
    gitHubImport?: GitHubImportSettings;
    gitHubPersonal?: GitHubPersonalSettings;
    gitLab?: GitLabSettings;
    googleSheets?: GoogleSheetsSettings;
    intercom?: IntercomSettings;
    jira?: JiraSettings;
    jiraPersonal?: JiraPersonalSettings;
    launchDarkly?: LaunchDarklySettings;
    notion?: NotionSettings;
    opsgenie?: OpsgenieSettings;
    pagerDuty?: PagerDutySettings;
    sentry?: SentrySettings;
    slack?: SlackSettings;
    slackAsks?: SlackAsksSettings;
    slackCustomViewNotifications?: SlackPostSettings;
    slackOrgProjectUpdatesPost?: SlackPostSettings;
    slackPost?: SlackPostSettings;
    slackProjectPost?: SlackPostSettings;
    zendesk?: ZendeskSettings;
}
/**
 * Join table between templates and integrations.
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationTemplateFragment response data
 */
export declare class IntegrationTemplate extends Request {
    private _integration;
    private _template;
    constructor(request: LinearRequest, data: L.IntegrationTemplateFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** ID of the foreign entity in the external integration this template is for, e.g., Slack channel ID. */
    foreignEntityId?: string;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The integration that the template is associated with. */
    get integration(): LinearFetch<Integration> | undefined;
    /** The template that the integration is associated with. */
    get template(): LinearFetch<Template> | undefined;
    /** Creates a new integrationTemplate join. */
    create(input: L.IntegrationTemplateCreateInput): LinearFetch<IntegrationTemplatePayload>;
    /** Deletes a integrationTemplate. */
    delete(): LinearFetch<DeletePayload>;
}
/**
 * IntegrationTemplateConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IntegrationTemplateConnection model
 * @param data - IntegrationTemplateConnection response data
 */
export declare class IntegrationTemplateConnection extends Connection<IntegrationTemplate> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IntegrationTemplate> | undefined>, data: L.IntegrationTemplateConnectionFragment);
}
/**
 * IntegrationTemplatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationTemplatePayloadFragment response data
 */
export declare class IntegrationTemplatePayload extends Request {
    private _integrationTemplate;
    constructor(request: LinearRequest, data: L.IntegrationTemplatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The IntegrationTemplate that was created or updated. */
    get integrationTemplate(): LinearFetch<IntegrationTemplate> | undefined;
}
/**
 * The configuration of all integrations for a project or a team.
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationsSettingsFragment response data
 */
export declare class IntegrationsSettings extends Request {
    private _project?;
    private _team?;
    constructor(request: LinearRequest, data: L.IntegrationsSettingsFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether to send a Slack message when a new issue is added to triage. */
    slackIssueAddedToTriage?: boolean;
    /** Whether to send a Slack message when an issue is added to the custom view. */
    slackIssueAddedToView?: boolean;
    /** Whether to send a Slack message when a new issue is created for the project or the team. */
    slackIssueCreated?: boolean;
    /** Whether to send a Slack message when a comment is created on any of the project or team's issues. */
    slackIssueNewComment?: boolean;
    /** Whether to send a Slack message when an SLA is breached. */
    slackIssueSlaBreached?: boolean;
    /** Whether to send a Slack message when an SLA is at high risk. */
    slackIssueSlaHighRisk?: boolean;
    /** Whether to send a Slack message when any of the project or team's issues has a change in status. */
    slackIssueStatusChangedAll?: boolean;
    /** Whether to send a Slack message when any of the project or team's issues change to completed or cancelled. */
    slackIssueStatusChangedDone?: boolean;
    /** Whether to send a Slack message when a project update is created. */
    slackProjectUpdateCreated?: boolean;
    /** Whether to send a new project update to team Slack channels. */
    slackProjectUpdateCreatedToTeam?: boolean;
    /** Whether to send a new project update to workspace Slack channel. */
    slackProjectUpdateCreatedToWorkspace?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the integration settings context is associated with. */
    contextViewType?: L.ContextViewType;
    /** Project which those settings apply to. */
    get project(): LinearFetch<Project> | undefined;
    /** Team which those settings apply to. */
    get team(): LinearFetch<Team> | undefined;
    /** Creates new settings for one or more integrations. */
    create(input: L.IntegrationsSettingsCreateInput): LinearFetch<IntegrationsSettingsPayload>;
    /** Updates settings related to integrations for a project or a team. */
    update(input: L.IntegrationsSettingsUpdateInput): LinearFetch<IntegrationsSettingsPayload>;
}
/**
 * IntegrationsSettingsConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IntegrationsSettingsConnection model
 * @param data - IntegrationsSettingsConnection response data
 */
export declare class IntegrationsSettingsConnection extends Connection<IntegrationsSettings> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IntegrationsSettings> | undefined>, data: L.IntegrationsSettingsConnectionFragment);
}
/**
 * IntegrationsSettingsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IntegrationsSettingsPayloadFragment response data
 */
export declare class IntegrationsSettingsPayload extends Request {
    private _integrationsSettings;
    constructor(request: LinearRequest, data: L.IntegrationsSettingsPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The settings that were created or updated. */
    get integrationsSettings(): LinearFetch<IntegrationsSettings> | undefined;
}
/**
 * Intercom specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.IntercomSettingsFragment response data
 */
export declare class IntercomSettings extends Request {
    constructor(request: LinearRequest, data: L.IntercomSettingsFragment);
    /** Whether a ticket should be automatically reopened when its linked Linear issue is cancelled. */
    automateTicketReopeningOnCancellation?: boolean;
    /** Whether a ticket should be automatically reopened when a comment is posted on its linked Linear issue */
    automateTicketReopeningOnComment?: boolean;
    /** Whether a ticket should be automatically reopened when its linked Linear issue is completed. */
    automateTicketReopeningOnCompletion?: boolean;
    /** Whether an internal message should be added when someone comments on an issue. */
    sendNoteOnComment?: boolean;
    /** Whether an internal message should be added when a Linear issue changes status (for status types except completed or canceled). */
    sendNoteOnStatusChange?: boolean;
}
/**
 * An issue.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueFragment response data
 */
export declare class Issue extends Request {
    private _assignee?;
    private _creator?;
    private _cycle?;
    private _externalUserCreator?;
    private _favorite?;
    private _lastAppliedTemplate?;
    private _parent?;
    private _project?;
    private _projectMilestone?;
    private _snoozedBy?;
    private _sourceComment?;
    private _state;
    private _team;
    constructor(request: LinearRequest, data: L.IssueFragment);
    /** The time at which the issue was added to a cycle. */
    addedToCycleAt?: Date;
    /** The time at which the issue was added to a project. */
    addedToProjectAt?: Date;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the issue was automatically archived by the auto pruning process. */
    autoArchivedAt?: Date;
    /** The time at which the issue was automatically closed by the auto pruning process. */
    autoClosedAt?: Date;
    /** The order of the item in its column on the board. */
    boardOrder: number;
    /** Suggested branch name for the issue. */
    branchName: string;
    /** The time at which the issue was moved into canceled state. */
    canceledAt?: Date;
    /** The time at which the issue was moved into completed state. */
    completedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Returns the number of Attachment resources which are created by customer support ticketing systems (e.g. Zendesk). */
    customerTicketCount: number;
    /** The issue's description in markdown format. */
    description?: string;
    /** The date at which the issue is due. */
    dueDate?: L.Scalars["TimelessDate"];
    /** The estimate of the complexity of the issue.. */
    estimate?: number;
    /** The unique identifier of the entity. */
    id: string;
    /** Issue's human readable identifier (e.g. ENG-123). */
    identifier: string;
    /** Id of the labels associated with this issue. */
    labelIds: string[];
    /** The issue's unique number. */
    number: number;
    /** Previous identifiers of the issue if it has been moved between teams. */
    previousIdentifiers: string[];
    /** The priority of the issue. 0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low. */
    priority: number;
    /** Label for the priority. */
    priorityLabel: string;
    /** Emoji reaction summary, grouped by emoji type. */
    reactionData: L.Scalars["JSONObject"];
    /** The time at which the issue's SLA will breach. */
    slaBreachesAt?: Date;
    /** The time at which the issue's SLA began. */
    slaStartedAt?: Date;
    /** The time until an issue will be snoozed in Triage view. */
    snoozedUntilAt?: Date;
    /** The order of the item in relation to other items in the organization. */
    sortOrder: number;
    /** The time at which the issue was moved into started state. */
    startedAt?: Date;
    /** The time at which the issue entered triage. */
    startedTriageAt?: Date;
    /** The order of the item in the sub-issue list. Only set if the issue has a parent. */
    subIssueSortOrder?: number;
    /** The issue's title. */
    title: string;
    /** A flag that indicates whether the issue is in the trash bin. */
    trashed?: boolean;
    /** The time at which the issue left triage. */
    triagedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Issue URL. */
    url: string;
    /** Reactions associated with the issue. */
    reactions: Reaction[];
    /** The bot that created the issue, if applicable. */
    botActor?: ActorBot;
    /** Integration type that created this issue, if applicable. */
    integrationSourceType?: L.IntegrationService;
    /** The user to whom the issue is assigned to. */
    get assignee(): LinearFetch<User> | undefined;
    /** The user who created the issue. */
    get creator(): LinearFetch<User> | undefined;
    /** The cycle that the issue is associated with. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The external user who created the issue. */
    get externalUserCreator(): LinearFetch<ExternalUser> | undefined;
    /** The users favorite associated with this issue. */
    get favorite(): LinearFetch<Favorite> | undefined;
    /** The last template that was applied to this issue. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The parent of the issue. */
    get parent(): LinearFetch<Issue> | undefined;
    /** The project that the issue is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The projectMilestone that the issue is associated with. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
    /** The user who snoozed the issue. */
    get snoozedBy(): LinearFetch<User> | undefined;
    /** The comment that this issue was created from. */
    get sourceComment(): LinearFetch<Comment> | undefined;
    /** The workflow state that the issue is associated with. */
    get state(): LinearFetch<WorkflowState> | undefined;
    /** The team that the issue is associated with. */
    get team(): LinearFetch<Team> | undefined;
    /** Attachments associated with the issue. */
    attachments(variables?: Omit<L.Issue_AttachmentsQueryVariables, "id">): LinearFetch<AttachmentConnection>;
    /** Children of the issue. */
    children(variables?: Omit<L.Issue_ChildrenQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Comments associated with the issue. */
    comments(variables?: Omit<L.Issue_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
    /** History entries associated with the issue. */
    history(variables?: Omit<L.Issue_HistoryQueryVariables, "id">): LinearFetch<IssueHistoryConnection>;
    /** Inverse relations associated with this issue. */
    inverseRelations(variables?: Omit<L.Issue_InverseRelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
    /** Labels associated with this issue. */
    labels(variables?: Omit<L.Issue_LabelsQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
    /** Relations associated with this issue. */
    relations(variables?: Omit<L.Issue_RelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
    /** Users who are subscribed to the issue. */
    subscribers(variables?: Omit<L.Issue_SubscribersQueryVariables, "id">): LinearFetch<UserConnection>;
    /** Archives an issue. */
    archive(variables?: Omit<L.ArchiveIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
    /** Creates a new issue. */
    create(input: L.IssueCreateInput): LinearFetch<IssuePayload>;
    /** Deletes (trashes) an issue. */
    delete(variables?: Omit<L.DeleteIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
    /** Unarchives an issue. */
    unarchive(): LinearFetch<IssueArchivePayload>;
    /** Updates an issue. */
    update(input: L.IssueUpdateInput): LinearFetch<IssuePayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueArchivePayloadFragment response data
 */
export declare class IssueArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.IssueArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Issue> | undefined;
}
/**
 * IssueBatchPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueBatchPayloadFragment response data
 */
export declare class IssueBatchPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueBatchPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The issues that were updated. */
    issues: Issue[];
}
/**
 * IssueConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IssueConnection model
 * @param data - IssueConnection response data
 */
export declare class IssueConnection extends Connection<Issue> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Issue> | undefined>, data: L.IssueConnectionFragment);
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueDraftArchivePayloadFragment response data
 */
export declare class IssueDraftArchivePayload extends Request {
    constructor(request: LinearRequest, data: L.IssueDraftArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * IssueDraftPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueDraftPayloadFragment response data
 */
export declare class IssueDraftPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueDraftPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * IssueFilterSuggestionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueFilterSuggestionPayloadFragment response data
 */
export declare class IssueFilterSuggestionPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueFilterSuggestionPayloadFragment);
    /** The json filter that is suggested. */
    filter?: L.Scalars["JSONObject"];
}
/**
 * A record of changes to an issue.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueHistoryFragment response data
 */
export declare class IssueHistory extends Request {
    private _actor?;
    private _attachment?;
    private _fromAssignee?;
    private _fromCycle?;
    private _fromParent?;
    private _fromProject?;
    private _fromState?;
    private _fromTeam?;
    private _issue;
    private _toAssignee?;
    private _toConvertedProject?;
    private _toCycle?;
    private _toParent?;
    private _toProject?;
    private _toState?;
    private _toTeam?;
    constructor(request: LinearRequest, data: L.IssueHistoryFragment);
    /** The id of user who made these changes. If null, possibly means that the change made by an integration. */
    actorId?: string;
    /** ID's of labels that were added. */
    addedLabelIds?: string[];
    /** Whether the issue is archived at the time of this history entry. */
    archived?: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The id of linked attachment. */
    attachmentId?: string;
    /** Whether the issue was auto-archived. */
    autoArchived?: boolean;
    /** Whether the issue was auto-closed. */
    autoClosed?: boolean;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The id of user from whom the issue was re-assigned from. */
    fromAssigneeId?: string;
    /** The id of previous cycle of the issue. */
    fromCycleId?: string;
    /** What the due date was changed from. */
    fromDueDate?: L.Scalars["TimelessDate"];
    /** What the estimate was changed from. */
    fromEstimate?: number;
    /** The id of previous parent of the issue. */
    fromParentId?: string;
    /** What the priority was changed from. */
    fromPriority?: number;
    /** The id of previous project of the issue. */
    fromProjectId?: string;
    /** The id of previous workflow state of the issue. */
    fromStateId?: string;
    /** The id of team from which the issue was moved from. */
    fromTeamId?: string;
    /** What the title was changed from. */
    fromTitle?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** ID's of labels that were removed. */
    removedLabelIds?: string[];
    /** The id of user to whom the issue was assigned to. */
    toAssigneeId?: string;
    /** The id of new project created from the issue. */
    toConvertedProjectId?: string;
    /** The id of new cycle of the issue. */
    toCycleId?: string;
    /** What the due date was changed to. */
    toDueDate?: L.Scalars["TimelessDate"];
    /** What the estimate was changed to. */
    toEstimate?: number;
    /** The id of new parent of the issue. */
    toParentId?: string;
    /** What the priority was changed to. */
    toPriority?: number;
    /** The id of new project of the issue. */
    toProjectId?: string;
    /** The id of new workflow state of the issue. */
    toStateId?: string;
    /** The id of team to which the issue was moved to. */
    toTeamId?: string;
    /** What the title was changed to. */
    toTitle?: string;
    /** Whether the issue was trashed or un-trashed. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Whether the issue's description was updated. */
    updatedDescription?: boolean;
    /** The actors that performed the actions. This field may be empty in the case of integrations or automations. */
    actors?: User[];
    /** The labels that were added to the issue. */
    addedLabels?: IssueLabel[];
    /** Changed issue relationships. */
    relationChanges?: IssueRelationHistoryPayload[];
    /** The labels that were removed from the issue. */
    removedLabels?: IssueLabel[];
    /** The users that were notified of the issue. */
    triageResponsibilityNotifiedUsers?: User[];
    /** The bot that performed the action. */
    botActor?: ActorBot;
    /** The import record. */
    issueImport?: IssueImport;
    /** The actor that performed the actions. This field may be empty in the case of integrations or automations. */
    get actor(): LinearFetch<User> | undefined;
    /** The linked attachment. */
    get attachment(): LinearFetch<Attachment> | undefined;
    /** The user that was unassigned from the issue. */
    get fromAssignee(): LinearFetch<User> | undefined;
    /** The cycle that the issue was moved from. */
    get fromCycle(): LinearFetch<Cycle> | undefined;
    /** The parent issue that the issue was moved from. */
    get fromParent(): LinearFetch<Issue> | undefined;
    /** The project that the issue was moved from. */
    get fromProject(): LinearFetch<Project> | undefined;
    /** The state that the issue was moved from. */
    get fromState(): LinearFetch<WorkflowState> | undefined;
    /** The team that the issue was moved from. */
    get fromTeam(): LinearFetch<Team> | undefined;
    /** The issue that was changed. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The user that was assigned to the issue. */
    get toAssignee(): LinearFetch<User> | undefined;
    /** The new project created from the issue. */
    get toConvertedProject(): LinearFetch<Project> | undefined;
    /** The cycle that the issue was moved to. */
    get toCycle(): LinearFetch<Cycle> | undefined;
    /** The parent issue that the issue was moved to. */
    get toParent(): LinearFetch<Issue> | undefined;
    /** The project that the issue was moved to. */
    get toProject(): LinearFetch<Project> | undefined;
    /** The state that the issue was moved to. */
    get toState(): LinearFetch<WorkflowState> | undefined;
    /** The team that the issue was moved to. */
    get toTeam(): LinearFetch<Team> | undefined;
}
/**
 * IssueHistoryConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IssueHistoryConnection model
 * @param data - IssueHistoryConnection response data
 */
export declare class IssueHistoryConnection extends Connection<IssueHistory> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IssueHistory> | undefined>, data: L.IssueHistoryConnectionFragment);
}
/**
 * An import job for data from an external service.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueImportFragment response data
 */
export declare class IssueImport extends Request {
    constructor(request: LinearRequest, data: L.IssueImportFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The id for the user that started the job. */
    creatorId: string;
    /** File URL for the uploaded CSV for the import, if there is one. */
    csvFileUrl?: string;
    /** The display name of the import service. */
    displayName: string;
    /** User readable error message, if one has occurred during the import. */
    error?: string;
    /** Error code and metadata, if one has occurred during the import. */
    errorMetadata?: L.Scalars["JSONObject"];
    /** The unique identifier of the entity. */
    id: string;
    /** The data mapping configuration for the import job. */
    mapping?: L.Scalars["JSONObject"];
    /** Current step progress in % (0-100). */
    progress?: number;
    /** The service from which data will be imported. */
    service: string;
    /** Metadata related to import service. */
    serviceMetadata?: L.Scalars["JSONObject"];
    /** The status for the import job. */
    status: string;
    /** New team's name in cases when teamId not set. */
    teamName?: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Deletes an import job. */
    delete(issueImportId: string): LinearFetch<IssueImportDeletePayload>;
    /** Updates the mapping for the issue import. */
    update(input: L.IssueImportUpdateInput): LinearFetch<IssueImportPayload>;
}
/**
 * IssueImportCheckPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueImportCheckPayloadFragment response data
 */
export declare class IssueImportCheckPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueImportCheckPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * IssueImportDeletePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueImportDeletePayloadFragment response data
 */
export declare class IssueImportDeletePayload extends Request {
    constructor(request: LinearRequest, data: L.IssueImportDeletePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The import job that was deleted. */
    issueImport?: IssueImport;
}
/**
 * IssueImportPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueImportPayloadFragment response data
 */
export declare class IssueImportPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueImportPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The import job that was created or updated. */
    issueImport?: IssueImport;
}
/**
 * Whether an issue import can be synced at the end of an import or not
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueImportSyncCheckPayloadFragment response data
 */
export declare class IssueImportSyncCheckPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueImportSyncCheckPayloadFragment);
    /** Returns true if the import can be synced, false otherwise */
    canSync: boolean;
    /** An error message with a root cause of why the import cannot be synced */
    error?: string;
}
/**
 * Labels that can be associated with issues.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueLabelFragment response data
 */
export declare class IssueLabel extends Request {
    private _creator?;
    private _parent?;
    private _team?;
    constructor(request: LinearRequest, data: L.IssueLabelFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The label's color as a HEX string. */
    color: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The label's description. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether this label is considered to be a group. */
    isGroup: boolean;
    /** The label's name. */
    name: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user who created the label. */
    get creator(): LinearFetch<User> | undefined;
    get organization(): LinearFetch<Organization>;
    /** The parent label. */
    get parent(): LinearFetch<IssueLabel> | undefined;
    /** The team that the label is associated with. If null, the label is associated with the global workspace. */
    get team(): LinearFetch<Team> | undefined;
    /** Children of the label. */
    children(variables?: Omit<L.IssueLabel_ChildrenQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
    /** Issues associated with the label. */
    issues(variables?: Omit<L.IssueLabel_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Creates a new label. */
    create(input: L.IssueLabelCreateInput, variables?: Omit<L.CreateIssueLabelMutationVariables, "input">): LinearFetch<IssueLabelPayload>;
    /** Deletes an issue label. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an label. */
    update(input: L.IssueLabelUpdateInput, variables?: Omit<L.UpdateIssueLabelMutationVariables, "id" | "input">): LinearFetch<IssueLabelPayload>;
}
/**
 * IssueLabelConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IssueLabelConnection model
 * @param data - IssueLabelConnection response data
 */
export declare class IssueLabelConnection extends Connection<IssueLabel> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IssueLabel> | undefined>, data: L.IssueLabelConnectionFragment);
}
/**
 * IssueLabelPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueLabelPayloadFragment response data
 */
export declare class IssueLabelPayload extends Request {
    private _issueLabel;
    constructor(request: LinearRequest, data: L.IssueLabelPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The label that was created or updated. */
    get issueLabel(): LinearFetch<IssueLabel> | undefined;
}
/**
 * An issue related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueNotificationFragment response data
 */
export declare class IssueNotification extends Request {
    private _actor?;
    private _comment?;
    private _externalUserActor?;
    private _issue;
    private _parentComment?;
    private _team;
    private _user;
    constructor(request: LinearRequest, data: L.IssueNotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Related comment ID. Null if the notification is not related to a comment. */
    commentId?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Related issue ID. */
    issueId: string;
    /** Related parent comment ID. Null if the notification is not related to a comment. */
    parentCommentId?: string;
    /** Name of the reaction emoji related to the notification. */
    reactionEmoji?: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The subscriptions related to the notification. */
    subscriptions?: NotificationSubscription[];
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The comment related to the notification. */
    get comment(): LinearFetch<Comment> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The issue related to the notification. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The parent comment related to the notification, if a notification is a reply comment notification. */
    get parentComment(): LinearFetch<Comment> | undefined;
    /** The team related to the issue notification. */
    get team(): LinearFetch<Team> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * IssuePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssuePayloadFragment response data
 */
export declare class IssuePayload extends Request {
    private _issue?;
    constructor(request: LinearRequest, data: L.IssuePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The issue that was created or updated. */
    get issue(): LinearFetch<Issue> | undefined;
}
/**
 * IssuePriorityValue model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssuePriorityValueFragment response data
 */
export declare class IssuePriorityValue extends Request {
    constructor(request: LinearRequest, data: L.IssuePriorityValueFragment);
    /** Priority's label. */
    label: string;
    /** Priority's number value. */
    priority: number;
}
/**
 * A relation between two issues.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueRelationFragment response data
 */
export declare class IssueRelation extends Request {
    private _issue;
    private _relatedIssue;
    constructor(request: LinearRequest, data: L.IssueRelationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The relationship of the issue with the related issue. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The issue whose relationship is being described. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The related issue. */
    get relatedIssue(): LinearFetch<Issue> | undefined;
    /** Creates a new issue relation. */
    create(input: L.IssueRelationCreateInput, variables?: Omit<L.CreateIssueRelationMutationVariables, "input">): LinearFetch<IssueRelationPayload>;
    /** Deletes an issue relation. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an issue relation. */
    update(input: L.IssueRelationUpdateInput): LinearFetch<IssueRelationPayload>;
}
/**
 * IssueRelationConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IssueRelationConnection model
 * @param data - IssueRelationConnection response data
 */
export declare class IssueRelationConnection extends Connection<IssueRelation> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IssueRelation> | undefined>, data: L.IssueRelationConnectionFragment);
}
/**
 * Issue relation history's payload.
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueRelationHistoryPayloadFragment response data
 */
export declare class IssueRelationHistoryPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueRelationHistoryPayloadFragment);
    /** The identifier of the related issue. */
    identifier: string;
    /** The type of the change. */
    type: string;
}
/**
 * IssueRelationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueRelationPayloadFragment response data
 */
export declare class IssueRelationPayload extends Request {
    private _issueRelation;
    constructor(request: LinearRequest, data: L.IssueRelationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The issue relation that was created or updated. */
    get issueRelation(): LinearFetch<IssueRelation> | undefined;
}
/**
 * IssueSearchPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueSearchPayloadFragment response data
 */
export declare class IssueSearchPayload extends Request {
    constructor(request: LinearRequest, data: L.IssueSearchPayloadFragment);
    /** Total number of results for query without filters applied. */
    totalCount: number;
    nodes: IssueSearchResult[];
    /** Archived entities matching the search term along with all their dependencies. */
    archivePayload: ArchiveResponse;
    pageInfo: PageInfo;
}
/**
 * IssueSearchResult model
 *
 * @param request - function to call the graphql client
 * @param data - L.IssueSearchResultFragment response data
 */
export declare class IssueSearchResult extends Request {
    private _assignee?;
    private _creator?;
    private _cycle?;
    private _externalUserCreator?;
    private _favorite?;
    private _lastAppliedTemplate?;
    private _parent?;
    private _project?;
    private _projectMilestone?;
    private _snoozedBy?;
    private _sourceComment?;
    private _state;
    private _team;
    constructor(request: LinearRequest, data: L.IssueSearchResultFragment);
    /** The time at which the issue was added to a cycle. */
    addedToCycleAt?: Date;
    /** The time at which the issue was added to a project. */
    addedToProjectAt?: Date;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the issue was automatically archived by the auto pruning process. */
    autoArchivedAt?: Date;
    /** The time at which the issue was automatically closed by the auto pruning process. */
    autoClosedAt?: Date;
    /** The order of the item in its column on the board. */
    boardOrder: number;
    /** Suggested branch name for the issue. */
    branchName: string;
    /** The time at which the issue was moved into canceled state. */
    canceledAt?: Date;
    /** The time at which the issue was moved into completed state. */
    completedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Returns the number of Attachment resources which are created by customer support ticketing systems (e.g. Zendesk). */
    customerTicketCount: number;
    /** The issue's description in markdown format. */
    description?: string;
    /** The date at which the issue is due. */
    dueDate?: L.Scalars["TimelessDate"];
    /** The estimate of the complexity of the issue.. */
    estimate?: number;
    /** The unique identifier of the entity. */
    id: string;
    /** Issue's human readable identifier (e.g. ENG-123). */
    identifier: string;
    /** Id of the labels associated with this issue. */
    labelIds: string[];
    /** Metadata related to search result. */
    metadata: L.Scalars["JSONObject"];
    /** The issue's unique number. */
    number: number;
    /** Previous identifiers of the issue if it has been moved between teams. */
    previousIdentifiers: string[];
    /** The priority of the issue. 0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low. */
    priority: number;
    /** Label for the priority. */
    priorityLabel: string;
    /** Emoji reaction summary, grouped by emoji type. */
    reactionData: L.Scalars["JSONObject"];
    /** The time at which the issue's SLA will breach. */
    slaBreachesAt?: Date;
    /** The time at which the issue's SLA began. */
    slaStartedAt?: Date;
    /** The time until an issue will be snoozed in Triage view. */
    snoozedUntilAt?: Date;
    /** The order of the item in relation to other items in the organization. */
    sortOrder: number;
    /** The time at which the issue was moved into started state. */
    startedAt?: Date;
    /** The time at which the issue entered triage. */
    startedTriageAt?: Date;
    /** The order of the item in the sub-issue list. Only set if the issue has a parent. */
    subIssueSortOrder?: number;
    /** The issue's title. */
    title: string;
    /** A flag that indicates whether the issue is in the trash bin. */
    trashed?: boolean;
    /** The time at which the issue left triage. */
    triagedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Issue URL. */
    url: string;
    /** Reactions associated with the issue. */
    reactions: Reaction[];
    /** The bot that created the issue, if applicable. */
    botActor?: ActorBot;
    /** Integration type that created this issue, if applicable. */
    integrationSourceType?: L.IntegrationService;
    /** The user to whom the issue is assigned to. */
    get assignee(): LinearFetch<User> | undefined;
    /** The user who created the issue. */
    get creator(): LinearFetch<User> | undefined;
    /** The cycle that the issue is associated with. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The external user who created the issue. */
    get externalUserCreator(): LinearFetch<ExternalUser> | undefined;
    /** The users favorite associated with this issue. */
    get favorite(): LinearFetch<Favorite> | undefined;
    /** The last template that was applied to this issue. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The parent of the issue. */
    get parent(): LinearFetch<Issue> | undefined;
    /** The project that the issue is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The projectMilestone that the issue is associated with. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
    /** The user who snoozed the issue. */
    get snoozedBy(): LinearFetch<User> | undefined;
    /** The comment that this issue was created from. */
    get sourceComment(): LinearFetch<Comment> | undefined;
    /** The workflow state that the issue is associated with. */
    get state(): LinearFetch<WorkflowState> | undefined;
    /** The team that the issue is associated with. */
    get team(): LinearFetch<Team> | undefined;
}
/**
 * IssueSearchResultConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this IssueSearchResultConnection model
 * @param data - IssueSearchResultConnection response data
 */
export declare class IssueSearchResultConnection extends Connection<IssueSearchResult> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<IssueSearchResult> | undefined>, data: L.IssueSearchResultConnectionFragment);
}
/**
 * Tuple for mapping Jira projects to Linear teams.
 *
 * @param request - function to call the graphql client
 * @param data - L.JiraLinearMappingFragment response data
 */
export declare class JiraLinearMapping extends Request {
    constructor(request: LinearRequest, data: L.JiraLinearMappingFragment);
    /** Whether the sync for this mapping is bidirectional. */
    bidirectional?: boolean;
    /** Whether this mapping is the default one for issue creation. */
    default?: boolean;
    /** The Jira id for this project. */
    jiraProjectId: string;
    /** The Linear team id to map to the given project. */
    linearTeamId: string;
}
/**
 * Jira personal specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.JiraPersonalSettingsFragment response data
 */
export declare class JiraPersonalSettings extends Request {
    constructor(request: LinearRequest, data: L.JiraPersonalSettingsFragment);
    /** The name of the Jira site currently authorized through the integration. */
    siteName?: string;
}
/**
 * Metadata about a Jira project.
 *
 * @param request - function to call the graphql client
 * @param data - L.JiraProjectDataFragment response data
 */
export declare class JiraProjectData extends Request {
    constructor(request: LinearRequest, data: L.JiraProjectDataFragment);
    /** The Jira id for this project. */
    id: string;
    /** The Jira key for this project, such as ENG. */
    key: string;
    /** The Jira name for this project, such as Engineering. */
    name: string;
}
/**
 * Jira specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.JiraSettingsFragment response data
 */
export declare class JiraSettings extends Request {
    constructor(request: LinearRequest, data: L.JiraSettingsFragment);
    /** Whether this integration is for Jira Server or not. */
    isJiraServer?: boolean;
    /** Whether this integration is using a manual setup flow. */
    manualSetup?: boolean;
    /** Whether the user needs to provide setup information about the webhook to complete the integration setup. Only relevant for integrations that use a manual setup flow */
    setupPending?: boolean;
    /** The mapping of Jira project id => Linear team id. */
    projectMapping?: JiraLinearMapping[];
    /** The Jira projects for the organization. */
    projects: JiraProjectData[];
}
/**
 * A label notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.LabelNotificationSubscriptionFragment response data
 */
export declare class LabelNotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative?;
    private _label;
    private _project?;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.LabelNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The label subscribed to. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * LaunchDarkly specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.LaunchDarklySettingsFragment response data
 */
export declare class LaunchDarklySettings extends Request {
    constructor(request: LinearRequest, data: L.LaunchDarklySettingsFragment);
    /** The environment of the LaunchDarkly integration. */
    environment: string;
    /** The project key of the LaunchDarkly integration. */
    projectKey: string;
}
/**
 * LogoutResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.LogoutResponseFragment response data
 */
export declare class LogoutResponse extends Request {
    constructor(request: LinearRequest, data: L.LogoutResponseFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Node model
 *
 * @param request - function to call the graphql client
 * @param data - L.NodeFragment response data
 */
export declare class Node extends Request {
    constructor(request: LinearRequest, data: L.NodeFragment);
    /** The unique identifier of the entity. */
    id: string;
}
/**
 * A notification sent to a user.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationFragment response data
 */
export declare class Notification extends Request {
    private _actor?;
    private _externalUserActor?;
    private _user;
    constructor(request: LinearRequest, data: L.NotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
    /** Archives a notification. */
    archive(): LinearFetch<NotificationArchivePayload>;
    /** Unarchives a notification. */
    unarchive(): LinearFetch<NotificationArchivePayload>;
    /** Updates a notification. */
    update(input: L.NotificationUpdateInput): LinearFetch<NotificationPayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationArchivePayloadFragment response data
 */
export declare class NotificationArchivePayload extends Request {
    constructor(request: LinearRequest, data: L.NotificationArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * NotificationBatchActionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationBatchActionPayloadFragment response data
 */
export declare class NotificationBatchActionPayload extends Request {
    constructor(request: LinearRequest, data: L.NotificationBatchActionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The notifications that were updated. */
    notifications: Notification[];
}
/**
 * NotificationConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this NotificationConnection model
 * @param data - NotificationConnection response data
 */
export declare class NotificationConnection extends Connection<DocumentNotification | InitiativeNotification | IssueNotification | OauthClientApprovalNotification | ProjectNotification | Notification> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<DocumentNotification | InitiativeNotification | IssueNotification | OauthClientApprovalNotification | ProjectNotification | Notification> | undefined>, data: L.NotificationConnectionFragment);
}
/**
 * A user's notification delivery preferences.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationDeliveryPreferencesFragment response data
 */
export declare class NotificationDeliveryPreferences extends Request {
    constructor(request: LinearRequest, data: L.NotificationDeliveryPreferencesFragment);
    /** The delivery preferences for the mobile channel. */
    mobile?: NotificationDeliveryPreferencesChannel;
}
/**
 * A user's notification delivery preferences.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationDeliveryPreferencesChannelFragment response data
 */
export declare class NotificationDeliveryPreferencesChannel extends Request {
    constructor(request: LinearRequest, data: L.NotificationDeliveryPreferencesChannelFragment);
    /** Whether notifications are enabled for this channel. */
    notificationsDisabled?: boolean;
    /** The schedule for notifications on this channel. */
    schedule?: NotificationDeliveryPreferencesSchedule;
}
/**
 * A user's notification delivery schedule for a particular day.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationDeliveryPreferencesDayFragment response data
 */
export declare class NotificationDeliveryPreferencesDay extends Request {
    constructor(request: LinearRequest, data: L.NotificationDeliveryPreferencesDayFragment);
    /** The time notifications end. */
    end?: string;
    /** The time notifications start. */
    start?: string;
}
/**
 * A user's notification delivery schedule for a particular day.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationDeliveryPreferencesScheduleFragment response data
 */
export declare class NotificationDeliveryPreferencesSchedule extends Request {
    constructor(request: LinearRequest, data: L.NotificationDeliveryPreferencesScheduleFragment);
    /** Whether the schedule is disabled. */
    disabled?: boolean;
    /** Delivery preferences for Friday. */
    friday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Monday. */
    monday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Saturday. */
    saturday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Sunday. */
    sunday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Thursday. */
    thursday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Tuesday. */
    tuesday: NotificationDeliveryPreferencesDay;
    /** Delivery preferences for Wednesday. */
    wednesday: NotificationDeliveryPreferencesDay;
}
/**
 * NotificationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationPayloadFragment response data
 */
export declare class NotificationPayload extends Request {
    constructor(request: LinearRequest, data: L.NotificationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Notification subscriptions for models.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationSubscriptionFragment response data
 */
export declare class NotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative?;
    private _label?;
    private _project?;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.NotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
    /** Creates a new notification subscription for a cycle, custom view, label, project or team. */
    create(input: L.NotificationSubscriptionCreateInput): LinearFetch<NotificationSubscriptionPayload>;
    /** Deletes a notification subscription reference. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a notification subscription. */
    update(input: L.NotificationSubscriptionUpdateInput): LinearFetch<NotificationSubscriptionPayload>;
}
/**
 * NotificationSubscriptionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this NotificationSubscriptionConnection model
 * @param data - NotificationSubscriptionConnection response data
 */
export declare class NotificationSubscriptionConnection extends Connection<CustomViewNotificationSubscription | CycleNotificationSubscription | InitiativeNotificationSubscription | LabelNotificationSubscription | ProjectNotificationSubscription | TeamNotificationSubscription | UserNotificationSubscription | NotificationSubscription> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<CustomViewNotificationSubscription | CycleNotificationSubscription | InitiativeNotificationSubscription | LabelNotificationSubscription | ProjectNotificationSubscription | TeamNotificationSubscription | UserNotificationSubscription | NotificationSubscription> | undefined>, data: L.NotificationSubscriptionConnectionFragment);
}
/**
 * NotificationSubscriptionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.NotificationSubscriptionPayloadFragment response data
 */
export declare class NotificationSubscriptionPayload extends Request {
    constructor(request: LinearRequest, data: L.NotificationSubscriptionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Notion specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.NotionSettingsFragment response data
 */
export declare class NotionSettings extends Request {
    constructor(request: LinearRequest, data: L.NotionSettingsFragment);
    /** The ID of the Notion workspace being connected. */
    workspaceId: string;
    /** The name of the Notion workspace being connected. */
    workspaceName: string;
}
/**
 * OAuth2 client application
 *
 * @param request - function to call the graphql client
 * @param data - L.OauthClientFragment response data
 */
export declare class OauthClient extends Request {
    private _creator;
    constructor(request: LinearRequest, data: L.OauthClientFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** OAuth application's client ID. */
    clientId: string;
    /** OAuth application's client secret. */
    clientSecret: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Information about the application. */
    description?: string;
    /** Name of the developer. */
    developer: string;
    /** Url of the developer. */
    developerUrl: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Image of the application. */
    imageUrl?: string;
    /** OAuth application's client name. */
    name: string;
    /** Whether the OAuth application can be installed in other organizations. */
    publicEnabled: boolean;
    /** List of allowed redirect URIs for the application. */
    redirectUris: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The resource types to request when creating new webhooks. */
    webhookResourceTypes: string[];
    /** Webhook secret token for verifying the origin on the recipient side. */
    webhookSecret?: string;
    /** Webhook URL. */
    webhookUrl?: string;
    /** The user who created the OAuth application. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization that the OAuth application is associated with. */
    get organization(): LinearFetch<Organization>;
}
/**
 * Request to install OAuth clients on organizations and the response to the request.
 *
 * @param request - function to call the graphql client
 * @param data - L.OauthClientApprovalFragment response data
 */
export declare class OauthClientApproval extends Request {
    constructor(request: LinearRequest, data: L.OauthClientApprovalFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The reason the request for the OAuth client approval was denied. */
    denyReason?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The uuid of the OAuth client being requested for installation. */
    oauthClientId: string;
    /** The reason the person wants to install this OAuth client. */
    requestReason?: string;
    /** The person who requested installing the OAuth client. */
    requesterId: string;
    /** The person who responded to the request to install the OAuth client. */
    responderId?: string;
    /** The scopes the app has requested. */
    scopes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The status for the OAuth client approval request. */
    status: L.OAuthClientApprovalStatus;
}
/**
 * An oauth client approval related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.OauthClientApprovalNotificationFragment response data
 */
export declare class OauthClientApprovalNotification extends Request {
    private _actor?;
    private _externalUserActor?;
    private _user;
    constructor(request: LinearRequest, data: L.OauthClientApprovalNotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Related OAuth client approval request ID. */
    oauthClientApprovalId: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The OAuth client approval request related to the notification. */
    oauthClientApproval: OauthClientApproval;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * OauthClientConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this OauthClientConnection model
 * @param data - OauthClientConnection response data
 */
export declare class OauthClientConnection extends Connection<OauthClient> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<OauthClient> | undefined>, data: L.OauthClientConnectionFragment);
}
/**
 * OauthToken model
 *
 * @param request - function to call the graphql client
 * @param data - L.OauthTokenFragment response data
 */
export declare class OauthToken extends Request {
    constructor(request: LinearRequest, data: L.OauthTokenFragment);
    clientId: string;
    createdAt: Date;
    id: number;
    revokedAt?: Date;
    /** Scopes associated with the access token. */
    scope: string[];
    /** Id of the user who authorized the OAuth application. */
    userId: string;
    /** OAuth2 client for which the access token belongs to. */
    client: AuthOauthClient;
    /** Auth user who authorized the OAuth application. */
    user: AuthUser;
}
/**
 * Opsgenie specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.OpsgenieSettingsFragment response data
 */
export declare class OpsgenieSettings extends Request {
    constructor(request: LinearRequest, data: L.OpsgenieSettingsFragment);
    /** The date when the Opsgenie API failed with an unauthorized error. */
    apiFailedWithUnauthorizedErrorAt?: Date;
}
/**
 * An organization. Organizations are root-level objects that contain user accounts and teams.
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationFragment response data
 */
export declare class Organization extends Request {
    constructor(request: LinearRequest, data: L.OrganizationFragment);
    /** Whether member users are allowed to send invites. */
    allowMembersToInvite?: boolean;
    /** Allowed authentication providers, empty array means all are allowed. */
    allowedAuthServices: string[];
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Number of issues in the organization. */
    createdIssueCount: number;
    /** The time at which deletion of the organization was requested. */
    deletionRequestedAt?: Date;
    /** The month at which the fiscal year starts. Defaults to January (0). */
    fiscalYearStartMonth: number;
    /** How git branches are formatted. If null, default formatting will be used. */
    gitBranchFormat?: string;
    /** Whether the Git integration linkback messages should be sent to private repositories. */
    gitLinkbackMessagesEnabled: boolean;
    /** Whether the Git integration linkback messages should be sent to public repositories. */
    gitPublicLinkbackMessagesEnabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** The organization's logo URL. */
    logoUrl?: string;
    /** The organization's name. */
    name: string;
    /** Rolling 30-day total upload volume for the organization, in megabytes. */
    periodUploadVolume: number;
    /** Previously used URL keys for the organization (last 3 are kept and redirected). */
    previousUrlKeys: string[];
    /** The n-weekly frequency at which to prompt for project updates. When not set, reminders are off. */
    projectUpdateReminderFrequencyInWeeks?: number;
    /** The hour at which to prompt for project updates. */
    projectUpdateRemindersHour: number;
    /** Whether the organization is using a roadmap. */
    roadmapEnabled: boolean;
    /** Whether SAML authentication is enabled for organization. */
    samlEnabled: boolean;
    /** Whether SCIM provisioning is enabled for organization. */
    scimEnabled: boolean;
    /** The time at which the trial will end. */
    trialEndsAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The organization's unique URL key. */
    urlKey: string;
    /** Number of active users in the organization. */
    userCount: number;
    /** IP restriction configurations. */
    ipRestrictions?: OrganizationIpRestriction[];
    /** The organization's project statuses. */
    projectStatuses: ProjectStatus[];
    /** The organization's subscription to a paid plan. */
    subscription?: PaidSubscription;
    /** The day at which to prompt for project updates. */
    projectUpdateRemindersDay: L.Day;
    /** [DEPRECATED] The frequency at which to prompt for project updates. */
    projectUpdatesReminderFrequency: L.ProjectUpdateReminderFrequency;
    /** The feature release channel the organization belongs to. */
    releaseChannel: L.ReleaseChannel;
    /** Which day count to use for SLA calculations. */
    slaDayCount: L.SLADayCountType;
    /** Integrations associated with the organization. */
    integrations(variables?: L.Organization_IntegrationsQueryVariables): LinearFetch<IntegrationConnection>;
    /** Labels associated with the organization. */
    labels(variables?: L.Organization_LabelsQueryVariables): LinearFetch<IssueLabelConnection>;
    /** Teams associated with the organization. */
    teams(variables?: L.Organization_TeamsQueryVariables): LinearFetch<TeamConnection>;
    /** Templates associated with the organization. */
    templates(variables?: L.Organization_TemplatesQueryVariables): LinearFetch<TemplateConnection>;
    /** Users associated with the organization. */
    users(variables?: L.Organization_UsersQueryVariables): LinearFetch<UserConnection>;
    /** Delete's an organization. Administrator privileges required. */
    delete(input: L.DeleteOrganizationInput): LinearFetch<OrganizationDeletePayload>;
    /** Updates the user's organization. */
    update(input: L.OrganizationUpdateInput): LinearFetch<OrganizationPayload>;
}
/**
 * OrganizationAcceptedOrExpiredInviteDetailsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationAcceptedOrExpiredInviteDetailsPayloadFragment response data
 */
export declare class OrganizationAcceptedOrExpiredInviteDetailsPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationAcceptedOrExpiredInviteDetailsPayloadFragment);
    /** The status of the invite. */
    status: L.OrganizationInviteStatus;
}
/**
 * OrganizationCancelDeletePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationCancelDeletePayloadFragment response data
 */
export declare class OrganizationCancelDeletePayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationCancelDeletePayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * OrganizationDeletePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationDeletePayloadFragment response data
 */
export declare class OrganizationDeletePayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationDeletePayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Defines the use of a domain by an organization.
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationDomainFragment response data
 */
export declare class OrganizationDomain extends Request {
    private _creator?;
    constructor(request: LinearRequest, data: L.OrganizationDomainFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Whether the domains was claimed by the organization through DNS verification. */
    claimed?: boolean;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Prevent users with this domain to create new workspaces. */
    disableOrganizationCreation?: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** Domain name. */
    name: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** E-mail used to verify this domain. */
    verificationEmail?: string;
    /** Is this domain verified. */
    verified: boolean;
    /** What type of auth is the domain used for. */
    authType: L.OrganizationDomainAuthType;
    /** The user who added the domain. */
    get creator(): LinearFetch<User> | undefined;
    /** Deletes a domain. */
    delete(): LinearFetch<DeletePayload>;
}
/**
 * OrganizationExistsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationExistsPayloadFragment response data
 */
export declare class OrganizationExistsPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationExistsPayloadFragment);
    /** Whether the organization exists. */
    exists: boolean;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * An invitation to the organization that has been sent via email.
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationInviteFragment response data
 */
export declare class OrganizationInvite extends Request {
    private _invitee?;
    private _inviter;
    constructor(request: LinearRequest, data: L.OrganizationInviteFragment);
    /** The time at which the invite was accepted. Null, if the invite hasn't been accepted. */
    acceptedAt?: Date;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The invitees email address. */
    email: string;
    /** The time at which the invite will be expiring. Null, if the invite shouldn't expire. */
    expiresAt?: Date;
    /** The invite was sent to external address. */
    external: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** Extra metadata associated with the organization invite. */
    metadata?: L.Scalars["JSONObject"];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user role that the invitee will receive upon accepting the invite. */
    role: L.UserRoleType;
    /** The user who has accepted the invite. Null, if the invite hasn't been accepted. */
    get invitee(): LinearFetch<User> | undefined;
    /** The user who created the invitation. */
    get inviter(): LinearFetch<User> | undefined;
    /** The organization that the invite is associated with. */
    get organization(): LinearFetch<Organization>;
    /** Creates a new organization invite. */
    create(input: L.OrganizationInviteCreateInput): LinearFetch<OrganizationInvitePayload>;
    /** Deletes an organization invite. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an organization invite. */
    update(input: L.OrganizationInviteUpdateInput): LinearFetch<OrganizationInvitePayload>;
}
/**
 * OrganizationInviteConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this OrganizationInviteConnection model
 * @param data - OrganizationInviteConnection response data
 */
export declare class OrganizationInviteConnection extends Connection<OrganizationInvite> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<OrganizationInvite> | undefined>, data: L.OrganizationInviteConnectionFragment);
}
/**
 * OrganizationInviteFullDetailsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationInviteFullDetailsPayloadFragment response data
 */
export declare class OrganizationInviteFullDetailsPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationInviteFullDetailsPayloadFragment);
    /** Whether the invite has already been accepted. */
    accepted: boolean;
    /** Allowed authentication providers, empty array means all are allowed. */
    allowedAuthServices: string[];
    /** When the invite was created. */
    createdAt: Date;
    /** The email of the invitee. */
    email: string;
    /** Whether the invite has expired. */
    expired: boolean;
    /** The name of the inviter. */
    inviter: string;
    /** ID of the workspace the invite is for. */
    organizationId: string;
    /** URL of the workspace logo the invite is for. */
    organizationLogoUrl?: string;
    /** Name of the workspace the invite is for. */
    organizationName: string;
    /** What user role the invite should grant. */
    role: L.UserRoleType;
    /** The status of the invite. */
    status: L.OrganizationInviteStatus;
}
/**
 * OrganizationInviteLinkDetailsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationInviteLinkDetailsPayloadFragment response data
 */
export declare class OrganizationInviteLinkDetailsPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationInviteLinkDetailsPayloadFragment);
    /** Allowed authentication providers, empty array means all are allowed. */
    allowedAuthServices: string[];
    /** ID of the workspace the invite link is for. */
    organizationId?: string;
    /** URL of the workspace logo the invite link is for. */
    organizationLogoUrl?: string;
    /** Name of the workspace the invite link is for. */
    organizationName?: string;
    /** Region of the workspace the invite link is for. */
    organizationRegion?: string;
    /** URL key of the workspace the invite link is for. */
    organizationUrlKey?: string;
}
/**
 * OrganizationInvitePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationInvitePayloadFragment response data
 */
export declare class OrganizationInvitePayload extends Request {
    private _organizationInvite;
    constructor(request: LinearRequest, data: L.OrganizationInvitePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The organization invite that was created or updated. */
    get organizationInvite(): LinearFetch<OrganizationInvite> | undefined;
}
/**
 * OrganizationIpRestriction model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationIpRestrictionFragment response data
 */
export declare class OrganizationIpRestriction extends Request {
    constructor(request: LinearRequest, data: L.OrganizationIpRestrictionFragment);
    /** Optional restriction description. */
    description?: string;
    /** Whether the restriction is enabled. */
    enabled: boolean;
    /** IP range in CIDR format. */
    range: string;
    /** Restriction type. */
    type: string;
}
/**
 * OrganizationMeta model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationMetaFragment response data
 */
export declare class OrganizationMeta extends Request {
    constructor(request: LinearRequest, data: L.OrganizationMetaFragment);
    /** Allowed authentication providers, empty array means all are allowed. */
    allowedAuthServices: string[];
    /** The region the organization is hosted in. */
    region: string;
}
/**
 * OrganizationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationPayloadFragment response data
 */
export declare class OrganizationPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The organization that was created or updated. */
    get organization(): LinearFetch<Organization>;
}
/**
 * OrganizationRegionResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationRegionResponseFragment response data
 */
export declare class OrganizationRegionResponse extends Request {
    constructor(request: LinearRequest, data: L.OrganizationRegionResponseFragment);
    /** The region for the organization. */
    region?: string;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * OrganizationStartTrialPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.OrganizationStartTrialPayloadFragment response data
 */
export declare class OrganizationStartTrialPayload extends Request {
    constructor(request: LinearRequest, data: L.OrganizationStartTrialPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * PageInfo model
 *
 * @param request - function to call the graphql client
 * @param data - L.PageInfoFragment response data
 */
export declare class PageInfo extends Request {
    constructor(request: LinearRequest, data: L.PageInfoFragment);
    /** Cursor representing the last result in the paginated results. */
    endCursor?: string;
    /** Indicates if there are more results when paginating forward. */
    hasNextPage: boolean;
    /** Indicates if there are more results when paginating backward. */
    hasPreviousPage: boolean;
    /** Cursor representing the first result in the paginated results. */
    startCursor?: string;
}
/**
 * PagerDuty specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.PagerDutySettingsFragment response data
 */
export declare class PagerDutySettings extends Request {
    constructor(request: LinearRequest, data: L.PagerDutySettingsFragment);
    /** The date when the PagerDuty API failed with an unauthorized error. */
    apiFailedWithUnauthorizedErrorAt?: Date;
}
/**
 * The paid subscription of an organization.
 *
 * @param request - function to call the graphql client
 * @param data - L.PaidSubscriptionFragment response data
 */
export declare class PaidSubscription extends Request {
    private _creator?;
    constructor(request: LinearRequest, data: L.PaidSubscriptionFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The date the subscription was canceled, if any. */
    canceledAt?: Date;
    /** The collection method for this subscription, either automatically charged or invoiced. */
    collectionMethod: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The date the subscription will be billed next. */
    nextBillingAt?: Date;
    /** The subscription type of a pending change. Null if no change pending. */
    pendingChangeType?: string;
    /** The number of seats in the subscription. */
    seats: number;
    /** The maximum number of seats that will be billed in the subscription. */
    seatsMaximum?: number;
    /** The minimum number of seats that will be billed in the subscription. */
    seatsMinimum?: number;
    /** The subscription type. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The creator of the subscription. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization that the subscription is associated with. */
    get organization(): LinearFetch<Organization>;
}
/**
 * Registered passkey for authentication.
 *
 * @param request - function to call the graphql client
 * @param data - L.PasskeyFragment response data
 */
export declare class Passkey extends Request {
    constructor(request: LinearRequest, data: L.PasskeyFragment);
    aaguid: string;
    /** Used web browser. Only set on creation. */
    browserType?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    id: string;
    /** IP address. Only set on creation. */
    ip?: string;
    label: string;
    /** The time when the passkey was last used. */
    lastUsedAt: Date;
    lastUsedSessionId?: string;
    /** Location city name. Only set on creation. */
    locationCity?: string;
    /** Location country name. Only set on creation. */
    locationCountry?: string;
    /** Location country code. Only set on creation. */
    locationCountryCode?: string;
    /** Location region code. Only set on creation. */
    locationRegionCode?: string;
    /** Date when the passkey was last updated. */
    updatedAt: Date;
    /** Creating session's user-agent. Only set on creation. */
    userAgent?: string;
    /** Type of application used to create. */
    clientType: L.AuthenticationSessionType;
}
/**
 * PasskeyLoginStartResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.PasskeyLoginStartResponseFragment response data
 */
export declare class PasskeyLoginStartResponse extends Request {
    constructor(request: LinearRequest, data: L.PasskeyLoginStartResponseFragment);
    options: L.Scalars["JSONObject"];
    success: boolean;
}
/**
 * A project.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectFragment response data
 */
export declare class Project extends Request {
    private _convertedFromIssue?;
    private _creator?;
    private _favorite?;
    private _integrationsSettings?;
    private _lastAppliedTemplate?;
    private _lead?;
    constructor(request: LinearRequest, data: L.ProjectFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the project was automatically archived by the auto pruning process. */
    autoArchivedAt?: Date;
    /** The time at which the project was moved into canceled state. */
    canceledAt?: Date;
    /** The project's color. */
    color: string;
    /** The time at which the project was moved into completed state. */
    completedAt?: Date;
    /** The number of completed issues in the project after each week. */
    completedIssueCountHistory: number[];
    /** The number of completed estimation points after each week. */
    completedScopeHistory: number[];
    /** The project's content in markdown format. */
    content?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The project's description. */
    description: string;
    /** The time at which the project health was updated. */
    healthUpdatedAt?: Date;
    /** The icon of the project. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The number of in progress estimation points after each week. */
    inProgressScopeHistory: number[];
    /** The total number of issues in the project after each week. */
    issueCountHistory: number[];
    /** The project's name. */
    name: string;
    /** The priority of the project. 0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low. */
    priority: number;
    /** The overall progress of the project. This is the (completed estimate points + 0.25 * in progress estimate points) / total estimate points. */
    progress: number;
    /** The time until which project update reminders are paused. */
    projectUpdateRemindersPausedUntilAt?: Date;
    /** The overall scope (total estimate points) of the project. */
    scope: number;
    /** The total number of estimation points after each week. */
    scopeHistory: number[];
    /** Whether to send new issue comment notifications to Slack. */
    slackIssueComments: boolean;
    /** Whether to send new issue status updates to Slack. */
    slackIssueStatuses: boolean;
    /** Whether to send new issue notifications to Slack. */
    slackNewIssue: boolean;
    /** The project's unique URL slug. */
    slugId: string;
    /** The sort order for the project within the organization. */
    sortOrder: number;
    /** The estimated start date of the project. */
    startDate?: L.Scalars["TimelessDate"];
    /** The time at which the project was moved into started state. */
    startedAt?: Date;
    /** [DEPRECATED] The type of the state. */
    state: string;
    /** The estimated completion date of the project. */
    targetDate?: L.Scalars["TimelessDate"];
    /** A flag that indicates whether the project is in the trash bin. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Project URL. */
    url: string;
    /** The content of the project description. */
    documentContent?: DocumentContent;
    /** The status that the project is associated with. */
    status: ProjectStatus;
    /** The health of the project based on the last project update. */
    health?: L.ProjectUpdateHealthType;
    /** The project was created based on this issue. */
    get convertedFromIssue(): LinearFetch<Issue> | undefined;
    /** The user who created the project. */
    get creator(): LinearFetch<User> | undefined;
    /** The user's favorite associated with this project. */
    get favorite(): LinearFetch<Favorite> | undefined;
    /** Settings for all integrations associated with that project. */
    get integrationsSettings(): LinearFetch<IntegrationsSettings> | undefined;
    /** The last template that was applied to this project. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The project lead. */
    get lead(): LinearFetch<User> | undefined;
    /** Documents associated with the project. */
    documents(variables?: Omit<L.Project_DocumentsQueryVariables, "id">): LinearFetch<DocumentConnection>;
    /** External links associated with the project. */
    externalLinks(variables?: Omit<L.Project_ExternalLinksQueryVariables, "id">): LinearFetch<EntityExternalLinkConnection>;
    /** History entries associated with the project. */
    history(variables?: Omit<L.Project_HistoryQueryVariables, "id">): LinearFetch<ProjectHistoryConnection>;
    /** Initiatives that this project belongs to. */
    initiatives(variables?: Omit<L.Project_InitiativesQueryVariables, "id">): LinearFetch<InitiativeConnection>;
    /** Issues associated with the project. */
    issues(variables?: Omit<L.Project_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** [DEPRECATED] Links associated with the project. */
    links(variables?: Omit<L.Project_LinksQueryVariables, "id">): LinearFetch<ProjectLinkConnection>;
    /** Users that are members of the project. */
    members(variables?: Omit<L.Project_MembersQueryVariables, "id">): LinearFetch<UserConnection>;
    /** Milestones associated with the project. */
    projectMilestones(variables?: Omit<L.Project_ProjectMilestonesQueryVariables, "id">): LinearFetch<ProjectMilestoneConnection>;
    /** Project updates associated with the project. */
    projectUpdates(variables?: Omit<L.Project_ProjectUpdatesQueryVariables, "id">): LinearFetch<ProjectUpdateConnection>;
    /** Teams associated with this project. */
    teams(variables?: Omit<L.Project_TeamsQueryVariables, "id">): LinearFetch<TeamConnection>;
    /** Archives a project. */
    archive(variables?: Omit<L.ArchiveProjectMutationVariables, "id">): LinearFetch<ProjectArchivePayload>;
    /** Creates a new project. */
    create(input: L.ProjectCreateInput, variables?: Omit<L.CreateProjectMutationVariables, "input">): LinearFetch<ProjectPayload>;
    /** Deletes (trashes) a project. */
    delete(): LinearFetch<ProjectArchivePayload>;
    /** Unarchives a project. */
    unarchive(): LinearFetch<ProjectArchivePayload>;
    /** Updates a project. */
    update(): LinearFetch<ProjectUpdate>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectArchivePayloadFragment response data
 */
export declare class ProjectArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.ProjectArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Project> | undefined;
}
/**
 * ProjectConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectConnection model
 * @param data - ProjectConnection response data
 */
export declare class ProjectConnection extends Connection<Project> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Project> | undefined>, data: L.ProjectConnectionFragment);
}
/**
 * ProjectFilterSuggestionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectFilterSuggestionPayloadFragment response data
 */
export declare class ProjectFilterSuggestionPayload extends Request {
    constructor(request: LinearRequest, data: L.ProjectFilterSuggestionPayloadFragment);
    /** The json filter that is suggested. */
    filter?: L.Scalars["JSONObject"];
}
/**
 * An history associated with a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectHistoryFragment response data
 */
export declare class ProjectHistory extends Request {
    private _project;
    constructor(request: LinearRequest, data: L.ProjectHistoryFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The events that happened while recording that history. */
    entries: L.Scalars["JSONObject"];
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The project that the history is associated with. */
    get project(): LinearFetch<Project> | undefined;
}
/**
 * ProjectHistoryConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectHistoryConnection model
 * @param data - ProjectHistoryConnection response data
 */
export declare class ProjectHistoryConnection extends Connection<ProjectHistory> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectHistory> | undefined>, data: L.ProjectHistoryConnectionFragment);
}
/**
 * An external link for a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectLinkFragment response data
 */
export declare class ProjectLink extends Request {
    private _creator;
    private _project;
    constructor(request: LinearRequest, data: L.ProjectLinkFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The link's label. */
    label: string;
    /** The order of the item in the project resources list. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The link's URL. */
    url: string;
    /** The user who created the link. */
    get creator(): LinearFetch<User> | undefined;
    /** The project that the link is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** Creates a new project link. */
    create(input: L.ProjectLinkCreateInput): LinearFetch<ProjectLinkPayload>;
    /** Deletes a project link. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a project link. */
    update(input: L.ProjectLinkUpdateInput): LinearFetch<ProjectLinkPayload>;
}
/**
 * ProjectLinkConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectLinkConnection model
 * @param data - ProjectLinkConnection response data
 */
export declare class ProjectLinkConnection extends Connection<ProjectLink> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectLink> | undefined>, data: L.ProjectLinkConnectionFragment);
}
/**
 * ProjectLinkPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectLinkPayloadFragment response data
 */
export declare class ProjectLinkPayload extends Request {
    private _projectLink;
    constructor(request: LinearRequest, data: L.ProjectLinkPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project that was created or updated. */
    get projectLink(): LinearFetch<ProjectLink> | undefined;
}
/**
 * A milestone for a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectMilestoneFragment response data
 */
export declare class ProjectMilestone extends Request {
    private _project;
    constructor(request: LinearRequest, data: L.ProjectMilestoneFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The project milestone's description in markdown format. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the project milestone. */
    name: string;
    /** The order of the milestone in relation to other milestones within a project. */
    sortOrder: number;
    /** The planned completion date of the milestone. */
    targetDate?: L.Scalars["TimelessDate"];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The content of the project milestone description. */
    documentContent?: DocumentContent;
    /** The project of the milestone. */
    get project(): LinearFetch<Project> | undefined;
    /** Issues associated with the project milestone. */
    issues(variables?: Omit<L.ProjectMilestone_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Creates a new project milestone. */
    create(input: L.ProjectMilestoneCreateInput): LinearFetch<ProjectMilestonePayload>;
    /** Deletes a project milestone. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a project milestone. */
    update(input: L.ProjectMilestoneUpdateInput): LinearFetch<ProjectMilestonePayload>;
}
/**
 * ProjectMilestoneConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectMilestoneConnection model
 * @param data - ProjectMilestoneConnection response data
 */
export declare class ProjectMilestoneConnection extends Connection<ProjectMilestone> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectMilestone> | undefined>, data: L.ProjectMilestoneConnectionFragment);
}
/**
 * ProjectMilestoneMoveIssueToTeam model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectMilestoneMoveIssueToTeamFragment response data
 */
export declare class ProjectMilestoneMoveIssueToTeam extends Request {
    constructor(request: LinearRequest, data: L.ProjectMilestoneMoveIssueToTeamFragment);
    /** The issue id in this relationship, you can use * as wildcard if all issues are being moved to the same team */
    issueId: string;
    /** The team id in this relationship */
    teamId: string;
}
/**
 * ProjectMilestoneMovePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectMilestoneMovePayloadFragment response data
 */
export declare class ProjectMilestoneMovePayload extends Request {
    private _projectMilestone;
    constructor(request: LinearRequest, data: L.ProjectMilestoneMovePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** A snapshot of the issues that were moved to new teams, if the user selected to do it, containing an array of mappings between an issue and its previous team. Store on the client to use for undoing a previous milestone move. */
    previousIssueTeamIds?: ProjectMilestoneMoveIssueToTeam[];
    /** A snapshot of the project that had new teams added to it, if the user selected to do it, containing an array of mappings between a project and its previous teams. Store on the client to use for undoing a previous milestone move. */
    previousProjectTeamIds?: ProjectMilestoneMoveProjectTeams;
    /** The project milestone that was created or updated. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
}
/**
 * ProjectMilestoneMoveProjectTeams model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectMilestoneMoveProjectTeamsFragment response data
 */
export declare class ProjectMilestoneMoveProjectTeams extends Request {
    constructor(request: LinearRequest, data: L.ProjectMilestoneMoveProjectTeamsFragment);
    /** The project id */
    projectId: string;
    /** The team ids for the project */
    teamIds: string[];
}
/**
 * ProjectMilestonePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectMilestonePayloadFragment response data
 */
export declare class ProjectMilestonePayload extends Request {
    private _projectMilestone;
    constructor(request: LinearRequest, data: L.ProjectMilestonePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project milestone that was created or updated. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
}
/**
 * A project related notification.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectNotificationFragment response data
 */
export declare class ProjectNotification extends Request {
    private _actor?;
    private _comment?;
    private _externalUserActor?;
    private _parentComment?;
    private _project;
    private _projectUpdate?;
    private _user;
    constructor(request: LinearRequest, data: L.ProjectNotificationFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Related comment ID. Null if the notification is not related to a comment. */
    commentId?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /**
     * The time at when an email reminder for this notification was sent to the user. Null, if no email
     *     reminder has been sent.
     */
    emailedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Related parent comment ID. Null if the notification is not related to a comment. */
    parentCommentId?: string;
    /** Related project ID. */
    projectId: string;
    /** Related project milestone ID. */
    projectMilestoneId?: string;
    /** Related project update ID. */
    projectUpdateId?: string;
    /** Name of the reaction emoji related to the notification. */
    reactionEmoji?: string;
    /** The time at when the user marked the notification as read. Null, if the the user hasn't read the notification */
    readAt?: Date;
    /** The time until a notification will be snoozed. After that it will appear in the inbox again. */
    snoozedUntilAt?: Date;
    /** Notification type. */
    type: string;
    /** The time at which a notification was unsnoozed.. */
    unsnoozedAt?: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The bot that caused the notification. */
    botActor?: ActorBot;
    /** The user that caused the notification. */
    get actor(): LinearFetch<User> | undefined;
    /** The comment related to the notification. */
    get comment(): LinearFetch<Comment> | undefined;
    /** The external user that caused the notification. */
    get externalUserActor(): LinearFetch<ExternalUser> | undefined;
    /** The parent comment related to the notification, if a notification is a reply comment notification. */
    get parentComment(): LinearFetch<Comment> | undefined;
    /** The project related to the notification. */
    get project(): LinearFetch<Project> | undefined;
    /** The project update related to the notification. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
    /** The user that received the notification. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * A project notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectNotificationSubscriptionFragment response data
 */
export declare class ProjectNotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative?;
    private _label?;
    private _project;
    private _subscriber;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.ProjectNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The project subscribed to. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * ProjectPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectPayloadFragment response data
 */
export declare class ProjectPayload extends Request {
    private _project?;
    constructor(request: LinearRequest, data: L.ProjectPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project that was created or updated. */
    get project(): LinearFetch<Project> | undefined;
}
/**
 * A relation between two projects.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectRelationFragment response data
 */
export declare class ProjectRelation extends Request {
    private _project;
    private _projectMilestone?;
    private _relatedProject;
    private _relatedProjectMilestone?;
    private _user?;
    constructor(request: LinearRequest, data: L.ProjectRelationFragment);
    /** The type of anchor on the project end of the relation. */
    anchorType: string;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of anchor on the relatedProject end of the relation. */
    relatedAnchorType: string;
    /** The relationship of the project with the related project. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The project whose relationship is being described. */
    get project(): LinearFetch<Project> | undefined;
    /** The milestone within the project whose relationship is being described. */
    get projectMilestone(): LinearFetch<ProjectMilestone> | undefined;
    /** The related project. */
    get relatedProject(): LinearFetch<Project> | undefined;
    /** The milestone within the related project whose relationship is being described. */
    get relatedProjectMilestone(): LinearFetch<ProjectMilestone> | undefined;
    /** The last user who created or modified the relation. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * ProjectRelationConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectRelationConnection model
 * @param data - ProjectRelationConnection response data
 */
export declare class ProjectRelationConnection extends Connection<ProjectRelation> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectRelation> | undefined>, data: L.ProjectRelationConnectionFragment);
}
/**
 * ProjectRelationPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectRelationPayloadFragment response data
 */
export declare class ProjectRelationPayload extends Request {
    private _projectRelation;
    constructor(request: LinearRequest, data: L.ProjectRelationPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project relation that was created or updated. */
    get projectRelation(): LinearFetch<ProjectRelation> | undefined;
}
/**
 * ProjectSearchPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectSearchPayloadFragment response data
 */
export declare class ProjectSearchPayload extends Request {
    constructor(request: LinearRequest, data: L.ProjectSearchPayloadFragment);
    /** Total number of results for query without filters applied. */
    totalCount: number;
    nodes: ProjectSearchResult[];
    /** Archived entities matching the search term along with all their dependencies. */
    archivePayload: ArchiveResponse;
    pageInfo: PageInfo;
}
/**
 * ProjectSearchResult model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectSearchResultFragment response data
 */
export declare class ProjectSearchResult extends Request {
    private _convertedFromIssue?;
    private _creator?;
    private _favorite?;
    private _integrationsSettings?;
    private _lastAppliedTemplate?;
    private _lead?;
    constructor(request: LinearRequest, data: L.ProjectSearchResultFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the project was automatically archived by the auto pruning process. */
    autoArchivedAt?: Date;
    /** The time at which the project was moved into canceled state. */
    canceledAt?: Date;
    /** The project's color. */
    color: string;
    /** The time at which the project was moved into completed state. */
    completedAt?: Date;
    /** The number of completed issues in the project after each week. */
    completedIssueCountHistory: number[];
    /** The number of completed estimation points after each week. */
    completedScopeHistory: number[];
    /** The project's content in markdown format. */
    content?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The project's description. */
    description: string;
    /** The time at which the project health was updated. */
    healthUpdatedAt?: Date;
    /** The icon of the project. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The number of in progress estimation points after each week. */
    inProgressScopeHistory: number[];
    /** The total number of issues in the project after each week. */
    issueCountHistory: number[];
    /** Metadata related to search result. */
    metadata: L.Scalars["JSONObject"];
    /** The project's name. */
    name: string;
    /** The priority of the project. 0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low. */
    priority: number;
    /** The overall progress of the project. This is the (completed estimate points + 0.25 * in progress estimate points) / total estimate points. */
    progress: number;
    /** The time until which project update reminders are paused. */
    projectUpdateRemindersPausedUntilAt?: Date;
    /** The overall scope (total estimate points) of the project. */
    scope: number;
    /** The total number of estimation points after each week. */
    scopeHistory: number[];
    /** Whether to send new issue comment notifications to Slack. */
    slackIssueComments: boolean;
    /** Whether to send new issue status updates to Slack. */
    slackIssueStatuses: boolean;
    /** Whether to send new issue notifications to Slack. */
    slackNewIssue: boolean;
    /** The project's unique URL slug. */
    slugId: string;
    /** The sort order for the project within the organization. */
    sortOrder: number;
    /** The estimated start date of the project. */
    startDate?: L.Scalars["TimelessDate"];
    /** The time at which the project was moved into started state. */
    startedAt?: Date;
    /** [DEPRECATED] The type of the state. */
    state: string;
    /** The estimated completion date of the project. */
    targetDate?: L.Scalars["TimelessDate"];
    /** A flag that indicates whether the project is in the trash bin. */
    trashed?: boolean;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Project URL. */
    url: string;
    /** The content of the project description. */
    documentContent?: DocumentContent;
    /** The status that the project is associated with. */
    status: ProjectStatus;
    /** The health of the project based on the last project update. */
    health?: L.ProjectUpdateHealthType;
    /** The project was created based on this issue. */
    get convertedFromIssue(): LinearFetch<Issue> | undefined;
    /** The user who created the project. */
    get creator(): LinearFetch<User> | undefined;
    /** The user's favorite associated with this project. */
    get favorite(): LinearFetch<Favorite> | undefined;
    /** Settings for all integrations associated with that project. */
    get integrationsSettings(): LinearFetch<IntegrationsSettings> | undefined;
    /** The last template that was applied to this project. */
    get lastAppliedTemplate(): LinearFetch<Template> | undefined;
    /** The project lead. */
    get lead(): LinearFetch<User> | undefined;
}
/**
 * ProjectSearchResultConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectSearchResultConnection model
 * @param data - ProjectSearchResultConnection response data
 */
export declare class ProjectSearchResultConnection extends Connection<ProjectSearchResult> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectSearchResult> | undefined>, data: L.ProjectSearchResultConnectionFragment);
}
/**
 * A project status.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectStatusFragment response data
 */
export declare class ProjectStatus extends Request {
    constructor(request: LinearRequest, data: L.ProjectStatusFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The UI color of the status as a HEX string. */
    color: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Description of the status. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether or not a project can be in this status indefinitely. */
    indefinite: boolean;
    /** The name of the status. */
    name: string;
    /** The position of the status in the workspace's project flow. */
    position: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of the project status. */
    type: L.ProjectStatusType;
}
/**
 * ProjectStatusConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectStatusConnection model
 * @param data - ProjectStatusConnection response data
 */
export declare class ProjectStatusConnection extends Connection<ProjectStatus> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectStatus> | undefined>, data: L.ProjectStatusConnectionFragment);
}
/**
 * An update associated with a project.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdateFragment response data
 */
export declare class ProjectUpdate extends Request {
    private _project;
    private _user;
    constructor(request: LinearRequest, data: L.ProjectUpdateFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The update content in markdown format. */
    body: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The diff between the current update and the previous one. */
    diff?: L.Scalars["JSONObject"];
    /** The diff between the current update and the previous one, formatted as markdown. */
    diffMarkdown?: string;
    /** The time the project update was edited. */
    editedAt?: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether project update diff should be hidden. */
    isDiffHidden: boolean;
    /** Emoji reaction summary, grouped by emoji type. */
    reactionData: L.Scalars["JSONObject"];
    /** The project update's unique URL slug. */
    slugId: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The URL to the project update. */
    url: string;
    /** Reactions associated with the project update. */
    reactions: Reaction[];
    /** The health of the project at the time of the update. */
    health: L.ProjectUpdateHealthType;
    /** The project that the update is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The user who wrote the update. */
    get user(): LinearFetch<User> | undefined;
    /** Comments associated with the project update. */
    comments(variables?: Omit<L.ProjectUpdate_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
    /** Creates a new project update. */
    create(input: L.ProjectUpdateCreateInput): LinearFetch<ProjectUpdatePayload>;
    /** Deletes a project update. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a project update. */
    update(input: L.ProjectUpdateUpdateInput): LinearFetch<ProjectUpdatePayload>;
}
/**
 * ProjectUpdateConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectUpdateConnection model
 * @param data - ProjectUpdateConnection response data
 */
export declare class ProjectUpdateConnection extends Connection<ProjectUpdate> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectUpdate> | undefined>, data: L.ProjectUpdateConnectionFragment);
}
/**
 * Holds information about when a user has interacted with a project update.
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdateInteractionFragment response data
 */
export declare class ProjectUpdateInteraction extends Request {
    private _projectUpdate;
    private _user;
    constructor(request: LinearRequest, data: L.ProjectUpdateInteractionFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The time at which the user read the project update. */
    readAt: Date;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The project update that has been interacted with. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
    /** The user that has interacted with the project update. */
    get user(): LinearFetch<User> | undefined;
    /** Creates a new interaction on a project update. */
    create(input: L.ProjectUpdateInteractionCreateInput): LinearFetch<ProjectUpdateInteractionPayload>;
}
/**
 * ProjectUpdateInteractionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ProjectUpdateInteractionConnection model
 * @param data - ProjectUpdateInteractionConnection response data
 */
export declare class ProjectUpdateInteractionConnection extends Connection<ProjectUpdateInteraction> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<ProjectUpdateInteraction> | undefined>, data: L.ProjectUpdateInteractionConnectionFragment);
}
/**
 * ProjectUpdateInteractionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdateInteractionPayloadFragment response data
 */
export declare class ProjectUpdateInteractionPayload extends Request {
    private _projectUpdateInteraction;
    constructor(request: LinearRequest, data: L.ProjectUpdateInteractionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project update interaction that was created or updated. */
    get projectUpdateInteraction(): LinearFetch<ProjectUpdateInteraction> | undefined;
}
/**
 * ProjectUpdatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdatePayloadFragment response data
 */
export declare class ProjectUpdatePayload extends Request {
    private _projectUpdate;
    constructor(request: LinearRequest, data: L.ProjectUpdatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project update that was created or updated. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
}
/**
 * ProjectUpdateReminderPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdateReminderPayloadFragment response data
 */
export declare class ProjectUpdateReminderPayload extends Request {
    constructor(request: LinearRequest, data: L.ProjectUpdateReminderPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * ProjectUpdateWithInteractionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ProjectUpdateWithInteractionPayloadFragment response data
 */
export declare class ProjectUpdateWithInteractionPayload extends Request {
    private _interaction;
    private _projectUpdate;
    constructor(request: LinearRequest, data: L.ProjectUpdateWithInteractionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The project update that was created or updated. */
    get interaction(): LinearFetch<ProjectUpdateInteraction> | undefined;
    /** The project update that was created or updated. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
}
/**
 * A user's web or mobile push notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.PushSubscriptionFragment response data
 */
export declare class PushSubscription extends Request {
    constructor(request: LinearRequest, data: L.PushSubscriptionFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Creates a push subscription. */
    create(input: L.PushSubscriptionCreateInput): LinearFetch<PushSubscriptionPayload>;
    /** Deletes a push subscription. */
    delete(): LinearFetch<PushSubscriptionPayload>;
}
/**
 * PushSubscriptionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this PushSubscriptionConnection model
 * @param data - PushSubscriptionConnection response data
 */
export declare class PushSubscriptionConnection extends Connection<PushSubscription> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<PushSubscription> | undefined>, data: L.PushSubscriptionConnectionFragment);
}
/**
 * PushSubscriptionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.PushSubscriptionPayloadFragment response data
 */
export declare class PushSubscriptionPayload extends Request {
    constructor(request: LinearRequest, data: L.PushSubscriptionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The push subscription that was created or updated. */
    entity: PushSubscription;
}
/**
 * PushSubscriptionTestPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.PushSubscriptionTestPayloadFragment response data
 */
export declare class PushSubscriptionTestPayload extends Request {
    constructor(request: LinearRequest, data: L.PushSubscriptionTestPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * RateLimitPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.RateLimitPayloadFragment response data
 */
export declare class RateLimitPayload extends Request {
    constructor(request: LinearRequest, data: L.RateLimitPayloadFragment);
    /** The identifier we rate limit on. */
    identifier?: string;
    /** The kind of rate limit selected for this request. */
    kind: string;
    /** The state of the rate limit. */
    limits: RateLimitResultPayload[];
}
/**
 * RateLimitResultPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.RateLimitResultPayloadFragment response data
 */
export declare class RateLimitResultPayload extends Request {
    constructor(request: LinearRequest, data: L.RateLimitResultPayloadFragment);
    /** The total allowed quantity for this type of limit. */
    allowedAmount: number;
    /** The period in which the rate limit is fully replenished in ms. */
    period: number;
    /** The remaining quantity for this type of limit after this request. */
    remainingAmount: number;
    /** The requested quantity for this type of limit. */
    requestedAmount: number;
    /** The timestamp after the rate limit is fully replenished as a UNIX timestamp. */
    reset: number;
    /** What is being rate limited. */
    type: string;
}
/**
 * A reaction associated with a comment or a project update.
 *
 * @param request - function to call the graphql client
 * @param data - L.ReactionFragment response data
 */
export declare class Reaction extends Request {
    private _comment?;
    private _externalUser?;
    private _issue?;
    private _projectUpdate?;
    private _user?;
    constructor(request: LinearRequest, data: L.ReactionFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Name of the reaction's emoji. */
    emoji: string;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The comment that the reaction is associated with. */
    get comment(): LinearFetch<Comment> | undefined;
    /** The external user that created the reaction. */
    get externalUser(): LinearFetch<ExternalUser> | undefined;
    /** The issue that the reaction is associated with. */
    get issue(): LinearFetch<Issue> | undefined;
    /** The project update that the reaction is associated with. */
    get projectUpdate(): LinearFetch<ProjectUpdate> | undefined;
    /** The user that created the reaction. */
    get user(): LinearFetch<User> | undefined;
    /** Creates a new reaction. */
    create(input: L.ReactionCreateInput): LinearFetch<ReactionPayload>;
    /** Deletes a reaction. */
    delete(): LinearFetch<DeletePayload>;
}
/**
 * ReactionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this ReactionConnection model
 * @param data - ReactionConnection response data
 */
export declare class ReactionConnection extends Connection<Reaction> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Reaction> | undefined>, data: L.ReactionConnectionFragment);
}
/**
 * ReactionPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ReactionPayloadFragment response data
 */
export declare class ReactionPayload extends Request {
    constructor(request: LinearRequest, data: L.ReactionPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    success: boolean;
    reaction: Reaction;
}
/**
 * A reminder that can be attached to different entities.
 *
 * @param request - function to call the graphql client
 * @param data - L.ReminderFragment response data
 */
export declare class Reminder extends Request {
    private _documentId?;
    private _issueId?;
    private _projectId?;
    private _user;
    constructor(request: LinearRequest, data: L.ReminderFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The reminder's comment. */
    comment?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The time when a reminder triggers a notification in the user's inbox. */
    remindAt?: Date;
    /** Scheduling settings for recurring reminders. */
    schedule?: L.Scalars["JSONObject"];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The document that the reminder is associated with. */
    get documentId(): LinearFetch<Document> | undefined;
    /** The issue that the reminder is associated with. */
    get issueId(): LinearFetch<Issue> | undefined;
    /** The project that the reminder is associated with. */
    get projectId(): LinearFetch<Project> | undefined;
    /** The user that created a reminder. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * A roadmap for projects.
 *
 * @param request - function to call the graphql client
 * @param data - L.RoadmapFragment response data
 */
export declare class Roadmap extends Request {
    private _creator;
    private _owner?;
    constructor(request: LinearRequest, data: L.RoadmapFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The roadmap's color. */
    color?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the roadmap. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the roadmap. */
    name: string;
    /** The roadmap's unique URL slug. */
    slugId: string;
    /** The sort order of the roadmap within the organization. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The canonical url for the roadmap. */
    url: string;
    /** The user who created the roadmap. */
    get creator(): LinearFetch<User> | undefined;
    /** The organization of the roadmap. */
    get organization(): LinearFetch<Organization>;
    /** The user who owns the roadmap. */
    get owner(): LinearFetch<User> | undefined;
    /** Projects associated with the roadmap. */
    projects(variables?: Omit<L.Roadmap_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
    /** Archives a roadmap. */
    archive(): LinearFetch<RoadmapArchivePayload>;
    /** Creates a new roadmap. */
    create(input: L.RoadmapCreateInput): LinearFetch<RoadmapPayload>;
    /** Deletes a roadmap. */
    delete(): LinearFetch<DeletePayload>;
    /** Unarchives a roadmap. */
    unarchive(): LinearFetch<RoadmapArchivePayload>;
    /** Updates a roadmap. */
    update(input: L.RoadmapUpdateInput): LinearFetch<RoadmapPayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.RoadmapArchivePayloadFragment response data
 */
export declare class RoadmapArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.RoadmapArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Roadmap> | undefined;
}
/**
 * RoadmapConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this RoadmapConnection model
 * @param data - RoadmapConnection response data
 */
export declare class RoadmapConnection extends Connection<Roadmap> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Roadmap> | undefined>, data: L.RoadmapConnectionFragment);
}
/**
 * RoadmapPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.RoadmapPayloadFragment response data
 */
export declare class RoadmapPayload extends Request {
    private _roadmap;
    constructor(request: LinearRequest, data: L.RoadmapPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The roadmap that was created or updated. */
    get roadmap(): LinearFetch<Roadmap> | undefined;
}
/**
 * Join table between projects and roadmaps.
 *
 * @param request - function to call the graphql client
 * @param data - L.RoadmapToProjectFragment response data
 */
export declare class RoadmapToProject extends Request {
    private _project;
    private _roadmap;
    constructor(request: LinearRequest, data: L.RoadmapToProjectFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The sort order of the project within the roadmap. */
    sortOrder: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The project that the roadmap is associated with. */
    get project(): LinearFetch<Project> | undefined;
    /** The roadmap that the project is associated with. */
    get roadmap(): LinearFetch<Roadmap> | undefined;
    /** Creates a new roadmapToProject join. */
    create(input: L.RoadmapToProjectCreateInput): LinearFetch<RoadmapToProjectPayload>;
    /** Deletes a roadmapToProject. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a roadmapToProject. */
    update(input: L.RoadmapToProjectUpdateInput): LinearFetch<RoadmapToProjectPayload>;
}
/**
 * RoadmapToProjectConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this RoadmapToProjectConnection model
 * @param data - RoadmapToProjectConnection response data
 */
export declare class RoadmapToProjectConnection extends Connection<RoadmapToProject> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<RoadmapToProject> | undefined>, data: L.RoadmapToProjectConnectionFragment);
}
/**
 * RoadmapToProjectPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.RoadmapToProjectPayloadFragment response data
 */
export declare class RoadmapToProjectPayload extends Request {
    private _roadmapToProject;
    constructor(request: LinearRequest, data: L.RoadmapToProjectPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The roadmapToProject that was created or updated. */
    get roadmapToProject(): LinearFetch<RoadmapToProject> | undefined;
}
/**
 * Sentry specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.SentrySettingsFragment response data
 */
export declare class SentrySettings extends Request {
    constructor(request: LinearRequest, data: L.SentrySettingsFragment);
    /** The slug of the Sentry organization being connected. */
    organizationSlug: string;
}
/**
 * Shared Slack integration settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.SharedSlackSettingsFragment response data
 */
export declare class SharedSlackSettings extends Request {
    constructor(request: LinearRequest, data: L.SharedSlackSettingsFragment);
    /** Enterprise id of the connected Slack enterprise */
    enterpriseId?: string;
    /** Enterprise name of the connected Slack enterprise */
    enterpriseName?: string;
    /** Whether to show unfurl previews in Slack */
    shouldUnfurl?: boolean;
    /** Slack workspace id */
    teamId?: string;
    /** Slack workspace name */
    teamName?: string;
}
/**
 * Slack Asks specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackAsksSettingsFragment response data
 */
export declare class SlackAsksSettings extends Request {
    constructor(request: LinearRequest, data: L.SlackAsksSettingsFragment);
    /** Enterprise id of the connected Slack enterprise */
    enterpriseId?: string;
    /** Enterprise name of the connected Slack enterprise */
    enterpriseName?: string;
    /** Whether to show unfurl previews in Slack */
    shouldUnfurl?: boolean;
    /** Slack workspace id */
    teamId?: string;
    /** Slack workspace name */
    teamName?: string;
    /** The mapping of Slack channel ID => Slack channel name for connected channels. */
    slackChannelMapping?: SlackChannelNameMapping[];
    /** The user role type that is allowed to manage Asks settings. */
    canAdministrate: L.UserRoleType;
}
/**
 * Tuple for mapping Slack channel IDs to names.
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackAsksTeamSettingsFragment response data
 */
export declare class SlackAsksTeamSettings extends Request {
    constructor(request: LinearRequest, data: L.SlackAsksTeamSettingsFragment);
    /** Whether the default Asks template is enabled in the given channel for this team. */
    hasDefaultAsk: boolean;
    /** The Linear team ID. */
    id: string;
}
/**
 * SlackChannelConnectPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackChannelConnectPayloadFragment response data
 */
export declare class SlackChannelConnectPayload extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.SlackChannelConnectPayloadFragment);
    /** Whether the bot needs to be manually added to the channel. */
    addBot: boolean;
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether it's recommended to connect main Slack integration. */
    nudgeToConnectMainSlackIntegration?: boolean;
    /** Whether it's recommended to update main Slack integration. */
    nudgeToUpdateMainSlackIntegration?: boolean;
    /** Whether the operation was successful. */
    success: boolean;
    /** The integration that was created or updated. */
    get integration(): LinearFetch<Integration> | undefined;
}
/**
 * Object for mapping Slack channel IDs to names and other settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackChannelNameMappingFragment response data
 */
export declare class SlackChannelNameMapping extends Request {
    constructor(request: LinearRequest, data: L.SlackChannelNameMappingFragment);
    /** Whether or not @-mentioning the bot should automatically create an Ask with the message. */
    autoCreateOnBotMention?: boolean;
    /** Whether or not using the :ticket: emoji in this channel should automatically create Asks. */
    autoCreateOnEmoji?: boolean;
    /** Whether or not top-level messages in this channel should automatically create Asks. */
    autoCreateOnMessage?: boolean;
    /** The optional template ID to use for Asks auto-created in this channel. If not set, auto-created Asks won't use any template. */
    autoCreateTemplateId?: string;
    /** Whether or not the Linear Asks bot has been added to this Slack channel. */
    botAdded?: boolean;
    /** The Slack channel ID. */
    id: string;
    /** Whether or not the Slack channel is private. */
    isPrivate?: boolean;
    /** Whether or not the Slack channel is shared with an external org. */
    isShared?: boolean;
    /** The Slack channel name. */
    name: string;
    /** Whether or not synced Slack threads should be updated with a message when their Ask is accepted from triage. */
    postAcceptedFromTriageUpdates?: boolean;
    /** Whether or not synced Slack threads should be updated with a message and emoji when their Ask is canceled. */
    postCancellationUpdates?: boolean;
    /** Whether or not synced Slack threads should be updated with a message and emoji when their Ask is completed. */
    postCompletionUpdates?: boolean;
    /** Which teams are connected to the channel and settings for those teams. */
    teams: SlackAsksTeamSettings[];
}
/**
 * Slack notification specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackPostSettingsFragment response data
 */
export declare class SlackPostSettings extends Request {
    constructor(request: LinearRequest, data: L.SlackPostSettingsFragment);
    channel: string;
    channelId: string;
    configurationUrl: string;
    channelType?: L.SlackChannelType;
}
/**
 * Settings for the regular Slack integration.
 *
 * @param request - function to call the graphql client
 * @param data - L.SlackSettingsFragment response data
 */
export declare class SlackSettings extends Request {
    constructor(request: LinearRequest, data: L.SlackSettingsFragment);
    /** Enterprise id of the connected Slack enterprise */
    enterpriseId?: string;
    /** Enterprise name of the connected Slack enterprise */
    enterpriseName?: string;
    /** Whether Linear should automatically respond with issue unfurls when an issue identifier is mentioned in a Slack message. */
    linkOnIssueIdMention: boolean;
    /** Whether to show unfurl previews in Slack */
    shouldUnfurl?: boolean;
    /** Slack workspace id */
    teamId?: string;
    /** Slack workspace name */
    teamName?: string;
}
/**
 * SsoUrlFromEmailResponse model
 *
 * @param request - function to call the graphql client
 * @param data - L.SsoUrlFromEmailResponseFragment response data
 */
export declare class SsoUrlFromEmailResponse extends Request {
    constructor(request: LinearRequest, data: L.SsoUrlFromEmailResponseFragment);
    /** SAML SSO sign-in URL. */
    samlSsoUrl: string;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * SuccessPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.SuccessPayloadFragment response data
 */
export declare class SuccessPayload extends Request {
    constructor(request: LinearRequest, data: L.SuccessPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * SummaryPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.SummaryPayloadFragment response data
 */
export declare class SummaryPayload extends Request {
    constructor(request: LinearRequest, data: L.SummaryPayloadFragment);
    /** Summary for project updates. */
    summary: string;
}
/**
 * SynchronizedPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.SynchronizedPayloadFragment response data
 */
export declare class SynchronizedPayload extends Request {
    constructor(request: LinearRequest, data: L.SynchronizedPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
}
/**
 * An organizational unit that contains issues.
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamFragment response data
 */
export declare class Team extends Request {
    private _activeCycle?;
    private _defaultIssueState?;
    private _defaultProjectTemplate?;
    private _defaultTemplateForMembers?;
    private _defaultTemplateForNonMembers?;
    private _draftWorkflowState?;
    private _integrationsSettings?;
    private _markedAsDuplicateWorkflowState?;
    private _mergeWorkflowState?;
    private _mergeableWorkflowState?;
    private _reviewWorkflowState?;
    private _startWorkflowState?;
    private _triageIssueState?;
    private _triageResponsibility?;
    constructor(request: LinearRequest, data: L.TeamFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Period after which automatically closed and completed issues are automatically archived in months. */
    autoArchivePeriod: number;
    /** Whether child issues should automatically close when their parent issue is closed */
    autoCloseChildIssues?: boolean;
    /** Whether parent issues should automatically close when all child issues are closed */
    autoCloseParentIssues?: boolean;
    /** Period after which issues are automatically closed in months. Null/undefined means disabled. */
    autoClosePeriod?: number;
    /** The canceled workflow state which auto closed issues will be set to. Defaults to the first canceled state. */
    autoCloseStateId?: string;
    /** The team's color. */
    color?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Calendar feed URL (iCal) for cycles. */
    cycleCalenderUrl: string;
    /** The cooldown time after each cycle in weeks. */
    cycleCooldownTime: number;
    /** The duration of a cycle in weeks. */
    cycleDuration: number;
    /** Auto assign completed issues to current cycle. */
    cycleIssueAutoAssignCompleted: boolean;
    /** Auto assign started issues to current cycle. */
    cycleIssueAutoAssignStarted: boolean;
    /** Auto assign issues to current cycle if in active status. */
    cycleLockToActive: boolean;
    /** The day of the week that a new cycle starts. */
    cycleStartDay: number;
    /** Whether the team uses cycles. */
    cyclesEnabled: boolean;
    /** What to use as an default estimate for unestimated issues. */
    defaultIssueEstimate: number;
    /** The id of the default template to use for new issues created by members of the team. */
    defaultTemplateForMembersId?: string;
    /** The id of the default template to use for new issues created by non-members of the team. */
    defaultTemplateForNonMembersId?: string;
    /** The team's description. */
    description?: string;
    /** Whether to group recent issue history entries. */
    groupIssueHistory: boolean;
    /** The icon of the team. */
    icon?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** Unique hash for the team to be used in invite URLs. */
    inviteHash: string;
    /** Number of issues in the team. */
    issueCount: number;
    /** Whether to allow zeros in issues estimates. */
    issueEstimationAllowZero: boolean;
    /** Whether to add additional points to the estimate scale. */
    issueEstimationExtended: boolean;
    /** The issue estimation type to use. Must be one of "notUsed", "exponential", "fibonacci", "linear", "tShirt". */
    issueEstimationType: string;
    /** [DEPRECATED] Whether issues without priority should be sorted first. */
    issueOrderingNoPriorityFirst: boolean;
    /** [DEPRECATED] Whether to move issues to bottom of the column when changing state. */
    issueSortOrderDefaultToBottom: boolean;
    /** The team's unique key. The key is used in URLs. */
    key: string;
    /** The team's name. */
    name: string;
    /** Whether the team is private or not. */
    private: boolean;
    /** Whether an issue needs to have a priority set before leaving triage. */
    requirePriorityToLeaveTriage: boolean;
    /** The SCIM group name for the team. */
    scimGroupName?: string;
    /** Whether the team is managed by SCIM integration. */
    scimManaged: boolean;
    /** Where to move issues when changing state. */
    setIssueSortOrderOnStateChange: string;
    /** Whether to send new issue comment notifications to Slack. */
    slackIssueComments: boolean;
    /** Whether to send new issue status updates to Slack. */
    slackIssueStatuses: boolean;
    /** Whether to send new issue notifications to Slack. */
    slackNewIssue: boolean;
    /** The timezone of the team. Defaults to "America/Los_Angeles" */
    timezone: string;
    /** Whether triage mode is enabled for the team or not. */
    triageEnabled: boolean;
    /** How many upcoming cycles to create. */
    upcomingCycleCount: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Team's currently active cycle. */
    get activeCycle(): LinearFetch<Cycle> | undefined;
    /** The default workflow state into which issues are set when they are opened by team members. */
    get defaultIssueState(): LinearFetch<WorkflowState> | undefined;
    /** The default template to use for new projects created for the team. */
    get defaultProjectTemplate(): LinearFetch<Template> | undefined;
    /** The default template to use for new issues created by members of the team. */
    get defaultTemplateForMembers(): LinearFetch<Template> | undefined;
    /** The default template to use for new issues created by non-members of the team. */
    get defaultTemplateForNonMembers(): LinearFetch<Template> | undefined;
    /** The workflow state into which issues are moved when a PR has been opened as draft. */
    get draftWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** Settings for all integrations associated with that team. */
    get integrationsSettings(): LinearFetch<IntegrationsSettings> | undefined;
    /** The workflow state into which issues are moved when they are marked as a duplicate of another issue. Defaults to the first canceled state. */
    get markedAsDuplicateWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** The workflow state into which issues are moved when a PR has been merged. */
    get mergeWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** The workflow state into which issues are moved when a PR is ready to be merged. */
    get mergeableWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** The organization that the team is associated with. */
    get organization(): LinearFetch<Organization>;
    /** The workflow state into which issues are moved when a review has been requested for the PR. */
    get reviewWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** The workflow state into which issues are moved when a PR has been opened. */
    get startWorkflowState(): LinearFetch<WorkflowState> | undefined;
    /** The workflow state into which issues are set when they are opened by non-team members or integrations if triage is enabled. */
    get triageIssueState(): LinearFetch<WorkflowState> | undefined;
    /** Team's triage responsibility. */
    get triageResponsibility(): LinearFetch<TriageResponsibility> | undefined;
    /** Cycles associated with the team. */
    cycles(variables?: Omit<L.Team_CyclesQueryVariables, "id">): LinearFetch<CycleConnection>;
    /** The Git automation states for the team. */
    gitAutomationStates(variables?: Omit<L.Team_GitAutomationStatesQueryVariables, "id">): LinearFetch<GitAutomationStateConnection>;
    /** Issues associated with the team. */
    issues(variables?: Omit<L.Team_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Labels associated with the team. */
    labels(variables?: Omit<L.Team_LabelsQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
    /** Users who are members of this team. */
    members(variables?: Omit<L.Team_MembersQueryVariables, "id">): LinearFetch<UserConnection>;
    /** Memberships associated with the team. For easier access of the same data, use `members` query. */
    memberships(variables?: Omit<L.Team_MembershipsQueryVariables, "id">): LinearFetch<TeamMembershipConnection>;
    /** Projects associated with the team. */
    projects(variables?: Omit<L.Team_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
    /** The states that define the workflow associated with the team. */
    states(variables?: Omit<L.Team_StatesQueryVariables, "id">): LinearFetch<WorkflowStateConnection>;
    /** Templates associated with the team. */
    templates(variables?: Omit<L.Team_TemplatesQueryVariables, "id">): LinearFetch<TemplateConnection>;
    /** Webhooks associated with the team. */
    webhooks(variables?: Omit<L.Team_WebhooksQueryVariables, "id">): LinearFetch<WebhookConnection>;
    /** Creates a new team. The user who creates the team will automatically be added as a member to the newly created team. */
    create(input: L.TeamCreateInput, variables?: Omit<L.CreateTeamMutationVariables, "input">): LinearFetch<TeamPayload>;
    /** Deletes a team. */
    delete(): LinearFetch<DeletePayload>;
    /** Unarchives a team and cancels deletion. */
    unarchive(): LinearFetch<TeamArchivePayload>;
    /** Updates a team. */
    update(input: L.TeamUpdateInput): LinearFetch<TeamPayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamArchivePayloadFragment response data
 */
export declare class TeamArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.TeamArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<Team> | undefined;
}
/**
 * TeamConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this TeamConnection model
 * @param data - TeamConnection response data
 */
export declare class TeamConnection extends Connection<Team> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Team> | undefined>, data: L.TeamConnectionFragment);
}
/**
 * Defines the membership of a user to a team.
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamMembershipFragment response data
 */
export declare class TeamMembership extends Request {
    private _team;
    private _user;
    constructor(request: LinearRequest, data: L.TeamMembershipFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** Whether the user is the owner of the team. */
    owner: boolean;
    /** The order of the item in the users team list. */
    sortOrder: number;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The team that the membership is associated with. */
    get team(): LinearFetch<Team> | undefined;
    /** The user that the membership is associated with. */
    get user(): LinearFetch<User> | undefined;
    /** Creates a new team membership. */
    create(input: L.TeamMembershipCreateInput): LinearFetch<TeamMembershipPayload>;
    /** Deletes a team membership. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a team membership. */
    update(input: L.TeamMembershipUpdateInput): LinearFetch<TeamMembershipPayload>;
}
/**
 * TeamMembershipConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this TeamMembershipConnection model
 * @param data - TeamMembershipConnection response data
 */
export declare class TeamMembershipConnection extends Connection<TeamMembership> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<TeamMembership> | undefined>, data: L.TeamMembershipConnectionFragment);
}
/**
 * TeamMembershipPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamMembershipPayloadFragment response data
 */
export declare class TeamMembershipPayload extends Request {
    private _teamMembership?;
    constructor(request: LinearRequest, data: L.TeamMembershipPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The team membership that was created or updated. */
    get teamMembership(): LinearFetch<TeamMembership> | undefined;
}
/**
 * A team notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamNotificationSubscriptionFragment response data
 */
export declare class TeamNotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative?;
    private _label?;
    private _project?;
    private _subscriber;
    private _team;
    private _user?;
    constructor(request: LinearRequest, data: L.TeamNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team subscribed to. */
    get team(): LinearFetch<Team> | undefined;
    /** The user view associated with the notification subscription. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * TeamPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.TeamPayloadFragment response data
 */
export declare class TeamPayload extends Request {
    private _team?;
    constructor(request: LinearRequest, data: L.TeamPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The team that was created or updated. */
    get team(): LinearFetch<Team> | undefined;
}
/**
 * A template object used for creating entities faster.
 *
 * @param request - function to call the graphql client
 * @param data - L.TemplateFragment response data
 */
export declare class Template extends Request {
    private _creator?;
    private _lastUpdatedBy?;
    private _team?;
    constructor(request: LinearRequest, data: L.TemplateFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Template description. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the template. */
    name: string;
    /** The sort order of the template. */
    sortOrder: number;
    /** Template data. */
    templateData: Record<string, unknown>;
    /** The entity type this template is for. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user who created the template. */
    get creator(): LinearFetch<User> | undefined;
    /** The user who last updated the template. */
    get lastUpdatedBy(): LinearFetch<User> | undefined;
    /** The organization that the template is associated with. If null, the template is associated with a particular team. */
    get organization(): LinearFetch<Organization>;
    /** The team that the template is associated with. If null, the template is global to the workspace. */
    get team(): LinearFetch<Team> | undefined;
    /** Creates a new template. */
    create(input: L.TemplateCreateInput): LinearFetch<TemplatePayload>;
    /** Deletes a template. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing template. */
    update(input: L.TemplateUpdateInput): LinearFetch<TemplatePayload>;
}
/**
 * TemplateConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this TemplateConnection model
 * @param data - TemplateConnection response data
 */
export declare class TemplateConnection extends Connection<Template> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Template> | undefined>, data: L.TemplateConnectionFragment);
}
/**
 * TemplatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.TemplatePayloadFragment response data
 */
export declare class TemplatePayload extends Request {
    private _template;
    constructor(request: LinearRequest, data: L.TemplatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The template that was created or updated. */
    get template(): LinearFetch<Template> | undefined;
}
/**
 * A time schedule.
 *
 * @param request - function to call the graphql client
 * @param data - L.TimeScheduleFragment response data
 */
export declare class TimeSchedule extends Request {
    private _integration?;
    constructor(request: LinearRequest, data: L.TimeScheduleFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The identifier of the external schedule. */
    externalId?: string;
    /** The URL to the external schedule. */
    externalUrl?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the schedule. */
    name: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The schedule entries. */
    entries?: TimeScheduleEntry[];
    /** The identifier of the Linear integration populating the schedule. */
    get integration(): LinearFetch<Integration> | undefined;
    /** The organization of the schedule. */
    get organization(): LinearFetch<Organization>;
    /** Creates a new time schedule. */
    create(input: L.TimeScheduleCreateInput): LinearFetch<TimeSchedulePayload>;
    /** Deletes a time schedule. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates a time schedule. */
    update(input: L.TimeScheduleUpdateInput): LinearFetch<TimeSchedulePayload>;
}
/**
 * TimeScheduleConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this TimeScheduleConnection model
 * @param data - TimeScheduleConnection response data
 */
export declare class TimeScheduleConnection extends Connection<TimeSchedule> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<TimeSchedule> | undefined>, data: L.TimeScheduleConnectionFragment);
}
/**
 * TimeScheduleEntry model
 *
 * @param request - function to call the graphql client
 * @param data - L.TimeScheduleEntryFragment response data
 */
export declare class TimeScheduleEntry extends Request {
    constructor(request: LinearRequest, data: L.TimeScheduleEntryFragment);
    /** The end date of the schedule in ISO 8601 date-time format. */
    endsAt: Date;
    /** The start date of the schedule in ISO 8601 date-time format. */
    startsAt: Date;
    /** The email, name or reference to the user on schedule. This is used in case the external user could not be mapped to a Linear user id. */
    userEmail?: string;
    /** The Linear user id of the user on schedule. If the user cannot be mapped to a Linear user then `userEmail` can be used as a reference. */
    userId?: string;
}
/**
 * TimeSchedulePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.TimeSchedulePayloadFragment response data
 */
export declare class TimeSchedulePayload extends Request {
    private _timeSchedule;
    constructor(request: LinearRequest, data: L.TimeSchedulePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    get timeSchedule(): LinearFetch<TimeSchedule> | undefined;
}
/**
 * A team's triage responsibility.
 *
 * @param request - function to call the graphql client
 * @param data - L.TriageResponsibilityFragment response data
 */
export declare class TriageResponsibility extends Request {
    private _currentUser?;
    private _team;
    private _timeSchedule?;
    constructor(request: LinearRequest, data: L.TriageResponsibilityFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Set of users used for triage responsibility. */
    manualSelection?: TriageResponsibilityManualSelection;
    /** The action to take when an issue is added to triage. */
    action: L.TriageResponsibilityAction;
    /** The user currently responsible for triage. */
    get currentUser(): LinearFetch<User> | undefined;
    /** The team to which the triage responsibility belongs to. */
    get team(): LinearFetch<Team> | undefined;
    /** The time schedule used for scheduling. */
    get timeSchedule(): LinearFetch<TimeSchedule> | undefined;
    /** Creates a new triage responsibility. */
    create(input: L.TriageResponsibilityCreateInput): LinearFetch<TriageResponsibilityPayload>;
    /** Deletes a triage responsibility. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing triage responsibility. */
    update(input: L.TriageResponsibilityUpdateInput): LinearFetch<TriageResponsibilityPayload>;
}
/**
 * TriageResponsibilityConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this TriageResponsibilityConnection model
 * @param data - TriageResponsibilityConnection response data
 */
export declare class TriageResponsibilityConnection extends Connection<TriageResponsibility> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<TriageResponsibility> | undefined>, data: L.TriageResponsibilityConnectionFragment);
}
/**
 * TriageResponsibilityManualSelection model
 *
 * @param request - function to call the graphql client
 * @param data - L.TriageResponsibilityManualSelectionFragment response data
 */
export declare class TriageResponsibilityManualSelection extends Request {
    constructor(request: LinearRequest, data: L.TriageResponsibilityManualSelectionFragment);
    /** The set of users responsible for triage. */
    userIds: string[];
}
/**
 * TriageResponsibilityPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.TriageResponsibilityPayloadFragment response data
 */
export declare class TriageResponsibilityPayload extends Request {
    private _triageResponsibility;
    constructor(request: LinearRequest, data: L.TriageResponsibilityPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    get triageResponsibility(): LinearFetch<TriageResponsibility> | undefined;
}
/**
 * Object representing Google Cloud upload policy, plus additional data.
 *
 * @param request - function to call the graphql client
 * @param data - L.UploadFileFragment response data
 */
export declare class UploadFile extends Request {
    constructor(request: LinearRequest, data: L.UploadFileFragment);
    /** The asset URL for the uploaded file. (assigned automatically). */
    assetUrl: string;
    /** The content type. */
    contentType: string;
    /** The filename. */
    filename: string;
    metaData?: L.Scalars["JSONObject"];
    /** The size of the uploaded file. */
    size: number;
    /** The signed URL the for the uploaded file. (assigned automatically). */
    uploadUrl: string;
    headers: UploadFileHeader[];
}
/**
 * UploadFileHeader model
 *
 * @param request - function to call the graphql client
 * @param data - L.UploadFileHeaderFragment response data
 */
export declare class UploadFileHeader extends Request {
    constructor(request: LinearRequest, data: L.UploadFileHeaderFragment);
    /** Upload file header key. */
    key: string;
    /** Upload file header value. */
    value: string;
}
/**
 * UploadPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UploadPayloadFragment response data
 */
export declare class UploadPayload extends Request {
    constructor(request: LinearRequest, data: L.UploadPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** Object describing the file to be uploaded. */
    uploadFile?: UploadFile;
}
/**
 * A user that has access to the the resources of an organization.
 *
 * @param request - function to call the graphql client
 * @param data - L.UserFragment response data
 */
export declare class User extends Request {
    constructor(request: LinearRequest, data: L.UserFragment);
    /** Whether the user account is active or disabled (suspended). */
    active: boolean;
    /** Whether the user is an organization administrator. */
    admin: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The background color of the avatar for users without set avatar. */
    avatarBackgroundColor: string;
    /** An URL to the user's avatar image. */
    avatarUrl?: string;
    /** [DEPRECATED] Hash for the user to be used in calendar URLs. */
    calendarHash?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Number of issues created. */
    createdIssueCount: number;
    /** A short description of the user, either its title or bio. */
    description?: string;
    /** Reason why is the account disabled. */
    disableReason?: string;
    /** The user's display (nick) name. Unique within each organization. */
    displayName: string;
    /** The user's email address. */
    email: string;
    /** Whether the user is a guest in the workspace and limited to accessing a subset of teams. */
    guest: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** The initials of the user. */
    initials: string;
    /** Unique hash for the user to be used in invite URLs. */
    inviteHash: string;
    /** Whether the user is the currently authenticated user. */
    isMe: boolean;
    /** The last time the user was seen online. If null, the user is currently online. */
    lastSeen?: Date;
    /** The user's full name. */
    name: string;
    /** The emoji to represent the user current status. */
    statusEmoji?: string;
    /** The label of the user current status. */
    statusLabel?: string;
    /** A date at which the user current status should be cleared. */
    statusUntilAt?: Date;
    /** The local timezone of the user. */
    timezone?: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** User's profile URL. */
    url: string;
    /** Organization the user belongs to. */
    get organization(): LinearFetch<Organization>;
    /** Issues assigned to the user. */
    assignedIssues(variables?: Omit<L.User_AssignedIssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Issues created by the user. */
    createdIssues(variables?: Omit<L.User_CreatedIssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Memberships associated with the user. For easier access of the same data, use `teams` query. */
    teamMemberships(variables?: Omit<L.User_TeamMembershipsQueryVariables, "id">): LinearFetch<TeamMembershipConnection>;
    /** Teams the user is part of. */
    teams(variables?: Omit<L.User_TeamsQueryVariables, "id">): LinearFetch<TeamConnection>;
    /** Suspends a user. Can only be called by an admin. */
    suspend(): LinearFetch<UserAdminPayload>;
    /** Un-suspends a user. Can only be called by an admin. */
    unsuspend(): LinearFetch<UserAdminPayload>;
    /** Updates a user. Only available to organization admins and the user themselves. */
    update(input: L.UserUpdateInput): LinearFetch<UserPayload>;
}
/**
 * A user account.
 *
 * @param request - function to call the graphql client
 * @param data - L.UserAccountFragment response data
 */
export declare class UserAccount extends Request {
    constructor(request: LinearRequest, data: L.UserAccountFragment);
    /** The time at which the model was archived. */
    archivedAt?: Date;
    /** Whether not to send email auth links in the email auth emails. */
    authTokenLinkDisabled: boolean;
    /** The time at which the model was created. */
    createdAt: Date;
    /** The user's email address. */
    email: string;
    /** The models identifier. */
    id: string;
    /** The user's name. */
    name?: string;
    /** The authentication service used to create the account. */
    service: string;
    /** The time at which the model was updated. */
    updatedAt: Date;
}
/**
 * UserAdminPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UserAdminPayloadFragment response data
 */
export declare class UserAdminPayload extends Request {
    constructor(request: LinearRequest, data: L.UserAdminPayloadFragment);
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * Public information of the OAuth application, plus whether the application has been authorized for the given scopes.
 *
 * @param request - function to call the graphql client
 * @param data - L.UserAuthorizedApplicationFragment response data
 */
export declare class UserAuthorizedApplication extends Request {
    constructor(request: LinearRequest, data: L.UserAuthorizedApplicationFragment);
    /** Error associated with the application needing to be requested for approval in the workspace. */
    approvalErrorCode?: string;
    /** OAuth application's client ID. */
    clientId: string;
    /** Whether the application was created by Linear. */
    createdByLinear: boolean;
    /** Information about the application. */
    description?: string;
    /** Name of the developer. */
    developer: string;
    /** Url of the developer (homepage or docs). */
    developerUrl: string;
    /** OAuth application's ID. */
    id: string;
    /** Image of the application. */
    imageUrl?: string;
    /** Whether the user has authorized the application for the given scopes. */
    isAuthorized: boolean;
    /** Application name. */
    name: string;
    /** Whether or not webhooks are enabled for the application. */
    webhooksEnabled: boolean;
}
/**
 * UserConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this UserConnection model
 * @param data - UserConnection response data
 */
export declare class UserConnection extends Connection<User> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<User> | undefined>, data: L.UserConnectionFragment);
}
/**
 * A user notification subscription.
 *
 * @param request - function to call the graphql client
 * @param data - L.UserNotificationSubscriptionFragment response data
 */
export declare class UserNotificationSubscription extends Request {
    private _customView?;
    private _cycle?;
    private _initiative?;
    private _label?;
    private _project?;
    private _subscriber;
    private _team?;
    private _user;
    constructor(request: LinearRequest, data: L.UserNotificationSubscriptionFragment);
    /** Whether the subscription is active or not. */
    active: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The type of subscription. */
    notificationSubscriptionTypes: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which the notification subscription context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of user view to which the notification subscription context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The contextual custom view associated with the notification subscription. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the notification subscription. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual initiative view associated with the notification subscription. */
    get initiative(): LinearFetch<Initiative> | undefined;
    /** The contextual label view associated with the notification subscription. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the notification subscription. */
    get project(): LinearFetch<Project> | undefined;
    /** The user that subscribed to receive notifications. */
    get subscriber(): LinearFetch<User> | undefined;
    /** The team associated with the notification subscription. */
    get team(): LinearFetch<Team> | undefined;
    /** The user subscribed to. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * UserPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UserPayloadFragment response data
 */
export declare class UserPayload extends Request {
    private _user?;
    constructor(request: LinearRequest, data: L.UserPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The user that was created or updated. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * The settings of a user as a JSON object.
 *
 * @param request - function to call the graphql client
 * @param data - L.UserSettingsFragment response data
 */
export declare class UserSettings extends Request {
    private _user;
    constructor(request: LinearRequest, data: L.UserSettingsFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** Hash for the user to be used in calendar URLs. */
    calendarHash?: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The notification channel settings the user has selected. */
    notificationPreferences: L.Scalars["JSONObject"];
    /** Whether to show full user names instead of display names. */
    showFullUserNames: boolean;
    /** Whether this user is subscribed to changelog email or not. */
    subscribedToChangelog: boolean;
    /** Whether this user is subscribed to DPA emails or not. */
    subscribedToDPA: boolean;
    /** Whether this user is subscribed to invite accepted emails or not. */
    subscribedToInviteAccepted: boolean;
    /** Whether this user is subscribed to privacy and legal update emails or not. */
    subscribedToPrivacyLegalUpdates: boolean;
    /** Whether this user is subscribed to unread notifications reminder emails or not. */
    subscribedToUnreadNotificationsReminder: boolean;
    /** The email types the user has unsubscribed from. */
    unsubscribedFrom: string[];
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The notification delivery preferences for the user. */
    notificationDeliveryPreferences: NotificationDeliveryPreferences;
    /** The user associated with these settings. */
    get user(): LinearFetch<User> | undefined;
    /** Updates the user's settings. */
    update(input: L.UserSettingsUpdateInput): LinearFetch<UserSettingsPayload>;
}
/**
 * UserSettingsFlagPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UserSettingsFlagPayloadFragment response data
 */
export declare class UserSettingsFlagPayload extends Request {
    constructor(request: LinearRequest, data: L.UserSettingsFlagPayloadFragment);
    /** The flag key which was updated. */
    flag?: string;
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The flag value after update. */
    value?: number;
}
/**
 * UserSettingsFlagsResetPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UserSettingsFlagsResetPayloadFragment response data
 */
export declare class UserSettingsFlagsResetPayload extends Request {
    constructor(request: LinearRequest, data: L.UserSettingsFlagsResetPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
}
/**
 * UserSettingsPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.UserSettingsPayloadFragment response data
 */
export declare class UserSettingsPayload extends Request {
    constructor(request: LinearRequest, data: L.UserSettingsPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The user's settings. */
    get userSettings(): LinearFetch<UserSettings>;
}
/**
 * View preferences.
 *
 * @param request - function to call the graphql client
 * @param data - L.ViewPreferencesFragment response data
 */
export declare class ViewPreferences extends Request {
    constructor(request: LinearRequest, data: L.ViewPreferencesFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique identifier of the entity. */
    id: string;
    /** The view preference type. */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The view type. */
    viewType: string;
    /** The view preferences */
    preferences: ViewPreferencesValues;
    /** Creates a new ViewPreferences object. */
    create(input: L.ViewPreferencesCreateInput): LinearFetch<ViewPreferencesPayload>;
    /** Deletes a ViewPreferences. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing ViewPreferences object. */
    update(input: L.ViewPreferencesUpdateInput): LinearFetch<ViewPreferencesPayload>;
}
/**
 * ViewPreferencesPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.ViewPreferencesPayloadFragment response data
 */
export declare class ViewPreferencesPayload extends Request {
    constructor(request: LinearRequest, data: L.ViewPreferencesPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The view preferences entity being mutated. */
    viewPreferences: ViewPreferences;
}
/**
 * ViewPreferencesValues model
 *
 * @param request - function to call the graphql client
 * @param data - L.ViewPreferencesValuesFragment response data
 */
export declare class ViewPreferencesValues extends Request {
    constructor(request: LinearRequest, data: L.ViewPreferencesValuesFragment);
    /** The issue grouping. */
    issueGrouping?: string;
    /** Whether to show completed issues. */
    showCompletedIssues?: string;
    /** The issue ordering. */
    viewOrdering?: string;
}
/**
 * A webhook used to send HTTP notifications over data updates.
 *
 * @param request - function to call the graphql client
 * @param data - L.WebhookFragment response data
 */
export declare class Webhook extends Request {
    private _creator?;
    private _team?;
    constructor(request: LinearRequest, data: L.WebhookFragment);
    /** Whether the Webhook is enabled for all public teams, including teams created after the webhook was created. */
    allPublicTeams: boolean;
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Whether the Webhook is enabled. */
    enabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** Webhook label. */
    label?: string;
    /** The resource types this webhook is subscribed to. */
    resourceTypes: string[];
    /** Secret token for verifying the origin on the recipient side. */
    secret?: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** Webhook URL. */
    url?: string;
    /** The user who created the webhook. */
    get creator(): LinearFetch<User> | undefined;
    /** The team that the webhook is associated with. If null, the webhook is associated with all public teams of the organization. */
    get team(): LinearFetch<Team> | undefined;
    /** Creates a new webhook. */
    create(input: L.WebhookCreateInput): LinearFetch<WebhookPayload>;
    /** Deletes a Webhook. */
    delete(): LinearFetch<DeletePayload>;
    /** Updates an existing Webhook. */
    update(input: L.WebhookUpdateInput): LinearFetch<WebhookPayload>;
}
/**
 * WebhookConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this WebhookConnection model
 * @param data - WebhookConnection response data
 */
export declare class WebhookConnection extends Connection<Webhook> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<Webhook> | undefined>, data: L.WebhookConnectionFragment);
}
/**
 * Entity representing a webhook execution failure.
 *
 * @param request - function to call the graphql client
 * @param data - L.WebhookFailureEventFragment response data
 */
export declare class WebhookFailureEvent extends Request {
    private _webhook;
    constructor(request: LinearRequest, data: L.WebhookFailureEventFragment);
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The unique execution ID of the webhook push. This is retained between retries of the same push. */
    executionId: string;
    /** The HTTP status code returned by the recipient. */
    httpStatus?: number;
    /** The unique identifier of the entity. */
    id: string;
    /** The HTTP response body returned by the recipient or error occured. */
    responseOrError?: string;
    /** The URL that the webhook was trying to push to. */
    url: string;
    /** The webhook that this failure event is associated with. */
    get webhook(): LinearFetch<Webhook> | undefined;
}
/**
 * WebhookPayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.WebhookPayloadFragment response data
 */
export declare class WebhookPayload extends Request {
    private _webhook;
    constructor(request: LinearRequest, data: L.WebhookPayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The webhook entity being mutated. */
    get webhook(): LinearFetch<Webhook> | undefined;
}
/**
 * WorkflowCronJobDefinition model
 *
 * @param request - function to call the graphql client
 * @param data - L.WorkflowCronJobDefinitionFragment response data
 */
export declare class WorkflowCronJobDefinition extends Request {
    private _creator;
    private _team;
    constructor(request: LinearRequest, data: L.WorkflowCronJobDefinitionFragment);
    /** An array of activities that will be executed as part of the workflow cron job. */
    activities: L.Scalars["JSONObject"];
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the workflow cron job. */
    description?: string;
    enabled: boolean;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the workflow cron job. */
    name: string;
    /** Cron schedule which is used to execute the workflow cron job. */
    schedule: L.Scalars["JSONObject"];
    /** The sort order of the workflow cron job definition within its siblings. */
    sortOrder: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The user who created the workflow cron job. */
    get creator(): LinearFetch<User> | undefined;
    /** The team associated with the workflow cron job. */
    get team(): LinearFetch<Team> | undefined;
}
/**
 * WorkflowCronJobDefinitionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this WorkflowCronJobDefinitionConnection model
 * @param data - WorkflowCronJobDefinitionConnection response data
 */
export declare class WorkflowCronJobDefinitionConnection extends Connection<WorkflowCronJobDefinition> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<WorkflowCronJobDefinition> | undefined>, data: L.WorkflowCronJobDefinitionConnectionFragment);
}
/**
 * WorkflowDefinition model
 *
 * @param request - function to call the graphql client
 * @param data - L.WorkflowDefinitionFragment response data
 */
export declare class WorkflowDefinition extends Request {
    private _creator;
    private _customView?;
    private _cycle?;
    private _label?;
    private _project?;
    private _team?;
    private _user?;
    constructor(request: LinearRequest, data: L.WorkflowDefinitionFragment);
    /** An array of activities that will be executed as part of the workflow. */
    activities: L.Scalars["JSONObject"];
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The conditions that need to be match for the workflow to be triggered. */
    conditions?: L.Scalars["JSONObject"];
    /** The time at which the entity was created. */
    createdAt: Date;
    /** The description of the workflow. */
    description?: string;
    enabled: boolean;
    /** The name of the group that the workflow belongs to. */
    groupName?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The name of the workflow. */
    name: string;
    /** The sort order of the workflow definition within its siblings. */
    sortOrder: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The type of view to which this workflow's context is associated with. */
    contextViewType?: L.ContextViewType;
    /** The type of the event that triggers off the workflow. */
    trigger: L.WorkflowTrigger;
    /** The object type (e.g. Issue) that triggers this workflow. */
    triggerType: L.WorkflowTriggerType;
    /** The type of the workflow. */
    type: L.WorkflowType;
    /** The type of user view to which this workflow's context is associated with. */
    userContextViewType?: L.UserContextViewType;
    /** The user who created the workflow. */
    get creator(): LinearFetch<User> | undefined;
    /** The context custom view associated with the workflow. */
    get customView(): LinearFetch<CustomView> | undefined;
    /** The contextual cycle view associated with the workflow. */
    get cycle(): LinearFetch<Cycle> | undefined;
    /** The contextual label view associated with the workflow. */
    get label(): LinearFetch<IssueLabel> | undefined;
    /** The contextual project view associated with the workflow. */
    get project(): LinearFetch<Project> | undefined;
    /** The team associated with the workflow. If not set, the workflow is associated with the entire organization. */
    get team(): LinearFetch<Team> | undefined;
    /** The contextual user view associated with the workflow. */
    get user(): LinearFetch<User> | undefined;
}
/**
 * WorkflowDefinitionConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this WorkflowDefinitionConnection model
 * @param data - WorkflowDefinitionConnection response data
 */
export declare class WorkflowDefinitionConnection extends Connection<WorkflowDefinition> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<WorkflowDefinition> | undefined>, data: L.WorkflowDefinitionConnectionFragment);
}
/**
 * A state in a team workflow.
 *
 * @param request - function to call the graphql client
 * @param data - L.WorkflowStateFragment response data
 */
export declare class WorkflowState extends Request {
    private _team;
    constructor(request: LinearRequest, data: L.WorkflowStateFragment);
    /** The time at which the entity was archived. Null if the entity has not been archived. */
    archivedAt?: Date;
    /** The state's UI color as a HEX string. */
    color: string;
    /** The time at which the entity was created. */
    createdAt: Date;
    /** Description of the state. */
    description?: string;
    /** The unique identifier of the entity. */
    id: string;
    /** The state's name. */
    name: string;
    /** The position of the state in the team flow. */
    position: number;
    /** The type of the state. One of "triage", "backlog", "unstarted", "started", "completed", "canceled". */
    type: string;
    /**
     * The last time at which the entity was meaningfully updated. This is the same as the creation time if the entity hasn't
     *     been updated after creation.
     */
    updatedAt: Date;
    /** The team to which this state belongs to. */
    get team(): LinearFetch<Team> | undefined;
    /** Issues belonging in this state. */
    issues(variables?: Omit<L.WorkflowState_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
    /** Archives a state. Only states with issues that have all been archived can be archived. */
    archive(): LinearFetch<WorkflowStateArchivePayload>;
    /** Creates a new state, adding it to the workflow of a team. */
    create(input: L.WorkflowStateCreateInput): LinearFetch<WorkflowStatePayload>;
    /** Updates a state. */
    update(input: L.WorkflowStateUpdateInput): LinearFetch<WorkflowStatePayload>;
}
/**
 * A generic payload return from entity archive mutations.
 *
 * @param request - function to call the graphql client
 * @param data - L.WorkflowStateArchivePayloadFragment response data
 */
export declare class WorkflowStateArchivePayload extends Request {
    private _entity?;
    constructor(request: LinearRequest, data: L.WorkflowStateArchivePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The archived/unarchived entity. Null if entity was deleted. */
    get entity(): LinearFetch<WorkflowState> | undefined;
}
/**
 * WorkflowStateConnection model
 *
 * @param request - function to call the graphql client
 * @param fetch - function to trigger a refetch of this WorkflowStateConnection model
 * @param data - WorkflowStateConnection response data
 */
export declare class WorkflowStateConnection extends Connection<WorkflowState> {
    constructor(request: LinearRequest, fetch: (connection?: LinearConnectionVariables) => LinearFetch<LinearConnection<WorkflowState> | undefined>, data: L.WorkflowStateConnectionFragment);
}
/**
 * WorkflowStatePayload model
 *
 * @param request - function to call the graphql client
 * @param data - L.WorkflowStatePayloadFragment response data
 */
export declare class WorkflowStatePayload extends Request {
    private _workflowState;
    constructor(request: LinearRequest, data: L.WorkflowStatePayloadFragment);
    /** The identifier of the last sync operation. */
    lastSyncId: number;
    /** Whether the operation was successful. */
    success: boolean;
    /** The state that was created or updated. */
    get workflowState(): LinearFetch<WorkflowState> | undefined;
}
/**
 * Zendesk specific settings.
 *
 * @param request - function to call the graphql client
 * @param data - L.ZendeskSettingsFragment response data
 */
export declare class ZendeskSettings extends Request {
    constructor(request: LinearRequest, data: L.ZendeskSettingsFragment);
    /** Whether a ticket should be automatically reopened when its linked Linear issue is cancelled. */
    automateTicketReopeningOnCancellation?: boolean;
    /** Whether a ticket should be automatically reopened when a comment is posted on its linked Linear issue */
    automateTicketReopeningOnComment?: boolean;
    /** Whether a ticket should be automatically reopened when its linked Linear issue is completed. */
    automateTicketReopeningOnCompletion?: boolean;
    /** The ID of the Linear bot user. */
    botUserId?: string;
    /** Whether an internal message should be added when someone comments on an issue. */
    sendNoteOnComment?: boolean;
    /** Whether an internal message should be added when a Linear issue changes status (for status types except completed or canceled). */
    sendNoteOnStatusChange?: boolean;
    /** The subdomain of the Zendesk organization being connected. */
    subdomain: string;
    /** The URL of the connected Zendesk organization. */
    url: string;
}
/**
 * A fetchable AdministrableTeams Query
 *
 * @param request - function to call the graphql client
 */
export declare class AdministrableTeamsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AdministrableTeams query and return a TeamConnection
     *
     * @param variables - variables to pass into the AdministrableTeamsQuery
     * @returns parsed response from AdministrableTeamsQuery
     */
    fetch(variables?: L.AdministrableTeamsQueryVariables): LinearFetch<TeamConnection>;
}
/**
 * A fetchable ApiKeys Query
 *
 * @param request - function to call the graphql client
 */
export declare class ApiKeysQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ApiKeys query and return a ApiKeyConnection
     *
     * @param variables - variables to pass into the ApiKeysQuery
     * @returns parsed response from ApiKeysQuery
     */
    fetch(variables?: L.ApiKeysQueryVariables): LinearFetch<ApiKeyConnection>;
}
/**
 * A fetchable ApplicationInfo Query
 *
 * @param request - function to call the graphql client
 */
export declare class ApplicationInfoQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ApplicationInfo query and return a Application
     *
     * @param clientId - required clientId to pass to applicationInfo
     * @returns parsed response from ApplicationInfoQuery
     */
    fetch(clientId: string): LinearFetch<Application>;
}
/**
 * A fetchable ApplicationWithAuthorization Query
 *
 * @param request - function to call the graphql client
 */
export declare class ApplicationWithAuthorizationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ApplicationWithAuthorization query and return a UserAuthorizedApplication
     *
     * @param clientId - required clientId to pass to applicationWithAuthorization
     * @param scope - required scope to pass to applicationWithAuthorization
     * @param variables - variables without 'clientId', 'scope' to pass into the ApplicationWithAuthorizationQuery
     * @returns parsed response from ApplicationWithAuthorizationQuery
     */
    fetch(clientId: string, scope: string[], variables?: Omit<L.ApplicationWithAuthorizationQueryVariables, "clientId" | "scope">): LinearFetch<UserAuthorizedApplication>;
}
/**
 * A fetchable ArchivedModelSync Query
 *
 * @param request - function to call the graphql client
 */
export declare class ArchivedModelSyncQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchivedModelSync query and return a ArchiveResponse
     *
     * @param identifier - required identifier to pass to archivedModelSync
     * @param modelClass - required modelClass to pass to archivedModelSync
     * @returns parsed response from ArchivedModelSyncQuery
     */
    fetch(identifier: string, modelClass: string): LinearFetch<ArchiveResponse>;
}
/**
 * A fetchable ArchivedModelsSync Query
 *
 * @param request - function to call the graphql client
 */
export declare class ArchivedModelsSyncQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchivedModelsSync query and return a ArchiveResponse
     *
     * @param modelClass - required modelClass to pass to archivedModelsSync
     * @param teamId - required teamId to pass to archivedModelsSync
     * @param variables - variables without 'modelClass', 'teamId' to pass into the ArchivedModelsSyncQuery
     * @returns parsed response from ArchivedModelsSyncQuery
     */
    fetch(modelClass: string, teamId: string, variables?: Omit<L.ArchivedModelsSyncQueryVariables, "modelClass" | "teamId">): LinearFetch<ArchiveResponse>;
}
/**
 * A fetchable Attachment Query
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Attachment query and return a Attachment
     *
     * @param id - required id to pass to attachment
     * @returns parsed response from AttachmentQuery
     */
    fetch(id: string): LinearFetch<Attachment>;
}
/**
 * A fetchable AttachmentIssue Query
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentIssueQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentIssue query and return a Issue
     *
     * @param id - required id to pass to attachmentIssue
     * @returns parsed response from AttachmentIssueQuery
     */
    fetch(id: string): LinearFetch<Issue>;
}
/**
 * A fetchable Attachments Query
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Attachments query and return a AttachmentConnection
     *
     * @param variables - variables to pass into the AttachmentsQuery
     * @returns parsed response from AttachmentsQuery
     */
    fetch(variables?: L.AttachmentsQueryVariables): LinearFetch<AttachmentConnection>;
}
/**
 * A fetchable AttachmentsForUrl Query
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentsForUrlQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentsForUrl query and return a AttachmentConnection
     *
     * @param url - required url to pass to attachmentsForURL
     * @param variables - variables without 'url' to pass into the AttachmentsForUrlQuery
     * @returns parsed response from AttachmentsForUrlQuery
     */
    fetch(url: string, variables?: Omit<L.AttachmentsForUrlQueryVariables, "url">): LinearFetch<AttachmentConnection>;
}
/**
 * A fetchable AuditEntries Query
 *
 * @param request - function to call the graphql client
 */
export declare class AuditEntriesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AuditEntries query and return a AuditEntryConnection
     *
     * @param variables - variables to pass into the AuditEntriesQuery
     * @returns parsed response from AuditEntriesQuery
     */
    fetch(variables?: L.AuditEntriesQueryVariables): LinearFetch<AuditEntryConnection>;
}
/**
 * A fetchable AuditEntryTypes Query
 *
 * @param request - function to call the graphql client
 */
export declare class AuditEntryTypesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AuditEntryTypes query and return a AuditEntryType list
     *
     * @returns parsed response from AuditEntryTypesQuery
     */
    fetch(): LinearFetch<AuditEntryType[]>;
}
/**
 * A fetchable AuthenticationSessions Query
 *
 * @param request - function to call the graphql client
 */
export declare class AuthenticationSessionsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AuthenticationSessions query and return a AuthenticationSessionResponse list
     *
     * @returns parsed response from AuthenticationSessionsQuery
     */
    fetch(): LinearFetch<AuthenticationSessionResponse[]>;
}
/**
 * A fetchable AvailableUsers Query
 *
 * @param request - function to call the graphql client
 */
export declare class AvailableUsersQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AvailableUsers query and return a AuthResolverResponse
     *
     * @returns parsed response from AvailableUsersQuery
     */
    fetch(): LinearFetch<AuthResolverResponse>;
}
/**
 * A fetchable Comment Query
 *
 * @param request - function to call the graphql client
 */
export declare class CommentQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Comment query and return a Comment
     *
     * @param variables - variables to pass into the CommentQuery
     * @returns parsed response from CommentQuery
     */
    fetch(variables?: L.CommentQueryVariables): LinearFetch<Comment>;
}
/**
 * A fetchable Comments Query
 *
 * @param request - function to call the graphql client
 */
export declare class CommentsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Comments query and return a CommentConnection
     *
     * @param variables - variables to pass into the CommentsQuery
     * @returns parsed response from CommentsQuery
     */
    fetch(variables?: L.CommentsQueryVariables): LinearFetch<CommentConnection>;
}
/**
 * A fetchable CustomView Query
 *
 * @param request - function to call the graphql client
 */
export declare class CustomViewQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CustomView query and return a CustomView
     *
     * @param id - required id to pass to customView
     * @returns parsed response from CustomViewQuery
     */
    fetch(id: string): LinearFetch<CustomView>;
}
/**
 * A fetchable CustomViewHasSubscribers Query
 *
 * @param request - function to call the graphql client
 */
export declare class CustomViewHasSubscribersQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CustomViewHasSubscribers query and return a CustomViewHasSubscribersPayload
     *
     * @param id - required id to pass to customViewHasSubscribers
     * @returns parsed response from CustomViewHasSubscribersQuery
     */
    fetch(id: string): LinearFetch<CustomViewHasSubscribersPayload>;
}
/**
 * A fetchable CustomViews Query
 *
 * @param request - function to call the graphql client
 */
export declare class CustomViewsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CustomViews query and return a CustomViewConnection
     *
     * @param variables - variables to pass into the CustomViewsQuery
     * @returns parsed response from CustomViewsQuery
     */
    fetch(variables?: L.CustomViewsQueryVariables): LinearFetch<CustomViewConnection>;
}
/**
 * A fetchable Cycle Query
 *
 * @param request - function to call the graphql client
 */
export declare class CycleQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Cycle query and return a Cycle
     *
     * @param id - required id to pass to cycle
     * @returns parsed response from CycleQuery
     */
    fetch(id: string): LinearFetch<Cycle>;
}
/**
 * A fetchable Cycles Query
 *
 * @param request - function to call the graphql client
 */
export declare class CyclesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Cycles query and return a CycleConnection
     *
     * @param variables - variables to pass into the CyclesQuery
     * @returns parsed response from CyclesQuery
     */
    fetch(variables?: L.CyclesQueryVariables): LinearFetch<CycleConnection>;
}
/**
 * A fetchable DiaryEntry Query
 *
 * @param request - function to call the graphql client
 */
export declare class DiaryEntryQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DiaryEntry query and return a DiaryEntry
     *
     * @param id - required id to pass to diaryEntry
     * @returns parsed response from DiaryEntryQuery
     */
    fetch(id: string): LinearFetch<DiaryEntry>;
}
/**
 * A fetchable Document Query
 *
 * @param request - function to call the graphql client
 */
export declare class DocumentQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Document query and return a Document
     *
     * @param id - required id to pass to document
     * @returns parsed response from DocumentQuery
     */
    fetch(id: string): LinearFetch<Document>;
}
/**
 * A fetchable DocumentContentHistory Query
 *
 * @param request - function to call the graphql client
 */
export declare class DocumentContentHistoryQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DocumentContentHistory query and return a DocumentContentHistoryPayload
     *
     * @param id - required id to pass to documentContentHistory
     * @returns parsed response from DocumentContentHistoryQuery
     */
    fetch(id: string): LinearFetch<DocumentContentHistoryPayload>;
}
/**
 * A fetchable Documents Query
 *
 * @param request - function to call the graphql client
 */
export declare class DocumentsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Documents query and return a DocumentConnection
     *
     * @param variables - variables to pass into the DocumentsQuery
     * @returns parsed response from DocumentsQuery
     */
    fetch(variables?: L.DocumentsQueryVariables): LinearFetch<DocumentConnection>;
}
/**
 * A fetchable Emoji Query
 *
 * @param request - function to call the graphql client
 */
export declare class EmojiQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Emoji query and return a Emoji
     *
     * @param id - required id to pass to emoji
     * @returns parsed response from EmojiQuery
     */
    fetch(id: string): LinearFetch<Emoji>;
}
/**
 * A fetchable Emojis Query
 *
 * @param request - function to call the graphql client
 */
export declare class EmojisQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Emojis query and return a EmojiConnection
     *
     * @param variables - variables to pass into the EmojisQuery
     * @returns parsed response from EmojisQuery
     */
    fetch(variables?: L.EmojisQueryVariables): LinearFetch<EmojiConnection>;
}
/**
 * A fetchable EntityExternalLink Query
 *
 * @param request - function to call the graphql client
 */
export declare class EntityExternalLinkQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the EntityExternalLink query and return a EntityExternalLink
     *
     * @param id - required id to pass to entityExternalLink
     * @returns parsed response from EntityExternalLinkQuery
     */
    fetch(id: string): LinearFetch<EntityExternalLink>;
}
/**
 * A fetchable ExternalUser Query
 *
 * @param request - function to call the graphql client
 */
export declare class ExternalUserQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ExternalUser query and return a ExternalUser
     *
     * @param id - required id to pass to externalUser
     * @returns parsed response from ExternalUserQuery
     */
    fetch(id: string): LinearFetch<ExternalUser>;
}
/**
 * A fetchable ExternalUsers Query
 *
 * @param request - function to call the graphql client
 */
export declare class ExternalUsersQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ExternalUsers query and return a ExternalUserConnection
     *
     * @param variables - variables to pass into the ExternalUsersQuery
     * @returns parsed response from ExternalUsersQuery
     */
    fetch(variables?: L.ExternalUsersQueryVariables): LinearFetch<ExternalUserConnection>;
}
/**
 * A fetchable Favorite Query
 *
 * @param request - function to call the graphql client
 */
export declare class FavoriteQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Favorite query and return a Favorite
     *
     * @param id - required id to pass to favorite
     * @returns parsed response from FavoriteQuery
     */
    fetch(id: string): LinearFetch<Favorite>;
}
/**
 * A fetchable Favorites Query
 *
 * @param request - function to call the graphql client
 */
export declare class FavoritesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Favorites query and return a FavoriteConnection
     *
     * @param variables - variables to pass into the FavoritesQuery
     * @returns parsed response from FavoritesQuery
     */
    fetch(variables?: L.FavoritesQueryVariables): LinearFetch<FavoriteConnection>;
}
/**
 * A fetchable Initiative Query
 *
 * @param request - function to call the graphql client
 */
export declare class InitiativeQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Initiative query and return a Initiative
     *
     * @param id - required id to pass to initiative
     * @returns parsed response from InitiativeQuery
     */
    fetch(id: string): LinearFetch<Initiative>;
}
/**
 * A fetchable InitiativeToProject Query
 *
 * @param request - function to call the graphql client
 */
export declare class InitiativeToProjectQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the InitiativeToProject query and return a InitiativeToProject
     *
     * @param id - required id to pass to initiativeToProject
     * @returns parsed response from InitiativeToProjectQuery
     */
    fetch(id: string): LinearFetch<InitiativeToProject>;
}
/**
 * A fetchable InitiativeToProjects Query
 *
 * @param request - function to call the graphql client
 */
export declare class InitiativeToProjectsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the InitiativeToProjects query and return a InitiativeToProjectConnection
     *
     * @param variables - variables to pass into the InitiativeToProjectsQuery
     * @returns parsed response from InitiativeToProjectsQuery
     */
    fetch(variables?: L.InitiativeToProjectsQueryVariables): LinearFetch<InitiativeToProjectConnection>;
}
/**
 * A fetchable Initiatives Query
 *
 * @param request - function to call the graphql client
 */
export declare class InitiativesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Initiatives query and return a InitiativeConnection
     *
     * @param variables - variables to pass into the InitiativesQuery
     * @returns parsed response from InitiativesQuery
     */
    fetch(variables?: L.InitiativesQueryVariables): LinearFetch<InitiativeConnection>;
}
/**
 * A fetchable Integration Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Integration query and return a Integration
     *
     * @param id - required id to pass to integration
     * @returns parsed response from IntegrationQuery
     */
    fetch(id: string): LinearFetch<Integration>;
}
/**
 * A fetchable IntegrationHasScopes Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationHasScopesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationHasScopes query and return a IntegrationHasScopesPayload
     *
     * @param integrationId - required integrationId to pass to integrationHasScopes
     * @param scopes - required scopes to pass to integrationHasScopes
     * @returns parsed response from IntegrationHasScopesQuery
     */
    fetch(integrationId: string, scopes: string[]): LinearFetch<IntegrationHasScopesPayload>;
}
/**
 * A fetchable IntegrationTemplate Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationTemplateQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationTemplate query and return a IntegrationTemplate
     *
     * @param id - required id to pass to integrationTemplate
     * @returns parsed response from IntegrationTemplateQuery
     */
    fetch(id: string): LinearFetch<IntegrationTemplate>;
}
/**
 * A fetchable IntegrationTemplates Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationTemplatesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationTemplates query and return a IntegrationTemplateConnection
     *
     * @param variables - variables to pass into the IntegrationTemplatesQuery
     * @returns parsed response from IntegrationTemplatesQuery
     */
    fetch(variables?: L.IntegrationTemplatesQueryVariables): LinearFetch<IntegrationTemplateConnection>;
}
/**
 * A fetchable Integrations Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Integrations query and return a IntegrationConnection
     *
     * @param variables - variables to pass into the IntegrationsQuery
     * @returns parsed response from IntegrationsQuery
     */
    fetch(variables?: L.IntegrationsQueryVariables): LinearFetch<IntegrationConnection>;
}
/**
 * A fetchable IntegrationsSettings Query
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationsSettingsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationsSettings query and return a IntegrationsSettings
     *
     * @param id - required id to pass to integrationsSettings
     * @returns parsed response from IntegrationsSettingsQuery
     */
    fetch(id: string): LinearFetch<IntegrationsSettings>;
}
/**
 * A fetchable Issue Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Issue query and return a Issue
     *
     * @param id - required id to pass to issue
     * @returns parsed response from IssueQuery
     */
    fetch(id: string): LinearFetch<Issue>;
}
/**
 * A fetchable IssueFigmaFileKeySearch Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueFigmaFileKeySearchQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueFigmaFileKeySearch query and return a IssueConnection
     *
     * @param fileKey - required fileKey to pass to issueFigmaFileKeySearch
     * @param variables - variables without 'fileKey' to pass into the IssueFigmaFileKeySearchQuery
     * @returns parsed response from IssueFigmaFileKeySearchQuery
     */
    fetch(fileKey: string, variables?: Omit<L.IssueFigmaFileKeySearchQueryVariables, "fileKey">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable IssueFilterSuggestion Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueFilterSuggestionQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueFilterSuggestion query and return a IssueFilterSuggestionPayload
     *
     * @param prompt - required prompt to pass to issueFilterSuggestion
     * @param variables - variables without 'prompt' to pass into the IssueFilterSuggestionQuery
     * @returns parsed response from IssueFilterSuggestionQuery
     */
    fetch(prompt: string, variables?: Omit<L.IssueFilterSuggestionQueryVariables, "prompt">): LinearFetch<IssueFilterSuggestionPayload>;
}
/**
 * A fetchable IssueImportCheckCsv Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCheckCsvQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCheckCsv query and return a IssueImportCheckPayload
     *
     * @param csvUrl - required csvUrl to pass to issueImportCheckCSV
     * @param service - required service to pass to issueImportCheckCSV
     * @returns parsed response from IssueImportCheckCsvQuery
     */
    fetch(csvUrl: string, service: string): LinearFetch<IssueImportCheckPayload>;
}
/**
 * A fetchable IssueImportCheckSync Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCheckSyncQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCheckSync query and return a IssueImportSyncCheckPayload
     *
     * @param issueImportId - required issueImportId to pass to issueImportCheckSync
     * @returns parsed response from IssueImportCheckSyncQuery
     */
    fetch(issueImportId: string): LinearFetch<IssueImportSyncCheckPayload>;
}
/**
 * A fetchable IssueLabel Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueLabelQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueLabel query and return a IssueLabel
     *
     * @param id - required id to pass to issueLabel
     * @returns parsed response from IssueLabelQuery
     */
    fetch(id: string): LinearFetch<IssueLabel>;
}
/**
 * A fetchable IssueLabels Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueLabelsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueLabels query and return a IssueLabelConnection
     *
     * @param variables - variables to pass into the IssueLabelsQuery
     * @returns parsed response from IssueLabelsQuery
     */
    fetch(variables?: L.IssueLabelsQueryVariables): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable IssuePriorityValues Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssuePriorityValuesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssuePriorityValues query and return a IssuePriorityValue list
     *
     * @returns parsed response from IssuePriorityValuesQuery
     */
    fetch(): LinearFetch<IssuePriorityValue[]>;
}
/**
 * A fetchable IssueRelation Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueRelationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueRelation query and return a IssueRelation
     *
     * @param id - required id to pass to issueRelation
     * @returns parsed response from IssueRelationQuery
     */
    fetch(id: string): LinearFetch<IssueRelation>;
}
/**
 * A fetchable IssueRelations Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueRelationsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueRelations query and return a IssueRelationConnection
     *
     * @param variables - variables to pass into the IssueRelationsQuery
     * @returns parsed response from IssueRelationsQuery
     */
    fetch(variables?: L.IssueRelationsQueryVariables): LinearFetch<IssueRelationConnection>;
}
/**
 * A fetchable IssueSearch Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueSearchQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueSearch query and return a IssueConnection
     *
     * @param variables - variables to pass into the IssueSearchQuery
     * @returns parsed response from IssueSearchQuery
     */
    fetch(variables?: L.IssueSearchQueryVariables): LinearFetch<IssueConnection>;
}
/**
 * A fetchable IssueVcsBranchSearch Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssueVcsBranchSearchQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueVcsBranchSearch query and return a Issue
     *
     * @param branchName - required branchName to pass to issueVcsBranchSearch
     * @returns parsed response from IssueVcsBranchSearchQuery
     */
    fetch(branchName: string): LinearFetch<Issue | undefined>;
}
/**
 * A fetchable Issues Query
 *
 * @param request - function to call the graphql client
 */
export declare class IssuesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Issues query and return a IssueConnection
     *
     * @param variables - variables to pass into the IssuesQuery
     * @returns parsed response from IssuesQuery
     */
    fetch(variables?: L.IssuesQueryVariables): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Notification Query
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Notification query and return a Notification
     *
     * @param id - required id to pass to notification
     * @returns parsed response from NotificationQuery
     */
    fetch(id: string): LinearFetch<DocumentNotification | InitiativeNotification | IssueNotification | OauthClientApprovalNotification | ProjectNotification | Notification>;
}
/**
 * A fetchable NotificationSubscription Query
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationSubscriptionQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationSubscription query and return a NotificationSubscription
     *
     * @param id - required id to pass to notificationSubscription
     * @returns parsed response from NotificationSubscriptionQuery
     */
    fetch(id: string): LinearFetch<CustomViewNotificationSubscription | CycleNotificationSubscription | InitiativeNotificationSubscription | LabelNotificationSubscription | ProjectNotificationSubscription | TeamNotificationSubscription | UserNotificationSubscription | NotificationSubscription>;
}
/**
 * A fetchable NotificationSubscriptions Query
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationSubscriptionsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationSubscriptions query and return a NotificationSubscriptionConnection
     *
     * @param variables - variables to pass into the NotificationSubscriptionsQuery
     * @returns parsed response from NotificationSubscriptionsQuery
     */
    fetch(variables?: L.NotificationSubscriptionsQueryVariables): LinearFetch<NotificationSubscriptionConnection>;
}
/**
 * A fetchable Notifications Query
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Notifications query and return a NotificationConnection
     *
     * @param variables - variables to pass into the NotificationsQuery
     * @returns parsed response from NotificationsQuery
     */
    fetch(variables?: L.NotificationsQueryVariables): LinearFetch<NotificationConnection>;
}
/**
 * A fetchable Organization Query
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Organization query and return a Organization
     *
     * @returns parsed response from OrganizationQuery
     */
    fetch(): LinearFetch<Organization>;
}
/**
 * A fetchable OrganizationExists Query
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationExistsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the OrganizationExists query and return a OrganizationExistsPayload
     *
     * @param urlKey - required urlKey to pass to organizationExists
     * @returns parsed response from OrganizationExistsQuery
     */
    fetch(urlKey: string): LinearFetch<OrganizationExistsPayload>;
}
/**
 * A fetchable OrganizationInvite Query
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationInviteQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the OrganizationInvite query and return a OrganizationInvite
     *
     * @param id - required id to pass to organizationInvite
     * @returns parsed response from OrganizationInviteQuery
     */
    fetch(id: string): LinearFetch<OrganizationInvite>;
}
/**
 * A fetchable OrganizationInvites Query
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationInvitesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the OrganizationInvites query and return a OrganizationInviteConnection
     *
     * @param variables - variables to pass into the OrganizationInvitesQuery
     * @returns parsed response from OrganizationInvitesQuery
     */
    fetch(variables?: L.OrganizationInvitesQueryVariables): LinearFetch<OrganizationInviteConnection>;
}
/**
 * A fetchable Project Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Project query and return a Project
     *
     * @param id - required id to pass to project
     * @returns parsed response from ProjectQuery
     */
    fetch(id: string): LinearFetch<Project>;
}
/**
 * A fetchable ProjectFilterSuggestion Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectFilterSuggestionQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectFilterSuggestion query and return a ProjectFilterSuggestionPayload
     *
     * @param prompt - required prompt to pass to projectFilterSuggestion
     * @returns parsed response from ProjectFilterSuggestionQuery
     */
    fetch(prompt: string): LinearFetch<ProjectFilterSuggestionPayload>;
}
/**
 * A fetchable ProjectLink Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectLinkQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectLink query and return a ProjectLink
     *
     * @param id - required id to pass to projectLink
     * @returns parsed response from ProjectLinkQuery
     */
    fetch(id: string): LinearFetch<ProjectLink>;
}
/**
 * A fetchable ProjectLinks Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectLinksQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectLinks query and return a ProjectLinkConnection
     *
     * @param variables - variables to pass into the ProjectLinksQuery
     * @returns parsed response from ProjectLinksQuery
     */
    fetch(variables?: L.ProjectLinksQueryVariables): LinearFetch<ProjectLinkConnection>;
}
/**
 * A fetchable ProjectMilestone Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectMilestoneQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectMilestone query and return a ProjectMilestone
     *
     * @param id - required id to pass to projectMilestone
     * @returns parsed response from ProjectMilestoneQuery
     */
    fetch(id: string): LinearFetch<ProjectMilestone>;
}
/**
 * A fetchable ProjectMilestones Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectMilestonesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectMilestones query and return a ProjectMilestoneConnection
     *
     * @param variables - variables to pass into the ProjectMilestonesQuery
     * @returns parsed response from ProjectMilestonesQuery
     */
    fetch(variables?: L.ProjectMilestonesQueryVariables): LinearFetch<ProjectMilestoneConnection>;
}
/**
 * A fetchable ProjectRelation Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectRelationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectRelation query and return a ProjectRelation
     *
     * @param id - required id to pass to projectRelation
     * @returns parsed response from ProjectRelationQuery
     */
    fetch(id: string): LinearFetch<ProjectRelation>;
}
/**
 * A fetchable ProjectRelations Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectRelationsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectRelations query and return a ProjectRelationConnection
     *
     * @param variables - variables to pass into the ProjectRelationsQuery
     * @returns parsed response from ProjectRelationsQuery
     */
    fetch(variables?: L.ProjectRelationsQueryVariables): LinearFetch<ProjectRelationConnection>;
}
/**
 * A fetchable ProjectUpdate Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectUpdateQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectUpdate query and return a ProjectUpdate
     *
     * @param id - required id to pass to projectUpdate
     * @returns parsed response from ProjectUpdateQuery
     */
    fetch(id: string): LinearFetch<ProjectUpdate>;
}
/**
 * A fetchable ProjectUpdateInteraction Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectUpdateInteractionQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectUpdateInteraction query and return a ProjectUpdateInteraction
     *
     * @param id - required id to pass to projectUpdateInteraction
     * @returns parsed response from ProjectUpdateInteractionQuery
     */
    fetch(id: string): LinearFetch<ProjectUpdateInteraction>;
}
/**
 * A fetchable ProjectUpdateInteractions Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectUpdateInteractionsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectUpdateInteractions query and return a ProjectUpdateInteractionConnection
     *
     * @param variables - variables to pass into the ProjectUpdateInteractionsQuery
     * @returns parsed response from ProjectUpdateInteractionsQuery
     */
    fetch(variables?: L.ProjectUpdateInteractionsQueryVariables): LinearFetch<ProjectUpdateInteractionConnection>;
}
/**
 * A fetchable ProjectUpdates Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectUpdatesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectUpdates query and return a ProjectUpdateConnection
     *
     * @param variables - variables to pass into the ProjectUpdatesQuery
     * @returns parsed response from ProjectUpdatesQuery
     */
    fetch(variables?: L.ProjectUpdatesQueryVariables): LinearFetch<ProjectUpdateConnection>;
}
/**
 * A fetchable Projects Query
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Projects query and return a ProjectConnection
     *
     * @param variables - variables to pass into the ProjectsQuery
     * @returns parsed response from ProjectsQuery
     */
    fetch(variables?: L.ProjectsQueryVariables): LinearFetch<ProjectConnection>;
}
/**
 * A fetchable PushSubscriptionTest Query
 *
 * @param request - function to call the graphql client
 */
export declare class PushSubscriptionTestQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the PushSubscriptionTest query and return a PushSubscriptionTestPayload
     *
     * @param variables - variables to pass into the PushSubscriptionTestQuery
     * @returns parsed response from PushSubscriptionTestQuery
     */
    fetch(variables?: L.PushSubscriptionTestQueryVariables): LinearFetch<PushSubscriptionTestPayload>;
}
/**
 * A fetchable RateLimitStatus Query
 *
 * @param request - function to call the graphql client
 */
export declare class RateLimitStatusQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the RateLimitStatus query and return a RateLimitPayload
     *
     * @returns parsed response from RateLimitStatusQuery
     */
    fetch(): LinearFetch<RateLimitPayload>;
}
/**
 * A fetchable Roadmap Query
 *
 * @param request - function to call the graphql client
 */
export declare class RoadmapQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Roadmap query and return a Roadmap
     *
     * @param id - required id to pass to roadmap
     * @returns parsed response from RoadmapQuery
     */
    fetch(id: string): LinearFetch<Roadmap>;
}
/**
 * A fetchable RoadmapToProject Query
 *
 * @param request - function to call the graphql client
 */
export declare class RoadmapToProjectQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the RoadmapToProject query and return a RoadmapToProject
     *
     * @param id - required id to pass to roadmapToProject
     * @returns parsed response from RoadmapToProjectQuery
     */
    fetch(id: string): LinearFetch<RoadmapToProject>;
}
/**
 * A fetchable RoadmapToProjects Query
 *
 * @param request - function to call the graphql client
 */
export declare class RoadmapToProjectsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the RoadmapToProjects query and return a RoadmapToProjectConnection
     *
     * @param variables - variables to pass into the RoadmapToProjectsQuery
     * @returns parsed response from RoadmapToProjectsQuery
     */
    fetch(variables?: L.RoadmapToProjectsQueryVariables): LinearFetch<RoadmapToProjectConnection>;
}
/**
 * A fetchable Roadmaps Query
 *
 * @param request - function to call the graphql client
 */
export declare class RoadmapsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Roadmaps query and return a RoadmapConnection
     *
     * @param variables - variables to pass into the RoadmapsQuery
     * @returns parsed response from RoadmapsQuery
     */
    fetch(variables?: L.RoadmapsQueryVariables): LinearFetch<RoadmapConnection>;
}
/**
 * A fetchable SearchDocuments Query
 *
 * @param request - function to call the graphql client
 */
export declare class SearchDocumentsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SearchDocuments query and return a DocumentSearchPayload
     *
     * @param term - required term to pass to searchDocuments
     * @param variables - variables without 'term' to pass into the SearchDocumentsQuery
     * @returns parsed response from SearchDocumentsQuery
     */
    fetch(term: string, variables?: Omit<L.SearchDocumentsQueryVariables, "term">): LinearFetch<DocumentSearchPayload>;
}
/**
 * A fetchable SearchIssues Query
 *
 * @param request - function to call the graphql client
 */
export declare class SearchIssuesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SearchIssues query and return a IssueSearchPayload
     *
     * @param term - required term to pass to searchIssues
     * @param variables - variables without 'term' to pass into the SearchIssuesQuery
     * @returns parsed response from SearchIssuesQuery
     */
    fetch(term: string, variables?: Omit<L.SearchIssuesQueryVariables, "term">): LinearFetch<IssueSearchPayload>;
}
/**
 * A fetchable SearchProjects Query
 *
 * @param request - function to call the graphql client
 */
export declare class SearchProjectsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SearchProjects query and return a ProjectSearchPayload
     *
     * @param term - required term to pass to searchProjects
     * @param variables - variables without 'term' to pass into the SearchProjectsQuery
     * @returns parsed response from SearchProjectsQuery
     */
    fetch(term: string, variables?: Omit<L.SearchProjectsQueryVariables, "term">): LinearFetch<ProjectSearchPayload>;
}
/**
 * A fetchable SsoUrlFromEmail Query
 *
 * @param request - function to call the graphql client
 */
export declare class SsoUrlFromEmailQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SsoUrlFromEmail query and return a SsoUrlFromEmailResponse
     *
     * @param email - required email to pass to ssoUrlFromEmail
     * @param variables - variables without 'email' to pass into the SsoUrlFromEmailQuery
     * @returns parsed response from SsoUrlFromEmailQuery
     */
    fetch(email: string, variables?: Omit<L.SsoUrlFromEmailQueryVariables, "email">): LinearFetch<SsoUrlFromEmailResponse>;
}
/**
 * A fetchable SyncEntityCount Query
 *
 * @param request - function to call the graphql client
 */
export declare class SyncEntityCountQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SyncEntityCount query and return a EntityCountResponse
     *
     * @returns parsed response from SyncEntityCountQuery
     */
    fetch(): LinearFetch<EntityCountResponse>;
}
/**
 * A fetchable Team Query
 *
 * @param request - function to call the graphql client
 */
export declare class TeamQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Team query and return a Team
     *
     * @param id - required id to pass to team
     * @returns parsed response from TeamQuery
     */
    fetch(id: string): LinearFetch<Team>;
}
/**
 * A fetchable TeamMembership Query
 *
 * @param request - function to call the graphql client
 */
export declare class TeamMembershipQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TeamMembership query and return a TeamMembership
     *
     * @param id - required id to pass to teamMembership
     * @returns parsed response from TeamMembershipQuery
     */
    fetch(id: string): LinearFetch<TeamMembership>;
}
/**
 * A fetchable TeamMemberships Query
 *
 * @param request - function to call the graphql client
 */
export declare class TeamMembershipsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TeamMemberships query and return a TeamMembershipConnection
     *
     * @param variables - variables to pass into the TeamMembershipsQuery
     * @returns parsed response from TeamMembershipsQuery
     */
    fetch(variables?: L.TeamMembershipsQueryVariables): LinearFetch<TeamMembershipConnection>;
}
/**
 * A fetchable Teams Query
 *
 * @param request - function to call the graphql client
 */
export declare class TeamsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Teams query and return a TeamConnection
     *
     * @param variables - variables to pass into the TeamsQuery
     * @returns parsed response from TeamsQuery
     */
    fetch(variables?: L.TeamsQueryVariables): LinearFetch<TeamConnection>;
}
/**
 * A fetchable Template Query
 *
 * @param request - function to call the graphql client
 */
export declare class TemplateQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Template query and return a Template
     *
     * @param id - required id to pass to template
     * @returns parsed response from TemplateQuery
     */
    fetch(id: string): LinearFetch<Template>;
}
/**
 * A fetchable Templates Query
 *
 * @param request - function to call the graphql client
 */
export declare class TemplatesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Templates query and return a Template list
     *
     * @returns parsed response from TemplatesQuery
     */
    fetch(): LinearFetch<Template[]>;
}
/**
 * A fetchable TemplatesForIntegration Query
 *
 * @param request - function to call the graphql client
 */
export declare class TemplatesForIntegrationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TemplatesForIntegration query and return a Template list
     *
     * @param integrationType - required integrationType to pass to templatesForIntegration
     * @returns parsed response from TemplatesForIntegrationQuery
     */
    fetch(integrationType: string): LinearFetch<Template[]>;
}
/**
 * A fetchable TimeSchedule Query
 *
 * @param request - function to call the graphql client
 */
export declare class TimeScheduleQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TimeSchedule query and return a TimeSchedule
     *
     * @param id - required id to pass to timeSchedule
     * @returns parsed response from TimeScheduleQuery
     */
    fetch(id: string): LinearFetch<TimeSchedule>;
}
/**
 * A fetchable TimeSchedules Query
 *
 * @param request - function to call the graphql client
 */
export declare class TimeSchedulesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TimeSchedules query and return a TimeScheduleConnection
     *
     * @param variables - variables to pass into the TimeSchedulesQuery
     * @returns parsed response from TimeSchedulesQuery
     */
    fetch(variables?: L.TimeSchedulesQueryVariables): LinearFetch<TimeScheduleConnection>;
}
/**
 * A fetchable TriageResponsibilities Query
 *
 * @param request - function to call the graphql client
 */
export declare class TriageResponsibilitiesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TriageResponsibilities query and return a TriageResponsibilityConnection
     *
     * @param variables - variables to pass into the TriageResponsibilitiesQuery
     * @returns parsed response from TriageResponsibilitiesQuery
     */
    fetch(variables?: L.TriageResponsibilitiesQueryVariables): LinearFetch<TriageResponsibilityConnection>;
}
/**
 * A fetchable TriageResponsibility Query
 *
 * @param request - function to call the graphql client
 */
export declare class TriageResponsibilityQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TriageResponsibility query and return a TriageResponsibility
     *
     * @param id - required id to pass to triageResponsibility
     * @returns parsed response from TriageResponsibilityQuery
     */
    fetch(id: string): LinearFetch<TriageResponsibility>;
}
/**
 * A fetchable User Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the User query and return a User
     *
     * @param id - required id to pass to user
     * @returns parsed response from UserQuery
     */
    fetch(id: string): LinearFetch<User>;
}
/**
 * A fetchable UserSettings Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettingsQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings query and return a UserSettings
     *
     * @returns parsed response from UserSettingsQuery
     */
    fetch(): LinearFetch<UserSettings>;
}
/**
 * A fetchable Users Query
 *
 * @param request - function to call the graphql client
 */
export declare class UsersQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Users query and return a UserConnection
     *
     * @param variables - variables to pass into the UsersQuery
     * @returns parsed response from UsersQuery
     */
    fetch(variables?: L.UsersQueryVariables): LinearFetch<UserConnection>;
}
/**
 * A fetchable VerifyGitHubEnterpriseServerInstallation Query
 *
 * @param request - function to call the graphql client
 */
export declare class VerifyGitHubEnterpriseServerInstallationQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the VerifyGitHubEnterpriseServerInstallation query and return a GitHubEnterpriseServerInstallVerificationPayload
     *
     * @returns parsed response from VerifyGitHubEnterpriseServerInstallationQuery
     */
    fetch(): LinearFetch<GitHubEnterpriseServerInstallVerificationPayload>;
}
/**
 * A fetchable Viewer Query
 *
 * @param request - function to call the graphql client
 */
export declare class ViewerQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Viewer query and return a User
     *
     * @returns parsed response from ViewerQuery
     */
    fetch(): LinearFetch<User>;
}
/**
 * A fetchable Webhook Query
 *
 * @param request - function to call the graphql client
 */
export declare class WebhookQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Webhook query and return a Webhook
     *
     * @param id - required id to pass to webhook
     * @returns parsed response from WebhookQuery
     */
    fetch(id: string): LinearFetch<Webhook>;
}
/**
 * A fetchable Webhooks Query
 *
 * @param request - function to call the graphql client
 */
export declare class WebhooksQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Webhooks query and return a WebhookConnection
     *
     * @param variables - variables to pass into the WebhooksQuery
     * @returns parsed response from WebhooksQuery
     */
    fetch(variables?: L.WebhooksQueryVariables): LinearFetch<WebhookConnection>;
}
/**
 * A fetchable WorkflowState Query
 *
 * @param request - function to call the graphql client
 */
export declare class WorkflowStateQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the WorkflowState query and return a WorkflowState
     *
     * @param id - required id to pass to workflowState
     * @returns parsed response from WorkflowStateQuery
     */
    fetch(id: string): LinearFetch<WorkflowState>;
}
/**
 * A fetchable WorkflowStates Query
 *
 * @param request - function to call the graphql client
 */
export declare class WorkflowStatesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the WorkflowStates query and return a WorkflowStateConnection
     *
     * @param variables - variables to pass into the WorkflowStatesQuery
     * @returns parsed response from WorkflowStatesQuery
     */
    fetch(variables?: L.WorkflowStatesQueryVariables): LinearFetch<WorkflowStateConnection>;
}
/**
 * A fetchable AirbyteIntegrationConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AirbyteIntegrationConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AirbyteIntegrationConnect mutation and return a IntegrationPayload
     *
     * @param input - required input to pass to airbyteIntegrationConnect
     * @returns parsed response from AirbyteIntegrationConnectMutation
     */
    fetch(input: L.AirbyteConfigurationInput): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable ArchiveAttachment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveAttachmentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveAttachment mutation and return a AttachmentArchivePayload
     *
     * @param id - required id to pass to archiveAttachment
     * @returns parsed response from ArchiveAttachmentMutation
     */
    fetch(id: string): LinearFetch<AttachmentArchivePayload>;
}
/**
 * A fetchable CreateAttachment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateAttachmentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateAttachment mutation and return a AttachmentPayload
     *
     * @param input - required input to pass to createAttachment
     * @returns parsed response from CreateAttachmentMutation
     */
    fetch(input: L.AttachmentCreateInput): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable DeleteAttachment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteAttachmentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteAttachment mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteAttachment
     * @returns parsed response from DeleteAttachmentMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable AttachmentLinkDiscord Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkDiscordMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkDiscord mutation and return a AttachmentPayload
     *
     * @param channelId - required channelId to pass to attachmentLinkDiscord
     * @param issueId - required issueId to pass to attachmentLinkDiscord
     * @param messageId - required messageId to pass to attachmentLinkDiscord
     * @param url - required url to pass to attachmentLinkDiscord
     * @param variables - variables without 'channelId', 'issueId', 'messageId', 'url' to pass into the AttachmentLinkDiscordMutation
     * @returns parsed response from AttachmentLinkDiscordMutation
     */
    fetch(channelId: string, issueId: string, messageId: string, url: string, variables?: Omit<L.AttachmentLinkDiscordMutationVariables, "channelId" | "issueId" | "messageId" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkFront Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkFrontMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkFront mutation and return a FrontAttachmentPayload
     *
     * @param conversationId - required conversationId to pass to attachmentLinkFront
     * @param issueId - required issueId to pass to attachmentLinkFront
     * @param variables - variables without 'conversationId', 'issueId' to pass into the AttachmentLinkFrontMutation
     * @returns parsed response from AttachmentLinkFrontMutation
     */
    fetch(conversationId: string, issueId: string, variables?: Omit<L.AttachmentLinkFrontMutationVariables, "conversationId" | "issueId">): LinearFetch<FrontAttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkGitHubIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkGitHubIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkGitHubIssue mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkGitHubIssue
     * @param url - required url to pass to attachmentLinkGitHubIssue
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkGitHubIssueMutation
     * @returns parsed response from AttachmentLinkGitHubIssueMutation
     */
    fetch(issueId: string, url: string, variables?: Omit<L.AttachmentLinkGitHubIssueMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkGitHubPr Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkGitHubPrMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkGitHubPr mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkGitHubPR
     * @param url - required url to pass to attachmentLinkGitHubPR
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkGitHubPrMutation
     * @returns parsed response from AttachmentLinkGitHubPrMutation
     */
    fetch(issueId: string, url: string, variables?: Omit<L.AttachmentLinkGitHubPrMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkGitLabMr Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkGitLabMrMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkGitLabMr mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkGitLabMR
     * @param number - required number to pass to attachmentLinkGitLabMR
     * @param projectPathWithNamespace - required projectPathWithNamespace to pass to attachmentLinkGitLabMR
     * @param url - required url to pass to attachmentLinkGitLabMR
     * @param variables - variables without 'issueId', 'number', 'projectPathWithNamespace', 'url' to pass into the AttachmentLinkGitLabMrMutation
     * @returns parsed response from AttachmentLinkGitLabMrMutation
     */
    fetch(issueId: string, number: number, projectPathWithNamespace: string, url: string, variables?: Omit<L.AttachmentLinkGitLabMrMutationVariables, "issueId" | "number" | "projectPathWithNamespace" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkIntercom Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkIntercomMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkIntercom mutation and return a AttachmentPayload
     *
     * @param conversationId - required conversationId to pass to attachmentLinkIntercom
     * @param issueId - required issueId to pass to attachmentLinkIntercom
     * @param variables - variables without 'conversationId', 'issueId' to pass into the AttachmentLinkIntercomMutation
     * @returns parsed response from AttachmentLinkIntercomMutation
     */
    fetch(conversationId: string, issueId: string, variables?: Omit<L.AttachmentLinkIntercomMutationVariables, "conversationId" | "issueId">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkJiraIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkJiraIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkJiraIssue mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkJiraIssue
     * @param jiraIssueId - required jiraIssueId to pass to attachmentLinkJiraIssue
     * @param variables - variables without 'issueId', 'jiraIssueId' to pass into the AttachmentLinkJiraIssueMutation
     * @returns parsed response from AttachmentLinkJiraIssueMutation
     */
    fetch(issueId: string, jiraIssueId: string, variables?: Omit<L.AttachmentLinkJiraIssueMutationVariables, "issueId" | "jiraIssueId">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkSlack Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkSlackMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkSlack mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkSlack
     * @param url - required url to pass to attachmentLinkSlack
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkSlackMutation
     * @returns parsed response from AttachmentLinkSlackMutation
     */
    fetch(issueId: string, url: string, variables?: Omit<L.AttachmentLinkSlackMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkUrl Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkUrlMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkUrl mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkURL
     * @param url - required url to pass to attachmentLinkURL
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkUrlMutation
     * @returns parsed response from AttachmentLinkUrlMutation
     */
    fetch(issueId: string, url: string, variables?: Omit<L.AttachmentLinkUrlMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentLinkZendesk Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentLinkZendeskMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentLinkZendesk mutation and return a AttachmentPayload
     *
     * @param issueId - required issueId to pass to attachmentLinkZendesk
     * @param ticketId - required ticketId to pass to attachmentLinkZendesk
     * @param variables - variables without 'issueId', 'ticketId' to pass into the AttachmentLinkZendeskMutation
     * @returns parsed response from AttachmentLinkZendeskMutation
     */
    fetch(issueId: string, ticketId: string, variables?: Omit<L.AttachmentLinkZendeskMutationVariables, "issueId" | "ticketId">): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable AttachmentSyncToSlack Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class AttachmentSyncToSlackMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the AttachmentSyncToSlack mutation and return a AttachmentPayload
     *
     * @param id - required id to pass to attachmentSyncToSlack
     * @returns parsed response from AttachmentSyncToSlackMutation
     */
    fetch(id: string): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable UpdateAttachment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateAttachmentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateAttachment mutation and return a AttachmentPayload
     *
     * @param id - required id to pass to updateAttachment
     * @param input - required input to pass to updateAttachment
     * @returns parsed response from UpdateAttachmentMutation
     */
    fetch(id: string, input: L.AttachmentUpdateInput): LinearFetch<AttachmentPayload>;
}
/**
 * A fetchable CreateComment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateCommentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateComment mutation and return a CommentPayload
     *
     * @param input - required input to pass to createComment
     * @returns parsed response from CreateCommentMutation
     */
    fetch(input: L.CommentCreateInput): LinearFetch<CommentPayload>;
}
/**
 * A fetchable DeleteComment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteCommentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteComment mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteComment
     * @returns parsed response from DeleteCommentMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CommentResolve Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CommentResolveMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CommentResolve mutation and return a CommentPayload
     *
     * @param id - required id to pass to commentResolve
     * @param variables - variables without 'id' to pass into the CommentResolveMutation
     * @returns parsed response from CommentResolveMutation
     */
    fetch(id: string, variables?: Omit<L.CommentResolveMutationVariables, "id">): LinearFetch<CommentPayload>;
}
/**
 * A fetchable CommentUnresolve Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CommentUnresolveMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CommentUnresolve mutation and return a CommentPayload
     *
     * @param id - required id to pass to commentUnresolve
     * @returns parsed response from CommentUnresolveMutation
     */
    fetch(id: string): LinearFetch<CommentPayload>;
}
/**
 * A fetchable UpdateComment Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateCommentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateComment mutation and return a CommentPayload
     *
     * @param id - required id to pass to updateComment
     * @param input - required input to pass to updateComment
     * @returns parsed response from UpdateCommentMutation
     */
    fetch(id: string, input: L.CommentUpdateInput): LinearFetch<CommentPayload>;
}
/**
 * A fetchable CreateContact Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateContactMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateContact mutation and return a ContactPayload
     *
     * @param input - required input to pass to createContact
     * @returns parsed response from CreateContactMutation
     */
    fetch(input: L.ContactCreateInput): LinearFetch<ContactPayload>;
}
/**
 * A fetchable CreateCsvExportReport Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateCsvExportReportMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateCsvExportReport mutation and return a CreateCsvExportReportPayload
     *
     * @param variables - variables to pass into the CreateCsvExportReportMutation
     * @returns parsed response from CreateCsvExportReportMutation
     */
    fetch(variables?: L.CreateCsvExportReportMutationVariables): LinearFetch<CreateCsvExportReportPayload>;
}
/**
 * A fetchable CreateOrganizationFromOnboarding Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateOrganizationFromOnboardingMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateOrganizationFromOnboarding mutation and return a CreateOrJoinOrganizationResponse
     *
     * @param input - required input to pass to createOrganizationFromOnboarding
     * @param variables - variables without 'input' to pass into the CreateOrganizationFromOnboardingMutation
     * @returns parsed response from CreateOrganizationFromOnboardingMutation
     */
    fetch(input: L.CreateOrganizationInput, variables?: Omit<L.CreateOrganizationFromOnboardingMutationVariables, "input">): LinearFetch<CreateOrJoinOrganizationResponse>;
}
/**
 * A fetchable CreateProjectUpdateReminder Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectUpdateReminderMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProjectUpdateReminder mutation and return a ProjectUpdateReminderPayload
     *
     * @param projectId - required projectId to pass to createProjectUpdateReminder
     * @param variables - variables without 'projectId' to pass into the CreateProjectUpdateReminderMutation
     * @returns parsed response from CreateProjectUpdateReminderMutation
     */
    fetch(projectId: string, variables?: Omit<L.CreateProjectUpdateReminderMutationVariables, "projectId">): LinearFetch<ProjectUpdateReminderPayload>;
}
/**
 * A fetchable CreateCustomView Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateCustomViewMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateCustomView mutation and return a CustomViewPayload
     *
     * @param input - required input to pass to createCustomView
     * @returns parsed response from CreateCustomViewMutation
     */
    fetch(input: L.CustomViewCreateInput): LinearFetch<CustomViewPayload>;
}
/**
 * A fetchable DeleteCustomView Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteCustomViewMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteCustomView mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteCustomView
     * @returns parsed response from DeleteCustomViewMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateCustomView Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateCustomViewMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateCustomView mutation and return a CustomViewPayload
     *
     * @param id - required id to pass to updateCustomView
     * @param input - required input to pass to updateCustomView
     * @returns parsed response from UpdateCustomViewMutation
     */
    fetch(id: string, input: L.CustomViewUpdateInput): LinearFetch<CustomViewPayload>;
}
/**
 * A fetchable ArchiveCycle Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveCycleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveCycle mutation and return a CycleArchivePayload
     *
     * @param id - required id to pass to archiveCycle
     * @returns parsed response from ArchiveCycleMutation
     */
    fetch(id: string): LinearFetch<CycleArchivePayload>;
}
/**
 * A fetchable CreateCycle Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateCycleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateCycle mutation and return a CyclePayload
     *
     * @param input - required input to pass to createCycle
     * @returns parsed response from CreateCycleMutation
     */
    fetch(input: L.CycleCreateInput): LinearFetch<CyclePayload>;
}
/**
 * A fetchable CycleShiftAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CycleShiftAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CycleShiftAll mutation and return a CyclePayload
     *
     * @param input - required input to pass to cycleShiftAll
     * @returns parsed response from CycleShiftAllMutation
     */
    fetch(input: L.CycleShiftAllInput): LinearFetch<CyclePayload>;
}
/**
 * A fetchable CycleStartUpcomingCycleToday Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CycleStartUpcomingCycleTodayMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CycleStartUpcomingCycleToday mutation and return a CyclePayload
     *
     * @param id - required id to pass to cycleStartUpcomingCycleToday
     * @returns parsed response from CycleStartUpcomingCycleTodayMutation
     */
    fetch(id: string): LinearFetch<CyclePayload>;
}
/**
 * A fetchable UpdateCycle Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateCycleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateCycle mutation and return a CyclePayload
     *
     * @param id - required id to pass to updateCycle
     * @param input - required input to pass to updateCycle
     * @returns parsed response from UpdateCycleMutation
     */
    fetch(id: string, input: L.CycleUpdateInput): LinearFetch<CyclePayload>;
}
/**
 * A fetchable CreateDiaryEntry Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateDiaryEntryMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateDiaryEntry mutation and return a DiaryEntryPayload
     *
     * @param input - required input to pass to createDiaryEntry
     * @returns parsed response from CreateDiaryEntryMutation
     */
    fetch(input: L.DiaryEntryCreateInput): LinearFetch<DiaryEntryPayload>;
}
/**
 * A fetchable DeleteDiaryEntry Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteDiaryEntryMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteDiaryEntry mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteDiaryEntry
     * @returns parsed response from DeleteDiaryEntryMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateDiaryEntry Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateDiaryEntryMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateDiaryEntry mutation and return a DiaryEntryPayload
     *
     * @param id - required id to pass to updateDiaryEntry
     * @param input - required input to pass to updateDiaryEntry
     * @returns parsed response from UpdateDiaryEntryMutation
     */
    fetch(id: string, input: L.DiaryEntryUpdateInput): LinearFetch<DiaryEntryPayload>;
}
/**
 * A fetchable CreateDocument Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateDocumentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateDocument mutation and return a DocumentPayload
     *
     * @param input - required input to pass to createDocument
     * @returns parsed response from CreateDocumentMutation
     */
    fetch(input: L.DocumentCreateInput): LinearFetch<DocumentPayload>;
}
/**
 * A fetchable DeleteDocument Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteDocumentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteDocument mutation and return a DocumentArchivePayload
     *
     * @param id - required id to pass to deleteDocument
     * @returns parsed response from DeleteDocumentMutation
     */
    fetch(id: string): LinearFetch<DocumentArchivePayload>;
}
/**
 * A fetchable UnarchiveDocument Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveDocumentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveDocument mutation and return a DocumentArchivePayload
     *
     * @param id - required id to pass to unarchiveDocument
     * @returns parsed response from UnarchiveDocumentMutation
     */
    fetch(id: string): LinearFetch<DocumentArchivePayload>;
}
/**
 * A fetchable UpdateDocument Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateDocumentMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateDocument mutation and return a DocumentPayload
     *
     * @param id - required id to pass to updateDocument
     * @param input - required input to pass to updateDocument
     * @returns parsed response from UpdateDocumentMutation
     */
    fetch(id: string, input: L.DocumentUpdateInput): LinearFetch<DocumentPayload>;
}
/**
 * A fetchable CreateEmailIntakeAddress Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateEmailIntakeAddressMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateEmailIntakeAddress mutation and return a EmailIntakeAddressPayload
     *
     * @param input - required input to pass to createEmailIntakeAddress
     * @returns parsed response from CreateEmailIntakeAddressMutation
     */
    fetch(input: L.EmailIntakeAddressCreateInput): LinearFetch<EmailIntakeAddressPayload>;
}
/**
 * A fetchable DeleteEmailIntakeAddress Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteEmailIntakeAddressMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteEmailIntakeAddress mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteEmailIntakeAddress
     * @returns parsed response from DeleteEmailIntakeAddressMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable EmailIntakeAddressRotate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class EmailIntakeAddressRotateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the EmailIntakeAddressRotate mutation and return a EmailIntakeAddressPayload
     *
     * @param id - required id to pass to emailIntakeAddressRotate
     * @returns parsed response from EmailIntakeAddressRotateMutation
     */
    fetch(id: string): LinearFetch<EmailIntakeAddressPayload>;
}
/**
 * A fetchable UpdateEmailIntakeAddress Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateEmailIntakeAddressMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateEmailIntakeAddress mutation and return a EmailIntakeAddressPayload
     *
     * @param id - required id to pass to updateEmailIntakeAddress
     * @param input - required input to pass to updateEmailIntakeAddress
     * @returns parsed response from UpdateEmailIntakeAddressMutation
     */
    fetch(id: string, input: L.EmailIntakeAddressUpdateInput): LinearFetch<EmailIntakeAddressPayload>;
}
/**
 * A fetchable EmailTokenUserAccountAuth Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class EmailTokenUserAccountAuthMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the EmailTokenUserAccountAuth mutation and return a AuthResolverResponse
     *
     * @param input - required input to pass to emailTokenUserAccountAuth
     * @returns parsed response from EmailTokenUserAccountAuthMutation
     */
    fetch(input: L.TokenUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
}
/**
 * A fetchable EmailUnsubscribe Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class EmailUnsubscribeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the EmailUnsubscribe mutation and return a EmailUnsubscribePayload
     *
     * @param input - required input to pass to emailUnsubscribe
     * @returns parsed response from EmailUnsubscribeMutation
     */
    fetch(input: L.EmailUnsubscribeInput): LinearFetch<EmailUnsubscribePayload>;
}
/**
 * A fetchable EmailUserAccountAuthChallenge Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class EmailUserAccountAuthChallengeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the EmailUserAccountAuthChallenge mutation and return a EmailUserAccountAuthChallengeResponse
     *
     * @param input - required input to pass to emailUserAccountAuthChallenge
     * @returns parsed response from EmailUserAccountAuthChallengeMutation
     */
    fetch(input: L.EmailUserAccountAuthChallengeInput): LinearFetch<EmailUserAccountAuthChallengeResponse>;
}
/**
 * A fetchable CreateEmoji Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateEmojiMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateEmoji mutation and return a EmojiPayload
     *
     * @param input - required input to pass to createEmoji
     * @returns parsed response from CreateEmojiMutation
     */
    fetch(input: L.EmojiCreateInput): LinearFetch<EmojiPayload>;
}
/**
 * A fetchable DeleteEmoji Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteEmojiMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteEmoji mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteEmoji
     * @returns parsed response from DeleteEmojiMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateEntityExternalLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateEntityExternalLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateEntityExternalLink mutation and return a EntityExternalLinkPayload
     *
     * @param input - required input to pass to createEntityExternalLink
     * @returns parsed response from CreateEntityExternalLinkMutation
     */
    fetch(input: L.EntityExternalLinkCreateInput): LinearFetch<EntityExternalLinkPayload>;
}
/**
 * A fetchable DeleteEntityExternalLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteEntityExternalLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteEntityExternalLink mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteEntityExternalLink
     * @returns parsed response from DeleteEntityExternalLinkMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateEntityExternalLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateEntityExternalLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateEntityExternalLink mutation and return a EntityExternalLinkPayload
     *
     * @param id - required id to pass to updateEntityExternalLink
     * @param input - required input to pass to updateEntityExternalLink
     * @returns parsed response from UpdateEntityExternalLinkMutation
     */
    fetch(id: string, input: L.EntityExternalLinkUpdateInput): LinearFetch<EntityExternalLinkPayload>;
}
/**
 * A fetchable CreateFavorite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateFavoriteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateFavorite mutation and return a FavoritePayload
     *
     * @param input - required input to pass to createFavorite
     * @returns parsed response from CreateFavoriteMutation
     */
    fetch(input: L.FavoriteCreateInput): LinearFetch<FavoritePayload>;
}
/**
 * A fetchable DeleteFavorite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteFavoriteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteFavorite mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteFavorite
     * @returns parsed response from DeleteFavoriteMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateFavorite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateFavoriteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateFavorite mutation and return a FavoritePayload
     *
     * @param id - required id to pass to updateFavorite
     * @param input - required input to pass to updateFavorite
     * @returns parsed response from UpdateFavoriteMutation
     */
    fetch(id: string, input: L.FavoriteUpdateInput): LinearFetch<FavoritePayload>;
}
/**
 * A fetchable FileUpload Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class FileUploadMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the FileUpload mutation and return a UploadPayload
     *
     * @param contentType - required contentType to pass to fileUpload
     * @param filename - required filename to pass to fileUpload
     * @param size - required size to pass to fileUpload
     * @param variables - variables without 'contentType', 'filename', 'size' to pass into the FileUploadMutation
     * @returns parsed response from FileUploadMutation
     */
    fetch(contentType: string, filename: string, size: number, variables?: Omit<L.FileUploadMutationVariables, "contentType" | "filename" | "size">): LinearFetch<UploadPayload>;
}
/**
 * A fetchable CreateGitAutomationState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateGitAutomationStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateGitAutomationState mutation and return a GitAutomationStatePayload
     *
     * @param input - required input to pass to createGitAutomationState
     * @returns parsed response from CreateGitAutomationStateMutation
     */
    fetch(input: L.GitAutomationStateCreateInput): LinearFetch<GitAutomationStatePayload>;
}
/**
 * A fetchable DeleteGitAutomationState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteGitAutomationStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteGitAutomationState mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteGitAutomationState
     * @returns parsed response from DeleteGitAutomationStateMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateGitAutomationState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateGitAutomationStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateGitAutomationState mutation and return a GitAutomationStatePayload
     *
     * @param id - required id to pass to updateGitAutomationState
     * @param input - required input to pass to updateGitAutomationState
     * @returns parsed response from UpdateGitAutomationStateMutation
     */
    fetch(id: string, input: L.GitAutomationStateUpdateInput): LinearFetch<GitAutomationStatePayload>;
}
/**
 * A fetchable CreateGitAutomationTargetBranch Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateGitAutomationTargetBranchMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateGitAutomationTargetBranch mutation and return a GitAutomationTargetBranchPayload
     *
     * @param input - required input to pass to createGitAutomationTargetBranch
     * @returns parsed response from CreateGitAutomationTargetBranchMutation
     */
    fetch(input: L.GitAutomationTargetBranchCreateInput): LinearFetch<GitAutomationTargetBranchPayload>;
}
/**
 * A fetchable DeleteGitAutomationTargetBranch Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteGitAutomationTargetBranchMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteGitAutomationTargetBranch mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteGitAutomationTargetBranch
     * @returns parsed response from DeleteGitAutomationTargetBranchMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateGitAutomationTargetBranch Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateGitAutomationTargetBranchMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateGitAutomationTargetBranch mutation and return a GitAutomationTargetBranchPayload
     *
     * @param id - required id to pass to updateGitAutomationTargetBranch
     * @param input - required input to pass to updateGitAutomationTargetBranch
     * @returns parsed response from UpdateGitAutomationTargetBranchMutation
     */
    fetch(id: string, input: L.GitAutomationTargetBranchUpdateInput): LinearFetch<GitAutomationTargetBranchPayload>;
}
/**
 * A fetchable GoogleUserAccountAuth Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class GoogleUserAccountAuthMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the GoogleUserAccountAuth mutation and return a AuthResolverResponse
     *
     * @param input - required input to pass to googleUserAccountAuth
     * @returns parsed response from GoogleUserAccountAuthMutation
     */
    fetch(input: L.GoogleUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
}
/**
 * A fetchable ImageUploadFromUrl Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ImageUploadFromUrlMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ImageUploadFromUrl mutation and return a ImageUploadFromUrlPayload
     *
     * @param url - required url to pass to imageUploadFromUrl
     * @returns parsed response from ImageUploadFromUrlMutation
     */
    fetch(url: string): LinearFetch<ImageUploadFromUrlPayload>;
}
/**
 * A fetchable ImportFileUpload Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ImportFileUploadMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ImportFileUpload mutation and return a UploadPayload
     *
     * @param contentType - required contentType to pass to importFileUpload
     * @param filename - required filename to pass to importFileUpload
     * @param size - required size to pass to importFileUpload
     * @param variables - variables without 'contentType', 'filename', 'size' to pass into the ImportFileUploadMutation
     * @returns parsed response from ImportFileUploadMutation
     */
    fetch(contentType: string, filename: string, size: number, variables?: Omit<L.ImportFileUploadMutationVariables, "contentType" | "filename" | "size">): LinearFetch<UploadPayload>;
}
/**
 * A fetchable ArchiveInitiative Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveInitiativeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveInitiative mutation and return a InitiativeArchivePayload
     *
     * @param id - required id to pass to archiveInitiative
     * @returns parsed response from ArchiveInitiativeMutation
     */
    fetch(id: string): LinearFetch<InitiativeArchivePayload>;
}
/**
 * A fetchable CreateInitiative Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateInitiativeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateInitiative mutation and return a InitiativePayload
     *
     * @param input - required input to pass to createInitiative
     * @returns parsed response from CreateInitiativeMutation
     */
    fetch(input: L.InitiativeCreateInput): LinearFetch<InitiativePayload>;
}
/**
 * A fetchable DeleteInitiative Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteInitiativeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteInitiative mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteInitiative
     * @returns parsed response from DeleteInitiativeMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateInitiativeToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateInitiativeToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateInitiativeToProject mutation and return a InitiativeToProjectPayload
     *
     * @param input - required input to pass to createInitiativeToProject
     * @returns parsed response from CreateInitiativeToProjectMutation
     */
    fetch(input: L.InitiativeToProjectCreateInput): LinearFetch<InitiativeToProjectPayload>;
}
/**
 * A fetchable DeleteInitiativeToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteInitiativeToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteInitiativeToProject mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteInitiativeToProject
     * @returns parsed response from DeleteInitiativeToProjectMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateInitiativeToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateInitiativeToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateInitiativeToProject mutation and return a InitiativeToProjectPayload
     *
     * @param id - required id to pass to updateInitiativeToProject
     * @param input - required input to pass to updateInitiativeToProject
     * @returns parsed response from UpdateInitiativeToProjectMutation
     */
    fetch(id: string, input: L.InitiativeToProjectUpdateInput): LinearFetch<InitiativeToProjectPayload>;
}
/**
 * A fetchable UnarchiveInitiative Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveInitiativeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveInitiative mutation and return a InitiativeArchivePayload
     *
     * @param id - required id to pass to unarchiveInitiative
     * @returns parsed response from UnarchiveInitiativeMutation
     */
    fetch(id: string): LinearFetch<InitiativeArchivePayload>;
}
/**
 * A fetchable UpdateInitiative Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateInitiativeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateInitiative mutation and return a InitiativePayload
     *
     * @param id - required id to pass to updateInitiative
     * @param input - required input to pass to updateInitiative
     * @returns parsed response from UpdateInitiativeMutation
     */
    fetch(id: string, input: L.InitiativeUpdateInput): LinearFetch<InitiativePayload>;
}
/**
 * A fetchable ArchiveIntegration Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveIntegrationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveIntegration mutation and return a DeletePayload
     *
     * @param id - required id to pass to archiveIntegration
     * @returns parsed response from ArchiveIntegrationMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable IntegrationAsksConnectChannel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationAsksConnectChannelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationAsksConnectChannel mutation and return a AsksChannelConnectPayload
     *
     * @param code - required code to pass to integrationAsksConnectChannel
     * @param redirectUri - required redirectUri to pass to integrationAsksConnectChannel
     * @returns parsed response from IntegrationAsksConnectChannelMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<AsksChannelConnectPayload>;
}
/**
 * A fetchable DeleteIntegration Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIntegrationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIntegration mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteIntegration
     * @returns parsed response from DeleteIntegrationMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable IntegrationDiscord Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationDiscordMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationDiscord mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationDiscord
     * @param redirectUri - required redirectUri to pass to integrationDiscord
     * @returns parsed response from IntegrationDiscordMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationFigma Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationFigmaMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationFigma mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationFigma
     * @param redirectUri - required redirectUri to pass to integrationFigma
     * @returns parsed response from IntegrationFigmaMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationFront Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationFrontMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationFront mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationFront
     * @param redirectUri - required redirectUri to pass to integrationFront
     * @returns parsed response from IntegrationFrontMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationGitHubEnterpriseServerConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGitHubEnterpriseServerConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGitHubEnterpriseServerConnect mutation and return a GitHubEnterpriseServerPayload
     *
     * @param githubUrl - required githubUrl to pass to integrationGitHubEnterpriseServerConnect
     * @param variables - variables without 'githubUrl' to pass into the IntegrationGitHubEnterpriseServerConnectMutation
     * @returns parsed response from IntegrationGitHubEnterpriseServerConnectMutation
     */
    fetch(githubUrl: string, variables?: Omit<L.IntegrationGitHubEnterpriseServerConnectMutationVariables, "githubUrl">): LinearFetch<GitHubEnterpriseServerPayload>;
}
/**
 * A fetchable IntegrationGitHubPersonal Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGitHubPersonalMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGitHubPersonal mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationGitHubPersonal
     * @returns parsed response from IntegrationGitHubPersonalMutation
     */
    fetch(code: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable CreateIntegrationGithubCommit Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIntegrationGithubCommitMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIntegrationGithubCommit mutation and return a GitHubCommitIntegrationPayload
     *
     * @returns parsed response from CreateIntegrationGithubCommitMutation
     */
    fetch(): LinearFetch<GitHubCommitIntegrationPayload>;
}
/**
 * A fetchable IntegrationGithubConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGithubConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGithubConnect mutation and return a IntegrationPayload
     *
     * @param installationId - required installationId to pass to integrationGithubConnect
     * @returns parsed response from IntegrationGithubConnectMutation
     */
    fetch(installationId: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationGithubImportConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGithubImportConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGithubImportConnect mutation and return a IntegrationPayload
     *
     * @param installationId - required installationId to pass to integrationGithubImportConnect
     * @returns parsed response from IntegrationGithubImportConnectMutation
     */
    fetch(installationId: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationGitlabConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGitlabConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGitlabConnect mutation and return a GitLabIntegrationCreatePayload
     *
     * @param accessToken - required accessToken to pass to integrationGitlabConnect
     * @param gitlabUrl - required gitlabUrl to pass to integrationGitlabConnect
     * @returns parsed response from IntegrationGitlabConnectMutation
     */
    fetch(accessToken: string, gitlabUrl: string): LinearFetch<GitLabIntegrationCreatePayload>;
}
/**
 * A fetchable IntegrationGoogleSheets Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationGoogleSheetsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationGoogleSheets mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationGoogleSheets
     * @returns parsed response from IntegrationGoogleSheetsMutation
     */
    fetch(code: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationIntercom Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationIntercomMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationIntercom mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationIntercom
     * @param redirectUri - required redirectUri to pass to integrationIntercom
     * @param variables - variables without 'code', 'redirectUri' to pass into the IntegrationIntercomMutation
     * @returns parsed response from IntegrationIntercomMutation
     */
    fetch(code: string, redirectUri: string, variables?: Omit<L.IntegrationIntercomMutationVariables, "code" | "redirectUri">): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable DeleteIntegrationIntercom Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIntegrationIntercomMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIntegrationIntercom mutation and return a IntegrationPayload
     *
     * @returns parsed response from DeleteIntegrationIntercomMutation
     */
    fetch(): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable UpdateIntegrationIntercomSettings Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIntegrationIntercomSettingsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIntegrationIntercomSettings mutation and return a IntegrationPayload
     *
     * @param input - required input to pass to updateIntegrationIntercomSettings
     * @returns parsed response from UpdateIntegrationIntercomSettingsMutation
     */
    fetch(input: L.IntercomSettingsInput): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationJiraPersonal Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationJiraPersonalMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationJiraPersonal mutation and return a IntegrationPayload
     *
     * @param variables - variables to pass into the IntegrationJiraPersonalMutation
     * @returns parsed response from IntegrationJiraPersonalMutation
     */
    fetch(variables?: L.IntegrationJiraPersonalMutationVariables): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationLoom Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationLoomMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationLoom mutation and return a IntegrationPayload
     *
     * @returns parsed response from IntegrationLoomMutation
     */
    fetch(): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationRequest Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationRequestMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationRequest mutation and return a IntegrationRequestPayload
     *
     * @param input - required input to pass to integrationRequest
     * @returns parsed response from IntegrationRequestMutation
     */
    fetch(input: L.IntegrationRequestInput): LinearFetch<IntegrationRequestPayload>;
}
/**
 * A fetchable IntegrationSentryConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSentryConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSentryConnect mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationSentryConnect
     * @param installationId - required installationId to pass to integrationSentryConnect
     * @param organizationSlug - required organizationSlug to pass to integrationSentryConnect
     * @returns parsed response from IntegrationSentryConnectMutation
     */
    fetch(code: string, installationId: string, organizationSlug: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationSlack Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlack mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationSlack
     * @param redirectUri - required redirectUri to pass to integrationSlack
     * @param variables - variables without 'code', 'redirectUri' to pass into the IntegrationSlackMutation
     * @returns parsed response from IntegrationSlackMutation
     */
    fetch(code: string, redirectUri: string, variables?: Omit<L.IntegrationSlackMutationVariables, "code" | "redirectUri">): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationSlackAsks Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackAsksMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackAsks mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationSlackAsks
     * @param redirectUri - required redirectUri to pass to integrationSlackAsks
     * @returns parsed response from IntegrationSlackAsksMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationSlackCustomViewNotifications Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackCustomViewNotificationsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackCustomViewNotifications mutation and return a SlackChannelConnectPayload
     *
     * @param code - required code to pass to integrationSlackCustomViewNotifications
     * @param customViewId - required customViewId to pass to integrationSlackCustomViewNotifications
     * @param redirectUri - required redirectUri to pass to integrationSlackCustomViewNotifications
     * @returns parsed response from IntegrationSlackCustomViewNotificationsMutation
     */
    fetch(code: string, customViewId: string, redirectUri: string): LinearFetch<SlackChannelConnectPayload>;
}
/**
 * A fetchable IntegrationSlackImportEmojis Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackImportEmojisMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackImportEmojis mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationSlackImportEmojis
     * @param redirectUri - required redirectUri to pass to integrationSlackImportEmojis
     * @returns parsed response from IntegrationSlackImportEmojisMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationSlackOrgProjectUpdatesPost Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackOrgProjectUpdatesPostMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackOrgProjectUpdatesPost mutation and return a SlackChannelConnectPayload
     *
     * @param code - required code to pass to integrationSlackOrgProjectUpdatesPost
     * @param redirectUri - required redirectUri to pass to integrationSlackOrgProjectUpdatesPost
     * @returns parsed response from IntegrationSlackOrgProjectUpdatesPostMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<SlackChannelConnectPayload>;
}
/**
 * A fetchable IntegrationSlackPersonal Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackPersonalMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackPersonal mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationSlackPersonal
     * @param redirectUri - required redirectUri to pass to integrationSlackPersonal
     * @returns parsed response from IntegrationSlackPersonalMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable IntegrationSlackPost Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackPostMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackPost mutation and return a SlackChannelConnectPayload
     *
     * @param code - required code to pass to integrationSlackPost
     * @param redirectUri - required redirectUri to pass to integrationSlackPost
     * @param teamId - required teamId to pass to integrationSlackPost
     * @param variables - variables without 'code', 'redirectUri', 'teamId' to pass into the IntegrationSlackPostMutation
     * @returns parsed response from IntegrationSlackPostMutation
     */
    fetch(code: string, redirectUri: string, teamId: string, variables?: Omit<L.IntegrationSlackPostMutationVariables, "code" | "redirectUri" | "teamId">): LinearFetch<SlackChannelConnectPayload>;
}
/**
 * A fetchable IntegrationSlackProjectPost Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationSlackProjectPostMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationSlackProjectPost mutation and return a SlackChannelConnectPayload
     *
     * @param code - required code to pass to integrationSlackProjectPost
     * @param projectId - required projectId to pass to integrationSlackProjectPost
     * @param redirectUri - required redirectUri to pass to integrationSlackProjectPost
     * @param service - required service to pass to integrationSlackProjectPost
     * @returns parsed response from IntegrationSlackProjectPostMutation
     */
    fetch(code: string, projectId: string, redirectUri: string, service: string): LinearFetch<SlackChannelConnectPayload>;
}
/**
 * A fetchable CreateIntegrationTemplate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIntegrationTemplateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIntegrationTemplate mutation and return a IntegrationTemplatePayload
     *
     * @param input - required input to pass to createIntegrationTemplate
     * @returns parsed response from CreateIntegrationTemplateMutation
     */
    fetch(input: L.IntegrationTemplateCreateInput): LinearFetch<IntegrationTemplatePayload>;
}
/**
 * A fetchable DeleteIntegrationTemplate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIntegrationTemplateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIntegrationTemplate mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteIntegrationTemplate
     * @returns parsed response from DeleteIntegrationTemplateMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable IntegrationZendesk Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IntegrationZendeskMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IntegrationZendesk mutation and return a IntegrationPayload
     *
     * @param code - required code to pass to integrationZendesk
     * @param redirectUri - required redirectUri to pass to integrationZendesk
     * @param scope - required scope to pass to integrationZendesk
     * @param subdomain - required subdomain to pass to integrationZendesk
     * @returns parsed response from IntegrationZendeskMutation
     */
    fetch(code: string, redirectUri: string, scope: string, subdomain: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable CreateIntegrationsSettings Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIntegrationsSettingsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIntegrationsSettings mutation and return a IntegrationsSettingsPayload
     *
     * @param input - required input to pass to createIntegrationsSettings
     * @returns parsed response from CreateIntegrationsSettingsMutation
     */
    fetch(input: L.IntegrationsSettingsCreateInput): LinearFetch<IntegrationsSettingsPayload>;
}
/**
 * A fetchable UpdateIntegrationsSettings Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIntegrationsSettingsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIntegrationsSettings mutation and return a IntegrationsSettingsPayload
     *
     * @param id - required id to pass to updateIntegrationsSettings
     * @param input - required input to pass to updateIntegrationsSettings
     * @returns parsed response from UpdateIntegrationsSettingsMutation
     */
    fetch(id: string, input: L.IntegrationsSettingsUpdateInput): LinearFetch<IntegrationsSettingsPayload>;
}
/**
 * A fetchable IssueAddLabel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueAddLabelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueAddLabel mutation and return a IssuePayload
     *
     * @param id - required id to pass to issueAddLabel
     * @param labelId - required labelId to pass to issueAddLabel
     * @returns parsed response from IssueAddLabelMutation
     */
    fetch(id: string, labelId: string): LinearFetch<IssuePayload>;
}
/**
 * A fetchable ArchiveIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveIssue mutation and return a IssueArchivePayload
     *
     * @param id - required id to pass to archiveIssue
     * @param variables - variables without 'id' to pass into the ArchiveIssueMutation
     * @returns parsed response from ArchiveIssueMutation
     */
    fetch(id: string, variables?: Omit<L.ArchiveIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
}
/**
 * A fetchable UpdateIssueBatch Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueBatchMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssueBatch mutation and return a IssueBatchPayload
     *
     * @param ids - required ids to pass to updateIssueBatch
     * @param input - required input to pass to updateIssueBatch
     * @returns parsed response from UpdateIssueBatchMutation
     */
    fetch(ids: L.Scalars["UUID"][], input: L.IssueUpdateInput): LinearFetch<IssueBatchPayload>;
}
/**
 * A fetchable CreateIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIssue mutation and return a IssuePayload
     *
     * @param input - required input to pass to createIssue
     * @returns parsed response from CreateIssueMutation
     */
    fetch(input: L.IssueCreateInput): LinearFetch<IssuePayload>;
}
/**
 * A fetchable DeleteIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIssue mutation and return a IssueArchivePayload
     *
     * @param id - required id to pass to deleteIssue
     * @param variables - variables without 'id' to pass into the DeleteIssueMutation
     * @returns parsed response from DeleteIssueMutation
     */
    fetch(id: string, variables?: Omit<L.DeleteIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
}
/**
 * A fetchable ArchiveIssueDraft Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveIssueDraftMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveIssueDraft mutation and return a IssueDraftArchivePayload
     *
     * @param id - required id to pass to archiveIssueDraft
     * @returns parsed response from ArchiveIssueDraftMutation
     */
    fetch(id: string): LinearFetch<IssueDraftArchivePayload>;
}
/**
 * A fetchable CreateIssueDraft Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIssueDraftMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIssueDraft mutation and return a IssueDraftPayload
     *
     * @param input - required input to pass to createIssueDraft
     * @returns parsed response from CreateIssueDraftMutation
     */
    fetch(input: L.IssueDraftCreateInput): LinearFetch<IssueDraftPayload>;
}
/**
 * A fetchable DeleteIssueDraft Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIssueDraftMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIssueDraft mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteIssueDraft
     * @returns parsed response from DeleteIssueDraftMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateIssueDraft Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueDraftMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssueDraft mutation and return a IssueDraftPayload
     *
     * @param id - required id to pass to updateIssueDraft
     * @param input - required input to pass to updateIssueDraft
     * @returns parsed response from UpdateIssueDraftMutation
     */
    fetch(id: string, input: L.IssueDraftUpdateInput): LinearFetch<IssueDraftPayload>;
}
/**
 * A fetchable IssueImportCreateAsana Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCreateAsanaMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCreateAsana mutation and return a IssueImportPayload
     *
     * @param asanaTeamName - required asanaTeamName to pass to issueImportCreateAsana
     * @param asanaToken - required asanaToken to pass to issueImportCreateAsana
     * @param variables - variables without 'asanaTeamName', 'asanaToken' to pass into the IssueImportCreateAsanaMutation
     * @returns parsed response from IssueImportCreateAsanaMutation
     */
    fetch(asanaTeamName: string, asanaToken: string, variables?: Omit<L.IssueImportCreateAsanaMutationVariables, "asanaTeamName" | "asanaToken">): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable IssueImportCreateCsvJira Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCreateCsvJiraMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCreateCsvJira mutation and return a IssueImportPayload
     *
     * @param csvUrl - required csvUrl to pass to issueImportCreateCSVJira
     * @param variables - variables without 'csvUrl' to pass into the IssueImportCreateCsvJiraMutation
     * @returns parsed response from IssueImportCreateCsvJiraMutation
     */
    fetch(csvUrl: string, variables?: Omit<L.IssueImportCreateCsvJiraMutationVariables, "csvUrl">): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable IssueImportCreateClubhouse Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCreateClubhouseMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCreateClubhouse mutation and return a IssueImportPayload
     *
     * @param clubhouseGroupName - required clubhouseGroupName to pass to issueImportCreateClubhouse
     * @param clubhouseToken - required clubhouseToken to pass to issueImportCreateClubhouse
     * @param variables - variables without 'clubhouseGroupName', 'clubhouseToken' to pass into the IssueImportCreateClubhouseMutation
     * @returns parsed response from IssueImportCreateClubhouseMutation
     */
    fetch(clubhouseGroupName: string, clubhouseToken: string, variables?: Omit<L.IssueImportCreateClubhouseMutationVariables, "clubhouseGroupName" | "clubhouseToken">): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable IssueImportCreateGithub Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCreateGithubMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCreateGithub mutation and return a IssueImportPayload
     *
     * @param variables - variables to pass into the IssueImportCreateGithubMutation
     * @returns parsed response from IssueImportCreateGithubMutation
     */
    fetch(variables?: L.IssueImportCreateGithubMutationVariables): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable IssueImportCreateJira Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportCreateJiraMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportCreateJira mutation and return a IssueImportPayload
     *
     * @param jiraEmail - required jiraEmail to pass to issueImportCreateJira
     * @param jiraHostname - required jiraHostname to pass to issueImportCreateJira
     * @param jiraProject - required jiraProject to pass to issueImportCreateJira
     * @param jiraToken - required jiraToken to pass to issueImportCreateJira
     * @param variables - variables without 'jiraEmail', 'jiraHostname', 'jiraProject', 'jiraToken' to pass into the IssueImportCreateJiraMutation
     * @returns parsed response from IssueImportCreateJiraMutation
     */
    fetch(jiraEmail: string, jiraHostname: string, jiraProject: string, jiraToken: string, variables?: Omit<L.IssueImportCreateJiraMutationVariables, "jiraEmail" | "jiraHostname" | "jiraProject" | "jiraToken">): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable DeleteIssueImport Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIssueImportMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIssueImport mutation and return a IssueImportDeletePayload
     *
     * @param issueImportId - required issueImportId to pass to deleteIssueImport
     * @returns parsed response from DeleteIssueImportMutation
     */
    fetch(issueImportId: string): LinearFetch<IssueImportDeletePayload>;
}
/**
 * A fetchable IssueImportProcess Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueImportProcessMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueImportProcess mutation and return a IssueImportPayload
     *
     * @param issueImportId - required issueImportId to pass to issueImportProcess
     * @param mapping - required mapping to pass to issueImportProcess
     * @returns parsed response from IssueImportProcessMutation
     */
    fetch(issueImportId: string, mapping: L.Scalars["JSONObject"]): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable UpdateIssueImport Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueImportMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssueImport mutation and return a IssueImportPayload
     *
     * @param id - required id to pass to updateIssueImport
     * @param input - required input to pass to updateIssueImport
     * @returns parsed response from UpdateIssueImportMutation
     */
    fetch(id: string, input: L.IssueImportUpdateInput): LinearFetch<IssueImportPayload>;
}
/**
 * A fetchable CreateIssueLabel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIssueLabelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIssueLabel mutation and return a IssueLabelPayload
     *
     * @param input - required input to pass to createIssueLabel
     * @param variables - variables without 'input' to pass into the CreateIssueLabelMutation
     * @returns parsed response from CreateIssueLabelMutation
     */
    fetch(input: L.IssueLabelCreateInput, variables?: Omit<L.CreateIssueLabelMutationVariables, "input">): LinearFetch<IssueLabelPayload>;
}
/**
 * A fetchable DeleteIssueLabel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIssueLabelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIssueLabel mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteIssueLabel
     * @returns parsed response from DeleteIssueLabelMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateIssueLabel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueLabelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssueLabel mutation and return a IssueLabelPayload
     *
     * @param id - required id to pass to updateIssueLabel
     * @param input - required input to pass to updateIssueLabel
     * @param variables - variables without 'id', 'input' to pass into the UpdateIssueLabelMutation
     * @returns parsed response from UpdateIssueLabelMutation
     */
    fetch(id: string, input: L.IssueLabelUpdateInput, variables?: Omit<L.UpdateIssueLabelMutationVariables, "id" | "input">): LinearFetch<IssueLabelPayload>;
}
/**
 * A fetchable CreateIssueRelation Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateIssueRelationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateIssueRelation mutation and return a IssueRelationPayload
     *
     * @param input - required input to pass to createIssueRelation
     * @param variables - variables without 'input' to pass into the CreateIssueRelationMutation
     * @returns parsed response from CreateIssueRelationMutation
     */
    fetch(input: L.IssueRelationCreateInput, variables?: Omit<L.CreateIssueRelationMutationVariables, "input">): LinearFetch<IssueRelationPayload>;
}
/**
 * A fetchable DeleteIssueRelation Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteIssueRelationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteIssueRelation mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteIssueRelation
     * @returns parsed response from DeleteIssueRelationMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateIssueRelation Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueRelationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssueRelation mutation and return a IssueRelationPayload
     *
     * @param id - required id to pass to updateIssueRelation
     * @param input - required input to pass to updateIssueRelation
     * @returns parsed response from UpdateIssueRelationMutation
     */
    fetch(id: string, input: L.IssueRelationUpdateInput): LinearFetch<IssueRelationPayload>;
}
/**
 * A fetchable IssueReminder Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueReminderMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueReminder mutation and return a IssuePayload
     *
     * @param id - required id to pass to issueReminder
     * @param reminderAt - required reminderAt to pass to issueReminder
     * @returns parsed response from IssueReminderMutation
     */
    fetch(id: string, reminderAt: Date): LinearFetch<IssuePayload>;
}
/**
 * A fetchable IssueRemoveLabel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueRemoveLabelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueRemoveLabel mutation and return a IssuePayload
     *
     * @param id - required id to pass to issueRemoveLabel
     * @param labelId - required labelId to pass to issueRemoveLabel
     * @returns parsed response from IssueRemoveLabelMutation
     */
    fetch(id: string, labelId: string): LinearFetch<IssuePayload>;
}
/**
 * A fetchable IssueSubscribe Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueSubscribeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueSubscribe mutation and return a IssuePayload
     *
     * @param id - required id to pass to issueSubscribe
     * @param variables - variables without 'id' to pass into the IssueSubscribeMutation
     * @returns parsed response from IssueSubscribeMutation
     */
    fetch(id: string, variables?: Omit<L.IssueSubscribeMutationVariables, "id">): LinearFetch<IssuePayload>;
}
/**
 * A fetchable UnarchiveIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveIssue mutation and return a IssueArchivePayload
     *
     * @param id - required id to pass to unarchiveIssue
     * @returns parsed response from UnarchiveIssueMutation
     */
    fetch(id: string): LinearFetch<IssueArchivePayload>;
}
/**
 * A fetchable IssueUnsubscribe Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class IssueUnsubscribeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the IssueUnsubscribe mutation and return a IssuePayload
     *
     * @param id - required id to pass to issueUnsubscribe
     * @param variables - variables without 'id' to pass into the IssueUnsubscribeMutation
     * @returns parsed response from IssueUnsubscribeMutation
     */
    fetch(id: string, variables?: Omit<L.IssueUnsubscribeMutationVariables, "id">): LinearFetch<IssuePayload>;
}
/**
 * A fetchable UpdateIssue Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateIssueMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateIssue mutation and return a IssuePayload
     *
     * @param id - required id to pass to updateIssue
     * @param input - required input to pass to updateIssue
     * @returns parsed response from UpdateIssueMutation
     */
    fetch(id: string, input: L.IssueUpdateInput): LinearFetch<IssuePayload>;
}
/**
 * A fetchable JoinOrganizationFromOnboarding Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class JoinOrganizationFromOnboardingMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the JoinOrganizationFromOnboarding mutation and return a CreateOrJoinOrganizationResponse
     *
     * @param input - required input to pass to joinOrganizationFromOnboarding
     * @returns parsed response from JoinOrganizationFromOnboardingMutation
     */
    fetch(input: L.JoinOrganizationInput): LinearFetch<CreateOrJoinOrganizationResponse>;
}
/**
 * A fetchable LeaveOrganization Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class LeaveOrganizationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the LeaveOrganization mutation and return a CreateOrJoinOrganizationResponse
     *
     * @param organizationId - required organizationId to pass to leaveOrganization
     * @returns parsed response from LeaveOrganizationMutation
     */
    fetch(organizationId: string): LinearFetch<CreateOrJoinOrganizationResponse>;
}
/**
 * A fetchable Logout Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class LogoutMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Logout mutation and return a LogoutResponse
     *
     * @returns parsed response from LogoutMutation
     */
    fetch(): LinearFetch<LogoutResponse>;
}
/**
 * A fetchable LogoutAllSessions Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class LogoutAllSessionsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the LogoutAllSessions mutation and return a LogoutResponse
     *
     * @returns parsed response from LogoutAllSessionsMutation
     */
    fetch(): LinearFetch<LogoutResponse>;
}
/**
 * A fetchable LogoutOtherSessions Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class LogoutOtherSessionsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the LogoutOtherSessions mutation and return a LogoutResponse
     *
     * @returns parsed response from LogoutOtherSessionsMutation
     */
    fetch(): LinearFetch<LogoutResponse>;
}
/**
 * A fetchable LogoutSession Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class LogoutSessionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the LogoutSession mutation and return a LogoutResponse
     *
     * @param sessionId - required sessionId to pass to logoutSession
     * @returns parsed response from LogoutSessionMutation
     */
    fetch(sessionId: string): LinearFetch<LogoutResponse>;
}
/**
 * A fetchable ArchiveNotification Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveNotificationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveNotification mutation and return a NotificationArchivePayload
     *
     * @param id - required id to pass to archiveNotification
     * @returns parsed response from ArchiveNotificationMutation
     */
    fetch(id: string): LinearFetch<NotificationArchivePayload>;
}
/**
 * A fetchable NotificationArchiveAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationArchiveAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationArchiveAll mutation and return a NotificationBatchActionPayload
     *
     * @param input - required input to pass to notificationArchiveAll
     * @returns parsed response from NotificationArchiveAllMutation
     */
    fetch(input: L.NotificationEntityInput): LinearFetch<NotificationBatchActionPayload>;
}
/**
 * A fetchable NotificationMarkReadAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationMarkReadAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationMarkReadAll mutation and return a NotificationBatchActionPayload
     *
     * @param input - required input to pass to notificationMarkReadAll
     * @param readAt - required readAt to pass to notificationMarkReadAll
     * @returns parsed response from NotificationMarkReadAllMutation
     */
    fetch(input: L.NotificationEntityInput, readAt: Date): LinearFetch<NotificationBatchActionPayload>;
}
/**
 * A fetchable NotificationMarkUnreadAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationMarkUnreadAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationMarkUnreadAll mutation and return a NotificationBatchActionPayload
     *
     * @param input - required input to pass to notificationMarkUnreadAll
     * @returns parsed response from NotificationMarkUnreadAllMutation
     */
    fetch(input: L.NotificationEntityInput): LinearFetch<NotificationBatchActionPayload>;
}
/**
 * A fetchable NotificationSnoozeAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationSnoozeAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationSnoozeAll mutation and return a NotificationBatchActionPayload
     *
     * @param input - required input to pass to notificationSnoozeAll
     * @param snoozedUntilAt - required snoozedUntilAt to pass to notificationSnoozeAll
     * @returns parsed response from NotificationSnoozeAllMutation
     */
    fetch(input: L.NotificationEntityInput, snoozedUntilAt: Date): LinearFetch<NotificationBatchActionPayload>;
}
/**
 * A fetchable CreateNotificationSubscription Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateNotificationSubscriptionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateNotificationSubscription mutation and return a NotificationSubscriptionPayload
     *
     * @param input - required input to pass to createNotificationSubscription
     * @returns parsed response from CreateNotificationSubscriptionMutation
     */
    fetch(input: L.NotificationSubscriptionCreateInput): LinearFetch<NotificationSubscriptionPayload>;
}
/**
 * A fetchable DeleteNotificationSubscription Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteNotificationSubscriptionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteNotificationSubscription mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteNotificationSubscription
     * @returns parsed response from DeleteNotificationSubscriptionMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateNotificationSubscription Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateNotificationSubscriptionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateNotificationSubscription mutation and return a NotificationSubscriptionPayload
     *
     * @param id - required id to pass to updateNotificationSubscription
     * @param input - required input to pass to updateNotificationSubscription
     * @returns parsed response from UpdateNotificationSubscriptionMutation
     */
    fetch(id: string, input: L.NotificationSubscriptionUpdateInput): LinearFetch<NotificationSubscriptionPayload>;
}
/**
 * A fetchable UnarchiveNotification Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveNotificationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveNotification mutation and return a NotificationArchivePayload
     *
     * @param id - required id to pass to unarchiveNotification
     * @returns parsed response from UnarchiveNotificationMutation
     */
    fetch(id: string): LinearFetch<NotificationArchivePayload>;
}
/**
 * A fetchable NotificationUnsnoozeAll Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class NotificationUnsnoozeAllMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the NotificationUnsnoozeAll mutation and return a NotificationBatchActionPayload
     *
     * @param input - required input to pass to notificationUnsnoozeAll
     * @param unsnoozedAt - required unsnoozedAt to pass to notificationUnsnoozeAll
     * @returns parsed response from NotificationUnsnoozeAllMutation
     */
    fetch(input: L.NotificationEntityInput, unsnoozedAt: Date): LinearFetch<NotificationBatchActionPayload>;
}
/**
 * A fetchable UpdateNotification Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateNotificationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateNotification mutation and return a NotificationPayload
     *
     * @param id - required id to pass to updateNotification
     * @param input - required input to pass to updateNotification
     * @returns parsed response from UpdateNotificationMutation
     */
    fetch(id: string, input: L.NotificationUpdateInput): LinearFetch<NotificationPayload>;
}
/**
 * A fetchable DeleteOrganizationCancel Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteOrganizationCancelMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteOrganizationCancel mutation and return a OrganizationCancelDeletePayload
     *
     * @returns parsed response from DeleteOrganizationCancelMutation
     */
    fetch(): LinearFetch<OrganizationCancelDeletePayload>;
}
/**
 * A fetchable DeleteOrganization Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteOrganizationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteOrganization mutation and return a OrganizationDeletePayload
     *
     * @param input - required input to pass to deleteOrganization
     * @returns parsed response from DeleteOrganizationMutation
     */
    fetch(input: L.DeleteOrganizationInput): LinearFetch<OrganizationDeletePayload>;
}
/**
 * A fetchable OrganizationDeleteChallenge Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationDeleteChallengeMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the OrganizationDeleteChallenge mutation and return a OrganizationDeletePayload
     *
     * @returns parsed response from OrganizationDeleteChallengeMutation
     */
    fetch(): LinearFetch<OrganizationDeletePayload>;
}
/**
 * A fetchable DeleteOrganizationDomain Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteOrganizationDomainMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteOrganizationDomain mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteOrganizationDomain
     * @returns parsed response from DeleteOrganizationDomainMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateOrganizationInvite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateOrganizationInviteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateOrganizationInvite mutation and return a OrganizationInvitePayload
     *
     * @param input - required input to pass to createOrganizationInvite
     * @returns parsed response from CreateOrganizationInviteMutation
     */
    fetch(input: L.OrganizationInviteCreateInput): LinearFetch<OrganizationInvitePayload>;
}
/**
 * A fetchable DeleteOrganizationInvite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteOrganizationInviteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteOrganizationInvite mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteOrganizationInvite
     * @returns parsed response from DeleteOrganizationInviteMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateOrganizationInvite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateOrganizationInviteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateOrganizationInvite mutation and return a OrganizationInvitePayload
     *
     * @param id - required id to pass to updateOrganizationInvite
     * @param input - required input to pass to updateOrganizationInvite
     * @returns parsed response from UpdateOrganizationInviteMutation
     */
    fetch(id: string, input: L.OrganizationInviteUpdateInput): LinearFetch<OrganizationInvitePayload>;
}
/**
 * A fetchable OrganizationStartTrial Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class OrganizationStartTrialMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the OrganizationStartTrial mutation and return a OrganizationStartTrialPayload
     *
     * @returns parsed response from OrganizationStartTrialMutation
     */
    fetch(): LinearFetch<OrganizationStartTrialPayload>;
}
/**
 * A fetchable UpdateOrganization Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateOrganizationMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateOrganization mutation and return a OrganizationPayload
     *
     * @param input - required input to pass to updateOrganization
     * @returns parsed response from UpdateOrganizationMutation
     */
    fetch(input: L.OrganizationUpdateInput): LinearFetch<OrganizationPayload>;
}
/**
 * A fetchable ArchiveProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveProject mutation and return a ProjectArchivePayload
     *
     * @param id - required id to pass to archiveProject
     * @param variables - variables without 'id' to pass into the ArchiveProjectMutation
     * @returns parsed response from ArchiveProjectMutation
     */
    fetch(id: string, variables?: Omit<L.ArchiveProjectMutationVariables, "id">): LinearFetch<ProjectArchivePayload>;
}
/**
 * A fetchable CreateProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProject mutation and return a ProjectPayload
     *
     * @param input - required input to pass to createProject
     * @param variables - variables without 'input' to pass into the CreateProjectMutation
     * @returns parsed response from CreateProjectMutation
     */
    fetch(input: L.ProjectCreateInput, variables?: Omit<L.CreateProjectMutationVariables, "input">): LinearFetch<ProjectPayload>;
}
/**
 * A fetchable DeleteProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteProject mutation and return a ProjectArchivePayload
     *
     * @param id - required id to pass to deleteProject
     * @returns parsed response from DeleteProjectMutation
     */
    fetch(id: string): LinearFetch<ProjectArchivePayload>;
}
/**
 * A fetchable CreateProjectLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProjectLink mutation and return a ProjectLinkPayload
     *
     * @param input - required input to pass to createProjectLink
     * @returns parsed response from CreateProjectLinkMutation
     */
    fetch(input: L.ProjectLinkCreateInput): LinearFetch<ProjectLinkPayload>;
}
/**
 * A fetchable DeleteProjectLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteProjectLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteProjectLink mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteProjectLink
     * @returns parsed response from DeleteProjectLinkMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateProjectLink Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateProjectLinkMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateProjectLink mutation and return a ProjectLinkPayload
     *
     * @param id - required id to pass to updateProjectLink
     * @param input - required input to pass to updateProjectLink
     * @returns parsed response from UpdateProjectLinkMutation
     */
    fetch(id: string, input: L.ProjectLinkUpdateInput): LinearFetch<ProjectLinkPayload>;
}
/**
 * A fetchable CreateProjectMilestone Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectMilestoneMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProjectMilestone mutation and return a ProjectMilestonePayload
     *
     * @param input - required input to pass to createProjectMilestone
     * @returns parsed response from CreateProjectMilestoneMutation
     */
    fetch(input: L.ProjectMilestoneCreateInput): LinearFetch<ProjectMilestonePayload>;
}
/**
 * A fetchable DeleteProjectMilestone Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteProjectMilestoneMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteProjectMilestone mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteProjectMilestone
     * @returns parsed response from DeleteProjectMilestoneMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateProjectMilestone Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateProjectMilestoneMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateProjectMilestone mutation and return a ProjectMilestonePayload
     *
     * @param id - required id to pass to updateProjectMilestone
     * @param input - required input to pass to updateProjectMilestone
     * @returns parsed response from UpdateProjectMilestoneMutation
     */
    fetch(id: string, input: L.ProjectMilestoneUpdateInput): LinearFetch<ProjectMilestonePayload>;
}
/**
 * A fetchable UnarchiveProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveProject mutation and return a ProjectArchivePayload
     *
     * @param id - required id to pass to unarchiveProject
     * @returns parsed response from UnarchiveProjectMutation
     */
    fetch(id: string): LinearFetch<ProjectArchivePayload>;
}
/**
 * A fetchable UpdateProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateProject mutation and return a ProjectPayload
     *
     * @param id - required id to pass to updateProject
     * @param input - required input to pass to updateProject
     * @returns parsed response from UpdateProjectMutation
     */
    fetch(id: string, input: L.ProjectUpdateInput): LinearFetch<ProjectPayload>;
}
/**
 * A fetchable CreateProjectUpdate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectUpdateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProjectUpdate mutation and return a ProjectUpdatePayload
     *
     * @param input - required input to pass to createProjectUpdate
     * @returns parsed response from CreateProjectUpdateMutation
     */
    fetch(input: L.ProjectUpdateCreateInput): LinearFetch<ProjectUpdatePayload>;
}
/**
 * A fetchable DeleteProjectUpdate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteProjectUpdateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteProjectUpdate mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteProjectUpdate
     * @returns parsed response from DeleteProjectUpdateMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateProjectUpdateInteraction Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateProjectUpdateInteractionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateProjectUpdateInteraction mutation and return a ProjectUpdateInteractionPayload
     *
     * @param input - required input to pass to createProjectUpdateInteraction
     * @returns parsed response from CreateProjectUpdateInteractionMutation
     */
    fetch(input: L.ProjectUpdateInteractionCreateInput): LinearFetch<ProjectUpdateInteractionPayload>;
}
/**
 * A fetchable ProjectUpdateMarkAsRead Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ProjectUpdateMarkAsReadMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ProjectUpdateMarkAsRead mutation and return a ProjectUpdateWithInteractionPayload
     *
     * @param id - required id to pass to projectUpdateMarkAsRead
     * @returns parsed response from ProjectUpdateMarkAsReadMutation
     */
    fetch(id: string): LinearFetch<ProjectUpdateWithInteractionPayload>;
}
/**
 * A fetchable UpdateProjectUpdate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateProjectUpdateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateProjectUpdate mutation and return a ProjectUpdatePayload
     *
     * @param id - required id to pass to updateProjectUpdate
     * @param input - required input to pass to updateProjectUpdate
     * @returns parsed response from UpdateProjectUpdateMutation
     */
    fetch(id: string, input: L.ProjectUpdateUpdateInput): LinearFetch<ProjectUpdatePayload>;
}
/**
 * A fetchable CreatePushSubscription Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreatePushSubscriptionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreatePushSubscription mutation and return a PushSubscriptionPayload
     *
     * @param input - required input to pass to createPushSubscription
     * @returns parsed response from CreatePushSubscriptionMutation
     */
    fetch(input: L.PushSubscriptionCreateInput): LinearFetch<PushSubscriptionPayload>;
}
/**
 * A fetchable DeletePushSubscription Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeletePushSubscriptionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeletePushSubscription mutation and return a PushSubscriptionPayload
     *
     * @param id - required id to pass to deletePushSubscription
     * @returns parsed response from DeletePushSubscriptionMutation
     */
    fetch(id: string): LinearFetch<PushSubscriptionPayload>;
}
/**
 * A fetchable CreateReaction Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateReactionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateReaction mutation and return a ReactionPayload
     *
     * @param input - required input to pass to createReaction
     * @returns parsed response from CreateReactionMutation
     */
    fetch(input: L.ReactionCreateInput): LinearFetch<ReactionPayload>;
}
/**
 * A fetchable DeleteReaction Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteReactionMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteReaction mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteReaction
     * @returns parsed response from DeleteReactionMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable RefreshGoogleSheetsData Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class RefreshGoogleSheetsDataMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the RefreshGoogleSheetsData mutation and return a IntegrationPayload
     *
     * @param id - required id to pass to refreshGoogleSheetsData
     * @returns parsed response from RefreshGoogleSheetsDataMutation
     */
    fetch(id: string): LinearFetch<IntegrationPayload>;
}
/**
 * A fetchable ResendOrganizationInvite Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ResendOrganizationInviteMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ResendOrganizationInvite mutation and return a DeletePayload
     *
     * @param id - required id to pass to resendOrganizationInvite
     * @returns parsed response from ResendOrganizationInviteMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable ArchiveRoadmap Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveRoadmapMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveRoadmap mutation and return a RoadmapArchivePayload
     *
     * @param id - required id to pass to archiveRoadmap
     * @returns parsed response from ArchiveRoadmapMutation
     */
    fetch(id: string): LinearFetch<RoadmapArchivePayload>;
}
/**
 * A fetchable CreateRoadmap Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateRoadmapMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateRoadmap mutation and return a RoadmapPayload
     *
     * @param input - required input to pass to createRoadmap
     * @returns parsed response from CreateRoadmapMutation
     */
    fetch(input: L.RoadmapCreateInput): LinearFetch<RoadmapPayload>;
}
/**
 * A fetchable DeleteRoadmap Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteRoadmapMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteRoadmap mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteRoadmap
     * @returns parsed response from DeleteRoadmapMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateRoadmapToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateRoadmapToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateRoadmapToProject mutation and return a RoadmapToProjectPayload
     *
     * @param input - required input to pass to createRoadmapToProject
     * @returns parsed response from CreateRoadmapToProjectMutation
     */
    fetch(input: L.RoadmapToProjectCreateInput): LinearFetch<RoadmapToProjectPayload>;
}
/**
 * A fetchable DeleteRoadmapToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteRoadmapToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteRoadmapToProject mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteRoadmapToProject
     * @returns parsed response from DeleteRoadmapToProjectMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateRoadmapToProject Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateRoadmapToProjectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateRoadmapToProject mutation and return a RoadmapToProjectPayload
     *
     * @param id - required id to pass to updateRoadmapToProject
     * @param input - required input to pass to updateRoadmapToProject
     * @returns parsed response from UpdateRoadmapToProjectMutation
     */
    fetch(id: string, input: L.RoadmapToProjectUpdateInput): LinearFetch<RoadmapToProjectPayload>;
}
/**
 * A fetchable UnarchiveRoadmap Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveRoadmapMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveRoadmap mutation and return a RoadmapArchivePayload
     *
     * @param id - required id to pass to unarchiveRoadmap
     * @returns parsed response from UnarchiveRoadmapMutation
     */
    fetch(id: string): LinearFetch<RoadmapArchivePayload>;
}
/**
 * A fetchable UpdateRoadmap Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateRoadmapMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateRoadmap mutation and return a RoadmapPayload
     *
     * @param id - required id to pass to updateRoadmap
     * @param input - required input to pass to updateRoadmap
     * @returns parsed response from UpdateRoadmapMutation
     */
    fetch(id: string, input: L.RoadmapUpdateInput): LinearFetch<RoadmapPayload>;
}
/**
 * A fetchable SamlTokenUserAccountAuth Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class SamlTokenUserAccountAuthMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SamlTokenUserAccountAuth mutation and return a AuthResolverResponse
     *
     * @param input - required input to pass to samlTokenUserAccountAuth
     * @returns parsed response from SamlTokenUserAccountAuthMutation
     */
    fetch(input: L.TokenUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
}
/**
 * A fetchable CreateTeam Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateTeamMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateTeam mutation and return a TeamPayload
     *
     * @param input - required input to pass to createTeam
     * @param variables - variables without 'input' to pass into the CreateTeamMutation
     * @returns parsed response from CreateTeamMutation
     */
    fetch(input: L.TeamCreateInput, variables?: Omit<L.CreateTeamMutationVariables, "input">): LinearFetch<TeamPayload>;
}
/**
 * A fetchable DeleteTeamCycles Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTeamCyclesMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTeamCycles mutation and return a TeamPayload
     *
     * @param id - required id to pass to deleteTeamCycles
     * @returns parsed response from DeleteTeamCyclesMutation
     */
    fetch(id: string): LinearFetch<TeamPayload>;
}
/**
 * A fetchable DeleteTeam Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTeamMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTeam mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTeam
     * @returns parsed response from DeleteTeamMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable DeleteTeamKey Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTeamKeyMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTeamKey mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTeamKey
     * @returns parsed response from DeleteTeamKeyMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable CreateTeamMembership Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateTeamMembershipMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateTeamMembership mutation and return a TeamMembershipPayload
     *
     * @param input - required input to pass to createTeamMembership
     * @returns parsed response from CreateTeamMembershipMutation
     */
    fetch(input: L.TeamMembershipCreateInput): LinearFetch<TeamMembershipPayload>;
}
/**
 * A fetchable DeleteTeamMembership Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTeamMembershipMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTeamMembership mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTeamMembership
     * @returns parsed response from DeleteTeamMembershipMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateTeamMembership Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateTeamMembershipMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateTeamMembership mutation and return a TeamMembershipPayload
     *
     * @param id - required id to pass to updateTeamMembership
     * @param input - required input to pass to updateTeamMembership
     * @returns parsed response from UpdateTeamMembershipMutation
     */
    fetch(id: string, input: L.TeamMembershipUpdateInput): LinearFetch<TeamMembershipPayload>;
}
/**
 * A fetchable UnarchiveTeam Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnarchiveTeamMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnarchiveTeam mutation and return a TeamArchivePayload
     *
     * @param id - required id to pass to unarchiveTeam
     * @returns parsed response from UnarchiveTeamMutation
     */
    fetch(id: string): LinearFetch<TeamArchivePayload>;
}
/**
 * A fetchable UpdateTeam Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateTeamMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateTeam mutation and return a TeamPayload
     *
     * @param id - required id to pass to updateTeam
     * @param input - required input to pass to updateTeam
     * @returns parsed response from UpdateTeamMutation
     */
    fetch(id: string, input: L.TeamUpdateInput): LinearFetch<TeamPayload>;
}
/**
 * A fetchable CreateTemplate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateTemplateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateTemplate mutation and return a TemplatePayload
     *
     * @param input - required input to pass to createTemplate
     * @returns parsed response from CreateTemplateMutation
     */
    fetch(input: L.TemplateCreateInput): LinearFetch<TemplatePayload>;
}
/**
 * A fetchable DeleteTemplate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTemplateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTemplate mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTemplate
     * @returns parsed response from DeleteTemplateMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateTemplate Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateTemplateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateTemplate mutation and return a TemplatePayload
     *
     * @param id - required id to pass to updateTemplate
     * @param input - required input to pass to updateTemplate
     * @returns parsed response from UpdateTemplateMutation
     */
    fetch(id: string, input: L.TemplateUpdateInput): LinearFetch<TemplatePayload>;
}
/**
 * A fetchable CreateTimeSchedule Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateTimeScheduleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateTimeSchedule mutation and return a TimeSchedulePayload
     *
     * @param input - required input to pass to createTimeSchedule
     * @returns parsed response from CreateTimeScheduleMutation
     */
    fetch(input: L.TimeScheduleCreateInput): LinearFetch<TimeSchedulePayload>;
}
/**
 * A fetchable DeleteTimeSchedule Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTimeScheduleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTimeSchedule mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTimeSchedule
     * @returns parsed response from DeleteTimeScheduleMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable TimeScheduleRefreshIntegrationSchedule Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class TimeScheduleRefreshIntegrationScheduleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TimeScheduleRefreshIntegrationSchedule mutation and return a TimeSchedulePayload
     *
     * @param id - required id to pass to timeScheduleRefreshIntegrationSchedule
     * @returns parsed response from TimeScheduleRefreshIntegrationScheduleMutation
     */
    fetch(id: string): LinearFetch<TimeSchedulePayload>;
}
/**
 * A fetchable UpdateTimeSchedule Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateTimeScheduleMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateTimeSchedule mutation and return a TimeSchedulePayload
     *
     * @param id - required id to pass to updateTimeSchedule
     * @param input - required input to pass to updateTimeSchedule
     * @returns parsed response from UpdateTimeScheduleMutation
     */
    fetch(id: string, input: L.TimeScheduleUpdateInput): LinearFetch<TimeSchedulePayload>;
}
/**
 * A fetchable TimeScheduleUpsertExternal Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class TimeScheduleUpsertExternalMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the TimeScheduleUpsertExternal mutation and return a TimeSchedulePayload
     *
     * @param externalId - required externalId to pass to timeScheduleUpsertExternal
     * @param input - required input to pass to timeScheduleUpsertExternal
     * @returns parsed response from TimeScheduleUpsertExternalMutation
     */
    fetch(externalId: string, input: L.TimeScheduleUpdateInput): LinearFetch<TimeSchedulePayload>;
}
/**
 * A fetchable CreateTriageResponsibility Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateTriageResponsibilityMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateTriageResponsibility mutation and return a TriageResponsibilityPayload
     *
     * @param input - required input to pass to createTriageResponsibility
     * @returns parsed response from CreateTriageResponsibilityMutation
     */
    fetch(input: L.TriageResponsibilityCreateInput): LinearFetch<TriageResponsibilityPayload>;
}
/**
 * A fetchable DeleteTriageResponsibility Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteTriageResponsibilityMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteTriageResponsibility mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteTriageResponsibility
     * @returns parsed response from DeleteTriageResponsibilityMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateTriageResponsibility Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateTriageResponsibilityMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateTriageResponsibility mutation and return a TriageResponsibilityPayload
     *
     * @param id - required id to pass to updateTriageResponsibility
     * @param input - required input to pass to updateTriageResponsibility
     * @returns parsed response from UpdateTriageResponsibilityMutation
     */
    fetch(id: string, input: L.TriageResponsibilityUpdateInput): LinearFetch<TriageResponsibilityPayload>;
}
/**
 * A fetchable UserDemoteAdmin Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserDemoteAdminMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserDemoteAdmin mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to userDemoteAdmin
     * @returns parsed response from UserDemoteAdminMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UserDemoteMember Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserDemoteMemberMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserDemoteMember mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to userDemoteMember
     * @returns parsed response from UserDemoteMemberMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UserDiscordConnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserDiscordConnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserDiscordConnect mutation and return a UserPayload
     *
     * @param code - required code to pass to userDiscordConnect
     * @param redirectUri - required redirectUri to pass to userDiscordConnect
     * @returns parsed response from UserDiscordConnectMutation
     */
    fetch(code: string, redirectUri: string): LinearFetch<UserPayload>;
}
/**
 * A fetchable UserExternalUserDisconnect Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserExternalUserDisconnectMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserExternalUserDisconnect mutation and return a UserPayload
     *
     * @param service - required service to pass to userExternalUserDisconnect
     * @returns parsed response from UserExternalUserDisconnectMutation
     */
    fetch(service: string): LinearFetch<UserPayload>;
}
/**
 * A fetchable UpdateUserFlag Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateUserFlagMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateUserFlag mutation and return a UserSettingsFlagPayload
     *
     * @param flag - required flag to pass to updateUserFlag
     * @param operation - required operation to pass to updateUserFlag
     * @returns parsed response from UpdateUserFlagMutation
     */
    fetch(flag: L.UserFlagType, operation: L.UserFlagUpdateOperation): LinearFetch<UserSettingsFlagPayload>;
}
/**
 * A fetchable UserPromoteAdmin Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserPromoteAdminMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserPromoteAdmin mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to userPromoteAdmin
     * @returns parsed response from UserPromoteAdminMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UserPromoteMember Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserPromoteMemberMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserPromoteMember mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to userPromoteMember
     * @returns parsed response from UserPromoteMemberMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UserSettingsFlagsReset Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettingsFlagsResetMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettingsFlagsReset mutation and return a UserSettingsFlagsResetPayload
     *
     * @param variables - variables to pass into the UserSettingsFlagsResetMutation
     * @returns parsed response from UserSettingsFlagsResetMutation
     */
    fetch(variables?: L.UserSettingsFlagsResetMutationVariables): LinearFetch<UserSettingsFlagsResetPayload>;
}
/**
 * A fetchable UpdateUserSettings Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateUserSettingsMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateUserSettings mutation and return a UserSettingsPayload
     *
     * @param id - required id to pass to updateUserSettings
     * @param input - required input to pass to updateUserSettings
     * @returns parsed response from UpdateUserSettingsMutation
     */
    fetch(id: string, input: L.UserSettingsUpdateInput): LinearFetch<UserSettingsPayload>;
}
/**
 * A fetchable SuspendUser Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class SuspendUserMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the SuspendUser mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to suspendUser
     * @returns parsed response from SuspendUserMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UnsuspendUser Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UnsuspendUserMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UnsuspendUser mutation and return a UserAdminPayload
     *
     * @param id - required id to pass to unsuspendUser
     * @returns parsed response from UnsuspendUserMutation
     */
    fetch(id: string): LinearFetch<UserAdminPayload>;
}
/**
 * A fetchable UpdateUser Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateUserMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateUser mutation and return a UserPayload
     *
     * @param id - required id to pass to updateUser
     * @param input - required input to pass to updateUser
     * @returns parsed response from UpdateUserMutation
     */
    fetch(id: string, input: L.UserUpdateInput): LinearFetch<UserPayload>;
}
/**
 * A fetchable CreateViewPreferences Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateViewPreferencesMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateViewPreferences mutation and return a ViewPreferencesPayload
     *
     * @param input - required input to pass to createViewPreferences
     * @returns parsed response from CreateViewPreferencesMutation
     */
    fetch(input: L.ViewPreferencesCreateInput): LinearFetch<ViewPreferencesPayload>;
}
/**
 * A fetchable DeleteViewPreferences Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteViewPreferencesMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteViewPreferences mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteViewPreferences
     * @returns parsed response from DeleteViewPreferencesMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateViewPreferences Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateViewPreferencesMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateViewPreferences mutation and return a ViewPreferencesPayload
     *
     * @param id - required id to pass to updateViewPreferences
     * @param input - required input to pass to updateViewPreferences
     * @returns parsed response from UpdateViewPreferencesMutation
     */
    fetch(id: string, input: L.ViewPreferencesUpdateInput): LinearFetch<ViewPreferencesPayload>;
}
/**
 * A fetchable CreateWebhook Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateWebhookMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateWebhook mutation and return a WebhookPayload
     *
     * @param input - required input to pass to createWebhook
     * @returns parsed response from CreateWebhookMutation
     */
    fetch(input: L.WebhookCreateInput): LinearFetch<WebhookPayload>;
}
/**
 * A fetchable DeleteWebhook Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class DeleteWebhookMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the DeleteWebhook mutation and return a DeletePayload
     *
     * @param id - required id to pass to deleteWebhook
     * @returns parsed response from DeleteWebhookMutation
     */
    fetch(id: string): LinearFetch<DeletePayload>;
}
/**
 * A fetchable UpdateWebhook Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateWebhookMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateWebhook mutation and return a WebhookPayload
     *
     * @param id - required id to pass to updateWebhook
     * @param input - required input to pass to updateWebhook
     * @returns parsed response from UpdateWebhookMutation
     */
    fetch(id: string, input: L.WebhookUpdateInput): LinearFetch<WebhookPayload>;
}
/**
 * A fetchable ArchiveWorkflowState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class ArchiveWorkflowStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the ArchiveWorkflowState mutation and return a WorkflowStateArchivePayload
     *
     * @param id - required id to pass to archiveWorkflowState
     * @returns parsed response from ArchiveWorkflowStateMutation
     */
    fetch(id: string): LinearFetch<WorkflowStateArchivePayload>;
}
/**
 * A fetchable CreateWorkflowState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class CreateWorkflowStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the CreateWorkflowState mutation and return a WorkflowStatePayload
     *
     * @param input - required input to pass to createWorkflowState
     * @returns parsed response from CreateWorkflowStateMutation
     */
    fetch(input: L.WorkflowStateCreateInput): LinearFetch<WorkflowStatePayload>;
}
/**
 * A fetchable UpdateWorkflowState Mutation
 *
 * @param request - function to call the graphql client
 */
export declare class UpdateWorkflowStateMutation extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UpdateWorkflowState mutation and return a WorkflowStatePayload
     *
     * @param id - required id to pass to updateWorkflowState
     * @param input - required input to pass to updateWorkflowState
     * @returns parsed response from UpdateWorkflowStateMutation
     */
    fetch(id: string, input: L.WorkflowStateUpdateInput): LinearFetch<WorkflowStatePayload>;
}
/**
 * A fetchable AttachmentIssue_Attachments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_AttachmentsQuery
 */
export declare class AttachmentIssue_AttachmentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_AttachmentsQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Attachments query and return a AttachmentConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_AttachmentsQuery
     * @returns parsed response from AttachmentIssue_AttachmentsQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_AttachmentsQueryVariables, "id">): LinearFetch<AttachmentConnection>;
}
/**
 * A fetchable AttachmentIssue_BotActor Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 */
export declare class AttachmentIssue_BotActorQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the AttachmentIssue_BotActor query and return a ActorBot
     *
     * @returns parsed response from AttachmentIssue_BotActorQuery
     */
    fetch(): LinearFetch<ActorBot | undefined>;
}
/**
 * A fetchable AttachmentIssue_Children Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_ChildrenQuery
 */
export declare class AttachmentIssue_ChildrenQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_ChildrenQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Children query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_ChildrenQuery
     * @returns parsed response from AttachmentIssue_ChildrenQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_ChildrenQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable AttachmentIssue_Comments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_CommentsQuery
 */
export declare class AttachmentIssue_CommentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_CommentsQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Comments query and return a CommentConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_CommentsQuery
     * @returns parsed response from AttachmentIssue_CommentsQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
}
/**
 * A fetchable AttachmentIssue_History Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_HistoryQuery
 */
export declare class AttachmentIssue_HistoryQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_HistoryQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_History query and return a IssueHistoryConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_HistoryQuery
     * @returns parsed response from AttachmentIssue_HistoryQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_HistoryQueryVariables, "id">): LinearFetch<IssueHistoryConnection>;
}
/**
 * A fetchable AttachmentIssue_InverseRelations Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_InverseRelationsQuery
 */
export declare class AttachmentIssue_InverseRelationsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_InverseRelationsQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_InverseRelations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_InverseRelationsQuery
     * @returns parsed response from AttachmentIssue_InverseRelationsQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_InverseRelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
}
/**
 * A fetchable AttachmentIssue_Labels Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_LabelsQuery
 */
export declare class AttachmentIssue_LabelsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_LabelsQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Labels query and return a IssueLabelConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_LabelsQuery
     * @returns parsed response from AttachmentIssue_LabelsQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_LabelsQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable AttachmentIssue_Relations Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_RelationsQuery
 */
export declare class AttachmentIssue_RelationsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_RelationsQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Relations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_RelationsQuery
     * @returns parsed response from AttachmentIssue_RelationsQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_RelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
}
/**
 * A fetchable AttachmentIssue_Subscribers Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to attachmentIssue
 * @param variables - variables without 'id' to pass into the AttachmentIssue_SubscribersQuery
 */
export declare class AttachmentIssue_SubscribersQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.AttachmentIssue_SubscribersQueryVariables, "id">);
    /**
     * Call the AttachmentIssue_Subscribers query and return a UserConnection
     *
     * @param variables - variables without 'id' to pass into the AttachmentIssue_SubscribersQuery
     * @returns parsed response from AttachmentIssue_SubscribersQuery
     */
    fetch(variables?: Omit<L.AttachmentIssue_SubscribersQueryVariables, "id">): LinearFetch<UserConnection>;
}
/**
 * A fetchable Comment_BotActor Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Comment_BotActorQuery
 */
export declare class Comment_BotActorQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Comment_BotActorQueryVariables);
    /**
     * Call the Comment_BotActor query and return a ActorBot
     *
     * @param variables - variables to pass into the Comment_BotActorQuery
     * @returns parsed response from Comment_BotActorQuery
     */
    fetch(variables?: L.Comment_BotActorQueryVariables): LinearFetch<ActorBot | undefined>;
}
/**
 * A fetchable Comment_Children Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Comment_ChildrenQuery
 */
export declare class Comment_ChildrenQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Comment_ChildrenQueryVariables);
    /**
     * Call the Comment_Children query and return a CommentConnection
     *
     * @param variables - variables to pass into the Comment_ChildrenQuery
     * @returns parsed response from Comment_ChildrenQuery
     */
    fetch(variables?: L.Comment_ChildrenQueryVariables): LinearFetch<CommentConnection>;
}
/**
 * A fetchable Comment_DocumentContent Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Comment_DocumentContentQuery
 */
export declare class Comment_DocumentContentQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Comment_DocumentContentQueryVariables);
    /**
     * Call the Comment_DocumentContent query and return a DocumentContent
     *
     * @param variables - variables to pass into the Comment_DocumentContentQuery
     * @returns parsed response from Comment_DocumentContentQuery
     */
    fetch(variables?: L.Comment_DocumentContentQueryVariables): LinearFetch<DocumentContent | undefined>;
}
/**
 * A fetchable CustomView_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView
 * @param variables - variables without 'id' to pass into the CustomView_IssuesQuery
 */
export declare class CustomView_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.CustomView_IssuesQueryVariables, "id">);
    /**
     * Call the CustomView_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the CustomView_IssuesQuery
     * @returns parsed response from CustomView_IssuesQuery
     */
    fetch(variables?: Omit<L.CustomView_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable CustomView_OrganizationViewPreferences Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView
 */
export declare class CustomView_OrganizationViewPreferencesQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the CustomView_OrganizationViewPreferences query and return a ViewPreferences
     *
     * @returns parsed response from CustomView_OrganizationViewPreferencesQuery
     */
    fetch(): LinearFetch<ViewPreferences | undefined>;
}
/**
 * A fetchable CustomView_Projects Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView
 * @param variables - variables without 'id' to pass into the CustomView_ProjectsQuery
 */
export declare class CustomView_ProjectsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.CustomView_ProjectsQueryVariables, "id">);
    /**
     * Call the CustomView_Projects query and return a ProjectConnection
     *
     * @param variables - variables without 'id' to pass into the CustomView_ProjectsQuery
     * @returns parsed response from CustomView_ProjectsQuery
     */
    fetch(variables?: Omit<L.CustomView_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
}
/**
 * A fetchable CustomView_UserViewPreferences Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView
 */
export declare class CustomView_UserViewPreferencesQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the CustomView_UserViewPreferences query and return a ViewPreferences
     *
     * @returns parsed response from CustomView_UserViewPreferencesQuery
     */
    fetch(): LinearFetch<ViewPreferences | undefined>;
}
/**
 * A fetchable CustomView_ViewPreferencesValues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView
 */
export declare class CustomView_ViewPreferencesValuesQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the CustomView_ViewPreferencesValues query and return a ViewPreferencesValues
     *
     * @returns parsed response from CustomView_ViewPreferencesValuesQuery
     */
    fetch(): LinearFetch<ViewPreferencesValues | undefined>;
}
/**
 * A fetchable CustomView_OrganizationViewPreferences_Preferences Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView_organizationViewPreferences
 */
export declare class CustomView_OrganizationViewPreferences_PreferencesQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the CustomView_OrganizationViewPreferences_Preferences query and return a ViewPreferencesValues
     *
     * @returns parsed response from CustomView_OrganizationViewPreferences_PreferencesQuery
     */
    fetch(): LinearFetch<ViewPreferencesValues | undefined>;
}
/**
 * A fetchable CustomView_UserViewPreferences_Preferences Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to customView_userViewPreferences
 */
export declare class CustomView_UserViewPreferences_PreferencesQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the CustomView_UserViewPreferences_Preferences query and return a ViewPreferencesValues
     *
     * @returns parsed response from CustomView_UserViewPreferences_PreferencesQuery
     */
    fetch(): LinearFetch<ViewPreferencesValues | undefined>;
}
/**
 * A fetchable Cycle_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to cycle
 * @param variables - variables without 'id' to pass into the Cycle_IssuesQuery
 */
export declare class Cycle_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Cycle_IssuesQueryVariables, "id">);
    /**
     * Call the Cycle_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the Cycle_IssuesQuery
     * @returns parsed response from Cycle_IssuesQuery
     */
    fetch(variables?: Omit<L.Cycle_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Cycle_UncompletedIssuesUponClose Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to cycle
 * @param variables - variables without 'id' to pass into the Cycle_UncompletedIssuesUponCloseQuery
 */
export declare class Cycle_UncompletedIssuesUponCloseQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Cycle_UncompletedIssuesUponCloseQueryVariables, "id">);
    /**
     * Call the Cycle_UncompletedIssuesUponClose query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the Cycle_UncompletedIssuesUponCloseQuery
     * @returns parsed response from Cycle_UncompletedIssuesUponCloseQuery
     */
    fetch(variables?: Omit<L.Cycle_UncompletedIssuesUponCloseQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Document_Comments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to document
 * @param variables - variables without 'id' to pass into the Document_CommentsQuery
 */
export declare class Document_CommentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Document_CommentsQueryVariables, "id">);
    /**
     * Call the Document_Comments query and return a CommentConnection
     *
     * @param variables - variables without 'id' to pass into the Document_CommentsQuery
     * @returns parsed response from Document_CommentsQuery
     */
    fetch(variables?: Omit<L.Document_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
}
/**
 * A fetchable Favorite_Children Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to favorite
 * @param variables - variables without 'id' to pass into the Favorite_ChildrenQuery
 */
export declare class Favorite_ChildrenQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Favorite_ChildrenQueryVariables, "id">);
    /**
     * Call the Favorite_Children query and return a FavoriteConnection
     *
     * @param variables - variables without 'id' to pass into the Favorite_ChildrenQuery
     * @returns parsed response from Favorite_ChildrenQuery
     */
    fetch(variables?: Omit<L.Favorite_ChildrenQueryVariables, "id">): LinearFetch<FavoriteConnection>;
}
/**
 * A fetchable Initiative_Links Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to initiative
 * @param variables - variables without 'id' to pass into the Initiative_LinksQuery
 */
export declare class Initiative_LinksQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Initiative_LinksQueryVariables, "id">);
    /**
     * Call the Initiative_Links query and return a EntityExternalLinkConnection
     *
     * @param variables - variables without 'id' to pass into the Initiative_LinksQuery
     * @returns parsed response from Initiative_LinksQuery
     */
    fetch(variables?: Omit<L.Initiative_LinksQueryVariables, "id">): LinearFetch<EntityExternalLinkConnection>;
}
/**
 * A fetchable Initiative_Projects Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to initiative
 * @param variables - variables without 'id' to pass into the Initiative_ProjectsQuery
 */
export declare class Initiative_ProjectsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Initiative_ProjectsQueryVariables, "id">);
    /**
     * Call the Initiative_Projects query and return a ProjectConnection
     *
     * @param variables - variables without 'id' to pass into the Initiative_ProjectsQuery
     * @returns parsed response from Initiative_ProjectsQuery
     */
    fetch(variables?: Omit<L.Initiative_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
}
/**
 * A fetchable Issue_Attachments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_AttachmentsQuery
 */
export declare class Issue_AttachmentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_AttachmentsQueryVariables, "id">);
    /**
     * Call the Issue_Attachments query and return a AttachmentConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_AttachmentsQuery
     * @returns parsed response from Issue_AttachmentsQuery
     */
    fetch(variables?: Omit<L.Issue_AttachmentsQueryVariables, "id">): LinearFetch<AttachmentConnection>;
}
/**
 * A fetchable Issue_BotActor Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 */
export declare class Issue_BotActorQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the Issue_BotActor query and return a ActorBot
     *
     * @returns parsed response from Issue_BotActorQuery
     */
    fetch(): LinearFetch<ActorBot | undefined>;
}
/**
 * A fetchable Issue_Children Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_ChildrenQuery
 */
export declare class Issue_ChildrenQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_ChildrenQueryVariables, "id">);
    /**
     * Call the Issue_Children query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_ChildrenQuery
     * @returns parsed response from Issue_ChildrenQuery
     */
    fetch(variables?: Omit<L.Issue_ChildrenQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Issue_Comments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_CommentsQuery
 */
export declare class Issue_CommentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_CommentsQueryVariables, "id">);
    /**
     * Call the Issue_Comments query and return a CommentConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_CommentsQuery
     * @returns parsed response from Issue_CommentsQuery
     */
    fetch(variables?: Omit<L.Issue_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
}
/**
 * A fetchable Issue_History Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_HistoryQuery
 */
export declare class Issue_HistoryQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_HistoryQueryVariables, "id">);
    /**
     * Call the Issue_History query and return a IssueHistoryConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_HistoryQuery
     * @returns parsed response from Issue_HistoryQuery
     */
    fetch(variables?: Omit<L.Issue_HistoryQueryVariables, "id">): LinearFetch<IssueHistoryConnection>;
}
/**
 * A fetchable Issue_InverseRelations Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_InverseRelationsQuery
 */
export declare class Issue_InverseRelationsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_InverseRelationsQueryVariables, "id">);
    /**
     * Call the Issue_InverseRelations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_InverseRelationsQuery
     * @returns parsed response from Issue_InverseRelationsQuery
     */
    fetch(variables?: Omit<L.Issue_InverseRelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
}
/**
 * A fetchable Issue_Labels Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_LabelsQuery
 */
export declare class Issue_LabelsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_LabelsQueryVariables, "id">);
    /**
     * Call the Issue_Labels query and return a IssueLabelConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_LabelsQuery
     * @returns parsed response from Issue_LabelsQuery
     */
    fetch(variables?: Omit<L.Issue_LabelsQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable Issue_Relations Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_RelationsQuery
 */
export declare class Issue_RelationsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_RelationsQueryVariables, "id">);
    /**
     * Call the Issue_Relations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_RelationsQuery
     * @returns parsed response from Issue_RelationsQuery
     */
    fetch(variables?: Omit<L.Issue_RelationsQueryVariables, "id">): LinearFetch<IssueRelationConnection>;
}
/**
 * A fetchable Issue_Subscribers Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issue
 * @param variables - variables without 'id' to pass into the Issue_SubscribersQuery
 */
export declare class Issue_SubscribersQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Issue_SubscribersQueryVariables, "id">);
    /**
     * Call the Issue_Subscribers query and return a UserConnection
     *
     * @param variables - variables without 'id' to pass into the Issue_SubscribersQuery
     * @returns parsed response from Issue_SubscribersQuery
     */
    fetch(variables?: Omit<L.Issue_SubscribersQueryVariables, "id">): LinearFetch<UserConnection>;
}
/**
 * A fetchable IssueLabel_Children Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issueLabel
 * @param variables - variables without 'id' to pass into the IssueLabel_ChildrenQuery
 */
export declare class IssueLabel_ChildrenQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.IssueLabel_ChildrenQueryVariables, "id">);
    /**
     * Call the IssueLabel_Children query and return a IssueLabelConnection
     *
     * @param variables - variables without 'id' to pass into the IssueLabel_ChildrenQuery
     * @returns parsed response from IssueLabel_ChildrenQuery
     */
    fetch(variables?: Omit<L.IssueLabel_ChildrenQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable IssueLabel_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to issueLabel
 * @param variables - variables without 'id' to pass into the IssueLabel_IssuesQuery
 */
export declare class IssueLabel_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.IssueLabel_IssuesQueryVariables, "id">);
    /**
     * Call the IssueLabel_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the IssueLabel_IssuesQuery
     * @returns parsed response from IssueLabel_IssuesQuery
     */
    fetch(variables?: Omit<L.IssueLabel_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable IssueVcsBranchSearch_Attachments Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_AttachmentsQuery
 */
export declare class IssueVcsBranchSearch_AttachmentsQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_AttachmentsQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Attachments query and return a AttachmentConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_AttachmentsQuery
     * @returns parsed response from IssueVcsBranchSearch_AttachmentsQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_AttachmentsQueryVariables, "branchName">): LinearFetch<AttachmentConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_BotActor Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 */
export declare class IssueVcsBranchSearch_BotActorQuery extends Request {
    private _branchName;
    constructor(request: LinearRequest, branchName: string);
    /**
     * Call the IssueVcsBranchSearch_BotActor query and return a ActorBot
     *
     * @returns parsed response from IssueVcsBranchSearch_BotActorQuery
     */
    fetch(): LinearFetch<ActorBot | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_Children Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_ChildrenQuery
 */
export declare class IssueVcsBranchSearch_ChildrenQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_ChildrenQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Children query and return a IssueConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_ChildrenQuery
     * @returns parsed response from IssueVcsBranchSearch_ChildrenQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_ChildrenQueryVariables, "branchName">): LinearFetch<IssueConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_Comments Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_CommentsQuery
 */
export declare class IssueVcsBranchSearch_CommentsQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_CommentsQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Comments query and return a CommentConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_CommentsQuery
     * @returns parsed response from IssueVcsBranchSearch_CommentsQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_CommentsQueryVariables, "branchName">): LinearFetch<CommentConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_History Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_HistoryQuery
 */
export declare class IssueVcsBranchSearch_HistoryQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_HistoryQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_History query and return a IssueHistoryConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_HistoryQuery
     * @returns parsed response from IssueVcsBranchSearch_HistoryQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_HistoryQueryVariables, "branchName">): LinearFetch<IssueHistoryConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_InverseRelations Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_InverseRelationsQuery
 */
export declare class IssueVcsBranchSearch_InverseRelationsQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_InverseRelationsQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_InverseRelations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_InverseRelationsQuery
     * @returns parsed response from IssueVcsBranchSearch_InverseRelationsQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_InverseRelationsQueryVariables, "branchName">): LinearFetch<IssueRelationConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_Labels Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_LabelsQuery
 */
export declare class IssueVcsBranchSearch_LabelsQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_LabelsQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Labels query and return a IssueLabelConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_LabelsQuery
     * @returns parsed response from IssueVcsBranchSearch_LabelsQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_LabelsQueryVariables, "branchName">): LinearFetch<IssueLabelConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_Relations Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_RelationsQuery
 */
export declare class IssueVcsBranchSearch_RelationsQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_RelationsQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Relations query and return a IssueRelationConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_RelationsQuery
     * @returns parsed response from IssueVcsBranchSearch_RelationsQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_RelationsQueryVariables, "branchName">): LinearFetch<IssueRelationConnection | undefined>;
}
/**
 * A fetchable IssueVcsBranchSearch_Subscribers Query
 *
 * @param request - function to call the graphql client
 * @param branchName - required branchName to pass to issueVcsBranchSearch
 * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_SubscribersQuery
 */
export declare class IssueVcsBranchSearch_SubscribersQuery extends Request {
    private _branchName;
    private _variables?;
    constructor(request: LinearRequest, branchName: string, variables?: Omit<L.IssueVcsBranchSearch_SubscribersQueryVariables, "branchName">);
    /**
     * Call the IssueVcsBranchSearch_Subscribers query and return a UserConnection
     *
     * @param variables - variables without 'branchName' to pass into the IssueVcsBranchSearch_SubscribersQuery
     * @returns parsed response from IssueVcsBranchSearch_SubscribersQuery
     */
    fetch(variables?: Omit<L.IssueVcsBranchSearch_SubscribersQueryVariables, "branchName">): LinearFetch<UserConnection | undefined>;
}
/**
 * A fetchable Organization_Integrations Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Organization_IntegrationsQuery
 */
export declare class Organization_IntegrationsQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Organization_IntegrationsQueryVariables);
    /**
     * Call the Organization_Integrations query and return a IntegrationConnection
     *
     * @param variables - variables to pass into the Organization_IntegrationsQuery
     * @returns parsed response from Organization_IntegrationsQuery
     */
    fetch(variables?: L.Organization_IntegrationsQueryVariables): LinearFetch<IntegrationConnection>;
}
/**
 * A fetchable Organization_Labels Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Organization_LabelsQuery
 */
export declare class Organization_LabelsQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Organization_LabelsQueryVariables);
    /**
     * Call the Organization_Labels query and return a IssueLabelConnection
     *
     * @param variables - variables to pass into the Organization_LabelsQuery
     * @returns parsed response from Organization_LabelsQuery
     */
    fetch(variables?: L.Organization_LabelsQueryVariables): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable Organization_Subscription Query
 *
 * @param request - function to call the graphql client
 */
export declare class Organization_SubscriptionQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the Organization_Subscription query and return a PaidSubscription
     *
     * @returns parsed response from Organization_SubscriptionQuery
     */
    fetch(): LinearFetch<PaidSubscription | undefined>;
}
/**
 * A fetchable Organization_Teams Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Organization_TeamsQuery
 */
export declare class Organization_TeamsQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Organization_TeamsQueryVariables);
    /**
     * Call the Organization_Teams query and return a TeamConnection
     *
     * @param variables - variables to pass into the Organization_TeamsQuery
     * @returns parsed response from Organization_TeamsQuery
     */
    fetch(variables?: L.Organization_TeamsQueryVariables): LinearFetch<TeamConnection>;
}
/**
 * A fetchable Organization_Templates Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Organization_TemplatesQuery
 */
export declare class Organization_TemplatesQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Organization_TemplatesQueryVariables);
    /**
     * Call the Organization_Templates query and return a TemplateConnection
     *
     * @param variables - variables to pass into the Organization_TemplatesQuery
     * @returns parsed response from Organization_TemplatesQuery
     */
    fetch(variables?: L.Organization_TemplatesQueryVariables): LinearFetch<TemplateConnection>;
}
/**
 * A fetchable Organization_Users Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Organization_UsersQuery
 */
export declare class Organization_UsersQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Organization_UsersQueryVariables);
    /**
     * Call the Organization_Users query and return a UserConnection
     *
     * @param variables - variables to pass into the Organization_UsersQuery
     * @returns parsed response from Organization_UsersQuery
     */
    fetch(variables?: L.Organization_UsersQueryVariables): LinearFetch<UserConnection>;
}
/**
 * A fetchable Project_DocumentContent Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 */
export declare class Project_DocumentContentQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the Project_DocumentContent query and return a DocumentContent
     *
     * @returns parsed response from Project_DocumentContentQuery
     */
    fetch(): LinearFetch<DocumentContent | undefined>;
}
/**
 * A fetchable Project_Documents Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_DocumentsQuery
 */
export declare class Project_DocumentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_DocumentsQueryVariables, "id">);
    /**
     * Call the Project_Documents query and return a DocumentConnection
     *
     * @param variables - variables without 'id' to pass into the Project_DocumentsQuery
     * @returns parsed response from Project_DocumentsQuery
     */
    fetch(variables?: Omit<L.Project_DocumentsQueryVariables, "id">): LinearFetch<DocumentConnection>;
}
/**
 * A fetchable Project_ExternalLinks Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_ExternalLinksQuery
 */
export declare class Project_ExternalLinksQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_ExternalLinksQueryVariables, "id">);
    /**
     * Call the Project_ExternalLinks query and return a EntityExternalLinkConnection
     *
     * @param variables - variables without 'id' to pass into the Project_ExternalLinksQuery
     * @returns parsed response from Project_ExternalLinksQuery
     */
    fetch(variables?: Omit<L.Project_ExternalLinksQueryVariables, "id">): LinearFetch<EntityExternalLinkConnection>;
}
/**
 * A fetchable Project_History Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_HistoryQuery
 */
export declare class Project_HistoryQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_HistoryQueryVariables, "id">);
    /**
     * Call the Project_History query and return a ProjectHistoryConnection
     *
     * @param variables - variables without 'id' to pass into the Project_HistoryQuery
     * @returns parsed response from Project_HistoryQuery
     */
    fetch(variables?: Omit<L.Project_HistoryQueryVariables, "id">): LinearFetch<ProjectHistoryConnection>;
}
/**
 * A fetchable Project_Initiatives Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_InitiativesQuery
 */
export declare class Project_InitiativesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_InitiativesQueryVariables, "id">);
    /**
     * Call the Project_Initiatives query and return a InitiativeConnection
     *
     * @param variables - variables without 'id' to pass into the Project_InitiativesQuery
     * @returns parsed response from Project_InitiativesQuery
     */
    fetch(variables?: Omit<L.Project_InitiativesQueryVariables, "id">): LinearFetch<InitiativeConnection>;
}
/**
 * A fetchable Project_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_IssuesQuery
 */
export declare class Project_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_IssuesQueryVariables, "id">);
    /**
     * Call the Project_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the Project_IssuesQuery
     * @returns parsed response from Project_IssuesQuery
     */
    fetch(variables?: Omit<L.Project_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Project_Links Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_LinksQuery
 */
export declare class Project_LinksQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_LinksQueryVariables, "id">);
    /**
     * Call the Project_Links query and return a ProjectLinkConnection
     *
     * @param variables - variables without 'id' to pass into the Project_LinksQuery
     * @returns parsed response from Project_LinksQuery
     */
    fetch(variables?: Omit<L.Project_LinksQueryVariables, "id">): LinearFetch<ProjectLinkConnection>;
}
/**
 * A fetchable Project_Members Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_MembersQuery
 */
export declare class Project_MembersQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_MembersQueryVariables, "id">);
    /**
     * Call the Project_Members query and return a UserConnection
     *
     * @param variables - variables without 'id' to pass into the Project_MembersQuery
     * @returns parsed response from Project_MembersQuery
     */
    fetch(variables?: Omit<L.Project_MembersQueryVariables, "id">): LinearFetch<UserConnection>;
}
/**
 * A fetchable Project_ProjectMilestones Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_ProjectMilestonesQuery
 */
export declare class Project_ProjectMilestonesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_ProjectMilestonesQueryVariables, "id">);
    /**
     * Call the Project_ProjectMilestones query and return a ProjectMilestoneConnection
     *
     * @param variables - variables without 'id' to pass into the Project_ProjectMilestonesQuery
     * @returns parsed response from Project_ProjectMilestonesQuery
     */
    fetch(variables?: Omit<L.Project_ProjectMilestonesQueryVariables, "id">): LinearFetch<ProjectMilestoneConnection>;
}
/**
 * A fetchable Project_ProjectUpdates Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_ProjectUpdatesQuery
 */
export declare class Project_ProjectUpdatesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_ProjectUpdatesQueryVariables, "id">);
    /**
     * Call the Project_ProjectUpdates query and return a ProjectUpdateConnection
     *
     * @param variables - variables without 'id' to pass into the Project_ProjectUpdatesQuery
     * @returns parsed response from Project_ProjectUpdatesQuery
     */
    fetch(variables?: Omit<L.Project_ProjectUpdatesQueryVariables, "id">): LinearFetch<ProjectUpdateConnection>;
}
/**
 * A fetchable Project_Status Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 */
export declare class Project_StatusQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the Project_Status query and return a ProjectStatus
     *
     * @returns parsed response from Project_StatusQuery
     */
    fetch(): LinearFetch<ProjectStatus>;
}
/**
 * A fetchable Project_Teams Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to project
 * @param variables - variables without 'id' to pass into the Project_TeamsQuery
 */
export declare class Project_TeamsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Project_TeamsQueryVariables, "id">);
    /**
     * Call the Project_Teams query and return a TeamConnection
     *
     * @param variables - variables without 'id' to pass into the Project_TeamsQuery
     * @returns parsed response from Project_TeamsQuery
     */
    fetch(variables?: Omit<L.Project_TeamsQueryVariables, "id">): LinearFetch<TeamConnection>;
}
/**
 * A fetchable ProjectMilestone_DocumentContent Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to projectMilestone
 */
export declare class ProjectMilestone_DocumentContentQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the ProjectMilestone_DocumentContent query and return a DocumentContent
     *
     * @returns parsed response from ProjectMilestone_DocumentContentQuery
     */
    fetch(): LinearFetch<DocumentContent | undefined>;
}
/**
 * A fetchable ProjectMilestone_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to projectMilestone
 * @param variables - variables without 'id' to pass into the ProjectMilestone_IssuesQuery
 */
export declare class ProjectMilestone_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.ProjectMilestone_IssuesQueryVariables, "id">);
    /**
     * Call the ProjectMilestone_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the ProjectMilestone_IssuesQuery
     * @returns parsed response from ProjectMilestone_IssuesQuery
     */
    fetch(variables?: Omit<L.ProjectMilestone_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable ProjectUpdate_Comments Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to projectUpdate
 * @param variables - variables without 'id' to pass into the ProjectUpdate_CommentsQuery
 */
export declare class ProjectUpdate_CommentsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.ProjectUpdate_CommentsQueryVariables, "id">);
    /**
     * Call the ProjectUpdate_Comments query and return a CommentConnection
     *
     * @param variables - variables without 'id' to pass into the ProjectUpdate_CommentsQuery
     * @returns parsed response from ProjectUpdate_CommentsQuery
     */
    fetch(variables?: Omit<L.ProjectUpdate_CommentsQueryVariables, "id">): LinearFetch<CommentConnection>;
}
/**
 * A fetchable Roadmap_Projects Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to roadmap
 * @param variables - variables without 'id' to pass into the Roadmap_ProjectsQuery
 */
export declare class Roadmap_ProjectsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Roadmap_ProjectsQueryVariables, "id">);
    /**
     * Call the Roadmap_Projects query and return a ProjectConnection
     *
     * @param variables - variables without 'id' to pass into the Roadmap_ProjectsQuery
     * @returns parsed response from Roadmap_ProjectsQuery
     */
    fetch(variables?: Omit<L.Roadmap_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
}
/**
 * A fetchable SearchDocuments_ArchivePayload Query
 *
 * @param request - function to call the graphql client
 * @param term - required term to pass to searchDocuments
 * @param variables - variables without 'term' to pass into the SearchDocuments_ArchivePayloadQuery
 */
export declare class SearchDocuments_ArchivePayloadQuery extends Request {
    private _term;
    private _variables?;
    constructor(request: LinearRequest, term: string, variables?: Omit<L.SearchDocuments_ArchivePayloadQueryVariables, "term">);
    /**
     * Call the SearchDocuments_ArchivePayload query and return a ArchiveResponse
     *
     * @param variables - variables without 'term' to pass into the SearchDocuments_ArchivePayloadQuery
     * @returns parsed response from SearchDocuments_ArchivePayloadQuery
     */
    fetch(variables?: Omit<L.SearchDocuments_ArchivePayloadQueryVariables, "term">): LinearFetch<ArchiveResponse>;
}
/**
 * A fetchable SearchIssues_ArchivePayload Query
 *
 * @param request - function to call the graphql client
 * @param term - required term to pass to searchIssues
 * @param variables - variables without 'term' to pass into the SearchIssues_ArchivePayloadQuery
 */
export declare class SearchIssues_ArchivePayloadQuery extends Request {
    private _term;
    private _variables?;
    constructor(request: LinearRequest, term: string, variables?: Omit<L.SearchIssues_ArchivePayloadQueryVariables, "term">);
    /**
     * Call the SearchIssues_ArchivePayload query and return a ArchiveResponse
     *
     * @param variables - variables without 'term' to pass into the SearchIssues_ArchivePayloadQuery
     * @returns parsed response from SearchIssues_ArchivePayloadQuery
     */
    fetch(variables?: Omit<L.SearchIssues_ArchivePayloadQueryVariables, "term">): LinearFetch<ArchiveResponse>;
}
/**
 * A fetchable SearchProjects_ArchivePayload Query
 *
 * @param request - function to call the graphql client
 * @param term - required term to pass to searchProjects
 * @param variables - variables without 'term' to pass into the SearchProjects_ArchivePayloadQuery
 */
export declare class SearchProjects_ArchivePayloadQuery extends Request {
    private _term;
    private _variables?;
    constructor(request: LinearRequest, term: string, variables?: Omit<L.SearchProjects_ArchivePayloadQueryVariables, "term">);
    /**
     * Call the SearchProjects_ArchivePayload query and return a ArchiveResponse
     *
     * @param variables - variables without 'term' to pass into the SearchProjects_ArchivePayloadQuery
     * @returns parsed response from SearchProjects_ArchivePayloadQuery
     */
    fetch(variables?: Omit<L.SearchProjects_ArchivePayloadQueryVariables, "term">): LinearFetch<ArchiveResponse>;
}
/**
 * A fetchable Team_Cycles Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_CyclesQuery
 */
export declare class Team_CyclesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_CyclesQueryVariables, "id">);
    /**
     * Call the Team_Cycles query and return a CycleConnection
     *
     * @param variables - variables without 'id' to pass into the Team_CyclesQuery
     * @returns parsed response from Team_CyclesQuery
     */
    fetch(variables?: Omit<L.Team_CyclesQueryVariables, "id">): LinearFetch<CycleConnection>;
}
/**
 * A fetchable Team_GitAutomationStates Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_GitAutomationStatesQuery
 */
export declare class Team_GitAutomationStatesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_GitAutomationStatesQueryVariables, "id">);
    /**
     * Call the Team_GitAutomationStates query and return a GitAutomationStateConnection
     *
     * @param variables - variables without 'id' to pass into the Team_GitAutomationStatesQuery
     * @returns parsed response from Team_GitAutomationStatesQuery
     */
    fetch(variables?: Omit<L.Team_GitAutomationStatesQueryVariables, "id">): LinearFetch<GitAutomationStateConnection>;
}
/**
 * A fetchable Team_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_IssuesQuery
 */
export declare class Team_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_IssuesQueryVariables, "id">);
    /**
     * Call the Team_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the Team_IssuesQuery
     * @returns parsed response from Team_IssuesQuery
     */
    fetch(variables?: Omit<L.Team_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Team_Labels Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_LabelsQuery
 */
export declare class Team_LabelsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_LabelsQueryVariables, "id">);
    /**
     * Call the Team_Labels query and return a IssueLabelConnection
     *
     * @param variables - variables without 'id' to pass into the Team_LabelsQuery
     * @returns parsed response from Team_LabelsQuery
     */
    fetch(variables?: Omit<L.Team_LabelsQueryVariables, "id">): LinearFetch<IssueLabelConnection>;
}
/**
 * A fetchable Team_Members Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_MembersQuery
 */
export declare class Team_MembersQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_MembersQueryVariables, "id">);
    /**
     * Call the Team_Members query and return a UserConnection
     *
     * @param variables - variables without 'id' to pass into the Team_MembersQuery
     * @returns parsed response from Team_MembersQuery
     */
    fetch(variables?: Omit<L.Team_MembersQueryVariables, "id">): LinearFetch<UserConnection>;
}
/**
 * A fetchable Team_Memberships Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_MembershipsQuery
 */
export declare class Team_MembershipsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_MembershipsQueryVariables, "id">);
    /**
     * Call the Team_Memberships query and return a TeamMembershipConnection
     *
     * @param variables - variables without 'id' to pass into the Team_MembershipsQuery
     * @returns parsed response from Team_MembershipsQuery
     */
    fetch(variables?: Omit<L.Team_MembershipsQueryVariables, "id">): LinearFetch<TeamMembershipConnection>;
}
/**
 * A fetchable Team_Projects Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_ProjectsQuery
 */
export declare class Team_ProjectsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_ProjectsQueryVariables, "id">);
    /**
     * Call the Team_Projects query and return a ProjectConnection
     *
     * @param variables - variables without 'id' to pass into the Team_ProjectsQuery
     * @returns parsed response from Team_ProjectsQuery
     */
    fetch(variables?: Omit<L.Team_ProjectsQueryVariables, "id">): LinearFetch<ProjectConnection>;
}
/**
 * A fetchable Team_States Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_StatesQuery
 */
export declare class Team_StatesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_StatesQueryVariables, "id">);
    /**
     * Call the Team_States query and return a WorkflowStateConnection
     *
     * @param variables - variables without 'id' to pass into the Team_StatesQuery
     * @returns parsed response from Team_StatesQuery
     */
    fetch(variables?: Omit<L.Team_StatesQueryVariables, "id">): LinearFetch<WorkflowStateConnection>;
}
/**
 * A fetchable Team_Templates Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_TemplatesQuery
 */
export declare class Team_TemplatesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_TemplatesQueryVariables, "id">);
    /**
     * Call the Team_Templates query and return a TemplateConnection
     *
     * @param variables - variables without 'id' to pass into the Team_TemplatesQuery
     * @returns parsed response from Team_TemplatesQuery
     */
    fetch(variables?: Omit<L.Team_TemplatesQueryVariables, "id">): LinearFetch<TemplateConnection>;
}
/**
 * A fetchable Team_Webhooks Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to team
 * @param variables - variables without 'id' to pass into the Team_WebhooksQuery
 */
export declare class Team_WebhooksQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.Team_WebhooksQueryVariables, "id">);
    /**
     * Call the Team_Webhooks query and return a WebhookConnection
     *
     * @param variables - variables without 'id' to pass into the Team_WebhooksQuery
     * @returns parsed response from Team_WebhooksQuery
     */
    fetch(variables?: Omit<L.Team_WebhooksQueryVariables, "id">): LinearFetch<WebhookConnection>;
}
/**
 * A fetchable TriageResponsibility_ManualSelection Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to triageResponsibility
 */
export declare class TriageResponsibility_ManualSelectionQuery extends Request {
    private _id;
    constructor(request: LinearRequest, id: string);
    /**
     * Call the TriageResponsibility_ManualSelection query and return a TriageResponsibilityManualSelection
     *
     * @returns parsed response from TriageResponsibility_ManualSelectionQuery
     */
    fetch(): LinearFetch<TriageResponsibilityManualSelection | undefined>;
}
/**
 * A fetchable User_AssignedIssues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to user
 * @param variables - variables without 'id' to pass into the User_AssignedIssuesQuery
 */
export declare class User_AssignedIssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.User_AssignedIssuesQueryVariables, "id">);
    /**
     * Call the User_AssignedIssues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the User_AssignedIssuesQuery
     * @returns parsed response from User_AssignedIssuesQuery
     */
    fetch(variables?: Omit<L.User_AssignedIssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable User_CreatedIssues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to user
 * @param variables - variables without 'id' to pass into the User_CreatedIssuesQuery
 */
export declare class User_CreatedIssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.User_CreatedIssuesQueryVariables, "id">);
    /**
     * Call the User_CreatedIssues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the User_CreatedIssuesQuery
     * @returns parsed response from User_CreatedIssuesQuery
     */
    fetch(variables?: Omit<L.User_CreatedIssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * A fetchable User_TeamMemberships Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to user
 * @param variables - variables without 'id' to pass into the User_TeamMembershipsQuery
 */
export declare class User_TeamMembershipsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.User_TeamMembershipsQueryVariables, "id">);
    /**
     * Call the User_TeamMemberships query and return a TeamMembershipConnection
     *
     * @param variables - variables without 'id' to pass into the User_TeamMembershipsQuery
     * @returns parsed response from User_TeamMembershipsQuery
     */
    fetch(variables?: Omit<L.User_TeamMembershipsQueryVariables, "id">): LinearFetch<TeamMembershipConnection>;
}
/**
 * A fetchable User_Teams Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to user
 * @param variables - variables without 'id' to pass into the User_TeamsQuery
 */
export declare class User_TeamsQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.User_TeamsQueryVariables, "id">);
    /**
     * Call the User_Teams query and return a TeamConnection
     *
     * @param variables - variables without 'id' to pass into the User_TeamsQuery
     * @returns parsed response from User_TeamsQuery
     */
    fetch(variables?: Omit<L.User_TeamsQueryVariables, "id">): LinearFetch<TeamConnection>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferencesQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences query and return a NotificationDeliveryPreferences
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferencesQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferences>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_MobileQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile query and return a NotificationDeliveryPreferencesChannel
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_MobileQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesChannel | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_ScheduleQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule query and return a NotificationDeliveryPreferencesSchedule
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_ScheduleQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesSchedule | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Friday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_FridayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Friday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_FridayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Monday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_MondayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Monday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_MondayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Saturday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_SaturdayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Saturday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_SaturdayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Sunday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_SundayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Sunday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_SundayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Thursday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_ThursdayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Thursday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_ThursdayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Tuesday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_TuesdayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Tuesday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_TuesdayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Wednesday Query
 *
 * @param request - function to call the graphql client
 */
export declare class UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_WednesdayQuery extends Request {
    constructor(request: LinearRequest);
    /**
     * Call the UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_Wednesday query and return a NotificationDeliveryPreferencesDay
     *
     * @returns parsed response from UserSettings_NotificationDeliveryPreferences_Mobile_Schedule_WednesdayQuery
     */
    fetch(): LinearFetch<NotificationDeliveryPreferencesDay | undefined>;
}
/**
 * A fetchable Viewer_AssignedIssues Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Viewer_AssignedIssuesQuery
 */
export declare class Viewer_AssignedIssuesQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Viewer_AssignedIssuesQueryVariables);
    /**
     * Call the Viewer_AssignedIssues query and return a IssueConnection
     *
     * @param variables - variables to pass into the Viewer_AssignedIssuesQuery
     * @returns parsed response from Viewer_AssignedIssuesQuery
     */
    fetch(variables?: L.Viewer_AssignedIssuesQueryVariables): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Viewer_CreatedIssues Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Viewer_CreatedIssuesQuery
 */
export declare class Viewer_CreatedIssuesQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Viewer_CreatedIssuesQueryVariables);
    /**
     * Call the Viewer_CreatedIssues query and return a IssueConnection
     *
     * @param variables - variables to pass into the Viewer_CreatedIssuesQuery
     * @returns parsed response from Viewer_CreatedIssuesQuery
     */
    fetch(variables?: L.Viewer_CreatedIssuesQueryVariables): LinearFetch<IssueConnection>;
}
/**
 * A fetchable Viewer_TeamMemberships Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Viewer_TeamMembershipsQuery
 */
export declare class Viewer_TeamMembershipsQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Viewer_TeamMembershipsQueryVariables);
    /**
     * Call the Viewer_TeamMemberships query and return a TeamMembershipConnection
     *
     * @param variables - variables to pass into the Viewer_TeamMembershipsQuery
     * @returns parsed response from Viewer_TeamMembershipsQuery
     */
    fetch(variables?: L.Viewer_TeamMembershipsQueryVariables): LinearFetch<TeamMembershipConnection>;
}
/**
 * A fetchable Viewer_Teams Query
 *
 * @param request - function to call the graphql client
 * @param variables - variables to pass into the Viewer_TeamsQuery
 */
export declare class Viewer_TeamsQuery extends Request {
    private _variables?;
    constructor(request: LinearRequest, variables?: L.Viewer_TeamsQueryVariables);
    /**
     * Call the Viewer_Teams query and return a TeamConnection
     *
     * @param variables - variables to pass into the Viewer_TeamsQuery
     * @returns parsed response from Viewer_TeamsQuery
     */
    fetch(variables?: L.Viewer_TeamsQueryVariables): LinearFetch<TeamConnection>;
}
/**
 * A fetchable WorkflowState_Issues Query
 *
 * @param request - function to call the graphql client
 * @param id - required id to pass to workflowState
 * @param variables - variables without 'id' to pass into the WorkflowState_IssuesQuery
 */
export declare class WorkflowState_IssuesQuery extends Request {
    private _id;
    private _variables?;
    constructor(request: LinearRequest, id: string, variables?: Omit<L.WorkflowState_IssuesQueryVariables, "id">);
    /**
     * Call the WorkflowState_Issues query and return a IssueConnection
     *
     * @param variables - variables without 'id' to pass into the WorkflowState_IssuesQuery
     * @returns parsed response from WorkflowState_IssuesQuery
     */
    fetch(variables?: Omit<L.WorkflowState_IssuesQueryVariables, "id">): LinearFetch<IssueConnection>;
}
/**
 * The SDK class containing all root operations
 *
 * @param request - function to call the graphql client
 */
export declare class LinearSdk extends Request {
    constructor(request: LinearRequest);
    /**
     * All teams you the user can administrate. Administrable teams are teams whose settings the user can change, but to whose issues the user doesn't necessarily have access to.
     *
     * @param variables - variables to pass into the AdministrableTeamsQuery
     * @returns TeamConnection
     */
    administrableTeams(variables?: L.AdministrableTeamsQueryVariables): LinearFetch<TeamConnection>;
    /**
     * All API keys for the user.
     *
     * @param variables - variables to pass into the ApiKeysQuery
     * @returns ApiKeyConnection
     */
    apiKeys(variables?: L.ApiKeysQueryVariables): LinearFetch<ApiKeyConnection>;
    /**
     * Get basic information for an application.
     *
     * @param clientId - required clientId to pass to applicationInfo
     * @returns Application
     */
    applicationInfo(clientId: string): LinearFetch<Application>;
    /**
     * Get information for an application and whether a user has approved it for the given scopes.
     *
     * @param clientId - required clientId to pass to applicationWithAuthorization
     * @param scope - required scope to pass to applicationWithAuthorization
     * @param variables - variables without 'clientId', 'scope' to pass into the ApplicationWithAuthorizationQuery
     * @returns UserAuthorizedApplication
     */
    applicationWithAuthorization(clientId: string, scope: string[], variables?: Omit<L.ApplicationWithAuthorizationQueryVariables, "clientId" | "scope">): LinearFetch<UserAuthorizedApplication>;
    /**
     * Fetches an archived model.
     *
     * @param identifier - required identifier to pass to archivedModelSync
     * @param modelClass - required modelClass to pass to archivedModelSync
     * @returns ArchiveResponse
     */
    archivedModelSync(identifier: string, modelClass: string): LinearFetch<ArchiveResponse>;
    /**
     * Fetches archived models.
     *
     * @param modelClass - required modelClass to pass to archivedModelsSync
     * @param teamId - required teamId to pass to archivedModelsSync
     * @param variables - variables without 'modelClass', 'teamId' to pass into the ArchivedModelsSyncQuery
     * @returns ArchiveResponse
     */
    archivedModelsSync(modelClass: string, teamId: string, variables?: Omit<L.ArchivedModelsSyncQueryVariables, "modelClass" | "teamId">): LinearFetch<ArchiveResponse>;
    /**
     * One specific issue attachment.
     * [Deprecated] 'url' can no longer be used as the 'id' parameter. Use 'attachmentsForUrl' instead
     *
     * @param id - required id to pass to attachment
     * @returns Attachment
     */
    attachment(id: string): LinearFetch<Attachment>;
    /**
     * Query an issue by its associated attachment, and its id.
     *
     * @param id - required id to pass to attachmentIssue
     * @returns Issue
     */
    attachmentIssue(id: string): LinearFetch<Issue>;
    /**
     * All issue attachments.
     *
     * To get attachments for a given URL, use `attachmentsForURL` query.
     *
     * @param variables - variables to pass into the AttachmentsQuery
     * @returns AttachmentConnection
     */
    attachments(variables?: L.AttachmentsQueryVariables): LinearFetch<AttachmentConnection>;
    /**
     * Returns issue attachments for a given `url`.
     *
     * @param url - required url to pass to attachmentsForURL
     * @param variables - variables without 'url' to pass into the AttachmentsForUrlQuery
     * @returns AttachmentConnection
     */
    attachmentsForURL(url: string, variables?: Omit<L.AttachmentsForUrlQueryVariables, "url">): LinearFetch<AttachmentConnection>;
    /**
     * All audit log entries.
     *
     * @param variables - variables to pass into the AuditEntriesQuery
     * @returns AuditEntryConnection
     */
    auditEntries(variables?: L.AuditEntriesQueryVariables): LinearFetch<AuditEntryConnection>;
    /**
     * List of audit entry types.
     *
     * @returns AuditEntryType[]
     */
    get auditEntryTypes(): LinearFetch<AuditEntryType[]>;
    /**
     * User's active sessions.
     *
     * @returns AuthenticationSessionResponse[]
     */
    get authenticationSessions(): LinearFetch<AuthenticationSessionResponse[]>;
    /**
     * Fetch users belonging to this user account.
     *
     * @returns AuthResolverResponse
     */
    get availableUsers(): LinearFetch<AuthResolverResponse>;
    /**
     * A specific comment.
     *
     * @param variables - variables to pass into the CommentQuery
     * @returns Comment
     */
    comment(variables?: L.CommentQueryVariables): LinearFetch<Comment>;
    /**
     * All comments.
     *
     * @param variables - variables to pass into the CommentsQuery
     * @returns CommentConnection
     */
    comments(variables?: L.CommentsQueryVariables): LinearFetch<CommentConnection>;
    /**
     * One specific custom view.
     *
     * @param id - required id to pass to customView
     * @returns CustomView
     */
    customView(id: string): LinearFetch<CustomView>;
    /**
     * Whether a custom view has other subscribers than the current user in the organization.
     *
     * @param id - required id to pass to customViewHasSubscribers
     * @returns CustomViewHasSubscribersPayload
     */
    customViewHasSubscribers(id: string): LinearFetch<CustomViewHasSubscribersPayload>;
    /**
     * Custom views for the user.
     *
     * @param variables - variables to pass into the CustomViewsQuery
     * @returns CustomViewConnection
     */
    customViews(variables?: L.CustomViewsQueryVariables): LinearFetch<CustomViewConnection>;
    /**
     * One specific cycle.
     *
     * @param id - required id to pass to cycle
     * @returns Cycle
     */
    cycle(id: string): LinearFetch<Cycle>;
    /**
     * All cycles.
     *
     * @param variables - variables to pass into the CyclesQuery
     * @returns CycleConnection
     */
    cycles(variables?: L.CyclesQueryVariables): LinearFetch<CycleConnection>;
    /**
     * One specific diary entry.
     *
     * @param id - required id to pass to diaryEntry
     * @returns DiaryEntry
     */
    diaryEntry(id: string): LinearFetch<DiaryEntry>;
    /**
     * One specific document.
     *
     * @param id - required id to pass to document
     * @returns Document
     */
    document(id: string): LinearFetch<Document>;
    /**
     * A collection of document content history entries.
     *
     * @param id - required id to pass to documentContentHistory
     * @returns DocumentContentHistoryPayload
     */
    documentContentHistory(id: string): LinearFetch<DocumentContentHistoryPayload>;
    /**
     * All documents in the workspace.
     *
     * @param variables - variables to pass into the DocumentsQuery
     * @returns DocumentConnection
     */
    documents(variables?: L.DocumentsQueryVariables): LinearFetch<DocumentConnection>;
    /**
     * A specific emoji.
     *
     * @param id - required id to pass to emoji
     * @returns Emoji
     */
    emoji(id: string): LinearFetch<Emoji>;
    /**
     * All custom emojis.
     *
     * @param variables - variables to pass into the EmojisQuery
     * @returns EmojiConnection
     */
    emojis(variables?: L.EmojisQueryVariables): LinearFetch<EmojiConnection>;
    /**
     * One specific entity link.
     *
     * @param id - required id to pass to entityExternalLink
     * @returns EntityExternalLink
     */
    entityExternalLink(id: string): LinearFetch<EntityExternalLink>;
    /**
     * One specific external user.
     *
     * @param id - required id to pass to externalUser
     * @returns ExternalUser
     */
    externalUser(id: string): LinearFetch<ExternalUser>;
    /**
     * All external users for the organization.
     *
     * @param variables - variables to pass into the ExternalUsersQuery
     * @returns ExternalUserConnection
     */
    externalUsers(variables?: L.ExternalUsersQueryVariables): LinearFetch<ExternalUserConnection>;
    /**
     * One specific favorite.
     *
     * @param id - required id to pass to favorite
     * @returns Favorite
     */
    favorite(id: string): LinearFetch<Favorite>;
    /**
     * The user's favorites.
     *
     * @param variables - variables to pass into the FavoritesQuery
     * @returns FavoriteConnection
     */
    favorites(variables?: L.FavoritesQueryVariables): LinearFetch<FavoriteConnection>;
    /**
     * One specific initiative.
     *
     * @param id - required id to pass to initiative
     * @returns Initiative
     */
    initiative(id: string): LinearFetch<Initiative>;
    /**
     * One specific initiativeToProject.
     *
     * @param id - required id to pass to initiativeToProject
     * @returns InitiativeToProject
     */
    initiativeToProject(id: string): LinearFetch<InitiativeToProject>;
    /**
     * returns a list of initiative to project entities.
     *
     * @param variables - variables to pass into the InitiativeToProjectsQuery
     * @returns InitiativeToProjectConnection
     */
    initiativeToProjects(variables?: L.InitiativeToProjectsQueryVariables): LinearFetch<InitiativeToProjectConnection>;
    /**
     * All initiatives in the workspace.
     *
     * @param variables - variables to pass into the InitiativesQuery
     * @returns InitiativeConnection
     */
    initiatives(variables?: L.InitiativesQueryVariables): LinearFetch<InitiativeConnection>;
    /**
     * One specific integration.
     *
     * @param id - required id to pass to integration
     * @returns Integration
     */
    integration(id: string): LinearFetch<Integration>;
    /**
     * Checks if the integration has all required scopes.
     *
     * @param integrationId - required integrationId to pass to integrationHasScopes
     * @param scopes - required scopes to pass to integrationHasScopes
     * @returns IntegrationHasScopesPayload
     */
    integrationHasScopes(integrationId: string, scopes: string[]): LinearFetch<IntegrationHasScopesPayload>;
    /**
     * One specific integrationTemplate.
     *
     * @param id - required id to pass to integrationTemplate
     * @returns IntegrationTemplate
     */
    integrationTemplate(id: string): LinearFetch<IntegrationTemplate>;
    /**
     * Template and integration connections.
     *
     * @param variables - variables to pass into the IntegrationTemplatesQuery
     * @returns IntegrationTemplateConnection
     */
    integrationTemplates(variables?: L.IntegrationTemplatesQueryVariables): LinearFetch<IntegrationTemplateConnection>;
    /**
     * All integrations.
     *
     * @param variables - variables to pass into the IntegrationsQuery
     * @returns IntegrationConnection
     */
    integrations(variables?: L.IntegrationsQueryVariables): LinearFetch<IntegrationConnection>;
    /**
     * One specific set of settings.
     *
     * @param id - required id to pass to integrationsSettings
     * @returns IntegrationsSettings
     */
    integrationsSettings(id: string): LinearFetch<IntegrationsSettings>;
    /**
     * One specific issue.
     *
     * @param id - required id to pass to issue
     * @returns Issue
     */
    issue(id: string): LinearFetch<Issue>;
    /**
     * Find issues that are related to a given Figma file key.
     *
     * @param fileKey - required fileKey to pass to issueFigmaFileKeySearch
     * @param variables - variables without 'fileKey' to pass into the IssueFigmaFileKeySearchQuery
     * @returns IssueConnection
     */
    issueFigmaFileKeySearch(fileKey: string, variables?: Omit<L.IssueFigmaFileKeySearchQueryVariables, "fileKey">): LinearFetch<IssueConnection>;
    /**
     * Suggests filters for an issue view based on a text prompt.
     *
     * @param prompt - required prompt to pass to issueFilterSuggestion
     * @param variables - variables without 'prompt' to pass into the IssueFilterSuggestionQuery
     * @returns IssueFilterSuggestionPayload
     */
    issueFilterSuggestion(prompt: string, variables?: Omit<L.IssueFilterSuggestionQueryVariables, "prompt">): LinearFetch<IssueFilterSuggestionPayload>;
    /**
     * Checks a CSV file validity against a specific import service.
     *
     * @param csvUrl - required csvUrl to pass to issueImportCheckCSV
     * @param service - required service to pass to issueImportCheckCSV
     * @returns IssueImportCheckPayload
     */
    issueImportCheckCSV(csvUrl: string, service: string): LinearFetch<IssueImportCheckPayload>;
    /**
     * Checks whether it will be possible to setup sync for this project or repository at the end of import
     *
     * @param issueImportId - required issueImportId to pass to issueImportCheckSync
     * @returns IssueImportSyncCheckPayload
     */
    issueImportCheckSync(issueImportId: string): LinearFetch<IssueImportSyncCheckPayload>;
    /**
     * One specific label.
     *
     * @param id - required id to pass to issueLabel
     * @returns IssueLabel
     */
    issueLabel(id: string): LinearFetch<IssueLabel>;
    /**
     * All issue labels.
     *
     * @param variables - variables to pass into the IssueLabelsQuery
     * @returns IssueLabelConnection
     */
    issueLabels(variables?: L.IssueLabelsQueryVariables): LinearFetch<IssueLabelConnection>;
    /**
     * Issue priority values and corresponding labels.
     *
     * @returns IssuePriorityValue[]
     */
    get issuePriorityValues(): LinearFetch<IssuePriorityValue[]>;
    /**
     * One specific issue relation.
     *
     * @param id - required id to pass to issueRelation
     * @returns IssueRelation
     */
    issueRelation(id: string): LinearFetch<IssueRelation>;
    /**
     * All issue relationships.
     *
     * @param variables - variables to pass into the IssueRelationsQuery
     * @returns IssueRelationConnection
     */
    issueRelations(variables?: L.IssueRelationsQueryVariables): LinearFetch<IssueRelationConnection>;
    /**
     * [DEPRECATED] Search issues. This endpoint is deprecated and will be removed in the future – use `searchIssues` instead.
     *
     * @param variables - variables to pass into the IssueSearchQuery
     * @returns IssueConnection
     */
    issueSearch(variables?: L.IssueSearchQueryVariables): LinearFetch<IssueConnection>;
    /**
     * Find issue based on the VCS branch name.
     *
     * @param branchName - required branchName to pass to issueVcsBranchSearch
     * @returns Issue
     */
    issueVcsBranchSearch(branchName: string): LinearFetch<Issue | undefined>;
    /**
     * All issues.
     *
     * @param variables - variables to pass into the IssuesQuery
     * @returns IssueConnection
     */
    issues(variables?: L.IssuesQueryVariables): LinearFetch<IssueConnection>;
    /**
     * One specific notification.
     *
     * @param id - required id to pass to notification
     * @returns Notification
     */
    notification(id: string): LinearFetch<DocumentNotification | InitiativeNotification | IssueNotification | OauthClientApprovalNotification | ProjectNotification | Notification>;
    /**
     * One specific notification subscription.
     *
     * @param id - required id to pass to notificationSubscription
     * @returns NotificationSubscription
     */
    notificationSubscription(id: string): LinearFetch<CustomViewNotificationSubscription | CycleNotificationSubscription | InitiativeNotificationSubscription | LabelNotificationSubscription | ProjectNotificationSubscription | TeamNotificationSubscription | UserNotificationSubscription | NotificationSubscription>;
    /**
     * The user's notification subscriptions.
     *
     * @param variables - variables to pass into the NotificationSubscriptionsQuery
     * @returns NotificationSubscriptionConnection
     */
    notificationSubscriptions(variables?: L.NotificationSubscriptionsQueryVariables): LinearFetch<NotificationSubscriptionConnection>;
    /**
     * All notifications.
     *
     * @param variables - variables to pass into the NotificationsQuery
     * @returns NotificationConnection
     */
    notifications(variables?: L.NotificationsQueryVariables): LinearFetch<NotificationConnection>;
    /**
     * The user's organization.
     *
     * @returns Organization
     */
    get organization(): LinearFetch<Organization>;
    /**
     * Does the organization exist.
     *
     * @param urlKey - required urlKey to pass to organizationExists
     * @returns OrganizationExistsPayload
     */
    organizationExists(urlKey: string): LinearFetch<OrganizationExistsPayload>;
    /**
     * One specific organization invite.
     *
     * @param id - required id to pass to organizationInvite
     * @returns OrganizationInvite
     */
    organizationInvite(id: string): LinearFetch<OrganizationInvite>;
    /**
     * All invites for the organization.
     *
     * @param variables - variables to pass into the OrganizationInvitesQuery
     * @returns OrganizationInviteConnection
     */
    organizationInvites(variables?: L.OrganizationInvitesQueryVariables): LinearFetch<OrganizationInviteConnection>;
    /**
     * One specific project.
     *
     * @param id - required id to pass to project
     * @returns Project
     */
    project(id: string): LinearFetch<Project>;
    /**
     * Suggests filters for a project view based on a text prompt.
     *
     * @param prompt - required prompt to pass to projectFilterSuggestion
     * @returns ProjectFilterSuggestionPayload
     */
    projectFilterSuggestion(prompt: string): LinearFetch<ProjectFilterSuggestionPayload>;
    /**
     * One specific project link.
     *
     * @param id - required id to pass to projectLink
     * @returns ProjectLink
     */
    projectLink(id: string): LinearFetch<ProjectLink>;
    /**
     * All links for the project.
     *
     * @param variables - variables to pass into the ProjectLinksQuery
     * @returns ProjectLinkConnection
     */
    projectLinks(variables?: L.ProjectLinksQueryVariables): LinearFetch<ProjectLinkConnection>;
    /**
     * One specific project milestone.
     *
     * @param id - required id to pass to projectMilestone
     * @returns ProjectMilestone
     */
    projectMilestone(id: string): LinearFetch<ProjectMilestone>;
    /**
     * All milestones for the project.
     *
     * @param variables - variables to pass into the ProjectMilestonesQuery
     * @returns ProjectMilestoneConnection
     */
    projectMilestones(variables?: L.ProjectMilestonesQueryVariables): LinearFetch<ProjectMilestoneConnection>;
    /**
     * One specific project relation.
     *
     * @param id - required id to pass to projectRelation
     * @returns ProjectRelation
     */
    projectRelation(id: string): LinearFetch<ProjectRelation>;
    /**
     * All project relationships.
     *
     * @param variables - variables to pass into the ProjectRelationsQuery
     * @returns ProjectRelationConnection
     */
    projectRelations(variables?: L.ProjectRelationsQueryVariables): LinearFetch<ProjectRelationConnection>;
    /**
     * A specific project update.
     *
     * @param id - required id to pass to projectUpdate
     * @returns ProjectUpdate
     */
    projectUpdate(id: string): LinearFetch<ProjectUpdate>;
    /**
     * A specific interaction on a project update.
     *
     * @param id - required id to pass to projectUpdateInteraction
     * @returns ProjectUpdateInteraction
     */
    projectUpdateInteraction(id: string): LinearFetch<ProjectUpdateInteraction>;
    /**
     * All interactions on project updates.
     *
     * @param variables - variables to pass into the ProjectUpdateInteractionsQuery
     * @returns ProjectUpdateInteractionConnection
     */
    projectUpdateInteractions(variables?: L.ProjectUpdateInteractionsQueryVariables): LinearFetch<ProjectUpdateInteractionConnection>;
    /**
     * All project updates.
     *
     * @param variables - variables to pass into the ProjectUpdatesQuery
     * @returns ProjectUpdateConnection
     */
    projectUpdates(variables?: L.ProjectUpdatesQueryVariables): LinearFetch<ProjectUpdateConnection>;
    /**
     * All projects.
     *
     * @param variables - variables to pass into the ProjectsQuery
     * @returns ProjectConnection
     */
    projects(variables?: L.ProjectsQueryVariables): LinearFetch<ProjectConnection>;
    /**
     * Sends a test push message.
     *
     * @param variables - variables to pass into the PushSubscriptionTestQuery
     * @returns PushSubscriptionTestPayload
     */
    pushSubscriptionTest(variables?: L.PushSubscriptionTestQueryVariables): LinearFetch<PushSubscriptionTestPayload>;
    /**
     * The status of the rate limiter.
     *
     * @returns RateLimitPayload
     */
    get rateLimitStatus(): LinearFetch<RateLimitPayload>;
    /**
     * One specific roadmap.
     *
     * @param id - required id to pass to roadmap
     * @returns Roadmap
     */
    roadmap(id: string): LinearFetch<Roadmap>;
    /**
     * One specific roadmapToProject.
     *
     * @param id - required id to pass to roadmapToProject
     * @returns RoadmapToProject
     */
    roadmapToProject(id: string): LinearFetch<RoadmapToProject>;
    /**
     * Custom views for the user.
     *
     * @param variables - variables to pass into the RoadmapToProjectsQuery
     * @returns RoadmapToProjectConnection
     */
    roadmapToProjects(variables?: L.RoadmapToProjectsQueryVariables): LinearFetch<RoadmapToProjectConnection>;
    /**
     * All roadmaps in the workspace.
     *
     * @param variables - variables to pass into the RoadmapsQuery
     * @returns RoadmapConnection
     */
    roadmaps(variables?: L.RoadmapsQueryVariables): LinearFetch<RoadmapConnection>;
    /**
     * Search documents.
     *
     * @param term - required term to pass to searchDocuments
     * @param variables - variables without 'term' to pass into the SearchDocumentsQuery
     * @returns DocumentSearchPayload
     */
    searchDocuments(term: string, variables?: Omit<L.SearchDocumentsQueryVariables, "term">): LinearFetch<DocumentSearchPayload>;
    /**
     * Search issues.
     *
     * @param term - required term to pass to searchIssues
     * @param variables - variables without 'term' to pass into the SearchIssuesQuery
     * @returns IssueSearchPayload
     */
    searchIssues(term: string, variables?: Omit<L.SearchIssuesQueryVariables, "term">): LinearFetch<IssueSearchPayload>;
    /**
     * Search projects.
     *
     * @param term - required term to pass to searchProjects
     * @param variables - variables without 'term' to pass into the SearchProjectsQuery
     * @returns ProjectSearchPayload
     */
    searchProjects(term: string, variables?: Omit<L.SearchProjectsQueryVariables, "term">): LinearFetch<ProjectSearchPayload>;
    /**
     * Fetch SSO login URL for the email provided.
     *
     * @param email - required email to pass to ssoUrlFromEmail
     * @param variables - variables without 'email' to pass into the SsoUrlFromEmailQuery
     * @returns SsoUrlFromEmailResponse
     */
    ssoUrlFromEmail(email: string, variables?: Omit<L.SsoUrlFromEmailQueryVariables, "email">): LinearFetch<SsoUrlFromEmailResponse>;
    /**
     * Retrieves how many entities the user has access to.
     *
     * @returns EntityCountResponse
     */
    get syncEntityCount(): LinearFetch<EntityCountResponse>;
    /**
     * One specific team.
     *
     * @param id - required id to pass to team
     * @returns Team
     */
    team(id: string): LinearFetch<Team>;
    /**
     * One specific team membership.
     *
     * @param id - required id to pass to teamMembership
     * @returns TeamMembership
     */
    teamMembership(id: string): LinearFetch<TeamMembership>;
    /**
     * All team memberships.
     *
     * @param variables - variables to pass into the TeamMembershipsQuery
     * @returns TeamMembershipConnection
     */
    teamMemberships(variables?: L.TeamMembershipsQueryVariables): LinearFetch<TeamMembershipConnection>;
    /**
     * All teams whose issues can be accessed by the user. This might be different from `administrableTeams`, which also includes teams whose settings can be changed by the user.
     *
     * @param variables - variables to pass into the TeamsQuery
     * @returns TeamConnection
     */
    teams(variables?: L.TeamsQueryVariables): LinearFetch<TeamConnection>;
    /**
     * A specific template.
     *
     * @param id - required id to pass to template
     * @returns Template
     */
    template(id: string): LinearFetch<Template>;
    /**
     * All templates from all users.
     *
     * @returns Template[]
     */
    get templates(): LinearFetch<Template[]>;
    /**
     * Returns all templates that are associated with the integration type.
     *
     * @param integrationType - required integrationType to pass to templatesForIntegration
     * @returns Template[]
     */
    templatesForIntegration(integrationType: string): LinearFetch<Template[]>;
    /**
     * A specific time schedule.
     *
     * @param id - required id to pass to timeSchedule
     * @returns TimeSchedule
     */
    timeSchedule(id: string): LinearFetch<TimeSchedule>;
    /**
     * All time schedules.
     *
     * @param variables - variables to pass into the TimeSchedulesQuery
     * @returns TimeScheduleConnection
     */
    timeSchedules(variables?: L.TimeSchedulesQueryVariables): LinearFetch<TimeScheduleConnection>;
    /**
     * All triage responsibilities.
     *
     * @param variables - variables to pass into the TriageResponsibilitiesQuery
     * @returns TriageResponsibilityConnection
     */
    triageResponsibilities(variables?: L.TriageResponsibilitiesQueryVariables): LinearFetch<TriageResponsibilityConnection>;
    /**
     * A specific triage responsibility.
     *
     * @param id - required id to pass to triageResponsibility
     * @returns TriageResponsibility
     */
    triageResponsibility(id: string): LinearFetch<TriageResponsibility>;
    /**
     * One specific user.
     *
     * @param id - required id to pass to user
     * @returns User
     */
    user(id: string): LinearFetch<User>;
    /**
     * The user's settings.
     *
     * @returns UserSettings
     */
    get userSettings(): LinearFetch<UserSettings>;
    /**
     * All users for the organization.
     *
     * @param variables - variables to pass into the UsersQuery
     * @returns UserConnection
     */
    users(variables?: L.UsersQueryVariables): LinearFetch<UserConnection>;
    /**
     * Verify that we received the correct response from the GitHub Enterprise Server.
     *
     * @returns GitHubEnterpriseServerInstallVerificationPayload
     */
    get verifyGitHubEnterpriseServerInstallation(): LinearFetch<GitHubEnterpriseServerInstallVerificationPayload>;
    /**
     * The currently authenticated user.
     *
     * @returns User
     */
    get viewer(): LinearFetch<User>;
    /**
     * A specific webhook.
     *
     * @param id - required id to pass to webhook
     * @returns Webhook
     */
    webhook(id: string): LinearFetch<Webhook>;
    /**
     * All webhooks.
     *
     * @param variables - variables to pass into the WebhooksQuery
     * @returns WebhookConnection
     */
    webhooks(variables?: L.WebhooksQueryVariables): LinearFetch<WebhookConnection>;
    /**
     * One specific state.
     *
     * @param id - required id to pass to workflowState
     * @returns WorkflowState
     */
    workflowState(id: string): LinearFetch<WorkflowState>;
    /**
     * All issue workflow states.
     *
     * @param variables - variables to pass into the WorkflowStatesQuery
     * @returns WorkflowStateConnection
     */
    workflowStates(variables?: L.WorkflowStatesQueryVariables): LinearFetch<WorkflowStateConnection>;
    /**
     * Creates an integration api key for Airbyte to connect with Linear.
     *
     * @param input - required input to pass to airbyteIntegrationConnect
     * @returns IntegrationPayload
     */
    airbyteIntegrationConnect(input: L.AirbyteConfigurationInput): LinearFetch<IntegrationPayload>;
    /**
     * [DEPRECATED] Archives an issue attachment.
     *
     * @param id - required id to pass to archiveAttachment
     * @returns AttachmentArchivePayload
     */
    archiveAttachment(id: string): LinearFetch<AttachmentArchivePayload>;
    /**
     * Creates a new attachment, or updates existing if the same `url` and `issueId` is used.
     *
     * @param input - required input to pass to createAttachment
     * @returns AttachmentPayload
     */
    createAttachment(input: L.AttachmentCreateInput): LinearFetch<AttachmentPayload>;
    /**
     * Deletes an issue attachment.
     *
     * @param id - required id to pass to deleteAttachment
     * @returns DeletePayload
     */
    deleteAttachment(id: string): LinearFetch<DeletePayload>;
    /**
     * Link an existing Discord message to an issue.
     *
     * @param channelId - required channelId to pass to attachmentLinkDiscord
     * @param issueId - required issueId to pass to attachmentLinkDiscord
     * @param messageId - required messageId to pass to attachmentLinkDiscord
     * @param url - required url to pass to attachmentLinkDiscord
     * @param variables - variables without 'channelId', 'issueId', 'messageId', 'url' to pass into the AttachmentLinkDiscordMutation
     * @returns AttachmentPayload
     */
    attachmentLinkDiscord(channelId: string, issueId: string, messageId: string, url: string, variables?: Omit<L.AttachmentLinkDiscordMutationVariables, "channelId" | "issueId" | "messageId" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing Front conversation to an issue.
     *
     * @param conversationId - required conversationId to pass to attachmentLinkFront
     * @param issueId - required issueId to pass to attachmentLinkFront
     * @param variables - variables without 'conversationId', 'issueId' to pass into the AttachmentLinkFrontMutation
     * @returns FrontAttachmentPayload
     */
    attachmentLinkFront(conversationId: string, issueId: string, variables?: Omit<L.AttachmentLinkFrontMutationVariables, "conversationId" | "issueId">): LinearFetch<FrontAttachmentPayload>;
    /**
     * Link a GitHub issue to a Linear issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkGitHubIssue
     * @param url - required url to pass to attachmentLinkGitHubIssue
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkGitHubIssueMutation
     * @returns AttachmentPayload
     */
    attachmentLinkGitHubIssue(issueId: string, url: string, variables?: Omit<L.AttachmentLinkGitHubIssueMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link a GitHub pull request to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkGitHubPR
     * @param url - required url to pass to attachmentLinkGitHubPR
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkGitHubPrMutation
     * @returns AttachmentPayload
     */
    attachmentLinkGitHubPR(issueId: string, url: string, variables?: Omit<L.AttachmentLinkGitHubPrMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing GitLab MR to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkGitLabMR
     * @param number - required number to pass to attachmentLinkGitLabMR
     * @param projectPathWithNamespace - required projectPathWithNamespace to pass to attachmentLinkGitLabMR
     * @param url - required url to pass to attachmentLinkGitLabMR
     * @param variables - variables without 'issueId', 'number', 'projectPathWithNamespace', 'url' to pass into the AttachmentLinkGitLabMrMutation
     * @returns AttachmentPayload
     */
    attachmentLinkGitLabMR(issueId: string, number: number, projectPathWithNamespace: string, url: string, variables?: Omit<L.AttachmentLinkGitLabMrMutationVariables, "issueId" | "number" | "projectPathWithNamespace" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing Intercom conversation to an issue.
     *
     * @param conversationId - required conversationId to pass to attachmentLinkIntercom
     * @param issueId - required issueId to pass to attachmentLinkIntercom
     * @param variables - variables without 'conversationId', 'issueId' to pass into the AttachmentLinkIntercomMutation
     * @returns AttachmentPayload
     */
    attachmentLinkIntercom(conversationId: string, issueId: string, variables?: Omit<L.AttachmentLinkIntercomMutationVariables, "conversationId" | "issueId">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing Jira issue to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkJiraIssue
     * @param jiraIssueId - required jiraIssueId to pass to attachmentLinkJiraIssue
     * @param variables - variables without 'issueId', 'jiraIssueId' to pass into the AttachmentLinkJiraIssueMutation
     * @returns AttachmentPayload
     */
    attachmentLinkJiraIssue(issueId: string, jiraIssueId: string, variables?: Omit<L.AttachmentLinkJiraIssueMutationVariables, "issueId" | "jiraIssueId">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing Slack message to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkSlack
     * @param url - required url to pass to attachmentLinkSlack
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkSlackMutation
     * @returns AttachmentPayload
     */
    attachmentLinkSlack(issueId: string, url: string, variables?: Omit<L.AttachmentLinkSlackMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link any url to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkURL
     * @param url - required url to pass to attachmentLinkURL
     * @param variables - variables without 'issueId', 'url' to pass into the AttachmentLinkUrlMutation
     * @returns AttachmentPayload
     */
    attachmentLinkURL(issueId: string, url: string, variables?: Omit<L.AttachmentLinkUrlMutationVariables, "issueId" | "url">): LinearFetch<AttachmentPayload>;
    /**
     * Link an existing Zendesk ticket to an issue.
     *
     * @param issueId - required issueId to pass to attachmentLinkZendesk
     * @param ticketId - required ticketId to pass to attachmentLinkZendesk
     * @param variables - variables without 'issueId', 'ticketId' to pass into the AttachmentLinkZendeskMutation
     * @returns AttachmentPayload
     */
    attachmentLinkZendesk(issueId: string, ticketId: string, variables?: Omit<L.AttachmentLinkZendeskMutationVariables, "issueId" | "ticketId">): LinearFetch<AttachmentPayload>;
    /**
     * Begin syncing the thread for an existing Slack message attachment with a comment thread on its issue.
     *
     * @param id - required id to pass to attachmentSyncToSlack
     * @returns AttachmentPayload
     */
    attachmentSyncToSlack(id: string): LinearFetch<AttachmentPayload>;
    /**
     * Updates an existing issue attachment.
     *
     * @param id - required id to pass to updateAttachment
     * @param input - required input to pass to updateAttachment
     * @returns AttachmentPayload
     */
    updateAttachment(id: string, input: L.AttachmentUpdateInput): LinearFetch<AttachmentPayload>;
    /**
     * Creates a new comment.
     *
     * @param input - required input to pass to createComment
     * @returns CommentPayload
     */
    createComment(input: L.CommentCreateInput): LinearFetch<CommentPayload>;
    /**
     * Deletes a comment.
     *
     * @param id - required id to pass to deleteComment
     * @returns DeletePayload
     */
    deleteComment(id: string): LinearFetch<DeletePayload>;
    /**
     * Resolves a comment.
     *
     * @param id - required id to pass to commentResolve
     * @param variables - variables without 'id' to pass into the CommentResolveMutation
     * @returns CommentPayload
     */
    commentResolve(id: string, variables?: Omit<L.CommentResolveMutationVariables, "id">): LinearFetch<CommentPayload>;
    /**
     * Unresolves a comment.
     *
     * @param id - required id to pass to commentUnresolve
     * @returns CommentPayload
     */
    commentUnresolve(id: string): LinearFetch<CommentPayload>;
    /**
     * Updates a comment.
     *
     * @param id - required id to pass to updateComment
     * @param input - required input to pass to updateComment
     * @returns CommentPayload
     */
    updateComment(id: string, input: L.CommentUpdateInput): LinearFetch<CommentPayload>;
    /**
     * Saves user message.
     *
     * @param input - required input to pass to createContact
     * @returns ContactPayload
     */
    createContact(input: L.ContactCreateInput): LinearFetch<ContactPayload>;
    /**
     * Create CSV export report for the organization.
     *
     * @param variables - variables to pass into the CreateCsvExportReportMutation
     * @returns CreateCsvExportReportPayload
     */
    createCsvExportReport(variables?: L.CreateCsvExportReportMutationVariables): LinearFetch<CreateCsvExportReportPayload>;
    /**
     * Creates an organization from onboarding.
     *
     * @param input - required input to pass to createOrganizationFromOnboarding
     * @param variables - variables without 'input' to pass into the CreateOrganizationFromOnboardingMutation
     * @returns CreateOrJoinOrganizationResponse
     */
    createOrganizationFromOnboarding(input: L.CreateOrganizationInput, variables?: Omit<L.CreateOrganizationFromOnboardingMutationVariables, "input">): LinearFetch<CreateOrJoinOrganizationResponse>;
    /**
     * Create a notification to remind a user about a project update.
     *
     * @param projectId - required projectId to pass to createProjectUpdateReminder
     * @param variables - variables without 'projectId' to pass into the CreateProjectUpdateReminderMutation
     * @returns ProjectUpdateReminderPayload
     */
    createProjectUpdateReminder(projectId: string, variables?: Omit<L.CreateProjectUpdateReminderMutationVariables, "projectId">): LinearFetch<ProjectUpdateReminderPayload>;
    /**
     * Creates a new custom view.
     *
     * @param input - required input to pass to createCustomView
     * @returns CustomViewPayload
     */
    createCustomView(input: L.CustomViewCreateInput): LinearFetch<CustomViewPayload>;
    /**
     * Deletes a custom view.
     *
     * @param id - required id to pass to deleteCustomView
     * @returns DeletePayload
     */
    deleteCustomView(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a custom view.
     *
     * @param id - required id to pass to updateCustomView
     * @param input - required input to pass to updateCustomView
     * @returns CustomViewPayload
     */
    updateCustomView(id: string, input: L.CustomViewUpdateInput): LinearFetch<CustomViewPayload>;
    /**
     * Archives a cycle.
     *
     * @param id - required id to pass to archiveCycle
     * @returns CycleArchivePayload
     */
    archiveCycle(id: string): LinearFetch<CycleArchivePayload>;
    /**
     * Creates a new cycle.
     *
     * @param input - required input to pass to createCycle
     * @returns CyclePayload
     */
    createCycle(input: L.CycleCreateInput): LinearFetch<CyclePayload>;
    /**
     * Shifts all cycles starts and ends by a certain number of days, starting from the provided cycle onwards.
     *
     * @param input - required input to pass to cycleShiftAll
     * @returns CyclePayload
     */
    cycleShiftAll(input: L.CycleShiftAllInput): LinearFetch<CyclePayload>;
    /**
     * Shifts all cycles starts and ends by a certain number of days, starting from the provided cycle onwards.
     *
     * @param id - required id to pass to cycleStartUpcomingCycleToday
     * @returns CyclePayload
     */
    cycleStartUpcomingCycleToday(id: string): LinearFetch<CyclePayload>;
    /**
     * Updates a cycle.
     *
     * @param id - required id to pass to updateCycle
     * @param input - required input to pass to updateCycle
     * @returns CyclePayload
     */
    updateCycle(id: string, input: L.CycleUpdateInput): LinearFetch<CyclePayload>;
    /**
     * Creates a new diary entry.
     *
     * @param input - required input to pass to createDiaryEntry
     * @returns DiaryEntryPayload
     */
    createDiaryEntry(input: L.DiaryEntryCreateInput): LinearFetch<DiaryEntryPayload>;
    /**
     * Deletes a diaryEntry.
     *
     * @param id - required id to pass to deleteDiaryEntry
     * @returns DeletePayload
     */
    deleteDiaryEntry(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a diaryEntry.
     *
     * @param id - required id to pass to updateDiaryEntry
     * @param input - required input to pass to updateDiaryEntry
     * @returns DiaryEntryPayload
     */
    updateDiaryEntry(id: string, input: L.DiaryEntryUpdateInput): LinearFetch<DiaryEntryPayload>;
    /**
     * Creates a new document.
     *
     * @param input - required input to pass to createDocument
     * @returns DocumentPayload
     */
    createDocument(input: L.DocumentCreateInput): LinearFetch<DocumentPayload>;
    /**
     * Deletes (trashes) a document.
     *
     * @param id - required id to pass to deleteDocument
     * @returns DocumentArchivePayload
     */
    deleteDocument(id: string): LinearFetch<DocumentArchivePayload>;
    /**
     * Restores a document.
     *
     * @param id - required id to pass to unarchiveDocument
     * @returns DocumentArchivePayload
     */
    unarchiveDocument(id: string): LinearFetch<DocumentArchivePayload>;
    /**
     * Updates a document.
     *
     * @param id - required id to pass to updateDocument
     * @param input - required input to pass to updateDocument
     * @returns DocumentPayload
     */
    updateDocument(id: string, input: L.DocumentUpdateInput): LinearFetch<DocumentPayload>;
    /**
     * Creates a new email intake address.
     *
     * @param input - required input to pass to createEmailIntakeAddress
     * @returns EmailIntakeAddressPayload
     */
    createEmailIntakeAddress(input: L.EmailIntakeAddressCreateInput): LinearFetch<EmailIntakeAddressPayload>;
    /**
     * Deletes an email intake address object.
     *
     * @param id - required id to pass to deleteEmailIntakeAddress
     * @returns DeletePayload
     */
    deleteEmailIntakeAddress(id: string): LinearFetch<DeletePayload>;
    /**
     * Rotates an existing email intake address.
     *
     * @param id - required id to pass to emailIntakeAddressRotate
     * @returns EmailIntakeAddressPayload
     */
    emailIntakeAddressRotate(id: string): LinearFetch<EmailIntakeAddressPayload>;
    /**
     * Updates an existing email intake address.
     *
     * @param id - required id to pass to updateEmailIntakeAddress
     * @param input - required input to pass to updateEmailIntakeAddress
     * @returns EmailIntakeAddressPayload
     */
    updateEmailIntakeAddress(id: string, input: L.EmailIntakeAddressUpdateInput): LinearFetch<EmailIntakeAddressPayload>;
    /**
     * Authenticates a user account via email and authentication token.
     *
     * @param input - required input to pass to emailTokenUserAccountAuth
     * @returns AuthResolverResponse
     */
    emailTokenUserAccountAuth(input: L.TokenUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
    /**
     * Unsubscribes the user from one type of email.
     *
     * @param input - required input to pass to emailUnsubscribe
     * @returns EmailUnsubscribePayload
     */
    emailUnsubscribe(input: L.EmailUnsubscribeInput): LinearFetch<EmailUnsubscribePayload>;
    /**
     * Finds or creates a new user account by email and sends an email with token.
     *
     * @param input - required input to pass to emailUserAccountAuthChallenge
     * @returns EmailUserAccountAuthChallengeResponse
     */
    emailUserAccountAuthChallenge(input: L.EmailUserAccountAuthChallengeInput): LinearFetch<EmailUserAccountAuthChallengeResponse>;
    /**
     * Creates a custom emoji.
     *
     * @param input - required input to pass to createEmoji
     * @returns EmojiPayload
     */
    createEmoji(input: L.EmojiCreateInput): LinearFetch<EmojiPayload>;
    /**
     * Deletes an emoji.
     *
     * @param id - required id to pass to deleteEmoji
     * @returns DeletePayload
     */
    deleteEmoji(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new entity link.
     *
     * @param input - required input to pass to createEntityExternalLink
     * @returns EntityExternalLinkPayload
     */
    createEntityExternalLink(input: L.EntityExternalLinkCreateInput): LinearFetch<EntityExternalLinkPayload>;
    /**
     * Deletes an entity link.
     *
     * @param id - required id to pass to deleteEntityExternalLink
     * @returns DeletePayload
     */
    deleteEntityExternalLink(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an entity link.
     *
     * @param id - required id to pass to updateEntityExternalLink
     * @param input - required input to pass to updateEntityExternalLink
     * @returns EntityExternalLinkPayload
     */
    updateEntityExternalLink(id: string, input: L.EntityExternalLinkUpdateInput): LinearFetch<EntityExternalLinkPayload>;
    /**
     * Creates a new favorite (project, cycle etc).
     *
     * @param input - required input to pass to createFavorite
     * @returns FavoritePayload
     */
    createFavorite(input: L.FavoriteCreateInput): LinearFetch<FavoritePayload>;
    /**
     * Deletes a favorite reference.
     *
     * @param id - required id to pass to deleteFavorite
     * @returns DeletePayload
     */
    deleteFavorite(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a favorite.
     *
     * @param id - required id to pass to updateFavorite
     * @param input - required input to pass to updateFavorite
     * @returns FavoritePayload
     */
    updateFavorite(id: string, input: L.FavoriteUpdateInput): LinearFetch<FavoritePayload>;
    /**
     * XHR request payload to upload an images, video and other attachments directly to Linear's cloud storage.
     *
     * @param contentType - required contentType to pass to fileUpload
     * @param filename - required filename to pass to fileUpload
     * @param size - required size to pass to fileUpload
     * @param variables - variables without 'contentType', 'filename', 'size' to pass into the FileUploadMutation
     * @returns UploadPayload
     */
    fileUpload(contentType: string, filename: string, size: number, variables?: Omit<L.FileUploadMutationVariables, "contentType" | "filename" | "size">): LinearFetch<UploadPayload>;
    /**
     * Creates a new automation state.
     *
     * @param input - required input to pass to createGitAutomationState
     * @returns GitAutomationStatePayload
     */
    createGitAutomationState(input: L.GitAutomationStateCreateInput): LinearFetch<GitAutomationStatePayload>;
    /**
     * Archives an automation state.
     *
     * @param id - required id to pass to deleteGitAutomationState
     * @returns DeletePayload
     */
    deleteGitAutomationState(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing state.
     *
     * @param id - required id to pass to updateGitAutomationState
     * @param input - required input to pass to updateGitAutomationState
     * @returns GitAutomationStatePayload
     */
    updateGitAutomationState(id: string, input: L.GitAutomationStateUpdateInput): LinearFetch<GitAutomationStatePayload>;
    /**
     * Creates a Git target branch automation.
     *
     * @param input - required input to pass to createGitAutomationTargetBranch
     * @returns GitAutomationTargetBranchPayload
     */
    createGitAutomationTargetBranch(input: L.GitAutomationTargetBranchCreateInput): LinearFetch<GitAutomationTargetBranchPayload>;
    /**
     * Archives a Git target branch automation.
     *
     * @param id - required id to pass to deleteGitAutomationTargetBranch
     * @returns DeletePayload
     */
    deleteGitAutomationTargetBranch(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing Git target branch automation.
     *
     * @param id - required id to pass to updateGitAutomationTargetBranch
     * @param input - required input to pass to updateGitAutomationTargetBranch
     * @returns GitAutomationTargetBranchPayload
     */
    updateGitAutomationTargetBranch(id: string, input: L.GitAutomationTargetBranchUpdateInput): LinearFetch<GitAutomationTargetBranchPayload>;
    /**
     * Authenticate user account through Google OAuth. This is the 2nd step of OAuth flow.
     *
     * @param input - required input to pass to googleUserAccountAuth
     * @returns AuthResolverResponse
     */
    googleUserAccountAuth(input: L.GoogleUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
    /**
     * Upload an image from an URL to Linear.
     *
     * @param url - required url to pass to imageUploadFromUrl
     * @returns ImageUploadFromUrlPayload
     */
    imageUploadFromUrl(url: string): LinearFetch<ImageUploadFromUrlPayload>;
    /**
     * XHR request payload to upload a file for import, directly to Linear's cloud storage.
     *
     * @param contentType - required contentType to pass to importFileUpload
     * @param filename - required filename to pass to importFileUpload
     * @param size - required size to pass to importFileUpload
     * @param variables - variables without 'contentType', 'filename', 'size' to pass into the ImportFileUploadMutation
     * @returns UploadPayload
     */
    importFileUpload(contentType: string, filename: string, size: number, variables?: Omit<L.ImportFileUploadMutationVariables, "contentType" | "filename" | "size">): LinearFetch<UploadPayload>;
    /**
     * Archives a initiative.
     *
     * @param id - required id to pass to archiveInitiative
     * @returns InitiativeArchivePayload
     */
    archiveInitiative(id: string): LinearFetch<InitiativeArchivePayload>;
    /**
     * Creates a new initiative.
     *
     * @param input - required input to pass to createInitiative
     * @returns InitiativePayload
     */
    createInitiative(input: L.InitiativeCreateInput): LinearFetch<InitiativePayload>;
    /**
     * Deletes (trashes) an initiative.
     *
     * @param id - required id to pass to deleteInitiative
     * @returns DeletePayload
     */
    deleteInitiative(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new initiativeToProject join.
     *
     * @param input - required input to pass to createInitiativeToProject
     * @returns InitiativeToProjectPayload
     */
    createInitiativeToProject(input: L.InitiativeToProjectCreateInput): LinearFetch<InitiativeToProjectPayload>;
    /**
     * Deletes a initiativeToProject.
     *
     * @param id - required id to pass to deleteInitiativeToProject
     * @returns DeletePayload
     */
    deleteInitiativeToProject(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a initiativeToProject.
     *
     * @param id - required id to pass to updateInitiativeToProject
     * @param input - required input to pass to updateInitiativeToProject
     * @returns InitiativeToProjectPayload
     */
    updateInitiativeToProject(id: string, input: L.InitiativeToProjectUpdateInput): LinearFetch<InitiativeToProjectPayload>;
    /**
     * Unarchives a initiative.
     *
     * @param id - required id to pass to unarchiveInitiative
     * @returns InitiativeArchivePayload
     */
    unarchiveInitiative(id: string): LinearFetch<InitiativeArchivePayload>;
    /**
     * Updates a initiative.
     *
     * @param id - required id to pass to updateInitiative
     * @param input - required input to pass to updateInitiative
     * @returns InitiativePayload
     */
    updateInitiative(id: string, input: L.InitiativeUpdateInput): LinearFetch<InitiativePayload>;
    /**
     * Archives an integration.
     *
     * @param id - required id to pass to archiveIntegration
     * @returns DeletePayload
     */
    archiveIntegration(id: string): LinearFetch<DeletePayload>;
    /**
     * Connect a Slack channel to Asks.
     *
     * @param code - required code to pass to integrationAsksConnectChannel
     * @param redirectUri - required redirectUri to pass to integrationAsksConnectChannel
     * @returns AsksChannelConnectPayload
     */
    integrationAsksConnectChannel(code: string, redirectUri: string): LinearFetch<AsksChannelConnectPayload>;
    /**
     * Deletes an integration.
     *
     * @param id - required id to pass to deleteIntegration
     * @returns DeletePayload
     */
    deleteIntegration(id: string): LinearFetch<DeletePayload>;
    /**
     * Integrates the organization with Discord.
     *
     * @param code - required code to pass to integrationDiscord
     * @param redirectUri - required redirectUri to pass to integrationDiscord
     * @returns IntegrationPayload
     */
    integrationDiscord(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Integrates the organization with Figma.
     *
     * @param code - required code to pass to integrationFigma
     * @param redirectUri - required redirectUri to pass to integrationFigma
     * @returns IntegrationPayload
     */
    integrationFigma(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Integrates the organization with Front.
     *
     * @param code - required code to pass to integrationFront
     * @param redirectUri - required redirectUri to pass to integrationFront
     * @returns IntegrationPayload
     */
    integrationFront(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Connects the organization with a GitHub Enterprise Server.
     *
     * @param githubUrl - required githubUrl to pass to integrationGitHubEnterpriseServerConnect
     * @param variables - variables without 'githubUrl' to pass into the IntegrationGitHubEnterpriseServerConnectMutation
     * @returns GitHubEnterpriseServerPayload
     */
    integrationGitHubEnterpriseServerConnect(githubUrl: string, variables?: Omit<L.IntegrationGitHubEnterpriseServerConnectMutationVariables, "githubUrl">): LinearFetch<GitHubEnterpriseServerPayload>;
    /**
     * Connect your GitHub account to Linear.
     *
     * @param code - required code to pass to integrationGitHubPersonal
     * @returns IntegrationPayload
     */
    integrationGitHubPersonal(code: string): LinearFetch<IntegrationPayload>;
    /**
     * Generates a webhook for the GitHub commit integration.
     *
     * @returns GitHubCommitIntegrationPayload
     */
    get createIntegrationGithubCommit(): LinearFetch<GitHubCommitIntegrationPayload>;
    /**
     * Connects the organization with the GitHub App.
     *
     * @param installationId - required installationId to pass to integrationGithubConnect
     * @returns IntegrationPayload
     */
    integrationGithubConnect(installationId: string): LinearFetch<IntegrationPayload>;
    /**
     * Connects the organization with the GitHub Import App.
     *
     * @param installationId - required installationId to pass to integrationGithubImportConnect
     * @returns IntegrationPayload
     */
    integrationGithubImportConnect(installationId: string): LinearFetch<IntegrationPayload>;
    /**
     * Connects the organization with a GitLab Access Token.
     *
     * @param accessToken - required accessToken to pass to integrationGitlabConnect
     * @param gitlabUrl - required gitlabUrl to pass to integrationGitlabConnect
     * @returns GitLabIntegrationCreatePayload
     */
    integrationGitlabConnect(accessToken: string, gitlabUrl: string): LinearFetch<GitLabIntegrationCreatePayload>;
    /**
     * Integrates the organization with Google Sheets.
     *
     * @param code - required code to pass to integrationGoogleSheets
     * @returns IntegrationPayload
     */
    integrationGoogleSheets(code: string): LinearFetch<IntegrationPayload>;
    /**
     * Integrates the organization with Intercom.
     *
     * @param code - required code to pass to integrationIntercom
     * @param redirectUri - required redirectUri to pass to integrationIntercom
     * @param variables - variables without 'code', 'redirectUri' to pass into the IntegrationIntercomMutation
     * @returns IntegrationPayload
     */
    integrationIntercom(code: string, redirectUri: string, variables?: Omit<L.IntegrationIntercomMutationVariables, "code" | "redirectUri">): LinearFetch<IntegrationPayload>;
    /**
     * Disconnects the organization from Intercom.
     *
     * @returns IntegrationPayload
     */
    get deleteIntegrationIntercom(): LinearFetch<IntegrationPayload>;
    /**
     * [DEPRECATED] Updates settings on the Intercom integration.
     *
     * @param input - required input to pass to updateIntegrationIntercomSettings
     * @returns IntegrationPayload
     */
    updateIntegrationIntercomSettings(input: L.IntercomSettingsInput): LinearFetch<IntegrationPayload>;
    /**
     * Connect your Jira account to Linear.
     *
     * @param variables - variables to pass into the IntegrationJiraPersonalMutation
     * @returns IntegrationPayload
     */
    integrationJiraPersonal(variables?: L.IntegrationJiraPersonalMutationVariables): LinearFetch<IntegrationPayload>;
    /**
     * Enables Loom integration for the organization.
     *
     * @returns IntegrationPayload
     */
    get integrationLoom(): LinearFetch<IntegrationPayload>;
    /**
     * Requests a currently unavailable integration.
     *
     * @param input - required input to pass to integrationRequest
     * @returns IntegrationRequestPayload
     */
    integrationRequest(input: L.IntegrationRequestInput): LinearFetch<IntegrationRequestPayload>;
    /**
     * Integrates the organization with Sentry.
     *
     * @param code - required code to pass to integrationSentryConnect
     * @param installationId - required installationId to pass to integrationSentryConnect
     * @param organizationSlug - required organizationSlug to pass to integrationSentryConnect
     * @returns IntegrationPayload
     */
    integrationSentryConnect(code: string, installationId: string, organizationSlug: string): LinearFetch<IntegrationPayload>;
    /**
     * Integrates the organization with Slack.
     *
     * @param code - required code to pass to integrationSlack
     * @param redirectUri - required redirectUri to pass to integrationSlack
     * @param variables - variables without 'code', 'redirectUri' to pass into the IntegrationSlackMutation
     * @returns IntegrationPayload
     */
    integrationSlack(code: string, redirectUri: string, variables?: Omit<L.IntegrationSlackMutationVariables, "code" | "redirectUri">): LinearFetch<IntegrationPayload>;
    /**
     * Integrates the organization with the Slack Asks app.
     *
     * @param code - required code to pass to integrationSlackAsks
     * @param redirectUri - required redirectUri to pass to integrationSlackAsks
     * @returns IntegrationPayload
     */
    integrationSlackAsks(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Slack integration for custom view notifications.
     *
     * @param code - required code to pass to integrationSlackCustomViewNotifications
     * @param customViewId - required customViewId to pass to integrationSlackCustomViewNotifications
     * @param redirectUri - required redirectUri to pass to integrationSlackCustomViewNotifications
     * @returns SlackChannelConnectPayload
     */
    integrationSlackCustomViewNotifications(code: string, customViewId: string, redirectUri: string): LinearFetch<SlackChannelConnectPayload>;
    /**
     * Imports custom emojis from your Slack workspace.
     *
     * @param code - required code to pass to integrationSlackImportEmojis
     * @param redirectUri - required redirectUri to pass to integrationSlackImportEmojis
     * @returns IntegrationPayload
     */
    integrationSlackImportEmojis(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Slack integration for organization level project update notifications.
     *
     * @param code - required code to pass to integrationSlackOrgProjectUpdatesPost
     * @param redirectUri - required redirectUri to pass to integrationSlackOrgProjectUpdatesPost
     * @returns SlackChannelConnectPayload
     */
    integrationSlackOrgProjectUpdatesPost(code: string, redirectUri: string): LinearFetch<SlackChannelConnectPayload>;
    /**
     * Integrates your personal notifications with Slack.
     *
     * @param code - required code to pass to integrationSlackPersonal
     * @param redirectUri - required redirectUri to pass to integrationSlackPersonal
     * @returns IntegrationPayload
     */
    integrationSlackPersonal(code: string, redirectUri: string): LinearFetch<IntegrationPayload>;
    /**
     * Slack integration for team notifications.
     *
     * @param code - required code to pass to integrationSlackPost
     * @param redirectUri - required redirectUri to pass to integrationSlackPost
     * @param teamId - required teamId to pass to integrationSlackPost
     * @param variables - variables without 'code', 'redirectUri', 'teamId' to pass into the IntegrationSlackPostMutation
     * @returns SlackChannelConnectPayload
     */
    integrationSlackPost(code: string, redirectUri: string, teamId: string, variables?: Omit<L.IntegrationSlackPostMutationVariables, "code" | "redirectUri" | "teamId">): LinearFetch<SlackChannelConnectPayload>;
    /**
     * Slack integration for project notifications.
     *
     * @param code - required code to pass to integrationSlackProjectPost
     * @param projectId - required projectId to pass to integrationSlackProjectPost
     * @param redirectUri - required redirectUri to pass to integrationSlackProjectPost
     * @param service - required service to pass to integrationSlackProjectPost
     * @returns SlackChannelConnectPayload
     */
    integrationSlackProjectPost(code: string, projectId: string, redirectUri: string, service: string): LinearFetch<SlackChannelConnectPayload>;
    /**
     * Creates a new integrationTemplate join.
     *
     * @param input - required input to pass to createIntegrationTemplate
     * @returns IntegrationTemplatePayload
     */
    createIntegrationTemplate(input: L.IntegrationTemplateCreateInput): LinearFetch<IntegrationTemplatePayload>;
    /**
     * Deletes a integrationTemplate.
     *
     * @param id - required id to pass to deleteIntegrationTemplate
     * @returns DeletePayload
     */
    deleteIntegrationTemplate(id: string): LinearFetch<DeletePayload>;
    /**
     * Integrates the organization with Zendesk.
     *
     * @param code - required code to pass to integrationZendesk
     * @param redirectUri - required redirectUri to pass to integrationZendesk
     * @param scope - required scope to pass to integrationZendesk
     * @param subdomain - required subdomain to pass to integrationZendesk
     * @returns IntegrationPayload
     */
    integrationZendesk(code: string, redirectUri: string, scope: string, subdomain: string): LinearFetch<IntegrationPayload>;
    /**
     * Creates new settings for one or more integrations.
     *
     * @param input - required input to pass to createIntegrationsSettings
     * @returns IntegrationsSettingsPayload
     */
    createIntegrationsSettings(input: L.IntegrationsSettingsCreateInput): LinearFetch<IntegrationsSettingsPayload>;
    /**
     * Updates settings related to integrations for a project or a team.
     *
     * @param id - required id to pass to updateIntegrationsSettings
     * @param input - required input to pass to updateIntegrationsSettings
     * @returns IntegrationsSettingsPayload
     */
    updateIntegrationsSettings(id: string, input: L.IntegrationsSettingsUpdateInput): LinearFetch<IntegrationsSettingsPayload>;
    /**
     * Adds a label to an issue.
     *
     * @param id - required id to pass to issueAddLabel
     * @param labelId - required labelId to pass to issueAddLabel
     * @returns IssuePayload
     */
    issueAddLabel(id: string, labelId: string): LinearFetch<IssuePayload>;
    /**
     * Archives an issue.
     *
     * @param id - required id to pass to archiveIssue
     * @param variables - variables without 'id' to pass into the ArchiveIssueMutation
     * @returns IssueArchivePayload
     */
    archiveIssue(id: string, variables?: Omit<L.ArchiveIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
    /**
     * Updates multiple issues at once.
     *
     * @param ids - required ids to pass to updateIssueBatch
     * @param input - required input to pass to updateIssueBatch
     * @returns IssueBatchPayload
     */
    updateIssueBatch(ids: L.Scalars["UUID"][], input: L.IssueUpdateInput): LinearFetch<IssueBatchPayload>;
    /**
     * Creates a new issue.
     *
     * @param input - required input to pass to createIssue
     * @returns IssuePayload
     */
    createIssue(input: L.IssueCreateInput): LinearFetch<IssuePayload>;
    /**
     * Deletes (trashes) an issue.
     *
     * @param id - required id to pass to deleteIssue
     * @param variables - variables without 'id' to pass into the DeleteIssueMutation
     * @returns IssueArchivePayload
     */
    deleteIssue(id: string, variables?: Omit<L.DeleteIssueMutationVariables, "id">): LinearFetch<IssueArchivePayload>;
    /**
     * Archives a draft.
     *
     * @param id - required id to pass to archiveIssueDraft
     * @returns IssueDraftArchivePayload
     */
    archiveIssueDraft(id: string): LinearFetch<IssueDraftArchivePayload>;
    /**
     * Creates a new draft.
     *
     * @param input - required input to pass to createIssueDraft
     * @returns IssueDraftPayload
     */
    createIssueDraft(input: L.IssueDraftCreateInput): LinearFetch<IssueDraftPayload>;
    /**
     * Deletes a draft.
     *
     * @param id - required id to pass to deleteIssueDraft
     * @returns DeletePayload
     */
    deleteIssueDraft(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a draft.
     *
     * @param id - required id to pass to updateIssueDraft
     * @param input - required input to pass to updateIssueDraft
     * @returns IssueDraftPayload
     */
    updateIssueDraft(id: string, input: L.IssueDraftUpdateInput): LinearFetch<IssueDraftPayload>;
    /**
     * Kicks off an Asana import job.
     *
     * @param asanaTeamName - required asanaTeamName to pass to issueImportCreateAsana
     * @param asanaToken - required asanaToken to pass to issueImportCreateAsana
     * @param variables - variables without 'asanaTeamName', 'asanaToken' to pass into the IssueImportCreateAsanaMutation
     * @returns IssueImportPayload
     */
    issueImportCreateAsana(asanaTeamName: string, asanaToken: string, variables?: Omit<L.IssueImportCreateAsanaMutationVariables, "asanaTeamName" | "asanaToken">): LinearFetch<IssueImportPayload>;
    /**
     * Kicks off a Jira import job from a CSV.
     *
     * @param csvUrl - required csvUrl to pass to issueImportCreateCSVJira
     * @param variables - variables without 'csvUrl' to pass into the IssueImportCreateCsvJiraMutation
     * @returns IssueImportPayload
     */
    issueImportCreateCSVJira(csvUrl: string, variables?: Omit<L.IssueImportCreateCsvJiraMutationVariables, "csvUrl">): LinearFetch<IssueImportPayload>;
    /**
     * Kicks off a Shortcut (formerly Clubhouse) import job.
     *
     * @param clubhouseGroupName - required clubhouseGroupName to pass to issueImportCreateClubhouse
     * @param clubhouseToken - required clubhouseToken to pass to issueImportCreateClubhouse
     * @param variables - variables without 'clubhouseGroupName', 'clubhouseToken' to pass into the IssueImportCreateClubhouseMutation
     * @returns IssueImportPayload
     */
    issueImportCreateClubhouse(clubhouseGroupName: string, clubhouseToken: string, variables?: Omit<L.IssueImportCreateClubhouseMutationVariables, "clubhouseGroupName" | "clubhouseToken">): LinearFetch<IssueImportPayload>;
    /**
     * Kicks off a GitHub import job.
     *
     * @param variables - variables to pass into the IssueImportCreateGithubMutation
     * @returns IssueImportPayload
     */
    issueImportCreateGithub(variables?: L.IssueImportCreateGithubMutationVariables): LinearFetch<IssueImportPayload>;
    /**
     * Kicks off a Jira import job.
     *
     * @param jiraEmail - required jiraEmail to pass to issueImportCreateJira
     * @param jiraHostname - required jiraHostname to pass to issueImportCreateJira
     * @param jiraProject - required jiraProject to pass to issueImportCreateJira
     * @param jiraToken - required jiraToken to pass to issueImportCreateJira
     * @param variables - variables without 'jiraEmail', 'jiraHostname', 'jiraProject', 'jiraToken' to pass into the IssueImportCreateJiraMutation
     * @returns IssueImportPayload
     */
    issueImportCreateJira(jiraEmail: string, jiraHostname: string, jiraProject: string, jiraToken: string, variables?: Omit<L.IssueImportCreateJiraMutationVariables, "jiraEmail" | "jiraHostname" | "jiraProject" | "jiraToken">): LinearFetch<IssueImportPayload>;
    /**
     * Deletes an import job.
     *
     * @param issueImportId - required issueImportId to pass to deleteIssueImport
     * @returns IssueImportDeletePayload
     */
    deleteIssueImport(issueImportId: string): LinearFetch<IssueImportDeletePayload>;
    /**
     * Kicks off import processing.
     *
     * @param issueImportId - required issueImportId to pass to issueImportProcess
     * @param mapping - required mapping to pass to issueImportProcess
     * @returns IssueImportPayload
     */
    issueImportProcess(issueImportId: string, mapping: L.Scalars["JSONObject"]): LinearFetch<IssueImportPayload>;
    /**
     * Updates the mapping for the issue import.
     *
     * @param id - required id to pass to updateIssueImport
     * @param input - required input to pass to updateIssueImport
     * @returns IssueImportPayload
     */
    updateIssueImport(id: string, input: L.IssueImportUpdateInput): LinearFetch<IssueImportPayload>;
    /**
     * Creates a new label.
     *
     * @param input - required input to pass to createIssueLabel
     * @param variables - variables without 'input' to pass into the CreateIssueLabelMutation
     * @returns IssueLabelPayload
     */
    createIssueLabel(input: L.IssueLabelCreateInput, variables?: Omit<L.CreateIssueLabelMutationVariables, "input">): LinearFetch<IssueLabelPayload>;
    /**
     * Deletes an issue label.
     *
     * @param id - required id to pass to deleteIssueLabel
     * @returns DeletePayload
     */
    deleteIssueLabel(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an label.
     *
     * @param id - required id to pass to updateIssueLabel
     * @param input - required input to pass to updateIssueLabel
     * @param variables - variables without 'id', 'input' to pass into the UpdateIssueLabelMutation
     * @returns IssueLabelPayload
     */
    updateIssueLabel(id: string, input: L.IssueLabelUpdateInput, variables?: Omit<L.UpdateIssueLabelMutationVariables, "id" | "input">): LinearFetch<IssueLabelPayload>;
    /**
     * Creates a new issue relation.
     *
     * @param input - required input to pass to createIssueRelation
     * @param variables - variables without 'input' to pass into the CreateIssueRelationMutation
     * @returns IssueRelationPayload
     */
    createIssueRelation(input: L.IssueRelationCreateInput, variables?: Omit<L.CreateIssueRelationMutationVariables, "input">): LinearFetch<IssueRelationPayload>;
    /**
     * Deletes an issue relation.
     *
     * @param id - required id to pass to deleteIssueRelation
     * @returns DeletePayload
     */
    deleteIssueRelation(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an issue relation.
     *
     * @param id - required id to pass to updateIssueRelation
     * @param input - required input to pass to updateIssueRelation
     * @returns IssueRelationPayload
     */
    updateIssueRelation(id: string, input: L.IssueRelationUpdateInput): LinearFetch<IssueRelationPayload>;
    /**
     * Adds an issue reminder. Will cause a notification to be sent when the issue reminder time is reached.
     *
     * @param id - required id to pass to issueReminder
     * @param reminderAt - required reminderAt to pass to issueReminder
     * @returns IssuePayload
     */
    issueReminder(id: string, reminderAt: Date): LinearFetch<IssuePayload>;
    /**
     * Removes a label from an issue.
     *
     * @param id - required id to pass to issueRemoveLabel
     * @param labelId - required labelId to pass to issueRemoveLabel
     * @returns IssuePayload
     */
    issueRemoveLabel(id: string, labelId: string): LinearFetch<IssuePayload>;
    /**
     * Subscribes a user to an issue.
     *
     * @param id - required id to pass to issueSubscribe
     * @param variables - variables without 'id' to pass into the IssueSubscribeMutation
     * @returns IssuePayload
     */
    issueSubscribe(id: string, variables?: Omit<L.IssueSubscribeMutationVariables, "id">): LinearFetch<IssuePayload>;
    /**
     * Unarchives an issue.
     *
     * @param id - required id to pass to unarchiveIssue
     * @returns IssueArchivePayload
     */
    unarchiveIssue(id: string): LinearFetch<IssueArchivePayload>;
    /**
     * Unsubscribes a user from an issue.
     *
     * @param id - required id to pass to issueUnsubscribe
     * @param variables - variables without 'id' to pass into the IssueUnsubscribeMutation
     * @returns IssuePayload
     */
    issueUnsubscribe(id: string, variables?: Omit<L.IssueUnsubscribeMutationVariables, "id">): LinearFetch<IssuePayload>;
    /**
     * Updates an issue.
     *
     * @param id - required id to pass to updateIssue
     * @param input - required input to pass to updateIssue
     * @returns IssuePayload
     */
    updateIssue(id: string, input: L.IssueUpdateInput): LinearFetch<IssuePayload>;
    /**
     * Join an organization from onboarding.
     *
     * @param input - required input to pass to joinOrganizationFromOnboarding
     * @returns CreateOrJoinOrganizationResponse
     */
    joinOrganizationFromOnboarding(input: L.JoinOrganizationInput): LinearFetch<CreateOrJoinOrganizationResponse>;
    /**
     * Leave an organization.
     *
     * @param organizationId - required organizationId to pass to leaveOrganization
     * @returns CreateOrJoinOrganizationResponse
     */
    leaveOrganization(organizationId: string): LinearFetch<CreateOrJoinOrganizationResponse>;
    /**
     * Logout the client.
     *
     * @returns LogoutResponse
     */
    get logout(): LinearFetch<LogoutResponse>;
    /**
     * Logout all of user's sessions including the active one.
     *
     * @returns LogoutResponse
     */
    get logoutAllSessions(): LinearFetch<LogoutResponse>;
    /**
     * Logout all of user's sessions excluding the current one.
     *
     * @returns LogoutResponse
     */
    get logoutOtherSessions(): LinearFetch<LogoutResponse>;
    /**
     * Logout an individual session with its ID.
     *
     * @param sessionId - required sessionId to pass to logoutSession
     * @returns LogoutResponse
     */
    logoutSession(sessionId: string): LinearFetch<LogoutResponse>;
    /**
     * Archives a notification.
     *
     * @param id - required id to pass to archiveNotification
     * @returns NotificationArchivePayload
     */
    archiveNotification(id: string): LinearFetch<NotificationArchivePayload>;
    /**
     * Archives a notification and all related notifications.
     *
     * @param input - required input to pass to notificationArchiveAll
     * @returns NotificationBatchActionPayload
     */
    notificationArchiveAll(input: L.NotificationEntityInput): LinearFetch<NotificationBatchActionPayload>;
    /**
     * Marks notification and all related notifications as read.
     *
     * @param input - required input to pass to notificationMarkReadAll
     * @param readAt - required readAt to pass to notificationMarkReadAll
     * @returns NotificationBatchActionPayload
     */
    notificationMarkReadAll(input: L.NotificationEntityInput, readAt: Date): LinearFetch<NotificationBatchActionPayload>;
    /**
     * Marks notification and all related notifications as unread.
     *
     * @param input - required input to pass to notificationMarkUnreadAll
     * @returns NotificationBatchActionPayload
     */
    notificationMarkUnreadAll(input: L.NotificationEntityInput): LinearFetch<NotificationBatchActionPayload>;
    /**
     * Snoozes a notification and all related notifications.
     *
     * @param input - required input to pass to notificationSnoozeAll
     * @param snoozedUntilAt - required snoozedUntilAt to pass to notificationSnoozeAll
     * @returns NotificationBatchActionPayload
     */
    notificationSnoozeAll(input: L.NotificationEntityInput, snoozedUntilAt: Date): LinearFetch<NotificationBatchActionPayload>;
    /**
     * Creates a new notification subscription for a cycle, custom view, label, project or team.
     *
     * @param input - required input to pass to createNotificationSubscription
     * @returns NotificationSubscriptionPayload
     */
    createNotificationSubscription(input: L.NotificationSubscriptionCreateInput): LinearFetch<NotificationSubscriptionPayload>;
    /**
     * Deletes a notification subscription reference.
     *
     * @param id - required id to pass to deleteNotificationSubscription
     * @returns DeletePayload
     */
    deleteNotificationSubscription(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a notification subscription.
     *
     * @param id - required id to pass to updateNotificationSubscription
     * @param input - required input to pass to updateNotificationSubscription
     * @returns NotificationSubscriptionPayload
     */
    updateNotificationSubscription(id: string, input: L.NotificationSubscriptionUpdateInput): LinearFetch<NotificationSubscriptionPayload>;
    /**
     * Unarchives a notification.
     *
     * @param id - required id to pass to unarchiveNotification
     * @returns NotificationArchivePayload
     */
    unarchiveNotification(id: string): LinearFetch<NotificationArchivePayload>;
    /**
     * Unsnoozes a notification and all related notifications.
     *
     * @param input - required input to pass to notificationUnsnoozeAll
     * @param unsnoozedAt - required unsnoozedAt to pass to notificationUnsnoozeAll
     * @returns NotificationBatchActionPayload
     */
    notificationUnsnoozeAll(input: L.NotificationEntityInput, unsnoozedAt: Date): LinearFetch<NotificationBatchActionPayload>;
    /**
     * Updates a notification.
     *
     * @param id - required id to pass to updateNotification
     * @param input - required input to pass to updateNotification
     * @returns NotificationPayload
     */
    updateNotification(id: string, input: L.NotificationUpdateInput): LinearFetch<NotificationPayload>;
    /**
     * Cancels the deletion of an organization. Administrator privileges required.
     *
     * @returns OrganizationCancelDeletePayload
     */
    get deleteOrganizationCancel(): LinearFetch<OrganizationCancelDeletePayload>;
    /**
     * Delete's an organization. Administrator privileges required.
     *
     * @param input - required input to pass to deleteOrganization
     * @returns OrganizationDeletePayload
     */
    deleteOrganization(input: L.DeleteOrganizationInput): LinearFetch<OrganizationDeletePayload>;
    /**
     * Get an organization's delete confirmation token. Administrator privileges required.
     *
     * @returns OrganizationDeletePayload
     */
    get organizationDeleteChallenge(): LinearFetch<OrganizationDeletePayload>;
    /**
     * Deletes a domain.
     *
     * @param id - required id to pass to deleteOrganizationDomain
     * @returns DeletePayload
     */
    deleteOrganizationDomain(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new organization invite.
     *
     * @param input - required input to pass to createOrganizationInvite
     * @returns OrganizationInvitePayload
     */
    createOrganizationInvite(input: L.OrganizationInviteCreateInput): LinearFetch<OrganizationInvitePayload>;
    /**
     * Deletes an organization invite.
     *
     * @param id - required id to pass to deleteOrganizationInvite
     * @returns DeletePayload
     */
    deleteOrganizationInvite(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an organization invite.
     *
     * @param id - required id to pass to updateOrganizationInvite
     * @param input - required input to pass to updateOrganizationInvite
     * @returns OrganizationInvitePayload
     */
    updateOrganizationInvite(id: string, input: L.OrganizationInviteUpdateInput): LinearFetch<OrganizationInvitePayload>;
    /**
     * Starts a trial for the organization. Administrator privileges required.
     *
     * @returns OrganizationStartTrialPayload
     */
    get organizationStartTrial(): LinearFetch<OrganizationStartTrialPayload>;
    /**
     * Updates the user's organization.
     *
     * @param input - required input to pass to updateOrganization
     * @returns OrganizationPayload
     */
    updateOrganization(input: L.OrganizationUpdateInput): LinearFetch<OrganizationPayload>;
    /**
     * Archives a project.
     *
     * @param id - required id to pass to archiveProject
     * @param variables - variables without 'id' to pass into the ArchiveProjectMutation
     * @returns ProjectArchivePayload
     */
    archiveProject(id: string, variables?: Omit<L.ArchiveProjectMutationVariables, "id">): LinearFetch<ProjectArchivePayload>;
    /**
     * Creates a new project.
     *
     * @param input - required input to pass to createProject
     * @param variables - variables without 'input' to pass into the CreateProjectMutation
     * @returns ProjectPayload
     */
    createProject(input: L.ProjectCreateInput, variables?: Omit<L.CreateProjectMutationVariables, "input">): LinearFetch<ProjectPayload>;
    /**
     * Deletes (trashes) a project.
     *
     * @param id - required id to pass to deleteProject
     * @returns ProjectArchivePayload
     */
    deleteProject(id: string): LinearFetch<ProjectArchivePayload>;
    /**
     * Creates a new project link.
     *
     * @param input - required input to pass to createProjectLink
     * @returns ProjectLinkPayload
     */
    createProjectLink(input: L.ProjectLinkCreateInput): LinearFetch<ProjectLinkPayload>;
    /**
     * Deletes a project link.
     *
     * @param id - required id to pass to deleteProjectLink
     * @returns DeletePayload
     */
    deleteProjectLink(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a project link.
     *
     * @param id - required id to pass to updateProjectLink
     * @param input - required input to pass to updateProjectLink
     * @returns ProjectLinkPayload
     */
    updateProjectLink(id: string, input: L.ProjectLinkUpdateInput): LinearFetch<ProjectLinkPayload>;
    /**
     * Creates a new project milestone.
     *
     * @param input - required input to pass to createProjectMilestone
     * @returns ProjectMilestonePayload
     */
    createProjectMilestone(input: L.ProjectMilestoneCreateInput): LinearFetch<ProjectMilestonePayload>;
    /**
     * Deletes a project milestone.
     *
     * @param id - required id to pass to deleteProjectMilestone
     * @returns DeletePayload
     */
    deleteProjectMilestone(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a project milestone.
     *
     * @param id - required id to pass to updateProjectMilestone
     * @param input - required input to pass to updateProjectMilestone
     * @returns ProjectMilestonePayload
     */
    updateProjectMilestone(id: string, input: L.ProjectMilestoneUpdateInput): LinearFetch<ProjectMilestonePayload>;
    /**
     * Unarchives a project.
     *
     * @param id - required id to pass to unarchiveProject
     * @returns ProjectArchivePayload
     */
    unarchiveProject(id: string): LinearFetch<ProjectArchivePayload>;
    /**
     * Updates a project.
     *
     * @param id - required id to pass to updateProject
     * @param input - required input to pass to updateProject
     * @returns ProjectPayload
     */
    updateProject(id: string, input: L.ProjectUpdateInput): LinearFetch<ProjectPayload>;
    /**
     * Creates a new project update.
     *
     * @param input - required input to pass to createProjectUpdate
     * @returns ProjectUpdatePayload
     */
    createProjectUpdate(input: L.ProjectUpdateCreateInput): LinearFetch<ProjectUpdatePayload>;
    /**
     * Deletes a project update.
     *
     * @param id - required id to pass to deleteProjectUpdate
     * @returns DeletePayload
     */
    deleteProjectUpdate(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new interaction on a project update.
     *
     * @param input - required input to pass to createProjectUpdateInteraction
     * @returns ProjectUpdateInteractionPayload
     */
    createProjectUpdateInteraction(input: L.ProjectUpdateInteractionCreateInput): LinearFetch<ProjectUpdateInteractionPayload>;
    /**
     * Mark a project update as read.
     *
     * @param id - required id to pass to projectUpdateMarkAsRead
     * @returns ProjectUpdateWithInteractionPayload
     */
    projectUpdateMarkAsRead(id: string): LinearFetch<ProjectUpdateWithInteractionPayload>;
    /**
     * Updates a project update.
     *
     * @param id - required id to pass to updateProjectUpdate
     * @param input - required input to pass to updateProjectUpdate
     * @returns ProjectUpdatePayload
     */
    updateProjectUpdate(id: string, input: L.ProjectUpdateUpdateInput): LinearFetch<ProjectUpdatePayload>;
    /**
     * Creates a push subscription.
     *
     * @param input - required input to pass to createPushSubscription
     * @returns PushSubscriptionPayload
     */
    createPushSubscription(input: L.PushSubscriptionCreateInput): LinearFetch<PushSubscriptionPayload>;
    /**
     * Deletes a push subscription.
     *
     * @param id - required id to pass to deletePushSubscription
     * @returns PushSubscriptionPayload
     */
    deletePushSubscription(id: string): LinearFetch<PushSubscriptionPayload>;
    /**
     * Creates a new reaction.
     *
     * @param input - required input to pass to createReaction
     * @returns ReactionPayload
     */
    createReaction(input: L.ReactionCreateInput): LinearFetch<ReactionPayload>;
    /**
     * Deletes a reaction.
     *
     * @param id - required id to pass to deleteReaction
     * @returns DeletePayload
     */
    deleteReaction(id: string): LinearFetch<DeletePayload>;
    /**
     * Manually update Google Sheets data.
     *
     * @param id - required id to pass to refreshGoogleSheetsData
     * @returns IntegrationPayload
     */
    refreshGoogleSheetsData(id: string): LinearFetch<IntegrationPayload>;
    /**
     * Re-send an organization invite.
     *
     * @param id - required id to pass to resendOrganizationInvite
     * @returns DeletePayload
     */
    resendOrganizationInvite(id: string): LinearFetch<DeletePayload>;
    /**
     * Archives a roadmap.
     *
     * @param id - required id to pass to archiveRoadmap
     * @returns RoadmapArchivePayload
     */
    archiveRoadmap(id: string): LinearFetch<RoadmapArchivePayload>;
    /**
     * Creates a new roadmap.
     *
     * @param input - required input to pass to createRoadmap
     * @returns RoadmapPayload
     */
    createRoadmap(input: L.RoadmapCreateInput): LinearFetch<RoadmapPayload>;
    /**
     * Deletes a roadmap.
     *
     * @param id - required id to pass to deleteRoadmap
     * @returns DeletePayload
     */
    deleteRoadmap(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new roadmapToProject join.
     *
     * @param input - required input to pass to createRoadmapToProject
     * @returns RoadmapToProjectPayload
     */
    createRoadmapToProject(input: L.RoadmapToProjectCreateInput): LinearFetch<RoadmapToProjectPayload>;
    /**
     * Deletes a roadmapToProject.
     *
     * @param id - required id to pass to deleteRoadmapToProject
     * @returns DeletePayload
     */
    deleteRoadmapToProject(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a roadmapToProject.
     *
     * @param id - required id to pass to updateRoadmapToProject
     * @param input - required input to pass to updateRoadmapToProject
     * @returns RoadmapToProjectPayload
     */
    updateRoadmapToProject(id: string, input: L.RoadmapToProjectUpdateInput): LinearFetch<RoadmapToProjectPayload>;
    /**
     * Unarchives a roadmap.
     *
     * @param id - required id to pass to unarchiveRoadmap
     * @returns RoadmapArchivePayload
     */
    unarchiveRoadmap(id: string): LinearFetch<RoadmapArchivePayload>;
    /**
     * Updates a roadmap.
     *
     * @param id - required id to pass to updateRoadmap
     * @param input - required input to pass to updateRoadmap
     * @returns RoadmapPayload
     */
    updateRoadmap(id: string, input: L.RoadmapUpdateInput): LinearFetch<RoadmapPayload>;
    /**
     * Authenticates a user account via email and authentication token for SAML.
     *
     * @param input - required input to pass to samlTokenUserAccountAuth
     * @returns AuthResolverResponse
     */
    samlTokenUserAccountAuth(input: L.TokenUserAccountAuthInput): LinearFetch<AuthResolverResponse>;
    /**
     * Creates a new team. The user who creates the team will automatically be added as a member to the newly created team.
     *
     * @param input - required input to pass to createTeam
     * @param variables - variables without 'input' to pass into the CreateTeamMutation
     * @returns TeamPayload
     */
    createTeam(input: L.TeamCreateInput, variables?: Omit<L.CreateTeamMutationVariables, "input">): LinearFetch<TeamPayload>;
    /**
     * Deletes team's cycles data
     *
     * @param id - required id to pass to deleteTeamCycles
     * @returns TeamPayload
     */
    deleteTeamCycles(id: string): LinearFetch<TeamPayload>;
    /**
     * Deletes a team.
     *
     * @param id - required id to pass to deleteTeam
     * @returns DeletePayload
     */
    deleteTeam(id: string): LinearFetch<DeletePayload>;
    /**
     * Deletes a previously used team key.
     *
     * @param id - required id to pass to deleteTeamKey
     * @returns DeletePayload
     */
    deleteTeamKey(id: string): LinearFetch<DeletePayload>;
    /**
     * Creates a new team membership.
     *
     * @param input - required input to pass to createTeamMembership
     * @returns TeamMembershipPayload
     */
    createTeamMembership(input: L.TeamMembershipCreateInput): LinearFetch<TeamMembershipPayload>;
    /**
     * Deletes a team membership.
     *
     * @param id - required id to pass to deleteTeamMembership
     * @returns DeletePayload
     */
    deleteTeamMembership(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates a team membership.
     *
     * @param id - required id to pass to updateTeamMembership
     * @param input - required input to pass to updateTeamMembership
     * @returns TeamMembershipPayload
     */
    updateTeamMembership(id: string, input: L.TeamMembershipUpdateInput): LinearFetch<TeamMembershipPayload>;
    /**
     * Unarchives a team and cancels deletion.
     *
     * @param id - required id to pass to unarchiveTeam
     * @returns TeamArchivePayload
     */
    unarchiveTeam(id: string): LinearFetch<TeamArchivePayload>;
    /**
     * Updates a team.
     *
     * @param id - required id to pass to updateTeam
     * @param input - required input to pass to updateTeam
     * @returns TeamPayload
     */
    updateTeam(id: string, input: L.TeamUpdateInput): LinearFetch<TeamPayload>;
    /**
     * Creates a new template.
     *
     * @param input - required input to pass to createTemplate
     * @returns TemplatePayload
     */
    createTemplate(input: L.TemplateCreateInput): LinearFetch<TemplatePayload>;
    /**
     * Deletes a template.
     *
     * @param id - required id to pass to deleteTemplate
     * @returns DeletePayload
     */
    deleteTemplate(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing template.
     *
     * @param id - required id to pass to updateTemplate
     * @param input - required input to pass to updateTemplate
     * @returns TemplatePayload
     */
    updateTemplate(id: string, input: L.TemplateUpdateInput): LinearFetch<TemplatePayload>;
    /**
     * Creates a new time schedule.
     *
     * @param input - required input to pass to createTimeSchedule
     * @returns TimeSchedulePayload
     */
    createTimeSchedule(input: L.TimeScheduleCreateInput): LinearFetch<TimeSchedulePayload>;
    /**
     * Deletes a time schedule.
     *
     * @param id - required id to pass to deleteTimeSchedule
     * @returns DeletePayload
     */
    deleteTimeSchedule(id: string): LinearFetch<DeletePayload>;
    /**
     * Refresh the integration schedule information.
     *
     * @param id - required id to pass to timeScheduleRefreshIntegrationSchedule
     * @returns TimeSchedulePayload
     */
    timeScheduleRefreshIntegrationSchedule(id: string): LinearFetch<TimeSchedulePayload>;
    /**
     * Updates a time schedule.
     *
     * @param id - required id to pass to updateTimeSchedule
     * @param input - required input to pass to updateTimeSchedule
     * @returns TimeSchedulePayload
     */
    updateTimeSchedule(id: string, input: L.TimeScheduleUpdateInput): LinearFetch<TimeSchedulePayload>;
    /**
     * Upsert an external time schedule.
     *
     * @param externalId - required externalId to pass to timeScheduleUpsertExternal
     * @param input - required input to pass to timeScheduleUpsertExternal
     * @returns TimeSchedulePayload
     */
    timeScheduleUpsertExternal(externalId: string, input: L.TimeScheduleUpdateInput): LinearFetch<TimeSchedulePayload>;
    /**
     * Creates a new triage responsibility.
     *
     * @param input - required input to pass to createTriageResponsibility
     * @returns TriageResponsibilityPayload
     */
    createTriageResponsibility(input: L.TriageResponsibilityCreateInput): LinearFetch<TriageResponsibilityPayload>;
    /**
     * Deletes a triage responsibility.
     *
     * @param id - required id to pass to deleteTriageResponsibility
     * @returns DeletePayload
     */
    deleteTriageResponsibility(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing triage responsibility.
     *
     * @param id - required id to pass to updateTriageResponsibility
     * @param input - required input to pass to updateTriageResponsibility
     * @returns TriageResponsibilityPayload
     */
    updateTriageResponsibility(id: string, input: L.TriageResponsibilityUpdateInput): LinearFetch<TriageResponsibilityPayload>;
    /**
     * Makes user a regular user. Can only be called by an admin.
     *
     * @param id - required id to pass to userDemoteAdmin
     * @returns UserAdminPayload
     */
    userDemoteAdmin(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Makes user a guest. Can only be called by an admin.
     *
     * @param id - required id to pass to userDemoteMember
     * @returns UserAdminPayload
     */
    userDemoteMember(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Connects the Discord user to this Linear account via OAuth2.
     *
     * @param code - required code to pass to userDiscordConnect
     * @param redirectUri - required redirectUri to pass to userDiscordConnect
     * @returns UserPayload
     */
    userDiscordConnect(code: string, redirectUri: string): LinearFetch<UserPayload>;
    /**
     * Disconnects the external user from this Linear account.
     *
     * @param service - required service to pass to userExternalUserDisconnect
     * @returns UserPayload
     */
    userExternalUserDisconnect(service: string): LinearFetch<UserPayload>;
    /**
     * Updates a user's settings flag.
     *
     * @param flag - required flag to pass to updateUserFlag
     * @param operation - required operation to pass to updateUserFlag
     * @returns UserSettingsFlagPayload
     */
    updateUserFlag(flag: L.UserFlagType, operation: L.UserFlagUpdateOperation): LinearFetch<UserSettingsFlagPayload>;
    /**
     * Makes user an admin. Can only be called by an admin.
     *
     * @param id - required id to pass to userPromoteAdmin
     * @returns UserAdminPayload
     */
    userPromoteAdmin(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Makes user a regular user. Can only be called by an admin.
     *
     * @param id - required id to pass to userPromoteMember
     * @returns UserAdminPayload
     */
    userPromoteMember(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Resets user's setting flags.
     *
     * @param variables - variables to pass into the UserSettingsFlagsResetMutation
     * @returns UserSettingsFlagsResetPayload
     */
    userSettingsFlagsReset(variables?: L.UserSettingsFlagsResetMutationVariables): LinearFetch<UserSettingsFlagsResetPayload>;
    /**
     * Updates the user's settings.
     *
     * @param id - required id to pass to updateUserSettings
     * @param input - required input to pass to updateUserSettings
     * @returns UserSettingsPayload
     */
    updateUserSettings(id: string, input: L.UserSettingsUpdateInput): LinearFetch<UserSettingsPayload>;
    /**
     * Suspends a user. Can only be called by an admin.
     *
     * @param id - required id to pass to suspendUser
     * @returns UserAdminPayload
     */
    suspendUser(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Un-suspends a user. Can only be called by an admin.
     *
     * @param id - required id to pass to unsuspendUser
     * @returns UserAdminPayload
     */
    unsuspendUser(id: string): LinearFetch<UserAdminPayload>;
    /**
     * Updates a user. Only available to organization admins and the user themselves.
     *
     * @param id - required id to pass to updateUser
     * @param input - required input to pass to updateUser
     * @returns UserPayload
     */
    updateUser(id: string, input: L.UserUpdateInput): LinearFetch<UserPayload>;
    /**
     * Creates a new ViewPreferences object.
     *
     * @param input - required input to pass to createViewPreferences
     * @returns ViewPreferencesPayload
     */
    createViewPreferences(input: L.ViewPreferencesCreateInput): LinearFetch<ViewPreferencesPayload>;
    /**
     * Deletes a ViewPreferences.
     *
     * @param id - required id to pass to deleteViewPreferences
     * @returns DeletePayload
     */
    deleteViewPreferences(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing ViewPreferences object.
     *
     * @param id - required id to pass to updateViewPreferences
     * @param input - required input to pass to updateViewPreferences
     * @returns ViewPreferencesPayload
     */
    updateViewPreferences(id: string, input: L.ViewPreferencesUpdateInput): LinearFetch<ViewPreferencesPayload>;
    /**
     * Creates a new webhook.
     *
     * @param input - required input to pass to createWebhook
     * @returns WebhookPayload
     */
    createWebhook(input: L.WebhookCreateInput): LinearFetch<WebhookPayload>;
    /**
     * Deletes a Webhook.
     *
     * @param id - required id to pass to deleteWebhook
     * @returns DeletePayload
     */
    deleteWebhook(id: string): LinearFetch<DeletePayload>;
    /**
     * Updates an existing Webhook.
     *
     * @param id - required id to pass to updateWebhook
     * @param input - required input to pass to updateWebhook
     * @returns WebhookPayload
     */
    updateWebhook(id: string, input: L.WebhookUpdateInput): LinearFetch<WebhookPayload>;
    /**
     * Archives a state. Only states with issues that have all been archived can be archived.
     *
     * @param id - required id to pass to archiveWorkflowState
     * @returns WorkflowStateArchivePayload
     */
    archiveWorkflowState(id: string): LinearFetch<WorkflowStateArchivePayload>;
    /**
     * Creates a new state, adding it to the workflow of a team.
     *
     * @param input - required input to pass to createWorkflowState
     * @returns WorkflowStatePayload
     */
    createWorkflowState(input: L.WorkflowStateCreateInput): LinearFetch<WorkflowStatePayload>;
    /**
     * Updates a state.
     *
     * @param id - required id to pass to updateWorkflowState
     * @param input - required input to pass to updateWorkflowState
     * @returns WorkflowStatePayload
     */
    updateWorkflowState(id: string, input: L.WorkflowStateUpdateInput): LinearFetch<WorkflowStatePayload>;
}
//# sourceMappingURL=_generated_sdk.d.ts.map