window.addEventListener('load', () => {
    const form = document.querySelector("#to-do-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");
    const filter = document.querySelector("#filter-tasks");
    const noTasksMessage = document.querySelector("#no-tasks-message");

    // Function to update the custom message based on the filter
    const updateCustomMessage = () => {
        const tasks = document.querySelectorAll(".task");
        const filterValue = filter.value;
        const visibleTasks = Array.from(tasks).filter(task => task.style.display !== "none");

        if (visibleTasks.length === 0) {
            noTasksMessage.style.display = "block";
            if (filterValue === "in-progress") {
                noTasksMessage.textContent = "Yey! There are no pending tasks. Wanna add one?";
            } else if (filterValue === "completed") {
                noTasksMessage.textContent = "Do your tasks first! Or maybe add one if you really got nothing to do.";
            } else {
                noTasksMessage.textContent = "No tasks found. Add one!";
            }
        } else {
            noTasksMessage.style.display = "none";
        }
    };

    // Reset the filter dropdown to "All" on page load
    filter.value = "all";

   // Fetch tasks from the server
   const fetchTasks = async () => {
    const response = await fetch('http://localhost:5001/tasks');
    const tasks = await response.json();
    tasks.forEach(task => {
        createTaskElement(task);
    });
    updateCustomMessage();
};

// Create a task element
const createTaskElement = (task) => {
    const task_el = document.createElement("div");
    task_el.classList.add("task");
    task_el.dataset.id = task._id;

    const task_content_el = document.createElement("div");
    task_content_el.classList.add("content");
    
    task_el.appendChild(task_content_el);

    const task_checkbox_container = document.createElement("label");
    task_checkbox_container.classList.add("container");

    const task_checkbox_el = document.createElement("input");
    task_checkbox_el.type = "checkbox";
    task_checkbox_el.classList.add("checkbox");
    task_checkbox_el.checked = task.completed;

    const task_checkmark_el = document.createElement("div");
    task_checkmark_el.classList.add("checkmark");

    task_checkbox_container.appendChild(task_checkbox_el);
    task_checkbox_container.appendChild(task_checkmark_el);

    const task_input_el = document.createElement("input");
    task_input_el.classList.add("text");
    task_input_el.type = "text";
    task_input_el.value = task.text;
    task_input_el.setAttribute("readonly", "readonly");

    task_content_el.appendChild(task_checkbox_container); // Append checkbox container to content
    task_content_el.appendChild(task_input_el);

    const task_actions_el = document.createElement("div");
    task_actions_el.classList.add("actions");

    const task_edit_el = document.createElement("button");
    task_edit_el.classList.add("edit");
    task_edit_el.innerHTML = "Edit";

    const task_delete_el = document.createElement("button");
    task_delete_el.classList.add("delete");
    task_delete_el.innerHTML = "Delete";

    task_actions_el.appendChild(task_edit_el);
    task_actions_el.appendChild(task_delete_el);

    task_el.appendChild(task_actions_el);

    list_el.appendChild(task_el);

    task_edit_el.addEventListener('click', async () => {
        if (task_edit_el.innerText.toLowerCase() == "edit") {
            task_input_el.removeAttribute("readonly");
            task_input_el.focus();
            task_edit_el.innerText = "Save";
            task_checkbox_container.style.display = "none"; // Hide the checkbox
        } else {
            if (task_input_el.value.trim() === "") {
                // If the input is empty, delete the task
                await fetch(`http://localhost:5001/tasks/${task_el.dataset.id}`, {
                    method: 'DELETE'
                });
                list_el.removeChild(task_el);
                updateCustomMessage(); // Update the custom message after deleting a task
            } else {
                task_input_el.setAttribute("readonly", "readonly");
                task_edit_el.innerText = "Edit";
                task_checkbox_container.style.display = "flex"; // Show the checkbox

                const updatedTask = {
                    text: task_input_el.value,
                    completed: task_checkbox_el.checked
                };

                await fetch(`http://localhost:5001/tasks/${task_el.dataset.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedTask)
                });
            }
        }
    });

    task_delete_el.addEventListener('click', async () => {
        await fetch(`http://localhost:5001/tasks/${task_el.dataset.id}`, {
            method: 'DELETE'
        });
        list_el.removeChild(task_el);
        updateCustomMessage(); // Update the custom message after deleting a task
    });

    task_checkbox_el.addEventListener('change', async () => {
        const updatedTask = {
            text: task_input_el.value,
            completed: task_checkbox_el.checked
        };

        await fetch(`http://localhost:5001/tasks/${task_el.dataset.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        });

        if (task_checkbox_el.checked) {
            task_input_el.classList.add("completed");
            task_input_el.style.color = "#6b7e8f";
            task_edit_el.style.display = "none"; // Hide the edit button
        } else {
            task_input_el.classList.remove("completed");
            task_input_el.style.color = "#fff";
            task_edit_el.style.display = "inline-block"; // Show the edit button
        }
        filter.dispatchEvent(new Event('change')); // Reapply the filter logic
    });
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (input.value.trim() === "") {
        alert("Enter a task to add.");
        return;
    }

    const task = {
        text: input.value,
        completed: false
    };

    const response = await fetch('http://localhost:5001/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });

    const newTask = await response.json();
    createTaskElement(newTask);

    input.value = "";
    updateCustomMessage();
});

filter.addEventListener('change', () => {
    const filterValue = filter.value;
    const tasks = document.querySelectorAll(".task");

    tasks.forEach(task => {
        const checkbox = task.querySelector(".checkbox");
        if (filterValue === "all") {
            task.style.display = "flex";
        } else if (filterValue === "completed") {
            if (checkbox.checked) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        } else if (filterValue === "in-progress") {
            if (!checkbox.checked) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        }
    });
    updateCustomMessage(); // Update the custom message based on the filter
});

// Fetch tasks and apply the filter logic on page load
fetchTasks();
});