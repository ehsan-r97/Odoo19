/** @odoo-module **/

import {
    isGregorianIsoDate,
    isJalaliDateString,
    safeGregorianIsoToJalaliIso,
    safeJalaliIsoToGregorianIso,
    jalaliLabel,
} from "./jalali_utils";

const CALENDAR_ROOT_SELECTORS = [".o_calendar_view", ".fc", ".o_calendar_container"];
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianDigits(value) {
    return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

function inCalendarContext(el) {
    return CALENDAR_ROOT_SELECTORS.some((selector) => Boolean(el.closest(selector)));
}

function convertInputToShamsi(input) {
    if (!inCalendarContext(input)) {
        return;
    }
    const current = (input.value || "").trim();
    if (!current) {
        return;
    }
    if (isGregorianIsoDate(current)) {
        input.dataset.gregorianValue = current;
        input.value = safeGregorianIsoToJalaliIso(current);
        input.classList.add("o_shamsi_applied");
    }
}

function convertInputToGregorian(input) {
    if (!inCalendarContext(input)) {
        return;
    }
    const current = (input.value || "").trim();
    if (!current) {
        return;
    }
    if (isJalaliDateString(current)) {
        const greg = safeJalaliIsoToGregorianIso(current);
        input.dataset.gregorianValue = greg;
        input.value = greg;
    }
}

function decorateDateCell(el) {
    if (!inCalendarContext(el)) {
        return;
    }
    const date = el.getAttribute("data-date");
    if (isGregorianIsoDate(date)) {
        el.setAttribute("title", jalaliLabel(date));
    }

}

function decorateDayNumber(el) {
    if (!inCalendarContext(el)) {
        return;
    }
    const container = el.closest("[data-date]");
    const date = container ? container.getAttribute("data-date") : "";
    if (!isGregorianIsoDate(date)) {
        return;
    }
    const j = safeGregorianIsoToJalaliIso(date);
    const dayPart = j.split("-")[2];
    if (dayPart) {
        el.textContent = toPersianDigits(parseInt(dayPart, 10));
        el.classList.add("o_shamsi_day_number");
    }
}

function decorateTimeGridHeaderCell(el) {
    if (!inCalendarContext(el)) {
        return;
    }
    const date = el.getAttribute("data-date") || "";
    if (!isGregorianIsoDate(date)) {
        return;
    }
    const label = el.querySelector(".fc-col-header-cell-cushion");
    if (!label) {
        return;
    }
    const jalali = safeGregorianIsoToJalaliIso(date);
    const dayPart = jalali.split("-")[2];
    if (!dayPart) {
        return;
    }
    const currentText = (label.textContent || "").trim();
    const weekdayText = (label.dataset.shamsiWeekday ||
        currentText.replace(/[0-9۰-۹]+/g, "").replace(/[\/\\-]+/g, " ").trim());
    if (!weekdayText) {
        return;
    }
    label.dataset.shamsiWeekday = weekdayText;
    const dayNumber = toPersianDigits(parseInt(dayPart, 10));
    label.innerHTML = `<span class="o_shamsi_weekday">${weekdayText}</span><span class="o_shamsi_header_day">${dayNumber}</span>`;
    label.classList.add("o_shamsi_header_cushion");
    if (el.classList.contains("fc-day-today")) {
        label.classList.add("o_shamsi_today");
    } else {
        label.classList.remove("o_shamsi_today");
    }
}

function decorateDateText(el) {
    if (!inCalendarContext(el)) {
        return;
    }
    const text = (el.textContent || "").trim();
    if (isGregorianIsoDate(text)) {
        el.dataset.originalText = text;
        el.textContent = safeGregorianIsoToJalaliIso(text);
    }
}

function decorateNode(node) {
    if (!(node instanceof HTMLElement)) {
        return;
    }

    if (node.matches("input.o_input, input[type='date']")) {
        convertInputToShamsi(node);
    }
    if (node.hasAttribute("data-date")) {
        decorateDateCell(node);
    }
    if (node.matches(".fc-daygrid-day-number")) {
        decorateDayNumber(node);
    }
    if (node.matches(".fc-col-header-cell[data-date]")) {
        decorateTimeGridHeaderCell(node);
    }
    if (node.matches(".o_field_date, .o_calendar_renderer .fc-toolbar-title, .fc-event-time, .fc-list-event-time")) {
        decorateDateText(node);
    }

    node.querySelectorAll("input.o_input, input[type='date']").forEach(convertInputToShamsi);
    node.querySelectorAll("[data-date]").forEach(decorateDateCell);
    node.querySelectorAll(".fc-daygrid-day-number").forEach(decorateDayNumber);
    node.querySelectorAll(".fc-col-header-cell[data-date]").forEach(decorateTimeGridHeaderCell);
    node
        .querySelectorAll(".o_field_date, .o_calendar_renderer .fc-toolbar-title, .fc-event-time, .fc-list-event-time")
        .forEach(decorateDateText);
}

function bindInputConverters(root = document) {
    root.querySelectorAll("input.o_input, input[type='date']").forEach((input) => {
        if (input.dataset.shamsiBound === "1") {
            return;
        }
        if (!inCalendarContext(input)) {
            return;
        }

        input.addEventListener("focus", () => {
            convertInputToShamsi(input);
        });

        // Odoo reads normalized Gregorian values when onchange/blur is fired.
        input.addEventListener("change", () => {
            convertInputToGregorian(input);
        });

        input.addEventListener("blur", () => {
            convertInputToGregorian(input);
        });

        input.dataset.shamsiBound = "1";
    });
}

function bootstrapShamsiCalendar() {
    decorateNode(document.body);
    bindInputConverters(document);

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((n) => decorateNode(n));
            if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
                decorateNode(mutation.target);
            }
        }
        bindInputConverters(document);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-date", "value"],
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapShamsiCalendar);
} else {
    bootstrapShamsiCalendar();
}
