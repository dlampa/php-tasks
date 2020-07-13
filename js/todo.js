/* Welcome to jsTask!
   A non-persistent task manager written in JS!
*/

// Define variables containing containers
let lstPending = document.querySelector("#secPending > ul");
let lstActive = document.querySelector("#secActive > ul");
let lstCompleted = document.querySelector("#secCompleted > ul");
let btnAddTask = document.querySelector("#btnAddTask"); 
let inputForm = document.querySelector("form");
let timeout; // require this for error message display (see fn displayError)

/* Event handlers
   General ref about event handlers: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   Arrow functions https://javascript.info/arrow-functions-basics */
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
        let newTaskBtnEdit = document.createElement("button");
        Object.assign(newTaskBtnEdit, {
            name: "btnEditTask",
            classList: "far fa-edit",
            title: "Edit task details"
        });

        newTaskBtnEdit.addEventListener("click", (event) => { editTask(event); });

        //Delete task button
        let newTaskBtnDelete = document.createElement("button");
        Object.assign(newTaskBtnDelete, {
            name: "btnDelTask",
            classList: "far fa-trash-alt",
            title: "Delete task"
        });
    
        // Add handler for the delete button
        newTaskBtnDelete.addEventListener("click", (event) => { deleteTask(event); });

        // Start task button
        let newTaskBtnStart = document.createElement("button");
        Object.assign(newTaskBtnStart, {
            name: "btnStartTask",
            classList: "fas fa-running",
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

        /* Useful reference for .prepend/.append/before/after/etc methods:
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
            className: "timeContainer"
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
        
        newTaskBtnEdit.before(taskStatusPanel);

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
 
        // Only add the duration estimate into the HTML if the user provided the information otherwise ignore
        if (inputTaskEstDur.value != "") {
            // Abs to cater for negative values.
            // Rounding off to nearest 0.25 based on answer at https://stackoverflow.com/a/35639264/12802214
            // Essentially, take the number, divide by 0.25, round up to the next nearest integer, multiply by 0.25 again
            // Ex. 4.333 will be rounded off to 4.5 as follows: (4.333/0.25) = 17.332 => Math.ceil() = 18 * 0.25 = 4.5 
            let taskEstDurCorr = Math.ceil(Math.abs(inputTaskEstDur.value) / 0.25) * 0.25;

            // Add the user's estimate of the time taken. A little difficult to read, but I wanted to try out this combination
            let taskDurationEstPretty = (taskEstDurCorr < 1) ? 60 * taskEstDurCorr + "min" :
                parseInt(taskEstDurCorr) + "h " +
                (((taskEstDurCorr - parseInt(taskEstDurCorr)) != 0) ? 60 * (taskEstDurCorr - parseInt(taskEstDurCorr)) + "min" : "");
    
            let taskDurationEstimate = document.createElement("time");
            Object.assign(taskDurationEstimate, {
                className: "taskDurEstimate",
                textContent: taskDurationEstPretty,
                title: "Estimated task duration"
            });

            taskDurationEstimate.setAttribute("duration", taskEstDurCorr * 3600); // Converted to seconds 
            
            // Show the taskStatus panel since the user chose a time estimate
            taskStatusPanel.classList.remove("hidden");
            taskTimeDiv.append(taskDurationEstimate);
        }

        newTaskElem.append(taskTimeDiv);
        
        // Append the todo item to the pending tasks list
        lstPending.appendChild(newTaskElem);

        // Clear textbox and number inputs - inspired by in class discussion
        inputTaskElem.value = "";
        inputTaskEstDur.value = "";
        
        // Unhide the pending tasks section
        lstPending.parentElement.classList.remove("hidden");

        // Set focus back to inputTaskElem
        inputTaskElem.focus();
        
    }
    else if (newTaskText == "")
    {
        displayError("Task description may not be blank.");
    }
    else if (arrTaskTexts.includes(newTaskText)) {
        displayError("A pending task already exists with the same description, please try again.");
    }
    
}

// Function that moves the completed item to the completed items list
function relegateToCompleted(event)
{
    // Parent element from event
    let completedTask = event.srcElement.parentElement;
    // Parent container of the completed task
    let parentContainer = completedTask.parentElement;
    // Replaced childNodes with querySelector
    let chkCompletedTask = completedTask.querySelector("[name='chkTaskComplete']");
    // Reference to taskStatus
    let taskStatusPanel = completedTask.querySelector(".taskStatus");
    // Reference to the timeContainer (div with all the <time> elements)
    let taskTimeDiv = completedTask.querySelector(".timeContainer");
    
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
  
    // Check if taskEstDur exists. If it exists, take the value, otherwise let it be null
    let taskEstDur = (completedTask.querySelector("time.taskDurEstimate") === null) ?
        null: completedTask.querySelector("time.taskDurEstimate").getAttribute("duration") ;
    
    // Don't do anything if the estimate wasn't supplied
    if (taskEstDur != null) {
        // Get the value for time the task was started
        let taskStartTime = completedTask.querySelector("time.startTime").getAttribute("datetime");
        // This will be the actual duration, in seconds
        let taskDurActual = (new DateHandler(new Date(taskStartTime))).timeToPresent();

        // Comparison between the estimate and the actual
        let durationDiff = taskDurActual - taskEstDur;

        if (Math.abs(durationDiff) < 300) {
            // Assume if the difference is under 300s (5 min), we're on time
            taskStatusPanel.querySelector(".taskStatusLabel").textContent = "on time";
            taskStatusPanel.querySelector(".taskStatusLabel").classList.add("ontime");
            taskStatusPanel.querySelector(".taskStatusTime").textContent = durationDiff + "s"
        } else if (durationDiff < 0) {
            // Early
            taskStatusPanel.querySelector(".taskStatusLabel").textContent = "early";
            taskStatusPanel.querySelector(".taskStatusLabel").classList.add("early");
            taskStatusPanel.querySelector(".taskStatusTime").textContent = Math.abs(Math.round(durationDiff / 60)) + "min";

        } else {
            // Late
            taskStatusPanel.querySelector(".taskStatusLabel").textContent = "late";
            taskStatusPanel.querySelector(".taskStatusLabel").classList.add("late");
            taskStatusPanel.querySelector(".taskStatusTime").textContent = Math.abs(Math.round(durationDiff / 60)) + "min";
        }
    }

    taskTimeDiv.append(taskEndTime);

    // Unhide the completed tasks section. Relevant only for first task being added to Completed tasks list.
    lstCompleted.parentElement.classList.remove("hidden");

    if (parentContainer.childNodes.length == 0) { parentContainer.parentElement.classList.add("hidden"); }
}

// Function that deletes the task
function deleteTask(event)
{
    /* There are many options for this, but this one seemed most elegant
    Find the parent element (task <li>) of the source element that raised the event (<button>) */
    let currentTask = event.srcElement.parentElement;
    let parentContainer = currentTask.parentElement;
    // ...and remove the element.
    currentTask.remove(currentTask);

    /* Looked for array of children, found https://stackoverflow.com/a/10474679/12802214 
       Intent is to hide the parent container if it's empty. Purely for aesthetics. Note, this will be copied
       without comment to other sections where relevant. */
    if (parentContainer.childNodes.length == 0) { parentContainer.parentElement.classList.add("hidden"); }

}

// Function that creates the in-place editor for the current task
function editTask(event)
{
    let currentTask = event.srcElement.parentElement;
    let currentTaskTextElem = currentTask.querySelector("h2");

    // Store the existing task description in case user changes their mind about editing
    let currentTaskText = currentTaskTextElem.textContent;

    // Get a list of elements to be hidden when user clicks on Edit
    let taskControls = currentTask.querySelectorAll(".taskStatus, .timeContainer, [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");
    // Changed from forEach to for..of. Used to have an arrow function though. Sad.
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
    let currentTaskBtnEditCancel = document.createElement("button")
    Object.assign(currentTaskBtnEditCancel, {
        name: "btnTaskInplaceEditCancel",
        classList: "fas fa-times",
        title: "Discard changes"
    });

    /* Event handler for user cancellation - there is no need for a separate function definition for convenience
       i.e. not having to redeclare variables */
    currentTaskBtnEditCancel.addEventListener("click", (event) => {
        // Get all the editor components requiring removal
        let taskEditorCtls = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");
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

function processTaskEdit(event)
{
    let currentTask = event.srcElement.parentElement;
    let taskEditorElement = currentTask.querySelector("[name='txtTaskInplaceEdit']");
    let newTaskText = taskEditorElement.value; 
    let taskTimeDiv = currentTask.querySelector(".timeContainer");

    // Like in add task, it's necessary to check if the item already exists in the pending items list
    let arrTaskTexts = Array.from(lstPending.querySelectorAll("li h2")).map((element) => element.textContent);
    
    if (newTaskText != "" && !arrTaskTexts.includes(newTaskText))
    {
        // Find the redundant buttons specific to the edit action (needed for removal later)
        let taskEditorBtns = currentTask.querySelectorAll("[name='btnTaskInplaceEditCancel'], [name='btnTaskInplaceEditConfirm']");

        // Create a substitute h2 element containing newly entered text
        let newTask = document.createElement("h2");
        newTask.textContent = newTaskText;

        // Replace the textbox with the new h2 element containing the task description
        taskEditorElement.replaceWith(newTask);
        for (element of taskEditorBtns) { element.remove(element); }

        // Restore task controls on completion of editing
        let taskControls = currentTask.querySelectorAll(".taskStatus, .timeContainer, [name='btnStartTask'], [name='btnEditTask'], [name='btnDelTask']");
        for (element of taskControls) { element.classList.remove("hidden"); }
    
        /* Use time tag to contextualize the data - ref https://www.w3schools.com/tags/tag_time.asp
           A bit of a different approach. If the <time> block with .editTime class does not exist, create it, 
           otherwise assign reference to taskEditTime. */
        let taskEditTime = (currentTask.querySelector("time.editTime") == null) ? document.createElement("time") : currentTask.querySelector(".editTime");
        Object.assign(taskEditTime, {
            className: "editTime",
            textContent: (new DateHandler()).prettyDate(),
            title: "Last edited"
        });

        // Easier to manipulate later on. Ref https://stackoverflow.com/a/35494888/12802214
        taskEditTime.setAttribute("datetime", new DateHandler().dateTime);

        taskTimeDiv.append(taskEditTime);
    } 
    else if (newTaskText == "") {
        displayError("Task description may not be blank.", createWarnElement = true, parentContainer = currentTask);
    }
    else if (arrTaskTexts.includes(newTaskText)) {
        displayError("A pending task already exists with the same description, please try again.", createWarnElement = true, parentContainer = currentTask);
    }

}

function startTask(event)
{
    let currentTask = event.srcElement.parentElement;
    let parentContainer = currentTask.parentElement;
    let taskTimeDiv = currentTask.querySelector(".timeContainer");

    // Show the checkbox, allowing the user to complete the task
    currentTask.querySelector("[name='chkTaskComplete']").classList.remove("hidden");

    // Create an entry for task completion time
    let taskStartTime = (currentTask.querySelector("time.startTime") == null) ? document.createElement("time") : currentTask.querySelector(".startTime");
    Object.assign(taskStartTime, {
        className: "startTime",
        textContent: (new DateHandler()).prettyDate(),
        title: "Start time"
    });
    // Store the timestamp into the datetime attribute of the <time> element. This allows 
    taskStartTime.setAttribute("datetime", new DateHandler().dateTime);

    taskTimeDiv.append(taskStartTime);
     
    // Remove task controls after starting the task
    let taskControls = currentTask.querySelectorAll("[name='btnStartTask'], [name='btnEditTask']");
    // Replaced forEach with for..of
    for (element of taskControls) { element.remove(element); }

    lstActive.append(currentTask);

    // Remove hidden attribute from the lstActive parent
    lstActive.parentElement.classList.remove("hidden");
    
    // Hide the Pending task container if empty
    if (parentContainer.childNodes.length == 0) { parentContainer.parentElement.classList.add("hidden"); }

}


/* DateHandler object. Used to process dates and times. Not exactly necessary, but I learned a lot from it
   Inspired by a generic example on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
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
function displayError(errorDesc, createWarnElement = false, parentContainer = null)
{
    // Reference to the warning element
    let warningElement;
    
    // Check if parentContainer is specified and createWarnElement is true - if so, create the warning element
    if ((parentContainer != null) && createWarnElement)
    {
        warningElement = document.createElement("label");
        Object.assign(warningElement, {
            classList: "warningElement"
        });

        parentContainer.append(warningElement);
    }
    else
    {
        /* If both createWarnElement is false and parentContainer is null, select the warning text element in the 
           the task description input form container */
        warningElement = document.querySelector("form label.warningElement");
    }

    // Displays an error message errorDesc for 3 seconds in the #warningText element
     clearTimeout(timeout);
     warningElement.textContent = errorDesc;
     timeout = setTimeout( () => { warningElement.textContent = ""; }, 3000);
}