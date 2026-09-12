
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function getPartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const out = {};
  for (const part of parts) {
    if (part.type !== "literal") out[part.type] = part.value;
  }

  const weekdayMap = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
  };

  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    weekday: weekdayMap[out.weekday],
    hour: Number(out.hour),
    minute: Number(out.minute),
    second: Number(out.second)
  };
}

function addDaysToLocalDate(parts, days) {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate()
  };
}

function formatMeetingDate(localDate, timeZone) {
  const d = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day, 12));
  return new Intl.DateTimeFormat("es-EC", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(d).replace(/^./, c => c.toUpperCase());
}

function findNextMeeting(schedule, timeZone) {
  const nowLocal = getPartsInTimeZone(new Date(), timeZone);
  let best = null;

  for (const meeting of schedule) {
    let daysAhead = (meeting.day - nowLocal.weekday + 7) % 7;
    const [meetingHour, meetingMinute] = meeting.time.split(":").map(Number);

    if (daysAhead === 0) {
      const currentMinutes = nowLocal.hour * 60 + nowLocal.minute;
      const meetingMinutes = meetingHour * 60 + meetingMinute;

      if (currentMinutes >= meetingMinutes) {
        daysAhead = 7;
      }
    }

    if (!best || daysAhead < best.daysAhead) {
      best = {
        ...meeting,
        daysAhead,
        localDate: addDaysToLocalDate(nowLocal, daysAhead)
      };
    }
  }

  return best;
}

function parseISODateOnly(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

function utcDayNumber(parts) {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000);
}

function getCurrentSunday(timeZone) {
  const nowLocal = getPartsInTimeZone(new Date(), timeZone);
  return addDaysToLocalDate(nowLocal, -nowLocal.weekday);
}

function getRotatingGroup(rotation, timeZone) {
  if (!rotation) return null;

  const currentSunday = getCurrentSunday(timeZone);
  const anchorSunday = parseISODateOnly(rotation.anchorSunday);

  const daysDifference = utcDayNumber(currentSunday) - utcDayNumber(anchorSunday);
  const weeksDifference = Math.floor(daysDifference / 7);

  const zeroBasedAnchor = rotation.anchorGroup - 1;
  const zeroBasedGroup =
    ((zeroBasedAnchor + weeksDifference) % rotation.groups + rotation.groups) % rotation.groups;

  return zeroBasedGroup + 1;
}

function setToday(timeZone) {
  const formatted = new Intl.DateTimeFormat("es-EC", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  setText("todayDate", formatted.charAt(0).toUpperCase() + formatted.slice(1));
}

function renderAnnouncements(items = [], data, timeZone) {
  const container = document.getElementById("announcements");

  if (!items.length) {
    container.innerHTML = '<p class="meeting-note">No hay anuncios publicados.</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    let text = item.text ?? "";

    if (item.type === "cleaning") {
      const group = getRotatingGroup(data.cleaningRotation, timeZone);
      if (group) {
        text = `Recordatorio amistoso para el GRUPO ${group}, que tiene este privilegio esta semana.`;
      }
    }

    if (item.type === "hospitality") {
      const group = getRotatingGroup(data.hospitalityRotation, timeZone);
      if (group) {
        text = `Recordatorio para el GRUPO ${group} que tiene este privilegio.`;
      }
    }

    return `
      <article class="announcement ${item.important ? "important" : ""}">
        <strong>${item.title ?? ""}</strong>
        <p>${text}</p>
      </article>
    `;
  }).join("");
}

function renderCalendar(items = []) {
  const container = document.getElementById("calendar");
  container.innerHTML = items.length
    ? items.map(item => `
        <article class="calendar-item">
          <div class="date-tile">
            <span>${item.month ?? ""}</span>
            <strong>${item.day ?? ""}</strong>
          </div>
          <div class="calendar-copy">
            <strong>${item.title ?? ""}</strong>
            <p>${item.text ?? ""}</p>
          </div>
        </article>
      `).join("")
    : '<p class="meeting-note">No hay fechas publicadas.</p>';
}

function renderLinks(items = []) {
  const container = document.getElementById("quickLinks");
  container.innerHTML = items.map(item => {
    const external = /^https?:\/\//i.test(item.url || "");
    return `
      <a class="quick-link" href="${item.url || "#"}"
         ${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        <span class="quick-icon">${item.icon ?? "🔗"}</span>
        <span>
          <strong>${item.label ?? ""}</strong>
          <small>${item.description ?? ""}</small>
        </span>
      </a>
    `;
  }).join("");
}

async function loadBoard() {
  try {
    const response = await fetch(`data.json?v=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const timeZone = data.site?.timezone || "America/Guayaquil";

    setToday(timeZone);

    setText("congregationName", data.site?.congregation);
    setText("boardTitle", data.site?.title);
    setText("boardSubtitle", data.site?.subtitle);

    const nextMeeting = findNextMeeting(data.meetingSchedule || [], timeZone);

    if (nextMeeting) {
      setText("meetingKicker", "PRÓXIMA REUNIÓN");
      setText("meetingTitle", nextMeeting.title);
      setText("meetingDate", formatMeetingDate(nextMeeting.localDate, timeZone));
      setText("meetingTime", nextMeeting.displayTime);
      setText("meetingLocation", nextMeeting.location);
      setText("meetingNote", nextMeeting.note);
    }

    renderAnnouncements(data.announcements || [], data, timeZone);
    renderCalendar(data.calendar || []);
    renderLinks(data.quickLinks || []);

    setText("lastUpdated", `Actualizado: ${data.site?.lastUpdated ?? "—"}`);

  } catch (error) {
    console.error("No se pudo cargar data.json:", error);
    const status = document.getElementById("statusMessage");
    status.hidden = false;
    status.textContent = "No se pudo cargar la información del tablero.";
  }
}

loadBoard();
setInterval(loadBoard, 60000);
