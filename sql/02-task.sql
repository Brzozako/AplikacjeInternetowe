create table task
(
    id          integer not null
        constraint task_pk
            primary key autoincrement,
    title       text not null,
    description text not null,
    status      text default 'pending' not null,
    due_date    text,
    priority    text default 'medium' not null
);
