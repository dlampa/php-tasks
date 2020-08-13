<?php
# Todo class definition - object containing all task data
class Todo
{
    function __construct($itemTask, $itemComplEstimate = null) {
        $this->uuid = uniqid("taskId-");
        $this->itemTask = $itemTask;
        $this->itemTimeStarted = time();
        $this->itemTimeComplEstimate = $itemComplEstimate;
    }

    public $itemTimeCompleted;
    public $itemTimeComplEstimate;
    public $itemTimeEdited;
}
