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
    
    //Delete task button
    let newTaskBtnDelete = document.createElement("input");
    Object.assign(newTaskBtnDelete, {
        type: "button",
        name: "btnDelTask",
        value: "Delete",
        title: "Delete task"
    });
    
    // Add handler for the delete button
    newTaskBtnDelete.addEventListener("click", function (element) { console.log(element); deleteTask(element); });

    // Set the task title. TODO Insert into <h2>
    newTaskElem.textContent = newTaskText;

    /* Useful reference for .prepend/.append/etc methods:
       https://javascript.info/modifying-document */

    // Add the checkbox
    newTaskElem.prepend(newTaskChkComplete);
    
    // Add to the li element
    newTaskElem.append(newTaskBtnDelete);
    

    // Append the todo item to the pending tasks list
    lstPending.appendChild(newTaskElem);
}

// Function that moves the completed item to the completed items list

function relegateToCompleted(element)
{
    let completedTask = element.srcElement.parentElement;
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
    let chkCompletedTask = completedTask.childNodes[0]; // This should probably be dynamic?

    // https://www.w3schools.com/jsref/prop_checkbox_disabled.asp
    chkCompletedTask.disabled = true;
    
    // Acts as a move - see Node Removal section in https://javascript.info/modifying-document
    lstCompleted.append(completedTask);
    
}

function deleteTask(element)
{
    let completedTask = element.srcElement.parentElement;
    completedTask.remove(completedTask);
    
}