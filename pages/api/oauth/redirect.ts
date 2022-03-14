import { NextApiRequest, NextApiResponse } from "next";
import { msOauth, setupOauth } from "../../../msOauth";
import { SERVER_URL } from "../../../util";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        if (typeof req.query.code !== "string") {
            return res.status(406).end();
        }

        await setupOauth();

        let oauthParams = msOauth.callbackParams(req);
        let token = await msOauth.callback(process.env.OAUTH_MS_REDIRECT_URL!, oauthParams);

        res.json({
            token,
        });
    } else {
        return res.status(405).end();
    }
};
