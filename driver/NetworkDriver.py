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

    def __init__(self, host, port, robot):
        self.Robot = robot
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # sets up the socket
        
        self.running = True
        try:
            # binds the port and host to the socket
            self.server.bind((host, port))
            ## Only except in case of socket errors
        except():  # error handling for the bind
            print("Error making Socket!")
            sys.exit(1)
        else:
            self.server.listen(1)
        print("Success in setting up socket")
        print("Server running on: " + str(host) + ":" + str(port))

    def parseData(self, data):
        "function parsing the json commands and directing them to the robot"
        data = json.loads(data)

        if data['message'] == "commands":
            # send the data to the robot
            self.sendCommands({
                "keys": data['keys'],
                "cam": data['cam'],
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

    def direction(self, keys):
        "find the direction from the key configuration"

        if keys == [0, 0, 0, 0]:
            return "STOP"

        direction = ""

        if keys[0] == 1:
            direction += "F"
        elif keys[2] == 1:
            direction += "B"

        if keys[1] == 1:
            direction += "L"
        elif keys[3] == 1:
            direction += "R"

        if direction == "":
            return "STOP"
        else:
            return direction

    # TODO: this must run in a separate thread!!!!
    def run(self):
        "main loop for listening on a socket and reading its data input"
        try:
            while self.running:
                (conn, address) = self.server.accept()
                while True:
                    data = conn.recv(8192)

                    if not data:
                        break

                    self.parseData(data)  # parse it
                
                conn.close()
        
        except KeyboardInterrupt:  # catches Ctrl-C Keyboard-Interrupt
            print("Exiting...\n")

        finally:
            # final clean-up
            self.Robot.closeMe()
            self.server.shutdown(socket.SHUT_RDWR)
            self.server.close()
            print("Exiting...")
            sys.exit(0)

    def sendCommands(self, commands):
        "write commands to the underlying robot"

        direction = self.direction(commands['keys'])
        speed = commands['speed']

        if direction == "F":
            self.Robot.go(speed, 0)
        elif direction == "R":
            self.Robot.go(speed, 90)
        elif direction == "L":
            self.Robot.go(speed, -90)
        elif direction == "B":
            self.Robot.go(speed, 180)
        elif direction == "FL":
            self.Robot.go(speed, -45)
        elif direction == "FR":
            self.Robot.go(speed, 45)
        elif direction == "BL":
            self.Robot.go(speed, -135)
        elif direction == "BR":
            self.Robot.go(speed, 135)
        else:  # direction == "stop" or invalid
            self.Robot.stop()
    
        self.Robot.setLight(commands['light'])
        self.Robot.setLaser(commands['laser'])
        self.Robot.changeCam(commands['cam'])



if __name__ == "__main__":
    pass
