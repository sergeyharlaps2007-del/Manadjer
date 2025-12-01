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
