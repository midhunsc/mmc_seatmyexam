# MMASC Exam Seat Finder

Students enter their **Register Number** and see their **Date, Room, Seat No and Course Name**.
The data comes from the Google Sheet workbook that the Seating Planner uploads to.

Live site (after setup): **https://midhunsc.github.io/mmasc-seat-finder/**

---

## How it fits together

```
Seating Planner  --(Upload Seat Allocation)-->  Apps Script Web App  -->  Google Workbook
                                                                           tabs: 25-09-2026, 26-09-2026 ...
Seat Finder site --(?reg=MM25CCAR001)-------->  Apps Script Web App  -->  returns Room / Seat / Date / Course
```

---

## PART A: Make the Google Sheet the database (one time)

1. Open https://sheets.google.com, click **Blank**, and name it `MMASC Exam Seating Database`.
2. Click **Extensions > Apps Script**.
3. Delete everything in `Code.gs`.
4. In the Seating Planner, open the **Google Sheets Backend** tab, click **Copy Script**, and paste the script into `Code.gs`. Click the **Save** (disk) icon.
5. Click **Deploy > New deployment**, then click the gear icon and choose **Web app**:
   - Description: `Seat database v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**.
6. Click **Authorize access** and choose your Google account. On the "Google hasn't verified this app" screen, click **Advanced > Go to (project name) (unsafe) > Allow**. This is your own script, so it is safe.
7. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy..../exec`.

> The workbook itself stays private. The URL only accepts uploads from the planner and returns the seats for a single register number.

## PART B: Link the workbook to the Seating Planner

1. Open the Seating Planner and go to the **Google Sheets Backend** tab.
2. **Workbook Link:** paste the browser address of your Google Sheet.
3. **Apps Script Web App URL:** paste the URL from step A7.
4. Click **Save Connection**, then **Test Connection**. You should see `Connected to workbook: MMASC Exam Seating Database`.

## PART C: Upload the seat allocation after each exam plan

1. Set the Exam Date and session in the sidebar, then generate the seating plan.
2. Open **View Seating Plan** and click **Upload Seat Allocation to Google Sheet**.
3. A tab named after the exam date (for example `25-09-2026`) is created with the Student Seating List (the same data as page two of the PDF).
   - The forenoon and afternoon sessions of the same date go into the **same tab**.
   - Uploading the same session again **replaces** only that session's rows.

## PART D: Publish this Seat Finder on GitHub Pages

1. Open `config.js` and replace `PASTE_YOUR_WEB_APP_URL_HERE` with the URL from step A7.
2. Go to https://github.com/new:
   - Owner: `midhunsc`, Repository name: `mmasc-seat-finder`, **Public**
   - Click **Create repository**.
3. Click **uploading an existing file** and drag in `index.html`, `style.css`, `app.js`, `config.js` and `README.md`. Click **Commit changes**.
4. Go to **Settings > Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)**, then click **Save**.
5. Wait 1 to 2 minutes, then open **https://midhunsc.github.io/mmasc-seat-finder/**.
6. Share that link (or a QR code of it) with students. A direct link also works:
   `https://midhunsc.github.io/mmasc-seat-finder/?reg=MM25CCAR001`

---

## Updating the Apps Script later

If you edit the script, use **Deploy > Manage deployments**, click the pencil icon, set Version to **New version**, and click **Deploy**. The URL stays the same, so you don't need to change it in the planner or here.

## Troubleshooting

| Problem | Fix |
|---|---|
| Test Connection says `Failed to fetch` | Redeploy the script with *Who has access: **Anyone*** (not "Anyone with Google account"). |
| Upload works but the student search finds nothing | Check that the tab name is a date like `25-09-2026` and that the register number matches column C. |
| Changes to the script don't take effect | You must deploy a **New version** (see above). |
| Seat finder says "not configured" | Fill in `WEB_APP_URL` in `config.js` and commit again. |
