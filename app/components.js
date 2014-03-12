head_configs = {
	messi : {
		sprite : 'SpriteMessi'
	},
	neymar : {
		sprite : 'SpriteNeymar'
	},
};

body_configs = {
	yellow : {
		sprite : 'SpriteYellow',
		frames : [[3,0], [4,0], [5,0], [4,0]]
	},
	blue : {
		sprite : 'SpriteBlue',
		frames : [[0,0], [1,0], [2,0], [1,0]]
	},
};
GameConfigs= {
		player_horizontal_speed_per_second : 3,
		player_vertical_speed_per_frame : 100,
		hazard_generate_interval : 2500
};
GameDepth = {
		field : 0,
		body : 1,
		head : 2,
		ball : 3,
		obstacle : 1
}
// An "Actor" is an entity that is drawn in 2D on canvas
Crafty.c('Actor', {
	init: function() {
		this.requires('2D, Canvas');
	},
});

Crafty.c('DebugCollision', {
	init: function() {
		this.requires('DebugCanvas, WiredHitBox');
	},
});

Crafty.c('Body', {
	init: function() {
	},
	
	Body: function(bodyConfig) {
		this.requires('Actor, SpriteAnimation, ' + bodyConfig.sprite)
		    .reel('Run', 550, bodyConfig.frames);
		this.animate('Run', -1);
		return this;
	}
});

Crafty.c('Avatar', {
	init: function() {
		this.requires('Actor, Collision');
	},

	headJitter : 3,

	ballOffsetXLeft : -5,
	ballOffsetXRight : 45,
	ballOffsetY : 80,
	ballSpinSpeed : 0.3,

	width : function() {
		return this.body._w;
	},
	
	height : function() {
		return this.body._h;
	},

	onEnterFrame : function(data) {
		if (this.ball)
		{
			this.ball.rotation += this.ballSpinSpeed * data.dt * (this.facingLeft ? -1 : 1);
		}
	},
	
	Avatar: function(headConfig, bodyConfig, withBall) {
		var self = this;

		self.head = Crafty.e('Actor, ' + headConfig.sprite).attr({w : 75, h : 75, z : GameDepth.head});
		self.body = Crafty.e('Body').Body(bodyConfig).attr({w : 75, h : 128, z : GameDepth.body});
		self.attach(self.head);
		self.attach(self.body);

		if (withBall)
		{
			self.ball = Crafty.e('Actor, Tween, SpriteBall').attr(
				{ x : self.ballOffsetXLeft,
				  y : self.ballOffsetY,
				  z : GameDepth.ball
				});
			self.ball.origin('center');
			self.attach(self.ball);
		}

		self.body.bind('FrameChange', function(data) {
			if (data.currentFrame == 1 || data.currentFrame == 3)
			{
				self.head.attr({x : self.body._x, y: self.body._y + self.headJitter});
			}
			else
			{
				self.head.attr({x : self.body._x, y: self.body._y});
			}
		});
		
		self.bind('EnterFrame', self.onEnterFrame);
		self.facingLeft = true;
	
		// set collision area
		self.collision( new Crafty.polygon(
							[20,10], 
							[this.body._w - 20, 10], 
							[this.body._w - 20, this.body._h - 10], 
							[20, this.body._h - 10]) );

		return self;
	},

	faceLeft: function() {
		this.body.unflip('X');
		this.head.unflip('X');
		if (this.ball)
		{
			this.ball.x = this.x + this.ballOffsetXLeft;
		}
		this.facingLeft = true;
	},

	faceRight: function() {
		this.body.flip('X');
		this.head.flip('X');
		if (this.ball)
		{
			this.ball.x = this.x + this.ballOffsetXRight;
		}
		this.facingLeft = false;
	},

	pauseAnim: function() {
		this.body.pauseAnimation();
	}
});

