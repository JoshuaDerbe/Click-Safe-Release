import { resetPopup } from '../popup.js';

// Function that displays the "page" for checking urls on the page
export function checkUrlsOnPage() {

    // Clear main
    let main = document.getElementById("main");
    while (main.firstChild) {
        main.removeChild(main.lastChild);
    }

    // Add the loading symbol
    let loadingMessage = document.getElementById("loading");
    loadingMessage.style.display = "block";

    // Send a message to the content script to check the page for us
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, { action: 'checkUrls' }, function (response) {

            let main = document.getElementById("main");

            let loadingMessage = document.getElementById("loading");
            loadingMessage.style.display = "none";

            // Add a back button
            let backButton = document.createElement("button");
            backButton.classList.add("button-1");
            backButton.innerText = "BACK";
            backButton.addEventListener("click", resetPopup);
            main.appendChild(backButton);

            if (response.results === "0") {
                // No unsafe links found

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
                heading.innerText = "No potentially dangerous links detected on this page!"
                successDiv.appendChild(heading);

                let message = document.createElement("p");
                message.id = "success-message";
                message.classList.add("message");
                message.innerText = "There are " + response.results + " links on this page that are on Google's unsafe web resources list.";
                successDiv.appendChild(message);

                let advisoryLink = document.createElement("a");
                advisoryLink.innerText = "Advisory provided by Google";
                advisoryLink.href = "https://developers.google.com/safe-browsing/v4/advisory";
                advisoryLink.target = "_blank";
                successDiv.appendChild(advisoryLink);

                // Add the information div
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
                information.innerHTML += " mean the page is necessarily safe to use. Google may have not discovered some of the links on it yet."
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
                // Unsafe links found

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
                heading.innerText = "WARNING: Potentially dangerous links found on this page!"
                failureDiv.appendChild(heading);

                let message = document.createElement("p");
                message.id = "failure-message";
                message.classList.add("message");
                message.innerText = "There are " + response.results + " links on this page that are on Google's unsafe web resources list.";
                message.innerText += " It is NOT recommended to click on any of them."
                failureDiv.appendChild(message);

                let advisoryLink = document.createElement("a");
                advisoryLink.innerText = "Advisory provided by Google";
                advisoryLink.href = "https://developers.google.com/safe-browsing/v4/advisory";
                advisoryLink.target = "_blank";
                failureDiv.appendChild(advisoryLink);


                main.appendChild(failureDiv);

            }


        });
    });

}