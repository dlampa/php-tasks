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
                <input type="hidden" name="action" value="addTask" />
                <input type="hidden" name="requestId" value="<?php echo $_SESSION['last-requestId'] ?>" />
            </form>
        </section>
        <!-- Pending tasks -->
        <!-- <section id="secPending" class="hidden"> -->
        <section id="secPending" class="<?php echo empty($_SESSION['pendingTaskList']) ? 'hidden' : null ?>">
            <h1>Pending tasks</h1>
            <ul>
                <?php
                // Create the task element with all the basic buttons/etc. for interaction. JS will take care of the rest.
                // This should have been a function
                foreach ($_SESSION['pendingTaskList'] as $task) : ?>
                    <li uuid="<?php echo $task->uuid ?>">
                        <h2><?php echo $task->itemTask ?> </h2>
                        <form method="post" action="index.php" requestId="<?php echo $_SESSION['last-requestId'] ?>">
                            <button action="editTask" class="far fa-edit" title="Edit task details"></button>
                            <button action="startTask" class="fas fa-running" title="Start the task"></button>
                            <button action="deleteTask" class="far fa-trash-alt" title="Delete the task"></button>
                        </form>
                        <div class="timeContainer">
                            <time class="creationTime" datetime="<?php echo $task->itemTimeCreated ?>" title="Time created">
                                <?php echo Date('Y-M-d H:i', $task->itemTimeCreated) ?>
                            </time>
                            <?php if ($task->itemTimeComplEstimate != null) : ?>
                                <time class="taskDurEstimate" title="Estimated task duration">
                                    <?php echo $task->itemTimeComplEstimate ?>
                                </time>
                            <?php endif; ?>
                        </div>
                    </li>
                <?php endforeach; ?>
            </ul>
        </section>
        <!-- Active tasks -->
        <section id="secActive" class="<?php echo empty($_SESSION['activeTaskList']) ? 'hidden' : null ?>">
            <h1>Active tasks</h1>
            <ul>
                <?php
                // Create the task element with all the basic buttons/etc. for interaction. JS will take care of the rest.
                // This should have been a function
                foreach ($_SESSION['activeTaskList'] as $task) : ?>
                    <li uuid="<?php echo $task->uuid ?>">
                        <input type="checkbox" name="completeTask" title="Mark task as completed" requestId="<?php echo $_SESSION['last-requestId'] ?>" />
                        <h2><?php echo $task->itemTask ?></h2>
                        <form method="post" action="index.php" requestId="<?php echo $_SESSION['last-requestId'] ?>">
                            <button action="deleteTask" class="far fa-trash-alt" title="Delete the task"></button>
                        </form>
                        <div class="timeContainer">
                            <time class="creationTime" datetime="<?php echo $task->itemTimeCreated ?>" title="Time created">
                                <?php echo Date('Y-M-d H:i', $task->itemTimeCreated) ?>
                            </time>
                            <time class="startTime" datetime="<?php echo $task->itemTimeStarted ?>" title="Start time">
                                <?php echo Date('Y-M-d H:i', $task->itemTimeStarted) ?>
                            </time>
                            <?php if ($task->itemTimeComplEstimate != null) : ?>
                                <time class="taskDurEstimate" title="Estimated task duration">
                                    <?php echo $task->itemTimeComplEstimate ?>
                                </time>
                            <?php endif; ?>
                        </div>
                    </li>
                <?php endforeach; ?>
            </ul>
            </ul>
        </section>
        <!-- Completed tasks -->
        <section id="secCompleted" class="<?php echo empty($_SESSION['completedTaskList']) ? 'hidden' : null ?>">
            <h1>Completed tasks</h1>
            <ul>
                <?php
                // Create the task element with all the basic buttons/etc. for interaction. JS will take care of the rest.
                // This should have been a function
                foreach ($_SESSION['completedTaskList'] as $task) : ?>
                    <li uuid="<?php echo $task->uuid ?>">
                        <input type="checkbox" name="completeTask" title="Mark task as completed" checked disabled />
                        <h2><?php echo $task->itemTask ?></h2>
                        <?php if ($task->itemTimeComplEstimate != null) : ?>
                            <aside class="taskStatus">
                                <p class="taskStatusLabel <?php echo $task->taskStatus(TRUE) ?>">
                                    <?php echo $task->taskStatus() ?>
                                </p>
                                <p class="taskStatusTime">
                                    <?php echo $task->itemTimeDiff ?>
                                </p>
                            </aside>
                        <?php endif; ?>
                        <form method="post" action="index.php" requestId="<?php echo $_SESSION['last-requestId'] ?>">
                            <button action="deleteTask" class="far fa-trash-alt" title="Delete the task"></button>
                        </form>
                        <div class="timeContainer">
                            <time class="creationTime" datetime="<?php echo $task->itemTimeCreated ?>" title="Time created">
                                <?php echo Date('Y-M-d H:i', $task->itemTimeCreated) ?>
                            </time>
                            <time class="startTime" datetime="<?php echo $task->itemTimeStarted ?>" title="Start time">
                                <?php echo Date('Y-M-d H:i', $task->itemTimeStarted) ?>
                            </time>
                            <?php if ($task->itemTimeComplEstimate != null) : ?>
                                <time class="taskDurEstimate" title="Estimated task duration">
                                    <?php echo $task->itemTimeComplEstimate ?>
                                </time>
                            <?php endif; ?>
                            <time class="complTime" datetime="<?php echo $task->itemTimeCompleted ?>" title="Task completed">
                                <?php echo Date("Y-M-d H:i", $task->itemTimeCompleted) ?>
                            </time>
                        </div>
                    </li>
                <?php endforeach; ?>


            </ul>
        </section>
    </main>
</body>

</html>