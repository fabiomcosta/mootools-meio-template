describe('Template tests', {
	'Should return an object with the values marked on the template': function(){
		var template = '<span>{data}</span><div>{another_data}</div>';
		var html = '<span>data-value</span><div>anothervalue</div>';
		value_of(template.intersect(html)).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	}
});

describe('Template tests2', {
	'Should return an object with the values marked on the template with a little space of difference': function(){
		var template = '<span>{data}</span><div>{another_data}</div>';
		var html = '<span>data-value</span> <div>anothervalue</div>';
		value_of(template.intersect(html)).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	}
});

describe('Template tests3', {
	'Should return an object with the values marked on the template2': function(){
		var html = '<span title="title" anything="anything">data-value</span><div>anothervalue</div>';
		var el = new Element('div', {'html': html});
		var template = '<span title="{title}" anything="{any}">{data}</span>{no_info}<div>{another_data}</div>';
		value_of(template.intersect(el)).should_be({
			'title': 'title',
			'any': 'anything',
			'data': 'data-value',
			'no_info': '',
			'another_data': 'anothervalue'
		});
	}
});

describe('Template tests4', {
	'Should return an object with the values marked on the template, with diff attrs': function(){
		var kid1 = new Element('span', {'class': 'omclass', 'html': 'data-value'});
		var kid2 = new Element('div', {'html': 'anothervalue', 'styles': {'text-align': 'right'}});
		var kid3 = new Element('input');
		var el = new Element('div').adopt(kid1, kid2, kid3);
		var template = '<span class="omclass">{data}</span><div>{another_data}</div><input>';
		value_of(template.intersect(el, {ignore: {'div': 'style'}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	}
});

describe('Template tests5', {
	'Should match ignoring whats passed': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'html': 'anothervalue', 'anothertest': 'saycheese', 'title': 'atitle', 'styles': {'text-align': 'right'}})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.intersect(el, {ignore: {'div': ['style', 'title', 'anothertest']}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	}
});

describe('Template tests6', {	

	'Ignore with selector': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.intersect(el, {ignore: {'#div-to-ignore': ['style', 'id']}})).should_be({'data': 'data-value', 'another_data': 'anothervalue'});
	}
});

describe('Template tests7', {	
	'Ignore with more than one selector and the special atribute "*"': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}}),
			new Element('div', {'id': 'div-to-ignore2'})
		);
		var template = '<span>{data}</span><div>{another_data}</div>';
		value_of(template.intersect(el, {
			ignore: {
				'#div-to-ignore': ['style', 'id'],
				'#div-to-ignore2': '*'
			}
		})).should_be({
			'data': 'data-value',
			'another_data': 'anothervalue'
		});
	}
});

describe('Template tests8', {
	'Ignore with more than one selector': function(){
		var el = new Element('div').adopt(
			new Element('span', {'html': 'data-value'}),
			new Element('div', {'id': 'div-to-ignore', 'html': 'anothervalue', 'styles': {'text-align': 'right'}}),
			new Element('div', {'id': 'div-to-ignore2', 'title': 'value_title'})
		);
		var template = '<span>{data}</span><div>{another_data}</div><div>{div-value}</div>';
		value_of(template.intersect(el, {
			ignore: {
				'#div-to-ignore': ['style', 'id'],
				'#div-to-ignore2': '+'
			}
		})).should_be({
			'data': 'data-value',
			'div-value': '',
			'another_data': 'anothervalue'
		});
	}
});

describe('Template tests9', {	
	'example from README.md file': function(){
		var template = '<div><span>{span-key}</span><div>{div-key}</div></div>';
		var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
			new Element('span', {'html': 'span-value'}),
			new Element('div', {'html': 'div-value'})
		);
		value_of( template.intersect(div, {ignore: {'#div-id': '+'}}), {'span-key': 'span-value', 'div-key': 'div-value'});
	}
});

