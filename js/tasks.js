const btnsStartTask = document.querySelectorAll('button[action="startTask"]');
const btnsDeleteTask = document.querySelectorAll('button[action="deleteTask"]');


btnsStartTask.forEach(button => button.addEventListener("click", event => actionHandler(event)));
btnsDeleteTask.forEach(button => button.addEventListener("click", event => actionHandler(event)));


// Inspired by : https://stackoverflow.com/questions/17809056/how-to-add-additional-fields-to-form-before-submit
actionHandler = (event) => {
    event.preventDefault();
    const actionButton = event.target;
    const parentForm = event.target.parentElement;
    const parentLi = parentForm.parentElement;

    const actionType = actionButton.getAttribute("action");
    const requestId = parentForm.getAttribute("requestId");
    const callerTaskId = parentLi.getAttribute("uuid");
    
    // Add additional parameters to form before POST

    const action = document.createElement("input");
    Object.assign(action, {
        type: "hidden",
        name: "action",
        value: actionType
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

    parentForm.append(action);
    parentForm.append(uuidInput);
    parentForm.append(reqId);
    parentForm.submit();
}


// Inspired by 

submitToBackend = (action, requestId, uuid, form) => {
    const ajax = new XMLHttpRequest();
    const data = new FormData(form);
      
    data.append("action", action);
    data.append("requestId", requestId);
    data.append("uuid", uuid);

    const commandString = encodeURIComponent("action") + "=" + encodeURIComponent(action) + "&" +
        encodeURIComponent("requestId") + "=" + encodeURIComponent(requestId) + "&" +
        encodeURIComponent("uuid") + "=" + encodeURIComponent(uuid);
    ajax.open("POST", "index.php");
    // ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send(data);
    console.log(commandString);
    // ajax.send(`"${encodeURIComponent("action")}=${encodeURIComponent(action)}&${encodeURIComponent("requestId") = ${ encodeURIComponent(requestId) } & { encodeURIComponent("uuid") }=${ encodeURIComponent(uuid) }`);
    
}