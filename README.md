# Attendee Conference App

This is a code bundle for Attendee Conference App. It began as a figma proof of concept.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the local development server for testing.

Run `npm run build` to prepare for deployment to firebase

Run `npm run deploy` to copy to firebase and https://pacific-div.web.app

## Running tests

Run `npm run test` to execute the unit test suite (must be run from within the project directory tree).

To run tests from **any** directory (including outside the project tree), use the included wrapper script:

```bash
/path/to/pacific-div-figma/test.sh
```

The script automatically navigates to the project root before running the tests, so it works regardless of your current working directory. You can add the project root to your `PATH` or create a shell alias for convenience.
