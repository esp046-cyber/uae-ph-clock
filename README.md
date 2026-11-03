# UAE–PH Clock (PWA)
Live Dubai (`Asia/Dubai`, UTC+4) and Manila (`Asia/Manila`, UTC+8) time. No build step, no dependencies. Neither zone uses DST; conversions use `Intl`.

## Deploy to GitHub Pages
1. Create a repo and upload everything in this folder to the root of the `main` branch.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://YOUR-USER.github.io/YOUR-REPO/`. All paths are relative, so subfolder hosting works.
4. In `index.html`, replace `YOUR-USER` / `YOUR-REPO` in the og:/twitter: tags with your real address (social previews need absolute URLs).
5. Custom domain: Pages → Custom domain → add DNS records → tick Enforce HTTPS.

## Updating
Change `V` in `sw.js` (e.g. `uaeph-v2`) whenever you change any file, so users get the new version.

## Notes
- iOS has no install event: the app shows a Share → Add to Home Screen banner instead. Haptics (Vibration API) are not supported on iOS and degrade silently.
- Wake Lock needs a supported browser and HTTPS. It is re-acquired after the tab returns to the foreground.
- Screenshots are generated illustrations, not captures of the running app. Replace them with real ones if you like.
