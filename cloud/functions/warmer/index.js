import fetch from "node-fetch";
import functions from "@google-cloud/functions-framework";

functions.http("warmer", async (req, res) => {
  await fetch("https://tubo-yludnsqgyq-uc.a.run.app/rest/").catch((err) =>
    res.send(err)
  );

  res.send("Success!");
});
