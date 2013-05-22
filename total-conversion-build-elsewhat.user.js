// ==UserScript==
// @id             iitc-plugin-portal-logger@elsewhat
// @name           IITC plugin: portal logger
// @version        0.4
// @namespace      https://github.com/elsewhat
// @description    Tries to log all portals that are viewed
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalLogger = function() {};

window.plugin.portalLogger.setupCallback = function() {
  $('#toolbox').append('<a onclick="window.plugin.portalLogger.displayLoggedPortals()">show logged portals</a> ');
  $('#toolbox').append('<a onclick="window.plugin.portalLogger.resetLoggedPortals()">reset logged portals</a> ');
  $('#toolbox').append('<a onclick="window.plugin.portalLogger.export()">Export logged(.kml)</a>');
  addHook('portalAdded', window.plugin.portalLogger.extractPortalData);
}

var loggedPortals = [];

if (!String.prototype.encodeXML) {
  String.prototype.encodeXML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;');
  };
}



window.plugin.portalLogger.extractPortalData = function(data) {
	console.log(data);
	var name =  data.portal.options.details.portalV2.descriptiveText.TITLE;
	var address = data.portal.options.details.portalV2.descriptiveText.ADDRESS;
	var img = data.portal.options.details.imageByUrl && data.portal.options.details.imageByUrl.imageUrl ? data.portal.options.details.imageByUrl.imageUrl : DEFAULT_PORTAL_IMG;
	var team = data.portal.options.team;
	
	
	var capturedTime = 0; 
	var capturingPlayerId = 0;
	var capturingPlayerName=null;
	
	if(team!=0){
		capturedTime=data.portal.options.details.captured.capturedTime;
		capturingPlayerId= data.portal.options.details.captured.capturingPlayerId;
		capturingPlayerName  = getPlayerName(capturingPlayerId);
		console.log(capturingPlayerId + ' is ' + capturingPlayerName);
	}
	
	
	name= name.encodeXML();
	address= address.encodeXML();
	

	var level = getPortalLevel(data.portal.options.details).toFixed(2);
	var guid = data.portal.options.guid;
	var resonators = [];
	var shields = [];
	var energy = 0;
	var maxenergy=0;


	var thisPortal = {'name':name,'team':team,'level':level,'guid':guid, 'resonators':resonators,'energyratio' : 0, 'shields':shields, 'energy': energy, 'maxenergy':maxenergy, 'lat':data.portal._latlng.lat, 'lng':data.portal._latlng.lng, 'address': address, 'img' : img,'capturedTime':capturedTime,'capturingPlayerId':capturingPlayerId, 'capturingPlayerName':capturingPlayerName};

	//remove any existing entries with the same guid
	//TODO: could be rewritten to use a different datastructure (guid as hash key)
	for(var i=loggedPortals.length-1; i >= 0; i--){
		if(loggedPortals[i].guid==guid){
			//remove the current element
			console.log(guid + ' already exist. Removing old entry');
			loggedPortals.splice(i,1);	
		}
	
	}


	loggedPortals.push(thisPortal);
	console.log(thisPortal);
	console.log(loggedPortals.length + ' portals identified so far'); 
}


window.plugin.portalLogger.resetLoggedPortals = function(data) {
  console.log('Resetting logged portals');
  loggedPortals = [];
}


