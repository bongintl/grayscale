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