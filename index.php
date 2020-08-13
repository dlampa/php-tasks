<!--
Welcome to phpTasks, a rework of jsTasks with PHP as a backend in place of pure JS DOM manipulation.

Layout and design has been inspired by services such as Trello, GMail, Microsoft To Do (Wunderlist), etc.
-->

<?php

// Load the Todo class before loading session so that it's recognized 
include 'includes/Todo.php';

if (!isset($_SESSION)) {
   
    session_start();
}

require 'includes/session.php';
include 'includes/head.php';

// Store a request ID (any random value) and process request only if the requestID is consistent with the one passed down in $_POST.
// This is to ensure that last POST is not reprocessed on refresh.
// Ref: https://stackoverflow.com/a/38768140/12802214 (based on the concept in the link)
$_SESSION['last-requestId'] = uniqid();


?>

<body>
    <header>
        <p>phpTasks</p>
    </header>
    <main>
        <!-- Data entry/task creation -->
        <section id="dataEntry">
            <!-- This time around we are using PHP, so action and method need to be updated appropriately -->
            <form action="index.php" method="post">
                <!-- Using a hidden input to set the action value -->
                <input type="text" id="taskText" class="textEntry" name="taskText" title="Task description" placeholder="Add a task" />
                <input type="number" id="taskEstDur" class="textEntry" name="taskEstDur" min="0" max="10" step="0.25" placeholder="&#xf017;" title="Estimated task duration (in hours, optional)" />
                <button id="btnAddTask" title="Add the task to the Pending Tasks list." class="fas fa-plus"></button>
                <label id="warningText" class="warningElement"></label>
                <!-- Using a hidden input to specify the action for the 'reducer'. 
                https://www.w3schools.com/tags/att_input_type_hidden.asp  -->
                <input type="hidden" name="action" value="add" />
                <input type="hidden" name="requestId" value="<?php echo $_SESSION['last-requestId'] ?>" />
            </form>
        </section>
        <!-- Pending tasks -->
        <!-- <section id="secPending" class="hidden"> -->
        <section id="secPending">
            <h1>Pending tasks</h1>
            <ul>
                <?php 
                    foreach($_SESSION['pendingTaskList'] as $task) {
                        //echo '<li>' . var_dump($task) . '</li>';
                        echo '<li uuid="'. $task->uuid . '">' . $task->itemTask . '</li>';
                        // echo '<li uuid="' . $taskProperty . '">' . $taskProperty . '</li>';
                    }
                ?>
            </ul>
        </section>
        <!-- Active tasks -->
        <section id="secActive" class="hidden">
            <h1>Active tasks</h1>
            <ul></ul>
        </section>
        <!-- Completed tasks -->
        <section id="secCompleted" class="hidden">
            <h1>Completed tasks</h1>
            <ul></ul>
        </section>
    </main>
            <article id="debug">
                <?php var_dump($_POST); var_dump($_SESSION); ?>
            </article>
</body>

</html>