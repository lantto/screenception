var canvas = document.getElementById('game'),
    offscreen = document.getElementById('offscreen'),
    offscreenCtx = offscreen.getContext('2d'),
    gameWrapper = document.getElementById('game-wrapper'),
    health = document.getElementById('health'),
    jumps = document.getElementById('jumps'),
    goal = document.getElementById('goal'),
    gameOver = document.getElementById('game-over'),
    success = document.getElementById('success'),
    start = document.getElementById('start');

var Screen = (function() {
    function Screen(x, y, direction, speed) {
        veld.Entity.apply(this, arguments);
        
        this.bg = 'screen.gif';
        this.frame = 'frame.png';
        this.width = 480;
        this.height = 270;
        
        this.speed = 0;
    }

    Screen.prototype = Object.create(veld.Entity.prototype);
    
    Screen.prototype.update = function(dt) {
        this.x = veld.mouse.x/2;
        this.y = veld.mouse.y/2;
        
        veld.Entity.prototype.update.call(this, dt);
    }
    
    Screen.prototype.render = function(ctx) {
        var x = this.x,
            y = this.y,
            self = this;
        
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > 480) x = 480;
        if (y > 270) y = 270;

        offscreenCtx.drawImage(canvas, 0, 0);
        
        if (game.layer === 1) {
            ctx.drawImage(veld.resources.get('antimatter' + currentLevel.antimatter + '_1.png'), matters[target.id].x, matters[target.id].y);
        }

        offscreenCtx.drawImage(veld.resources.get(this.frame), x-2, y-2);
        ctx.drawImage(veld.resources.get(this.frame), x-2, y-2);
        
        offscreenCtx.drawImage(veld.resources.get(this.bg), x, y);
        ctx.drawImage(veld.resources.get(this.bg), x, y);
        
        ctx.save();
        ctx.scale(0.5, 0.5);
        ctx.translate(x, y);
        ctx.drawImage(offscreen, x, y);
        
        if (game.layer === 2) {
            ctx.drawImage(veld.resources.get('antimatter' + currentLevel.antimatter + '_2.png'), x+matters[target.id].x-4, y+matters[target.id].y-4);
        }
        
        ctx.restore();
        
        ctx.save();
        ctx.scale(0.25, 0.25);
        ctx.translate(x*5, y*5);
        ctx.drawImage(offscreen, x, y);
        
        if (game.layer === 3) {
            ctx.drawImage(veld.resources.get('antimatter' + currentLevel.antimatter + '_3.png'), x+matters[target.id].x-8, y+matters[target.id].y-8);
        }
        
        ctx.restore();
        
        ctx.save();
        ctx.scale(0.125, 0.125);
        ctx.translate(x*13, y*13);
        ctx.drawImage(offscreen, x, y);
        
        if (game.layer === 4) {
            ctx.drawImage(veld.resources.get('antimatter' + currentLevel.antimatter + '_4.png'), x+matters[target.id].x-12, y+matters[target.id].y-12);
        }
        
        ctx.restore();

        ctx.save();
        ctx.scale(0.0625, 0.0625);
        ctx.translate(x*29, y*29);
        ctx.drawImage(offscreen, x, y);
        ctx.restore();
        
        ctx.save();
        ctx.scale(0.03125, 0.03125);
        ctx.translate(x*61, y*61);
        ctx.drawImage(canvas, x, y);
        ctx.restore();
    }

    return Screen;
})();

var Matter = (function() {
    function Matter(x, y, direction, speed, state) {
        veld.Entity.apply(this, arguments);

        this.sprite = 'matter' + currentLevel.matter + '.png';
        this.width = 16;
        this.height = 16;
        
        this.state = 'matter';
        this.target = false;
    }

    Matter.prototype = Object.create(veld.Entity.prototype);
    
    Matter.prototype.update = function(dt) {
        if (this.target) {
            if (this.collidesWith(screenEnt)) {
                if (game.lastHit) {
                    game.health -= Date.now() - game.lastHit;
                    
                    if (game.health < 1000) {
                        health.style.color = '#FA0000';
                    }
                    
                    health.innerHTML = game.health;
                }
                
                game.lastHit = Date.now();
            } else {
                game.lastHit = null;
            }
        }

        veld.Entity.prototype.update.call(this, dt);
    }

    return Matter;
})();

