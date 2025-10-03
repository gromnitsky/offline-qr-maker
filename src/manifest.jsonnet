function(browser="chrome") {
  "manifest_version": 3,
  "name": "Offline QR Maker",
  "description": "An offline SVG QR code generator (from URLs, text selections, user input); no tracking, minimal permissions",
  "version": "1.1.0",
  "permissions": ["activeTab", "scripting", "contextMenus"],
  "background": if browser == "firefox" then {
    "type": "module",
    "scripts": ["service_worker.js"]
  } else {
    "type": "module",
    "service_worker": "service_worker.js"
  },
  "icons": { "128": "icon128.png" },
  "action": {},
  "web_accessible_resources": [
    {
      "resources": ["dialog.html"],
      "matches": ["<all_urls>"]
    }
  ],
  [if browser == "firefox" then "browser_specific_settings"]: {
    "gecko": {
      "id": "{f1c5e811-b695-410f-8d45-8bd341eff565}",
      "strict_min_version": "130.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    }
  },
}
