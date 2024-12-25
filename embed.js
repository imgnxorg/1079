/**
 * Install the app first, then add the ID to this array.
 */
const enabledLocations = ["3NcXnh6iBALY9tEUf2qs", "iGO7Q1oabaZleQyXTWBi"];

export const waitForElement = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        // console.log("MUTATIONS", mutations);
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

function reload() {
  console.log("Initializing Embedded Google Maps script...");
  waitForElement(`.hl_contact-details-left #contact\\.last_name`)
    .then(async (element) => {
      let containerId = "imgfunnels-gmap-embed";
      let pathArray = window.location.pathname.split("/");
      const locationId = pathArray[3];

      if (
        enabledLocations.includes(locationId) &&
        !document.getElementById(containerId)
      ) {
        const contactId = pathArray[pathArray.length - 1];

        console.log("CID", contactId);
        let div = document.createElement("div");

        div.id = containerId;
        div.classList.add("form-group");
        div.style.maxWidth = "100%";
        div.style.height = "450px";
        div.style.background = "#f2f2f2";

        element.insertAdjacentElement("afterend", div);

        let iframe = document.createElement("iframe");
        let params = new URLSearchParams();

        let { contact, apiKey } = await fetch(
          `https://sunattendant-worker.donaldwaynemoorejr.workers.dev?contactId=${contactId}&locationId=${locationId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        )
          .then((res) => res.json())
          .then(({ success, contact, apiKey, message }) => {
            if (!success) throw new Error(message);
            return { contact, apiKey };
          })
          .catch((error) => {
            div.remove();
            throw error;
          });

        params.append("key", apiKey);

        params.append(
          "q",
          contact.address1
            ? contact.address1 +
                (contact.city ? `, ${contact.city},` : "") +
                (contact.state ? ` ${contact.state}` : "") +
                (contact.postalCode ? ` ${contact.postalCode}` : "") +
                (contact.country ? `, ${contact.country}` : "")
            : "United States",
        );

        params.append("zoom", contact.address1 ? "21" : "4");
        params.append("maptype", "satellite");
        iframe.src = `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
        // iframe.width = "600";
        iframe.style.width = "100%";
        iframe.style.maxHeight = "450px";
        iframe.height = "450";
        iframe.loading = "lazy";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        console.log("APPENDING...");
        div.appendChild(iframe);
        console.log("INSERTING...");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      setTimeout(() => {
        reload();
      }, 450);
    });
}

reload();
