var radioList;
var player;
var s;
var timePlayed;
var timeRec;
var listenkey;
var chanID;

listenkey = air.EncryptedLocalStore.getItem('listenkey');

$(function() {
	getRadio();
	window.nativeWindow.visible = true; 
	window.nativeWindow.restore();
	//air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, invokeHandler);
});

function getRadio() {				
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (req.readyState == 4 && req.status == 200) {
			if (req.responseText.length > 0) {
				radioList = jQuery.parseJSON(req.responseText);
				document.getElementById("channellist").innerHTML = "";
			
				for ( x in radioList ) {
					var getDesc = air.EncryptedLocalStore.getItem('desc');
			
					if ( getDesc == 'true' ) { 
						var desc = radioList[x].description + '<br><br>';
					}
					else { 
						var desc = '';
					}
					
					var name = radioList[x].key;
					document.getElementById("channellist").innerHTML += '<li><a id="' + radioList[x].key + '" href="go.html">' + radioList[x].name + '</a><span id="timepl"><br>' + desc + 'Total Time Played: <span id="' + radioList[x].name.replace(' ','') + '">' + displayTime(radioList[x].name) + '</span><br></span></li>';
				}	
				
				for ( x in radioList ) {
					document.getElementById(radioList[x].key).onclick = function() { 
						try { clearInterval(timeRec); } 
						catch (e) { }		
						channelToRadio(this.innerHTML); 
					} 
				}	
				$("#channellist").children().mouseenter(function() {
					$(this).find("span").fadeIn(0)
				}).mouseleave(function() {
					$(this).find("span").fadeOut(0);
				});	
			}
			else alert("Error: Could not find channel list.")
		}
	};
	var chanlist = document.getElementById("channellist").innerHTML;
	
	if ( listenkey == null || listenkey == '' ) {
		var url = 'http://listen.di.fm/public3';
	}
	else {
		var url = 'http://listen.di.fm/premium_high';
	}
	
	req.open('GET', url, true);
	req.send(null);	
	setTimeout(function() { 
		if ( document.getElementById("channellist").innerHTML == chanlist )	{
			document.getElementById("channellist").innerHTML = '<div class="progress progress-warning progress-striped active"><div class="bar" style="width: 100%;"></div></div>';
			setTimeout(function() {
				document.getElementById("channellist").innerHTML = '<div class="progress progress-warning progress-striped"><div class="bar" style="width: 100%;"></div></div><br>Could not connect to the internet. <a href="DIRadio.html">Click here</a> to reconnect.';
			},5000);
		}
	}, 5000);
}


function channelToRadio(radio) {
	air.trace("Requested Channel: " + radio); 
	
	for ( x in radioList) {
		if (radioList[x].name == radio) {
			var plsLink = radioList[x].playlist;
			chanID = radioList[x].id;
			var patt = /premium/;
			if (patt.test(plsLink)) {
				plsLink = plsLink + '?' + listenkey;
			}
		}
	}
	
	air.trace("Playlist for Channel: " + plsLink)
	plsToStream(radio, plsLink, 1);
}

function plsToStream(station, url, number){
	air.trace("Attempting to stream " + station + " for the " + number + "th time.");
	var regex = new RegExp("File" + number + ".*");
	
	url = url.toString();
	
	var reqStream = new XMLHttpRequest();
	reqStream.onreadystatechange = function(){
		if (reqStream.readyState == 4 && reqStream.status == 200) {
			if (reqStream.responseText.length > 0) {
				var stream = regex.exec(reqStream.responseText);
				
				if (stream === null) {
					alert("Error: There is currently no stream available.");
					stopPlayer();
					return false;
				}
				
				stream = stream.toString();
				stream = stream.replace(/File[0-9]{1,3}=/, "");
				
				$("#currentSong").html("");
				
				try {
					player.stop();
					s.close()
				} 
				catch (err) {
					//air.trace("Stopping stream: " + err)
				}
				
				try {
					air.trace("Trying to access " + stream);
					s = new air.Sound();
					var request = new air.URLRequest(stream);
					var context = new air.SoundLoaderContext(8000, true);
					s.load(request, context);
					player = s.play();
					trayIcon.tooltip = "DI Radio - " + station;
					notify("DI Radio", station);
					startCount(station);
					document.getElementById("station").innerHTML = station;
					document.getElementById("none").style.display = "none";
					document.getElementById("np").style.display = "inline";
					setTimeout(function(){
						if (s.bytesLoaded < 8000) {
							air.trace("Error: Server unavailable");
							var incNumber = number + 1;
							clearInterval(timeRec);
							plsToStream(station, url, incNumber);
						}
						else {
							air.trace("Stream successfully loaded! (" + s.bytesLoaded + " bytes loaded so far)");		
							getTrackList();
						}
					}, 5000);
				} 
				catch (err) {
					air.trace("Error: " + err);
					var incNumber = number + 1;
					plsToStream(station, url, incNumber);
				}
			}
			else {
				alert("Error: Could not find playlist.")
				air.trace("Errorcode: " + reqStream.status)
			}
		}
	};
	reqStream.open('GET', url, false);
	reqStream.send(null);
}

function getTrackList() {
	var url = "http://api.audioaddict.com/v1/di/track_history/channel/"+ chanID + ".json";
	$.getJSON(url, function(data){
		for (var i=0; i<data.length; i++) {
			if ( data[i].type == "track" ) {
				$("#currentSong").html(data[i].track);
				var current = Math.round(+new Date()/1000);
				var reset = data[i].started + data[i].duration + 10 - current;
				var date = secondsToTime(reset);
				reset = reset * 1000;
				setTimeout(function() {
					getTrackList();
				}, reset); 
				break;
			}
		};
	});
}

function startCount(station) {
	timePlayed = 0;
	timeRec = setInterval(function(){ 
		timePlayed++;  
		var current = air.EncryptedLocalStore.getItem(station);
		var newTime = Number(current) + 1;
		var date = secondsToTime(newTime);
		try { document.getElementById(station.replace(' ','')).innerHTML = date.h + ":" +  date.m + ":" +  date.s;
		} catch (e) {}
		var store = new air.ByteArray();
    	store.writeUTFBytes(newTime);
		air.EncryptedLocalStore.setItem(station, store);
	}, 1000);
}

function stopPlayer() {
	document.getElementById("none").style.display = 'inline';
	document.getElementById("np").style.display = 'none';
	air.trace('Stopping Stream...'); 
	player.stop(); 
	s.close();
	clearInterval(timeRec);
}

function displayTime(station) {
	var data = air.EncryptedLocalStore.getItem(station);
	if ( data === null ) {
		return '00:00:00';
	}
	var date = secondsToTime(Number(data));
	return date.h + ":" +  date.m + ":" +  date.s;
}

function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

function newKey(key) {
	var store = new air.ByteArray();
	store.writeUTFBytes(key);
	air.EncryptedLocalStore.setItem('listenkey', store);
	document.getElementById("key").innerHTML = key;
	$("#message").html('<div class="alert alert-success">Listen Key updated!</div>');
}

function startup() {
	return air.NativeApplication.nativeApplication.startAtLogin;
}

function invokeHandler(event) {
	//air.trace("Invocation: " + event.arguments.toString());
}