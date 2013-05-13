function notify(title,msg) {
				var options = new air.NativeWindowInitOptions();
 
				options.type = air.NativeWindowType.LIGHTWEIGHT;
				options.transparent = true;
				options.systemChrome = air.NativeWindowSystemChrome.NONE;
				
				var bounds = null;
				var screen = air.Screen.mainScreen.visibleBounds;
				var windowHeight = 150;
				var windowWidth = 400;
				 
				bounds = new air.Rectangle(
					screen.width - windowWidth - 10,
					screen.height - windowHeight - 10,
					windowWidth,
					windowHeight
				);
				
				var notification = air.HTMLLoader.createRootWindow( 
					true, 
					options, 
					false, 
					bounds 
				);
				
				notification.paintsDefaultBackground = false;
				notification.stage.nativeWindow.alwaysInFront = true;
				notification.navigateInSystemBrowser = true;
				
				var msgFile = air.File.applicationStorageDirectory; 
				msgFile = msgFile.resolvePath("msg.txt");
				
				var textStream = new air.FileStream();
			    var file = textStream.open(msgFile, air.FileMode.WRITE);
			    var content = textStream.writeUTFBytes(title + "|" + msg);
			    textStream.close();
				
				var NOTIFY_SOURCE = "notify.html";
				notification.load( new air.URLRequest( NOTIFY_SOURCE ) );
}

function notifyTrack(track) {
	var options = new air.NativeWindowInitOptions();
 
	options.type = air.NativeWindowType.LIGHTWEIGHT;
	options.transparent = true;
	options.systemChrome = air.NativeWindowSystemChrome.NONE;
				
	var bounds = null;
	var screen = air.Screen.mainScreen.visibleBounds;
	var windowHeight = 100;
	var windowWidth = 500;
		 
	bounds = new air.Rectangle(
		screen.width - windowWidth - 10,
		screen.height - windowHeight - 10,
		windowWidth,
		windowHeight
	);
				
	var notification = air.HTMLLoader.createRootWindow( 
		true, 
		options, 
		false, 
		bounds 
	);
	
	notification.paintsDefaultBackground = false;
	notification.stage.nativeWindow.alwaysInFront = true;
	notification.navigateInSystemBrowser = true;
	
	var msgFile = air.File.applicationStorageDirectory; 
	msgFile = msgFile.resolvePath("msg.txt");
	
	var fs = new air.FileStream();
	fs.open(msgFile, air.FileMode.READ);
	var oldMsg = fs.readUTFBytes(fs.bytesAvailable);
	var newMsg = "TITLE|" + track;
	fs.close();
	
	if (oldMsg !== newMsg) {
		var fs = new air.FileStream();
		fs.open(msgFile, air.FileMode.WRITE);
		fs.writeUTFBytes(newMsg);
		fs.close();
		
		var NOTIFY_SOURCE = "notify.html";
		notification.load(new air.URLRequest(NOTIFY_SOURCE));
	}
}