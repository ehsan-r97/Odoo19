/** @odoo-module **/

import { localization } from "@web/core/l10n/localization";
import { patch } from "@web/core/utils/patch";
import { CalendarModel } from "@web/views/calendar/calendar_model";
import { CalendarController } from "@web/views/calendar/calendar_controller";
import { CalendarCommonRenderer } from "@web/views/calendar/calendar_common/calendar_common_renderer";
import { CalendarYearRenderer } from "@web/views/calendar/calendar_year/calendar_year_renderer";
import { gregorianToJalali, jalaliToGregorian } from "./jalali_utils";

const { DateTime } = luxon;

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const JALALI_MONTH_NAMES = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

function isPersianCalendarActive() {
    return localization.code === "fa_IR";
}

function toPersianDigits(value) {
    return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

function toJalaliParts(date) {
    return gregorianToJalali(date.year, date.month, date.day);
}

function jalaliToDateTime(jy, jm, jd, baseDate = DateTime.local()) {
    const g = jalaliToGregorian(jy, jm, jd);
    return baseDate.set({ year: g.gy, month: g.gm, day: g.gd }).startOf("day");
}

function getJalaliMonthLength(jy, jm) {
    const start = jalaliToDateTime(jy, jm, 1);
    const nextStart = jm === 12 ? jalaliToDateTime(jy + 1, 1, 1) : jalaliToDateTime(jy, jm + 1, 1);
    return Math.round(nextStart.diff(start, "days").days);
}

function getJalaliMonthRange(date) {
    const j = toJalaliParts(date);
    const start = jalaliToDateTime(j.jy, j.jm, 1, date);
    const nextStart = j.jm === 12 ? jalaliToDateTime(j.jy + 1, 1, 1, date) : jalaliToDateTime(j.jy, j.jm + 1, 1, date);
    const end = nextStart.minus({ days: 1 }).endOf("day");
    return { start, end, jy: j.jy, jm: j.jm };
}

function getJalaliYearRange(date) {
    const j = toJalaliParts(date);
    const start = jalaliToDateTime(j.jy, 1, 1, date);
    const nextStart = jalaliToDateTime(j.jy + 1, 1, 1, date);
    const end = nextStart.minus({ days: 1 }).endOf("day");
    return { start, end, jy: j.jy };
}

function getWeekRangeFromSaturday(date) {
    const start = date.startOf("day").minus({ days: (date.weekday - 6 + 7) % 7 });
    const end = start.plus({ days: 6 }).endOf("day");
    return { start, end };
}

function shiftJalaliMonth(date, delta) {
    const j = toJalaliParts(date);
    const monthIndex = j.jy * 12 + (j.jm - 1) + delta;
    const jy = Math.floor(monthIndex / 12);
    const jm = ((monthIndex % 12) + 12) % 12 + 1;
    const jd = Math.min(j.jd, getJalaliMonthLength(jy, jm));
    return jalaliToDateTime(jy, jm, jd, date);
}

function shiftJalaliYear(date, delta) {
    const j = toJalaliParts(date);
    const jy = j.jy + delta;
    const jd = Math.min(j.jd, getJalaliMonthLength(jy, j.jm));
    return jalaliToDateTime(jy, j.jm, jd, date);
}

function computeJalaliRange(scale, date, monthOverflow) {
    if (scale === "day") {
        return { start: date.startOf("day"), end: date.endOf("day") };
    }
    if (scale === "week") {
        return getWeekRangeFromSaturday(date);
    }
    if (scale === "month") {
        let { start, end } = getJalaliMonthRange(date);
        if (monthOverflow) {
            start = getWeekRangeFromSaturday(start).start;
            end = start.plus({ weeks: 6, days: -1 }).endOf("day");
        }
        return { start, end };
    }
    if (scale === "year") {
        const { start, end } = getJalaliYearRange(date);
        return { start, end };
    }
    return { start: date.startOf(scale).startOf("day"), end: date.endOf(scale).endOf("day") };
}

function monthYearLabel(date) {
    const j = toJalaliParts(date);
    return `${JALALI_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

patch(CalendarModel.prototype, {
    setup(params, services) {
        super.setup(params, services);
        if (isPersianCalendarActive()) {
            this.meta.firstDayOfWeek = 6;
        }
    },
    computeRange() {
        if (!isPersianCalendarActive()) {
            return super.computeRange();
        }
        return computeJalaliRange(this.meta.scale, this.meta.date, this.monthOverflow);
    },
});

patch(CalendarController.prototype, {
    get today() {
        if (!isPersianCalendarActive()) {
            return super.today;
        }
        return toPersianDigits(toJalaliParts(DateTime.now()).jd);
    },
    get currentYear() {
        if (!isPersianCalendarActive()) {
            return super.currentYear;
        }
        return toPersianDigits(toJalaliParts(this.date).jy);
    },
    get currentMonth() {
        if (!isPersianCalendarActive()) {
            return super.currentMonth;
        }
        return monthYearLabel(this.date);
    },
    get dayHeader() {
        if (!isPersianCalendarActive()) {
            return super.dayHeader;
        }
        const j = toJalaliParts(this.date);
        return `${toPersianDigits(j.jd)} ${JALALI_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}`;
    },
    get weekHeader() {
        if (!isPersianCalendarActive()) {
            return super.weekHeader;
        }
        const startJ = toJalaliParts(this.model.rangeStart);
        const endJ = toJalaliParts(this.model.rangeEnd);
        if (startJ.jy !== endJ.jy) {
            return `${JALALI_MONTH_NAMES[startJ.jm - 1]} ${toPersianDigits(startJ.jy)} - ${JALALI_MONTH_NAMES[endJ.jm - 1]} ${toPersianDigits(endJ.jy)}`;
        }
        if (startJ.jm !== endJ.jm) {
            return `${JALALI_MONTH_NAMES[startJ.jm - 1]} - ${JALALI_MONTH_NAMES[endJ.jm - 1]} ${toPersianDigits(startJ.jy)}`;
        }
        return `${JALALI_MONTH_NAMES[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}`;
    },
    get currentDate() {
        if (!isPersianCalendarActive()) {
            return super.currentDate;
        }
        const scale = this.model.meta.scale;
        if (!(this.env.isSmall && ["week", "month"].includes(scale))) {
            return "";
        }
        if (scale === "month") {
            return ` - ${monthYearLabel(this.date)}`;
        }
        const startJ = toJalaliParts(this.model.rangeStart);
        const endJ = toJalaliParts(this.model.rangeEnd);
        return ` - ${toPersianDigits(startJ.jd)} ${JALALI_MONTH_NAMES[startJ.jm - 1]} تا ${toPersianDigits(endJ.jd)} ${JALALI_MONTH_NAMES[endJ.jm - 1]}`;
    },
    async setDate(move) {
        if (!isPersianCalendarActive()) {
            return super.setDate(move);
        }
        let date = null;
        switch (move) {
            case "next":
                if (this.model.scale === "month") {
                    date = shiftJalaliMonth(this.model.date, 1);
                } else if (this.model.scale === "year") {
                    date = shiftJalaliYear(this.model.date, 1);
                } else {
                    date = this.model.date.plus({ [`${this.model.scale}s`]: 1 });
                }
                break;
            case "previous":
                if (this.model.scale === "month") {
                    date = shiftJalaliMonth(this.model.date, -1);
                } else if (this.model.scale === "year") {
                    date = shiftJalaliYear(this.model.date, -1);
                } else {
                    date = this.model.date.minus({ [`${this.model.scale}s`]: 1 });
                }
                break;
            case "today":
                date = DateTime.local().startOf("day");
                if (date.ts === this.date.startOf("day").ts) {
                    this.model.bus.trigger("SCROLL_TO_CURRENT_HOUR", false);
                }
                break;
        }
        await this.model.load({ date });
    },
});

patch(CalendarCommonRenderer.prototype, {
    get options() {
        const options = super.options;
        if (!isPersianCalendarActive()) {
            return options;
        }
        options.firstDay = 6;
        if (this.props.model.scale === "month") {
            options.visibleRange = () => {
                const range = getJalaliMonthRange(this.props.model.date);
                return {
                    start: range.start.toISODate(),
                    end: range.end.plus({ days: 1 }).startOf("day").toISODate(),
                };
            };
            options.fixedWeekCount = false;
        }
        return options;
    },
});

patch(CalendarYearRenderer.prototype, {
    getDateWithMonth(month) {
        if (!isPersianCalendarActive()) {
            return super.getDateWithMonth(month);
        }
        const j = toJalaliParts(this.props.model.date);
        const monthNo = this.months.indexOf(month) + 1;
        return jalaliToDateTime(j.jy, monthNo, 1, this.props.model.date).toISO();
    },
    getOptionsForMonth(month) {
        const options = super.getOptionsForMonth(month);
        if (!isPersianCalendarActive()) {
            return options;
        }
        const j = toJalaliParts(this.props.model.date);
        const monthNo = this.months.indexOf(month) + 1;
        const monthStart = jalaliToDateTime(j.jy, monthNo, 1, this.props.model.date);
        const nextMonthStart = monthNo === 12
            ? jalaliToDateTime(j.jy + 1, 1, 1, this.props.model.date)
            : jalaliToDateTime(j.jy, monthNo + 1, 1, this.props.model.date);

        options.firstDay = 6;
        options.visibleRange = {
            start: monthStart.toISODate(),
            end: nextMonthStart.toISODate(),
        };
        options.datesSet = (arg) => {
            const title = arg.view?.el?.querySelector(".fc-toolbar-title");
            if (title) {
                title.textContent = `${JALALI_MONTH_NAMES[monthNo - 1]} ${toPersianDigits(j.jy)}`;
            }
        };
        return options;
    },
});
