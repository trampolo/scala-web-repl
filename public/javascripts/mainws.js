// main js script
var socket;

$(document).ready(function() {
  localStorage["commandHistory"] = ""; // empty from the beginning
  var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
  socket = new WS(wsUrl());
  socket.onmessage = onMessage;
  
  $(document).keydown(onKey);
  window.setInterval(function() { $('#prompt').focus(); }, 500);
});

function onKey(event) {
  switch(event.which) {
    case 13: // ENTER
      var prompt = $('#prompt');
      var command = prompt.val();
      history.save(command);
      var prev = $('<div class="prev"></div>');
      prev.text("> " + command);
      $('#result').append(prev);
      socket.send(command);
      prompt.val('');
      history.reset();
      break;
    case 38: // UP
      var prompt = $('#prompt');
      var hist = history.getPrevCmd();
      if (hist != null) { 
        prompt.val(hist);
        event.preventDefault();
      }
      break;
    case 40: // DOWN
      var prompt = $('#prompt');
      var hist = history.getNextCmd();
      if (hist != null) { 
        prompt.val(hist);
        event.preventDefault();
      }
      break;
  }
}


var history = {
  histPntr: 0,
  // reset history
  reset: function() { this.histPntr = 0; },
  // return prev command or null
  getPrevCmd: function() {
    var hist = this.getAll();
    console.log("prev: [" + hist + "] pntr=" + this.histPntr);
    if (hist.length-1 > this.histPntr && this.histPntr >= 0) 
      return hist[this.histPntr++];
    else
      return null;
  },
  // return next command or null
  getNextCmd: function() {
    this.histPntr--;
    var hist = this.getAll();
    console.log("next: [" + hist + "] pntr=" + this.histPntr);
    if (hist.length-1 > this.histPntr && this.histPntr >= 0) 
      return hist[this.histPntr];
    else {
      this.histPntr++;
      return null;
    }
  },
  // save to local storage
  save: function(cmd) {
    var lines = this.getAll();
    lines.splice(0, 0, cmd);
    var hist = "";
    for(i in lines) {
      var line = lines[i];
      if (line.length > 0) hist += line + "\n";
    }
    localStorage["commandHistory"] = hist;
  },
  // return am array of commands
  // ordered, most recent on top
  // never null
  getAll: function() {
    var hist = localStorage["commandHistory"];
    var lines = hist.split(/\n/);
    return lines;
  }
}

// on socket message received
// the string is splitted to lines 
// and every line is added as a 
// separate div to result
function onMessage(event) {
  var lines = event.data.split(/\n/);
  for(i in lines) {
    addLineToResult(lines[i]);
  }
  $('#repl').scrollTop($('#repl').height())
}

// invoked when message is recieved
function addLineToResult(str) {
  var line = $('<div/>');
  line.text(str);
  $('#result').append(line);
}