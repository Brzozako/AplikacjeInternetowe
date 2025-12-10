<?php

namespace App\Controller;

use App\Exception\NotFoundException;
use App\Model\Task;
use App\Service\Router;
use App\Service\Templating;

class TaskController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $tasks = Task::findAll();
        $html = $templating->render('task/index.html.php', [
            'tasks' => $tasks,
            'router' => $router,
        ]);
        return $html;
    }

    public function showAction(int $taskId, Templating $templating, Router $router): ?string
    {
        $task = Task::find($taskId);
        if (! $task) {
            throw new NotFoundException("Missing task with id $taskId");
        }

        $html = $templating->render('task/show.html.php', [
            'task' => $task,
            'router' => $router,
        ]);
        return $html;
    }

    public function createAction(?array $requestPost, Templating $templating, Router $router): ?string
    {
        if ($requestPost) {
            $task = Task::fromArray($requestPost);
            // @todo missing validation
            $task->save();
            $path = $router->generatePath('task-index');
            $router->redirect($path);
            return null;
        } else {
            $task = new Task();
        }

        $html = $templating->render('task/create.html.php', [
            'task' => $task,
            'router' => $router,
        ]);
        return $html;
    }

    public function editAction(int $taskId, ?array $requestPost, Templating $templating, Router $router): ?string
    {
        $task = Task::find($taskId);
        if (! $task) {
            throw new NotFoundException("Missing task with id $taskId");
        }

        if ($requestPost) {
            $task->fill($requestPost);
            // @todo missing validation
            $task->save();
            $path = $router->generatePath('task-index');
            $router->redirect($path);
            return null;
        }

        $html = $templating->render('task/edit.html.php', [
            'task' => $task,
            'router' => $router,
        ]);
        return $html;
    }

    public function deleteAction(int $taskId, Router $router): ?string
    {
        $task = Task::find($taskId);
        if (! $task) {
            throw new NotFoundException("Missing task with id $taskId");
        }

        $task->delete();
        $path = $router->generatePath('task-index');
        $router->redirect($path);
        return null;
    }
}
