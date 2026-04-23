/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";
import { getFormattedValue } from "./format_utils";


patch(ListRenderer.prototype, {
    getFormattedValue(column, record) {
        const fieldName = column.name;
        if (column.options?.enable_formatting === false) {
            return record.data[fieldName];
        }
        return getFormattedValue(record, fieldName, column);
    },
});
