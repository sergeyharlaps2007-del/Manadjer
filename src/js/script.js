let tasks = [];
function loadTask() {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        tasks = JSON.parse(saved);
    }                                                 //Загрузка,сохранение LocalStorage
}

function saveTasks (){
    localStorage.setItem("tasks",JSON.stringify(tasks));
}


function renderTable() {
    const table = document.getElementById("taskTable");
    table.innerHTML = "";

    tasks.forEach(task => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.text}</td>
            <td>${task.date}</td>           
            <td>${task.done ? "+" : "-"}</td>
            <td>
                <button onclick="toggleDone(${task.id})">Выполнить</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </td>
        `;
                                        //Отображает таблицу
        table.appendChild(row);
    });
}


function addTask() {
    const text = document.getElementById("taskText").value;
    const date = document.getElementById("taskDate").value;

    if (!text || !date) {
        alert("Заполни оба поля");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        date: date,
        done: false             //Добавляет
    };

    tasks.push(newTask);

    saveTasks();
    renderTable();

    // очистка полей
    document.getElementById("taskText").value = "";
    document.getElementById("taskDate").value = "";
}

