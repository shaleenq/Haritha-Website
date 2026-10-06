# AGENTS.md — Developer & AI Pair Programming Handbook

## Project: SOLID CEYLON GLOBAL LINK (PVT) LTD
**Official Web Platform & Structured Logging Infrastructure**

---

## 1. Executive Summary & Legal Entity

| Attribute | Official Record |
|---|---|
| **Legal Entity Name** | **SOLID CEYLON GLOBAL LINK (PVT) LTD** |
| **Company Registration No** | **PV 00364030** |
| **Governing Statute** | Companies Act No. 7 of 2007 (Democratic Socialist Republic of Sri Lanka) |
| **Official Slogan / Motto** | විශ්වාසය &bull; ස්ථාවරත්වය &bull; පැහැදිලි අනාගතය<br>*(Trust &bull; Stability &bull; Transparent Future)* |
| **Core National Purpose** | "දේශීය නිෂ්පාදන අපනයනය තුළින් ඔබේ ආර්ථිකය රටේ ආර්ථිකය ශක්තිමත් කරන විශ්වාසනීය දේශීය සමාගම" |
| **Headquarters Address** | No: 03, Alubogahawatta, Jamburaliya, Piliyandala, Western Province, Sri Lanka |
| **Contact Hotlines** | 070 110 7192 &bull; 074 103 3636 &bull; 077 816 8031 &bull; 071 190 3313 |
| **WhatsApp Desk** | +94 70 110 7192 |

---

## 2. Executive Leadership Directorate

1. **Haritha Jayaweera**
   - **Title**: Chairman and Managing Director of SOLID CEYLON GLOBAL LINK (Pvt) Ltd
   - **Asset**: `assets/haritha-jayaweera-chairman.jpeg`
2. **Pubudu Gayashan**
   - **Title**: Group Chief Executive Officer & Director Finance and Administration of SOLID CEYLON GLOBAL LINK (Pvt) Ltd
   - **Asset**: `assets/pubudu-gayashan-group-ceo.jpeg`
3. **Shantha Madushanka**
   - **Title**: Chief Executive Officer of Astral Institute & Secretary and Director Legal of SOLID CEYLON GLOBAL LINK (Pvt) Ltd
   - **Asset**: `assets/shantha-madushanka-astral-ceo.jpeg`

---

## 3. Subsidiaries & Strategic Divisions

- **Verdant Ceylon Cultivators**:
  - Focus: Large-scale cultivation of authentic Ceylon Cinnamon (*Cinnamomum verum*), Black Pepper (550GL+), Cardamom, Cloves, and organic agricultural commodities.
  - Asset: `assets/verdant-ceylon-cultivators.jpeg`
- **Verdant Ceylon Collection Point**:
  - Focus: Island-wide farmgate aggregation nodes, quality testing, and ethical direct-purchase hubs eliminating intermediaries.
  - Asset: `assets/verdant-ceylon-collection-point.jpeg`
- **Astral Institute**:
  - Motto: *"Empowering Journeys &bull; Unveiling Destiny"*
  - Focus: Accredited vocational training, overseas education pathways, language mastery, and global workforce migration consultancy.
  - Asset: `assets/astral-institute-subsidiary.jpeg`

---

## 4. Media Asset Catalog & Renaming Manifest

All raw media files provided have been scanned and organized into the `./assets/` directory using lowercase names with hyphens:

| Original Raw Filename | Standardized Web-Friendly Path | Media Type & Description |
|---|---|---|
| `WhatsApp Image 2026-10-02 at 08.35.26 (1).jpeg` | `assets/solid-ceylon-global-link-emblem.jpeg` | Official 3D Gold Lion & Globe Corporate Emblem |
| `WhatsApp Image 2026-10-02 at 08.35.28.jpeg` | `assets/haritha-jayaweera-chairman.jpeg` | Executive Portrait: Haritha Jayaweera (Chairman & MD) |
| `WhatsApp Image 2026-10-02 at 08.35.29.jpeg` | `assets/pubudu-gayashan-group-ceo.jpeg` | Executive Portrait: Pubudu Gayashan (Group CEO & Finance) |
| `WhatsApp Image 2026-10-02 at 08.35.28 (1).jpeg` | `assets/shantha-madushanka-astral-ceo.jpeg` | Executive Portrait: Shantha Madushanka (Astral CEO & Legal) |
| `WhatsApp Image 2026-10-02 at 08.34.52.jpeg` | `assets/astral-institute-subsidiary.jpeg` | Brand Banner: Astral Institute ("Empowering Journeys") |
| `WhatsApp Image 2026-10-02 at 08.35.27.jpeg` | `assets/verdant-ceylon-cultivators.jpeg` | Brand Emblem: Verdant Ceylon Cultivators |
| `WhatsApp Image 2026-10-02 at 08.35.26.jpeg` | `assets/verdant-ceylon-collection-point.jpeg` | Brand Emblem: Verdant Ceylon Collection Point |
| `WhatsApp Image 2026-10-02 at 08.35.26 (2).jpeg` | `assets/investment-plans-matrix.jpeg` | Official Investment Return Schedule Matrix |
| `BR.pdf` | `assets/company-incorporation-certificate.pdf` | Form 2A Certificate of Incorporation (PV 00364030) |
| `WhatsApp Video 2026-10-02 at 08.34.55.mp4` | `assets/company-promotional-video.mp4` | Official Corporate Video with Sinhala Voiceover |
| *(Generated Asset)* | `assets/ceylon-spices-export.jpeg` | Luxury True Ceylon Cinnamon Quills, Cardamom & Pepper |
| *(Generated Asset)* | `assets/global-maritime-logistics.jpeg` | International Container Vessel Freight & Maritime Trade |

---

