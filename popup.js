import { createUrlChecker } from './popupFunctions/urlChecker.js';
import { checkUrlsOnPage } from './popupFunctions/pageChecker.js';
import { checkEmail } from './popupFunctions/emailChecker.js';

resetPopup();

// Function that resets the popup
export function resetPopup() {

    // Clear main
    let main = document.getElementById("main");
    while (main.firstChild) {
        main.removeChild(main.lastChild);
    }

    // Create div to hold the buttons
    let buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-div");
    main.appendChild(buttonDiv);

    // Add button to check email
    let emailCheckButton = document.createElement("button");
    emailCheckButton.id = "email-check-button";
    emailCheckButton.classList.add("button-2");
    emailCheckButton.innerText = "Check Email";
    emailCheckButton.addEventListener("click", checkEmail);
    buttonDiv.appendChild(emailCheckButton);

    // Add button that will check all the urls on the page
    let pageCheckButton = document.createElement("button");
    pageCheckButton.id = "page-check-button";
    pageCheckButton.classList.add("button-2");
    pageCheckButton.innerText = "Check URLs of this page";
    pageCheckButton.addEventListener("click", checkUrlsOnPage);
    buttonDiv.appendChild(pageCheckButton);

    // Add button that will change the popup to allow a user to check a specific URL
    let urlCheckButton = document.createElement("button");
    urlCheckButton.id = "url-check-button";
    urlCheckButton.classList.add("button-2");
    urlCheckButton.innerText = "Check a specific URL";
    urlCheckButton.addEventListener("click", createUrlChecker);
    buttonDiv.appendChild(urlCheckButton);

}

// Function to decode base64
export function base64Decode(input) {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    let pad = input.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        input += new Array(5 - pad).join('=');
    }



    return atob(input);
}

// Function that sets up the fetch to check a list of urls and returns a promise
// NOTE: urls should not contain more than 500 urls
export function checkUrls(urls) {

    // Create payload for the fetch
    let payload = {
        "client": {
            "clientId": "click-safe",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            // OPTIONS: MALWARE, SOCIAL_ENGINEERING, POTENTIALLY_HARMFUL_APPLICATION, UNWANTED_SOFTWARE
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION", "UNWANTED_SOFTWARE"],
            // OPTIONS: ANY_PLATFORM, WINDOWS, LINUX, OSX, ALL_PLATFORMS, CHROME
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": []
        }
    }

    for (let i = 0; i < urls.length; i++) {
        payload.threatInfo.threatEntries.push({ "url": urls[i] });
    }

    // Create our options for the fetch
    const options = {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(payload)
    };

    return fetch('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=-- INSERT SAFEBROWSING GOOGLE API KEY --', options);

}
