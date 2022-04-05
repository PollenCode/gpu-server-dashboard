import { NextApiRequest, NextApiResponse } from "next";
import { BaseClient, Issuer } from "openid-client";
import { SERVER_URL } from "./util";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

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

export async function getSessionUserId(req: NextApiRequest, res: NextApiResponse): Promise<number | null> {
    let cookie = req.cookies["gpuserver"];
    if (!cookie) {
        res.status(401).end();
        return null;
    }

    let userId;
    try {
        userId = (jwt.verify(cookie, process.env.COOKIE_SECRET!) as any)?.userId;
    } catch (ex) {
        console.error("Could not verify jwt token", ex);
        res.status(400).end();
        return null;
    }

    return userId;
}

export async function getSessionUser(req: NextApiRequest, res: NextApiResponse) {
    let userId = await getSessionUserId(req, res);
    if (!userId) return null;

    let user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    return user;
}
