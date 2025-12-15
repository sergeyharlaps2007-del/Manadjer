let tasks = [];
let statuses = [];

// Загрузка LocalStorage
function loadTask() {
  try {
    const savedTasks = localStorage.getItem("tasks");
    const savedStatuses = localStorage.getItem("statuses");

    if (savedTasks) tasks = JSON.parse(savedTasks);

    // Статусы по умолчанию
    if (savedStatuses) {
      statuses = JSON.parse(savedStatuses);
    } else {
      statuses = ["На очереди", "В работе", "На проверке", "Завершено"];
      saveStatuses();
    }
  } catch (e) {
    console.warn("Ошибка LocalStorage, очищаю");
    localStorage.clear();
    tasks = [];
  }
}

// Сохранение LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveStatuses() {
  localStorage.setItem("statuses", JSON.stringify(statuses));
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function validateText(text) {
  if (!text) return false;
  text = text.trim();
  return text.length > 0 && text.length <= 200;
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

// таблица рендерится
function renderTable() {
  const table = document.getElementById("taskTable");
  table.innerHTML = "";

  tasks.forEach((task) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${task.id}</td>
      <td>${escapeHTML(task.text)}</td>
      <td>${task.date}</td>
      <td>${task.status}</td>
      <td>
        <button data-action="delete" data-id="${task.id}">Удалить</button>
      </td>
    `;

    table.appendChild(row);
  });
}

// блочный рендер (динамические колонки)
function renderBlocks() {
  const container = document.getElementById("columns");
  container.innerHTML = "";

  statuses.forEach((status) => {
    const col = document.createElement("div");
    col.className = "status-column";
    col.dataset.status = status;

    col.innerHTML = `<h2>${status}</h2>`;

    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", handleDrop);

    tasks
      .filter((t) => t.status === status)
      .forEach((task) => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.draggable = true;
        card.dataset.id = task.id;

        card.innerHTML = `
          <h4>${escapeHTML(task.text)}</h4>
          <p>${task.date}</p>
        `;

        card.addEventListener("dragstart", handleDrag);
        col.appendChild(card);
      });

    container.appendChild(col);
  });
}

// Drag & Drop
let draggedId = null;

function handleDrag(e) {
  draggedId = Number(e.target.dataset.id);
}

function handleDrop(e) {
  const newStatus = e.currentTarget.dataset.status;
  const task = tasks.find((t) => t.id === draggedId);
  task.status = newStatus;

  saveTasks();
  updateView();
}

//Добавляет задачи
function addTask() {
  const text = document.getElementById("taskText").value;
  const date = document.getElementById("taskDate").value;

  if (!validateText(text)) {
    alert("Некорректный текст задачи!");
    return;
  }

  if (!validateDate(date)) {
    alert("Некорректная дата!");
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text.trim(),
    date,
    status: statuses[0], // начальный статус
  });

  saveTasks();
  updateView();

  taskText.value = "";
  taskDate.value = "";
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  updateView();
}

// переключить вид
let currentView = "table";

function updateView() {
  if (currentView === "table") {
    tableView.style.display = "table";
    blockView.style.display = "none";
    renderTable();
  } else {
    tableView.style.display = "none";
    blockView.style.display = "block";
    renderBlocks();
  }
}

// старт
document.addEventListener("DOMContentLoaded", () => {
  loadTask();
  updateView();

  addBtn.addEventListener("click", addTask);

  taskTable.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    deleteTask(Number(btn.dataset.id));
  });

  viewTable.onclick = () => {
    currentView = "table";
    updateView();
  };

  viewBlocks.onclick = () => {
    currentView = "blocks";
    updateView();
  };
});
