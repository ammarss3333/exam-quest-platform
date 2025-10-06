/* coi-serviceworker v0.1.6 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (ev.data) {
      if (ev.data.type === "deregister") {
        self.registration
          .unregister()
          .then(() => self.clients.matchAll())
          .then(clients => {
            clients.forEach(client => client.navigate(client.url));
          });
      } else if (ev.data.type === "coepCredentialless") {
        coepCredentialless = ev.data.value;
      }
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
      return;
    }

    const request = (coepCredentialless && r.mode === "no-cors")
      ? new Request(r, {
        credentials: "omit",
      })
      : r;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy",
            coepCredentialless ? "credentialless" : "require-corp"
          );
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch(e => console.error(e))
    );
  });
} else {
  // This is the main thread.
  const coi = {
    shouldRegister: () => true,
    shouldDeregister: () => false,
    coepCredentialless: () => !(navigator.userAgent.indexOf("CriOS") > -1 || !window.chrome),
    doReload: () => window.location.reload(),
    quiet: false,
    ...window.coi
  };

  const is  = {
    crossOriginIsolated: window.crossOriginIsolated,
    coepCredentialless: coi.coepCredentialless(),
  };

  if (is.crossOriginIsolated && is.coepCredentialless) {
    // If we are cross origin isolated and we are using credentialless, then we don't need the service worker.
    // We can just send a message to the service worker to update its state.
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage({
        type: "coepCredentialless",
        value: true
      });
    });
  } else if (!is.crossOriginIsolated && !coi.shouldDeregister()) {
    // We don't have COOP/COEP headers yet. Register the service worker and reload.
    if (coi.shouldRegister()) {
      navigator.serviceWorker.register(window.document.currentScript.src, {
        scope: './'
      }).then(registration => {
        if (!coi.quiet) {
          console.log("COI ServiceWorker registered", registration.scope);
        }
        if (registration.active && !is.crossOriginIsolated) {
          coi.doReload();
        }
      }).catch(e => {
        if (!coi.quiet) {
          console.error("COI ServiceWorker failed to register:", e);
        }
      });
    }
  } else {
    // We are cross origin isolated, but we don't need credentialless, or we want to deregister.
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage({
        type: "coepCredentialless",
        value: false
      });
      if (coi.shouldDeregister()) {
        registration.active.postMessage({
          type: "deregister"
        });
      }
    });
  }
}

