# Mission driver
#
# class MissionThread
#
# class Mission
#


class MissionThread(threading.Thread):

    """Class for running the list of instructions independent of all the other code in a thread"""

    def __init__(self, moves, parentRobot, defSpeed, stopEvent):
        threading.Thread.__init__(self)
        self.moves = moves
        self.robot = parentRobot
        self.defSpeed = defSpeed
        self.stopEvent = stopEvent

    def run(self):
        speed = self.defSpeed
        for index in self.moves:
            if self.stopEvent.is_set():
                break
            command = index['command']
            wait_time = index['time']
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
                self.robot.go(speed, 135)
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
            elif command == "S": # change speed, speed
                speed = int(index['speed'])
                self.robot.go(speed, drc)

            self.stopEvent.wait(wait_time / 1000.0)
        #print("Mission Done...")

class Mission():
    """Class for recording missions"""

    def __init__(self, parentRobot):
        self._Robot = parentRobot
        self.listOfCommands = []
        self.defSpeed = 90
        self.missionStopEv = None
        self.thread = None

    def new(self, comList, defSpeed=90):
        if type(comList) is list:
            self.listOfCommands = comList
        elif type(comList) is dict:
            self.parse(comList)
        self.defSpeed = defSpeed
        return True

    def get(self):
        return self.listOfCommands

    def parse(self, commands):
        # implement

    def append(self, listToAppend):
        pass

    def run(self, join=False):
        # Start the FUN in a thread
        self.missionStopEv = threading.Event()
        self.thread = MissionThread(
            self.listOfCommands,
            self._Robot,
            self.defSpeed,
            self.missionStopEv)
        self.thread.start()

        if join:
            self.thread.join()

    def stop(self):
        self.missionStopEv.set()

