define(function(require, exports, module) {
  "use strict";

  // External dependencies.
  var Backbone = require("backbone");
  var BackboneTouch = require("backbonetouch");
  
  require("crafty");
  
  var Game = require("models/Game");
  var GameView = require("views/GameView");
  
  var game;
  var gameView;
  

  // Defining the application router.
  module.exports = Backbone.Router.extend({
    initialize: function() {
        game = new Game();
        gameView = new GameView({ model:game });
    },
    routes: {
      "": "index"
    },

    index: function() {
      console.log("Welcome to your / route.");
      gameView.render();
    }
  });
});
