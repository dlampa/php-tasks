// Define variables containing containers
let lstPending = document.querySelector("#secPending > ul");
let lstCompleted = document.querySelector("#secCompleted > ul");
let btnAddTask = document.querySelector("#btnAddTask");


// Event handlers
btnAddTask.addEventListener("click", createTask);  // Add new task button


// Function for creating a new task list item
function createTask()
{
    let inputTaskText = document.querySelector("#taskText");
    let newTaskText = inputTaskText.value;
    
    // TODO Check that the new Task Text is not empty. Warn user if empty
    // TODO Check if the element is already existing in the pending list
    let newTaskElem = document.createElement("li");
    
    // TODO replace with fa-icons
    
    /*
    Task completed checkbox
    For brevity using the method described in 
    https://stackoverflow.com/questions/12274748/setting-multiple-attributes-for-an-element-at-once-with-javascript
    to set multiple element attributes simultaneously */
    let newTaskChkComplete = document.createElement("input");
    Object.assign(newTaskChkComplete, {
        type: "checkbox",
        name: "chkTaskComplete",
        title: "Mark task as completed"
    });
    
    // Add handler for the checkbox
    newTaskChkComplete.addEventListener("click", function(element) { relegateToCompleted(element); });
    
    // Edit task button
    let newTaskBtnEdit = document.createElement("input");
    Object.assign(newTaskBtnEdit, {
        type: "button",
        name: "btnEditTask",
        value: "Edit",
        title: "Edit task details"
    });

    newTaskBtnEdit.addEventListener("click", (element) => { editTask(element); });


    //Delete task button
    let newTaskBtnDelete = document.createElement("input");
    Object.assign(newTaskBtnDelete, {
        type: "button",
        name: "btnDelTask",
        value: "Delete",
        title: "Delete task"
    });
    
    // Add handler for the delete button
    newTaskBtnDelete.addEventListener("click", (element) => { deleteTask(element); });

    // Set the task title. TODO Insert into <h2>
    let newTaskTextElem = document.createElement("h2");
    newTaskTextElem.textContent = newTaskText;
    newTaskElem.append(newTaskTextElem);

    // newTaskElem.textContent = newTaskText;

    /* Useful reference for .prepend/.append/etc methods:
       https://javascript.info/modifying-document */

    // Add the checkbox
    newTaskElem.prepend(newTaskChkComplete);
    
    // Add the edit button to the li element
    newTaskElem.append(newTaskBtnEdit);

    // Add the delete button to the li element
    newTaskElem.append(newTaskBtnDelete);
    
    // Append the todo item to the pending tasks list
    lstPending.appendChild(newTaskElem);
}

// Function that moves the completed item to the completed items list
function relegateToCompleted(element)
{
    let completedTask = element.srcElement.parentElement;
    // Replaced childNodes with querySelector
    let chkCompletedTask = completedTask.querySelector("input[type='checkbox']");

    // https://www.w3schools.com/jsref/prop_checkbox_disabled.asp
    chkCompletedTask.disabled = true;
    
    // Acts as a move - see Node Removal section in https://javascript.info/modifying-document
    lstCompleted.append(completedTask);

    // TODO remove edit button
    
}

// Function that deletes the task
function deleteTask(element)
{
    let currentTask = element.srcElement.parentElement;
    currentTask.remove(currentTask);
}


// Function that creates the in-place editor for the current task
function editTask(element)
{
    let currentTask = element.srcElement.parentElement;
    let currentTaskText = currentTask.querySelector("h2");

    let newTaskEditor = document.createElement("input");
    Object.assign(newTaskEditor, {
        type: "text",
        name: "txtTaskInplaceEdit",
        value: currentTaskText.innerHTML
    });

    // Create an event to handle user changing the block
    newTaskEditor.addEventListener("change", (element) => { processTaskEdit(element); });

    // TODO add a button for confirmation of change
    // TODO hide checkbox and edit/delete buttons

    currentTaskText.replaceWith(newTaskEditor);
}

function processTaskEdit(element)
{
    let currentTask = element.srcElement.parentElement;
    let newTaskText = element.srcElement.value;
    let taskEditorElement = element.srcElement;

    let newTask = document.createElement("h2");
    newTask.textContent = newTaskText;

    taskEditorElement.replaceWith(newTask);

    // TODO add code to remove the confirmation of change button
    // TODO restore edit and delete buttons

}