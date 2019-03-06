import ws from "k6/ws";
import { check, crpyto } from "k6";

import proto from "./demo_pb.js"


export default function() {
    let url_array = ["ws://", "127.0.0.1:9999", "/ws"]
    var url = url_array.join("")
  
  var response = ws.connect(url, null, function (socket) {
    socket.on('open', function open() {
      console.log('connected');
      var message_proto = new proto.Message()
      message_proto.setText("hello")
      let message = message_proto.serializeBinary()
     
      socket.send(message);

      socket.setInterval(function timeout() {
        var hearbeat = new proto.Heartbeat()
        socket.send(hearbeat.serializeBinary());
        console.log("Heart beat every 15 sec");
      }, 15000);
    });

    socket.on('message', function (message) {
      console.log(`Received message: ${message}`);
    });

    socket.on('close', function () {
      console.log('disconnected');
    });

    socket.on('error', function (e) {
      if (e.error() != "websocket: close sent") {
        console.log('An unexpected error occured: ', e.error());
      }
    });

    socket.setTimeout(function () {
      console.log('2 seconds passed, closing the socket');
      socket.close();
    }, 30000);
  });

  check(response, { "status is 101": (r) => r && r.status === 101 });
}