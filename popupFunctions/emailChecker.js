import { resetPopup, base64Decode } from '../popup.js';

// Function that brings up the check email "page" in the popup
export function checkEmail() {

    // Clear main
    let main = document.getElementById("main");
    while (main.firstChild) {
        main.removeChild(main.lastChild);
    }

    // Add the loading symbol
    let loadingMessage = document.getElementById("loading");
    loadingMessage.style.display = "block";

    // Get the authentication token for the users gmail
    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {

        // Check we signed in properly
        if (token === undefined) {

            let main = document.getElementById("main");

            let loadingMessage = document.getElementById("loading");
            loadingMessage.style.display = "none";

            // Add a back button
            let backButton = document.createElement("button");
            backButton.classList.add("button-1");
            backButton.innerText = "BACK";
            backButton.addEventListener("click", resetPopup);
            main.appendChild(backButton);

            // Add a heading informing user about the problem
            let errorHeading = document.createElement("h1");
            errorHeading.innerText = "ERROR: Could not authenticate your Gmail correctly";
            main.appendChild(errorHeading);

            return;
        }

        // We are authenticated with gmail correctly
        // Send a message to the content script to find the email id of the email we are looking at
        chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
            chrome.tabs.sendMessage(activeTabs[0].id, { action: "emailId" }, function (response) {

                if (response.results != -1) {
                    fetchEmail(token, response.results);
                } else {
                    // Couldn't find an email on this page

                    let main = document.getElementById("main");

                    let loadingMessage = document.getElementById("loading");
                    loadingMessage.style.display = "none";

                    // Add a back button
                    let backButton = document.createElement("button");
                    backButton.classList.add("button-1");
                    backButton.innerText = "BACK";
                    backButton.addEventListener("click", resetPopup);
                    main.appendChild(backButton);

                    // Add a heading informing user about the problem
                    let errorHeading = document.createElement("h1");
                    errorHeading.innerText = "ERROR: Could not find a valid Gmail email on this page";
                    main.appendChild(errorHeading);
                }

            });
        });

    });

}

