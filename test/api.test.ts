import fetch from "isomorphic-fetch";

it("Does an api test", async () => {
    let res = await fetch("http://node:3000", {
        method: "GET",
    });

    expect(res.ok).toBeTruthy();
});
