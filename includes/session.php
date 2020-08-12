<? php 
# Session management - functions, initialisation of the stored state and data manipulation

/**
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
 *    - item description
 *    - start time
 *    - edit time (optional)
 *    - estimated completion time (optional)
 *    - start time
 *    - completion time
 */

 session_start();


 // Use null coalescing operator. Wasn't happy with all the ifs and issets. This is neater.
 // Ref: https://stitcher.io/blog/shorthand-comparisons-in-php
 $_SESSION['pending-todo-list'] ?? [];
 $_SESSION['active-todo-list'] ?? [];
 $_SESSION['completed-todo-list'] ?? [];
 
 ?>
 