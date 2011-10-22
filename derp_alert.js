/*
Copyright © 2011 Andy Fraley (andrew.fraley@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

windowload = function() { 
var paper = new Raphael(document.getElementById('game'), 1000, 1000);
var events = new Array();
var main_radius = 350;
var cx = 500;
var cy = 500;
var dividers = 20;
var center_circle = paper.circle(cx, cy, 40).attr({fill: 'black'});
var circle_fill = paper.circle(cx, cy, main_radius).attr({fill: 'r#000-#000099'});
var player_color = 'red';
var player_stroke = '#FF0033';
var game_over = false;
var circle_stroke = '#0000ff';
var enemy_count = 10;
var game_over_drawn = false;

var segment_obj = function(start_time, end_time) {
	r = main_radius;
	var angle= 360 / dividers;
	start_rad = Raphael.rad(angle * start_time);
	end_rad = Raphael.rad(angle * end_time);

	x1 = cx + r * Math.sin(start_rad);          
	y1 = cy - r * Math.cos(start_rad);
	x2 = cx + r * Math.sin(end_rad);
	y2 = cy - r * Math.cos(end_rad);
	var big = 0;
     if (end_rad - start_rad > Math.PI) big = 1;
     var path = "M " + cx + "," + cy +  // Start at circle center
            " L " + x1 + "," + y1 +     // Draw line to (x1,y1)
            " A " + r + "," + r +       // Draw an arc of radius r
            " 0 " + big + " 1 " +       // Arc details...
            x2 + "," + y2 +             // Arc goes to to (x2,y2)
            " Z";            
	
	//path for center of segment
	this.center_rad = Raphael.rad(angle * (((end_time - start_time) / 2) + start_time));
	this.center_end_x = cx + (r + 50) * Math.sin(this.center_rad);
	this.center_end_y = cy - (r + 50) * Math.cos(this.center_rad);
	this.player_x = cx + (r + 93) * Math.sin(this.center_rad);
	this.player_y = cy - (r + 93) * Math.cos(this.center_rad);
	this.drawing = paper.path(path);
	this.drawing.attr({stroke: '#0000ff', 'stroke-width': 2});
}
segments = new Array();
// Draw the lines twice to get the cool neon type effect
for (y = 1; y <= 2; y++) {
	for (x = 1; x <= dividers * y; x++) {
			 segments[x] = new segment_obj(x, x+1);
	}
}

//Drawstuff
//Idea: Check to see how many things are on the board, spawn a new draw_thing if there are not enough
//Adjust number and speed per level
draw_thing = function() {
	if (!game_over) {
		var timer = Math.floor(Math.random()*10000+100)
		var i = Math.floor(Math.random()*dividers+1)
		var thing = paper.ellipse(cx, cy, 1, 2).attr({fill: 'green'});
		thing.rotate(Raphael.deg(segments[i].center_rad));
		thing.animate({cx: segments[i].center_end_x, cy:segments[i].center_end_y, scale: 50}, timer, "<", function () {	thing.end(i); draw_thing();});																																						
		thing.end = function(i) { //Remove the object.  If the object is on the same segment as the player, the player is killed
				if (player.segment == i) {
					paper.remove();
					game_over = true;
				}
				thing.remove();
		} // END thing.end
	}// END IF GAME OVER
}// END draw_thing




// Draw player
//
var player_obj = function () {
	this.segment = 1;
	var path = "m " + segments[this.segment].player_x + " " +   segments[this.segment].player_y + "  5,0 30,40 -5,30 -5,-30 -20,-20 -10,0 -20,20 -5,30 -5,-30 30,-40 z";
	this.drawing = paper.path(path).attr({fill: player_color, stroke: player_stroke, 'stroke-width':5});
	this.drawing.toFront;
	this.drawing.scale(1.85, 1.85);
	this.drawing.rotate(Raphael.deg(segments[this.segment].center_rad), segments[this.segment].player_x, segments[this.segment].player_y);
	segments[this.segment].drawing.attr({stroke: player_color, 'stroke-width': '5'});
	
	this.move = function(direction) {
		if (direction == 1) {  // Clockwise
			segments[this.segment].drawing.attr({stroke: '#0000ff', 'stroke-width': '2'});
			if (this.segment == dividers) this.segment = 0;
			this.segment++;
		}
		
		if (direction == 2) { // Counter Clockwise
			segments[this.segment].drawing.attr({stroke: '#0000ff', 'stroke-width': '2'});
			if (this.segment == 1) this.segment = dividers;
			this.segment--;
		}
		segments[this.segment].drawing.attr({stroke: player_color, 'stroke-width': '5'});
		segments[this.segment].toBack;
		this.drawing.remove(); // Easier to just remove the object and redraw it then to try to move it. //////////////////////  Figure out how to move path objects to simplify.  
		var path =  "m " + segments[this.segment].player_x + " " +   segments[this.segment].player_y + "  5,0 30,40 -5,30 -5,-30 -20,-20 -10,0 -20,20 -5,30 -5,-30 30,-40 z";
		this.drawing.toFront;
		this.drawing = paper.path(path).attr({fill: player_color});
		this.drawing.scale(1.85, 1.85);
		this.drawing.rotate(Raphael.deg(segments[this.segment].center_rad), segments[this.segment].player_x, segments[this.segment].player_y);
	}
	
	this.fire = function () {
		var missle = paper.rect(segments[this.segment].center_end_x, segments[this.segment].center_end_y, 25, 25).attr({fill: player_color});
		missle.animate({x: cx, y: cy, scale: 0.1}, 2000, ">", missle.remove);
	}
}

center_circle.toFront();
var player = new player_obj;
addEventListener('keydown',function(e){if(e.keyCode==32){e.preventDefault(); player.fire();}},true);
addEventListener('keydown',function(e){if(e.keyCode==39){e.preventDefault(); player.move(1);}},true);
addEventListener('keydown',function(e){if(e.keyCode==37){e.preventDefault(); player.move(2);}},true);
for (z = 1; z<= enemy_count; z++) { // Spawn the enemies.  They will continuously respawn as their animations finish
	if (!game_over) {
		draw_thing();
	} else {
			draw_game_over();
			game_over_drawn = true;
			
	}
}

function draw_game_over() {
	var go_paper = new Raphael(document.getElementById('game'), 1000, 1000);
	var game_over_drawing = go_paper.text(500,500, "GAME OVER");
}

} // END WINDOW LOAD
window.onload = windowload;