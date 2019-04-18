(function (window) {
    "use strict";

    let ENTER_KEY = 13, STORAGE_KEY = 'todos-litespeed-0.2';

    window.Demo = window.ls.app('v1.0.0'); // Init app and set cache buster value

    let state = window.Demo.container.get('state');

    state
        .add('', {
            controller: function (tasks) {
                tasks.showAll();
                document.dispatchEvent(new CustomEvent('tasks.list.changed'));
            }
        })
        .add('#completed', {
            controller: function (tasks) {
                tasks.showCompleted();
                document.dispatchEvent(new CustomEvent('tasks.list.changed'));
            }
        })
        .add('#active', {
            controller: function (tasks) {
                tasks.showActive();
                document.dispatchEvent(new CustomEvent('tasks.list.changed'));
            }
        })
    ;

    window.Demo.container
        .set('tasks', function () {
            let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return {
                title: 'TODO App',
                filter: 'all',
                list: data,
                remaining: 0,
                add: function (task) {
                    task.id = this.list.length + Math.random().toString();
                    this.list.push(task);
                },
                remove: function (key) {
                    for(let i = 0; i < this.list.length; i++) {
                        if (this.list[i].id == key) {
                            return this.list.splice(i, 1);
                        }
                    }
                },
                toggle: function (value) {
                    this.list.forEach(function(task) {
                        task.completed = value;
                    });
                },
                showAll: function () {
                    this.filter = 'all';
                },
                showCompleted: function () {
                    this.filter = 'completed';
                },
                showActive: function () {
                    this.filter = 'active';
                },
                clearCompleted: function () {
                    this.list = this.list.filter(function (task) {
                        return !task.completed;
                    })
                }
            }
        }, true)
    ;

    window.Demo.container.get('tasks').__watch = function(tasks) {
        //localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.list))
        tasks.remaining = tasks.list.filter(function (task) {return (!task.completed)}).length;
    };

    window.Demo.container.get('filter')
        .add('completed', function ($value) {
            if($value) {
                return 'completed';
            }

            return '';
        })
        .add('show', function ($value, tasks) {
            $value = JSON.parse($value);

            switch (tasks.filter) {
                case 'all':
                    return true;
                case 'completed':
                    return $value;
                case 'active':
                    return !$value;
            }

            return true;
        })
        .add('pluralize', function ($value) {
            if ('1' === $value) {
                return $value + ' item left';
            }

            return $value + ' items left';
        })
    ;

    window.Demo.container.get('view')
        .add({
            selector: 'data-tasks-add',
            controller: function(element, tasks) {
                element.addEventListener('submit', function () {
                    event.preventDefault();

                    tasks.add({
                        completed: false,
                        title: element.task.value
                    });

                    element.reset();
                });
            }
        })
        .add({
            selector: 'data-tasks-remove',
            controller: function(element, tasks, expression) {
                let id = expression.parse(element.dataset['tasksRemove']);
                element.addEventListener('click', function () {
                    tasks.remove(id);
                });
            }
        })
        .add({
            selector: 'data-tasks-complete-all',
            controller: function(element, tasks) {
                element.addEventListener('click', function () {
                    tasks.toggle(element.checked);
                });
            }
        })
        .add({
            selector: 'data-tasks-clear-completed',
            controller: function(element, tasks) {
                element.addEventListener('click', function () {
                    tasks.clearCompleted();
                });
            }
        })
        .add({
            selector: 'data-tasks-edit',
            controller: function(element, tasks, expression) {
                let id = expression.parse(element.dataset['tasksEdit']);
                let input = element.getElementsByClassName('edit')[0];

                element.addEventListener('dblclick', function () {
                    if(element.classList.contains('editing')) {
                        element.classList.remove('editing');
                    }
                    else {
                        element.classList.add('editing');

                        input.focus();
                    }
                });

                input.addEventListener('blur', function () {
                    element.classList.remove('editing');
                });

                input.addEventListener('keydown', function (e) {
                    let key = e.which || e.keyCode;

                    if (key === ENTER_KEY) {
                        element.classList.remove('editing');
                    }

                    if(input.value === '') {
                        tasks.remove(id);
                    }
                });
            }
        })
        .add({
            selector: 'data-tasks-selected',
            controller: function(element) {
                let filter = element.dataset['tasksSelected'] || '';

                let check = function () {
                    if(filter === state.hash) {
                        element.classList.add('selected');
                    }
                    else {
                        element.classList.remove('selected');
                    }
                };

                document.addEventListener('state-changed', check);

                check();
            }
        })
    ;

    window.Demo.run(window);

}(window));