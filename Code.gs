/**
 * Packing List Label Generator - notification email sender.
 *
 * What this does: receives a small JSON summary (box count, dimensions,
 * weights) from the packing list tool whenever someone clicks "Complete &
 * Print Labels," and emails it to a fixed recipient list using GmailApp -
 * meaning the email is genuinely sent from your own Gmail account.
 *
 * SETUP (one time, ~5 minutes):
 *  1. Go to https://script.google.com -> New project.
 *  2. Delete the placeholder code and paste this whole file in.
 *  3. Project Settings (gear icon) -> Script Properties -> Add these two:
 *       NOTIFY_TOKEN   = any password-like string you make up
 *       NOTIFY_EMAILS  = the 3 recipient addresses, comma-separated
 *                        e.g. "a@company.com,b@company.com,c@company.com"
 *  4. Deploy -> New deployment -> type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *     Click Deploy, then authorize it (it's your own script, so this is a
 *     one-time consent prompt for your own Gmail account).
 *  5. Copy the "Web app URL" it gives you.
 *  6. In index.html, set:
 *       NOTIFY_URL   = the Web app URL from step 5
 *       NOTIFY_TOKEN = the same string you set in step 3
 *
 * Why the token exists: this page is public on GitHub Pages, so the Web
 * app URL itself is visible to anyone who views the page source. The token
 * is a simple check so a random visitor who finds the URL can't trigger a
 * send. It's not bulletproof security (nothing embedded in a public static
 * page truly can be), but combined with keeping the recipient list in
 * Script Properties (NOT in the public repo), the worst a stranger could
 * do is trigger a junk email to your own 3 recipients - they can't redirect
 * it to addresses of their choosing, since recipients are never read from
 * the request.
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expectedToken = props.getProperty("NOTIFY_TOKEN");
    var recipients = props.getProperty("NOTIFY_EMAILS");

    if (!recipients) {
      return ContentService.createTextOutput("NOTIFY_EMAILS script property is not set.");
    }

    var data = JSON.parse(e.postData.contents);

    if (!expectedToken || data.token !== expectedToken) {
      // Silently ignore - don't reveal whether the token was close or not.
      return ContentService.createTextOutput("ok");
    }

    var subject = "Packing list completed - " + data.boxCount + " box" + (data.boxCount === 1 ? "" : "es");

    var lines = [];
    lines.push("A packing list was just completed and printed.");
    lines.push("");
    lines.push("Completed at: " + data.completedAt);
    lines.push("Total boxes: " + data.boxCount);
    lines.push("");

    (data.boxes || []).forEach(function (b) {
      var dims = (b.length || "?") + " x " + (b.width || "?") + " x " + (b.height || "?") + " in";
      var weight = b.weight ? (b.weight + " lb") : "weight not entered";
      lines.push("Box " + b.box + ": " + b.items + " item(s), " + dims + ", " + weight);
    });

    var body = lines.join("\n");

    GmailApp.sendEmail(recipients, subject, body);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}

// Lets you sanity-check the deployment by opening the Web app URL directly
// in a browser - should show this text rather than an error page.
function doGet(e) {
  return ContentService.createTextOutput(
    "Packing list notifier is deployed and running. It only responds to POST requests from the label tool."
  );
}
