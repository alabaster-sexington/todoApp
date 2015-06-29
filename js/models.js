/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Create Individual TodoItem Model (to be used as the base model in the TodoItems collection) * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * * * * * * * * * * * * * */

var todoItem = Backbone.Model.extend({
	defaults: {
		"description" : "not specified",
		"status" : "incomplete",
		"display" : "true"
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
	model: todoItem,

	filterActiveItems: function() {
		console.log("filtering active items");
		
		var completedItems = this.where({"status" :"complete"}),
			activeItems    = this.where({"status": "incomplete"});			
		
		_.each(completedItems, function(item) {

			item.set("display", "false");

		});

		_.each(activeItems, function(item) {

			item.set("display", "true");

		});

		return completedItems;
	},

	filterCompletedItems: function() {
		
		console.log("filtering completed items");
		var activeItems 	= this.where({"status" :"incomplete"}),
			completedItems  = this.where({"status" :"complete"})			
		//console.dir(completedItems[1]);

		_.each(activeItems, function(item) {

			item.set("display", "false");

		});

		_.each(completedItems, function(item) {

			item.set("display", "true");

		});

		return activeItems;
	},

	activeItems: function() {
		return this.where({"status" : "incomplete"});
	},

	completedItems: function() {
		return this.where({"status" : "complete"});
	}
	

});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Create instance of Collection class, to be used as the collection of to do items * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
var todoItems = new TodoItems();

