/*
 * Addon Gods Script
 * Author: DarkThanos, GreatApo
 */

// Overview
var gca_player = {
	inject : function(){
		
		// Items shadow
		(gca_options.bool("global","item_shadow") && 
			this.itemShadow.inject());
		
	},

	// Items Shadow Inject
	itemShadow : {
		inject : function(){
			this.dollItems();
		},

		// Add shadow to doll items
		dollItems : function(){
			// Get doll divs
			var items = document.getElementById("char").getElementsByClassName("ui-droppable");

			// Add shadow to each item
			for(var i = items.length - 1; i >= 0; i--){
				// If item
				if(items[i].className.match("item-i-")){
					gca_tools.item.shadow.add(items[i]);
				}
			}

		}
	}

};

(function(){
	// On page load
	var loaded = false;
	var fireLoadEvent = function(){
		if(loaded) return;
		loaded = true;
		// Call handler
		gca_player.inject();
	}
	if(document.readyState == "complete" || document.readyState == "loaded"){
		fireLoadEvent();
	}else{
		window.addEventListener('DOMContentLoaded', function(){
			fireLoadEvent();
		}, true);
		window.addEventListener('load', function(){
			fireLoadEvent();
		}, true);
	}
})();