import RPi.GPIO as G
import threading
import time


def isPositive(num):
    if abs(num) == num:
        return True
    else:
        return False


class RunListThread(threading.Thread):

    """Class for running the list of instructions independent of all the other code in a thread"""

    def __init__(self, list, robot, defSpeed, stopEvent):
        threading.Thread.__init__(self)
        self.list = list
        self.robot = robot
        self.defSpeed = defSpeed
        self.stopEvent = stopEvent

    def run(self):
        speed = self.defSpeed
        for index in self.list:
            if self.stopEvent.is_set():
                break
            command = index[0]
            wait_time = index[1]
            drc = 0

            # Comments will be removed (debuging)
            if command == "F":
                self.robot.go(speed, 0)
                drc = 0
                # print("F")
            elif command == "B":
                self.robot.go(speed, 180)
                drc = 180
                # print("B")
            elif command == "R":
                self.robot.go(speed, 90)
                drc = 90
                # print("R")
            elif command == "L":
                self.robot.go(speed, -90)
                drc = -90
                # print("L")
            elif command == "FR":
                self.robot.go(speed, 45)
                drc = 45
                # print("FR")
            elif command == "FL":
                self.robot.go(speed, -45)
                drc = -45
                # print("FL")
            elif command == "BR":
                selfrobot.go(speed, 135)
                drc = 135
                # print("BR")
            elif command == "BL":
                self.robot.go(speed, -135)
                drc = -135
                # print("BL")
            elif command == "STOP":
                self.robot.stop()
                # print("STOP")
            elif command == "LIGHTON":
                self.robot.setLight(1)
                # print("LIGHTON")
            elif command == "LIGHTOFF":
                self.robot.setLight(0)
                # print("LIGHTOFF")
            elif command[0] == "S":
                speed = int(command[1:])
                self.robot.go(speed, drc)

            self.stopEvent.wait(wait_time / 1000.0)
        #print("Mission Done...")


class Mission():

    """Class for recording missions"""

    def __init__(self, robot):
        self._Robot = robot
        self.listOfCommands = []

    def new(self, comList, defSpeed=90):
        if type(comList) is list:
            self.listOfCommands = comList
        elif type(comList) is str:
            self.parse(cmoList)
        self.defSpeed = defSpeed
        return True

    def get(self):
        return self.listOfCommands

    def parse(self, commands):
        pass

    def append(self, listToAppend):
        pass

    def run(self, join=False):
        # Start the FUN in a thread
        self.missionStopEv = threading.Event()
        self.thread = RunListThread(
            self.listOfCommands, self._Robot, self.defSpeed, self.missionStopEv)
        self.thread.start()

        if join:
            self.thread.join()

    def stop(self):
        self.missionStopEv.set()


class PiNet:

    """A class for interacting with the Raspberry Pi Robot"""

    def __init__(self, rf, rb, lf, lb, light, laser, servoHor, servoVer, freq=50, board=G.BOARD):
        G.setmode(board)  # initialization of GPIO ports
        G.setup(rf, G.OUT)
        G.setup(rb, G.OUT)
        G.setup(lf, G.OUT)
        G.setup(lb, G.OUT)
        G.setup(light, G.OUT)
        G.setup(laser, G.OUT)

        G.setup(servoHor, G.OUT)
        G.setup(servoVer, G.OUT)

        self.RightFront = rf
        self.RightBack = rb
        self.LeftFront = lf
        self.LeftBack = lb
        self.LIGHT = light
        self.LASER = laser
        self.Frequency = freq
        self.ServoHor = servoHor
        self.ServoVer = servoVer

        self.Light = 0
        self.Laser = 0

        self.ServoTimesHV = [1.35, 1.35]

        self.ServoRange = [0.68, 1.95]

        self.pinArray = [G.PWM(self.RightFront, self.Frequency), G.PWM(self.RightBack, self.Frequency), G.PWM(
            self.LeftFront, self.Frequency), G.PWM(self.LeftBack, self.Frequency)]

    def go(self, speed, direction):
        rightM = 0
        leftM = 0
        if direction == 0:
            rightM = 100
            leftM = 100
        elif direction == 45:
            rightM = 50
            leftM = 100
        elif direction == -45:
            rightM = 100
            leftM = 50
        elif direction == 90:
            rightM = -80
            leftM = 80
        elif direction == -90:
            rightM = 80
            leftM = -80
        elif direction == 135:
            rightM = -50
            leftM = -100
        elif direction == -135:
            rightM = -100
            leftM = -50
        elif abs(direction) == 180:
            rightM = -100
            leftM = -100

        speed = speed / 100.0
        rightM = rightM * speed
        leftM = leftM * speed

        if isPositive(rightM):
            self.pinArray[1].stop()
            self.pinArray[0].start(rightM)
        else:
            self.pinArray[0].stop()
            self.pinArray[1].start(abs(rightM))

        if isPositive(leftM):
            self.pinArray[3].stop()
            self.pinArray[2].start(leftM)
        else:
            self.pinArray[2].stop()
            self.pinArray[3].start(abs(leftM))

    def stop(self):
        self.pinArray[0].stop()
        self.pinArray[1].stop()
        self.pinArray[2].stop()
        self.pinArray[3].stop()

    def setLight(self, state):
        self.Light = state
        G.output(self.LIGHT, self.Light)

    def getLight(self):
        return self.Light

    def setLaser(self, state):
        self.Laser = state
        G.output(self.LASER, self.Laser)

    def getLaser(self):
        return self.Laser

    def changeCam(self, state):

        if not state == "0000":
            msH = 0
            msV = 0
            if len(state) == 4:
                if state[0] == "1" and self.ServoTimesHV[1] >= self.ServoRange[0]:
                    self.ServoTimesHV[1] -= 0.05
                    self.changeServo(self.ServoVer, self.ServoTimesHV[1])

                if state[1] == "1" and self.ServoTimesHV[0] <= self.ServoRange[1]:
                    self.ServoTimesHV[0] += 0.05
                    self.changeServo(self.ServoHor, self.ServoTimesHV[0])

                if state[2] == "1" and self.ServoTimesHV[1] <= self.ServoRange[1]:
                    self.ServoTimesHV[1] += 0.05
                    self.changeServo(self.ServoVer, self.ServoTimesHV[1])

                if state[3] == "1" and self.ServoTimesHV[0] >= self.ServoRange[0]:
                    self.ServoTimesHV[0] -= 0.05
                    self.changeServo(self.ServoHor, self.ServoTimesHV[0])

            else:
                msH = msV = (
                    self.ServoRange[1] - self.ServoRange[0]) / 2.0 + self.ServoRange[0]
                msH = 1.3
                msV = 1.3

                self.changeServo(self.ServoHor, msH)
                self.changeServo(self.ServoVer, msV)

    def changeServo(self, servo, ms):
        G.output(servo, 1)
        time.sleep(ms / 1000)
        G.output(servo, 0)

    def closeMe(self):
        G.cleanup()

if __name__ == "__main__":
    robot = PiNet(11, 12, 13, 15, 23, 19, 18, 16)
    robot.changeCam("default")

    #mission = Mission(robot)
    #mission.new([("F", 2000),("F",500),("STOP",1000),("LIGHTON",0),("F",5000),("F",5000),("LIGHTOFF",2000),("R",3000)])
    # mission.run(True)

    #print("About to close")
    robot.closeMe()
