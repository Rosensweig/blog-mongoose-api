const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	}
});

blogSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`
});

blogSchema.methods.apiRepr = function() {
	return {
		title: this.title,
		content: this.content,
		author: this.authorName,
		id: this._id
	};
}

const Blog = mongoose.model('Blog', blogSchema);
module.exports = {Blog};