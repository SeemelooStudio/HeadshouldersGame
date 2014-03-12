define(["jquery", "backbone", "crafty", "components"],
    function ($, Backbone) {
        var GameView = Backbone.View.extend({
            // The DOM Element associated with this view
            el: "#main",
            // View constructor
            initialize: function (options) {
                Crafty.init(this.model.get('width'), this.model.get('height'), this.$el[0]);
                this.initLoadingScene();
                this.initGameScene();
                Crafty.background('rgb(87, 109, 20)');

        		Crafty.scene('Loading');


            },
            // View Event Handlers
            events: {
                
            },
            render: function() {
                
            },
            initLoadingScene: function(){
                var self = this;
                
                Crafty.scene('Loading', function(){
                	// Draw some text for the player to see in case the file
                	//  takes a noticeable amount of time to load
                	Crafty.e('2D, DOM, Text')
                		.text('Loading; please wait...')
                		.attr({ x: 0, y: self.model.get("height")/2 - 24, w: self.model.get("width") });
                
                	// Load our sprite map image
                	Crafty.load([
                		'app/img/obstacle.png',
                		'app/img/head.png',
                		'app/img/body.png',
                		'app/img/ball.png',
                		'app/img/grass.png',
                		], function(){
                		// Once the images are loaded...
                
                		Crafty.sprite(150, 155, 'app/img/obstacle.png', {
                			SpriteObstacle:    [0, 0],
                		});
                
                		Crafty.sprite(150, 'app/img/head.png', {
                			SpriteMessi:	[1, 0],
                			SpriteNeymar:   [0, 0],
                		});
                
                		Crafty.sprite(150, 256, 'app/img/body.png', {
                			SpriteBlue:	    [1, 0],
                			SpriteYellow:   [4, 0],
                		});
                
                		Crafty.sprite(80, 145, 'app/img/grass.png', {
                			SpriteGrass:    [0, 0],
                		});
                
                		Crafty.sprite(35, 'app/img/ball.png', {
                			SpriteBall:     [0, 0],
                		});
                		
                        Crafty.scene('Game');
                	});
                });
            },
            initGameScene: function() {
                var that = this;
                
                // Runs the core gameplay loop
                Crafty.scene('Game', function() {
                	var self = this;
                
                	self.hazards = [];
                	self.toBeRemoved = [];
                
                	self.generateHazard = function() {
                		var seed = Math.floor(Crafty.math.randomNumber(0, 100));
                		var hazard;
                		if (seed % 3 != 0)
                		{
                			hazard = Crafty.e('Obstacle');
                		}
                		else
                		{
                			hazard = Crafty.e('Amateur').Amateur(head_configs.neymar, body_configs.yellow);
                		}
                		hazard.attr({x : Crafty.math.randomNumber(0, that.model.get("width") - hazard.width()), y : -50});
                		self.hazards.push(hazard);
                	};
                
                	self.destroyHazardsOffScreen = function() {
                		for (var i = 0; i < self.hazards.length; i++)
                		{
                			var hazard = self.hazards[i];	
                			if (hazard._y > that.model.get("height"))
                			{
                				self.toBeRemoved.push(hazard);
                			}
                		}
                		for (var i = 0; i < self.toBeRemoved.length; i++)
                		{
                			var index = self.hazards.indexOf(self.toBeRemoved[i]);
                			if (i != -1)
                			{
                				self.hazards.splice(i, 1);
                			}
                			self.toBeRemoved[i].destroy();
                		}
                		self.toBeRemoved = [];
                	};
                
                	self.destroyAllHazards = function() {
                		for (var i = 0; i < self.hazards.lenght; i++)
                		{
                			self.hazards[i].destroy();
                		}
                		self.hazards = [];
                	};
                
                	self.onEnterFrame = function(data) {
                		self.destroyHazardsOffScreen();
                
                		for( var i = 0; i < self.hazards.length; i++)
                		{
                			self.hazards[i].update(self.player, data.dt / 1000);
                		}
                	};
                
                	self.player = Crafty.e('PlayerController');
                	self.player.attr({ x : that.model.get("width") / 2 - self.player.width() / 2, y : that.model.get("height") - self.player.height() });
                
                	self.field = Crafty.e('Field');
                
                	self.generateHazardRoutine = setInterval(self.generateHazard, that.model.get("configs").hazard_generate_interval);
                	self.bind('EnterFrame', self.onEnterFrame);
                
                }, function() { 
                	var self = this;
                
                	clearInterval(self.generateHazardRoutine);
                	self.destroyAllHazards();
                	self.unbind('EnterFrame', self.onEnterFrame);
                });                
            }
        });
        // Returns the View class
        return GameView;
    }
);