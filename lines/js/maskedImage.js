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