import { NextApiRequest, NextApiResponse } from "next";
import { msOauth, setupOauth } from "../../../auth";
import { SERVER_URL } from "../../../util";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        await setupOauth();
        let url = msOauth.authorizationUrl({
            scope: "openid email",
        });
        console.log(url);

        res.redirect(url);
    } else {
        return res.status(405).end();
    }
};
