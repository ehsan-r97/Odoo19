# Burna Calendar (Odoo 19)

This addon converts Odoo Calendar to a Jalali-first experience.

## What is implemented

- Jalali date conversion for display and input.
- Real Jalali month/year ranges in calendar data loading.
- Jalali navigation (`next` / `previous`) for month and year scales.
- Jalali month boundaries in month/year calendar grids (not only day-number replacement).
- Saturday as first day of week when `fa_IR` is active.

## Technical notes

- Storage remains Gregorian in database (Odoo-native behavior).
- Changes are applied by frontend patches on Calendar model/controller/renderers.
- Main patch file: `static/src/js/shamsi_calendar_core_patch.js`

## Install / upgrade

1. Update Apps List.
2. Upgrade module **گاهشمار برنا**.
3. Hard refresh browser (`Ctrl+F5`).
