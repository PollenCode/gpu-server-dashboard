import { BaseClient, Issuer } from "openid-client";
import { SERVER_URL } from "./util";

// clientId: process.env.OAUTH_MS_CLIENT_ID!,
// clientSecret: process.env.OAUTH_MS_CLIENT_SECRET!,
// authority: process.env.OAUTH_MS_AUTHORITY!,

export let msOauth: BaseClient;

export async function setupOauth() {
    if (!msOauth) {
        let oauthIssuer = await Issuer.discover(process.env.OAUTH_MS_AUTHORITY!);
        console.log("Setting up OAuth...");
        msOauth = new oauthIssuer.Client({
            client_id: process.env.OAUTH_MS_CLIENT_ID!,
            client_secret: process.env.OAUTH_MS_CLIENT_SECRET!,
            redirect_uris: [process.env.OAUTH_MS_REDIRECT_URL!],
            response_types: ["code"],
        });
        console.log("Set up OAuth");
    }
}
