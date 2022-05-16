import  {getRandomPort}  from "../docker";
it("does port test lower", () => {
    let port = getRandomPort();

    expect(port).toBeGreaterThanOrEqual(10000);
   
});
it("does port test upper", () => {
    let port = getRandomPort();

    expect(port).toBeLessThan(60000);
   
});
