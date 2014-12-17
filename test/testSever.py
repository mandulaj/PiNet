import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(("127.0.0.1", 8800))
sock.listen(1)

while True:
    (clientsocket, address) = sock.accept()
    while 1:
        data = clientsocket.recv(8192)
        if data == "":
            break
        print data
    print "Close"
