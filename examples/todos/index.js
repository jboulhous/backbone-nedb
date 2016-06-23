var path = require('path');
var BackboNeDB = require('../..');
var Store = require('nedb');
var inquirer = require('inquirer');

var store = new Store({filename: path.join(__dirname, 'todos.nedb')});

var TODO_DONE_TRUE = '☑';
var TODO_DONE_FALSE = '☐';

var Todo = BackboNeDB.Model.extend({
  store: store,
  defaults: function() {
    return {
      title: "empty todo...",
      order: Todos.nextOrder(),
      done: false
    };
  },
  initialize: function() {
    if (!this.get("title")) {
      this.set({"title": this.defaults().title});
    }
  },
  toggle: function() {
    this.save({done: !this.get("done")});
  },
  toString: function () {
    return [
      (this.get('done') ? TODO_DONE_TRUE : TODO_DONE_FALSE), 
      this.get('title')
    ].join(' ');
  }
});
// The collection of todos is backed by *nedb* store.
var TodoList = BackboNeDB.Collection.extend({
  // Reference to this collection's model.
  model: Todo,
  
  // Save all of the todo items in the nedb store.
  store: store,
  
  // Filter down the list of all todo items that are finished.
  done: function() {
    return this.filter(function(todo){ return todo.get('done'); });
  },
  
  // Filter down the list to only todo items that are still not finished.
  remaining: function() {
    return this.without.apply(this, this.done());
  },
  
  // We keep the Todos in sequential order, despite being saved by unordered
  // GUID in the database. This generates the next order number for new items.
  nextOrder: function() {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },
  
  // Todos are sorted by their original insertion order.
  comparator: function(todo) {
    return todo.get('order');
  }

});

// Create our global collection of **Todos**.
var Todos = new TodoList;


function start() {
  Todos.once('sync', interactive);
  Todos.fetch();
  // console.log('Todos.fetch');
}

var questions = [
  { type: 'input', name: 'command', message: 'Type your command :'}
];

function interactive() {
  // console.log('interactive');
  operations.list(false);
}

var operations = {
  create: function(){
    // console.log('create');
    inquirer.prompt([
      {type: 'input', name: 'create', message: 'Enter todo text :'}
    ]).then(function (answers) {
      var todo = new Todo({title: answers.create});
      todo.once('sync', start);
      todo.save();
    });
  },
  complete: function(){
    // console.log('complete');
    inquirer.prompt([
      {
        type: 'list', 
        name: 'update', 
        message: 'Choose todo to toggle status',
        choices: function (answers) {
          return Todos.map(function (todo) {
            var title = todo.get('title');
            return {
              name: todo.toString(),
              value: todo.id,
              short: title
            };
          });
        }
      }
    ]).then(function (answers) {
      console.log('update.answers', answers);
      var todo = Todos.get(answers.update);
      todo.once('sync', start);
      todo.toggle();
    });
  },
  list: function (filtered, filter) {
    // console.log('list', filtered, filter);
    var selector = filtered ? {done: !! filter} : {};
    var todos = Todos.where(selector);
    if (todos.length) {
      todos.forEach(function (todo) {
        console.log(todo.toString());
      });
    } else {
      console.log(filtered ? 
        (filter ? 
          'No todos completed yet, go complete a todo' :
            'No todos remaining') : 
          'No todos yet, start by creating a new one');
    }
    
    commands();
    
    inquirer.prompt(questions).then(handler);
  }
};

function handler(answers) {
  // console.log('handler.answers', answers);
  var operation, filtered, filter;
  switch (answers.command) {
    case '+':
      // console.log('operation', '+');
      operation = 'create';
      break;
    case '-':
      // console.log('operation', '-');
      operation = 'complete';
      break;
    case '*':
      // console.log('operation', '*');
      operation = 'list';
      filtered = true;
      filter = true;
      break;
    case '/':
      // console.log('operation', '/');
      operation = 'list';
      filtered = true;
      filter = false;
      break;
    case '.':
      // console.log('operation', '.');
      operation = 'list';
      filtered = false;
      break;
    
    // default:
    //   operations[operation](filtered, filter);
  }
  // console.log('(', operation, ',' , filtered, ',', filter, ')');
  operations[operation](filtered, filter);
}

function commands() {
  console.log('Commands: ');
  console.log(' [+] : add new todo');
  console.log(' [-] : complete todo');
  console.log(' [*] : list completed');
  console.log(' [/] : list remaining');
  console.log(' [.] : list all');
}

store.loadDatabase(function (err) {
  if (err)
    return console.error('Error loading nedb store' + store.filename);
  // console.log('Database loaded');
  start();
});
