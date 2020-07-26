import { resetPopup, checkUrls } from '../popup.js';

// Creates the "page" of the url checker in the popup
export function createUrlChecker() {

    // Remove the previous menu
    let main = document.getElementById("main");
    while (main.firstChild) {
        main.removeChild(main.lastChild);
    }

    // Add a back button
    let backButton = document.createElement("button");
    backButton.classList.add("button-1");
    backButton.innerText = "BACK";
    backButton.addEventListener("click", resetPopup);
    main.appendChild(backButton);

    // Add the heading
    let heading = document.createElement("h1");
    heading.id = "url-checker-heading";
    heading.innerText = "Unsafe URL Checker:";
    main.appendChild(heading);

    // Create the form for URL input
    let urlCheckerForm = document.createElement("form");
    urlCheckerForm.id = "url-form";
    urlCheckerForm.name = "url-form";

    // Create the text box for the input
    let input = document.createElement("input");
    input.type = "text";
    input.id = "url-input";
    input.name = "url-input";
    input.placeholder = "Enter a URL";
    urlCheckerForm.appendChild(input);

    // Create the submit button
    let submitButton = document.createElement("button");
    submitButton.classList.add("button-1");
    submitButton.type = "submit";
    submitButton.id = "url-check-submit";
    submitButton.innerText = "Check URL";
    urlCheckerForm.appendChild(submitButton);

    urlCheckerForm.addEventListener("submit", (event) => {

        event.preventDefault()
        handleUrlForm(event);

    })

    main.appendChild(urlCheckerForm);

}

