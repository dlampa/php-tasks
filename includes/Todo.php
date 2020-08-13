<?php
# Todo class definition - object containing all task data
class Todo
{
    function __construct($itemTask, $itemComplEstimate = null) {
        $this->uuid = uniqid("taskId-");
        $this->itemTask = $itemTask;
        $this->itemTimeCreated = time();
        $this->itemTimeComplEstimate = $itemComplEstimate;
    }

    public $itemTimeStarted;
    public $itemTimeCompleted;
    public $itemTimeComplEstimate;
    public $itemTimeEdited;
    public $itemTimeDiff;

    function taskDuration() {
        return ($this-> itemTimeCompleted - $this->itemTimeStarted);
    }

    function taskDurationDiff() {
        return ($this->taskDuration() - $this->itemTimeComplEstimate * 3600);
    }
    
    function taskStatus($classname = FALSE) {
        $durationDiff = $this->taskDurationDiff();
        // If alt syntax
        // Ref: https://www.php.net/manual/en/control-structures.alternative-syntax.php
        if (abs($durationDiff) < 300 ):
            $this->itemTimeDiff = $durationDiff . "s";
            return $classname ? "ontime" : "on time";
        elseif ($durationDiff < 0):
            $this->itemTimeDiff = abs(round($durationDiff / 60)) . "min";
            return "early";
        else:
            $this->itemTimeDiff = abs(round($durationDiff / 60)) . "min";
            return "late";
        endif;
    }

    

}