## 5. Structured JSON Logging Architecture

### Local Log Destination
All logs are saved inside `./logs/dev.log` as line-delimited JSON (`JSONL`).

### Transaction ID Requirement
**Every distinct user event generates a unique transaction ID** (e.g. `tx_calc_179094...`, `tx_click_nav_...`, `tx_submit_inquiry_...`).

### Mandatory Log Levels & Rules

| Log Level | Required Trigger Condition | Example Trigger in Application |
|---|---|---|
| **`INFO`** | Normal navigation & standard interactions | - Page load and DOM initialization<br>- Navigation link clicked or anchor scrolled into view<br>- Language switch (English &harr; Sinhala)<br>- Interactive investment calculator adjusted<br>- Modal opened or closed |
| **`WARN`** | Missing media assets or degraded assets | - Any `<img>`, `<video>`, or `<source>` element firing `onerror`<br>- Static file requested under `/assets/` that does not exist on disk<br>- Server-side startup asset integrity check detecting missing file |
| **`ERROR`** | Broken functional logic or runtime exceptions | - Form validation failures (e.g. missing name, invalid phone length)<br>- Calculator input bounds violations (e.g. negative numbers, out of bounds)<br>- Unhandled JS runtime exceptions (`window.onerror`)<br>- Unhandled promise rejections (`window.onunhandledrejection`)<br>- API failure or database error |

### Log Line Schema
```json
{
  "timestamp": "2026-10-02T13:42:01.428Z",
  "level": "INFO | WARN | ERROR",
  "transactionId": "tx_20261002_a7b8c9d0",
  "sessionId": "ses_k4j8x92",
  "category": "navigation | missing_media_asset | functional_logic | api",
  "source": "frontend | backend",
  "message": "Descriptive human-readable explanation of event",
  "details": {
    "key": "value"
  }
}
```

### Live Log Drawer & In-Page Audit Console
Users and developers can click the floating **`🛡️ dev.log`** badge at the bottom-right of the screen to open the live inspector.
The console includes interactive buttons:
- **Test WARN**: Simulates an attempt to load a missing image asset, generating a WARN log.
- **Test ERROR**: Simulates a functional logic exception, generating an ERROR log.
- **Test INFO**: Simulates a navigation event, generating an INFO log.
- **Sync File**: Fetches the latest 50 entries directly from the physical `./logs/dev.log` file.

---

## 6. Official Investment Return Calculation Matrix

The company operates a fixed guaranteed schedule backed by agricultural export inventory:

| Principal (ආයෝජන මුදල) | Year 1 Return (1.25x) | Year 2 Return (1.54x) | Year 3 Return (1.87x) |
|---|---|---|---|
| **LKR 100,000** (1 Lakh) | Rs. 125,000 (+25%) | Rs. 154,000 (+54%) | Rs. 187,000 (+87%) |
| **LKR 300,000** (3 Lakhs) | Rs. 375,000 (+25%) | Rs. 462,000 (+54%) | Rs. 561,000 (+87%) |
| **LKR 500,000** (5 Lakhs) | Rs. 625,000 (+25%) | Rs. 770,000 (+54%) | Rs. 935,000 (+87%) |
| **LKR 1,000,000** (10 Lakhs) | Rs. 1,250,000 (+25%) | Rs. 1,540,000 (+54%) | Rs. 1,870,000 (+87%) |
| **LKR 3,000,000** (30 Lakhs) | Rs. 3,750,000 (+25%) | Rs. 4,620,000 (+54%) | Rs. 5,610,000 (+87%) |

---

## 7. Architecture & Directory Tree

```
d:/Haritha website/
├── assets/                                     # Standardized web-friendly media assets
│   ├── astral-institute-subsidiary-alt.jpeg
│   ├── astral-institute-subsidiary.jpeg
│   ├── ceylon-spices-export.jpeg
│   ├── company-incorporation-certificate.pdf
│   ├── company-promotional-video.mp4
│   ├── global-maritime-logistics.jpeg
│   ├── haritha-jayaweera-chairman.jpeg
│   ├── investment-plans-matrix.jpeg
│   ├── pubudu-gayashan-group-ceo.jpeg
│   ├── shantha-madushanka-astral-ceo.jpeg
│   ├── solid-ceylon-global-link-emblem.jpeg
│   ├── verdant-ceylon-collection-point.jpeg
│   └── verdant-ceylon-cultivators.jpeg
├── logs/
│   └── dev.log                                 # Local structured JSON logs
├── public/
│   ├── css/
│   │   └── style.css                           # Luxury design system (Sapphire & Gold)
│   ├── js/
│   │   ├── app.js                              # Main application logic & calculators
│   │   └── logger.js                           # Structured JSON client logger
│   └── index.html                              # Semantic responsive HTML5 application
├── server.js                                   # Node.js HTTP server with Range streaming
├── package.json                                # Scripts and dependencies
└── AGENTS.md                                   # This agent reference documentation
```

---

## 8. Development & Runtime Operations

### Starting the Server
```powershell
node server.js
```
*Alternatively (via npm command):*
```powershell
npm.cmd run dev
```

### Server Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves `public/index.html` |
| `GET` | `/assets/*` | Serves media assets with HTTP 206 Partial Content support for video |
| `POST` | `/api/logs` | Receives frontend structured JSON log entries; writes to `./logs/dev.log` |
| `GET` | `/api/logs?limit=50` | Returns recent structured logs from `./logs/dev.log` |
| `POST` | `/api/inquiries` | Validates & registers formal inquiries with transaction tracking |
| `GET` | `/api/asset-check` | Live verification of all registered media assets |
| `GET` | `/api/health` | System uptime & corporate metadata status |

---

*Authored for Antigravity AI pair programming sessions.*
