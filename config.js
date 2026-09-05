// Fill these in during setup — see SETUP-INSTRUCTIONS.md

// Google Sheet ("Projects" tab) published as CSV.
// Sheet > File > Share > Publish to web > select the "Projects" sheet > CSV.
var SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8S_XqBbDvzU8FQ463st_K4iqsUWEeTdF7_KCwGZAZusyS6TnLKCLepfLQbmrlRAjvfonGfFnkTp2x/pub?gid=264048707&single=true&output=csv";

// The public "Enquiry" Google Form, embed version.
// Open the Enquiry form > Send > embed (<>) icon > copy the src URL from the
// <iframe> code it gives you (ends in .../viewform?embedded=true).
var ENQUIRY_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfqsowmSnI0w11xc0bbZRW8bcd9fikHNj25PZqos4YBZ-8LEw/viewform?embedded=true";

// Optional: to pre-fill the venture name field when "Enquire now" is clicked
// from a venture page, get the field's entry ID (Form > ... > Get pre-filled
// link, fill a sample value, copy the entry.XXXXXXXXX= part from the URL)
// and set it here. Leave blank to skip pre-filling.
var ENQUIRY_VENTURE_FIELD = ""; // e.g. "entry.123456789"

// Home page "Greeting" banner (festival wishes / daily quote image).
// Add a "Greeting" tab to the same Google Sheet, publish just that tab as
// CSV (File > Share > Publish to web > pick the "Greeting" tab > CSV), and
// paste the link here. See SETUP-INSTRUCTIONS.md section 6 for the column
// layout. Leave blank to keep the banner hidden.
var GREETING_CSV_URL = "";

// WhatsApp number for the floating chat button, with country code and no
// "+", spaces, or leading zero — e.g. 919949610063 for +91 99496 10063.
var WHATSAPP_NUMBER = "919949610063";
