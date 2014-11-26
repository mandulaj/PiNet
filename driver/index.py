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
PINS = {
    "RightFront": 11,
    "RightBack": 12,
    "LeftFront": 13,
    "LeftBack": 15,
    "Light": 23,
    "Laser": 19,
    "ServoH": 18,
    "ServoV": 16
}

CODE = {  # object setting up the colors used to print to terminal
    'ENDC': 0,
    'BOLD': 1,
    'UNDERLINE': 4,
    'BLINK': 5,
    'INVERT': 7,
    'CONCEALD': 8,
    'STRIKE': 9,
    'GREY30': 90,
    'GREY40': 2,
    'GREY65': 37,
    'GREY70': 97,
    'GREY20_BG': 40,
    'GREY33_BG': 100,
    'GREY80_BG': 47,
    'GREY93_BG': 107,
    'DARK_RED': 31,
    'RED': 91,
    'RED_BG': 41,
    'LIGHT_RED_BG': 101,
    'DARK_YELLOW': 33,
    'YELLOW': 93,
    'YELLOW_BG': 43,
    'LIGHT_YELLOW_BG': 103,
    'DARK_BLUE': 34,
    'BLUE': 94,
    'BLUE_BG': 44,
    'LIGHT_BLUE_BG': 104,
    'DARK_MAGENTA': 35,
    'PURPLE': 95,
    'MAGENTA_BG': 45,
    'LIGHT_PURPLE_BG': 105,
    'DARK_CYAN': 36,
    'AUQA': 96,
    'CYAN_BG': 46,
    'LIGHT_AUQA_BG': 106,
    'DARK_GREEN': 32,
    'GREEN': 92,
    'GREEN_BG': 42,
    'LIGHT_GREEN_BG': 102,
    'BLACK': 30,
}

def termcode(num):  # formats the color-string
    return '\033[%sm' % num

# appends the color-code to the string to be printed
def colorstr(astr, color):
    return termcode(CODE[color]) + astr + termcode(CODE['ENDC'])
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
            self.writeLog("Error making Socket!", "error")
            self.writeLog(traceback.format_exc(), "error")
            sys.exit(1)
        else:
            self.serversocket.listen(1)
        self.writeLog("Success in setting up socket", "info")
        self.writeLog("Server running on: " +
                      str(self.SOCKET_HOST) +
                      ":" +
                      str(self.SOCKET_PORT), "debug")

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

    def writeLog(self, message, mode="info", writeToFile=True):
        "debug function for logging warnings"
        string = "Python>>> "
        global PRINT_TO_CONSOLE, DEBUG
        if(PRINT_TO_CONSOLE):
            if(mode == "info"):
                print(colorstr(string, 'GREEN') + message)
            elif(mode == "warn"):
                print(colorstr(string, 'YELLOW') + message)
            elif(mode == "error"):
                print(colorstr(string, 'RED') + message)
            elif(mode == "debug"):
                if(DEBUG):
                    print(colorstr(string, 'BLUE') + message)
            elif(mode == "help"):
                print(colorstr(string, 'PURPLE') + message)
            elif(mode == "data"):
                print(colorstr(string, 'GREY40') + message)
            elif(mode == "prompt"):
                print(colorstr(string, 'GREY65') + message)
            elif(mode == "verbose"):
                print(colorstr(string, 'AUQA') + message)
            else:
                print(string + message)
        if writeToFile or mode == "debug":
            a = open("./pythonScript.log", "a")
            a.write(
                time.strftime("%a, %d %b %Y %H:%M:%S >>> ", time.gmtime()) + message + "\n")
            a.close()

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
            self.writeLog("Exiting...\n", "info")

        finally:
            # final clean-up
            self.Robot.closeMe()
            self.serversocket.shutdown(socket.SHUT_RDWR)
            self.serversocket.close()
            self.writeLog("Exiting...", "debug")
            sys.exit(0)


if __name__ == "__main__":
    # TODO: this call will move to the main file
    network = NetworkDriver(PINS, SOCKET_HOST, SOCKET_PORT)
    network.run()
