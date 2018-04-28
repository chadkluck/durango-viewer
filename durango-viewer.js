/*! DURANGO MEDIA VIEWER: VIEW DOC|CODE|LIC @ github.com/chadkluck/durango-viewer */
/*  ============================================================================================
    ********************************************************************************************
    	Durango Viewer (requires jQuery)
    ********************************************************************************************
	
	Chad Leigh Kluck (63Klabs)
	Version: 0.0.0-20170113-01
	github.com/chadkluck/durango-viewer
	
	Released under Creative Commons Attribution 4.0 International license (CC BY)
	https://creativecommons.org/licenses/by/4.0/
	
	The code, with its heavy use of comments, is provided as an educational resource in hopes
	that it can be useful in function and disection.
	Minifying and obvuscating for production environments is OK and, in fact, strongly encouraged 
	even if it removes attribution comments.
	
    ********************************************************************************************
	
	- Clean implementation (easy for site owner to implement and add content to HTML structure)
	- Degrades gracefully if noscript
	- Fully responsive
	- Works in modern browsers (IE, Edge, Firefox, Chrome, Safari)
	- UX focused
	- Accessibility compliant
	
	********************************************************************************************
	
	RESOURCES
	Accessibility:
	http://www.learningjquery.com/2010/04/accessible-showing-and-hiding
	http://webaim.org/techniques/css/invisiblecontent/
	https://developer.mozilla.org/en-US/docs/Web/Accessibility/
	
    ********************************************************************************************
	
	USAGE:



	********************************************************************************************
	
	ISSUES:
	// multiples of 320
	// also need to determine path
	// and 1 sec after resize, if resize differs by 320 reload
        // slideshow
        // responsive video and images


/*	============================================================================================
	********************************************************************************************
	GLOBAL VARIABLES 
	******************************************************************************************** 
*/

// Durango Viewer
if (typeof durangoVwr === 'undefined') { durangoVwr = false; } // let init take care of setting true



/*  ============================================================================================
    ********************************************************************************************
    Durango Viewer PLUGIN FUNCTION 
	********************************************************************************************
*/

