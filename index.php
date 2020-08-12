<!DOCTYPE html>

<!--
Welcome to phpTasks, a rework of jsTasks with PHP as a backend in place of pure JS DOM manipulation.

Layout and design has been inspired by services such as Trello, GMail, Microsoft To Do (Wunderlist), etc.
-->

<?php
include 'includes/session.php';
include 'includes/head.php';


?>


    <body>
        <header>
            <p>jsTasks</p>
        </header>
        <main>
            <!-- Data entry/task creation -->
            <section id="dataEntry">
                <form action="index.php" method="post">
                        <input type="hidden" name="method" value="add" />
                        <input type="text" id="taskText" class="textEntry" name="taskText" title="Task description" placeholder="Add a task" />
                        <input type="number" id="taskEstDur" class="textEntry" name="taskEstDur" min="0" max="10" step="0.25" placeholder="&#xf017;" title="Estimated task duration (in hours, optional)" />
                        <button id="btnAddTask" name="btnAddTask" title="Add the task to the Pending Tasks list." class="fas fa-plus"></button>
                        <label id="warningText" class="warningElement"></label>
                </form>
            </section>
            <!-- Pending tasks -->
            <section id="secPending" class="hidden">
                <h1>Pending tasks</h1>
                <ul></ul>
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
    </body>

</html>