import { NextApiRequest, NextApiResponse } from "next";
import { msOauth, setupOauth } from "../../../auth";

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
