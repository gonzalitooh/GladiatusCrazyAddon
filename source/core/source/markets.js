/*
 * Addon Markets Script
 * Author: DarkThanos, GreatApo
 */

// Markets
var gca_markets = {
	inject : function(){
		// Check for errors
		if(gca_section.submod === 'control')
			return;
		if(!document.getElementById("content"))
			return;
		
		// If there are items
		if(document.getElementById("market_table")){
			// If Item shadow
			(gca_options.bool("global","item_shadow") &&
				this.itemShadow.market());
			
			// If 1 gold warnings
			(gca_options.bool("market","one_gold_warning") &&
				this.itemsWarnings.oneGoldItems());
			// If soul-bound warnings
			(gca_options.bool("market","soulbound_warning") &&
				this.itemsWarnings.soulboundItems());
			// If your items warning
			//	this.itemsWarnings.yourItems();
			
			// If cancel all button
			(gca_options.bool("market","cancel_all_button") &&
				this.cancelAllButton());
			
			// If remember sell duration
			if(gca_options.bool("market","remember_sell_duration")){
				this.remember_sell_duration();
			}else{
			// Default sell duration
				this.sell_duration();
			}
			
			// Special category features
			(gca_options.bool("packages", "special_category_features") && 
				this.specialCategory.resolve(this));

			this.layout.changeSortArrows();
		}
		
		// Insert sort options in POST-URL on sell form
		this.sortOptionsOnSell();
			
		// 1 gold mode
		(gca_options.bool("market","one_gold_mode") &&
			this.oneGoldMode());
			
		// Levels you can see
		this.levelsYouCanSee();

		// Double click select
		(gca_options.bool("market", "double_click_select") && 
			this.doubleClickToSelect.init());

		// Setting Link
		gca_tools.create.settingsLink("market");
	},

	// Add shadow on items
	itemShadow : {
		market : function() {
			// Get items
			var items = document.getElementById('market_table').getElementsByTagName("div");
			
			// For each
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].className.match("item-"))
					gca_tools.item.shadow.add(items[i]);
			}
		}
	},
	
	// Show item levels you can see
	levelsYouCanSee : function(){
		var playerLvl = parseInt(document.getElementById("header_values_level").textContent);
		var maxLvl = ( playerLvl+9<Math.floor(1.25*playerLvl) )? playerLvl+9 : Math.floor(1.25*playerLvl);
		
		var baseElement = document.getElementsByClassName("buildingDesc")[1].getElementsByTagName("p")[0];
		baseElement.appendChild(document.createElement("br"));
		baseElement.appendChild(document.createElement("br"));
		baseElement.appendChild(document.createTextNode(gca_locale.get("auction", "levels_you_can_see", {min : 0, max : maxLvl})));
	},

	// Point out specific items
	itemsWarnings : {
		// Point out which items are soulbound
		soulboundItems : function(){
			let rows = document.getElementById("market_table").getElementsByTagName("tr");
			for (let i = 1; i <= rows.length - 1; i++) {
				if (typeof rows[i].getElementsByTagName("div")[0].dataset.soulboundTo !== "undefined" && typeof rows[i].getElementsByTagName("input")['buy'] !== "undefined") {
					if(rows[i].getElementsByTagName("div")[0].dataset.soulboundTo != gca_section.playerId){// not to you
						rows[i].style.backgroundColor = "rgba(255, 0, 0,0.2)";
						document.buyForm[i-1].addEventListener("submit", function(event){
							if (
								!confirm(
									gca_locale.get("markets", "item_is_soulbound") + "\n" +
									gca_locale.get("markets", "are_you_sure_you_want_to_buy")
								)
							) {
								event.preventDefault();
								return false;
							}
						});
					}
				}
			}
		},
		
		// Point out which items are yours
		yourItems : function(){
			let rows = document.getElementById("market_table").getElementsByTagName("tr");
			for (let i = 1; i <= rows.length - 1; i++) {
				if (typeof rows[i].getElementsByTagName("input")['buy'] == "undefined") {
					rows[i].style.backgroundColor = "rgba(0, 0, 255,0.2)";
				}
			}
		},
		
		// Point out which items cost 1 gold
		oneGoldItems : function(){
			let rows = document.getElementById("market_table").getElementsByTagName("tr");
			for (let i = 1; i <= rows.length - 1; i++) {
				if (gca_tools.strings.parseGold(rows[i].getElementsByTagName("td")[2].textContent) === 1 && typeof rows[i].getElementsByTagName("input")['buy'] !== "undefined" && rows[i].style.backgroundColor != "rgba(0, 255, 0,0.2)"){
					rows[i].style.backgroundColor = "rgba(255, 152, 0,0.2)";
					document.buyForm[i-1].addEventListener("submit", function(e){
						if (
							!confirm(
								gca_locale.get("markets", "item_cost_only_x_gold", {number : 1}) + "\n" +
								gca_locale.get("markets", "are_you_sure_you_want_to_buy")
							)
						) {
							event.preventDefault();
							return false;
						}
					});
				}
			}
		}
	},
	
	// Cancel all button
	cancelAllButton : function(){
		var buttons = document.getElementsByName('cancel');
		
		if(buttons.length>0){
			//create button
			var button = document.createElement("input");
			button.type = 'button';
			button.className = "awesome-button";
			button.id = 'cancelAllButton';
			button.style = "margin-top: -21px;position: absolute;right: 116px;";
			button.value = buttons[0].value + ' ('+buttons.length+')';
			button.dataset.current = 0;
			button.dataset.max = buttons.length;
			button.addEventListener('click', function(){
				// Cancel all code
				var rows = document.getElementById("market_table").getElementsByTagName("tr");
				var forms = document.getElementById("market_table").getElementsByTagName("form");
				var cancel = encodeURIComponent(document.getElementsByName('cancel')[0].value);
				var id;
				for(var i = 1; i <= rows.length - 1; i++){
					if(typeof rows[i].getElementsByTagName("input")['cancel'] !== "undefined"){
						id = forms[i - 1].buyid.value;
						jQuery.ajax({
							type: "POST",
							url: document.location.href,
							data: 'buyid=' + id + '&cancel=' + cancel,
							success: function(){
								if(document.getElementById('cancelAllButton').dataset.current==document.getElementById('cancelAllButton').dataset.max-1){
									document.location.href=document.location.href.replace(/&p=\d+/i,"");
									return;
								}
								document.getElementById('cancelAllButton').dataset.current++;
								document.getElementById('cancelAllButton').value = buttons[0].value + ' ( '+document.getElementById('cancelAllButton').dataset.current+'/'+document.getElementById('cancelAllButton').dataset.max+')';;
							},
							error: function(){
								gca_notifications.error(gca_locale.get("general", "error"));
							}
						});
					}
				}
				
				
				//document.location.href
				//'buyid='+itemsId+'&cancel='+encodeURIComponent(cancel)
			}, false);
			
			var base = document.getElementById("market_table");
			base.parentNode.insertBefore(button,base);
		}
	},
	
	// Default sell duration
	sell_duration : function(){
		let duration = gca_data.section.get("market", "sell_duration", 0);
		let options = document.getElementById('dauer');
		// If 48h is selected, select 24h
		if (duration >= options.length)
			duration = 2;
		// Select saved duration
		options.selectedIndex = duration;
	},
	
	// Remember sell duration
	remember_sell_duration : function(){
		let duration = gca_data.section.get("cache", "last_sell_duration", 0);
		let options = document.getElementById('dauer');
		// If 48h is selected, select 24h
		if (duration >= options.length)
			duration = 2;
		// Select saved duration
		options.selectedIndex = duration;
		
		options.addEventListener("change", function () {
			gca_data.section.set("cache", "last_sell_duration", this.selectedIndex);
		}, false);
	},
	
	// 1g mode
	oneGoldMode : function(){
		// Create mode switch
		let wrapper = document.createElement('div');
		let fields = document.getElementById("market_sell_fields");
		fields.parentNode.insertBefore(wrapper, fields.nextSibling);
		
		let selected_mode = gca_data.section.get("cache", "last_sell_1g_mode", 0);
		
		let modeSwitch = document.createElement("div");
		modeSwitch.className = "switch-field";
		modeSwitch.id = "mode-switch";
		let normal_mode = document.createElement("input");
		normal_mode.type = "radio";
		normal_mode.id = "normal_mode";
		normal_mode.name = "sell_mode";
		normal_mode.value = 0;
		if(selected_mode === 0)
			normal_mode.checked = true;
		let normal_mode_label = document.createElement("label");
		normal_mode_label.setAttribute("for", "normal_mode");
		normal_mode_label.textContent = 'Auto';//gca_locale.get("training", "stats_points");
		modeSwitch.appendChild(normal_mode);
		modeSwitch.appendChild(normal_mode_label);

		let oneG_mode = document.createElement("input");
		oneG_mode.type = "radio";
		oneG_mode.id = "1g_mode";
		oneG_mode.name = "sell_mode";
		oneG_mode.value = 1;
		if(selected_mode === 1)
			oneG_mode.checked = true;
		let oneG_mode_label = document.createElement("label");
		oneG_mode_label.setAttribute("for", "1g_mode");
		oneG_mode_label.textContent = '1g';//gca_locale.get("training", "points_breakdown");
		wrapper.appendChild(modeSwitch);
		modeSwitch.appendChild(oneG_mode);
		modeSwitch.appendChild(oneG_mode_label);
		
		let cost_mode = document.createElement("input");
		cost_mode.type = "radio";
		cost_mode.id = "cost_mode";
		cost_mode.name = "sell_mode";
		cost_mode.value = 2;
		if(selected_mode === 2)
			cost_mode.checked = true;
		let cost_mode_label = document.createElement("label");
		cost_mode_label.setAttribute("for", "cost_mode");
		cost_mode_label.textContent = gca_data.section.get("cache", "value_tanslation", "Value");
		wrapper.appendChild(modeSwitch);
		modeSwitch.appendChild(cost_mode);
		modeSwitch.appendChild(cost_mode_label);
		
		let auto_value = document.createElement("input");
		auto_value.id = "auto_value";
		auto_value.value = 0;
		auto_value.style = "display:none";
		modeSwitch.appendChild(auto_value);
		
		var get_translation = (gca_data.section.get("cache", "value_tanslation", "true")=="true")?true:false;
		
		// Item drop function
		//var marketDrop_orginal = window.marketDrop; //original function is not used
		window.marketDrop = function(d, a) {
			let c = jQuery("#sellForm");
			jQuery('[name="sellid"]', c).val(d.data("itemId"));
			let b = d.data("priceGold") || 0;
			b = Math.floor(b * a / 1.5);
			jQuery('[name="preis"]', c).val(b);
			document.getElementById('auto_value').value = b;
			modeSwitchFunction(); // calcDues(); is called within this function
			
			//Save "Value" translation
			if(get_translation){
				let item_tooltip = d.data("tooltip")[0];
				let found = false;
				for(i=2;i<item_tooltip.length;i++){
					if(item_tooltip[i][0].match(/([^\s]+) [\d+|\.]+ <div class="icon_gold">/)){
						let value_tanslation = item_tooltip[i][0].match(/([^\s]+) [\d+|\.]+ <div class="icon_gold">/)[1];
						//console.log(value_tanslation);
						gca_data.section.set("cache", "value_tanslation", value_tanslation);
						cost_mode_label.textContent = value_tanslation;
						break;
					}
				}
			}
		}
		
		// Change mode
		modeSwitchFunction = function(){
			let selected = parseInt(document.querySelector('input[name=sell_mode]:checked').value);
			gca_data.section.set("cache", "last_sell_1g_mode", selected); // Save last selected mode
			if(document.getElementById('preis').value != ''){
				if(selected == 1){
					document.getElementById('preis').value = 1;
				}else if(selected == 2){
					document.getElementById('preis').value = Math.round(document.getElementById('auto_value').value*0.375);
				}else{
					document.getElementById('preis').value = document.getElementById('auto_value').value;
				}
			}
			calcDues();
		};
		modeSwitch.addEventListener('change',modeSwitchFunction);
	},

	// Layout
	layout : {
		changeSortArrows : function() {
			let content = document.getElementById("content");
			if(content.className.length > 0)
				content.className += " ";
			content.className += "gca_change_sort_arrows";

			let links = document.getElementById("market_table");
			if(!links) return;
			links = links.getElementsByTagName("tr");
			if(!links.length) return;
			links = links[0].getElementsByTagName("a");
			if(!links.length) return;

			// Get url
			var url = gca_getPage.parameters();
			
			for (var i = 0; i < links.length; i++) {
				let link = gca_getPage.parameters(links[i].href);
				if (url.hasOwnProperty("s") && link.hasOwnProperty("s") && url.s[0] === link.s[0]) {
					links[i].textContent = ((url.s.length == 1) ? "▲" : "▼") + " " + links[i].textContent;
				}else{
					links[i].textContent = "▷ " + links[i].textContent;
				}
			}
		}
	},
	
	sortOptionsOnSell : function() {
		// Get url
		var url = gca_getPage.parameters();
		// Fix POST-URL on sell form
		if (url.hasOwnProperty("s")) {
			document.getElementById('sellForm').action += '&s='+url.s[0];
		}
	},

	// On double click item to select for selling
	doubleClickToSelect : {
		init : function(){
			// Add event
			gca_tools.event.bag.onBagOpen(() => {
				this.apply();
			});

			// If bag not already loaded
			if (document.getElementById('inv').className.match('unavailable')) {
				// Wait first bag
				gca_tools.event.bag.waitBag(() => {
					this.apply();
				});
			}
			else {
				this.apply();
			}
		},
		apply : function(){
			// For each
			jQuery("#inv .ui-draggable").each((i, item) => {
				// If already parsed
				if(item.dataset.gcaFlag_doubleClickEvent)
					return;
				// Flag as parsed
				item.dataset.gcaFlag_doubleClickEvent = true;
				// Add event
				item.addListener('dblclick', this.handler);
			});
		},
		handler : function() {
			gca_tools.item.move(this, 'market');
		}
	},
	
	// Special Categories
	specialCategory : {
		
		// Resolve category
		resolve : function(self){
			var category = parseInt(document.getElementsByName("f")[0].value);
			switch(category){
				case 20:
					this.categories.scroll.loadData(self);
					break;
			}
		},

		// Categories
		categories : {
			
			// Scrolls Category
			scroll : {
				loadData : function(){
					// Make request
					jQuery.ajax({
						type: "GET",
						url: gca_getPage.link({"mod":"forge"}),
						success: (result) => {
							// Get each name
							let scrolls = result.match(/<option value="\d+" (selected |)data-level="\d+" data-name="[^"]*">[^<]*<\/option>/gim);

							// If error
							if (scrolls.length < 2) {
								this.prefix = false;
								this.suffix = false;
								return;
							}

							// Parse scrolls
							let prefix = []; 
							let suffix = [];

							var i = 1;
							// Get prefixes
							while (i < scrolls.length) {
								let id = parseInt(scrolls[i].match(/ value="(\d+)"/i)[1], 10);
								i++;
								if (id == 0) break;
								prefix.push(id);
							}
							// Get suffixes
							while (i < scrolls.length) {
								let id = parseInt(scrolls[i].match(/ value="(\d+)"/i)[1], 10);
								i++;
								suffix.push(id);
							}

							// Save lists
							this.prefix = prefix;
							this.suffix = suffix;

							// Check scrolls
							this.showIsLearned();
						},
						error: function(){}
					});
				},
				// Apply 
				showIsLearned : function(){
					// If no data return
					if(!this.prefix) return;
					
					// For each item
					jQuery("#market_table div").each((i, item) => {
						// If already parsed
						if(item.dataset.gcaFlag_isLearned) return;
						// Flag as parsed
						item.dataset.gcaFlag_isLearned = true;

						// Get hash
						let hash = gca_tools.item.hash(item);
						if (!hash) return;
						// Check if own
						let known = (this.prefix.indexOf(hash.prefix) >= 0 || this.suffix.indexOf(hash.suffix) >= 0);
						if (known) {
							item.style.filter = "drop-shadow(2px 2px 1px rgba(255,0,0,0.4)) drop-shadow( 2px -2px 1px rgba(255,0,0,0.4)) drop-shadow(-2px -2px 1px rgba(255,0,0,0.4)) drop-shadow(-2px 2px 1px rgba(255,0,0,0.4))";
							jQuery(item).data("tooltip")[0].push([gca_locale.get("packages","known_scroll"), "red"]);
						}
						else {
							item.style.filter = "drop-shadow(2px 2px 1px rgba(0,255,0,0.4)) drop-shadow( 2px -2px 1px rgba(0,255,0,0.4)) drop-shadow(-2px -2px 1px rgba(0,255,0,0.4)) drop-shadow(-2px 2px 1px rgba(0,255,0,0.4))";
							jQuery(item).data("tooltip")[0].push([gca_locale.get("packages","unknown_scroll"), "green"]);
						}
					});
				}
			}
		}
	}

};

// Onload Handler
(function(){
	var loaded = false;
	var fireLoad = function() {
		if(loaded) return;
		loaded = true;
		gca_markets.inject();
	};
	if (document.readyState == 'interactive' || document.readyState == 'complete') {
		fireLoad();
	} else {
		window.addEventListener('DOMContentLoaded', fireLoad, true);
		window.addEventListener('load', fireLoad, true);
	}
})();

// ESlint defs
/* global gca_data, gca_getPage, gca_locale, gca_notifications, gca_options, gca_section, gca_tools */
/* global jQuery */
