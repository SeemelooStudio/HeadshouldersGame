// Game.js

define(["jquery", "backbone"],

    function ($, Backbone) {
        var Game = Backbone.Model.extend({
            defaults: {
            'width': 600,
            'height': 400,
            "depth": {
        		field : 0,
        		body : 1,
        		head : 2,
        		ball : 3,
        		obstacle : 1
            },
            "configs": {
        		player_horizontal_speed_per_second : 3,
        		player_vertical_speed_per_frame : 100,
        		hazard_generate_interval : 2500,
        	}
            }
        });

        return Game;
    }

);