#!/usr/bin/python

# Network driver used to route commands from the network to the robot
#
# class NetworkDriver
#

import socket
import sys
import json
import threading
import RobotHelper


class NetworkDriver():

    """Network driver responsible for receiving and parsing external data and forwarding them to the robot"""

    def __init__(self, host, port, robot):
        self.Robot = robot
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # sets up the socket
        self.serverThread = threading.Thread(target=self.acceptRequests)  # the server runs in it's own thread
        self.serverThreadExitEv = threading.Event()  # event used to quit the server

        try:
            # binds the port and host to the socket
            self.server.bind((host, port))
            # Only except in case of socket errors
        except():  # error handling for the bind
            print("Error making Socket!")
            sys.exit(1)
        else:
            self.server.listen(1)
        print("Success in setting up socket")
        print("Server running on: " + str(host) + ":" + str(port))

    def parseData(self, data):
        """function parsing the json commands and directing them to the robot"""
        data = json.loads(data)
        print data
        if data['message'] == "commands":
            # send the data to the robot
            data = data['commands'] # TODO: do this for mission too!!!
            self.sendCommands({
                "keys": data['keys'],
                "cam": data['camMove'],
                "speed": data['speed'],
                "light": data['light'],
                "laser": data['laser'],
                "ai": data['ai']
            })

        elif data['message'] == "mission":
            if data['status'] == "start":
                self.Robot.startMission(data['moves'])
            elif data['status'] == "stop":
                self.Robot.stopMission()

    def getDirection(self, keys):
        """find the direction from the key configuration"""

        if keys == [0, 0, 0, 0]:
            return None

        direction = ""

        if keys[0] == 1:
            direction += "F"
        elif keys[2] == 1:
            direction += "B"

        if keys[1] == 1:
            direction += "L"
        elif keys[3] == 1:
            direction += "R"

        return RobotHelper.getDirection(direction)

    def acceptRequests(self):
        """main loop for listening on a socket and reading its data input"""
        try:
            while not self.serverThreadExitEv.is_set():
                (conn, address) = self.server.accept()
                while True:
                    data = conn.recv(8192)
                    if self.serverThreadExitEv.is_set():
                        return
                    if not data:
                        break

                    self.parseData(data)  # parse it
                conn.close()
                print 'close'

        except KeyboardInterrupt:  # catches Ctrl-C Keyboard-Interrupt
            print("Exiting...\n")
        #finally:
            # final clean-up
        #    self.Robot.closeMe()
        #    self.server.shutdown(socket.SHUT_RDWR)
        #    self.server.close()
        #    print("Exiting...")
        #    print('dead')
        #    sys.exit(0)

    def sendCommands(self, commands):
        """write commands to the underlying robot"""

        direction = self.getDirection(commands['keys'])
        speed = commands['speed']

        # direction is none when we want to stop
        if direction == None:
            self.Robot.stop()
        else:
            self.Robot.go(speed, direction)

        self.Robot.setLight(commands['light'])
        self.Robot.setLaser(commands['laser'])
        self.Robot.changeCam(commands['cam'])

    def start(self):
        """start the server"""
        self.serverThread.start()

    def stop(self):
        """stop the server"""
        self.serverThreadExitEv.set()


if __name__ == "__main__":
    pass
