# Amateur Radio Conference Attendee Companion App Proof of Concept

This is an attendee companion web app designed for attendees of several ARRL conferences.
The goals are to enhance the attendee experience and provide the tools that conference organizers need.
This React 19 app hosted on Google Firebase enables development and authentication.
The planned iOS and Android apps developed with expo.dev will provide the best experience.
Great care and testing will enable seamless offline use by using a local-first LoFi.so architecture.

## Conferences

Proofs of concept have been created using data from past conferences:

- Quartzfest during Jan, Quartzsite, AZ
- Hamcation during Feb, Orlando, FL
- Yuma Hamfest during Feb, Yuma, AZ
- Hamvention during May, Dayton, OH
- Seapac during Jun, Portland, OR
- Huntsville Hamfest during Aug, Huntsville, AL
- Pacificon during Oct, San Ramon, CA

## Running the code

Run `npm install` to install the dependencies.

Run `npm run dev` to start the local development server for testing.

Run `npm run build` to prepare for deployment to firebase

Run `npm run deploy` to copy to firebase and https://pacific-div.web.app
