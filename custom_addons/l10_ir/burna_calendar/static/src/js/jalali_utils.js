/** @odoo-module **/

// Lightweight Gregorian <-> Jalali conversion helpers adapted from the public-domain
// algorithm used by jalaali-js. Keeps storage Gregorian, exposes Jalali in UI.

export function div(a, b) {
    return ~~(a / b);
}

function jalCal(jy) {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    const bl = breaks.length;
    const gy = jy + 621;
    let leapJ = -14;
    let jp = breaks[0];
    let jm;
    let jump;
    let leap;
    let n;
    let i;

    if (jy < jp || jy >= breaks[bl - 1]) {
        throw new Error("Invalid Jalali year " + jy);
    }

    for (i = 1; i < bl; i++) {
        jm = breaks[i];
        jump = jm - jp;
        if (jy < jm) {
            break;
        }
        leapJ = leapJ + div(jump, 33) * 8 + div((jump % 33), 4);
        jp = jm;
    }
    n = jy - jp;

    leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
    if ((jump % 33) === 4 && jump - n === 4) {
        leapJ += 1;
    }

    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;

    if (jump - n < 6) {
        n = n - jump + div(jump + 4, 33) * 33;
    }
    leap = (((n + 1) % 33) - 1) % 4;
    if (leap === -1) {
        leap = 4;
    }

    return { leap, gy, march };
}

function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * ((gm + 9) % 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
}

function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div((j % 1461), 4) * 5 + 308;
    const gd = div((i % 153), 5) + 1;
    const gm = (div(i, 153) % 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
}

function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn) {
    const g = d2g(jdn);
    let jy = g.gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(g.gy, 3, r.march);
    let jd;
    let jm;
    let k = jdn - jdn1f;

    if (k >= 0) {
        if (k <= 185) {
            jm = 1 + div(k, 31);
            jd = (k % 31) + 1;
            return { jy, jm, jd };
        }
        k -= 186;
    } else {
        jy -= 1;
        k += 179;
        if (r.leap === 1) {
            k += 1;
        }
    }
    jm = 7 + div(k, 30);
    jd = (k % 30) + 1;
    return { jy, jm, jd };
}

function pad(v) {
    return String(v).padStart(2, "0");
}

export function isJalaliDateString(value) {
    return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test((value || "").trim());
}

export function isGregorianIsoDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test((value || "").trim());
}

export function gregorianToJalali(gy, gm, gd) {
    return d2j(g2d(gy, gm, gd));
}

export function jalaliToGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd));
}

export function gregorianIsoToJalaliIso(isoDate) {
    const [y, m, d] = isoDate.split("-").map((x) => parseInt(x, 10));
    const j = gregorianToJalali(y, m, d);
    return `${j.jy}-${pad(j.jm)}-${pad(j.jd)}`;
}

export function jalaliIsoToGregorianIso(isoDate) {
    const normalized = isoDate.replace(/\//g, "-");
    const [y, m, d] = normalized.split("-").map((x) => parseInt(x, 10));
    const g = jalaliToGregorian(y, m, d);
    return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

export function safeGregorianIsoToJalaliIso(value) {
    try {
        return isGregorianIsoDate(value) ? gregorianIsoToJalaliIso(value) : value;
    } catch (_e) {
        return value;
    }
}

export function safeJalaliIsoToGregorianIso(value) {
    try {
        return isJalaliDateString(value) ? jalaliIsoToGregorianIso(value) : value;
    } catch (_e) {
        return value;
    }
}

const monthNames = [
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

export function jalaliLabel(isoDate) {
    if (!isGregorianIsoDate(isoDate)) {
        return isoDate;
    }
    const [jy, jm, jd] = gregorianIsoToJalaliIso(isoDate).split("-").map((x) => parseInt(x, 10));
    return `${jd} ${monthNames[jm - 1]} ${jy}`;
}
