if(typeof Meio == 'undefined') var Meio = {};

(function($){

	Meio.Template = new Class({
		
		Implements: Options,
		
		options: {
			debug: false,
			ignore: {},
			templateRegex: /\{([^{}]+)\}/g
		},
		
		cleanupRegex: [
			(/>\s+</g), '><', //removeSpaceBetweenTags
			(/\s+(\\?>)/g), '$1', //removeSpaceInsideTags
			(/(<\/?)(\w+)([>\s\/])/g), function(all, b1, match, b2){return b1+match.toLowerCase()+b2;}, //lowercases tags
			// adds "" to attrs that dont have
			// thats a IE behavior with attributes that values dont have spaces
			// ex: title=something -> title="something"
			// title="something with space"
			(/(<\w+\s\w+=)([^\s"'>]+)([^>]*\/?>)/g), function(all, b1, match, b2){return b1+'"'+match+'"'+b2;} 
		],
		
		initialize: function(html, options){
			this.TEMPLATE_DEBUG_ID = 'meio-template-debug';
			this.setOptions(options);
			this.html = html;
		},
		
		cleanup: function(html, template){
			var cRegex = this.cleanupRegex;
			for(var i=0; i < cRegex.length; i+=2){
				html = html.replace(cRegex[i], cRegex[i+1]);
				template = template.replace(cRegex[i], cRegex[i+1]);
			}
			return [html, template];
		},
		
		matchWith: function(template, options){
			//  debug: false,
			//	ignore: {
			//		'*': {
			//			'id': 'fabio'
			//		}
			//	}
		
			var self = this.html;
			var keys = [];
		
			if(this.options.ignore){
				var ignore = this.options.ignore;
				var container = new Element('div', {'html': self, styles: {'display': 'none'}}).inject(document.body);
				var currTag = null;
				var currAttr = null;
				var ignoreRegex = null;
				//new RegExp('<\w+\s', 'g');
				// tag level
				for(selector in ignore){
					//currTag = (tag=='*')? '\\w+': tag;
					// attr level
					currAttr = ignore[selector];
					if($type(currAttr)=='object'){
						for(attr in ignore[tag]){
							currAttr = (attr=='*')? '\\w+': attr;
							// value level
							if($type(ignore[tag][attr])=='array'){
								for(var i=0; i--;){

								}
							}
							else if($type(ignore[tag][attr])=='string'){

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
				container.destroy();
			}
		
			var ret = this.cleanup(self, template);
			self = ret[0];
			template = ret[1];
		
			var replaced = template.replace(this.options.templateRegex, function(total, key){
				keys.push(key);
				return '(.*)';
			});
		
			var match = self.match(new RegExp(replaced));
			
			if(!match && this.options.debug){
				this.debug(self, template);
			}
		
			return (match)? match.slice(1).associate(keys): null;
		},
		
		debug: function(html, template){
			alert('Template:\n' + template + '\nCleaned string:\n' + html);
		}
	});
	
	String.implement({
		matchWith: function(template, options){
			return new Meio.Template(this, options).matchWith(template, options);
		}
	});

	Element.implement({
		matchWith: function(template, options){
			return this.get('html').matchWith(template, options);
		}
	});

})(document.id);