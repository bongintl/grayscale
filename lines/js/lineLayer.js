var { GRADIENT_WIDTH } = require('./config');
var DPR = 1;//window.devicePixelRatio || 1;

module.exports = class LineLayer {
    
    constructor () {
        
        this.canvas = document.createElement( 'canvas' );
        this.ctx = this.canvas.getContext( '2d' );
        
        this.ctx.lineWidth = 1;
        
        this.canvas.classList.add('lines-layer');
        document.body.appendChild( this.canvas );
        
        this.onResize();
        window.addEventListener( 'resize', this.onResize.bind( this ) );
        
    }
    
    onResize () {
        
        this.canvas.width = window.innerWidth * DPR;
        this.canvas.height = window.innerHeight * DPR;
        
    }
    
    draw ( x, y, value ) {
        
        var color = `rgb( ${value}, ${value}, ${value} )`;
        
        this.ctx.strokeStyle = color;
        
        var fromX = 0;
        var fromY = this.canvas.height * ( value / 255 );
        
        var toX = x;
        var toY = y;
        
        this.ctx.beginPath();
        this.ctx.moveTo( fromX, fromY );
        this.ctx.lineTo( toX, toY );
        
        this.ctx.stroke();
        
    }
    
    line ( fromX, fromY, toX, toY ) {
        
        this.ctx.moveTo( fromX, fromY );
        this.ctx.lineTo( toX, toY );
        
    }
    
    arc ( fromX, fromY, toX, toY ) {
        
        var dx = toX - fromX;
        var dy = toY - fromY;
        
        var cx = fromX + dx / 2;
        var cy = fromY + dy / 2;
        
        var r = Math.sqrt( dx * dx + dy * dy ) / 2;
        
        var sAngle = Math.atan2( fromY - cy, fromX - cx );
        var eAngle = Math.atan2( toY - cy, toX - cx );
        
        this.ctx.arc( cx, cy, r, sAngle, eAngle );
        
    }
    
    drawArray ( value, xys ) {
        
        var color = `rgb( ${value}, ${value}, ${value} )`;
        
        this.ctx.strokeStyle = color;
        
        this.ctx.beginPath();
        
        var fromY = this.canvas.height * ( value / 255 );
        
        for ( var i = 0; i < xys.length; i += 2 ) {
            
            this.line( 0, fromY, xys[ i ], xys[ i + 1 ] );
            
        }
        
        this.ctx.stroke();
        
    }
    
    clear () {
        
        this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        
    }
    
}