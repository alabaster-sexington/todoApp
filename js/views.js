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
			'click .close' : 'deleteItem',
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

		deleteItem: function(e, $thisItem) {
			console.log("Items in collection before delete: "  + todoItems.length);

			//Get list item wrapper to remove it
			$thisItem = $(e.target).closest(".item-wrapper");

			//Remove list tiem wrapper from DOM
			$thisItem.fadeOut({
				duration: 200,
				done: function() {
					$(this).remove();
				}
			});

			//Remmove model from collection
			todoItems.remove(this.model);
			console.log("Items in collection after delete: "  + todoItems.length);
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
		},

		collection: todoItems,		

		template: _.template('<span class="items-number">' 
			+ '<span class="items-left"><%= this.returnItemsLeft() %></span>' 
			+ '<% if (this.returnItemsLeft() === 1) { %> item <% } %><% if (this.returnItemsLeft() !== 1) { %> items <% } %>' 
			+ 'left to do.</span>'),

		returnItemsLeft: function() {
			return this.collection.length;
		},

		render: function() {
			this.$el.html(this.template());
			this.$el.insertAfter(".items");
		}

	});

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Create new legend view instance and attach it to the DOM * 
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	 var legend = new Legend();

	 legend.render();	 

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Create a new Backbone View that will hold the collection of list items *
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	var TodoListView = Backbone.View.extend({

		initialize: function() {
			this.$el.addClass("todoListView");
			this.collection.on("add", this.addItem, this);
		},

		render: function() {

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
	

