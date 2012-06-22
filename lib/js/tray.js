var trayIcon = air.NativeApplication.nativeApplication.icon;

var iconLoadComplete = function(event){
	trayIcon.bitmaps = [event.target.content.bitmapData];
} 

window.nativeWindow.addEventListener(air.Event.CLOSING, onClosingEvent);
	
function onClosingEvent(e) {
	window.nativeWindow.visible = false;
	e.preventDefault();
}
    
var iconLoad = new air.Loader(); 
var iconMenu = new air.NativeMenu(); 
var openCommand = iconMenu.addItem(new air.NativeMenuItem("Openen")); 
openCommand.addEventListener(air.Event.SELECT,function(event){ 
  	window.nativeWindow.visible = true; 
	window.nativeWindow.restore();
}); 

var lineBreak = iconMenu.addItem(new air.NativeMenuItem("",true)); 

var exitCommand = iconMenu.addItem(new air.NativeMenuItem("Afsluiten")); 
exitCommand.addEventListener(air.Event.SELECT,function(event){ 
 	trayIcon.bitmaps = []; 
    air.NativeApplication.nativeApplication.exit(); 
}); 

function openWindow() {
	window.nativeWindow.visible = true;
	window.nativeWindow.restore();
}
	
if (air.NativeApplication.supportsSystemTrayIcon) {
	iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
	iconLoad.load(new air.URLRequest("icons/DIRadio16.png"));
	trayIcon.addEventListener(air.MouseEvent.CLICK, openWindow);
	trayIcon.tooltip = "DI Radio";
	trayIcon.menu = iconMenu;
}
 
if (air.NativeApplication.supportsDockIcon) { 
    iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE,iconLoadComplete); 
    iconLoad.load(new air.URLRequest("icons/DIRadio128.png")); 
 	trayIcon.menu = iconMenu; 
} 