// Function that fetches the contents of an email for a logged in user
function fetchEmail(token, emailId) {

    // Create our options for the fetch
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        method: "GET",
    };

    fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}?-- INSERT GMAIL API KEY HERE --`, options)
        .then(res => {
            console.log(res);
            return res.json();
        })
        .then(email => {

            console.log(email)
            let main = document.getElementById("main");

            // NOTE:
            // Body content in plain text and html stored in: email.payload.parts[X].body.data
            // Sender in: email.payload.headers[X].value
            let sender = "";
            for (obj of email.payload.headers) {
                if (obj.name === "From") {
                    sender = obj.value;
                }
            }

            let regex = /<.*?>$/;
            let senderEmail = sender.match(regex).toString();
            senderEmail = senderEmail.substring(1, senderEmail.length - 1);

            // Send a message to the content script to check the page for us
            chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
                chrome.tabs.sendMessage(activeTabs[0].id, { action: 'checkUrls' }, function (response) {

                    checkSenderReputation(senderEmail)
                        .then(res => {
                            return res.json();
                        })
                        .then(emailRep => {

                            let loadingMessage = document.getElementById("loading");
                            loadingMessage.style.display = "none";

                            // Add a back button
                            let backButton = document.createElement("button");
                            backButton.classList.add("button-1");
                            backButton.innerText = "BACK";
                            backButton.addEventListener("click", resetPopup);
                            main.appendChild(backButton);

                            // Determine if email is suspicious, dangerous, or safe
                            let emailState = "NOT SUSPICIOUS";
                            let suspiciousWords = ["covid", "coronavirus", "urgent", "payment"];
                            let emailBody = base64Decode(email.payload.parts[0].body.data).toLowerCase();

                            if (parseInt(response.results) >= 1) {
                                emailState = "DANGEROUS";
                            } else if (emailRep.suspicious === true) {
                                emailState = "SUSPICIOUS"
                            } else {

                                for (word of suspiciousWords) {

                                    if (emailBody.includes(word)) {
                                        emailState = "SUSPICIOUS";
                                        break;
                                    }

                                }

                            }

                            if (emailState === "DANGEROUS") {
                                // Likely unsafe email
                                let failureDiv = document.createElement("div");
                                failureDiv.id = "div-container";
                                failureDiv.classList.add("failure-div");

                                let failureImage = document.createElement("img");
                                failureImage.src = "images/skull2.svg";
                                failureImage.width = "65";
                                failureImage.height = "65";
                                failureDiv.appendChild(failureImage);

                                main.appendChild(failureDiv);

                            } else if (emailState === "SUSPICIOUS") {
                                // Suspicious email
                                let suspiciousDiv = document.createElement("div");
                                suspiciousDiv.id = "div-container";
                                suspiciousDiv.classList.add("suspicious-div");

                                let suspiciousImage = document.createElement("img");
                                suspiciousImage.src = "images/flag.svg";
                                suspiciousImage.width = "65";
                                suspiciousImage.height = "65";
                                suspiciousDiv.appendChild(suspiciousImage);

                                main.appendChild(suspiciousDiv);

                            } else {
                                // Likely safe email
                                let successDiv = document.createElement("div");
                                successDiv.id = "div-container";
                                successDiv.classList.add("success-div");

                                let successImage = document.createElement("img");
                                successImage.src = "images/tick.svg";
                                successImage.width = "65";
                                successImage.height = "65";
                                successDiv.appendChild(successImage);

                                main.appendChild(successDiv);

                            }


                            let div = document.getElementById("div-container");

                            let ultimateVerdict = document.createElement("h1");
                            ultimateVerdict.innerText = emailState;
                            div.appendChild(ultimateVerdict);

                            // ===================
                            // LINK ANALYSIS
                            // ===================

                            // Add the information about the links in the email
                            let linksHeading = document.createElement("h1");
                            linksHeading.innerText = "Link Analysis:"
                            div.appendChild(linksHeading);

                            let linksText = document.createElement("p");
                            if (parseInt(response.results) === -1) {
                                linksText.innerText = "Too many links in the email to deal with right now.";
                            } else if (parseInt(response.results) === 0) {
                                linksText.innerHTML = "No potentially dangerous links found in this email.<br><br>";
                                linksText.innerHTML += "This does <strong>NOT</strong> mean the links in this email are necessarily safe to click on."
                            } else if (parseInt(response.results) > 0) {
                                linksText.innerText = "There were " + String(response.results) + " links on this page on Google's unsafe web resources list.";
                            }
                            div.appendChild(linksText);

                            let advisoryLink = document.createElement("a");
                            advisoryLink.innerText = "Advisory provided by Google";
                            advisoryLink.href = "https://developers.google.com/safe-browsing/v4/advisory";
                            advisoryLink.target = "_blank";
                            div.appendChild(advisoryLink);

                            // ===================
                            // SENDER ANALYSIS
                            // ===================

                            // Add the information about the reputation of the sender
                            let senderHeading = document.createElement("h1");
                            senderHeading.innerText = "Sender Analysis:"
                            div.appendChild(senderHeading);

                            let senderText = document.createElement("p");
                            if (emailRep.status === "fail" || emailRep === undefined || emailRep === null) {
                                senderText.innerHTML = "Error contacting Email Rep API";
                            } else {

                                if (emailRep.suspicious === false) {
                                    senderText.innerHTML = "<strong>Sender is not suspicious</strong><br><br>";
                                } else if (emailRep.suspicious === true) {
                                    senderText.innerHTML = "<strong>WARNING - Sender is suspicious</strong><br><br>";
                                }

                                if (emailRep.reputation === "none") {
                                    senderText.innerHTML += "<strong>Sender Reputation:</strong> <p style='color:red;-webkit-text-stroke: 0.5px navy;text-stroke: 0.5px black;font-size: 25px;'>none</p>";
                                } else if (emailRep.reputation === "low") {
                                    senderText.innerHTML += "<strong>Sender Reputation:</strong> <p style='color:red;-webkit-text-stroke: 0.5px navy;text-stroke: 0.5px black;font-size: 25px;'>low</p>";
                                } else if (emailRep.reputation === "medium") {
                                    senderText.innerHTML += "<strong>Sender Reputation:</strong> <p style='color:yellow;-webkit-text-stroke: 0.5px navy;text-stroke: 0.5px black;font-size: 25px;'>medium</p>";
                                } else if (emailRep.reputation === "high") {
                                    senderText.innerHTML += "<strong>Sender Reputation:</strong> <p style='color:green;-webkit-text-stroke: 0.5px navy;text-stroke: 0.5px black;font-size: 25px;'>high</p>";
                                }

                                senderText.innerHTML += emailRep.summary;
                            }
                            div.appendChild(senderText);

                            // ===================
                            // BODY ANALYSIS
                            // ===================

                            // Add information about the analysis of the email contents
                            let bodyHeader = document.createElement("h1");
                            bodyHeader.innerText = "Body Analysis:";
                            div.appendChild(bodyHeader);

                            let dodgyList = document.createElement("ul");
                            let susFound = false;

                            if (emailBody.includes("covid") || emailBody.includes("coronavirus")) {
                                // Email mentions coronavirus
                                susFound = true;
                                let virusPoint = document.createElement("li");
                                virusPoint.innerHTML = "<strong>WARNING</strong> - This email references COVID-19/coronavirus. There is a lot of phishing ";
                                virusPoint.innerHTML += "emails going around at the moment trying to play off this tragedy. Use caution";
                                dodgyList.appendChild(virusPoint);

                            }

                            if (emailBody.includes("urgent")) {
                                // Email mentions urgency
                                susFound = true;
                                let urgentPoint = document.createElement("li");
                                urgentPoint.innerHTML = "<strong>WARNING</strong> - This email has a sense of urgency. This is a common tactic by phishers to try ";
                                urgentPoint.innerHTML += "and get you to react and do what they want without thought. Use caution";
                                dodgyList.appendChild(urgentPoint);

                            }

                            if (emailBody.includes("payment")) {
                                // Email mentions something urgent or payment is involved
                                susFound = true;
                                let paymentPoint = document.createElement("li");
                                paymentPoint.innerHTML = "<strong>WARNING</strong> - This email is asking for payments. A phisher could be trying to steal ";
                                paymentPoint.innerHTML += "your money or credit card information. Use caution";
                                dodgyList.appendChild(paymentPoint);

                            }

                            if (susFound === false) {
                                // No suspicious words found
                                let nothingFoundText = document.createElement("p");
                                nothingFoundText.innerText = "No particularly suspicious words found";
                                div.appendChild(nothingFoundText);

                            } else {
                                div.appendChild(dodgyList);
                            }

                        })

                });
            });

        })


}

// Function to call the api that checks the reputation of the sender
function checkSenderReputation(sender) {

    // Create our options for the fetch
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Key": "-- INSERT EMAILREP API KEY HERE --"
        },
        method: "GET",
    };

    return fetch(`https://emailrep.io/${sender}?summary=true`, options);

}