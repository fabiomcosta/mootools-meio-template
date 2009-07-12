meioTemplate - a mootools plugin for use with templating and reverse templating.
================================================================================

It have been teste on IE, Firefox, Safari, Opera.

You can do things like getting information using a text and a template to match with it, for example:

	var template = '<span>{data}</span><div>{another_data}</div>';
	var html = '<span>data-value</span><div>anothervalue</div>';
	template.matchWith(html); // this returns {'data': 'data-value', 'another_data': 'anothervalue'}
	
You can use elements too and can ignore some parts of it, in a way that it will match with the template:

	var template = '<div><span>{span-key}</span><div>{div-key}</div></div>';
	var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
		new Element('span', {'html': 'span-value'}),
		new Element('div', {'html': 'div-value'})
	);
	template.matchWith(div, {ignore: {'#div-id': '+'}}); // this returns {'span-key': 'span-value', 'div-key': 'div-value'}

Using the '*' removes all the elements that match the selector, while the '+' removes all of the elements attributes:

	var template = '<div><span>{span-key}</span><div>{div-key}</div></div>';
	var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
		new Element('span', {'html': 'span-value'}),
		new Element('div', {'html': 'div-value'}),
		new Element('p', {'html': 'some value that will not interfere anyway'})
	);
	template.matchWith(div, {ignore: {'#div-id': '+', 'p': '*'}}); // this returns {'span-key': 'span-value', 'div-key': 'div-value'}

	
Created by Fabio M. Costa on 2009-06-04. Please report any bug at http://www.meiocodigo.com
Copyright (c) 2009 Fabio M. Costa http://www.meiocodigo.com

The MIT License (http://www.opensource.org/licenses/mit-license.php)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
