import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";
import { msOauth, setupOauth } from "../../../msOauth";
import { SERVER_URL } from "../../../util";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        if (typeof req.query.code !== "string") {
            return res.status(406).end();
        }

        await setupOauth();

        let token;
        try {
            let oauthParams = msOauth.callbackParams(req);
            token = await msOauth.callback(process.env.OAUTH_MS_REDIRECT_URL!, oauthParams);
            if (!token) throw new Error("No token received");
        } catch (ex) {
            console.error("Could not process callback", ex);
            return res.status(400).end("Could not process callback");
        }

        let userInfo;
        try {
            userInfo = await msOauth.userinfo(token.access_token!);
            if (!userInfo || !userInfo.email || !userInfo.name) {
                throw new Error("Incomplete user info, name or/and email was not specified");
            }
        } catch (ex) {
            console.error("Could not get user info", ex);
            return res.status(400).end("Could not get user info");
        }

        let user = await prisma.user.findUnique({
            where: {
                email: userInfo.email,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    userName: userInfo.name,
                    email: userInfo.email,
                },
            });
            console.log("Created new user", user);
        }

        let cookieAge = parseInt(process.env.COOKIE_TTL!);
        let cookieToken = jwt.sign({ userId: user.id }, process.env.COOKIE_SECRET!, { expiresIn: cookieAge });

        res.setHeader("Set-Cookie", cookie.serialize("gpuserver", cookieToken, { maxAge: cookieAge, secure: true, httpOnly: true, path: "/" }));

        // TODO set cookie
        console.log("OAuth complete", token);

        console.log("User info", userInfo);

        res.redirect("/app");
    } else {
        return res.status(405).end();
    }
};
