(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LineLayer = require('./lineLayer');
var MaskedImage = require('./maskedImage');

function getZIndex( element ) {
    
    var z = getComputedStyle( element ).zIndex;
    
    return z === 'auto' ? 0 : Number( z );
    
}

var tests = {
    
    rtl: progress => {
        
        var invProgress = 1 - progress;
        var edge = Math.floor( window.innerWidth * invProgress );
        
        return {
            draw: ( v, x, y ) => x > edge,
            edge: ( v, x, y ) => x > edge && x < edge + 3
        }
        
    }
    
}

module.exports = function() {
    
    var lineLayer = new LineLayer();
    
    var elements = [ ...document.querySelectorAll('.line-img') ];
    
    elements = elements.sort( (e1, e2) => {
        
        var z1 = getZIndex( e1 );
        var z2 = getZIndex( e2 );
        
        if ( z1 === z2 ) return 0;
        if ( z1 > z2 ) return 1;
        return -1;
        
    });
    
    var defs = elements.map( e => {
        
        var animation = e.getAttribute( 'data-animation' ) || 'rtl';
        
        return {
            mask: new MaskedImage( e ),
            test: tests[ animation ],
            delay: Number( e.getAttribute( 'data-delay' ) ) || 0,
            duration: Number( e.getAttribute( 'data-duration' ) ) || 20000,
        }
        
    });
    
    function load () {
        
        return Promise.all( defs.map( d => d.mask.load() ) );
        
    }
    
    function start () {
        
        var now = Date.now();
        
        defs.forEach( def => {
            
            def.startTime = now + def.delay;
            def.endTime = def.startTime + def.duration;
            
        })
        
        tick();
        
    }
    
    function tick () {
        
        lineLayer.clear();
        
        var now = Date.now();
        
        defs.forEach( def => {
            
            //if ( now < def.startTime || now > def.endTime ) return;
            
            var progress = ( now - def.startTime ) / def.duration;
            
            var test = def.test( progress );
            
            var changed = def.mask.draw( test );
            
            for ( var v in changed ) {
                
                lineLayer.drawArray( v, changed[ v ] );
                
            }
            
        })
        
        requestAnimationFrame( tick );
        
    }
    
    load().then( start );
    
}
},{"./lineLayer":3,"./maskedImage":5}],2:[function(require,module,exports){
module.exports = {
    GRADIENT_WIDTH: 15
}
},{}],3:[function(require,module,exports){
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
},{"./config":2}],4:[function(require,module,exports){
require('./animate')();

// var { GRADIENT_WIDTH } = require('./config');
// var DPR = 1;//window.devicePixelRatio || 1;

// var LineLayer = require('./lineLayer');
// var MaskedImage = require('./maskedImage');

// var lineLayer = new LineLayer();

// var mi = new MaskedImage( document.querySelector('.line-img') )

// function wait ( duration ) {
    
//     return new Promise( resolve => {
        
//         setTimeout( resolve, duration );
        
//     })
    
// }

// function drawIn () {
    
//     return new Promise( resolve => {
        
//         var max = window.innerWidth;
        
//         var test = (v, x, y) => x > max;
        
//         var tick = () => {
            
//             if ( max >= -5 ) {
//                 requestAnimationFrame( tick );
//             } else {
//                 resolve();
//             }
            
//             var changed = mi.draw( test, 255 );
            
//             max -= 1;
            
//             lineLayer.clear();
            
//             for ( var v in changed ) {
                
//                 lineLayer.drawArray( v, changed[ v ] );
                
//             }
            
//         }
        
//         tick();
        
//     });
    
// }

// Promise.all([
//     mi.load(),
//     wait( 1000 )
// ]).then( drawIn );
},{"./animate":1}],5:[function(require,module,exports){
var DPR = 1;//window.devicePixelRatio || 1;

module.exports = class MaskedImage {
    
    constructor ( element ) {
        
        this.element = element;
        this.src = element.getAttribute('data-src');
        
        this.canvas = document.createElement( 'canvas' );
        this.ctx = this.canvas.getContext( '2d' );
        this.canvas.classList.add( 'image-mask' );
        this.element.appendChild( this.canvas );
        
        this.loaded = false;
        
        this.image = null;
        this.imageCanvas = document.createElement( 'canvas' );
        this.imageCtx = this.imageCanvas.getContext( '2d' );
        this.imageData = null;
        this.imageAlpha = null;
        
        this.height = 0;
        this.width = 0;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imageScale = 1;
        
        window.addEventListener( 'resize', this.onResize.bind(this) );
        
    }
    
    load () {
        
        return new Promise( resolve => {
            
            var i = new Image();
            
            i.onload = () => resolve( i );
            
            i.src = this.src;
            
        }).then( img => {
            
            this.image = img;
            this.imageWidth = img.width;
            this.imageHeight = img.height;
            this.loaded = true;
            this.onResize();
            
        })
        
    }
    
    onResize () {
        
        if ( !this.loaded ) return;
        
        var w = this.element.clientWidth * DPR;
        var h = this.element.clientHeight * DPR;
        
        this.width = this.canvas.width = this.imageCanvas.width = w;
        this.height = this.canvas.height = this.imageCanvas.height = h;
        
        var scale = Math.max( this.width / this.imageWidth, this.height / this.imageHeight );
        
        var sw = this.imageWidth * scale;
        var sh = this.imageHeight * scale;
        
        var top = ( this.height - sh ) / 2;
        var left = ( this.width - sw ) / 2;
        
        this.imageCtx.drawImage( this.image, left, top, sw, sh );
        
        this.imageData = this.imageCtx.getImageData( 0, 0, this.width, this.height );
        
        this.imageAlpha = new Uint8Array( this.imageData.data.length / 4 );
        
        for ( var i = 3; i < this.imageData.data.length; i += 4 ) {
            
            this.imageAlpha[ ( i - 3 ) / 4 ] = this.imageData.data[ i ];
            
            this.imageData.data[ i ] = 0;
            
        }
        
        this.x = this.element.offsetLeft;
        this.y = this.element.offsetTop;
        
    }
    
    draw ( test ) {
        
        var pixels = this.imageData.data;
        var l = pixels.length;
        
        var changed = {};
        
        var value, alpha, x, y, srcAlpha, toAlpha, isEdge;
        
        for ( var i = 3; i < l; i += 4 ) {
            
            alpha = pixels[ i ];
            value = pixels[ i - 1 ];
            
            x = ( ( (i - 3) / 4 ) % this.width ) + this.x;
            y = ( Math.floor( ( i / 4 ) / this.width ) ) + this.y;
            
            srcAlpha = this.imageAlpha[ (i - 3) / 4 ];
            toAlpha = test.draw( value, x, y ) ? srcAlpha : 0;
            
            if ( alpha !== toAlpha ) {
                
                pixels[ i ] = toAlpha;
                
            }
            
            if ( toAlpha > 0 && test.edge( value, x, y ) ) {
                
                if ( !(value in changed) ) changed[ value ] = [];
                
                changed[ value ].push( x, y );
                
            }
            
        }
        
        this.ctx.putImageData( this.imageData, 0, 0 );
        
        return changed;
        
    }
    
}
},{}]},{},[4]);
