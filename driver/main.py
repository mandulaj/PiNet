#!/usr/bin/python

# TODO: put all init and setup here.


import RobotController
import NetworkDriver

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


robot = RobotController.Robot(PINS)

network = NetworkDriver.NetworkDriver("127.0.0.1", 8800, robot)

network.start()


while 1:
    i = input()
    if not i == 'exit':
        continue
    print 'hele'
    network.stop()
    robot.closeMe()

print 'hello'
