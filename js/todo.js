// Define variables containing containers
let lstPending = document.querySelector("#secPending > ul");
let lstCompleted = document.querySelector("#secCompleted > ul");
let btnAddTask = document.querySelector("#btnAddTask"); 

let inputForm = document.querySelector("form");
let timeout; // require this for error message display

// Event handlers
// General ref about event handlers: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Arrow functions https://javascript.info/arrow-functions-basics
btnAddTask.addEventListener("click", (event) => { createTask(event); }); // Add new task button click event
inputForm.addEventListener("submit", (event) => { createTask(event); }); // Catering for the user entering a value in the inputTaskText and pressing enter

// Function for creating a new task list item
function createTask(event)
{
    // Important for preventing the normal form submit behavior since the same function is used for both event handlers (see Event handlers above)
    event.preventDefault();

    let inputTaskElem = document.querySelector("#taskText");
    let newTaskText = inputTaskElem.value.trim();

    // TODO Check if the element is already existing in the pending list
    
    // != is deliberate, not worried about type comparison
    if (newTaskText != "") {

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
        newTaskChkComplete.addEventListener("click", (event) => { relegateToCompleted(event); });
    
        // Edit task button
        let newTaskBtnEdit = document.createElement("input");
        Object.assign(newTaskBtnEdit, {
            type: "button",
            name: "btnEditTask",
            value: "Edit",
            title: "Edit task details"
        });

        newTaskBtnEdit.addEventListener("click", (event) => { editTask(event); });

        //Delete task button
        let newTaskBtnDelete = document.createElement("input");
        Object.assign(newTaskBtnDelete, {
            type: "button",
            name: "btnDelTask",
            value: "Delete",
            title: "Delete task"
        });
    
        // Add handler for the delete button
        newTaskBtnDelete.addEventListener("click", (event) => { deleteTask(event); });

        // Start task button
        let newTaskBtnStart = document.createElement("input");
        Object.assign(newTaskBtnStart, {
            type: "button",
            name: "btnStartTask",
            value: "Start",
            title: "Start the task"
        });

        newTaskBtnStart.addEventListener("click", (event) => { startTask(event)})


        // Set the task title. 
        let newTaskTextElem = document.createElement("h2");
        newTaskTextElem.textContent = newTaskText;
        newTaskElem.append(newTaskTextElem);

        /* Useful reference for .prepend/.append/etc methods:
           https://javascript.info/modifying-document */

        // Add the checkbox
        newTaskElem.prepend(newTaskChkComplete);
    
        // Add the edit button to the li element
        newTaskElem.append(newTaskBtnEdit);

        // Add the delete button to the li element
        newTaskElem.append(newTaskBtnDelete);
        
        // Add the start button to the li element
        newTaskElem.append(newTaskBtnStart);
    
        // Append the todo item to the pending tasks list
        lstPending.appendChild(newTaskElem);

        // Clear textbox - inspired by in class discussion
        inputTaskElem.value = "";
        
        // Set focus back to inputTaskElem
        inputTaskElem.focus();
        
    } else {
        // Use a timeout to delay clearing of the #warningText element
        // TODO turn into a multiple error handler
        clearTimeout(timeout);
        document.querySelector("#warningText").textContent = "Empty tasks are not allowed."
        timeout = setTimeout(() => { document.querySelector("#warningText").textContent = ""; }, 3000);
    }
    
}

// Function that moves the completed item to the completed items list
function relegateToCompleted(event)
{
    let completedTask = event.srcElement.parentElement;
    // Replaced childNodes with querySelector
    let chkCompletedTask = completedTask.querySelector("input[type='checkbox']");

    // https://www.w3schools.com/jsref/prop_checkbox_disabled.asp
    chkCompletedTask.disabled = true;
    
    // Acts as a move - see Node Removal section in https://javascript.info/modifying-document
    lstCompleted.append(completedTask);

    // TODO remove edit button
    
}

// Function that deletes the task
function deleteTask(event)
{
    let currentTask = event.srcElement.parentElement;
    currentTask.remove(currentTask);
}


// Function that creates the in-place editor for the current task
function editTask(event)
{
    let currentTask = event.srcElement.parentElement;

    let currentTaskTextElem = currentTask.querySelector("h2");

    // Store the existing task description in case user changes their mind about editing
    let currentTaskText = currentTaskTextElem.textContent;

    // Get a list of elements to be hidden when user clicks on Edit
    let taskControls = currentTask.querySelectorAll("[name='chkTaskComplete'], [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");

    // Create a new textbox containing existing task description
    let newTaskEditor = document.createElement("input");
    Object.assign(newTaskEditor, {
        type: "text",
        name: "txtTaskInplaceEdit",
        value: currentTaskText,
        title: "Edit the current task description"
    });

    // Create an event to handle user changing the block and pressing enter
    // keydown event general https://www.w3schools.com/jsref/event_onkeydown.asp
    // event.key: https://stackoverflow.com/a/46210516/12802214
    newTaskEditor.addEventListener("keydown", (event) => { if (event.key == "enter") processTaskEdit(event); });

    // TODO add a button to confirm/save
    let currentTaskBtnEditConfirm = document.createElement("input")
    Object.assign(currentTaskBtnEditConfirm, {
        type: "button",
        name: "btnTaskInplaceEditConfirm",
        value: "Confirm",
        title: "Confirm changes"
    });

    currentTaskBtnEditConfirm.addEventListener("click", (event) => { processTaskEdit(event); });

    // Cancel button, returns changes back to normal
    let currentTaskBtnEditCancel = document.createElement("input")
    Object.assign(currentTaskBtnEditCancel, {
        type: "button",
        name: "btnTaskInplaceEditCancel",
        value: "Cancel",
        title: "Discard changes to current task"
    });

    // Event handler for user cancellation - there is no need for a separate function definition for convenience
    // i.e. not having to redeclare variables 
    currentTaskBtnEditCancel.addEventListener("click", (event) => {
        // Get all the editor components requiring removal
        let taskEditorCtls = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");
        taskEditorCtls.forEach(element => { element.remove(element); });

        // Unhide the control elements that were previously hidden
        taskControls.forEach((element) => { element.classList.remove("hidden"); });        
        
        newTaskEditor.replaceWith(currentTaskTextElem);
    });

    // Hide task controls not used during editing
    taskControls.forEach((element) => { element.classList.add("hidden"); });
    
    // Add the button for confirmation of change and cancellation of task editing
    currentTask.append(currentTaskBtnEditConfirm);
    currentTask.append(currentTaskBtnEditCancel);

    // TODO hide checkbox and edit/delete buttons

    currentTaskTextElem.replaceWith(newTaskEditor);
}

function processTaskEdit(event)
{
    let currentTask = event.srcElement.parentElement;
    let taskEditorElement = currentTask.querySelector("[name='txtTaskInplaceEdit']");
    let newTaskText = taskEditorElement.value; 

    // Find the redundant buttons specific to the edit action (needed for removal later)
    let taskEditorBtns = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");

    // Create a substitute h2 element containing newly entered text
    let newTask = document.createElement("h2");
    newTask.textContent = newTaskText;

    // Replace the textbox with the new h2 element containing the task description
    taskEditorElement.replaceWith(newTask);
    taskEditorBtns.forEach(element => { element.remove(element); });
    
    // Restore task controls on completion of editing
    let taskControls = currentTask.querySelectorAll("[name='chkTaskComplete'], [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");
    taskControls.forEach((element) => { element.classList.remove("hidden"); }); 
    

}

function startTask(event)
{

}
