// Define variables containing containers
let lstPending = document.querySelector("#secPending > ul");
let lstActive = document.querySelector("#secActive > ul");
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
    let inputTaskEstDur = document.querySelector("[name='taskEstDur']");
    let newTaskText = inputTaskElem.value.trim();

    // Extract the list of pending task descriptions (texts) from an HTMLCollection returned by querySelectorAll
    // Inspired by https://medium.com/@chuckdries/traversing-the-dom-with-filter-map-and-arrow-functions-1417d326d2bc
    let arrTaskTexts = Array.from(lstPending.querySelectorAll("li h2")).map((element) => element.textContent);
    
    // != is deliberate, not worried about type comparison
    if (newTaskText != "" && !arrTaskTexts.includes(newTaskText)) {

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
            className: "hidden",
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

        // Create the element for the creation time. Due to the nature of the time tag, a number of properties are not its own
        // and Object.assign is not exactly useful.
        newTaskCDateElem = document.createElement("time");

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

        // Create a container for all the time data
        let taskTimeDiv = document.createElement("div");
        Object.assign(taskTimeDiv, {
            id: "timeContainer"
        });

        // Add an element to show state of the task (early/late/ontime). Hidden initially
        // Deliberately written out in this way in case changes are made in the future
        let taskStatusPanel = document.createElement("aside");
        Object.assign(taskStatusPanel, {
            className: "taskStatus hidden"
        })

        // The label indicating "Early"/"Late"/"On time"
        let statusSummary = document.createElement("p");
        Object.assign(statusSummary, {
            className: "taskStatusLabel"
        });
        
        // The label indicating time difference (i.e. early 15 min)
        let statusTime = document.createElement("p");
        Object.assign(statusTime, {
            className: "taskStatusTime"
        });
              
        // Add all the elements where they belong
        taskStatusPanel.append(statusSummary); 
        taskStatusPanel.append(statusTime);
        
        taskTimeDiv.append(taskStatusPanel); 
        
        // Add the creation time
        // Use time tag to contextualize the data - ref https://www.w3schools.com/tags/tag_time.asp
        let taskCreationTime = document.createElement("time");
        Object.assign(taskCreationTime, {
            className: "creationTime",
            textContent: (new DateHandler()).prettyDate(),
            title: "Time created"
        });

        taskCreationTime.setAttribute("datetime", (new DateHandler()).dateTime); // Easier to manipulate later on. Ref https://stackoverflow.com/a/35494888/12802214

        taskTimeDiv.append(taskCreationTime);

        // Add the user's estimate of the time taken. A little difficult to read, but I wanted to try it out
        let taskDurationEstPretty = (inputTaskEstDur.value < 1) ? 60 * inputTaskEstDur.value + "min" :
            parseInt(inputTaskEstDur.value) + "h " +
            (((inputTaskEstDur.value - parseInt(inputTaskEstDur.value)) != 0) ? 60 * (inputTaskEstDur.value - parseInt(inputTaskEstDur.value)) + "min" : "");

        let taskDurationEstimate = document.createElement("time");
        Object.assign(taskDurationEstimate, {
            className: "taskDurEstimate",
            textContent: taskDurationEstPretty,
            title: "Estimated task duration"
        });
        
        taskDurationEstimate.setAttribute("duration", inputTaskEstDur.value * 3600); // Converted to seconds 
        taskTimeDiv.append(taskDurationEstimate);

        newTaskElem.append(taskTimeDiv);

        
        // Since task duration is an optional parameter, we'll hide the estimate if user chose to ignore it
        if (inputTaskEstDur.value == 0) { taskDurationEstimate.classList.add("hidden"); }

        // Append the todo item to the pending tasks list
        lstPending.appendChild(newTaskElem);

        // Clear textbox - inspired by in class discussion
        inputTaskElem.value = "";
        
        // Set focus back to inputTaskElem
        inputTaskElem.focus();
        
    }
    else if (newTaskText == "")
    {
        displayError("Task description may not be blank.");
    }
    else if (arrTaskTexts.includes(newTaskText)) {
        displayError("A task already exists with the same description, please try again.");
    }
    
}

