{
    "name": "گاهشمار برنا",
    "summary": "تقویم شمسی را به گاهشمار اضافه می‌کند.",
    "version": "19.0.1.0.0",
    "category": "برنا",
    "author": "Burna Dev.",
    "license": "LGPL-3",
    "website": "https://www.burna.ir",
    "depends": ["web", "calendar"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "burna_calendar/static/src/js/jalali_utils.js",
            "burna_calendar/static/src/js/shamsi_calendar_core_patch.js",
            "burna_calendar/static/src/js/shamsi_calendar.js",
            "burna_calendar/static/src/css/shamsi_calendar.css",
        ],
    },
    "installable": True,
    "application": False,
}
