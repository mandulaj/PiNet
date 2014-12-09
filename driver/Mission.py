# Mission driver
#
# class MissionThread
#
# class Mission
#
import threading
import RobotHelper


class Mission():

    """Class for recording missions"""

    def __init__(self, robot, moves):
        self.robot = robot
        self.moves = moves

        self.missionThread = threading.Thread(target=self.runMission)
        self.missionStopEv = threading.Event()

    def get(self):
        """get the moves"""
        return self.moves

    def parse(self, commands):
        """parse the moves"""
        # implement
        pass

    def append(self, listToAppend):
        """append a new move to the array"""
        pass

    def runMission(self):
        """Internal function for running the mission in a separate thread"""
        drc = 0
        speed = 100
        newDrc = 0

        for move in self.moves:
            if self.missionStopEv.is_set():
                return
            command = move['command']
            wait_time = move['delay']

            # deal with the special commands
            if command == "LIGHTON":
                self.robot.setLight(1)

            elif command == "LIGHTOFF":
                self.robot.setLight(0)

            elif command == "S":  # deal with the speed change
                speed = int(move['speed'])
                self.robot.go(speed, drc)
            else:
                newDrc = RobotHelper.getDirection(command)  # Try and get the directions from the command
                # if we manage to parse the command, send it to the robot otherwise stop it
                if not newDrc == None:
                    drc = newDrc
                    self.robot.go(speed, drc)
                else:
                    self.robot.stop()

            # wait while still listening for the stop event
            self.missionStopEv.wait(wait_time / 1000.0)

    def start(self):
        """start executing the mission in a thread"""
        self.missionThread.start()

    def stop(self):
        """abort the mission end exit"""
        self.missionStopEv.set()
