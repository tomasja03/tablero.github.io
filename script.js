
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

function dateKey(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function addDaysToLocalDate(parts, days) {
  // Use UTC only as a safe calendar arithmetic container.
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate()
  };
}

function formatMeetingDate(localDate, timeZone) {
  // Noon UTC avoids date rollover issues for Ecuador.
  const d = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day, 12));
  return new Intl.DateTimeFormat("es-EC", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(d).replace(/^./, c => c.toUpperCase());
}

function findNextMeeting(schedule, timeZone) {
  const now = new Date();
  const nowLocal = getPartsInTimeZone(now, timeZone);

  let best = null;

  for (const meeting of schedule) {
    let daysAhead = (meeting.day - nowLocal.weekday + 7) % 7;

    const [meetingHour, meetingMinute] = meeting.time.split(":").map(Number);

    if (daysAhead === 0) {
      const currentMinutes = nowLocal.hour * 60 + nowLocal.minute;
      const meetingMinutes = meetingHour * 60 + meetingMinute;

      // At or after the meeting start time, move to next week's occurrence.
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

function setToday(timeZone) {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("es-EC", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  setText("todayDate", formatted.charAt(0).toUpperCase() + formatted.slice(1));
}

function renderAnnouncements(items = []) {
  const container = document.getElementById("announcements");
  container.innerHTML = items.length
    ? items.map(item => `
        <article class="announcement ${item.important ? "important" : ""}">
          <strong>${item.title ?? ""}</strong>
          <p>${item.text ?? ""}</p>
        </article>
      `).join("")
    : '<p class="meeting-note">No hay anuncios publicados.</p>';
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

    renderAnnouncements(data.announcements);
    renderCalendar(data.calendar);
    renderLinks(data.quickLinks);

    const updated = new Intl.DateTimeFormat("es-EC", {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date());

    setText("lastUpdated", `Actualizado automáticamente: ${updated}`);

  } catch (error) {
    console.error("No se pudo cargar data.json:", error);
    const status = document.getElementById("statusMessage");
    status.hidden = false;
    status.textContent = "No se pudo cargar la información del tablero.";
  }
}

loadBoard();

// Re-evaluate every minute so the card changes automatically while the page stays open.
setInterval(loadBoard, 60000);
