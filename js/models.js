/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Create Individual TodoItem Model (to be used as the base model in the TodoItems collection) * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * * * * * * * * * * * * * */

var todoItem = Backbone.Model.extend({
	defaults: {
		"description" : "not specified",
		"status" : "incomplete"
	},

	initialize: function() {
		console.log("New todo model has been created");		
	},

	toggleCheckbox: function() {
		console.log("changed");
		var status = this.get("status");
		console.log(status);
		switch(status) {
			case "incomplete":
				this.set({"status" : "complete"});
				console.log(this.get("status"));
				break;
			case "complete":
				this.set({"status" : "incomplete"});
				break;
		}

		//PUT
		this.save();
	}

});	

/* * * * * * * * * * * * * * * * * * 
 * Create Backbone Collection Class * 
 * * * * * * * * * * * * * * * * * */

var TodoItems = Backbone.Collection.extend({

	localStorage: new Backbone.LocalStorage("testCollection"),
	model: todoItem		

});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Create instance of Collection class, to be used as the collection of to do items * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
var todoItems = new TodoItems();



todoItems.map(function(person, index) {
	console.log(person.attributes);
});

console.log(todoItems.length);

