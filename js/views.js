//IIFE
(function($) {

//DOM Ready
$(function() {
	"use strict";

	/* * * * * * * * * * * *
	 * Entire TodoApp View *
	 * * * * * * * * * * * */

	var TodoApp = Backbone.View.extend({

		el: $("#wrapper"),

		initialize: function() {
			console.log("App has been initialized");			
		},

		events: {
			'keyup #newTodo' : 'createOnEnter'
		},

		createOnEnter: function(e) {
				
			if(e.keyCode !== 13) return;
			
			//"this" is the view object in Backbone.js - e.target will be the input where you're typing
			//in your todos, or whatever "thing" you've attached the event listener to

			var $input = $(e.target);

			var val = $input.val();
			
			//Create New TodoItem on enter				
			todoItems.create({
				description: val,
				status: "incomplete"
			});
			
			//Reset Input after
			$input.val('');
			
		}

	});

	
	/* * * * * * * * * * * * * * * * * * * * *
	 * Individual Todo Item View (list item) *
	 * * * * * * * * * * * * * * * * * * * * */

	var TodoView = Backbone.View.extend({

		initialize: function() {
			console.log("New Todo-item created");			
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.deleteModel, this);								
			_.bindAll(this, "saveOnBlur");

		},

		template: _.template('<input type=checkbox ' 
			+ '<% if(status === "complete") print("checked") %>/>' 
			+ '<span class="<%= status %>">' + '<%= description %>' + '</span>'
			+ '<span class="edit">edit</span>'
			+ '<span class="close">x</span>'),

		render: function() {						
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.addClass("item-wrapper");
			return this;
		},

		events: {
			'change input' : 'toggleCheckbox',
			'click .close' : 'deleteModel',
			'click .edit' : 'editText',
			'blur .textarea' : 'saveOnBlur'				
		},

		toggleCheckbox: function() {
			this.model.toggleCheckbox();
			this.render();
		},

		editText: function(e) {
			//Get text span
			var $span 	  	  = $(e.target).closest(".item-wrapper").find(".incomplete"),
				spanValue 	  = $span.html(),
				$textArea 	  = $("<textarea />"),
				currentStatus = this.model.get("status");				
			
			$textArea.addClass("textarea");	
			//replaceWith returns the element that was just replaced				
			var removedItem = $span.replaceWith($textArea);

			console.log("Description before edit: " + this.model.get("description"));						
			
			
		},

		saveOnBlur: function(e) {			
			console.log("save on blurring");
			var $textArea 	  = $(e.target),
			 	textAreaValue = $(e.target).val(),
			 	$span 		  = $("<span></span>"),
			 	currentStatus = this.model.get("status");						
			
			console.log("target: " + $(e.target).val())
			$span.addClass(currentStatus);
			$span.html(textAreaValue);

			var $newElement = $textArea.replaceWith($span),
				spanHtml	= $span.html();

			console.log("this: " + this);
			this.model.save({"description" : spanHtml});

			console.log("Description after edit: " + this.model.get("description"));
			
		},	

		deleteModel: function() {			
			this.$el.remove();
			todoItems.remove(this.model);
		}

	});

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Backbone View that shows list item information underneath the todo list *
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	var Legend = Backbone.View.extend({		

		initialize: function() {
			console.log("List item legend created");
			this.$el.addClass("items-legend");

			/* Why the third argument 'this' in '.on'? on has no way of knowing what 'this' means in this.render, 
			it just sees a function; on won't even know the difference between the call above and this:

			this.model.on('change', function() { ... });

			The on call sees only two things:

			The event name, a simple string.
			The handler, a function.

			More: http://stackoverflow.com/questions/13132970/why-does-backbone-js-models-on-take-this-as-last-parameter-if-its-almost */

			this.collection.on("add", this.render, this);
			this.collection.on("remove", this.render, this);



			//The change event triggers when a model inside the collection changes. This is for the toggleCheckbox trigger
			//so that the legend updates.
			this.collection.on("change", this.render, this);			
		},

		collection: todoItems,		

		template: _.template($("#remaining-items").html()),

		events: {
			'click .clear-completed' : 'clearCompleted',
			'click .items-left.active' : 'showActive',
			'click .items-left.completed' : 'showCompleted'
		},

		totalItemsLeft: function() {
			return this.collection.length;
		},

		activeItemsLeft: function() {
			return this.collection.activeItems().length;
		},

		completedItems: function() {
			return this.collection.completedItems().length;
		},

		showActive: function() {
			console.log("active items");
			this.collection.activeItems();

		},

		showCompleted: function() {
			this.collection.completedItems();
		},

		//Thing to remember: the variables and functions declared inside the render function are accessible
		//inside the HTML markup. This is how the html files references the totalItems, activeItems and 
		//completedItems variables below. Remember that even though the html markup exists inside the 
		//<script type="text/template"> ... </script> tags, it still needs to be inserted into the DOM
		//by doing an append, insertAfter, etc. (done below)
		render: function() {			

			var totalItems  = this.totalItemsLeft(),
				activeItems = this.activeItemsLeft(),
				completedItems = this.completedItems();

			this.$el.html(this.template({
				totalItems: totalItems,
				activeItems: activeItems,
				completedItems: completedItems
			}));

			this.$el.insertAfter(".items");
		},

		clearCompleted: function() {
			//Invoke takes a list as its first parameter, the second is the method you apply to each item
			//completedItems() returns the models that are completed, and then each one has the "destroy"
			//method applied to them
			_.invoke(this.collection.completedItems(), "destroy");
		}

	});

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Create new legend view instance and attach it to the DOM * 
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	 var legend = new Legend({collection: todoItems});

	 legend.render();


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Create a new Backbone View that will hold the collection of list items *
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	var TodoListView = Backbone.View.extend({

		initialize: function() {
			this.$el.addClass("todoListView");
			this.collection.on("add", this.addItem, this);
			this.collection.on("reset", this.render, this);			
		},

		render: function() {

			this.$el.empty();
			this.collection.forEach(this.addItem, this);

			return this;
		},

		addItem: function(todoItem) {
			//new single view for every time in the collection.
			//these items inherit the properties from the TodoView (above)
			var todoView = new TodoView({model: todoItem});
			this.$el.append(todoView.render().el);
		}

	});
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * * 
	 * Create todoList, an instance of the collection view and pass it the collection model *
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * */

	var todoList = new TodoListView({collection: todoItems});

	/* * * * * 
	 * Debug *
	 * * * * */

	 var Debug = Backbone.View.extend({

	 	initialize: function() {
	 		this.collection.on("add", this.render, this);
	 		this.collection.on("reset", this.render, this);
	 		this.collection.on("change", this.render, this);
	 		this.$el.appendTo(".debug-wrapper");
	 	},

	 	collection: todoItems,

	 	template: _.template($("#debug").html()),

	 	render: function() {
	 		var length = this.collection.length,
	 			activeItems = this.collection.activeItems().length,
	 			completedItems = this.collection.completedItems().length;

	 		this.$el.html(this.template({
	 			length: length,
	 			activeItems: activeItems,
	 			completedItems: completedItems
	 		}));	 		
	 	}

	 });

	 var debug = new Debug();
	 debug.render();

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * * * *
	 * Append each model to the collection el by using the methods from the TodoListView class, *
	 * which will populate the html (each list item) in the list view el, but it will not show  *
	 * on the front end until you append the list view to the DOM, done below. 					*					*
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  * * */

	todoList.render();


	/* * * * * * * * * * * * * * * * * * 
	 * Append the list view to the DOM *
	 * * * * * * * * * * * * * * * * * */

	var $itemsWrapper = $(".items");

	//Append to DOM element
	todoList.$el.appendTo($itemsWrapper);
	console.log(todoList.el);

	var App = new TodoApp();
	

});
	

})(jQuery);
	

