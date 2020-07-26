# Click Safe
### NOTE: This project is very much in beta. It is likely not as completely secure/efficient as it could be 
## Setup
First, download this repo. Then go to your chrome extensions tab. Click on "load unpacked", and select this folder. The extension should appear on the extension bar.

## IMPORTANT: You will need to provide your own ids/keys for the extension to work. Here is a list of the files/line numbers that you will need to change

manifest.json line 38: Oauth2 client id
popupFunctions/emailChecker.js line 89: Gmail API key
popupFunctions/emailChecker.js line 336: EmailRep API key
check_links.js line 156: SafeBrowsing Google API key
popup.js line 101: SafeBrowsing Google API key

## Video demo + Blogs
I also made a video demo demonstrating the use of this extension, as well as a series of blogs discussing my development process.

Video link: https://www.youtube.com/watch?v=VicFvINMa8E

Blog link: https://www.openlearning.com/u/joshuaderbe-q5vc50/blog/?tag=something-awesome