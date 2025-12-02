let tasks = [];

// Загрузка LocalStorage
function loadTask() {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

// Сохранение LocalStorage
function saveTasks (){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}



function renderTable() {
    const table = document.getElementById("taskTable");
    table.innerHTML = "";
                                   //Отображение таблицы
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

        table.appendChild(row);
    });
}



function addTask() {
    const text = document.getElementById("taskText").value;
    const date = document.getElementById("taskDate").value;
                                     //Добавляет задачи 
    if (!text || !date) {
        alert("Заполни оба поля");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        date: date,
        done: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTable();

    document.getElementById("taskText").value = "";
    document.getElementById("taskDate").value = "";
}



function deleteTask(id){
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();            //Удаление
    renderTable();
}



function toggleDone(id){
    const task = tasks.find(t => t.id === id);
    task.done = !task.done;      //Статут переключается 

    saveTasks();
    renderTable();
}



loadTask();
renderTable();
