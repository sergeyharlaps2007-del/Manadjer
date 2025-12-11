let tasks = [];

// Загрузка LocalStorage
function loadTask() {
  try {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) throw "not array";

      tasks = parsed;
    }
  } catch (e) {
    console.warn("Ошибка: повреждён JSON, очищаю.");
    localStorage.removeItem("tasks");
    tasks = [];
  }
}

// Сохранение LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHTML(str) {
  // Защита от <script>alert(1)</script>
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateText(text) {
  if (!text) return false;
  text = text.trim(); // Валидация текста
  if (text.length === 0) return false;
  if (text.length > 200) return false;
  return true;
}

function validateDate(dateStr) {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  if (isNaN(date)) return false; // Валидация даты

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //дату нельзя сделать в прошлом
  if (date < today) return false;

  return true;
}

// таблица рендерится
function renderTable() {
  const table = document.getElementById("taskTable");
  table.innerHTML = "";

  //Отображение таблицы
  tasks.forEach((task) => {
    const row = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = task.id;

    const tdText = document.createElement("td");
    tdText.innerHTML = escapeHTML(task.text);

    const tdDate = document.createElement("td");
    tdDate.innerHTML = escapeHTML(task.date);

    const tdDone = document.createElement("td");
    tdDone.textContent = task.done ? "+" : "-";

    const tdActions = document.createElement("td");

    const btnDone = document.createElement("button");
    btnDone.textContent = "Выполнить";
    btnDone.dataset.action = "done";
    btnDone.dataset.id = task.id;

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Удалить";
    btnDelete.dataset.action = "delete";
    btnDelete.dataset.id = task.id;

    tdActions.appendChild(btnDone);
    tdActions.appendChild(btnDelete);

    row.appendChild(tdId);
    row.appendChild(tdText);
    row.appendChild(tdDate);
    row.appendChild(tdDone);
    row.appendChild(tdActions);

    table.appendChild(row);
  });
}

// блочный рендер (2 колонки)
function renderBlocks() {
  const inWork = document.getElementById("cardsInWork");
  const done = document.getElementById("cardsDone");

  inWork.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";

    card.innerHTML = `
      <h3>${escapeHTML(task.text)}</h3>
      <p><b>Дата:</b> ${escapeHTML(task.date)}</p>
      <p><b>Статус:</b> ${task.done ? "Выполнено" : "В работе"}</p>
    `;

    const btnToggle = document.createElement("button");
    btnToggle.textContent = task.done ? "Вернуть" : "Выполнить";
    btnToggle.dataset.action = "done";
    btnToggle.dataset.id = task.id;

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Удалить";
    btnDelete.dataset.action = "delete";
    btnDelete.dataset.id = task.id;

    card.appendChild(btnToggle);
    card.appendChild(btnDelete);

    if (task.done) {
      done.appendChild(card);
    } else {
      inWork.appendChild(card);
    }
  });
}

function addTask() {
  const text = document.getElementById("taskText").value; //Добавляет задачи
  const date = document.getElementById("taskDate").value;

  if (!validateText(text)) {
    alert("Некорректный текст задачи!"); // Валидация текста
    return;
  }

  if (!validateDate(date)) {
    alert("Некорректная дата!"); // Валидация даты
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text.trim(),
    date: date,
    done: false,
  };

  tasks.push(newTask);

  saveTasks();
  updateView(); // вместо renderTable

  document.getElementById("taskText").value = "";
  document.getElementById("taskDate").value = "";
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks(); //Удаление
  updateView();
}

function toggleDone(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done; //Статус переключается

  saveTasks();
  updateView();
}

// переключить вид

let currentView = "table"; // по умолчанию таблица

function updateView() {
  if (currentView === "table") {
    document.getElementById("tableView").style.display = "table";
    document.getElementById("blockView").style.display = "none";
    renderTable();
  } else {
    document.getElementById("tableView").style.display = "none";
    document.getElementById("blockView").style.display = "block";
    renderBlocks();
  }
}

//Убрал Inline Js и добавлены переклбючатели
document.addEventListener("DOMContentLoaded", () => {
  loadTask();
  updateView();

  // Обработчик кнопки добавить
  document.getElementById("addBtn").addEventListener("click", addTask);

  // Обработка кнопок Выполнить и Удалить (таблица)
  document.getElementById("taskTable").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);

    if (action === "delete") deleteTask(id);
    if (action === "done") toggleDone(id);
  });

  // Обработка кнопок в БЛОЧНОМ режиме
  document.getElementById("blockView").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);

    if (action === "delete") deleteTask(id);
    if (action === "done") toggleDone(id);
  });

  // Переключатели
  document.getElementById("viewTable").addEventListener("click", () => {
    currentView = "table";
    updateView();
  });

  document.getElementById("viewBlocks").addEventListener("click", () => {
    currentView = "blocks";
    updateView();
  });
});
