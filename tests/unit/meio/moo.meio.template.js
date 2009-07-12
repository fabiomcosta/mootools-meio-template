describe('Template tests', {

	'Should return an object with the values marked on the template': function(){
		var template = '<span>{data}</span><div>{another_data}</div>';
		var html = '<span>data-value</span><div>anothervalue</div>';
		value_of(template.matchWith(html)).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	},
	
	'Should return an object with the values marked on the template with a little space of difference': function(){
		var template = '<span>{data}</span><div>{another_data}</div>';
		var html = '<span>data-value</span> <div>anothervalue</div>';
		value_of(template.matchWith(html, {debug: true})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	},
	
	'Should return an object with the values marked on the template2': function(){
		var html = '<span title="title" anything="anything">data-value</span><div>anothervalue</div>';
		var el = new Element('div', {'html': html});
		var template = '<span title="{title}" anything="{any}">{data}</span>{no_info}<div>{another_data}</div>';
		value_of(template.matchWith(el)).should_be({
			'title': 'title',
			'any': 'anything',
			'data': 'data-value',
			'no_info': '',
			'another_data': 'anothervalue'
		});
	},
	
	'Should return an object with the values marked on the template, with diff attrs': function(){
		var kid1 = new Element('span', {'class': 'omclass', 'html': 'data-value'});
		var kid2 = new Element('div', {'html': 'anothervalue', 'styles': {'text-align': 'right'}});
		var kid3 = new Element('input');
		var el = new Element('div').adopt(kid1, kid2, kid3);
		var template = '<span class="omclass">{data}</span><div>{another_data}</div><input>';
		value_of(template.matchWith(el, {ignore: {'div': 'style'}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	},
	
	'Should match ignoring whats passed': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'html': 'anothervalue', 'anothertest': 'saycheese', 'title': 'atitle', 'styles': {'text-align': 'right'}})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.matchWith(el, {debug: true, ignore: {'div': ['style', 'title', 'anothertest']}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	},
	
	'Ignore with selector': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.matchWith(el, {ignore: {'#div-to-ignore': ['style', 'id']}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	},
	
	'Ignore with more than one selector and the special atribute "*"': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}}),
			new Element('div', {'id': 'div-to-ignore2'})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.matchWith(el, {
			ignore: {
				'#div-to-ignore': ['style', 'id'],
				'#div-to-ignore2': '*'
			}
		})).should_be({
			'data': 'data-value',
			'another_data': 'anothervalue'
		});
	},
	
	'Ignore with more than one selector': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}}),
			new Element('div', {'id': 'div-to-ignore2', 'title': 'value_title'})
		);
		var template = '<span>{data}</span><div>{another_data}</div><div>{div-value}</div>';
		value_of(template.matchWith(el, {
			ignore: {
				'#div-to-ignore': ['style', 'id'],
				'#div-to-ignore2': '+'
			}
		})).should_be({
			'data': 'data-value',
			'div-value': '',
			'another_data': 'anothervalue'
		});
	},
	
	'example from README.md file': function(){
		var template = '<div><span>{span-key}</span><div>{div-key}</div></div>';
		var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
			new Element('span', {'html': 'span-value'}),
			new Element('div', {'html': 'div-value'})
		);
		value_of( template.matchWith(div, {ignore: {'#div-id': '+'}}), {'span-key': 'span-value', 'div-key': 'div-value'});
	},
	
	'other example from README.md file': function(){
		var template = '<div><span>{span-key}</span><div>{div-key}</div></div>';
		var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
			new Element('span', {'html': 'span-value'}),
			new Element('div', {'html': 'div-value'}),
			new Element('p', {'html': 'some value that will not interfere anyway'})
		);
		value_of( template.matchWith(div, {ignore: {'#div-id': '+', 'p': '*'}}), {'span-key': 'span-value', 'div-key': 'div-value'});
	}
});
