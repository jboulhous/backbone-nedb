var Backbone = require("backbone");
var _ = require("underscore");

function getStore(model) {
  return _.result(model, 'store') || _.result(model.collection, 'store');
}

var Model = {
  create: function (model, options) {
    var store = getStore(model);
    return store.insert(model.toJSON(), function (err, doc) {
      if (err)
        return options.error(err, options);
      options.success(doc, options);
    });
  },
  read: function (model, options) {
    var store = getStore(model);
    return store.findOne({_id: model.id}, function (err, doc) {
      if (err)
        return options.error(err, options);
      options.success(doc, options);
    });
  },
  update: function (model, options) {
    var store = getStore(model);
    return store.update({_id: model.id}, model.toJSON(), {
      returnUpdatedDocs: true
    }, function (err, docs) {
      if (err)
        return options.error(err, options);
      options.success(_.first(docs), options);
    });
  }
};

Model['delete'] = function (model, options) {
  var store = getStore(model);
  return store.remove({_id: model.id}, {}, function (err, docs) {
    if (err)
      return options.error(err, options);
    options.success(_.first(docs), options);
  });
};

var Collection = {
  read: function (coll, options) {
    var store = getStore(coll);
    return store.find({}, function (err, docs) {
      if (err)
        return options.error(err, options);
      options.success(docs, options);
    });
  }
};

var NeDBModel = Backbone.Model.extend({
  idAttribute: "_id",
  sync: function (method, model, options) {
    return Model[method](model, options);
  }
});

var NeDBCollection = Backbone.Collection.extend({
  sync: function (method, coll, options) {
    return Collection[method].call(null, coll, options);
  },
  model: Model
});

module.exports.Model = NeDBModel;
module.exports.Collection = NeDBCollection;
