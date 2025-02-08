window.addEventListener('load', async () => {
    const form = document.querySelector("#to-do-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");
    const filter = document.querySelector("#filter-tasks");
    const noTasksMessage = document.querySelector("#no-tasks-message");
    let currentlyEditingTask = null; // Track the currently editing task
   
    // Add "Random Activity" Button
    const randomActivityBtn = document.createElement("button");
    randomActivityBtn.id = "random-activity-btn";
    randomActivityBtn.textContent = "🎲";
    randomActivityBtn.type = "button"; // Prevent form submission
    form.appendChild(randomActivityBtn);
 
 
    // Insert the button before the input field
    form.insertBefore(randomActivityBtn, input);
 
 
    // Event Listener for Button Click
    randomActivityBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any form submission
        getRandomActivity();
    });
 
 
    // Fetch and Display Random Activity
    async function getRandomActivity() {
        try {
            const originalPlaceholder = "What do you need to do today?";
            input.placeholder = "Generating a random activity..."; // Set temporary placeholder
            input.value = ""; // Clear input field
           
            let activity = "";
            do {
                const response = await fetch('https://apis.scrimba.com/bored/api/activity');
                const data = await response.json();
                activity = data.activity
                    .replace(/\byour\b/gi, "my") 
                    .replace(/\byou're\b/gi, "I'm")
                    .replace(/\byou've\b/gi, "I've") 
                    .replace(/\byou are\b/gi, "I am") 
                    .replace(/\bfor you and\b/gi, "for me and") 
                    .replace(/\bto you and\b/gi, "to me and") 
                    .replace(/\byou\b/gi, "I");
   
            } while (activity.length > 50); // Keep fetching until activity is 50 characters or less
   
            input.value = activity; // Autofill the input field
            input.placeholder = originalPlaceholder;
            input.focus(); // Put the cursor in the input field so the user can edit it
        } catch (error) {
            console.error("Error fetching random activity:", error);
            input.placeholder = "Error fetching activity. Try again!";
        }
    }
 
 
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };
 
 
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
 
 
    filter.value = "all";
 
 
    const fetchTasks = async () => {
        const response = await fetch('http://localhost:5001/tasks');
        let tasks = await response.json();
   
        // Sort tasks from most recent to oldest
        tasks.sort((a, b) => {
            const dateA = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
            const dateB = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
            return dateB - dateA; // Sort by most recent
        });
   
        // Clear the task list before re-adding sorted tasks
        list_el.innerHTML = "";
   
        for (const task of tasks) {
            await createTaskElement(task);
        }
        updateCustomMessage();
    };
 
 
    const createTaskElement = async (task) => {
        let existingTask = document.querySelector(`.task[data-id='${task._id}']`);
   
        if (existingTask) {
            // Remove the existing task element before re-adding it at the top
            existingTask.remove();
        }
 
 
        const task_el = document.createElement("div");
        task_el.classList.add("task");
        task_el.dataset.id = task._id;
        task_el.classList.add("move-to-top");
 
 
        // Add animation class
        task_el.classList.add("move-to-top");
 
 
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
 
 
        // Apply styles based on the completed status
        if (task.completed) {
            task_input_el.classList.add("completed");
            task_input_el.style.color = "#6b7e8f"; // Gray color
        }
 
 
        task_content_el.appendChild(task_checkbox_container);
        task_content_el.appendChild(task_input_el);
 
 
        const lastUpdatedEl = document.createElement("span");
        lastUpdatedEl.classList.add("last-updated");
 
 
        const updateLastUpdatedTime = async () => {
            try {
                lastUpdatedEl.textContent = `Last Updated: ${formatDateTime(new Date().toISOString())}`;
            } catch (error) {
                console.error('Error updating time:', error);
            }
        };
 
 
        if (task.lastUpdated) {
            lastUpdatedEl.textContent = `Last Updated: ${formatDateTime(task.lastUpdated)}`;
        } else {
            await updateLastUpdatedTime();
        }
 
 
        task_content_el.appendChild(lastUpdatedEl);
 
 
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
 
 
        // Insert task in the correct order
        const taskDate = new Date(task.lastUpdated || 0);
        let inserted = false;
 
 
        // Loop through existing tasks and insert in correct position
        for (let i = 0; i < list_el.children.length; i++) {
            const currentTask = list_el.children[i];
            const currentDateText = currentTask.querySelector(".last-updated").textContent.split(": ")[1];
            const currentDate = new Date(currentDateText);
 
 
            if (taskDate > currentDate) {
                list_el.insertBefore(task_el, currentTask);
                inserted = true;
                break;
            }
        }
 
 
        if (!inserted) {
            list_el.appendChild(task_el); // Append if it's the oldest
        }
 
 
        // Apply animation effect
        setTimeout(() => {
            task_el.classList.remove("move-to-top");
        }, 500);
 
 
        task_actions_el.classList.add("actions");
 
 
        // Hide edit button if the task is completed
        if (task.completed) {
            task_edit_el.style.display = "none";
        }
 
 
        task_edit_el.addEventListener('click', async () => {
            if (task_edit_el.innerText.toLowerCase() === "edit") {
                if (currentlyEditingTask) {
                    alert("Please save or cancel the current edit before editing another task.");
                    return;
                }
                currentlyEditingTask = task_el; // Set the currently editing task
                originalTaskText = task_input_el.value; // Save the original text before editing
                task_input_el.removeAttribute("readonly");
                task_input_el.style.fontStyle = "italic";
                task_input_el.focus();
                task_edit_el.innerText = "Save";
                task_delete_el.innerText = "Cancel";
                task_checkbox_container.style.display = "none";
 
 
                task_input_el.style.color = "#df85ff";
            } else {
                if (task_input_el.value.trim() === "") {
                    task_input_el.value = originalTaskText; // Revert if empty
                } else if (task_input_el.value === originalTaskText) {
                    alert("No changes made."); // Notify user
 
 
                    task_input_el.style.fontStyle = "normal";
                    task_input_el.setAttribute("readonly", "readonly");
                    task_edit_el.innerText = "Edit";
                    task_delete_el.innerText = "Delete";
                    task_checkbox_container.style.display = "flex"; // Show checkbox again
 
 
                    task_input_el.style.color = "#fff";
 
                    currentlyEditingTask = null; // Reset the currently editing task

                    return;
                } else {
                    task_input_el.style.fontStyle = "normal";
                    task_input_el.setAttribute("readonly", "readonly");
                    task_edit_el.innerText = "Edit";
                    task_delete_el.innerText = "Delete";
                    task_checkbox_container.style.display = "flex";
       
                    task_input_el.style.color = "#fff";
 
 
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
       
                    lastUpdatedEl.textContent = `Last Updated: ${formatDateTime(new Date().toISOString())}`;
 
 
                    list_el.insertBefore(task_el, list_el.firstChild);
                    currentlyEditingTask = null; // Reset the currently editing task
                }
            }
        });
 
 
        task_delete_el.addEventListener('click', async () => {
            if (task_delete_el.innerText.toLowerCase() === "cancel") {
                // Revert back to original value instead of deleting
                task_input_el.value = originalTaskText;
                task_input_el.style.fontStyle = "normal";
                task_input_el.setAttribute("readonly", "readonly");
                task_edit_el.innerText = "Edit";
                task_delete_el.innerText = "Delete";
                task_checkbox_container.style.display = "flex";
       
                task_input_el.style.color = "#fff";
                currentlyEditingTask = null; // Reset the currently editing task
            } else {
                // Show confirmation dialog
                const confirmDelete = confirm("Are you sure you want to delete this task?");
       
                if (confirmDelete) {
                    await fetch(`http://localhost:5001/tasks/${task_el.dataset.id}`, {
                        method: 'DELETE'
                    });
                    list_el.removeChild(task_el);
                    updateCustomMessage();
                }
            }
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
                task_edit_el.style.display = "none";
            } else {
                task_input_el.classList.remove("completed");
                task_input_el.style.color = "#fff";
                task_edit_el.style.display = "inline-block";
            }
            filter.dispatchEvent(new Event('change'));
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
        completed: false,
        lastUpdated: new Date().toISOString() // Ensure timestamp is always set
    };
 
 
    const response = await fetch('http://localhost:5001/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });
 
 
    const newTask = await response.json();
    // Create the task element
    await createTaskElement(newTask);
   
    // Clear the input
    input.value = "";
   
    // Insert the new task at the top of the list
    list_el.insertBefore(list_el.lastChild, list_el.firstChild);
   
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
        updateCustomMessage();
    });
 
 
    await fetchTasks();
 });
 