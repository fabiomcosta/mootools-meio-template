(function($){
	
	var htmlEntities = function(html){
		html = html.replace(/</g, '&#60;');
		return html = html.replace(/>/g, '&#62;');
	};
	
	var lastEntry = '';
	var msgCounter = null;
	var timesNamespace = {};
	
	dbug = {
		log: function(){
			if(dbug.element){
				var html = [];
				Array.each(arguments, function(el){
					html.push('<span class="arg ' + $type(el) + '">' + htmlEntities(el) + '</span>');
				});
				if(lastEntry == html.toString()){
					if(msgCounter){
						var count = msgCounter.get('html');
						msgCounter.set('html', ++count);
					}
					else{
						var firstP = dbug.element.getElement('p');
						msgCounter = new Element('span', {'class': 'counter', 'html': 2});
						firstP.grabTop(msgCounter);
					}
				}
				else{
					dbug.element.set('html', '<p>'+ html.join(', ') +'</p>' + dbug.element.get('html'));
					msgCounter = null;
				}
				lastEntry = html.toString();
			}
			else{
				dbug.element = new Element('div', { id: 'meioconsole__' });
				arguments.callee.apply(this, arguments);
				window.addEvent('domready', function(){
					$(document.body).grab(dbug.element);
				});
			}
		},
		
		time: function(name){
			timesNamespace[name] = $time();
		},
		timeEnd: function(name){
			dbug.log(name + ': ' + ($time()-timesNamespace[name]));
		}
	};
	
	if(!window.console){
		window.console = dbug;
		window.onerror = function(errorMsg, file, line){
			console.log(errorMsg, file, line);
		};
	}
})(document.id);