// Function that moves the completed item to the completed items list
function relegateToCompleted(event)
{
    // Parent element from event
    let completedTask = event.srcElement.parentElement;
    // Replaced childNodes with querySelector
    let chkCompletedTask = completedTask.querySelector("[name='chkTaskComplete']");
    // Reference to taskStatus
    let taskStatusPanel = completedTask.querySelector(".taskStatus");
    // Reference to the timeContainer (div with all the <time> elements)
    let taskTimeDiv = completedTask.querySelector("#timeContainer");

    // https://www.w3schools.com/jsref/prop_checkbox_disabled.asp
    chkCompletedTask.disabled = true;
    
    // Acts as a move - see Node Removal section in https://javascript.info/modifying-document
    lstCompleted.append(completedTask);

    // Task completion time, recorded at the time of checking that box, this is purely for display purposes
    let taskEndTime = document.createElement("time");
    Object.assign(taskEndTime, {
        className: "complTime",
        textContent: (new DateHandler()).prettyDate(),
        title: "Task completed"
    });
    
    //taskEditTime.setAttribute("datetime", new DateHandler().dateTime); // Easier to manipulate later on. Ref https://stackoverflow.com/a/35494888/12802214


    // Get the value for time the task was started
    let taskStartTime = completedTask.querySelector("time.startTime").getAttribute("datetime");
    // This will be the actual duration, in seconds
    let taskDurActual = (new DateHandler(new Date(taskStartTime))).timeToPresent();

    // Comparison between the estimate and the actual
    let taskEstDur = completedTask.querySelector("time.taskDurEstimate").getAttribute("duration");
    let durationDiff = taskDurActual - taskEstDur;

    if (Math.abs(durationDiff) < 300)
    { 
        // Assume if the difference is under 300s (5 min), we're on time
        taskStatusPanel.querySelector(".taskStatusLabel").textContent = "On time";
        taskStatusPanel.querySelector(".taskStatusTime").textContent = durationDiff + "s"
    } else if (durationDiff < 0)
    {
        // Early
        taskStatusPanel.querySelector(".taskStatusLabel").textContent = "Early";
        taskStatusPanel.querySelector(".taskStatusTime").textContent = Math.abs(Math.round(durationDiff / 60)) + "min";

    } else 
    {
        // Late
        taskStatusPanel.querySelector(".taskStatusLabel").textContent = "Late";
        taskStatusPanel.querySelector(".taskStatusTime").textContent = Math.abs(Math.round(durationDiff / 60)) + "min";
    }
    
    taskTimeDiv.append(taskEndTime);
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
    // [name='chkTaskComplete']
    // TODO hide times while editing

    let taskControls = currentTask.querySelectorAll("#timeContainer, [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");

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

    // TODO set focus onto the newTaskEditor

    currentTaskTextElem.replaceWith(newTaskEditor);
    newTaskEditor.focus;
}

function processTaskEdit(event)
{
    let currentTask = event.srcElement.parentElement;
    let taskEditorElement = currentTask.querySelector("[name='txtTaskInplaceEdit']");
    let newTaskText = taskEditorElement.value; 
    let taskTimeDiv = currentTask.querySelector("#timeContainer");

    // Find the redundant buttons specific to the edit action (needed for removal later)
    let taskEditorBtns = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");

    // Create a substitute h2 element containing newly entered text
    let newTask = document.createElement("h2");
    newTask.textContent = newTaskText;

    // Replace the textbox with the new h2 element containing the task description
    taskEditorElement.replaceWith(newTask);
    taskEditorBtns.forEach(element => { element.remove(element); });
    
    // Restore task controls on completion of editing
    let taskControls = currentTask.querySelectorAll("#timeContainer, [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");
    taskControls.forEach((element) => { element.classList.remove("hidden"); }); 
    
    // Use time tag to contextualize the data - ref https://www.w3schools.com/tags/tag_time.asp
    // A bit of a different approach. If the <time> block with .editTime class does not exist, create it, otherwise assign reference to taskEditTime.
    let taskEditTime = (currentTask.querySelector("time.editTime") == null) ? document.createElement("time") : currentTask.querySelector(".editTime");
    Object.assign(taskEditTime, {
        className: "editTime",
        textContent: (new DateHandler()).prettyDate(),
        title: "Last edited"
    });
    taskEditTime.setAttribute("datetime", new DateHandler().dateTime); // Easier to manipulate later on. Ref https://stackoverflow.com/a/35494888/12802214

    taskTimeDiv.append(taskEditTime);

}

