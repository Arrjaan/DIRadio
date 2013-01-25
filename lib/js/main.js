var radioList;
var player;
var s;
var timePlayed;

s = "";

function startup(){
	return air.NativeApplication.nativeApplication.startAtLogin;
}

function invokeHandler(event) {
	air.trace("Invocation: " + event.arguments.toString());
	radioToPls(event.arguments.toString());
}
			
function plsToStream(station, url, number){
	air.trace("plsToStream: " + station + ", " + url + ", " + number);
	var regex = new RegExp("File" + number + ".*");
	
	url = url.toString();
	
	var reqStream = new XMLHttpRequest();
	reqStream.onreadystatechange = function(){
		air.trace("XMLHTTP: " + reqStream.readyState)
		if (reqStream.readyState == 4 && reqStream.status == 200) {
			if (reqStream.responseText.length > 0) {
				var stream = regex.exec(reqStream.responseText);
				
				if (stream === null) {
					alert("Error: Channel not found.")
					return false;
				}
				
				stream = stream.toString();
				stream = stream.replace(/File[0-9]{1,3}=/, "");
				
				try {
					player.stop();
					s.close()
				} 
				catch (err) {
					air.trace("Stopping stream: " + err)
				}
				
				try {
					air.trace(stream);
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
						air.trace("Bytes loaded: " + s.bytesLoaded);
						if (s.bytesLoaded < 8000) {
							air.trace("Error: Server unavailable");
							var incNumber = number + 1;
							plsToStream(station, url, incNumber);
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
			
function radioToPls(radio) {
	for ( x in radioList) {
		if ( radioList[x].name == radio ) return radioList[x].playlist;
	}
}

function startCount(station) {
	timePlayed = 0;
	setInterval(function(){ 
		timePlayed++;  
		var current = air.EncryptedLocalStore.getItem(station);
		var newTime = Number(current) + 1;
		var store = new air.ByteArray();
    	store.writeUTFBytes(newTime);
		air.EncryptedLocalStore.setItem(station, store);
	}, 1000);
}

function getRadio() {				
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (req.readyState == 4 && req.status == 200) {
			if (req.responseText.length > 0) {
				radioList = jQuery.parseJSON(req.responseText);
				document.getElementById("channellist").innerHTML = "";
			
				for ( x in radioList ) {
					var name = radioList[x].key;
					document.getElementById("channellist").innerHTML += '<li><a id="' + radioList[x].key + '" href="go.html">' + radioList[x].name + '</a><span id="timepl"> (Time played: ' + displayTime(radioList[x].name) + ')</span></li>';
				}	
				
				for ( x in radioList ) {
					document.getElementById(radioList[x].key).onclick = function() { channelToRadio(this.innerHTML) } 
				}	
				$("#channellist").children().mouseenter(function() {
				$(this).find("span").css("display","inline")
				}).mouseleave(function() {
				$(this).find("span").css("display", "none");
				});	
			}
			else alert("Error: Could not find channel list.")
		}
	};
	var chanlist = document.getElementById("channellist").innerHTML;
	req.open('GET', 'http://listen.di.fm/public3', true);
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
	air.trace("channelToRadio: " + radio); 
	air.trace("radioToPls: " + radioToPls(radio))
	plsToStream(radio, radioToPls(radio), 1);
}
	
function init() {
	getRadio();
	window.nativeWindow.visible = true; 
	window.nativeWindow.restore();
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, invokeHandler);
}
	
function stopPlayer(station) {
	air.trace('Stopping Stream...'); 
	player.stop(); 
	s.close();
	document.getElementById("none").style.display = 'inline';
	document.getElementById("np").style.display = 'none';
}

function displayTime(station) {
	var data = air.EncryptedLocalStore.getItem(station);
	if ( data === null ) {
		return '00:00:00';
	}
	var date = secondsToTime(Number(data));
	return date.h + ":" +  date.m + ":" +  date.s;
}

function secondsToTime(secs)
{
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