veld.resources.load([
    'screen.gif',
    'bg1.png',
    'bg2.png',
    'bg3.png',
    'matter1.png',
    'matter2.png',
    'matter3.png',
    'antimatter1_1.png',
    'antimatter1_2.png',
    'antimatter1_3.png',
    'antimatter1_4.png',
    'antimatter2_1.png',
    'antimatter2_2.png',
    'antimatter2_3.png',
    'antimatter2_4.png',
    'antimatter3_1.png',
    'antimatter3_2.png',
    'antimatter3_3.png',
    'antimatter3_4.png',
    'frame.png'
]);

var screenEnt,
    matters = [];

var target = {
    id: null
};

var game = {
    health: null,
    roundStart: null,
    lastHit: null,
    layer: 1,
    level: 0,
    round: 1
}

var Level = function(level, color, roundTime, goal, maxHealth, bg, matter, antimatter, jumpType, speed, few) {
    this.level = level;
    this.color = color;
    this.roundTime = roundTime;
    this.goal = goal;
    this.maxHealth = maxHealth;
    this.bg = bg;
    this.matter = matter;
    this.antimatter = antimatter;
    this.jumpType = jumpType;
    this.speed = speed;
    this.few = few;
}

var levels = [];
levels.push(new Level(1, '#01c4fe', 3000, 20, 6000, 1, 1, 1, 'random', 20));
levels.push(new Level(2, '#bd5901', 3000, 10, 2000, 2, 2, 3, 'random', 100, true));
levels.push(new Level(3, '#a54cf8', 50, 1000, 7000, 3, 3, 2, 'increment', 15, true));

var currentLevel,
    lethal = false;

if (window.location.hash && [1, 2, 3].indexOf(window.location.hash)) {
    gameWrapper.style.display = 'block';

    currentLevel = levels[window.location.hash.substring(1)-1];
    
    health.style.color = currentLevel.color;
    
    game.health = currentLevel.maxHealth;
    goal.innerHTML = currentLevel.goal;
    jumps.innerHTML = game.round;
    
    veld.init(
        'game', 
        function() {
            if (currentLevel.few) {
                for (var i = 0; i < 36; i++) {
                    matters.push(veld.addEntity(new Matter(472, 262, (i+1)*10, currentLevel.speed)));
                }
            } else {
                for (var i = 0; i < 360; i++) {
                    matters.push(veld.addEntity(new Matter(472, 262, (i+1)/**10*/, currentLevel.speed)));
                }
            }

            if (currentLevel.jumpType === 'random') {
                var matterIndex = veld.utils.random(0, matters.length-1);
                 game.layer = veld.utils.random(1, 4);
            } else if (currentLevel.jumpType === 'increment') {
                var matterIndex = 0;
            }

            target.id = matterIndex;
            
            matters[matterIndex].target = true;
            
            roundStart = Date.now();
            
            screenEnt = veld.addEntity(new Screen(240, 135, veld.utils.random(1, 360), 0));
        },
        function () {
            if (roundStart < Date.now() - currentLevel.roundTime) {
                game.round++;
            
                if (game.round === currentLevel.goal) {
                    veld.end(function() {
                        gameWrapper.style.display = 'none';
                        success.style.display = 'block';
                    });
                }
            
                matters[target.id].target = false;
                
                if (currentLevel.jumpType === 'random') {
                    var matterIndex = veld.utils.random(0, matters.length-1);
                    game.layer = veld.utils.random(1, 4);
                } else if (currentLevel.jumpType === 'increment') {

                    var matterIndex = target.id + 1;
                
                    if (matterIndex === 36) {
                        game.layer++;
                        if (game.layer > 4) {
                            game.layer = 1;
                        }
                        matterIndex = 0;
                    }
                }
                
                
                target.id = matterIndex;
                
                matters[matterIndex].target = true;
                
                roundStart = Date.now();

                jumps.innerHTML = game.round;
            }
            
            if (game.health <= 0) {
                veld.end(function() {
                    gameWrapper.style.display = 'none';
                    gameOver.style.display = 'block';
                });
            }
        },
        'bg' + window.location.hash.substring(1) + '.png',
        null,
        null,
        {mouseTarget: window}
    );
} else {
    start.style.display = 'block';
}