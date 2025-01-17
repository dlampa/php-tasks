const btnAddTask = document.querySelector('button[name="addTask"]');
const btnDeleteAll = document.querySelector('button[name="deleteAllTasks"]');
const btnsStartTask = document.querySelectorAll('button[name="startTask"]');
const btnsDeleteTask = document.querySelectorAll('button[name="deleteTask"]');
const chksCompleteTask = document.querySelectorAll('input[name="completeTask"]');
const btnsEditTask = document.querySelectorAll('button[name="editTask"');
let timeout;

btnAddTask.addEventListener("click", (event) => actionHandler(event));
btnDeleteAll.addEventListener("click", (event) => actionHandler(event));

btnsStartTask.forEach(button => button.addEventListener("click", event => actionHandler(event)));
btnsDeleteTask.forEach(button => button.addEventListener("click", event => actionHandler(event)));
chksCompleteTask.forEach(checkbox => checkbox.addEventListener("click", event => completeTask(event)));
btnsEditTask.forEach(button => button.addEventListener("click", event => editActionHandler(event)));

// Inspired by : https://stackoverflow.com/questions/17809056/how-to-add-additional-fields-to-form-before-submit
actionHandler = (event) => {
    event.preventDefault();
    const actionButton = event.target;
    const parentForm = event.target.parentElement;
    
    const actionType = actionButton.getAttribute("name");
    
    // Add additional hidden input containing action parameter to form before POST
    const action = document.createElement("input");
    Object.assign(action, {
        type: "hidden",
        name: "action",
        value: actionType
    });

    parentForm.append(action);
    parentForm.submit();
}

completeTask = (event) => {
    const parentLi = event.target.parentElement;
    const checkBox = event.target;
    const tempForm = document.createElement("form");

    const callerTaskId = parentLi.getAttribute("uuid");
    const requestId = checkBox.getAttribute("requestId");

    Object.assign(tempForm, {
        method: "post",
        action: "index.php",
        hidden: true
    });

    const uuidInput = document.createElement("input");
    Object.assign(uuidInput, {
        type: "hidden",
        name: "uuid",
        value: callerTaskId
    });

    const reqId = document.createElement("input");
    Object.assign(reqId, {
        type: "hidden",
        name: "requestId",
        value: requestId
    });

    const action = document.createElement("input");
    Object.assign(action, {
        type: "hidden",
        name: "action",
        value: "completeTask"
    });
    
    tempForm.append(action);
    tempForm.append(uuidInput);
    tempForm.append(reqId);
    parentLi.append(tempForm);
    tempForm.submit();

}

editActionHandler = (event) => {
// Modified from the jsTasks source
    event.preventDefault();
    const currentTask = event.target.parentElement.parentElement;
    const currentTaskTextElem = currentTask.querySelector("h2");

    // Store the existing task description in case user changes their mind about editing
    const currentTaskText = currentTaskTextElem.textContent;

    // Get a list of elements to be hidden when user clicks on Edit
    const taskControls = currentTask.querySelectorAll(".taskStatus, .timeContainer, [name='startTask'], [name='editTask'], [name='deleteTask']");
    
    for (element of taskControls) { element.classList.add("hidden"); }

    // Create a new textbox containing existing task description
    let newTaskEditor = document.createElement("input");
    Object.assign(newTaskEditor, {
        type: "text",
        classList: "textEntry",
        name: "txtTaskInplaceEdit",
        value: currentTaskText,
        title: "Edit the current task description"
    });

    /* Create an event to handle user changing the block and pressing enter
    keydown event general https://www.w3schools.com/jsref/event_onkeydown.asp
    event.key: https://stackoverflow.com/a/46210516/12802214
    dispatchEvent as from js-gallery demo (altx.dev/js-gallery) */
    newTaskEditor.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            processTaskEdit(event);
        } else if (event.key == "Escape") {
            currentTaskBtnEditCancel.dispatchEvent(new Event("click"));
        }
    });

    // Confirm/save changes button
    let currentTaskBtnEditConfirm = document.createElement("button")
    Object.assign(currentTaskBtnEditConfirm, {
        name: "btnTaskInplaceEditConfirm",
        classList: "fas fa-check",
        title: "Confirm changes"
    });

    currentTaskBtnEditConfirm.addEventListener("click", (event) => { processTaskEdit(event); });

    // Cancel button, returns changes back to normal
    const currentTaskBtnEditCancel = document.createElement("button")
    Object.assign(currentTaskBtnEditCancel, {
        name: "btnTaskInplaceEditCancel",
        classList: "fas fa-times",
        title: "Discard changes"
    });

    /* Event handler for user cancellation - there is no need for a separate function definition for convenience
    i.e. not having to redeclare variables */
    currentTaskBtnEditCancel.addEventListener("click", (event) => {
        // Get all the editor components requiring removal
        const taskEditorCtls = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");
        for (element of taskEditorCtls) { element.remove(element); }

        // Unhide the control elements that were previously hidden
        for (element of taskControls) { element.classList.remove("hidden"); }

        newTaskEditor.replaceWith(currentTaskTextElem);
    });

    // Add the button for confirmation of change and cancellation of task editing
    currentTask.append(currentTaskBtnEditConfirm);
    currentTask.append(currentTaskBtnEditCancel);

    currentTaskTextElem.replaceWith(newTaskEditor);

    // Set focus on new task editor
    newTaskEditor.focus;
}