(function( $ ) {
	
	//"use strict"; // reserved for "someday" once we overcome how to detect global init variable w/o using globals
	
/* *** Local variables *** */
	
	/* Script info */
	var version = "0.0.0-20170113-01"; // just a manual version number for debugging and preventing unneccessary hair pulling: "Is it loading the code I *thought* I uploaded?"
	var code    = "github.com/chadkluck/durango-viewer";
	var handle  = "DURANGO";
	var name    = "Durango Media Viewer";
	
	/* Settings (Read/Write) */
	var silent = false; // should debug() not output to console.log?
	
	var trackingData = { 
		GALLERY:{ category:"UI Interaction",
				  action:"DVWR UI (Gallery)",
				  label:"" /*defined by element*/
				},
		PREVIEW:{ category:"UI Interaction",
				  action:"DVWR Lightbox Open (Preview)",
				  label:"" /*defined by element*/
				},
		LINK:{    category:"UI Interaction",
				  action:"DVWR Lightbox Open (Link)",
				  label:"" /*defined by element*/
				}
		};
		
	var vars = {
		loaded: 0,
		counter: 0
	}
	
/* *** Local Functions *** */
	 
	/* =====================================================================
		debug()

		If not silenced, outputs text pased to it to console.log 
		
		Need a line number? In your code use debug(yourmessage + " - Line:"+ (new Error()).lineNumber );

		This function has a companion variable: silent
	*/
	var debug = function( text ) {
		
		// as long as we aren't silenced (silent === false)...
		if( !silent ) {
			var d = new Date();
			var ts = d.getHours() +":"+ d.getMinutes() +":"+ d.getSeconds() +"."+ d.getMilliseconds();
			console.log(handle+" ["+ts+"] : " + text);
		}
	};
	
	
	/* =====================================================================
		setSilence()
		
		If silenced, debug() won't send messages to console.log
	*/	
	var setSilence = function(silence){
		if( silence ) {
			debug("Silenced");
			silent = true;
		} else {
			silent = false;
			debug("Unsilenced");	
		}
	};

	/* =====================================================================
	 *  getGlobalInit() / setGlobalInit()
	 *
	 *  We do it here so these are the only functions not using strict
	 */	
	var getGlobalInit = function() {
		return durangoVwr;
	};
	
	var setGlobalInit = function(b) {
		durangoVwr = b === true ? true : false; // don't blindly accept what is passed
		return getGlobalInit();
	};
	
	
	var addLightBox = function (aElem, lboxId ) {
					// create the lightbox elements
			/* EXAMPLE: 
				<a class="image-light-box" id="imageLightBox_0" href="#_">
					<img src="" data-src="">
				</a>
			*/
			var lboxA = document.createElement("a"); // create the outer lightbox A tag
			$(lboxA).attr("href","#_").attr("id",lboxId).addClass("image-light-box"); // give the lightbox A tag the proper attributes (class, id, and href)
			var lboxImg = document.createElement("img"); // create the inner lightbox IMG tag
			$(lboxImg).attr("data-src",$(aElem).attr("href")); // set the lightbox IMG tag data-src attribute to the preview's link href (we don't do src because we want to lazy load)
			$(aElem).attr("href","#"+lboxId); // link to the lightbox and not the image directly
			
			// kind of like Inception, we are going to now wait to load the image until the user actually requests it
			// add onclick event to original image
			var downloadLightBoxImage = function() {
				var i = $(this).attr("href") + " img"; // id the associated lightbox
				$( i ).attr("src", $( i ).attr("data-src") );// move the data to the src to begin download - we don't do fancy stuff here because it is one image
				$(this).off("click",downloadLightBoxImage);// disassociate the onclick trigger 'cause we already downloaded the image and moved it to source, why create additional overhead?
				debug($(this).attr("id"));
			};
			
			/* We attach the download function to the lightbox element so that when it is clicked (the first time)
			the src is set thus initiating the download (otherwise if there were 100 images, the large format of all
			100 images would download, we only want them to download on demand.
			
			However, we also only need to do the onclick event once (set the source once) so we define a function (above)
			and then add it to the click event. This allows us to refer to the same function again and have it removed
			after it is triggered and done it's thing. There is a corresponding .off("click",downloadLightBoxImage)
			line that will remove this particular event
			*/
			$(aElem).on("click",downloadLightBoxImage);
			///$(aElem).on("click", function() { console.log("Still here");  });// TEST: Make sure this one is still there after downloadLightBoxImage event removal
			
			// Put the lightbox on the page, hidden and out of the way until use
			$(lboxImg).appendTo(lboxA); // put the lightbox IMG inside the lightbox A
			$(lboxA).appendTo("BODY"); // place it under the image-light div. could also say $(lboxA).insertAfter("#"+prevId+) but why retraverse the dom tree?
	};

/*  ============================================================================================
    ********************************************************************************************
		EXECUTION BLOCK
	********************************************************************************************
	  
		This is the code that executes when the script is loaded
		
	********************************************************************************************
*/		
	/* ** HOUSE KEEPING ** */
	
	// we are initializing, so now we'll set this to true
	setGlobalInit(true); 

	// let the devs know a little about the script in console.log
	debug("Loaded "+name+" ("+code+") [ver"+version+"]"); 
	
	/* ** JQUERY TRANSFORMATION TO IMPLEMENT MEDIA VIEWER ** */
	
	
	$("div.image-light").each( function() {
		
		// create the id tags
		var myPreviewId = "imageLight_"+vars.counter;
		var myLightBoxId = "imageLightBox_"+vars.counter;
		
		// set this element's id
		$(this).attr("id",myPreviewId);
		
		// create a reference to this element's child a tag
		var a = $(this).find("a");

		$(a).addClass("image-light-preview");
		
		// add analytics tracking info
		$(a).attr({ "data-category": trackingData["PREVIEW"]["category"], "data-action": trackingData["PREVIEW"]["action"], "data-label": $(a).attr("href") });
		
		// calculate a placeholder size, if no dimensions specified the css already says height is 50% of width
		var d = [];
		if ( typeof $(a).attr("data-src-dim") !== "undefined" ) {
			d = ( $(a).attr("data-src-dim") ).split(","); // data-src-dim given
		} else {
			d = [0,0]; // no data-src-dim given
		}
		
		// async image load code from http://blog.teamtreehouse.com/using-jquery-asynchronously-loading-image
		var img = document.createElement("img");
		var downloadingImage = document.createElement("img");
		
		// if dimensions are given, change from 50% (default) to proper ratio (this all relates to placeholder height and width in css)
		// we'll do it again (but with actual width) when the final image is loaded - just in case there is a mistake
		if( d[0] !== 0 ) {
			var responsiveHeight = (100 * d[1]) / d[0];
			debug(myPreviewId+" Initial Responsive Height "+responsiveHeight+"% (Calculated from data-src-dim)");
			$(this).css( {"padding-top": responsiveHeight+"%"} );
		} else {
			var hS = $(this).css("padding-top");
			var wP = $(this).width();
			var wGP = $(this).parent().width();
			var wPct = wP / wGP; // scale based on parent
			var responsiveHeight = wPct * 50; // default padding is 50%
			
			debug("\n"+myPreviewId+" Initial Responsive Height: (Calculated from default 50%)"
			            +"\n -Starting Height  : "+hS
						+"\n -Init Dimensions  : "+$(this).height()+"px / Width: "+$(this).width()+"px"
						+"\n -Parent Width     : "+wP+"px"
						+"\n -Grandparent Width: "+wGP+"px"
						+"\n -Width Percent    : "+wPct+"%"
			            +"\n -Height recalc to : "+responsiveHeight+"%");
						
			$(this).css( {"padding-top": responsiveHeight+"%"} ); 
		}
		
		// put the newly created image tag inside the a tag		
		$(a).append(img);
		var alt = $(a).attr("data-alt");
		if ( !alt ) { alt = ""; }
		$(img).attr("alt", alt); // copy the alt attribute to the image
		$(img).attr("title", "View Full Size: "+$(a).text() ); // set the title
		
		$(downloadingImage).attr("data-attachedToPreview",myPreviewId).attr("data-attachedToLightBox",myLightBoxId);

		// before we start to load the image, add a function to be invoked after loading is complete
		$(downloadingImage).load(function(){
			// we stored some data attributes in the tag for later retreival -- later is now so retreive them
			var lboxId = $(this).attr("data-attachedToLightBox");
			var prevId = $(this).attr("data-attachedToPreview");
			
			// identify the elements this download element is tied to
			var aElem = $("#"+prevId+" > a"); // point to the a tag within the element id'd by previewID
			var imgElem = $(aElem).find("img"); // point to the a tag's child img tag
			
			// start moving things around
			$(imgElem).attr("src", $(this).attr("src")); // point the imgElem placeholder to this.src
			$(aElem).addClass("loaded"); // let css know we have loaded
			$(aElem).removeAttr("target"); // remove the target attribute of the aElem placeholder (it was there for noscript and load fails so we could link to it directly)
			
			// do a final placement calculation now that we have the actual image
			var hS = $(aElem).parent().css("padding-top");
			var wP = $(aElem).parent().width();
			var wGP = $(aElem).parent().parent().width();
			var wPct = wP / wGP; // scale based on parent
			var responsiveHeight = wPct * ( 100 * ( $(imgElem)[0].naturalHeight / $(imgElem)[0].naturalWidth ));
			//responsiveHeight = responsiveHeight * (  ( $(imgElem)[0].width / $(imgElem)[0].naturalWidth ));

			debug("\n"+prevId+" calc:"
			            +"\n -Starting Height  : "+hS
			            +"\n -NaturalHeight    : "+$(imgElem)[0].naturalHeight+"px / Width: "+$(imgElem)[0].naturalWidth+"px"
			            +"\n -Actual Height    : "+$(imgElem)[0].height+"px / Width: "+$(imgElem)[0].width+"px"
						+"\n -Parent Width     : "+wP+"px"
						+"\n -Grandparent Width: "+wGP+"px"
						+"\n -Width Percent    : "+wPct+"%"
			            +"\n -Height recalc to : "+responsiveHeight+"%");
			$(aElem).parent().css( {"padding-top": responsiveHeight+"%"} );
			
			addLightBox( aElem, myLightBoxId );
			
		});

		// set the source attribute to the one provided in the A tag's data attribute and begin download
		var imageSrc = $(a).attr("data-src");
		$(downloadingImage).attr("src", imageSrc);
		
		vars.counter++; // increase the counter for the ID
	});
	
	
	$("a.image-light-map, a.image-light-link").each( function() {
		
		// TODO: determine if block (button) or inline link. See if parent element P or DIV only contains ME. Or if image-light-inline or image-light-button is explicitly defined
		
		
		// create the id tags
		var myPreviewId = "imageLight_"+vars.counter;
		var myLightBoxId = "imageLightBox_"+vars.counter;
		
		// set this element's id
		$(this).attr( { "id": myPreviewId, "data-attachedToLightBox": myLightBoxId });
		
		// add analytics tracking info
		$(this).attr({ "data-category": trackingData.LINK.category, "data-action": trackingData.LINK.action, "data-label": $(this).attr("href") });

		addLightBox( this, myLightBoxId );
		$(this).removeAttr("target"); // remove the target attribute of the aElem placeholder (it was there for noscript and load fails so we could link to it directly)

		vars.counter++; // increase the counter for the ID
	});
	
	debug("Found " + vars.counter + " media elements");
	
})(jQuery);