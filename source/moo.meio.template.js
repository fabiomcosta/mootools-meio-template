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

	var support = {};
	var attrNameMatchRegex = (/\s[\w-]+(?=[=\s])(?=[^<>]*>)/g);
	var attrMatchRegex = (/\s[\w="'-]+(?=[\s>\/])(?=[^<>]*>)/g);
    
    (function(){
        var testNode = document.createElement('div');
		
        // it means that to remove the class attribute you wold have to use className instead of class
    	// htmlFor instead of for, etc...
        testNode.className = 'something';
		testNode.removeAttribute('class');
        support.removesProperties = (testNode.className === 'something');
        
        // browsers like opera and ie gives uppercased tags on innerHTML property
        testNode.innerHTML = '<a title=something></a>';
        support.innerHtmlReturnsUpperCasedTags = testNode.innerHTML.contains('<A');
        
    	// thats a IE behavior with attributes that values dont have spaces
    	// while other browser quotes the attribute value, ie doenst
        support.innerHtmlReturnsUnquotedAttrs = testNode.innerHTML.contains('title=something');
        
        testNode.innerHTML = '<input type="text" value="value" name="name" alt="alt">';
        support.innerHtmlResortsAttrs = (testNode.innerHTML.match(attrNameMatchRegex).toString() != ' type, value, name, alt');
        
        testNode = null;
    })();
    
    var specialProperties = {
		'class': 'className',
		'for': 'htmlFor'
	};
	var elementPrototypeWithUID = $extend({'uid': null}, Element.Prototype);
	var firstTagMatchRegex = (/<\/?([^\W\s>]+)/i);
	
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
	
	
	// start building the normalizerRegex array
	var normalizerRegex = [
		(/>\s+</g), '><', // remove spaces between tags
		(/\s[\w-]+=["']{2}(?=[^<>]*>)/g), '' // removes empty attributes
	];
	
	// This regex will lowercase the tags
	if(support.innerHtmlReturnsUpperCasedTags)
	    normalizerRegex.push((/(<\/?)(\w+)(?=[\s\/>])/g), function(all, b1, tag){ return b1 + tag.toLowerCase(); });
	
    // adds "" to attrs that dont have
	// ex: title=something -> title="something"
	if(support.innerHtmlReturnsUnquotedAttrs)
	    normalizerRegex.push((/(\s[\w-]+=)([^\s"][^\s>]+[^\s"])(?=[^<>]*>)/g), '$1"$2"');
	
	normalizerRegex.push(
	    (/\s[^=\W\s>]+(?=[\s>])(?=[^<>]*>)/g), '', // removes non attribute strings
	    (/\s+(\\?>)/g), '$1' // remove spaces inside tags
	);
	
	Meio.Template = new Class({
		
		Implements: Options,
		
		options: {
			debug: false,
			ignore: {},
			templateRegex: (/\{([^{}]+)\}/g)
		},
		
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
				keys = [];
			
			// normalizes template and passed html
			for(var i=0; i < normalizerRegex.length; i+=2){
				html = html.replace(normalizerRegex[i], normalizerRegex[i+1]);
				template = template.replace(normalizerRegex[i], normalizerRegex[i+1]);
			}
			var replaced = template.replace(this.options.templateRegex, function(total, key){
				keys.push(key);
				return '(.*)';
			});
			
			if(support.innerHtmlResortsAttrs){
			    html = this.reorderAttributes(template, html);
			}
			
			var match = html.match(new RegExp(replaced));
			
			// if theres an error on the match
			if(!match && this.options.debug){
				this.debug(template, html);
			}
			
			return (match)? match.slice(1).associate(keys): null;
		},
		
		reorderAttributes: function(template, html){
		    var templateAttrNames = template.match(attrNameMatchRegex);
		    var htmlAttrNames = html.match(attrNameMatchRegex);
		    if(templateAttrNames && htmlAttrNames && templateAttrNames.toString() != htmlAttrNames.toString()){
		        var attrs = []; 
		        var newHtml = html.replace(attrMatchRegex, function(attr){
		            attrs.push(attr);
		            return ' __ATTRIBUTE__';
		        });
		        var attrsObj = attrs.associate(htmlAttrNames);
		        templateAttrNames.each(function(attr){
		            newHtml = newHtml.replace(' __ATTRIBUTE__', attrsObj[attr]);
		        });
		        return newHtml;
		    }
		    return html;
		},
		
		getCorrectInnerHtmlStructure: function(html){
			var match = html.match(firstTagMatchRegex),
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
						if (support.removesProperties && specialProperties[attr]) attr = specialProperties[attr];
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