describe('Template tests10', {	
	'other example from README.md file': function(){
		var template = '<span>{span-key}</span><div>{div-key}</div>';
		var div = new Element('div', {'id': 'div-id', 'class': 'div-class'}).adopt(
			new Element('span', {'html': 'span-value'}),
			new Element('div', {'html': 'div-value'}),
			new Element('p', {'html': 'some value that will not interfere anyway'})
		);
		value_of(template.intersect(div, {ignore: {'#div-id': '+', 'p': '*'}})).should_be({'span-key': 'span-value', 'div-key': 'div-value'});
	}
});

describe('Template tests11', {
	'example with customattribute': function(){
		var template = '<span>{span-key}</span><div>{div-key}</div><div>{div2-key}</div>';
		var div2 = new Element('div', {'id': 'div-id', 'class': 'div-class', 'data-ignored': 'value-ignored', html: 'div2-value'});
		div2.onclick = function(){ return false; };
		var div = new Element('div').adopt(
			new Element('span', {'html': 'span-value'}),
			new Element('div', {'html': 'div-value'}),
			new Element('p', {'html': 'some value that will not interfere anyway'}),
			div2
		);
		value_of(template.intersect(div, {debug: true, ignore: {'#div-id': '+', 'p': '*'}})).should_be({'span-key': 'span-value', 'div-key': 'div-value', 'div2-key': 'div2-value'});
	}
});

describe('Template tests12', {
	'example with table element': function(){
		var template = '<tbody><tr><td>{td-key}</td></tr></tbody>';
		var table = new Element('table').adopt(
			new Element('tbody').adopt(
				new Element('tr').adopt(
					new Element('td', {'html': 'td-value'})
				)
			)
		);
		value_of(template.intersect(table, {debug: true})).should_be({'td-key': 'td-value'});
	}
});

describe('Template tests13', {
	'example with style and onclick attributes passing a string as parameter': function(){
		var template = '<tbody><tr><td>{td-key}</td></tr></tbody>';
		var table = '<tbody><tr><td style="color: red" onclick="return false;">td-value</td></tr></tbody>';
		value_of(template.intersect(table, {debug: true, ignore: {'td': '+'}})).should_be({'td-key': 'td-value'});
	}
});

describe('Template tests14', {
	'example with option elements': function(){
		var template = '<option value="{option1-value}">{option1-label}</option><option value="{option2-value}">{option2-label}</option><option value="{option3-value}">{option3-label}</option>';
		var select = new Element('select', {multiple: 'multiple'}).adopt(
			new Element('option', {html: 'label1',value: 'value1'}),
			new Element('option', {html: 'label2',value: 'value2'}),
			new Element('option', {html: 'label3',value: 'value3'})
		);
		value_of(template.intersect(select, {debug: true})).should_be({
			'option1-value': 'value1',
			'option2-value': 'value2',
			'option3-value': 'value3',
			'option1-label': 'label1',
			'option2-label': 'label2',
			'option3-label': 'label3'
		});
	}
});

describe('Template tests15', {
	'example with option elements and boolean attributes': function(){
		var template = '<option value="{option1-value}" title="{option1-title}">{option1-label}</option>';
		var options = '<option selected="selected" value="value1" title="title1">label1</option>';
		value_of(template.intersect(options, {debug: true, ignore: {'option': 'selected'}})).should_be({
			'option1-value': 'value1',
			'option1-label': 'label1',
			'option1-title': 'title1'
		});
	}
});

describe('Template tests16', {
	'example with unicode attribute values': function(){
		var template = '<option selected="selected" value="{option1-value}" title="{option1-title}">{option1-label}</option>';
		var options = '<option selected="selected" value="value1" title="á ǝpoɔıun  瀡">label1</option>';
		value_of(template.intersect(options, {debug: true})).should_be({
			'option1-value': 'value1',
			'option1-label': 'label1',
			'option1-title': 'á ǝpoɔıun  瀡'
		});
	}
});
