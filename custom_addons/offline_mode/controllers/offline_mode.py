from odoo import http
from odoo.addons.social_push_notifications.controllers.main import SocialPushNotificationsController


class SocialPushNotificationsControllerOffline(SocialPushNotificationsController):

    @http.route("/social_push_notifications/fetch_push_configuration", type="jsonrpc", auth="public", website=True)
    def fetch_push_configuration(self):
        """
        Force an empty config. This prevents push_notification_widget.js
        from ever attempting to register the service worker or call Firebase.
        """
        return {}

    def _register_iap_firebase_info(self, current_website):
        """ Block external calls to Odoo IAP for credentials """
        return
