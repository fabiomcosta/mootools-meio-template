
String.implement({
	matchWith: function(template, options){
		//
		//	ignore: {
		//		'*': {
		//			'id': 'fabio'
		//		}
		//	}
		
		var self = this;
		var keys = [];
		
		if($type(options)=='object'){
			var container = new Element('div', {'html': self, styles: {'display': 'none'}}).inject(document.body);
			var currTag = null;
			var currAttr = null;
			var ignoreRegex = null;
			//new RegExp('<\w+\s', 'g');
			// tag level
			for(selector in options){
				//currTag = (tag=='*')? '\\w+': tag;
				// attr level
				currAttr = options[selector];
				if($type(currAttr)=='object'){
					for(attr in options[tag]){
						currAttr = (attr=='*')? '\\w+': attr;
						// value level
						if($type(options[tag][attr])=='array'){
							for(var i=0; i--;){

							}
						}
						else if($type(options[tag][attr])=='string'){

						}
					}
				}
				else if($type(currAttr)=='string' || $type(currAttr)=='array'){
					if($type(currAttr)=='string') currAttr = [currAttr];
					var els = container.getElements(selector);
					els.each(function(el){
						currAttr.each(function(attr){
							el.removeAttribute(attr);
						});
					});
					//ignoreRegex = new RegExp('(<'+currTag+'[^>])*\\s+'+options[tag]+'="[^"]+"\\s*', 'g');
				}
				//template = template.replace(ignoreRegex, '$1');
				//self = self.replace(ignoreRegex, '$1');
			}
			self = container.innerHTML;
		}
		
		var cleanupRegex = [
			(/>\s+</g), '><', //removeSpaceBetweenTags
			(/\s+(\\?>)/g), '$1', //removeSpaceInsideTags
			(/(<\/?)(\w+)([>\s\/])/g), function(all, b1, match, b2){return b1+match.toLowerCase()+b2;}, //lowercases tags
			// adds "" to attrs that dont have
			// thats a IE behavior with attributes that values dont have spaces
			// ex: title=something -> title="something"
			// title="something with space"
			(/(<\w+\s\w+=)([^\s"'>]+)([^>]*\/?>)/g), function(all, b1, match, b2){return b1+'"'+match+'"'+b2;} 
		];
		var cleanup = function(){
			for(var i=0; i < cleanupRegex.length; i+=2){
				self = self.replace(cleanupRegex[i], cleanupRegex[i+1]);
				template = template.replace(cleanupRegex[i], cleanupRegex[i+1]);
			}
		};
		
		cleanup();
		
		var replaced = template.replace(/\{([^{}]+)\}/g, function(total, key){
			keys.push(key);
			return '(.*)';
		});
		
		console.log(replaced, self);
		
		var match = self.match(new RegExp(replaced));
		return (match)? match.slice(1).associate(keys): null;
	}
});

Element.implement({
	matchWith: function(template, options){
		return this.get('html').matchWith(template, options);
	}
});