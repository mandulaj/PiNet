#!/usr/bin/python

import socket
import sys
import traceback
import time
from PiControl import *


SOCKET_PORT = 8800  # Port to which the socket is bonded
# Host on which the Socket is running (should be local-host by default)
SOCKET_HOST = '127.0.0.1'
PRINT_TO_CONSOLE = False  # If true prints messages to the console
DEBUG = False  # If true prints messages marked as 'debug' to console
PINS = [11, 12, 13, 15, 23, 19, 18, 16]

# 11 - RF
# 12 - RB
# 13 - LF
# 15 - LB
# 23 - Light
# 19 - Laser
# 18 - ServoH
# 16 - ServoV


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


class NetworkDriver():

    def __init__(self, pinArray, host, port):
        self.Key = "0000"
        self.Cam = "default"
        self.Speed = 100
        self.Light = 0
        self.Laser = 0
        self.Running = 1
        self.Robot = PiNet(pinArray[0], pinArray[1], pinArray[2], pinArray[3], pinArray[4], pinArray[5], pinArray[6], pinArray[7])
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
                      str(self.SOCKET_HOST) + ":" + str(self.SOCKET_PORT), "debug")

    # sets the global Key and Speed to the values received from the socket
    def parseData(self, data):
        # print "Data: "+data
        if data[0] == "0" or data[0] == "1":
            self.writeLog(data, "debug")
            splitArr = data.split(",")
            if len(splitArr) == 5:
                self.Key = splitArr[0]
                self.Speed = int(splitArr[1])
                self.Light = int(splitArr[2])
                self.Laser = int(splitArr[3])
                self.Cam = splitArr[4]
            else:
                self.Key = "0000"
                self.Speed = 100
                self.Light = 0
                self.Laser = 0
                self.Cam = "default"
        else:
            if data == "STOPMISSION":
                try:
                    self.mRef.stop()
                except AttributeError:
                    self.writeLog("No Mission going...", "debug")
            else:
                moves = eval(data)
                mission = Mission(self.Robot)
                mission.new(moves)
                mission.run()

                return mission

    # used to write messages to the log file + print them to the screen
    def writeLog(self, message, mode="info", writeToFile=True):
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

    def run(self):
        try:
            # Main loop -------------------------------------------------------
            while self.Running:
                (clientsocket, address) = self.serversocket.accept()
                while 1:
                    # get 10 bytes of data 4_key + 3_speed + 1_light + 2_comma
                    data = clientsocket.recv(8192)
                    self.mRef = self.parseData(data)  # parse it

                    if not data:
                        break

                    # I KNOW I COULD USE JUST ONE NUMBER INSTEAD BUT IT IS
                    # EASIER TO READ WHEN I SEE THE NUMBERS VISUALLY
                    if self.Key == "1000":
                        self.Robot.go(self.Speed, 0)
                    elif self.Key == "0001":
                        self.Robot.go(self.Speed, 90)
                    elif self.Key == "0100":
                        self.Robot.go(self.Speed, -90)
                    elif self.Key == "0010":
                        self.Robot.go(self.Speed, 180)
                    elif self.Key == "1100":
                        self.Robot.go(self.Speed, -45)
                    elif self.Key == "1001":
                        self.Robot.go(self.Speed, 45)
                    elif self.Key == "0110":
                        self.Robot.go(self.Speed, -135)
                    elif self.Key == "0011":
                        self.Robot.go(self.Speed, 135)
                    elif self.Key == "0000":
                        self.Robot.stop()
                    self.Robot.setLight(self.Light)
                    self.Robot.setLaser(self.Laser)
                    self.Robot.changeCam(self.Cam)
                    self.writeLog(
                        "Speed: " + str(self.Speed) + "\nKey: " + self.Key + "\n", "debug")

        except KeyboardInterrupt:  # catches Ctrl-C Keyboard-Interrupt
            self.writeLog("Exiting...\n", "info")

        # finally:
        # final clean-up
        self.Robot.closeMe()
        self.serversocket.shutdown(socket.SHUT_RDWR)
        self.serversocket.close()
        self.writeLog("Exiting...", "debug")
        sys.exit(0)


if __name__ == "__main__":
    network = NetworkDriver(PINS, SOCKET_HOST, SOCKET_PORT)
    network.run()