// Function that handles the URL form when checking a specific URL
export function handleUrlForm(event) {

    let urls = []
    const url = document.forms["url-form"]["url-input"];
    urls.push(url.value);

    // Get rid of the success message if it's still there
    let successDiv = document.getElementById("success-div");
    if (successDiv) {
        while (successDiv.firstChild) {
            successDiv.removeChild(successDiv.lastChild);
        }
        successDiv.remove();
    }

    // Get rid of the failure message if it's still there
    let failureDiv = document.getElementById("failure-div");
    if (failureDiv) {
        while (failureDiv.firstChild) {
            failureDiv.removeChild(failureDiv.lastChild);
        }
        failureDiv.remove();
    }

    // Add the loading message
    let loadingMessage = document.getElementById("loading");
    loadingMessage.style.display = "block";

    checkUrls(urls)
        .then(res => {
            return res.json();
        })
        .then(json => {

            // Remove the loading message
            let loading = document.getElementById("loading");
            loading.style.display = "none";

            let main = document.getElementById("main");

            if (Object.keys(json).length === 0 && json.constructor === Object) {
                // Urls were safe

                // Create a div for the success message
                let successDiv = document.createElement("div");
                successDiv.id = "success-div";
                successDiv.classList.add("success-div");

                let successImage = document.createElement("img");
                successImage.src = "images/tick.svg";
                successImage.width = "65";
                successImage.height = "65";
                successDiv.appendChild(successImage);

                let heading = document.createElement("h1");
                heading.id = "success-heading";
                heading.innerText = "URL is likely safe!"
                successDiv.appendChild(heading);

                let message = document.createElement("p");
                message.id = "success-message";
                message.classList.add("message");
                message.innerText = "'" + String(url.value) + "' was not on Google's unsafe web resources list.";
                successDiv.appendChild(message);

                let advisoryLink = document.createElement("a");
                advisoryLink.innerText = "Advisory provided by Google";
                advisoryLink.href = "https://developers.google.com/safe-browsing/v4/advisory";
                advisoryLink.target = "_blank";
                successDiv.appendChild(advisoryLink);

                let informationDiv = document.createElement("div");
                informationDiv.classList.add("information-div");

                let informationImage = document.createElement("img");
                informationImage.src = "images/information.svg";
                informationImage.width = "30";
                informationImage.height = "30";
                informationDiv.appendChild(informationImage);

                let information = document.createElement("p");
                information.id = "success-information";
                information.innerHTML = "This does ";
                information.innerHTML += "<strong>NOT</strong>";
                information.innerHTML += " mean the URL is necessarily safe to use. Google may have not discovered it yet."
                information.innerHTML += " Read more on Google's unsafe web resources list "

                let listInfo = document.createElement("a");
                listInfo.href = "https://developers.google.com/safe-browsing/v4/advisory";
                listInfo.innerText = "here.";
                listInfo.target = "_blank";

                information.appendChild(listInfo);
                informationDiv.appendChild(information);

                successDiv.appendChild(informationDiv);

                main.appendChild(successDiv);
            } else {
                // Urls were not safe

                // Create a div for the failure message
                let failureDiv = document.createElement("div");
                failureDiv.id = "failure-div";
                failureDiv.classList.add("failure-div");

                let failureImage = document.createElement("img");
                failureImage.src = "images/skull2.svg";
                failureImage.width = "65";
                failureImage.height = "65";
                failureDiv.appendChild(failureImage);

                let heading = document.createElement("h1");
                heading.id = "failure-heading";
                heading.innerText = "URL is likely unsafe!"
                failureDiv.appendChild(heading);

                let message = document.createElement("p");
                message.id = "failure-message";
                message.classList.add("message");
                message.innerText = "'" + String(json.matches[0].threat.url) + "' was on Google's unsafe web resources list!";
                failureDiv.appendChild(message);

                let classification = document.createElement("p");
                classification.id = "failure-classification";
                classification.classList.add("classification");
                classification.innerText = "CLASSIFICATION: " + String(json.matches[0].threatType);
                failureDiv.appendChild(classification);

                let platform = document.createElement("p");
                platform.id = "failure-platform";
                platform.classList.add("platform");
                platform.innerText = "PLATFORM: " + String(json.matches[0].platformType);
                failureDiv.appendChild(platform);

                let advisoryLink = document.createElement("a");
                advisoryLink.innerText = "Advisory provided by Google";
                advisoryLink.href = "https://developers.google.com/safe-browsing/v4/advisory";
                advisoryLink.target = "_blank";
                failureDiv.appendChild(advisoryLink);

                let informationDiv = document.createElement("div");
                informationDiv.classList.add("information-div");

                let informationImage = document.createElement("img");
                informationImage.src = "images/information.svg";
                informationImage.width = "30";
                informationImage.height = "30";
                informationDiv.appendChild(informationImage);

                let information = document.createElement("p");
                information.id = "failure-information";
                if (json.matches[0].threatType === "MALWARE") {
                    // Information box for malware
                    information.innerHTML += "<strong>Warning - Visiting this web site may harm your computer</strong><br><br>";
                    information.innerHTML += "This page appears to contain malicious code that could be downloaded to your computer without your consent.<br><br>";
                    information.innerHTML += "You can learn more about harmful web content including viruses and other malicious code and how to protect your computer at ";

                    let malwareInfo = document.createElement("a");
                    malwareInfo.href = "https://www.stopbadware.org/badware";
                    malwareInfo.innerText = "StopBadware.org";
                    malwareInfo.target = "_blank";

                    information.appendChild(malwareInfo);
                    informationDiv.appendChild(information);
                }
                else if (json.matches[0].threatType === "SOCIAL_ENGINEERING") {
                    // Information box for phishing
                    information.innerHTML += "<strong>Warning - Deceptive site ahead</strong><br><br>"
                    information.innerHTML += "This page may trick you into doing something dangerous like installing software or revealing personal information ";
                    information.innerHTML += "(for example, passwords, phone numbers, or credit cards).<br><br>";
                    information.innerHTML += "You can learn more about social engineering (phishing) at ";

                    let phishingInfo = document.createElement("a");
                    phishingInfo.href = "https://support.google.com/webmasters/answer/6350487";
                    phishingInfo.innerText = "Social Engineering (Phishing and Deceptive Sites).";
                    phishingInfo.target = "_blank";

                    information.appendChild(phishingInfo);
                    informationDiv.appendChild(information);
                }
                else if (json.matches[0].threatType === "UNWANTED_SOFTWARE") {
                    // Information box for Unwanted Software
                    information.innerHTML += "<strong>Warning - The site ahead may contain harmful programs</strong><br><br>"
                    information.innerHTML += "Attackers might attempt to trick you into installing programs that harm your browsing experience ";
                    information.innerHTML += "(for example, by changing your homepage or showing extra ads on sites you visit).<br><br>";
                    information.innerHTML += "You can learn more about unwanted software at ";

                    let unwantedSoftwareInfo = document.createElement("a");
                    unwantedSoftwareInfo.href = "http://www.google.com/about/company/unwanted-software-policy.html";
                    unwantedSoftwareInfo.innerText = "Unwanted Software Policy.";
                    unwantedSoftwareInfo.target = "_blank";

                    information.appendChild(unwantedSoftwareInfo);
                    informationDiv.appendChild(information);
                }
                else if (json.matches[0].threatType === "POTENTIALLY_HARMFUL_APPLICATION") {
                    // Information box for Potentially Harmful Applications
                    information.innerHTML += "<strong>Warning - The site ahead may contain malware</strong><br><br>"
                    information.innerHTML += "Attackers might attempt to install dangerous apps on your device that steal or delete your information ";
                    information.innerHTML += "(for example, photos, passwords, messages, and credit cards).";

                    informationDiv.appendChild(information);
                }

                failureDiv.appendChild(informationDiv);

                main.appendChild(failureDiv);
            }
        });

}