function startTask(event)
{
    let currentTask = event.srcElement.parentElement;
    let taskTimeDiv = currentTask.querySelector("#timeContainer");

    // Show the checkbox, allowing the user to complete the task
    currentTask.querySelector("[name='chkTaskComplete']").classList.remove("hidden");

    // Create an entry for task completion time
    let taskStartTime = (currentTask.querySelector("time.startTime") == null) ? document.createElement("time") : currentTask.querySelector(".startTime");
    Object.assign(taskStartTime, {
        className: "startTime",
        textContent: (new DateHandler()).prettyDate(),
        title: "Start time"
    });

    taskStartTime.setAttribute("datetime", new DateHandler().dateTime);

    taskTimeDiv.append(taskStartTime);
     
    // Remove task controls on completion of editing
    let taskControls = currentTask.querySelectorAll("[name='btnStartTask'], [name='btnEditTask']");
    taskControls.forEach(element => { element.remove(element); });

    lstActive.append(currentTask);

}


/* DateHandler object. Used to process dates and times. Not exactly necessary, but I learned a lot from it
Inspired by an example on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
section "Invoked through call or apply"  even though no arrow functions were used */

function DateHandler(selDate = new Date()) {
    // Formatting function for single digit date figures
    function fmtVal(value) { return ("000" + value).slice(-2); };
    
    // Store chosen date as a Date object
    this.objDate = selDate;
    
    // Get date in ISO format, suitable for Date.Parse. Increase value of .getMonth() by 1 because of 0-based indexing !?@>!@#
    this.ISOdate = this.objDate.getFullYear() + "-" + fmtVal(this.objDate.getMonth() + 1) + "-" + fmtVal(this.objDate.getDate());
    
    // Get date in 24h format
    this.time = fmtVal(this.objDate.getHours()) + ":" + fmtVal(this.objDate.getMinutes());
    
    // Get date as unix epoch time
    this.epochTime = Date.parse(this.objDate);
    
    // Get a pretty, parseable date+time string. Useful for creating new DateHandler objects from HTML <time> datetime attribute
    this.dateTime = this.ISOdate + " " + this.time;

    // Get a time difference between the objDate and current time, return value in seconds (from milliseconds)
    this.timeToPresent = function () {
        // Compare this.objDate to current date and return the difference. Really like this little trick
        let compDate = new DateHandler(new Date()).epochTime;
        return (compDate - this.epochTime) / 1000;

    }

    // Return the name of the weekday
    this.dayOfWeek = function () {
        // Ref http://techfunda.com/howto/823/get-day-name-of-date#:~:text=getDay(),6)%20for%20the%20specified%20date.
        let weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let numDayOfWeek = new Date(this.objDate).getDay();
        return (weekDays[numDayOfWeek]);
    }
    // Return a nnice version of relative date. Date stored in objDate is compared to current date at midnight
    this.prettyDate = function () {
        // Compare this.objDate relative to current date
        let compDate = Date.parse(new DateHandler(new Date()).ISOdate + " 00:00:00");

        if (this.epochTime >= compDate)
            // If within last 24h
            return "Today at " + this.time;
        else if (Math.abs(compDate - this.epochTime) <= 1 * 24 * 3600 * 1000)
            // If less than 48h ago, then yesterday
            return "Yesterday at " + this.time;
        else if (Math.abs(compDate - this.epochTime) < 7 * 24 * 3600 * 1000)
            // If less than a week ago, then 
            return this.dayOfWeek() + " at " + this.time;
        else
            // Return date and time in ISO format
            return this.dateTime;
    }
}


// Error display
function displayError(errorDesc)
{
    // Displays an error message errorDesc for 3 seconds in the #warningText element
     clearTimeout(timeout);
     document.querySelector("#warningText").textContent = errorDesc;
     timeout = setTimeout( () => { document.querySelector("#warningText").textContent = ""; }, 3000);
}