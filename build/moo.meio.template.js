/**
 * moo.meio.template.js
 * @author: fabiomcosta
 * @version 0.9
 *
 * Created by Fabio M. Costa on 2008-09-16. Please report any bug at http://www.meiocodigo.com
 *
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

if(typeof Meio == 'undefined') var Meio = {};

(function(){
	var $ = document.id || $;

	Meio.Template = new Class({
		
		Implements: Options,
		
		options: {
			debug: false,
			ignore: {},
			templateRegex: /\{([^{}]+)\}/g
		},
		
		normalizeRegex: [
			(/>\s+</g), '><', //removeSpaceBetweenTags
			(/\s+(\\?>)/g), '$1', //removeSpaceInsideTags
			(/(<\/?)(\w+)([>\s\/])/g), function(all, b1, match, b2){return b1+match.toLowerCase()+b2;}, //lowercases tags
			// adds "" to attrs that dont have
			// thats a IE behavior with attributes that values dont have spaces
			// ex: title=something -> title="something"
			// title="something with space"
			(/(<\w+\s\w+=)([^\s"'>]+)([^>]*\/?>)/g), function(all, b1, match, b2){return b1+'"'+match+'"'+b2;} 
		],
		
		initialize: function(template, options){
			this.TEMPLATE_DEBUG_ID = 'meio-template-debug';
			this.setOptions(options);
			this.template = template;
		},
		
		matchWith: function(html){
			var container = null,
				injectedInDoc = false;
			if($type(html)=='element'){
				container = $(html);
				html = container.get('html');
			}
			else{
				container = new Element('div', {'html': html, styles: {'display': 'none'}});
			}
			// if its not in the document, insert it, i need it to use the selectors engine
			if(container.ownerDocument !== document.body){
				container.inject(document.body);
				injectedInDoc = true;
			}
		
			if($type(this.options.ignore)=='object'){
				this.ignoreNodes(container);
				html = container.innerHTML;
				// remove if it has been inject by the plugin
				if(injectedInDoc){
					container.dispose();
				}
			}
		
			var template = this.template,
				keys = [],
				cRegex = this.normalizeRegex;
			
			// normalizes template and passed html
			for(var i=0; i < cRegex.length; i+=2){
				html = html.replace(cRegex[i], cRegex[i+1]);
				template = template.replace(cRegex[i], cRegex[i+1]);
			}
				
			var replaced = template.replace(this.options.templateRegex, function(total, key){
				keys.push(key);
				return '(.*)';
			});
			
			var match = html.match(new RegExp(replaced));
			
			if(!match && this.options.debug){
				this.debug(template, html);
			}
		
			return (match)? match.slice(1).associate(keys): null;
		},
		
		ignoreNodes: function(container){
			var ignore = this.options.ignore,
				currAttr = null;
				
			// tag level
			for(selector in ignore){
				// attr level
				currAttr = ignore[selector];
				if($type(currAttr)=='string'){
					switch (currAttr){
					case '*':
						container.getElements(selector).dispose();
						break;
					case '+':
						var els = container.getElements(selector);
						for(var j=els.length; j--;){
							for(var attr, i = els[j].attributes.length; i--;){
								if((attr = els[j].attributes[i]) && attr.nodeValue && attr.specified && !attr.expando)
									els[j].removeAttribute(attr.nodeName);
							}
						}
						break;
					default:
						currAttr = [currAttr];
					}
				}
				if($type(currAttr)=='array'){
					var els = container.getElements(selector);
					for(var j=els.length; j--;){
						for(var i=currAttr.length; i--;){
							els[j].removeAttribute(currAttr[i]);
						}
					}
				}
			}
		},
		
		debug: function(template, html){
			var msg = 'If they don\'t match its because you are forgetting to ignore something.\nTemplate:\n' + template + '\nCleaned string:\n' + html;
			(console && console.log)? console.log(msg): alert(msg);
		}
	});
	
	String.implement({
		matchWith: function(elOrHtml, options){
			return new Meio.Template(this, options).matchWith(elOrHtml);
		}
	});

})();