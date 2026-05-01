# -*- coding: utf-8 -*-
# Copyright (C) 2024-Today: Odoo Community Iran
# @author: Odoo Community Iran (https://odoo-community.ir/
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
{
    'name': "Persian Calendar",
    'summary': """Persian Calendar""",
    'description': """Persian Calendar""",
    'author': "Odoo Community Iran",
    'website': "https://odoo-community.ir/",
    'category': 'Localization/Iran',
    'version': '19.0.1.0.1',
    'license': 'LGPL-3',
    'depends': ['base', 'web',],
    'assets': {
        'web.assets_backend': [
            'burna_persian_calendar/static/lib/jalali/utils.js',
            'burna_persian_calendar/static/src/js/persian-date.js',
            'burna_persian_calendar/static/src/js/farvardin.js',
            'burna_persian_calendar/static/src/js/datepicker/datetimepicker_service.js',
            'burna_persian_calendar/static/src/js/loader.js',
        ],
        'burna_persian_calendar.calendar_persian':[
            'burna_persian_calendar/static/src/js/format_utils.js',
            'burna_persian_calendar/static/src/js/list.js',
            'burna_persian_calendar/static/src/js/datepicker/datetime_field.js',
            'burna_persian_calendar/static/src/js/datepicker/datetime_picker.js',
            'burna_persian_calendar/static/src/js/kanban.js',
        ]
    }
}
