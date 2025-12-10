<?php

/** @var \App\Model\Task[] $tasks */
/** @var \App\Service\Router $router */

$title = 'Task List';
$bodyClass = 'index';

ob_start(); ?>
    <h1>Task List</h1>

    <a href="<?= $router->generatePath('task-create') ?>">Create new</a>

    <ul class="task-list">
        <?php foreach ($tasks as $task): ?>
            <li>
                <h3><?= $task->getTitle() ?></h3>
                <p><strong>Status:</strong> <?= htmlspecialchars($task->getStatus()) ?></p>
                <p><strong>Priority:</strong> <?= htmlspecialchars($task->getPriority()) ?></p>
                <p><strong>Due Date:</strong> <?= htmlspecialchars($task->getDueDate() ?? 'Not set') ?></p>
                <ul class="action-list">
                    <li><a href="<?= $router->generatePath('task-show', ['id' => $task->getId()]) ?>">Details</a></li>
                    <li><a href="<?= $router->generatePath('task-edit', ['id' => $task->getId()]) ?>">Edit</a></li>
                    <li><a href="<?= $router->generatePath('task-delete', ['id' => $task->getId()]) ?>">Delete</a></li>
                </ul>
            </li>
        <?php endforeach; ?>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