function processTaskEdit(event) {
    let lstPending = document.querySelector("#secPending");
    let currentTask = event.target.parentElement;
    let taskEditorElement = currentTask.querySelector("[name='txtTaskInplaceEdit']");
    let newTaskText = taskEditorElement.value;

    // Like in add task, it's necessary to check if the item already exists in the pending items list
    let arrTaskTexts = Array.from(lstPending.querySelectorAll("li h2")).map((element) => element.textContent);

    if (newTaskText != "" && !arrTaskTexts.includes(newTaskText)) {
        // Create a temporary form and submit to backend
        const tempForm = document.createElement("form");
        const callerTaskId = currentTask.getAttribute("uuid");
        const requestId = currentTask.querySelector("input[name='requestId']").value;

        Object.assign(tempForm, {
            method: "post",
            action: "index.php",
            hidden: true
        });

        const uuidInput = document.createElement("input");
        Object.assign(uuidInput, {
            type: "hidden",
            name: "uuid",
            value: callerTaskId
        });

        const reqId = document.createElement("input");
        Object.assign(reqId, {
            type: "hidden",
            name: "requestId",
            value: requestId
        });

        const action = document.createElement("input");
        Object.assign(action, {
            type: "hidden",
            name: "action",
            value: "editTask"
        });

        const newTaskTextInput = document.createElement("input");
        Object.assign(newTaskTextInput, {
            type: "hidden",
            name: "newTaskText",
            value: newTaskText
        })

        tempForm.append(action);
        tempForm.append(uuidInput);
        tempForm.append(reqId);
        tempForm.append(newTaskTextInput);
        currentTask.append(tempForm);
        tempForm.submit();

    }
    else if (newTaskText == "") {
        displayError("Task description may not be blank.", createWarnElement = true, parentContainer = currentTask);
    }
    else if (arrTaskTexts.includes(newTaskText)) {
        displayError("A pending task already exists with the same description, please try again.", createWarnElement = true, parentContainer = currentTask);
    }

}

// Error display
function displayError(errorDesc, createWarnElement = false, parentContainer = null) {
    // Reference to the warning element
    let warningElement;

    // Check if parentContainer is specified and createWarnElement is true - if so, create the warning element
    if ((parentContainer != null) && createWarnElement) {
        warningElement = document.createElement("label");
        Object.assign(warningElement, {
            classList: "warningElement"
        });

        parentContainer.append(warningElement);
    }
    else {
        /* If both createWarnElement is false and parentContainer is null, select the warning text element in the 
           the task description input form container */
        warningElement = document.querySelector("form label.warningElement");
    }

    // Displays an error message errorDesc for 3 seconds in the #warningText element
    clearTimeout(timeout);
    warningElement.textContent = errorDesc;
    timeout = setTimeout(() => { warningElement.textContent = ""; }, 3000);
}


submitToBackend = (action, requestId, uuid) => {
    // Works, but I can't get rid of the POST data on refresh (yet...)
    const ajax = new XMLHttpRequest();
      
    data.append("action", action);
    data.append("requestId", requestId);
    data.append("uuid", uuid);

    const commandString = encodeURIComponent("action") + "=" + encodeURIComponent(action) + "&" +
        encodeURIComponent("requestId") + "=" + encodeURIComponent(requestId) + "&" +
        encodeURIComponent("uuid") + "=" + encodeURIComponent(uuid);
    ajax.open("POST", "index.php");
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send(commandString);
}