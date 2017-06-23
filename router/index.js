module.exports = function(app) {
	app.use('/api/gmail_client', require('./routes/gmail_client.routes.js'));
};