define(["jquery", "backbone"],
    function (jQuery, Backbone) {
        var AnimationScheduler = Backbone.View.extend({
        	objects: null,
        	
        	triggerClass: "animated",
        	defaultEntrance: "fadeIn",
        	defaultExit: "fadeOut",
        	
        	hideClass:"hidden",
        	hideAtFirst: true,
        	
        	isSequential:false,
        	sequentialDelay:500,
        	
            initialize: function (objects, options) {
                var self = this;
                if ( options ) {
                    this.setOptions(options);
                }
                
                if ( objects && objects.size() > 0 ) {
                    self.objects = objects;
                    self.initObjects();
                }
                
            },
            hasObjects: function() {
                return ( this.objects && this.objects.size() > 0);
            },
            setOptions: function(options) {
                for(var key in options) {
                    this[key] = options[key];
                }               
            },
            setObjectDelay: function(object, delay) {
                var delayValue = delay + "ms";
                
                jQuery(object).css({
                    "-webkit-animation-delay": delayValue,
                    "-ms-animation-delay": delayValue,
                    "-moz-animation-delay": delayValue,
                    "-o-animation-delay":delayValue,
                    "animation-delay": delayValue
                })
            },
            initObjects: function () {
                var self = this;
                var delay = 0;
                if ( !self.hasObjects() ) {
                    return;
                }
                self.objects.each(function() {
                    jQuery(this).removeClass(self.triggerClass);
                    
                    if ( self.isSequential) {
                        self.setObjectDelay(this, delay);
                        delay += self.sequentialDelay;
                    }
                    
                    if ( self.hideAtFirst ) {
                        jQuery(this).addClass(self.hideClass);
                    }
                });
        
            },
            animateIn: function (postAnimateIn) {
                var self = this;
                if ( !self.hasObjects() ) {
                    return;
                }
                var objectsCount = self.objects.size();
                
                self.objects.each(function() {
                
                    //get animation type
                    var animationType = jQuery(this).attr("data-entranceAnimation");
                    if ( !animationType ) {
                        animationType = self.defaultEntrance;
                    }
                    
                    //invoke postAnimateOut when all animations are finished
                    jQuery(this).one('webkitAnimationEnd mozAnimationEnd oAnimationEnd msAnimationEnd animationEnd animationend', function(e){
                        objectsCount--;
                        jQuery(this).removeClass(self.triggerClass).removeClass(animationType);
                        
                        if ( 0 == objectsCount ) {
                            if ( postAnimateIn ) {
                                postAnimateIn();
                            }
                        }
                    });
                    
                    jQuery(this).addClass(self.triggerClass +  " " + animationType).removeClass(self.hideClass);
                });
                
        
            },
            animateOut: function (postAnimateOut) {
                var self = this;

                if ( !self.hasObjects() ) {
                    return;
                }
                var objectsCount = self.objects.size();
                
                self.objects.each(function() {
                
                    //get animation type
                    var animationType = jQuery(this).attr("data-exitAnimation");
                    if ( !animationType ) {
                        animationType = self.defaultExit;
                    }
                    
                    //invoke postAnimateOut when all animations are finished
                    jQuery(this).one('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd animationend msAnimationEnd', function(e){
                        objectsCount--;
                        jQuery(this).removeClass(self.triggerClass).removeClass(animationType);
                        jQuery(this).addClass(self.hideClass);
                        if ( 0 == objectsCount ) {
                            if ( postAnimateOut ) {
                                postAnimateOut();
                            }
                        }
                    });
                    
                    jQuery(this).addClass(self.triggerClass +  " " + animationType);
                });

        
            }
        });
        return AnimationScheduler;
    }
);