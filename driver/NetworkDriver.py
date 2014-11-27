#!/usr/bin/python

# Network driver used to route commands from the network to the robot
#
# class NetworkDriver
#

import socket
import sys
import traceback
import time
import json
import PiControl # TODO: will be moved to the main file


# The following variables will be removed
#########################################################
SOCKET_PORT = 8800  # Port to which the socket is bonded
# Host on which the Socket is running (should be local-host by default)
SOCKET_HOST = '127.0.0.1'
PRINT_TO_CONSOLE = False  # If true prints messages to the console
DEBUG = False  # If true prints messages marked as 'debug' to console
#########################################################

# Term colors setup
# TODO: move to a new file
#########################################################

#########################################################

class NetworkDriver():
    "Network driver responsible for receiving and parsing external data and forwarding them to the robot"

    def __init__(self, pinArray, host, port):
        # TODO: this should be removed - the driver should just forward network traffic
        self.componentsStatus = {
            "keys": [0, 0, 0, 0],
            "cam": "default",
            "speed": 100,
            "light": False,
            "laser": False,
            "ai": False,
            "running": True
        }

        self.Robot = PiControl.PiNet(pinArray)
        self.serversocket = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)  # sets up the socket

        self.SOCKET_HOST = host
        self.SOCKET_PORT = port

        try:
            # binds the port and host to the socket
            self.serversocket.bind((self.SOCKET_HOST, self.SOCKET_PORT))
        except():  # error handling for the bind
            # -------------------------------------- Does not work ????????????
            self.writeLog("Error making Socket!")
            self.writeLog(traceback.format_exc())
            sys.exit(1)
        else:
            self.serversocket.listen(1)
        self.writeLog("Success in setting up socket")
        self.writeLog("Server running on: " +
                      str(self.SOCKET_HOST) +
                      ":" +
                      str(self.SOCKET_PORT))

    def parseData(self, data):
        "function parsing the json commands and directing them to the robot"
        data = json.loads(data)

        if data['message'] == "commands":
            self.componentsStatus = {
                "keys": data['keys'],
                "cam": data['cam'],
                "speed": data['speed'],
                "light": data['light'],
                "laser": data['laser'],
                "ai": data['ai'],
                "running":   self.componentsStatus['running']
            }

        elif data['message'] == "mission":
            if data['status'] == "start":
                self.Robot.startMission(data['moves'])
            elif data['status'] == "stop":
                self.Robot.stopMission()

    def writeLog(self, message):
        "debug function for logging warnings"
        print message

    def direction(self):
        "find the direction from the key configuration"
        keys = self.componentsStatus["keys"]

        if keys == [0, 0, 0, 0]:
            return "stop"

        direction = ""

        if keys[0] == 1:
            direction += "f"
        elif keys[2] == 1:
            direction += "b"

        if keys[1] == 1:
            direction += "l"
        elif keys[3] == 1:
            direction += "r"

        if direction == "":
            return "stop"
        else:
            return direction

    # TODO: this must run in a separate thread!!!!
    def run(self):
        "main loop for listening on a socket and reading its data input"
        try:
            # Main loop -------------------------------------------------------
            while self.componentsStatus["running"]:
                (clientsocket, address) = self.serversocket.accept()
                while 1:
                    data = clientsocket.recv(8192)
                    self.parseData(data)  # parse it

                    if not data:
                        break

                    direction = self.direction()
                    speed = self.componentsStatus['speed']

                    if direction == "f":
                        self.Robot.go(speed, 0)
                    elif direction == "r":
                        self.Robot.go(speed, 90)
                    elif direction == "l":
                        self.Robot.go(speed, -90)
                    elif direction == "b":
                        self.Robot.go(speed, 180)
                    elif direction == "fl":
                        self.Robot.go(speed, -45)
                    elif direction == "fr":
                        self.Robot.go(speed, 45)
                    elif direction == "bl":
                        self.Robot.go(speed, -135)
                    elif direction == "br":
                        self.Robot.go(speed, 135)
                    else:  # direction == "stop" or invalid
                        self.Robot.stop()

                    self.Robot.setLight(self.componentsStatus['light'])
                    self.Robot.setLaser(self.componentsStatus['laser'])
                    self.Robot.changeCam(self.componentsStatus['cam'])

        except KeyboardInterrupt:  # catches Ctrl-C Keyboard-Interrupt
            self.writeLog("Exiting...\n")

        finally:
            # final clean-up
            self.Robot.closeMe()
            self.serversocket.shutdown(socket.SHUT_RDWR)
            self.serversocket.close()
            self.writeLog("Exiting...")
            sys.exit(0)


if __name__ == "__main__":
    # TODO: this call will move to the main file
    network = NetworkDriver(PINS, SOCKET_HOST, SOCKET_PORT)
    network.run()
