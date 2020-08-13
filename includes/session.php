<?php
# Session management - functions, initialisation of the stored state and data manipulation

/*
 * Plan of action:
 * 1. Use functions to manage individual operations on the $_SESSION var
 * 2. Use a kind of a 'reducer' function which determines what to do when form data is submitted and calls 
 *    individual operations to manipulate data inside the relevant $_SESSION array (see below)
 * 3. Organise data in $_SESSION as follows:
 *    - The three todo lists will be stored as $_SESSION['active-todo-list'], $_SESSION['pending-todo-list'], $_SESSION['completed-todo-list']
 *    - Each of the three todo lists will be an array containing individual todo items
 *    - Each todo item will be an object instantiated from a class TodoItem. 
 * 4. TodoItem will have the following properties:
 *    - uuid 
 *    - item task (description)
 *    - start time
 *    - edit time (optional)
 *    - estimated completion time (optional)
 *    - start time
 *    - completion time
 */



// Use null coalescing operator. Wasn't happy with all the ifs and issets. This is neater.
// Ref: https://stitcher.io/blog/shorthand-comparisons-in-php
$_SESSION['pendingTaskList'] = $_SESSION['pendingTaskList'] ?? [];
$_SESSION['activeTaskList'] = $_SESSION['activeTaskList'] ?? [];
$_SESSION['completedTaskList'] = $_SESSION['completedTaskList'] ?? [];
 
//if ( !isset($_SESSION['pending-todo-list']) || empty($_SESSION['pending-todo-list']) ) { $_SESSION['pending-todo-list'] = array(); }


/*  Declare a new class Todo
    Ref: https://www.php.net/manual/en/language.oop5.basic.php */



if ($_SESSION['last-requestId'] == $_POST['requestId']) {
/* Actions on form submission - a kind of a 'reducer' */
    switch ($_POST['action']) {
        case 'addTask':
            // Create a new object with the relevant parameters, thereafter push to pendingTaskList array
            $newTask = new Todo($_POST['taskText'], $_POST['taskEstDur']);
            array_push($_SESSION['pendingTaskList'], $newTask);
            break;
        case 'deleteTask':
            // Go through all three arrays and delete the task if the uuid matches
            $_SESSION['pendingTaskList'] = array_values(array_filter(
                $_SESSION['pendingTaskList'], function($item) {
                    return (!($item->uuid == $_POST['uuid']));
                }
            ));

            $_SESSION['activeTaskList'] = array_values(array_filter(
                $_SESSION['activeTaskList'],
                function ($item) {
                    return (!($item->uuid == $_POST['uuid']));
                }
            ));

            $_SESSION['completedTaskList'] = array_values(array_filter(
                $_SESSION['completedTaskList'],
                function ($item) {
                    return (!($item->uuid == $_POST['uuid']));
                }
            ));

            break;
        case 'startTask':
            /*  Similar approach to JS - isolate the Task based on uuid from the pendingTaskList array
                Then, take the task and push to the array activeTaskList. Finally remove from pendingTaskList array.
                Ref: https://www.php.net/manual/en/function.array-filter.php 
                Need to revalue the keys, hence need to use the array_values()
                Ref: https://stackoverflow.com/a/2653022/12802214
                */
            [$taskToStart] = array_values(array_filter(
                $_SESSION['pendingTaskList'] , 
                function($item) {
                    return ($item->uuid == $_POST['uuid']);
            } ));

            // Add to the activeTaskList array
            array_push($_SESSION['activeTaskList'], $taskToStart);

            // Remove from the pendingTaskList array
            $_SESSION['pendingTaskList'] = array_values(array_filter(
                $_SESSION['pendingTaskList'], 
                function($item) {
                    return (!($item->uuid == $_POST['uuid']));
                }
            ));

            break;
        case 'completeTask':
            break;
    }
}




?>