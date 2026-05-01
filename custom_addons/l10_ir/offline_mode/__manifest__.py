{
    "name": "Offline Mode",
    "version": "1.0.0",
    "category": "Technical",
    "summary": "Fix external network timeouts (Google Fonts, Firebase, IAP)",
    "description": "Blocks external CDN/IAP requests that cause timeouts in Iran",
    "author": "TashilGostar",
    "website": "https://www.tashilgostar.com",
    "support": "support@tashilgostar.com",
    "live_test_url": "https://sazmanyar.tashilgostar.com",
    "depends": ["website", "social_push_notifications"],
    "data": [
        "data/ir_asset.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            ("replace", "social_push_notifications/static/src/js/push_notification_widget.js",
             "offline_mode/static/src/js/push_notification_widget.js"),
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
    "license": "Other proprietary",
    "images": ["static/description/banner.jpg"],
}
