# FitPlan – Health & Gym System

**Live site:** https://kavitharangani.github.io/fitplan/

A standalone web app. Sign up or log in, enter your age, gender, weight and height, and it shows:

- **BMI** with a colour gauge (Asian / Sri Lankan or international WHO ranges)
- Whether your weight is **too low, just right or too high**, how many kg to gain or lose, and how many weeks that takes
- **Daily calories** (Mifflin-St Jeor BMR × activity), protein / carbs / fat, water and sleep
- A **7-day Sri Lankan diet plan** with meal times and portions scaled to your calories (non-veg / veg + eggs / pure veg)
- A **weekly exercise plan** with sets, reps, minutes, start time and estimated calories burned. Moves are low-impact for age 60+ or BMI 30+
- **▶ How-to videos**: tap any exercise to watch a YouTube tutorial in a pop-up
- A **daily timetable** covering wake-up, workout, meals, walking, water and sleep
- **Progress tracking** with a weight chart
- **User accounts**: each person signs up with a username and password. Their details and progress are saved under their account and shown again when they log in.

Accounts are stored in the browser's localStorage, so they only exist on that browser and device. Passwords are saved only as salted PBKDF2 hashes, never as plain text. To share accounts across devices, you'd need a backend (for example, Node + a database, or Firebase).

No AI, no server and no install. It's plain HTML, CSS and JavaScript.

**Animations** use [Motion](https://motion.dev), the plain-JavaScript version of Framer Motion, saved locally in `js/vendor/motion.js` (v11.11.13) so it works offline. They're turned off automatically if the device's "reduce motion" setting is on.

## Run

Double-click `index.html`, or serve the folder (needs [Node.js](https://nodejs.org), no `npm install`):

```bash
npm run dev
```

then open http://localhost:5173. If that port is busy, the server picks the next free one and prints the address.

Videos play inside the app only when it's served like this (or hosted online). YouTube blocks embedded players on pages opened straight from disk, so when you double-click `index.html` the ▶ button shows a thumbnail that opens the video on YouTube.

## Files

- `index.html` – page layout
- `css/style.css` – styles (light / dark theme, print layout)
- `js/data.js` – meal options, exercise library and YouTube video IDs (edit these to add foods, exercises or change videos)
- `js/app.js` – calculations and rendering
- `js/fx.js` – animation helpers (enter, stagger, scroll reveal, count-up, spring pop, line draw)
- `js/vendor/motion.js` – Motion animation library
- `dev-server.js` – local server used by `npm run dev`

> General guidance only, not medical advice.