window.plugin.portalLogger.displayLoggedPortals = function() {
  alert('Todo: display logged portals');
  /*var playersRes = {};
  var playersEnl = {};
  $.each(window.portals, function(ind, portal) {
    var r = portal.options.details.resonatorArray.resonators;
    $.each(r, function(ind, reso) {
      if(!reso) return true;
      var lvl = localStorage['level-' + reso.ownerGuid];
      var nick = getPlayerName(reso.ownerGuid);
      if(portal.options.team === TEAM_ENL)
        playersEnl[nick] = lvl;
      else
        playersRes[nick] = lvl;
    });
  });

  var s = 'the players have at least the following level:\n\n';
  s += 'Resistance:\t&nbsp;&nbsp;&nbsp;\tEnlightened:\t\n';

  var namesR = plugin.portalLogger.sort(playersRes);
  var namesE = plugin.portalLogger.sort(playersEnl);
  var totallvlR = 0;
  var totallvlE = 0;
  var max = Math.max(namesR.length, namesE.length);
  for(var i = 0; i < max; i++) {
    var nickR = namesR[i];
    var lvlR = playersRes[nickR];
    var lineR = nickR ? nickR + ':\t' + lvlR : '\t';
    if(!isNaN(parseInt(lvlR)))
        totallvlR += parseInt(lvlR);

    var nickE = namesE[i];
    var lvlE = playersEnl[nickE];
    var lineE = nickE ? nickE + ':\t' + lvlE : '\t';
    if(!isNaN(parseInt(lvlE)))
        totallvlE += parseInt(lvlE);

    s += '\n'+lineR + '\t' + lineE + '\n';
  }
  s += '\nTotal level :\t'+totallvlR+'\tTotal level :\t'+totallvlE;
  s += '\nTotal player:\t'+namesR.length+'\tTotal player:\t'+namesE.length;
  var averageR = 0, averageE = 0;
  if (namesR.length > 0)  averageR = (totallvlR/namesR.length);
  if (namesE.length > 0)  averageE = (totallvlE/namesE.length);
  s += '\nAverage level:\t'+averageR.toFixed(2)+'\tAverage level:\t'+averageE.toFixed(2);
  s += '\n\nIf there are some unresolved names, simply try again.'
  //console.log(s);
  */
}

window.plugin.portalLogger.export = function(){
    //alert('format :' + fileformat);
    var file = '';
    var uri = '';
    

    file = window.plugin.portalLogger.exportKML();

    console.log(file);
    if (file !== '') {
       //http://stackoverflow.com/questions/4639372/export-to-csv-in-jquery
       var uri = 'data:application/kmlcsv;charset=UTF-8,' + encodeURIComponent(file);
       //window.open(uri);
    }
    
    window.location=uri;
    //return uri;
}

//from https://github.com/jonatkins/ingress-intel-total-conversion/blob/master/plugins/portals-list.user.js
window.plugin.portalLogger.exportKML = function(){
    var kml = '';
   
   
   //headers
    kml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>\n'
    + '<name>Ingress Export</name><description><![CDATA[Ingress Portals\n' + new Date().toLocaleString() + ']]></description>';
    
    // define colored markers as style0 (neutral), style1 (Resistance), style2 (Enlight)
    kml += '<Style id="style1"><IconStyle><Icon><href>http://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png</href></Icon></IconStyle></Style>'
    + '<Style id="style2"><IconStyle><Icon><href>http://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png</href></Icon></IconStyle></Style>'
    + '<Style id="style0"><IconStyle><Icon><href>http://maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png</href></Icon></IconStyle></Style>\n';
    
    $.each(loggedPortals, function(ind, portal) {
    	//console.log(portal.capturingPlayerId + ' is ' + getPlayerName(portal.capturingPlayerId));
    
    
        // add the portal in the kml file only if part of the filter choice
	    // description contain picture of the portal, address and link to the Intel map
	    var description = '<![CDATA['
	    + '<div><table><tr><td><img style="width:100px" src="' + portal.img + '"></td><td>' + portal.address 
	    + '<br><a href="https://ingress.com/intel?latE6=' + portal.lat*1E6 + '&lngE6=' + portal.lng*1E6 + '&z=17">Link to Intel Map</a></td></tr></table>'
	    + ']]>';

	    kml += '<Placemark><name>L' + Math.floor(portal.level) + ' - ' + portal.name + '</name>'
	    + '<description>' +  description + '</description>'
	    + '<styleUrl>#style' + portal.team + '</styleUrl>';

	    //coordinates
	    kml += '<Point><coordinates>' + portal.lng + ',' + portal.lat + ',0</coordinates></Point>';           
	    kml += '<ExtendedData>';
	    kml += '<Data name="team"><value>'+portal.team+'</value></Data>';
	    kml += '<Data name="level"><value>'+Math.floor(portal.level)+'</value></Data>';
	    kml += '<Data name="guid"><value>'+portal.guid+'</value></Data>';
	    kml += '<Data name="capturedTime"><value>'+portal.capturedTime+'</value></Data>';
	    kml += '<Data name="capturingPlayerId"><value>'+portal.capturingPlayerId+'</value></Data>';
	    kml += '<Data name="capturingPlayerName"><value>'+portal.capturingPlayerName+'</value></Data>';
	    kml += '</ExtendedData>';
	    kml += '</Placemark>\n';
	    
    });
	kml += '</Document></kml>';
	console.log(kml);
    return kml;
}



var setup =  function() {
  window.plugin.portalLogger.setupCallback();
}

// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);