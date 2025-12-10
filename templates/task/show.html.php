<?php

/** @var \App\Model\Task $task */
/** @var \App\Service\Router $router */

$title = 'Task Details';
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= htmlspecialchars($task->getTitle()) ?></h1>
    <article>
        <p><strong>Description:</strong></p>
        <p><?= htmlspecialchars($task->getDescription()) ?></p>
        <p><strong>Status:</strong> <?= htmlspecialchars($task->getStatus()) ?></p>
        <p><strong>Priority:</strong> <?= htmlspecialchars($task->getPriority()) ?></p>
        <p><strong>Due Date:</strong> <?= htmlspecialchars($task->getDueDate() ?? 'Not set') ?></p>
    </article>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('task-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('task-edit', ['id'=> $task->getId()]) ?>">Edit</a></li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
