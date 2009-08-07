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
	
	// it means that to remove the class atribute you wold have to use className instead
	// htmlFor instead of for, etc...
	var removesProperties = (function(){
		var node = document.createElement('div');
		node.className = 'something';
		node.removeAttribute('class');
		return node.className === 'something';
	})();
	
	var specialProperties = {
		'class': 'className',
		'for': 'htmlFor'
	};
	
	// used on getCorrectInnerHtmlStructure function
	var translations = {
		option: [1, '<select>', '</select>'],
		tbody: [1, '<table>', '</table>'],
		tr: [2, '<table><tbody>', '</tbody></table>'],
		td: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.th = translations.td;
	translations.optgroup = translations.option;
	translations.thead = translations.tfoot = translations.tbody;
	
	var elementPrototypeWithUID = $extend({'uid': null}, Element.Prototype);
	
	Meio.Template = new Class({
		
		Implements: Options,
		
		options: {
			debug: false,
			ignore: {},
			templateRegex: /\{([^{}]+)\}/g
		},
		
		normalizeRegex: [
			(/>\s+</g), '><', // remove spaces between tags
			(/(<\/?)(\w+)([>\s\/])/g), function(all, b1, match, b2){return b1 + match.toLowerCase() + b2;}, // lowercases tags
			// removes empty attributes
			(/\s[\w-]+=["']{2}(?=[^<>]*>)/g), '',
			// removes non attribute strings
			(/\s[^=\W\s>]+(?=[\s>])(?=[^<>]*>)/g), '',
			// adds "" to attrs that dont have
			// thats a IE behavior with attributes that values dont have spaces
			// ex: title=something -> title="something"
			// title="something with space"
			(/(\s[\w-]+=)([^\s"][^\s>]+[^\s"])(?=[^<>]*>)/g), '$1"$2"',
			(/\s+(\\?>)/g), '$1' // remove spaces inside tags
		],
		
		initialize: function(template, options){
			this.setOptions(options);
			this.template = ($type(template) === 'element')? template.get('html'): template;
		},
		
		matchWith: function(html){
			
			var injectedInDoc = false,
				container = null;
			
			if($type(this.options.ignore) === 'object'){
				// creating a container so we can use selector engine on the elements
				// to ignore the ones specified by the ignore option
				container = ($type(html) === 'element')? $(html): this.getCorrectInnerHtmlStructure(html);
				
				if(!container.getParent('body')){
					container.setStyle('display', 'none').inject(document.body);
					injectedInDoc = true;
				}
				this.ignoreNodes(container);
				html = container.innerHTML;
				if(injectedInDoc) container.destroy();
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
			
			// if theres an error on the match
			if(!match && this.options.debug){
				this.debug(template, html);
			}
			
			return (match)? match.slice(1).associate(keys): null;
		},
		
		getCorrectInnerHtmlStructure: function(html){
			var match = html.match(/<\/?([^\W\s>]+)/i),
				firstTag = match[1].toLowerCase(),
				container = new Element('div', {styles: {'display': 'none'}});
			
			if(translations[firstTag]){
				html = translations[firstTag][1] + html + translations[firstTag][2];
				container.innerHTML = html;
				for(var i = translations[firstTag][0]; i--;) container = container.firstChild;
				return $(container);
			}
			else{
				container.innerHTML = html;
				return container;
			}
		},
		
		ignoreNodes: function(container){
			var ignore = this.options.ignore,
				attrs, els;
				
			// tag level
			for (selector in ignore){
				// attr level
				attrs = ignore[selector];
				if ($type(attrs)=='string'){
					switch (attrs){
					case '*':
						container.getElements(selector).dispose();
						break;
					case '+':
						els = container.getElements(selector);
						this.removeAttributes(els);
						break;
					default:
						attrs = [attrs];
					}
				}
				if($type(attrs)=='array'){
					els = container.getElements(selector);
					this.removeAttributes(els, attrs);
				}
			}
		},
		
		// removes all the attrs from els
		// attrs can be a list of strings representing the attributes or can be a list of attribute nodes
		// checkfirst is an optimization for ie, it should be used while passind a list of all the attributes from els
		removeAttributes: function(els, attrs){
			var attr;
			for (var j=els.length; j--;){
				attrs = attrs || els[j].attributes;
				for (var i=attrs.length; i--;){
					attr = attrs[i];
					if (attr.nodeName && (attr = attr.nodeName) && attr.specified && !elementPrototypeWithUID[attr]) break;
					if(attr == 'style'){
						els[j].style.cssText = '';
					}
					else{
						if (removesProperties && specialProperties[attr]) attr = specialProperties[attr];
						els[j].removeAttribute(attr);
					}
				}
			}
		},
		
		debug: function(template, html){
			var msg = 'If they don\'t match its because you are forgetting to ignore something. Template:' + template + ' Cleaned string: ' + html;
			(console && console.log)? console.log(msg): alert(msg);
		}
	});
	
	Native.implement([String, Element], {
		intersect: function(elOrHtml, options){
			return new Meio.Template(this, options).matchWith(elOrHtml);
		}
	});

})();