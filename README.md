# Play Store Gap Finder Web Application

A full-featured single-page web application designed to scan the Google Play Store for underserved market opportunities characterized by **high demand** (large review volume) and **low user satisfaction** (ratings $\le 3.5\star$).

---

## 🚀 Accessing the Application

The web server is currently running locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

To run or restart the server in the future:
```bash
npm start
```

---

## 🛠️ Configurable Parameters

The site features interactive controls that allow you to adjust search parameters in real time:

| Parameter | Default | UI Control | Purpose |
| :--- | :---: | :--- | :--- |
| `COUNTRY` | `'in'` | Country Dropdown / Custom Code Input | Target regional Google Play storefront (India 🇮🇳, US 🇺🇸, UK 🇬🇧, etc.) |
| `MAX_RATING` | `3.5` | Linked Range Slider & Number Input | Upper rating threshold to spot unhappy customer segments |
| `MIN_REVIEWS` | `100` | Number Input & Quick Preset Pills (`50`, `100`, `250`, `500`, `1k`) | Minimum reviews threshold to ensure proven buyer demand |
| **Monetization** | `Paid` | Radio Pills (`Paid`, `Free`, `All`) | Filter between paid apps upfront or free/freemium apps |

A live code preview banner is displayed directly on the dashboard:
```javascript
const COUNTRY = 'in'; const MAX_RATING = 3.5; const MIN_REVIEWS = 100;
```
*(With a single-click button to copy the snippet to your clipboard)*

---

## 🔍 Search & Scanner Features

- **Custom Search Queries**: Search for single keywords (e.g. `pomodoro timer`, `scientific calculator`) or batch queries separated by commas.
- **Quick Preset Ideas**: One-click tags for high-potential niches (*study planner*, *document scanner pro*, *flashcards pro*, *habit tracker*, *audio recorder*, *math games*, etc.).
- **"+ All 24 Niche Terms"**: Automatically loads all 24 high-intent niche terms into the scanner.
- **Real-Time Streaming (SSE)**: Inspects Google Play apps live with a visual progress bar, checked app status, and instant row additions as matches are found.
- **Cancellation**: Ability to stop or abort an in-flight scan at any time.

---

## 📥 Export to CSV

Clicking the **"Save to CSV"** button generates an RFC 4180 compliant CSV file with:
- **UTF-8 BOM Header (`\uFEFF`)**: Guarantees characters and currency symbols (e.g. `₹`, `$`, `€`) open without encoding bugs in Microsoft Excel, Google Sheets, Apple Numbers, and LibreOffice.
- **Fields Included**:
  1. Priority Rank
  2. App Name
  3. Package ID
  4. Developer
  5. Category
  6. Price & Currency
  7. Monetization Model (Pure Paid vs In-App Purchases)
  8. Rating Score ($\le$ `MAX_RATING`)
  9. Total Ratings Count ($\ge$ `MIN_REVIEWS`)
  10. Written Reviews Count
  11. Total Downloads
  12. Last Updated Date
  13. Direct Google Play Store Link
  14. App Summary & Pitch

*(An **Excel (.xlsx)** export option is also provided as a secondary export).*

---

## 📁 Source Code Structure

- [server.mjs](file:///c:/Users/debje/playstore-gap-finder/server.mjs): Express backend integrating `google-play-scraper` with Server-Sent Events (SSE) streaming and Excel export.
- [public/index.html](file:///c:/Users/debje/playstore-gap-finder/public/index.html): Semantic single-page HTML layout with configuration cards, metric KPIs, and tabular view.
- [public/styles.css](file:///c:/Users/debje/playstore-gap-finder/public/styles.css): Modern dark-mode dashboard theme with custom glassmorphism, glowing accents, and responsive layout.
- [public/app.js](file:///c:/Users/debje/playstore-gap-finder/public/app.js): Client state management, SSE event listeners, sorting/filtering, and client-side CSV generator.
