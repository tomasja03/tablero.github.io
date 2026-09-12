const boardData = {
  nextEvent: {
    title: "Reunión de fin de semana",
    date: "Domingo",
    time: "10:00 a. m.",
    location: "Salón principal",
    note: "Por favor, llegue con tiempo suficiente para saludar y ocupar su lugar."
  },

  announcements: [
    {
      title: "Limpieza",
      text: "Recordatorio amistoso para quienes tienen asignación esta semana."
    },
    {
      title: "Actividad de predicación",
      text: "Consulte con su grupo para confirmar horario y punto de encuentro."
    },
    {
      title: "Próxima asamblea",
      text: "Se publicarán aquí los detalles de transporte y horarios."
    }
  ],

  calendar: [
    { month: "SEP", day: "20", title: "Actividad especial", text: "Información adicional próximamente." },
    { month: "SEP", day: "27", title: "Limpieza general", text: "Después de la reunión." },
    { month: "OCT", day: "04", title: "Recordatorio", text: "Revise el programa actualizado." }
  ],

  lastUpdated: "12 de septiembre de 2026"
};

function renderBoard() {
  document.getElementById("nextEventTitle").textContent = boardData.nextEvent.title;
  document.getElementById("nextEventDate").textContent = boardData.nextEvent.date;
  document.getElementById("nextEventTime").textContent = boardData.nextEvent.time;
  document.getElementById("nextEventLocation").textContent = boardData.nextEvent.location;
  document.getElementById("nextEventNote").textContent = boardData.nextEvent.note;

  const announcementsList = document.getElementById("announcementsList");
  announcementsList.innerHTML = boardData.announcements
    .map(item => `
      <article class="announcement">
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </article>
    `)
    .join("");

  const calendarList = document.getElementById("calendarList");
  calendarList.innerHTML = boardData.calendar
    .map(item => `
      <article class="calendar-item">
        <div class="calendar-date">
          <span>${item.month}</span>
          <strong>${item.day}</strong>
        </div>
        <div>
          <strong>${item.title}</strong>
          <p>${item.text}</p>
        </div>
      </article>
    `)
    .join("");

  document.getElementById("lastUpdated").textContent =
    `Actualizado: ${boardData.lastUpdated}`;
}

function setToday() {
  const today = new Date();
  const formatted = new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(today);

  document.getElementById("todayDate").textContent =
    formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

renderBoard();
setToday();
