const express = require('express');
const morgan = require('morgan');
//const postBank = require("./postBank");
const postList = require('./views/postList');
const postDetails = require('./views/postDetails');
const client = require('./db');

const app = express();

app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
	const data = await client.query(
		`
	SELECT posts.id, posts.userid, posts.title, posts.content,posts.date, upvotes.upvotes, users.name

	FROM
	posts

	JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) as upvotes
	ON posts.id = upvotes.postid
	
	JOIN users
	ON posts.userid = users.id
	`
	);

	const posts = data.rows;
	res.send(postList(posts));
});

app.get('/posts/:id', async (req, res) => {
	const data = await client.query(
		`
	SELECT * from posts 
	
	JOIN users
	ON posts.userid = users.id
	
	WHERE posts.id = $1
	`,
		[req.params.id]
	);
	const post = data.rows[0];
	res.send(postDetails(post));
});

app.get('/search', async (req, res) => {
	let searchTerms = '%' + req.query.searchString + '%';

	const data = await client.query(
		`
	SELECT posts.id, posts.userid, posts.title, posts.content,posts.date, upvotes.upvotes, users.name

	FROM
	posts

	JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) as upvotes
	ON posts.id = upvotes.postid
	
	JOIN users
	ON posts.userid = users.id
	
	WHERE

	posts.content LIKE $1::text 
	OR
	posts.title LIKE $1::text
	
		`,
		[searchTerms]
	);

	const posts = data.rows;
	res.send(postList(posts));
});

app.get('/delete/:id', async (req, res) => {
	await client.query(
		`
		DELETE
		from
		upvotes	
		WHERE
		postid = $1;
		`,
		[req.params.id]
	);

	await client.query(
		`
		DELETE 
		from
		posts
		WHERE
		id =  $1;
		`,
		[req.params.id]
	);

	res.redirect('/');
});

const PORT = process.env.PORT || 1337;

app.listen(PORT, () => {
	console.log(`App listening in port ${PORT}`);
});
