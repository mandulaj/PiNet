import socket
import os

SOCKET = "test.sock"

if os.path.exists(SOCKET):
    os.remove(SOCKET)

sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.bind(SOCKET)
sock.listen(1)

try:
    while True:
        (client, address) = sock.accept()
        data = ""
        newData = ""
        while True:
            while True:
              chunk = client.recv(1024)
              if chunk == "":
                data = ""
                break
              delim = chunk.find("&")
              if delim == -1:
                newData += chunk
              else:
                newData += chunk[:delim]
                data = newData
                newData = chunk[delim + 1:]
                break
            print ""
            print "NEW DATA"
            print ""
            if data == "":
                break
            print data
        client.close()
        print "Close"
except KeyboardInterrupt:
    os.remove(SOCKET)
