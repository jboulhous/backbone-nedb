/*global describe*/
var path = require('path');
var expect    = require("chai").expect;
var tmp = require('tmp');
var _ = require("underscore");
var Backbone = require("backbone");
var NeDB = require("nedb");
var BackboNeDB = require("../lib");

var dir = tmp.dirSync();
var store = new NeDB({filename: path.join(dir.name, 'todos.db')});

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

describe('Backbone-nedb', function () {
  before(function (done) {
    store.loadDatabase(function (err) {
      err && console.error('Cant load store database');
      // console.log('database loaded');
      done();
    });
  });
  
  describe('BackboNeDB.Model', function() {
    var todo = new Todo({title: "first"});
    it('should be extendable', function () {
      expect(todo).to.be.instanceof(Backbone.Model);
      expect(todo).to.be.instanceof(BackboNeDB.Model);
    });
    it('should create', function (done) {
      todo.save(todo.toJSON(), {
        success: function (model, response, options) {
          // expect(true).to.equal(true);
          expect(model.get('title')).to.equal(todo.get('title'));
          done();
        }
      });
    });
    it('should update', function (done) {
      todo.save({title: 'updated'}, {
        success: function (model, response, options) {
          // expect(true).to.equal(true);
          expect(model.get('title')).to.equal('updated');
          done();
        }
      });
    });
    it('should read', function (done) {
      todo.fetch({
        success: function (model, response, options) {
          // expect(true).to.equal(true);
          expect(model.get('title')).to.exist;
          done();
        }
      });
    });
    it('should delete', function (done) {
      todo.destroy({
        success: function (model, response, options) {
          store.count({}, function (err, result) {
            err && console.log('Error in delete test');
            expect(result).to.equal(0);
            done();
          });
        }
      });
    });
  });
  
  describe('BackboNeDB.Collection', function() {
    var todo = new Todo({title: "first"});
    it('should be extendable', function () {
      expect(Todos).to.be.instanceof(Backbone.Collection);
      expect(Todos).to.be.instanceof(BackboNeDB.Collection);
    });
    it('should read', function (done) {
      var todo = new Todo();
      todo.on('sync', function () {
        Todos.fetch({
          success: function () {
            expect(Todos.size()).to.equal(1);
            done();
          }
        });
      });
      todo.save();
    });
  });
});
