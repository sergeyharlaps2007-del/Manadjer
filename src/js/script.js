let tasks = [];
let statuses = [];

// Загрузка LocalStorage
function loadTask() {
  try {
    const savedTasks = localStorage.getItem("tasks");
    const savedStatuses = localStorage.getItem("statuses");

    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    }

    // Статусы по умолчанию
    if (savedStatuses) {
      statuses = JSON.parse(savedStatuses);
    } else {
      statuses = ["На очереди", "В работе", "На проверке", "Завершено"];
      saveStatuses();
    }
  } catch (e) {
    console.warn("Ошибка: повреждён JSON, очищаю.");
    localStorage.clear();
    tasks = [];
    statuses = [];
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
  if (text.length === 0) return false;
  if (text.length > 200) return false;
  return true;
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  return true;
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
    const column = document.createElement("div");
    column.className = "status-column";
    column.dataset.status = status;
    column.innerHTML = `<h2>${status}</h2>`;
    column.addEventListener("dragover", (e) => e.preventDefault());
    column.addEventListener("drop", handleDrop);

    tasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.draggable = true;
        card.dataset.id = task.id;

        card.innerHTML = `
          <h4>${escapeHTML(task.text)}</h4>
          <p>${task.date}</p>
          <button class="delete-btn" data-id="${task.id}">🗑</button>
        `;

        // Drag & Drop
        card.addEventListener("dragstart", handleDrag);

        // Удаление задачи через мусорку в блоках
        card.querySelector(".delete-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        column.appendChild(card);
      });

    container.appendChild(column);
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
  if (!task) return;
  task.status = newStatus;
  saveTasks();
  updateView();
}

// Панель управления статусами
function renderStatusPanel() {
  const panel = document.getElementById("statusPanel");
  panel.innerHTML = "";

  statuses.forEach((status, index) => {
    const row = document.createElement("div");
    row.className = "status-row";

    const input = document.createElement("input");
    input.value = status;

    input.addEventListener("change", () => {
      const oldStatus = statuses[index];
      const newStatus = input.value.trim();
      if (!newStatus) {
        input.value = oldStatus;
        return;
      }
      statuses[index] = newStatus;

      tasks.forEach((task) => {
        if (task.status === oldStatus) {
          task.status = newStatus;
        }
      });

      saveStatuses();
      saveTasks();
      updateView();
    });

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Удалить";

    btnDelete.addEventListener("click", () => {
      const removed = statuses[index];
      statuses.splice(index, 1);

      tasks.forEach((task) => {
        if (task.status === removed) {
          task.status = statuses[0] || "";
        }
      });

      saveStatuses();
      saveTasks();
      updateView();
    });

    row.appendChild(input);
    row.appendChild(btnDelete);
    panel.appendChild(row);
  });
}

// Добавление задачи
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

  const newTask = {
    id: Date.now(),
    text: text.trim(),
    date: date,
    status: statuses[0],
  };

  tasks.push(newTask);
  saveTasks();
  updateView();

  taskText.value = "";
  taskDate.value = "";
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  updateView();
}

// переключить вид
let currentView = "table";

function updateView() {
  renderStatusPanel();

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

  addStatusBtn.addEventListener("click", () => {
    const text = newStatusText.value.trim();
    if (!text) return;
    statuses.push(text);
    newStatusText.value = "";
    saveStatuses();
    updateView();
  });

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
