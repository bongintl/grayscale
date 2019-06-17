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