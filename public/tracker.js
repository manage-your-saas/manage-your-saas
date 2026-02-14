(function () {
  const CLIENT_ID = "client_abc";
  const API_KEY = "abc123";
  const API = "https://www.manageyoursaas.com/api/intent/track";

  let sid = localStorage.getItem("mys_intent_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("mys_intent_sid", sid);
  }

  const send = (event, value = 0) => {
    fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        sessionId: sid,
        event,
        value,
      }),
    }).catch(() => {});
  };

  // pageview
  send("pageview");

  // duration
  const start = Date.now();
  window.addEventListener("beforeunload", () => {
    send("duration", Math.floor((Date.now() - start) / 1000));
  });

  // CTA clicks
  document.addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "BUTTON") {
      send("cta");
    }
  });
})();
