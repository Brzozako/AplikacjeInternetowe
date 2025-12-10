<?php

namespace App\Model;

use App\Service\Config;

class Task
{
    private ?int $id = null;
    private ?string $title = null;
    private ?string $description = null;
    private ?string $status = 'pending';
    private ?string $due_date = null;
    private ?string $priority = 'medium';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Task
    {
        $this->id = $id;
        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): Task
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Task
    {
        $this->description = $description;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): Task
    {
        $this->status = $status;
        return $this;
    }

    public function getDueDate(): ?string
    {
        return $this->due_date;
    }

    public function setDueDate(?string $due_date): Task
    {
        $this->due_date = $due_date;
        return $this;
    }

    public function getPriority(): ?string
    {
        return $this->priority;
    }

    public function setPriority(?string $priority): Task
    {
        $this->priority = $priority;
        return $this;
    }

    public static function fromArray($array): Task
    {
        $task = new self();
        $task->fill($array);
        return $task;
    }

    public function fill($array): Task
    {
        if (isset($array['id']) && ! $this->getId()) {
            $this->setId($array['id']);
        }
        if (isset($array['title'])) {
            $this->setTitle($array['title']);
        }
        if (isset($array['description'])) {
            $this->setDescription($array['description']);
        }
        if (isset($array['status'])) {
            $this->setStatus($array['status']);
        }
        if (isset($array['due_date'])) {
            $this->setDueDate($array['due_date']);
        }
        if (isset($array['priority'])) {
            $this->setPriority($array['priority']);
        }
        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM task ORDER BY due_date ASC';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $tasks = [];
        $tasksArray = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($tasksArray as $taskArray) {
            $tasks[] = self::fromArray($taskArray);
        }

        return $tasks;
    }

    public static function find($id): ?Task
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM task WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $taskArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (! $taskArray) {
            return null;
        }

        $task = Task::fromArray($taskArray);
        return $task;
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (! $this->getId()) {
            $sql = "INSERT INTO task (title, description, status, due_date, priority) VALUES (:title, :description, :status, :due_date, :priority)";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'title' => $this->getTitle(),
                'description' => $this->getDescription(),
                'status' => $this->getStatus(),
                'due_date' => $this->getDueDate(),
                'priority' => $this->getPriority(),
            ]);

            $this->setId($pdo->lastInsertId());
        } else {
            $sql = "UPDATE task SET title = :title, description = :description, status = :status, due_date = :due_date, priority = :priority WHERE id = :id";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':title' => $this->getTitle(),
                ':description' => $this->getDescription(),
                ':status' => $this->getStatus(),
                ':due_date' => $this->getDueDate(),
                ':priority' => $this->getPriority(),
                ':id' => $this->getId(),
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = "DELETE FROM task WHERE id = :id";
        $statement = $pdo->prepare($sql);
        $statement->execute([
            ':id' => $this->getId(),
        ]);

        $this->setId(null);
        $this->setTitle(null);
        $this->setDescription(null);
        $this->setStatus(null);
        $this->setDueDate(null);
        $this->setPriority(null);
    }
}
