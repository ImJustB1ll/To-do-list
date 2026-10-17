const form = document.getElementById("todo_form");
const inputBox = document.getElementById("input_box");
const list = document.getElementById("list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
    list.innerHTML = "";

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.textContent = task.text;
        li.setAttribute("data-id", task.id);

        if (task.completed) {
            li.classList.add("checked");
        }

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "\u00d7";
        deleteBtn.setAttribute("aria-label", "Delete task");

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const taskText = inputBox.value.trim();

    if (taskText === "") {
        alert("Write something you want to do");
        return;
    }

    const newTask = {
        id: Date.now(), 
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    inputBox.value = "";
    saveAndRender();
});

list.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li) return;

    const taskId = parseInt(li.getAttribute("data-id"));

    if (e.target.tagName === "LI") {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
        }
        saveAndRender();

    } else if (e.target.tagName === "BUTTON") {
        tasks = tasks.filter(t => t.id !== taskId);
        saveAndRender();
    }
});

function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

renderTasks();