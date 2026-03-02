# Attendee Conference App

This is a code bundle for Attendee Conference App. It began as a figma proof of concept.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the local development server for testing.

Run `npm run build` to prepare for deployment to firebase

Run `npm run deploy` to copy to firebase and https://pacific-div.web.app

## Running tests

Run `npm run test` to execute the unit test suite (must be run from within the project directory tree).

To run tests from **any** directory (including outside the project tree or any subdirectory), use the included wrapper scripts:

- **macOS / Linux:** `test.sh`
- **Windows:** `test.bat`

Both scripts automatically navigate to the project root before running the tests, so they work regardless of your current working directory.

```bash
# macOS / Linux — from any directory
/path/to/pacific-div-figma/test.sh
```

```bat
:: Windows — from any directory (e.g. src\data)
C:\path\to\pacific-div-figma\test.bat
```

You can add the project root to your `PATH` (or create a shell alias / Windows shortcut) so you can invoke `test.sh` or `test.bat` without the full path.
