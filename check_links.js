chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "checkUrls") {
        // If popup has requested us to check the urls on the page

        checkUrlsOnPage().then(function (result) {
            sendResponse({ results: result });
        });

        // Returning true means we will eventually send a response so please wait!
        return true;
    } else if (request.action === "emailId") {
        // If popup requested us to obtain the emailId of the gmail email we are looking at right now

        let emailId = document.querySelector('[data-message-id]');
        if (emailId === null) {
            emailId = -1;
        } else {
            emailId = emailId.getAttribute('data-legacy-message-id');
        }

        sendResponse({ results: emailId });

        return true;
    }

});

// Function that checks the links on the page, and adds a popup on hover to them if they are potentially dangerous
async function checkUrlsOnPage() {

    if (document.links.length > 500) {
        // Can't cope with so many links right now
        return "Too many links";
    }

    let urlList = []
    let urlReferences = []
    // Loop through the links on the page and obtain their URL
    for (let i = 0; i < document.links.length; i++) {

        urlReferences.push(document.links[i]);
        let urlObject = {}
        urlObject.url = document.links[i].href;
        urlList.push(urlObject);

    }

    let response = await checkUrls(urlList);
    let data = await response.json();

    if (Object.keys(data).length === 0 && data.constructor === Object) {
        // No threat on page
        return "0";
    } else if (data.matches) {
        // Threats on page

        let matches = data.matches;

        let susNum = 0;
        for (link of urlReferences) {

            for (match of matches) {
                if (link.href === match.threat.url) {

                    link.style = "color: red";
                    link.innerText = "POTENTIALLY DANGEROUS LINK"
                    let susClass = "sus" + String(susNum);
                    link.classList.add(susClass);

                    let warningMessage = "<h3>POTENTIAL THREAT DETECTED!</h3>";
                    warningMessage += "URL: <strong>" + match.threat.url + "</strong><br><br>";
                    warningMessage += "CLASSIFICATION: <strong>" + match.threatType + "</strong><br><br>";
                    warningMessage += "PLATFORM: <strong>" + match.platformType + "</strong><br><br>";

                    if (match.threatType === "MALWARE") {
                        // Information for malware
                        warningMessage += "<strong>Warning - Visiting this web site may harm your computer</strong><br><br>";
                        warningMessage += "This page appears to contain malicious code that could be downloaded to your computer without your consent.";
                    }
                    else if (match.threatType === "SOCIAL_ENGINEERING") {
                        // Information for phishing
                        warningMessage += "<strong>Warning - Deceptive site ahead</strong><br><br>"
                        warningMessage += "This page may trick you into doing something dangerous like installing software or revealing personal information ";
                        warningMessage += "(for example, passwords, phone numbers, or credit cards).";
                    }
                    else if (match.threatType === "UNWANTED_SOFTWARE") {
                        // Information for unwanted software
                        warningMessage += "<strong>Warning - The site ahead may contain harmful programs</strong><br><br>"
                        warningMessage += "Attackers might attempt to trick you into installing programs that harm your browsing experience ";
                        warningMessage += "(for example, by changing your homepage or showing extra ads on sites you visit).";
                    }
                    else if (match.threatType === "POTENTIALLY_DANGEROUS_APPLICATION") {
                        // Information for Potentially Harmful Applications
                        warningMessage += "<strong>Warning - The site ahead may contain malware</strong><br><br>"
                        warningMessage += "Attackers might attempt to install dangerous apps on your device that steal or delete your information ";
                        warningMessage += "(for example, photos, passwords, messages, and credit cards).";
                    }

                    // Give each link a informative popup on hover
                    susClass = "." + susClass;
                    $(susClass).each(function () {
                        $(this).attr("title", "");
                        $(this).tooltip({
                            content: warningMessage
                        });
                    });

                    susNum++;
                    break;

                }
            }


        }

        // Return number of suspicious links
        return String(matches.length);
    }


    return "0";

}

// Function that sets up the fetch to check the safety of links
function checkUrls(urls) {

    // Create payload for the fetch
    let payload = {
        "client": {
            "clientId": "click-safe",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            // OPTIONS: MALWARE, SOCIAL_ENGINEERING, POTENTIALLY_HARMFUL_APPLICATION, UNWANTED_SOFTWARE
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION", "UNWANTED_SOFTWARE"],
            // OPTIONS: ANY_PLATFORM, WINDOWS, LINUX, OSX, ALL_PlATFORMS, CHROME
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": []
        }
    }

    payload.threatInfo.threatEntries.push(urls);

    // Create our options for the fetch
    const options = {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(payload)
    };

    return fetch('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=-- INSERT SAFEBROWSING GOOGLE API KEY HERE --', options)

}        