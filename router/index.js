module.exports = function(app) {
	app.use('/api/gmail_client', require('./routes/gmail_client.routes.js'));
	app.use('/new-email', function(request,response){ 
		console.log('new Email Received', request.body);
	});
	app.use('/googleac53f0beeb7fd695.html', function(request,response){
	   console.log('Reaching Here');
       response.sendFile(__dirname+'/googleac53f0beeb7fd695.html');
    });
};