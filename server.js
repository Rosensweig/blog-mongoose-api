const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require ('./models');

const app = express();
app.use(bodyParser.json());

app.get('/newblog/:title/:content', (req,res) => {
	Blog.create({title:req.params.title, content:req.params.content}, function(err,data){
		if(!err){
			res.send(data);
		}
	});
});

app.get('/blog', (req, res) => {
	Blog.find().exec()
	.then(blogPosts => {
		res.json({
			blogPosts: blogPosts.map(
				(blogPost) => blogPost.apiRepr())
		});
	}).catch(
	err => {
		console.error(err);
		res.status(500).json({message: "Internal server error."});
	});
});

app.get('/blog/:id', (req, res) => {
	Blog.findById(req.params.id)
	.exec()
	.then(blogPost => res.json(blogPost.apiRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error.'});
	});
});

app.post('/blog', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	requiredFields.forEach(field => {
		if (! (field in req.body && req.body[field])) {
			return res.status(400).json({message: `Must specify value for ${field}.`});
		}
	});
	if (! (req.body.author.firstName && req.body.author.lastName)) {
		return res.status(400).json({message: 'Must provide both firstName and lastName for author.'});
	}


	Blog.create({
		title: req.body.title,
		content: req.body.content,
		author: {
			firstName: req.body.author.firstName,
			lastName: req.body.author.lastName
		}
	})
	.then(blogPost => res.status(201).json(blogPost.apiRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error.'});
	})
});

app.put('/blog/:id', (req, res) => {
	const toUpdate = {};
	const updateableFields = ['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Blog.findByIdAndUpdate(req.params.id, {$set: toUpdate})
	.exec()
	.then(blogPost => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blog/:id', (req, res) => {
	Blog.findByIdAndRemove(req.params.id)
	.exec()
	.then(blogPost => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error.'}));
});

app.use('*', (req, res) => {
	res.status(404).json({message: 'Not found.'});
});


let server;
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your ap is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};