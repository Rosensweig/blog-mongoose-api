const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	},
	timestamps: true
});

blogSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`
});

blogSchema.virtual('created').get(function() {
	return this.timestamps.createdAt;
});

blogSchema.methods.apiRepr = function() {
	return {
		title: this.title,
		content: this.content,
		author: this.authorName,
		created: this.created,
		id: this._id
	};
};