var global_scope = this.self;

global_scope.addEventListener("connect",function(e){
	var message_port = e.ports[0];
	message_port.onmessage = function(e){
		console.log(e);
		//e = {command:writeなど,storagename:"",keyname:,value:}
		switch(e){
			case "write":
				var ls = JSON.parse(e.localStorage.getItem(e.storagename)) || {};
				ls[e.keyname] = e.value;
				e.localStorage.setItem(e.storagename,JSON.stringify(ls));
				break;
		}
	}
	message_port.start();
});