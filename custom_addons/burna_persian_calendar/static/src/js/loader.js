/** @odoo-module **/

import { onWillStart } from "@odoo/owl";
import { loadBundle } from "@web/core/assets";
import { localization } from "@web/core/l10n/localization";
import { patch } from "@web/core/utils/patch";
import { WebClient } from "@web/webclient/webclient";



patch(WebClient.prototype, {
    setup() {
        super.setup();
        onWillStart(async () => {
            if (localization.code === "fa_IR") {
                await loadBundle("burna_persian_calendar.calendar_persian");
            }
        });
    }
});
