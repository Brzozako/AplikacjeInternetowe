<?php

/** @var \App\Model\Task $task */
/** @var \App\Service\Router $router */

$title = 'Edit Task';
$bodyClass = "edit";

ob_start(); ?>
    <h1>Edit Task</h1>

    <form action="<?= $router->generatePath('task-edit', ['id' => $task->getId()]) ?>" method="post" class="edit-form">
        <ul>
            <li>
                <label>Title <span class="required">*</span></label>
                <input type="text" name="task[title]" value="<?= $task->getTitle() ?>" required />
            </li>
            <li>
                <label>Description <span class="required">*</span></label>
                <textarea name="task[description]" required><?= $task->getDescription() ?></textarea>
            </li>
            <li>
                <label>Status</label>
                <select name="task[status]">
                    <option value="pending" <?= $task->getStatus() === 'pending' ? 'selected' : '' ?>>Pending</option>
                    <option value="in_progress" <?= $task->getStatus() === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                    <option value="completed" <?= $task->getStatus() === 'completed' ? 'selected' : '' ?>>Completed</option>
                </select>
            </li>
            <li>
                <label>Priority</label>
                <select name="task[priority]">
                    <option value="low" <?= $task->getPriority() === 'low' ? 'selected' : '' ?>>Low</option>
                    <option value="medium" <?= $task->getPriority() === 'medium' ? 'selected' : '' ?>>Medium</option>
                    <option value="high" <?= $task->getPriority() === 'high' ? 'selected' : '' ?>>High</option>
                </select>
            </li>
            <li>
                <label>Due Date</label>
                <input type="date" name="task[due_date]" value="<?= $task->getDueDate() ?>" />
            </li>
            <li>
                <input type="submit" value="Submit" />
            </li>
        </ul>
    </form>

    <a href="<?= $router->generatePath('task-index') ?>">Back to list</a>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
