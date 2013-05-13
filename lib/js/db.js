var firstrun = air.EncryptedLocalStore.getItem('firstrun');
var dbStatus = false;
var selectStmt;

if ( firstrun == null || firstrun == '' ) {
	air.trace("Running DI Radio for the first time!");
	air.trace("[DB] Building Database.");
	var conn = new air.SQLConnection(); 
	     
	conn.addEventListener(air.SQLEvent.OPEN, openFirstHandler); 
	conn.addEventListener(air.SQLErrorEvent.ERROR, errorHandler); 
	     
	// The database file is in the application storage directory 
	var folder = air.File.applicationStorageDirectory; 
	var dbFile = folder.resolvePath("DIRadio.db"); 
	     
	conn.openAsync(dbFile); 
}
else {
	air.trace("[DB] Opening Database.");
	var conn = new air.SQLConnection(); 
	     
	conn.addEventListener(air.SQLEvent.OPEN, openHandler); 
	conn.addEventListener(air.SQLErrorEvent.ERROR, errorHandler); 
	     
	// The database file is in the application storage directory 
	var folder = air.File.applicationStorageDirectory; 
	var dbFile = folder.resolvePath("DIRadio.db"); 
	     
	conn.openAsync(dbFile); 
}

function openFirstHandler(event) { 
	air.trace("[DB] The database was created successfully."); 
	
	var createStmt = new air.SQLStatement(); 
	createStmt.sqlConnection = conn; 
	     
	var sql =  
	    "CREATE TABLE IF NOT EXISTS tracks (" +  
	    "    id INTEGER PRIMARY KEY AUTOINCREMENT, " +  
	    "    artist TEXT, " +  
	    "    track TEXT, " +  
	    "    rating NUMERIC" +  
	    ")"; 
	createStmt.text = sql; 
	     
	createStmt.addEventListener(air.SQLEvent.RESULT, createResult); 
	createStmt.addEventListener(air.SQLErrorEvent.ERROR, errorHandler); 
	     
	createStmt.execute(); 
} 

function openHandler(event) { 
	air.trace("[DB] Database ready."); 
	dbstatus = true;
} 
	     
function errorHandler(event) { 
	air.trace("[DB] Error message:", event.error.message); 
	air.trace("[DB] Details:", event.error.details); 
}

function createResult(event) { 
    air.trace("[DB] Table created, database ready."); 
	dbstatus = true;
} 

function addFav(artist, track) {
	// create the SQL statement 
	var insertStmt = new air.SQLStatement(); 
	insertStmt.sqlConnection = conn; 
	     
	// define the SQL text 
	var sql =  
	    "INSERT INTO tracks (artist, track, rating) " +  
	    "VALUES ('" + artist + "', '" + track + "', 0)"; 
	insertStmt.text = sql; 
	     
	// register listeners for the result and failure (status) events 
	insertStmt.addEventListener(air.SQLEvent.RESULT, insertResult); 
	insertStmt.addEventListener(air.SQLErrorEvent.ERROR, errorHandler); 
	     
	// execute the statement 
	insertStmt.execute(); 
	     
}

function insertResult(event) { 
    air.trace("[DB] INSERT statement succeeded."); 
} 

function getFavs() {
	selectStmt = new air.SQLStatement();
	
	// A SQLConnection named "conn" has been created previously 
	selectStmt.sqlConnection = conn;
	
	selectStmt.text = "SELECT artist, track, rating FROM tracks";
	
	selectStmt.addEventListener(air.SQLEvent.RESULT, buildTable);
	selectStmt.addEventListener(air.SQLErrorEvent.ERROR, errorHandler);
	
	selectStmt.execute();
}

function buildTable(event) { 
    var result = selectStmt.getResult(); 
    var numResults = result.data.length; 
	var html = '<h3>Favorites</h3>'; 
	html += '<table class="table table-condensed">';
	html += '<thead>';
	html += '<tr><th>Artist</th><th>Trackname</th><!--<th>Rating</th>--><th>Search</th></tr>';
	html += '</thead>';
	html += '<tbody>';
    for (i = 0; i < numResults; i++) { 
        var row = result.data[i]; 
		html += '<tr><td>' + row.artist + '</td><td>' + row.track + '</td><!--<td>' + row.rating + '</td>-->' +
		'<td><a href="http://www.beatport.com/search?query=' + escape(row.artist + ' ' + row.track) + '" target="_blank"><img src="/lib/layout/img/beatport.jpg"></a>' +
		'&nbsp;&nbsp;&nbsp;<a href="http://www.youtube.com/results?search_query=' + escape(row.artist + ' ' + row.track) + '" target="_blank"><img src="/lib/layout/img/youtube.png"></a></tr>';
    } 
	html += '</tbody>';
	html += '</table>';
	$("#wrap").html(html);
} 

