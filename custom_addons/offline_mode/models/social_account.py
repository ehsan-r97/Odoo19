from odoo import models


class SocialAccount(models.Model):
    _inherit = "social.account"

    def _firebase_send_message_from_configuration(self, data, visitors):
        # Immediate return prevents requests.post to fcm.googleapis.com
        return []

    def _firebase_send_message_from_iap(self, data, visitors):
        # Immediate return prevents iap_jsonrpc calls
        return []

    def _firebase_send_message(self, data, visitors):
        # Short-circuit: no network calls, no timeouts.
        return []