// This is the player-controlled character
Crafty.c('PlayerController', {
	init: function() {
		this.requires('Avatar, Twoway, Collision, DebugCollision')
		    .Avatar(head_configs.messi, body_configs.blue, true)
			.twoway(GameConfigs.player_horizontal_speed_per_second, 0)
			.onHit('Obstacle', this.hitObstacle)
			.onHit('Amateur', this.hitObstacle);

		this.bind('NewDirection', function(data) {
			if (data.x > 0) {
				this.faceRight();
			} else if (data.x < 0) {
				this.faceLeft();
			} else {
			}
		});

		this.bind('EnterFrame', function(data) {
			if (this._x < 0) {
				this.x = 0;
			} else if (this._x > 800 - this.width()) {
				this.x = 800 - this.width();
			}
		});
	},

	// Stops the movement
	stopMovement: function() {
		this._speed = 0;
		if (this._movement) {
			this.x -= this._movement.x;
			this.y -= this._movement.y;
		}
	},

	hitObstacle: function(data) {
		var obstacle = data[0].obj;
		obstacle.onPlayerHit();
	}
});

Crafty.c('Obstacle', {
	speed: GameConfigs.player_vertical_speed_per_frame,

	width: function() {
		return this._w;
	},

	height: function() {
		return this._h;
	},

	init: function() {
		this.requires('Actor, SpriteObstacle, Collision, DebugCollision')
			.collision( new Crafty.polygon([10, 40], [65, 40], [65,77.5], [10,77.5]) )
		    .attr({ w: 75, h: 77.5 });
	},

	update: function(player, deltaTime) {
		this.y += this.speed * deltaTime;
	},

	onPlayerHit: function() {
		this.destroy();
		Crafty.scene('Over');
	}
});

Crafty.c('Amateur', {
	speed: GameConfigs.player_vertical_speed_per_frame,

	init: function() {
		this.requires('Avatar, DebugCollision');
	},

	Amateur : function(headConfig, bodyConfig) {
		this.Avatar(headConfig, bodyConfig, false);
		var seed = Math.floor(Crafty.math.randomNumber(0, 100));
		if (seed % 2 == 0)
		{
			this.faceRight();
		}
		return this;
	},

	update: function(player, deltaTime) {
		this.y += this.speed * deltaTime;
	},

	onPlayerHit: function() {
		this.destroy();
		Crafty.scene('Over');
	}
});

Crafty.c('WorldClass', {
	speed: GameConfigs.player_vertical_speed_per_frame,

	init: function() {
		this.requires('Actor');
	},

	update: function(player) {
		this.y += this.speed * deltaTime;
	},

	onPlayerHit: function() {
		this.destroy();
		Crafty.scene('Over');
	}
});

Crafty.c('Field', {
	tileWidth  : 80,

	tileHeight : 145,

	moveSpeed : 5,

	init: function() {
		var self = this;

		self.requires('Actor');

		self.group1 = Crafty.e('Actor');
		self.group2 = Crafty.e('Actor');

		for (var i = 0; i < 8; i++)
		{
			var group = i < 4 ? self.group1 : self.group2;

			for (var j = 0; j < 5; j++)
			{
				var tile = Crafty.e('Actor, SpriteGrass').attr(
							   { w : self.tileWidth, 
								 h : self.tileHeight, 
								 x : j * self.tileWidth, 
								 y : (i % 4) * self.tileHeight,
								 z : GameDepth.field });
				group.attach(tile);
			}
		}

		self.group2.y = this.group1.y - self.tileHeight * 4;

		self.bind('EnterFrame', function(data) {
			var delta = GameConfigs.player_vertical_speed_per_frame * data.dt / 1000;
			this.group1.y += delta;
			this.group2.y += delta;
			if (this.group1.y > 600)
			{
				self.group1.y = this.group2.y - self.tileHeight * 4;
			}
			else if (this.group2.y > 600)
			{
				self.group2.y = this.group1.y - self.tileHeight * 4;
			}
		});
	},
});
